import { Link, useRouter } from "expo-router";
import { useState } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import FormInput from "@/components/forms/FormInput";
import PasswordInput from "@/components/forms/PasswordInput";

import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, type LoginFormData } from "@/validators/auth";

type FormErrors = Partial<Record<keyof LoginFormData, string>>;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

          {/* Email Address */}
          <FormInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            error={errors.email}
          />

          {/* Password */}
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoComplete="current-password"
            error={errors.password}
            rightLabel="Forgot Password?"
            onRightPress={() => router.push("/forgot-password")}
          />

          {/* Authentication Error */}
          {authError ? <Text style={styles.error}>{authError}</Text> : null}

          {/* Login Button */}
          <Pressable
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          {/* Registration Link */}
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

  error: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 8,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
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
    marginTop: 20,
    flexWrap: "wrap",
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
