export const NOTE_CATEGORIES = ["Work", "Study", "Personal"] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export type Note = {
  id: string;
  userId: string;
  title?: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
  updatedAt?: string;
};

export type CreateNoteData = {
  title?: string;
  content: string;
  category: NoteCategory;
};

export type UpdateNoteData = Partial<CreateNoteData>;
