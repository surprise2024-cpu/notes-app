import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      Alert.alert("Error", "Unable to log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Notes</Text>

      <Text style={styles.welcome}>Welcome, {user?.username}!</Text>

      <Text style={styles.subtitle}>Your notes will appear here.</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  welcome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
