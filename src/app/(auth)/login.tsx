import { Link, useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { loginSchema, type LoginFormData } from "@/validators/auth";


import { useAuth } from "../../contexts/AuthContext";

type FormErrors = Partial<Record<keyof LoginFormData, string>>;

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleLogin = async () => {
    if (isLoading) return;

    setAuthError("");

    const result = loginSchema.safeParse({
      email: email.trim().toLowerCase(),
      password,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData;

        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await signIn(result.data.email, result.data.password);
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your notes.</Text>

          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={[
              styles.input,
              focusedField === "email" && styles.focusedInput,
            ]}
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />

          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Password</Text>

            <Link href="/forgot-password" style={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </View>

          <View
            style={[
              styles.passwordContainer,
              focusedField === "password" && styles.focusedInput,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
              hitSlop={10}
            >
              {showPassword ? (
                <Eye size={20} color="#64748B" />
              ) : (
                <EyeOff size={20} color="#64748B" />
              )}
            </Pressable>
          </View>

          {errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}

          {authError ? <Text style={styles.error}>{authError}</Text> : null}

          <Pressable
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>

            <Link href="/register" style={styles.link}>
              Register
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  form: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    ...({ outlineStyle: "none" } as object),
  },
  passwordContainer: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 8,
    ...({ outlineStyle: "none" } as object),
  },
  focusedInput: {
    borderColor: "#2563EB",
    borderWidth: 1.5,
  },
  error: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: -8,
    marginBottom: 12,
  },
  forgotPassword: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#64748B",
    fontSize: 13,
  },
  link: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
});
