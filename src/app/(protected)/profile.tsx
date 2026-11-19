import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  LogOut,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";

import {
  KeyboardAvoidingView,
  Modal,
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
import {
  generateRecoveryCode,
  updateUserProfile,
} from "@/services/authService";
import { profileSchema, type ProfileFormData } from "@/validators/auth";

type Section = "manage" | "security" | "about" | "logout" | null;

type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshUser, signOut } = useAuth();

  const [section, setSection] = useState<Section>(null);

  // Profile fields
  const [username, setUsername] = useState(user?.username ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Recovery fields
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");

  // Feedback
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername(user?.username ?? "");
  }, [user?.username]);

  // Close popup and clear temporary fields.
  const closeModal = () => {
    if (loading) return;

    setSection(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setRecoveryPassword("");
    setRecoveryCode("");
    setErrors({});
    setMessage("");
    setSuccess("");
  };

  // Open selected settings popup.
  const openSection = (value: Section) => {
    setErrors({});
    setMessage("");
    setSuccess("");
    setRecoveryCode("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setRecoveryPassword("");
    setUsername(user?.username ?? "");
    setSection(value);
  };

  // Update username or password.
  const saveProfile = async () => {
    if (!user || loading) return;

    setMessage("");
    setSuccess("");

    if (section === "security" && !newPassword) {
      setMessage("Please enter a new password.");
      return;
    }

    const result = profileSchema.safeParse({
      username: section === "manage" ? username : user.username,
      currentPassword,
      newPassword: section === "security" ? newPassword : "",
      confirmNewPassword: section === "security" ? confirmNewPassword : "",
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
    setLoading(true);

    try {
      await updateUserProfile(user.id, {
        username: result.data.username,
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword || undefined,
      });

      await refreshUser();

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setSuccess(
        section === "manage"
          ? "Profile updated successfully!"
          : "Password changed successfully!",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update account.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate account recovery code.
  const createRecoveryCode = async () => {
    if (!user || loading) return;

    setMessage("");
    setSuccess("");
    setRecoveryCode("");

    if (!recoveryPassword.trim()) {
      setMessage("Enter your current password first.");
      return;
    }

    setLoading(true);

    try {
      const code = await generateRecoveryCode(user.id, recoveryPassword);

      setRecoveryCode(code);
      setRecoveryPassword("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate recovery code.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout only after confirmation.
  const confirmLogout = async () => {
    if (loading) return;

    setMessage("");
    setLoading(true);

    try {
      await signOut();
      setSection(null);
    } catch {
      setMessage("Unable to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Pressable
            style={styles.headerBackButton}
            onPress={() => router.replace("/home")}
            accessibilityRole="button"
            accessibilityLabel="Back to Notes"
          >
            <ChevronLeft size={28} color="#0F172A" />
          </Pressable>

          <Text style={styles.title}>Profile</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* User Identity */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <UserRound size={40} color="#2563EB" />
          </View>

          <View style={styles.identityText}>
            <Text style={styles.username}>{user?.username}</Text>

            <Text style={styles.email} numberOfLines={2}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Settings Menu */}
        <Text style={styles.menuHeading}>ACCOUNT SETTINGS</Text>

        <Pressable
          style={styles.menuRow}
          onPress={() => openSection("manage")}
          accessibilityRole="button"
        >
          <UserRound size={23} color="#334155" />

          <Text style={styles.menuText}>Manage Profile</Text>

          <ChevronRight size={20} color="#94A3B8" />
        </Pressable>

        <Pressable
          style={styles.menuRow}
          onPress={() => openSection("security")}
          accessibilityRole="button"
        >
          <ShieldCheck size={23} color="#334155" />

          <Text style={styles.menuText}>Password & Security</Text>

          <ChevronRight size={20} color="#94A3B8" />
        </Pressable>

        <Pressable
          style={styles.menuRow}
          onPress={() => openSection("about")}
          accessibilityRole="button"
        >
          <Info size={23} color="#334155" />

          <Text style={styles.menuText}>About the App</Text>

          <ChevronRight size={20} color="#94A3B8" />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={styles.menuRow}
          onPress={() => openSection("logout")}
          accessibilityRole="button"
        >
          <LogOut size={23} color="#DC2626" />

          <Text style={styles.logoutText}>Log Out</Text>

          <ChevronRight size={20} color="#94A3B8" />
        </Pressable>
      </ScrollView>

      {/* Settings Popup */}
      <Modal
        transparent
        visible={section !== null}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Tap outside to dismiss */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeModal}
            accessibilityRole="button"
            accessibilityLabel="Close profile popup"
            disabled={loading}
          />

          <View style={styles.modal}>
            {/* Popup Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {section === "manage"
                  ? "Manage Profile"
                  : section === "security"
                    ? "Password & Security"
                    : section === "about"
                      ? "About the App"
                      : "Log Out"}
              </Text>

              <Pressable
                onPress={closeModal}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Close popup"
              >
                <X size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Manage Profile */}
              {section === "manage" ? (
                <>
                  <FormInput
                    label="Username"
                    placeholder="Enter username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    error={errors.username}
                  />

                  <Text style={styles.label}>Email Address</Text>

                  <View style={styles.readOnly}>
                    <Text style={styles.readOnlyText}>{user?.email}</Text>

                    <Lock size={16} color="#94A3B8" />
                  </View>

                  <Text style={styles.hint}>Your email cannot be changed.</Text>

                  <PasswordInput
                    label="Current Password"
                    placeholder="Verify your password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    autoComplete="current-password"
                    error={errors.currentPassword}
                  />

                  {message ? <Text style={styles.error}>{message}</Text> : null}

                  {success ? (
                    <Text style={styles.success}>{success}</Text>
                  ) : null}

                  <Pressable
                    style={[
                      styles.primaryButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={saveProfile}
                    disabled={loading}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryText}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {/* Password and Security */}
              {section === "security" ? (
                <>
                  <Text style={styles.subheading}>Change Password</Text>

                  <PasswordInput
                    label="Current Password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    autoComplete="current-password"
                    error={errors.currentPassword}
                  />

                  <PasswordInput
                    label="New Password"
                    placeholder="New password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoComplete="new-password"
                    error={errors.newPassword}
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    autoComplete="new-password"
                    error={errors.confirmNewPassword}
                  />

                  {success ? (
                    <Text style={styles.success}>{success}</Text>
                  ) : null}

                  <Pressable
                    style={[
                      styles.primaryButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={saveProfile}
                    disabled={loading}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryText}>
                      {loading ? "Saving..." : "Change Password"}
                    </Text>
                  </Pressable>

                  <View style={styles.divider} />

                  <Text style={styles.subheading}>Account Recovery</Text>

                  <Text style={styles.description}>
                    Generate a recovery code in case you forget your password.
                  </Text>

                  <PasswordInput
                    label="Current Password"
                    placeholder="Verify current password"
                    value={recoveryPassword}
                    onChangeText={setRecoveryPassword}
                    autoComplete="current-password"
                  />

                  <Pressable
                    style={[
                      styles.secondaryButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={createRecoveryCode}
                    disabled={loading}
                    accessibilityRole="button"
                  >
                    <Text style={styles.secondaryText}>
                      Generate Recovery Code
                    </Text>
                  </Pressable>

                  {recoveryCode ? (
                    <View style={styles.codeBox}>
                      <Text style={styles.codeLabel}>Your Recovery Code</Text>

                      <Text selectable style={styles.codeText}>
                        {recoveryCode}
                      </Text>

                      <Text style={styles.hint}>
                        Save this code privately. It will not be shown again
                        after closing.
                      </Text>
                    </View>
                  ) : null}

                  {message ? <Text style={styles.error}>{message}</Text> : null}
                </>
              ) : null}

              {/* About the App */}
              {section === "about" ? (
                <Text style={styles.description}>
                  Notes App helps you create, organize, search and manage your
                  personal notes.
                  {"\n\n"}
                  Notes are saved locally on this device.
                </Text>
              ) : null}

              {/* Logout Confirmation */}
              {section === "logout" ? (
                <>
                  <Text style={styles.description}>
                    Are you sure you want to log out of your account?
                  </Text>

                  {message ? <Text style={styles.error}>{message}</Text> : null}

                  <View style={styles.logoutActions}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={closeModal}
                      disabled={loading}
                      accessibilityRole="button"
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.logoutButton,
                        loading && styles.disabledButton,
                      ]}
                      onPress={confirmLogout}
                      disabled={loading}
                      accessibilityRole="button"
                    >
                      <Text style={styles.logoutButtonText}>
                        {loading ? "Logging out..." : "Log Out"}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 60,
  },

  // Profile Header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 36,
  },

  headerBackButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },

  headerSpacer: {
    width: 42,
    height: 42,
  },

  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  // User Identity
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 42,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  identityText: {
    flex: 1,
  },

  username: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  email: {
    fontSize: 13,
    color: "#64748B",
  },

  // Settings Menu
  menuHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
    marginBottom: 12,
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 19,
  },

  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },

  logoutText: {
    flex: 1,
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },

  // Modal
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(15,23,42,0.55)",
  },

  modal: {
    width: "100%",
    maxWidth: 450,
    maxHeight: "88%",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  modalTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: "700",
    color: "#0F172A",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  readOnly: {
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  readOnlyText: {
    flex: 1,
    color: "#64748B",
    fontSize: 14,
  },

  hint: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 18,
  },

  subheading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },

  description: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 18,
  },

  error: {
    color: "#DC2626",
    fontSize: 12,
    marginVertical: 10,
  },

  success: {
    color: "#15803D",
    fontSize: 13,
    marginVertical: 10,
  },

  primaryButton: {
    paddingVertical: 14,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    marginTop: 14,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  secondaryButton: {
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2563EB",
    alignItems: "center",
  },

  secondaryText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },

  // Recovery Code
  codeBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
  },

  codeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },

  codeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 24,
  },

  // Logout Confirmation
  logoutActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },

  cancelText: {
    color: "#334155",
    fontWeight: "600",
  },

  logoutButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
