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

import { getUserById, loginUser, type User } from "@/services/authService";

const SESSION_KEY = "notes-app-session";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function saveSession(id: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(SESSION_KEY, id);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, id);
  }
}

async function readSession(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(SESSION_KEY);
  }

  return SecureStore.getItemAsync(SESSION_KEY);
}

async function clearSession() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const signIn = async (email: string, password: string) => {
    const authenticatedUser = await loginUser(email, password);

    await saveSession(authenticatedUser.id);
    setUser(authenticatedUser);
  };

  const signOut = async () => {
    await clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
