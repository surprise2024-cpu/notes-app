import { useFocusEffect, useRouter } from "expo-router";
import {
  BriefcaseBusiness,
  GraduationCap,
  Heart,
  Menu,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import NoteCard from "@/components/notes/NoteCard";
import NoteCreateModal from "@/components/notes/NoteCreateModal";
import NoteEditorModal from "@/components/notes/NoteEditorModal";

import { useAuth } from "@/contexts/AuthContext";
import { deleteNote, getUserNotes } from "@/services/noteService";

import { NOTE_CATEGORIES, type Note, type NoteCategory } from "@/types/note";

import { filterAndSortNotes, type NoteSortOrder } from "@/utils/noteFilters";

type CategoryFilter = NoteCategory | "All";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sidebar and filters
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sortOrder, setSortOrder] = useState<NoteSortOrder>("newest");
  const [search, setSearch] = useState("");

  // Add Note popup
  const [createOpen, setCreateOpen] = useState(false);

  // Edit Note popup
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Delete confirmation
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reload notes whenever Home receives focus.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!user) {
          setNotes([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const saved = await getUserNotes(user.id);

          if (active) {
            setNotes(saved);
          }
        } catch {
          if (active) {
            setError("Unable to load notes.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [user?.id]),
  );

  // Apply category filtering, searching and sorting.
  const visibleNotes = useMemo(() => {
    const categoryNotes =
      category === "All"
        ? notes
        : notes.filter((note) => note.category === category);

    return filterAndSortNotes(categoryNotes, search, sortOrder);
  }, [notes, category, search, sortOrder]);

  // Select a category from the sidebar.
  const selectCategory = (value: CategoryFilter) => {
    setCategory(value);
    setDrawerOpen(false);
  };

  // Select the sorting order.
  const selectSort = (value: NoteSortOrder) => {
    setSortOrder(value);
    setDrawerOpen(false);
  };

  // Handle successful note creation.
  const handleCreated = (newNote: Note) => {
    setNotes((previous) => [...previous, newNote]);
    setCreateOpen(false);
  };

  // Handle successful note editing.
  const handleSaved = (updated: Note) => {
    setNotes((previous) =>
      previous.map((note) => (note.id === updated.id ? updated : note)),
    );

    setSelectedNote(null);
  };

  // Delete selected note.
  const handleDelete = async () => {
    if (!user || !noteToDelete || deleting) return;

    const noteId = noteToDelete.id;

    setDeleting(true);
    setError("");

    try {
      await deleteNote(user.id, noteId);

      setNotes((previous) => previous.filter((note) => note.id !== noteId));

      setNoteToDelete(null);
    } catch {
      setError("Unable to delete note.");
      setNoteToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // Close Delete confirmation without deleting.
  const closeDeleteModal = () => {
    if (!deleting) {
      setNoteToDelete(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerIcon}
            onPress={() => setDrawerOpen(true)}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Menu size={26} color="#0F172A" />
          </Pressable>

          <View style={styles.heading}>
            <Text style={styles.title}>
              {category === "All" ? "All Notes" : `${category} Notes`}
            </Text>

            <Text style={styles.subtitle}>Hello, {user?.username}!</Text>
          </View>

          <Pressable
            style={styles.headerIcon}
            onPress={() => router.push("/profile")}
            accessibilityLabel="Open Profile"
            accessibilityRole="button"
          >
            <UserRound size={23} color="#2563EB" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Search size={19} color="#64748B" />

          <TextInput
            style={styles.searchInput}
            placeholder="Search your notes..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search notes"
          />
        </View>

        {/* Notes Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {category === "All" ? "My Notes" : category}
          </Text>

          <Text style={styles.count}>
            {visibleNotes.length} {visibleNotes.length === 1 ? "note" : "notes"}
          </Text>
        </View>

        {/* Notes List */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : visibleNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {notes.length === 0 ? "No notes yet" : "No matching notes"}
            </Text>

            <Text style={styles.emptyText}>
              {notes.length === 0
                ? "Create your first note to get started."
                : "Try another search or category."}
            </Text>
          </View>
        ) : (
          visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setSelectedNote}
              onDelete={setNoteToDelete}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Add Note Button */}
      <Pressable
        style={[styles.addButton, { bottom: insets.bottom + 20 }]}
        onPress={() => setCreateOpen(true)}
        accessibilityLabel="Create Note"
        accessibilityRole="button"
      >
        <Plus size={26} color="#FFFFFF" />
      </Pressable>

      {/* Sidebar */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>My Notes</Text>

              <Pressable
                onPress={() => setDrawerOpen(false)}
                accessibilityLabel="Close menu"
                accessibilityRole="button"
              >
                <X size={22} color="#475569" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.drawerLabel}>CATEGORIES</Text>

              {/* All Notes */}
              <Pressable
                style={[
                  styles.drawerItem,
                  category === "All" && styles.activeItem,
                ]}
                onPress={() => selectCategory("All")}
                accessibilityRole="button"
              >
                <Menu size={19} color="#2563EB" />

                <Text style={styles.drawerItemText}>All Notes</Text>

                <Text style={styles.drawerCount}>{notes.length}</Text>
              </Pressable>

              {/* Work, Study, Personal */}
              {NOTE_CATEGORIES.map((item) => {
                const Icon =
                  item === "Work"
                    ? BriefcaseBusiness
                    : item === "Study"
                      ? GraduationCap
                      : Heart;

                const count = notes.filter(
                  (note) => note.category === item,
                ).length;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.drawerItem,
                      category === item && styles.activeItem,
                    ]}
                    onPress={() => selectCategory(item)}
                    accessibilityRole="button"
                  >
                    <Icon size={19} color="#2563EB" />

                    <Text style={styles.drawerItemText}>{item}</Text>

                    <Text style={styles.drawerCount}>{count}</Text>
                  </Pressable>
                );
              })}

              <View style={styles.divider} />

              {/* Sorting */}
              <Text style={styles.drawerLabel}>SORT BY DATE ADDED</Text>

              {(["newest", "oldest"] as const).map((value) => (
                <Pressable
                  key={value}
                  style={[
                    styles.drawerItem,
                    sortOrder === value && styles.activeItem,
                  ]}
                  onPress={() => selectSort(value)}
                  accessibilityRole="button"
                >
                  <View
                    style={[
                      styles.radio,
                      sortOrder === value && styles.radioActive,
                    ]}
                  />

                  <Text style={styles.drawerItemText}>
                    {value === "newest" ? "Newest First" : "Oldest First"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Outside area closes sidebar */}
          <Pressable
            style={styles.drawerDismiss}
            onPress={() => setDrawerOpen(false)}
            accessibilityLabel="Close sidebar"
            accessibilityRole="button"
          />
        </View>
      </Modal>

      {/* Add Note Popup */}
      <NoteCreateModal
        visible={createOpen}
        userId={user?.id ?? ""}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      {/* Edit Note Popup */}
      <NoteEditorModal
        note={selectedNote}
        userId={user?.id ?? ""}
        onClose={() => setSelectedNote(null)}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation Popup */}
      <Modal
        visible={noteToDelete !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          {/* Tap outside to cancel deletion */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDeleteModal}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Cancel note deletion"
          />

          {/* Confirmation Card */}
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>Delete Note?</Text>

            <Text style={styles.modalDescription}>
              Are you sure you want to delete "
              {noteToDelete?.title || "Untitled Note"}"? This action cannot be
              undone.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeDeleteModal}
                disabled={deleting}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.deleteButton, deleting && styles.disabledButton]}
                onPress={handleDelete}
                disabled={deleting}
                accessibilityRole="button"
              >
                <Text style={styles.deleteText}>
                  {deleting ? "Deleting..." : "Delete"}
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
    paddingTop: 24,
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  heading: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 28,
  },

  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
    ...({ outlineStyle: "none" } as object),
  },

  // Notes
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
    marginTop: 30,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 30,
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

  // Floating Add Button
  addButton: {
    position: "absolute",
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  // Sidebar
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15,23,42,0.5)",
  },

  drawer: {
    width: "80%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    paddingTop: 32,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },

  drawerDismiss: {
    flex: 1,
  },

  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  drawerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },

  drawerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 14,
    letterSpacing: 1,
  },

  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 4,
  },

  activeItem: {
    backgroundColor: "#EFF6FF",
  },

  drawerItemText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },

  drawerCount: {
    fontSize: 12,
    color: "#64748B",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 22,
  },

  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#94A3B8",
  },

  radioActive: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
  },

  // Delete Confirmation
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  confirmCard: {
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
