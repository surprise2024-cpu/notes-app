import { Pencil, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Note } from "@/types/note";

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
};

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title || "Untitled Note"}
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{note.category}</Text>
        </View>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {note.content}
      </Text>

      <View style={styles.footer}>
        <View style={styles.dates}>
          <Text style={styles.date}>Added {formatDate(note.createdAt)}</Text>

          {note.updatedAt && (
            <Text style={styles.editedDate}>
              Edited {formatDate(note.updatedAt)}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => onEdit(note)}
            accessibilityRole="button"
            accessibilityLabel="Edit note"
          >
            <Pencil size={18} color="#2563EB" />
          </Pressable>

          <Pressable
            style={styles.iconButton}
            onPress={() => onDelete(note)}
            accessibilityRole="button"
            accessibilityLabel="Delete note"
          >
            <Trash2 size={18} color="#DC2626" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  badge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },
  content: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  dates: {
    flex: 1,
    gap: 4,
  },
  date: {
    color: "#94A3B8",
    fontSize: 12,
  },
  editedDate: {
    color: "#2563EB",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
});
