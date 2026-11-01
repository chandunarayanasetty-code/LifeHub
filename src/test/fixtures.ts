import type {
  CalendarEvent,
  FinancialTransaction,
  Goal,
  Habit,
  Note,
  Task,
} from "@/lib/types";

/**
 * Deterministic fixtures for unit tests. Dates are built from local calendar
 * parts, so the tests behave the same in any timezone.
 */

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Write the weekly review",
    description: "Summarise what moved and what did not.",
    status: "todo",
    priority: "medium",
    category: "Work",
    tags: ["review"],
    dueDate: new Date(2026, 2, 10, 9, 0).toISOString(),
    createdAt: new Date(2026, 2, 1, 9, 0).toISOString(),
    ...overrides,
  };
}

export function makeTransaction(
  overrides: Partial<FinancialTransaction> = {},
): FinancialTransaction {
  return {
    id: "txn-1",
    type: "expense",
    amountCents: 4250,
    category: "Groceries",
    description: "Weekly shop",
    date: new Date(2026, 2, 10, 12, 0).toISOString(),
    paymentMethod: "Card",
    ...overrides,
  };
}

export function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "event-1",
    title: "Dentist",
    description: "Six-month check-up",
    start: new Date(2026, 2, 10, 9, 0).toISOString(),
    end: new Date(2026, 2, 10, 10, 0).toISOString(),
    allDay: false,
    location: "High Street",
    color: "violet",
    ...overrides,
  };
}

export function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit-1",
    name: "Read 20 pages",
    icon: "book",
    frequency: "daily",
    color: "emerald",
    completions: [],
    ...overrides,
  };
}

export function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "goal-1",
    title: "Read 24 books",
    description: "One every two weeks.",
    category: "Learning",
    current: 6,
    target: 24,
    unit: "books",
    deadline: new Date(2026, 11, 31).toISOString(),
    status: "active",
    ...overrides,
  };
}

export function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    title: "Ideas",
    excerpt: "A small idea worth keeping.",
    tags: ["ideas"],
    pinned: false,
    updatedAt: new Date(2026, 2, 10, 12, 0).toISOString(),
    ...overrides,
  };
}
