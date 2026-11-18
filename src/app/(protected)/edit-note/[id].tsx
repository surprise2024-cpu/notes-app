import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";

import {
    ActivityIndicator,
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
import { getUserNotes, updateNote } from "@/services/noteService";
import { NOTE_CATEGORIES, type NoteCategory } from "@/types/note";
import { noteSchema } from "@/validators/note";

export default function EditNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("Personal");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  // Load the existing note.
  useEffect(() => {
    let active = true;

    const loadNote = async () => {
      if (!user || !id) {
        if (active) {
          setError("Note not found.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const notes = await getUserNotes(user.id);
        const note = notes.find((item) => item.id === id);

        if (!active) return;

        if (!note) {
          setError("Note not found.");
          return;
        }

        setTitle(note.title ?? "");
        setContent(note.content);
        setCategory(note.category);
      } catch {
        if (active) {
          setError("Unable to load note.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadNote();

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const handleSave = async () => {
    if (!user || !id || isSaving) return;

    setError("");

    const result = noteSchema.safeParse({
      title,
      content,
      category,
    });

    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;

      setFieldErrors({
        title: fields.title?.[0],
        content: fields.content?.[0],
      });
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      await updateNote(user.id, id, {
        title: result.data.title,
        content: result.data.content,
        category: result.data.category,
      });

      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update note.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Don't display an editable form for a missing note.
  if (error === "Note not found." || error === "Unable to load note.") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable onPress={() => router.replace("/home")}>
          <Text style={styles.backText}>Back to Notes</Text>
        </Pressable>
      </View>
    );
  }

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

          <Text style={styles.title}>Edit Note</Text>
          <Text style={styles.subtitle}>Update your note details.</Text>

          <FormInput
            label="Title (Optional)"
            placeholder="Enter note title"
            value={title}
            onChangeText={setTitle}
            error={fieldErrors.title}
          />

          <Text style={styles.label}>Note</Text>

          <TextInput
            style={[styles.textArea, isFocused && styles.focusedInput]}
            placeholder="Write your note here..."
            placeholderTextColor="#94A3B8"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {fieldErrors.content ? (
            <Text style={styles.error}>{fieldErrors.content}</Text>
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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveText}>
              {isSaving ? "Saving..." : "Save Changes"}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    gap: 16,
    padding: 20,
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
    fontSize: 13,
    fontWeight: "600",
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
