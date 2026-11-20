import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

import {
  getUserById,
  loginUser,
  registerUser,
  type User,
} from "@/services/authService";

const SESSION_KEY = "notes-app-session";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Save the logged-in user's ID.
async function saveSession(id: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(SESSION_KEY, id);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, id);
  }
}

// Retrieve the previously saved session.
async function readSession(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(SESSION_KEY);
  }

  return SecureStore.getItemAsync(SESSION_KEY);
}

// Remove the saved session.
async function clearSession(): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!user) return;

    const updatedUser = await getUserById(user.id);

    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  // Restore the user's session when the app starts.
  useEffect(() => {
    async function restoreSession() {
      try {
        const id = await readSession();

        if (id) {
          const savedUser = await getUserById(id);

          if (savedUser) {
            setUser(savedUser);
          } else {
            await clearSession();
          }
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Register a new user and automatically sign them in.
  const signUp = async (
    username: string,
    email: string,
    password: string,
  ): Promise<void> => {
    const newUser = await registerUser({
      username,
      email,
      password,
    });

    await saveSession(newUser.id);
    setUser(newUser);
  };

  // Authenticate an existing user.

  const signIn = async (email: string, password: string): Promise<void> => {
    const authenticatedUser = await loginUser(email, password);

    await saveSession(authenticatedUser.id);

    setUser(authenticatedUser);
  };

  // Log out the current user.
  const signOut = async (): Promise<void> => {
    await clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Access authentication anywhere inside AuthProvider.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
