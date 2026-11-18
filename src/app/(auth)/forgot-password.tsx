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

import { resetPasswordWithRecoveryCode } from "@/services/authService";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/validators/auth";

type FormErrors = Partial<Record<keyof ResetPasswordFormData, string>>;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Form values
  const [email, setEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form feedback
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (isLoading) return;

    setServerError("");

    // Validate using Zod
    const result = resetPasswordSchema.safeParse({
      email: email.trim().toLowerCase(),
      recoveryCode: recoveryCode.trim(),
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ResetPasswordFormData;

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
      // Verify recovery code and update password.
      await resetPasswordWithRecoveryCode(
        result.data.email,
        result.data.recoveryCode,
        result.data.newPassword,
      );

      // Return to Login after a successful reset.
      router.replace("/login");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to reset password. Please try again.",
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
          <Text style={styles.title}>Forgot Password?</Text>

          <Text style={styles.subtitle}>
            Enter your email and recovery code to reset your password.
          </Text>

          {/* Email Address */}
          <FormInput
            label="Email Address"
            placeholder="Enter your registered email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            error={errors.email}
          />

          {/* Recovery Code */}
          <FormInput
            label="Recovery Code"
            placeholder="Enter your recovery code"
            value={recoveryCode}
            onChangeText={setRecoveryCode}
            autoCapitalize="characters"
            autoCorrect={false}
            error={errors.recoveryCode}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Create New Password</Text>

          {/* New Password */}
          <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.newPassword}
          />

          {/* Confirm New Password */}
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          {/* Recovery error */}
          {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

          {/* Reset Password Button */}
          <Pressable
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={isLoading}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Text>
          </Pressable>

          {/* Back to Login */}
          <View style={styles.footer}>
            <Link href="/login" style={styles.link}>
              Back to Login
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
    lineHeight: 20,
    marginBottom: 22,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
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
    marginTop: 14,
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
    alignItems: "center",
    marginTop: 20,
  },

  link: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
});
