import type { Note, Task } from "@/lib/types";

export interface SearchItem {
  id: string;
  type: "task" | "note";
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
}

/**
 * Search index for the command palette. Records come from the signed-in user's
 * database rows — never from sample data.
 */
export function buildSearchItems(data: {
  tasks: Task[];
  notes: Note[];
}): SearchItem[] {
  const tasks: SearchItem[] = data.tasks
    .filter((task) => task.status !== "cancelled")
    .slice(0, 12)
    .map((task) => ({
      id: task.id,
      type: "task",
      title: task.title,
      subtitle: `${task.category} · ${task.status.replace("-", " ")}`,
      href: "/tasks",
      keywords: `${task.tags.join(" ")} ${task.priority} ${task.description}`,
    }));

  const notes: SearchItem[] = data.notes.map((note) => ({
    id: note.id,
    type: "note",
    title: note.title,
    subtitle: `${note.pinned ? "Pinned · " : ""}${note.tags.join(", ")}`,
    href: "/notes",
    keywords: `${note.excerpt} ${note.tags.join(" ")}`,
  }));

  return [...tasks, ...notes];
}
