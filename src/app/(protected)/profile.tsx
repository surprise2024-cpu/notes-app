import { useRouter } from "expo-router";
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

import { ArrowLeft, Lock } from "lucide-react-native";

import FormInput from "@/components/forms/FormInput";
import PasswordInput from "@/components/forms/PasswordInput";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/services/authService";
import { profileSchema, type ProfileFormData } from "@/validators/auth";

type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading || !user) return;

    setServerError("");
    setSuccessMessage("");

    const result = profileSchema.safeParse({
      username,
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileFormData;

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
      await updateUserProfile(user.id, {
        username: result.data.username,
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword || undefined,
      });

      // Update the user information throughout the application.
      await refreshUser();

      // Clear password fields after successful update.
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
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
          {/* Back to Home */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/home")}
            accessibilityRole="button"
          >
            <ArrowLeft size={18} color="#2563EB" />
            <Text style={styles.backText}>Back to Home</Text>
          </Pressable>

          <Text style={styles.title}>My Profile</Text>

          <Text style={styles.subtitle}>
            Manage your account information and security.
          </Text>

          {/* Username */}
          <FormInput
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.username}
          />

          {/* Read-only Email */}
          <View style={styles.emailSection}>
            <View style={styles.emailHeader}>
              <Text style={styles.label}>Email Address</Text>
              <Lock size={15} color="#64748B" />
            </View>

            <View style={styles.readOnlyInput}>
              <Text style={styles.emailText}>{user?.email ?? ""}</Text>
            </View>

            <Text style={styles.hint}>
              Your email address cannot be changed.
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Account Security</Text>

          {/* Current Password */}
          <PasswordInput
            label="Current Password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            autoCapitalize="none"
            autoComplete="current-password"
            error={errors.currentPassword}
          />

          {/* New Password */}
          <PasswordInput
            label="New Password (Optional)"
            placeholder="Enter a new password"
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
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.confirmNewPassword}
          />

          {/* Feedback */}
          {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

          {successMessage ? (
            <Text style={styles.success}>{successMessage}</Text>
          ) : null}

          {/* Save Changes */}
          <Pressable
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>
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

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    alignSelf: "flex-start",
  },

  backText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
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
    marginBottom: 20,
  },

  emailSection: {
    marginBottom: 16,
  },

  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  readOnlyInput: {
    minHeight: 46,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F1F5F9",
  },

  emailText: {
    fontSize: 14,
    color: "#64748B",
  },

  hint: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 18,
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

  success: {
    fontSize: 13,
    color: "#15803D",
    marginTop: 8,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
