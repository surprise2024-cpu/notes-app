import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

import {
    type CreateNoteData,
    type Note,
    type UpdateNoteData,
} from "@/types/note";

const NOTES_KEY = "notes-app-notes";

// Read all notes stored on this device.
async function getStoredNotes(): Promise<Note[]> {
  const data = await AsyncStorage.getItem(NOTES_KEY);

  return data ? (JSON.parse(data) as Note[]) : [];
}

// Get notes belonging to the logged-in user.
export async function getUserNotes(userId: string): Promise<Note[]> {
  const notes = await getStoredNotes();

  return notes.filter((note) => note.userId === userId);
}

// Create a new note.
export async function createNote(
  userId: string,
  data: CreateNoteData,
): Promise<Note> {
  if (!data.content.trim()) {
    throw new Error("Note content is required.");
  }

  const notes = await getStoredNotes();

  const newNote: Note = {
    id: Crypto.randomUUID(),
    userId,
    title: data.title?.trim() || undefined,
    content: data.content.trim(),
    category: data.category,
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify([...notes, newNote]));

  return newNote;
}

// Update an existing note.
export async function updateNote(
  userId: string,
  noteId: string,
  data: UpdateNoteData,
): Promise<Note> {
  const notes = await getStoredNotes();

  const index = notes.findIndex(
    (note) => note.id === noteId && note.userId === userId,
  );

  if (index === -1) {
    throw new Error("Note not found.");
  }

  if (data.content !== undefined && !data.content.trim()) {
    throw new Error("Note content is required.");
  }

  const updatedNote: Note = {
    ...notes[index],
    ...(data.title !== undefined && {
      title: data.title.trim() || undefined,
    }),
    ...(data.content !== undefined && {
      content: data.content.trim(),
    }),
    ...(data.category !== undefined && {
      category: data.category,
    }),
    updatedAt: new Date().toISOString(),
  };

  notes[index] = updatedNote;

  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));

  return updatedNote;
}

// Delete an existing note.
export async function deleteNote(
  userId: string,
  noteId: string,
): Promise<void> {
  const notes = await getStoredNotes();

  const exists = notes.some(
    (note) => note.id === noteId && note.userId === userId,
  );

  if (!exists) {
    throw new Error("Note not found.");
  }

  const remainingNotes = notes.filter((note) => note.id !== noteId);

  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(remainingNotes));
}
