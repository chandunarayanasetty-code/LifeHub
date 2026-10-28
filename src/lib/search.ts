import type { MockData } from "@/lib/mock-data";

export interface SearchItem {
  id: string;
  type: "task" | "note";
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
}

/**
 * Phase 1 search index. Phase 6 replaces this with a database query that is
 * always scoped to the signed-in user; the UI contract stays the same.
 */
export function buildSearchItems(
  data: Pick<MockData, "tasks" | "notes">,
): SearchItem[] {
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
