import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password?</Text>

        <Text style={styles.subtitle}>
          Account recovery will be available when local authentication is
          connected.
        </Text>

        <Link href="/login" style={styles.link}>
          Back to Login
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
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
    marginBottom: 12,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 24,
  },
  link: {
    color: "#2563EB",
    fontWeight: "600",
    textAlign: "center",
  },
});
