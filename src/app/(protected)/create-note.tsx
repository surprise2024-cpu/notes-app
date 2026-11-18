import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";

import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import FormInput from "@/components/forms/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { createNote } from "@/services/noteService";
import { NOTE_CATEGORIES, type NoteCategory } from "@/types/note";
import { noteSchema } from "@/validators/note";

export default function CreateNoteScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("Personal");

  const [contentFocused, setContentFocused] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
  }>({});
  const [serverError, setServerError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user || isSaving) return;

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
    setIsSaving(true);

    try {
      await createNote(user.id, {
        title: result.data.title || undefined,
        content: result.data.content,
        category: result.data.category,
      });

      router.replace("/home");
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to save note.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Pressable
            style={styles.back}
            onPress={() => router.replace("/home")}
          >
            <ArrowLeft size={18} color="#2563EB" />
            <Text style={styles.backText}>Back to Notes</Text>
          </Pressable>

          <Text style={styles.title}>New Note</Text>
          <Text style={styles.subtitle}>Capture your thoughts and ideas.</Text>

          <FormInput
            label="Title (Optional)"
            placeholder="Enter note title"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />

          <Text style={styles.label}>Note</Text>

          <TextInput
            style={[styles.textArea, contentFocused && styles.focusedInput]}
            placeholder="Write your note here..."
            placeholderTextColor="#94A3B8"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            onFocus={() => setContentFocused(true)}
            onBlur={() => setContentFocused(false)}
          />

          {errors.content ? (
            <Text style={styles.error}>{errors.content}</Text>
          ) : null}

          <Text style={styles.label}>Category</Text>

          <View style={styles.categories}>
            {NOTE_CATEGORIES.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.categoryButton,
                  category === item && styles.selectedCategory,
                ]}
                onPress={() => setCategory(item)}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: category === item,
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

          {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

          <Pressable
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveText}>
              {isSaving ? "Saving..." : "Save Note"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  form: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 24,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  textArea: {
    height: 180,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    ...({ outlineStyle: "none" } as object),
  },
  focusedInput: {
    borderColor: "#2563EB",
    borderWidth: 1.5,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  selectedCategory: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  categoryText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
  },
  selectedText: {
    color: "#FFFFFF",
  },
  error: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 12,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
