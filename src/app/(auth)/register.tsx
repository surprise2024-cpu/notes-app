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

import { registerSchema, type RegisterFormData } from "@/validators/auth";

import { registerUser } from "../../services/authService";

type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleRegister = async () => {
    if (isLoading) return;

    setServerError("");

    const result = registerSchema.safeParse({
      username,
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData;

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
      await registerUser({
        username: result.data.username,
        email: result.data.email,
        password: result.data.password,
      });

      // Registration successful.
      // Redirect the user to home.
      router.replace("/home");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
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
        bounces={false}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to start organizing your notes.
          </Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === "username" && styles.focusedInput,
            ]}
            placeholder="Enter your username"
            placeholderTextColor="#94A3B8"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocusedField("username")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.username && (
            <Text style={styles.error}>{errors.username}</Text>
          )}

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
            autoComplete="email"
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <Text style={styles.label}>Password</Text>

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
              selectionColor="#2563EB"
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

          <Text style={styles.label}>Confirm Password</Text>
          <View
            style={[
              styles.passwordContainer,
              focusedField === "confirmPassword" && styles.focusedInput,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="none"
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              accessibilityRole="button"
              accessibilityLabel={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
            >
              {showConfirmPassword ? (
                <Eye size={22} color="#64748B" />
              ) : (
                <EyeOff size={22} color="#64748B" />
              )}
            </Pressable>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}

          {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

          <Pressable
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" style={styles.link}>
              Login
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
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    marginBottom: 18,
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
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    outlineStyle: "none" as any,
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
    outlineStyle: "none" as any,
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 8,
  },
  focusedInput: {
    borderColor: "#2563eb",
    borderWidth: 1.5,
  },
  error: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: -10,
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
  link: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
});
