import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { pbkdf2 } from "react-native-quick-crypto";

const USERS_KEY = "notes-app-users";
const ITERATIONS = 120_000;

export type User = {
  id: string;
  username: string;
  email: string;
};

type StoredUser = User & {
  passwordHash: string;
  salt: string;
  recoveryHash?: string;
  recoverySalt?: string;
};

type RegisterDetails = {
  username: string;
  email: string;
  password: string;
};

// Convert bytes to hexadecimal.
const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

// Convert hexadecimal back to bytes.
const fromHex = (hex: string): Uint8Array =>
  Uint8Array.from(
    hex.match(/.{2}/g)?.map((value) => parseInt(value, 16)) ?? [],
  );

// Hash a password using PBKDF2 and a unique salt.

async function hashPassword(
  password: string,
  salt: Uint8Array,
): Promise<string> {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, ITERATIONS, 32, "sha256", (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      if (!derivedKey) {
        reject(new Error("Password hashing failed."));
        return;
      }

      resolve(toHex(new Uint8Array(derivedKey)));
    });
  });
}

// Read stored accounts.
async function getStoredUsers(): Promise<StoredUser[]> {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? (JSON.parse(data) as StoredUser[]) : [];
}

// Create a new account.
export async function registerUser(details: RegisterDetails): Promise<User> {
  const users = await getStoredUsers();

  const email = details.email.trim().toLowerCase();

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const salt = await Crypto.getRandomBytesAsync(16);

  const newUser: StoredUser = {
    id: Crypto.randomUUID(),
    username: details.username.trim(),
    email,
    salt: toHex(salt),
    passwordHash: await hashPassword(details.password, salt),
  };

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
  };
}

// Verify login credentials.
export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const users = await getStoredUsers();

  const user = users.find((item) => item.email === email.trim().toLowerCase());

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const enteredHash = await hashPassword(password, fromHex(user.salt));

  // Compare all hash bytes without exiting on the first mismatch.
  const enteredBytes = fromHex(enteredHash);
  const storedBytes = fromHex(user.passwordHash);

  let difference = enteredBytes.length ^ storedBytes.length;

  for (let i = 0; i < enteredBytes.length; i++) {
    difference |= enteredBytes[i] ^ (storedBytes[i] ?? 0);
  }

  if (difference !== 0) {
    throw new Error("Invalid email or password.");
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getStoredUsers();

  const user = users.find((item) => item.id === id);

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

type UpdateProfileDetails = {
  username: string;
  currentPassword: string;
  newPassword?: string;
};

export async function updateUserProfile(
  userId: string,
  details: UpdateProfileDetails,
): Promise<User> {
  const users = await getStoredUsers();

  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    throw new Error("User account not found.");
  }

  const currentUser = users[userIndex];

  // Verify the current password.
  await loginUser(currentUser.email, details.currentPassword);

  // Update username only.
  currentUser.username = details.username.trim();

  // Change the password only when requested.
  if (details.newPassword) {
    const salt = await Crypto.getRandomBytesAsync(16);

    currentUser.salt = toHex(salt);
    currentUser.passwordHash = await hashPassword(details.newPassword, salt);
  }

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

  return {
    id: currentUser.id,
    username: currentUser.username,
    email: currentUser.email,
  };
}

export async function generateRecoveryCode(
  userId: string,
  currentPassword: string,
): Promise<string> {
  const users = await getStoredUsers();

  const user = users.find((item) => item.id === userId);

  if (!user) {
    throw new Error("Account not found.");
  }

  // Verify ownership before creating a recovery code.
  await loginUser(user.email, currentPassword);

  // Generate a random 128-bit recovery code.
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const code = toHex(randomBytes).toUpperCase();

  // Generate a separate salt for the recovery code.
  const salt = await Crypto.getRandomBytesAsync(16);

  user.recoverySalt = toHex(salt);
  user.recoveryHash = await hashPassword(code, salt);

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Format the code so it's easier to save.
  return code.match(/.{1,8}/g)!.join("-");
}

export async function resetPasswordWithRecoveryCode(
  email: string,
  recoveryCode: string,
  newPassword: string,
): Promise<void> {
  const users = await getStoredUsers();

  const user = users.find((item) => item.email === email.trim().toLowerCase());

  if (!user?.recoveryHash || !user.recoverySalt) {
    throw new Error("Invalid email or recovery code.");
  }

  const normalizedCode = recoveryCode.replace(/-/g, "").trim().toUpperCase();

  if (!/^[0-9A-F]{32}$/.test(normalizedCode)) {
    throw new Error("Invalid email or recovery code.");
  }

  const enteredHash = await hashPassword(
    normalizedCode,
    fromHex(user.recoverySalt),
  );

  // Compare the derived hashes.
  const enteredBytes = fromHex(enteredHash);
  const savedBytes = fromHex(user.recoveryHash);

  let difference = enteredBytes.length ^ savedBytes.length;

  for (let i = 0; i < enteredBytes.length; i++) {
    difference |= enteredBytes[i] ^ (savedBytes[i] ?? 0);
  }

  if (difference !== 0) {
    throw new Error("Invalid email or recovery code.");
  }

  // Create a new salted password hash.
  const newSalt = await Crypto.getRandomBytesAsync(16);

  user.salt = toHex(newSalt);
  user.passwordHash = await hashPassword(newPassword, newSalt);

  // Recovery codes can only be used once.
  delete user.recoveryHash;
  delete user.recoverySalt;

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}
