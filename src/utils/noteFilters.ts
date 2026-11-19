import type { Note } from "@/types/note";

export type NoteSortOrder = "newest" | "oldest";

export function filterAndSortNotes(
  notes: Note[],
  search: string,
  sortOrder: NoteSortOrder,
): Note[] {
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const filtered = notes.filter((note) => {
    const searchableText = `${note.title ?? ""} ${note.content}`.toLowerCase();

    return words.every((word) => searchableText.includes(word));
  });

  return filtered.sort((a, b) => {
    const difference =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    return sortOrder === "newest" ? -difference : difference;
  });
}
