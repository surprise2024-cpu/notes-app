import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text>Sign in to access your notes.</Text>

      <Link href="/register" style={styles.link}>
        Create an account
      </Link>

      <Link href="/home" style={styles.link}>
        Go to Home (Temporary)
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  link: {
    color: "#2563EB",
  },
});
