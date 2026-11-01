import type {
  CalendarEvent as DbCalendarEvent,
  FinancialTransaction as DbFinancialTransaction,
  Goal as DbGoal,
  Habit as DbHabit,
  HabitCompletion as DbHabitCompletion,
  Note as DbNote,
  Notification as DbNotification,
  Task as DbTask,
} from "@/generated/prisma/client";
import type {
  GoalStatus as DbGoalStatus,
  TaskStatus as DbTaskStatus,
} from "@/generated/prisma/enums";
import type {
  AppNotification,
  CalendarEvent,
  FinancialTransaction,
  Goal,
  GoalStatus,
  Habit,
  Note,
  Task,
  TaskStatus,
} from "@/lib/types";

/**
 * Convert between Prisma records and the domain types the UI already uses.
 *
 * Prisma enum members cannot contain hyphens, so `in-progress` is stored as
 * `in_progress`. Keeping the translation in one place means the rest of the app
 * only ever sees the domain spelling.
 */

const TASK_STATUS_TO_DB: Record<TaskStatus, DbTaskStatus> = {
  todo: "todo",
  "in-progress": "in_progress",
  completed: "completed",
  cancelled: "cancelled",
};

const TASK_STATUS_FROM_DB: Record<DbTaskStatus, TaskStatus> = {
  todo: "todo",
  in_progress: "in-progress",
  completed: "completed",
  cancelled: "cancelled",
};

const GOAL_STATUS_TO_DB: Record<GoalStatus, DbGoalStatus> = {
  active: "active",
  completed: "completed",
  archived: "archived",
};

const GOAL_STATUS_FROM_DB: Record<DbGoalStatus, GoalStatus> = {
  active: "active",
  completed: "completed",
  archived: "archived",
};

export function taskStatusToDb(status: TaskStatus): DbTaskStatus {
  return TASK_STATUS_TO_DB[status];
}

export function taskStatusFromDb(status: DbTaskStatus): TaskStatus {
  return TASK_STATUS_FROM_DB[status];
}

export function goalStatusToDb(status: GoalStatus): DbGoalStatus {
  return GOAL_STATUS_TO_DB[status];
}

export function toTask(record: DbTask): Task {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    status: taskStatusFromDb(record.status),
    priority: record.priority,
    category: record.category,
    tags: record.tags,
    dueDate: record.dueDate.toISOString(),
    createdAt: record.createdAt.toISOString(),
    completedAt: record.completedAt?.toISOString(),
  };
}

export function toCalendarEvent(record: DbCalendarEvent): CalendarEvent {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    start: record.start.toISOString(),
    end: record.end.toISOString(),
    allDay: record.allDay,
    location: record.location ?? undefined,
    color: record.color,
  };
}

export function toTransaction(
  record: DbFinancialTransaction,
): FinancialTransaction {
  return {
    id: record.id,
    type: record.type,
    amountCents: record.amountCents,
    category: record.category,
    description: record.description,
    date: record.date.toISOString(),
    paymentMethod: record.paymentMethod,
  };
}

type DbHabitWithCompletions = DbHabit & {
  completions: Pick<DbHabitCompletion, "dateKey">[];
};

export function toHabit(record: DbHabitWithCompletions): Habit {
  return {
    id: record.id,
    name: record.name,
    icon: record.icon,
    frequency: record.frequency,
    color: record.color,
    completions: record.completions.map((entry) => entry.dateKey).sort(),
  };
}

export function toGoal(record: DbGoal): Goal {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category,
    current: record.current,
    target: record.target,
    unit: record.unit,
    deadline: record.deadline.toISOString(),
    status: GOAL_STATUS_FROM_DB[record.status],
  };
}

export function toNote(record: DbNote): Note {
  return {
    id: record.id,
    title: record.title,
    excerpt: excerptFor(record.content),
    tags: record.tags,
    pinned: record.pinned,
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Plain-text preview for a note. The list never renders raw markup. */
export function excerptFor(content: string, limit = 180): string {
  const text = content.replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trimEnd()}…`;
}

export function toNotification(record: DbNotification): AppNotification {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    createdAt: record.createdAt.toISOString(),
    read: record.read,
    href: record.href,
    kind: record.kind,
  };
}
