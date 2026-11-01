/**
 * Shared domain types.
 *
 * These are the shapes the UI consumes. Repositories map Prisma rows into
 * them (`src/lib/db/mappers.ts`), so pages never depend on database columns
 * directly and the two layers can evolve separately.
 */

export type TaskStatus = "todo" | "in-progress" | "completed" | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TransactionType = "income" | "expense";

export type HabitFrequency = "daily" | "weekly";

export type GoalStatus = "active" | "completed" | "archived";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  tags: string[];
  /** ISO timestamp. */
  dueDate: string;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp, only present when the task has been completed. */
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  /** ISO timestamp. */
  start: string;
  /** ISO timestamp. */
  end: string;
  allDay: boolean;
  location?: string;
  color: "violet" | "emerald" | "amber" | "sky" | "rose";
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  /**
   * Amount in the currency's minor unit (cents).
   * Storing integers avoids floating-point rounding errors.
   */
  amountCents: number;
  category: string;
  description: string;
  /** ISO timestamp. */
  date: string;
  paymentMethod: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: "activity" | "book" | "droplets" | "code" | "brain";
  frequency: HabitFrequency;
  /** Completed days as local YYYY-MM-DD keys. */
  completions: string[];
  color: "violet" | "emerald" | "amber" | "sky" | "rose";
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  current: number;
  target: number;
  unit: string;
  /** ISO timestamp. */
  deadline: string;
  status: GoalStatus;
}

export interface Note {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  pinned: boolean;
  /** ISO timestamp. */
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  kind: "task" | "expense" | "habit" | "note" | "goal" | "event";
  title: string;
  description: string;
  /** ISO timestamp. */
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  /** ISO timestamp. */
  createdAt: string;
  read: boolean;
  href: string;
  kind: "deadline" | "event" | "goal";
}

export interface WeeklyProductivityPoint {
  /** Short day label, e.g. "Mon". */
  day: string;
  completed: number;
  created: number;
}

export interface CashflowPoint {
  /** Short month label, e.g. "May". */
  month: string;
  incomeCents: number;
  expenseCents: number;
}

export interface DashboardSnapshot {
  tasksDueToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedLastWeek: number;
  monthlyIncomeCents: number;
  monthlyExpenseCents: number;
  monthlySavingsCents: number;
  habitCompletionRate: number;
  habitCheckInsThisWeek: number;
  habitPossibleCheckIns: number;
  activeGoals: Goal[];
  upcomingEvents: CalendarEvent[];
  todaysTasks: Task[];
  weeklyProductivity: WeeklyProductivityPoint[];
  cashflow: CashflowPoint[];
  transactionsThisMonth: number;
}
