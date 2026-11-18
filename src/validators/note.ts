import { NOTE_CATEGORIES } from "@/types/note";
import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().max(100, "Title is too long"),

  content: z.string().trim().min(1, "Note content is required"),

  category: z.enum(NOTE_CATEGORIES),
});

export type NoteFormData = z.infer<typeof noteSchema>;
