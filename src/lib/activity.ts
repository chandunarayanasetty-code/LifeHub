import { formatCurrency, formatShortDate } from "@/lib/format";
import type {
  ActivityItem,
  FinancialTransaction,
  Habit,
  Note,
  Task,
} from "@/lib/types";

/**
 * Build the dashboard activity feed from real records.
 *
 * Nothing here is invented: each row comes from a task completion, a
 * transaction, a habit check-in, or a note edit that exists in the database.
 */
export function buildActivityFeed(
  input: {
    tasks: Task[];
    transactions: FinancialTransaction[];
    habits: Habit[];
    notes: Note[];
  },
  limit = 6,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const task of input.tasks) {
    if (!task.completedAt) continue;
    items.push({
      id: `task-${task.id}`,
      kind: "task",
      title: `Completed “${task.title}”`,
      description: `${task.category} · task completed`,
      timestamp: task.completedAt,
    });
  }

  for (const transaction of input.transactions.slice(0, 20)) {
    items.push({
      id: `transaction-${transaction.id}`,
      kind: "expense",
      title: `${transaction.type === "expense" ? "Recorded" : "Received"} ${formatCurrency(transaction.amountCents)}`,
      description: `${transaction.category} · ${transaction.paymentMethod}`,
      timestamp: transaction.date,
    });
  }

  for (const habit of input.habits) {
    const latest = [...habit.completions].sort().at(-1);
    if (!latest) continue;
    items.push({
      id: `habit-${habit.id}-${latest}`,
      kind: "habit",
      title: `Checked in: ${habit.name}`,
      description: `Habit check-in · ${formatShortDate(`${latest}T12:00:00`)}`,
      timestamp: new Date(`${latest}T12:00:00`).toISOString(),
    });
  }

  for (const note of input.notes) {
    items.push({
      id: `note-${note.id}`,
      kind: "note",
      title: `Updated “${note.title}”`,
      description: note.tags.length > 0 ? note.tags.join(" · ") : "Note",
      timestamp: note.updatedAt,
    });
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, limit);
}
