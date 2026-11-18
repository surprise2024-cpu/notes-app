import { useFocusEffect, useRouter } from "expo-router";
import { LogOut, Plus, UserRound } from "lucide-react-native";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import NoteCard from "@/components/notes/NoteCard";
import { useAuth } from "@/contexts/AuthContext";
import { deleteNote, getUserNotes } from "@/services/noteService";
import type { Note } from "@/types/note";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete confirmation state
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reload notes whenever Home receives focus.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadNotes = async () => {
        if (!user) {
          setNotes([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError("");

        try {
          const savedNotes = await getUserNotes(user.id);

          if (active) {
            setNotes(savedNotes);
          }
        } catch {
          if (active) {
            setError("Unable to load your notes.");
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      };

      loadNotes();

      return () => {
        active = false;
      };
    }, [user?.id]),
  );

  // Navigate to the Edit Note screen.
  const handleEdit = (note: Note) => {
    router.push({
      pathname: "/edit-note/[id]",
      params: { id: note.id },
    });
  };

  // Delete the selected note after confirmation.
  const handleDelete = async () => {
    if (!user || !noteToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      await deleteNote(user.id, noteToDelete.id);

      // Remove the deleted note from the displayed list.
      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== noteToDelete.id),
      );

      setNoteToDelete(null);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to delete note.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Log out the current user.
  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      Alert.alert("Error", "Unable to log out.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={styles.greeting}>Hello, {user?.username}!</Text>

            <Text style={styles.title}>My Notes</Text>

            <Text style={styles.subtitle}>
              Organize your thoughts in one place.
            </Text>
          </View>

          {/* Profile and Logout */}
          <View style={styles.actions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push("/profile")}
              accessibilityLabel="My Profile"
              accessibilityRole="button"
            >
              <UserRound size={20} color="#2563EB" />
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={handleLogout}
              accessibilityLabel="Logout"
              accessibilityRole="button"
            >
              <LogOut size={20} color="#DC2626" />
            </Pressable>
          </View>
        </View>

        {/* Notes Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Notes</Text>

          <Text style={styles.count}>
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </Text>
        </View>

        {/* Notes List */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.message}>{error}</Text>
        ) : notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No notes yet</Text>

            <Text style={styles.emptyText}>
              Create your first note to get started.
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={setNoteToDelete}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Create Note Button */}
      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/create-note")}
        accessibilityRole="button"
        accessibilityLabel="Create Note"
      >
        <Plus size={26} color="#FFFFFF" />
      </Pressable>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={noteToDelete !== null}
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) {
            setNoteToDelete(null);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Note?</Text>

            <Text style={styles.modalDescription}>
              Are you sure you want to delete "
              {noteToDelete?.title || "Untitled Note"}"? This action cannot be
              undone.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setNoteToDelete(null)}
                disabled={isDeleting}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.deleteButton,
                  isDeleting && styles.disabledButton,
                ]}
                onPress={handleDelete}
                disabled={isDeleting}
                accessibilityRole="button"
              >
                <Text style={styles.deleteText}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 32,
  },

  heading: {
    flex: 1,
  },

  greeting: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "700",
  },

  count: {
    color: "#64748B",
    fontSize: 13,
  },

  loader: {
    marginTop: 60,
  },

  message: {
    textAlign: "center",
    color: "#DC2626",
    marginTop: 40,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
    color: "#64748B",
  },

  addButton: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  // Delete Confirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },

  modalDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 21,
    marginBottom: 24,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  cancelText: {
    color: "#334155",
    fontWeight: "600",
  },

  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#DC2626",
  },

  deleteText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },
});
