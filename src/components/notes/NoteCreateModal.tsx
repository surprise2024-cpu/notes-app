import { X } from "lucide-react-native";
import { useState } from "react";

import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import FormInput from "@/components/forms/FormInput";
import { createNote } from "@/services/noteService";
import { NOTE_CATEGORIES, type Note, type NoteCategory } from "@/types/note";
import { noteSchema } from "@/validators/note";

type Props = {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onCreated: (note: Note) => void;
};

export default function NoteCreateModal({
  visible,
  userId,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("Personal");

  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset the form.
  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("Personal");
    setErrors({});
    setServerError("");
  };

  // Close the popup without saving.
  const close = () => {
    if (saving) return;

    resetForm();
    onClose();
  };

  // Validate and save the new note.
  const handleSave = async () => {
    if (!userId || saving) return;

    setServerError("");

    const result = noteSchema.safeParse({
      title,
      content,
      category,
    });

    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;

      setErrors({
        title: fields.title?.[0],
        content: fields.content?.[0],
      });

      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const note = await createNote(userId, {
        title: result.data.title || undefined,
        content: result.data.content,
        category: result.data.category,
      });

      resetForm();
      onCreated(note);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Unable to create note.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Tap outside to close the popup */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Close Add Note popup"
        />

        {/* Add Note Card */}
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.heading}>Add Note</Text>

            <Pressable
              onPress={close}
              disabled={saving}
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
            {/* Title */}
            <FormInput
              label="Title (Optional)"
              placeholder="Note title"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            {/* Note Content */}
            <Text style={styles.label}>Note</Text>

            <TextInput
              style={styles.textArea}
              placeholder="Write your note..."
              placeholderTextColor="#94A3B8"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              autoCorrect
              accessibilityLabel="Note content"
            />

            {errors.content ? (
              <Text style={styles.error}>{errors.content}</Text>
            ) : null}

            {/* Category */}
            <Text style={styles.label}>Category</Text>

            <View style={styles.categories}>
              {NOTE_CATEGORIES.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.category,
                    category === item && styles.selected,
                  ]}
                  onPress={() => setCategory(item)}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: category === item,
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === item && styles.selectedText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Save Error */}
            {serverError ? (
              <Text style={styles.error}>{serverError}</Text>
            ) : null}

            {/* Save Button */}
            <Pressable
              style={[styles.saveButton, saving && styles.disabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
            >
              <Text style={styles.saveText}>
                {saving ? "Saving..." : "Save Note"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modal: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  heading: {
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

  textArea: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 16,
    ...({ outlineStyle: "none" } as object),
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  category: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  selected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  categoryText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },

  selectedText: {
    color: "#FFFFFF",
  },

  error: {
    fontSize: 12,
    color: "#DC2626",
    marginBottom: 12,
  },

  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.6,
  },
});
