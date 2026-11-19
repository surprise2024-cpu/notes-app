import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";

import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import NoteCard from "@/components/notes/NoteCard";
import NoteSearchSort from "@/components/notes/NoteSearchSort";
import { useAuth } from "@/contexts/AuthContext";
import { deleteNote, getUserNotes } from "@/services/noteService";
import { NOTE_CATEGORIES, type Note, type NoteCategory } from "@/types/note";
import { filterAndSortNotes, type NoteSortOrder } from "@/utils/noteFilters";

export default function CategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{
    category: string;
  }>();
  const { user } = useAuth();

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and sorting state
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<NoteSortOrder>("newest");

  const visibleNotes = useMemo(
    () => filterAndSortNotes(notes, search, sortOrder),
    [notes, search, sortOrder],
  );

  // Delete confirmation state
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Validate category from the URL.
  const validCategory = NOTE_CATEGORIES.includes(category as NoteCategory);

  // Reload category notes whenever this screen receives focus.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadNotes = async () => {
        if (!user || !validCategory) {
          if (active) {
            setNotes([]);
            setIsLoading(false);
          }
          return;
        }

        setIsLoading(true);
        setError("");

        try {
          const savedNotes = await getUserNotes(user.id);

          const categoryNotes = savedNotes.filter(
            (note) => note.category === category,
          );

          if (active) {
            setNotes(categoryNotes);
          }
        } catch {
          if (active) {
            setError("Unable to load notes.");
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
    }, [user?.id, category, validCategory]),
  );

  // Navigate to Edit Note.
  const handleEdit = (note: Note) => {
    router.push({
      pathname: "/edit-note/[id]",
      params: { id: note.id },
    });
  };

  // Delete the selected note.
  const handleDelete = async () => {
    if (!user || !noteToDelete || isDeleting) return;

    const noteId = noteToDelete.id;

    setIsDeleting(true);
    setError("");

    try {
      await deleteNote(user.id, noteId);

      setNotes((previous) => previous.filter((note) => note.id !== noteId));

      setNoteToDelete(null);
    } catch {
      setError("Unable to delete note. Please try again.");
      setNoteToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Invalid category URL.
  if (!validCategory) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Invalid Category</Text>

        <Pressable
          onPress={() => router.replace("/home")}
          accessibilityRole="button"
        >
          <Text style={styles.backText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back to Home */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/home")}
          accessibilityRole="button"
        >
          <ArrowLeft size={18} color="#2563EB" />
          <Text style={styles.backText}>Back to Home</Text>
        </Pressable>

        {/* Category Header */}
        <Text style={styles.title}>{category} Notes</Text>

        <Text style={styles.subtitle}>
          All your {category.toLowerCase()} notes in one place.
        </Text>

        {/* Search and Sorting */}
        <NoteSearchSort
          search={search}
          onSearchChange={setSearch}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        {/* Notes Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>

          <Text style={styles.count}>
            {visibleNotes.length} {visibleNotes.length === 1 ? "note" : "notes"}
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
          <Text style={styles.error}>{error}</Text>
        ) : notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No notes yet</Text>

            <Text style={styles.emptyText}>
              You don't have any notes in this category.
            </Text>
          </View>
        ) : visibleNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matching notes</Text>

            <Text style={styles.emptyText}>
              Try searching for something else.
            </Text>
          </View>
        ) : (
          visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={setNoteToDelete}
            />
          ))
        )}
      </ScrollView>

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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#F8FAFC",
  },

  content: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 60,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 26,
    alignSelf: "flex-start",
  },

  backText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },

  count: {
    fontSize: 13,
    color: "#64748B",
  },

  loader: {
    marginTop: 60,
  },

  error: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 28,
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
    color: "#64748B",
    textAlign: "center",
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
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  cancelText: {
    color: "#334155",
    fontWeight: "600",
  },

  deleteButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  deleteText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },
});
