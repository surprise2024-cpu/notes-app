import { Pencil, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Note } from "@/types/note";

type Props = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
};

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => onEdit(note)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${note.title || "Untitled Note"}`}
      >
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title || "Untitled Note"}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{note.category}</Text>
          </View>
        </View>

        <Text style={styles.content} numberOfLines={5}>
          {note.content}
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <View style={styles.dates}>
          <Text style={styles.date}>Added {formatDate(note.createdAt)}</Text>

          {note.updatedAt ? (
            <Text style={styles.edited}>
              Edited {formatDate(note.updatedAt)}
            </Text>
          ) : null}
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
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  dates: {
    flex: 1,
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
  },
  edited: {
    fontSize: 12,
    color: "#2563EB",
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
