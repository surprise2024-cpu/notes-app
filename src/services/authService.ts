import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

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
  const hash = await pbkdf2Async(sha256, utf8ToBytes(password), salt, {
    c: ITERATIONS,
    dkLen: 32,
  });

  return toHex(hash);
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
