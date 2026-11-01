import {
  getLastNDays,
  isWithinRange,
  startOfDay,
  toDateKey,
} from "@/lib/date";
import { expenseCategoryTotals, type CategoryTotal } from "@/lib/expenses/query";
import { goalProgress } from "@/lib/goals/schema";
import type {
  CalendarEvent,
  FinancialTransaction,
  Goal,
  Habit,
  Task,
} from "@/lib/types";

/**
 * Report calculations.
 *
 * Every number is derived from the records passed in. There are no sample
 * fallbacks and no estimates: an empty workspace produces honest zeroes.
 */

export interface ReportInput {
  tasks: Task[];
  events: CalendarEvent[];
  transactions: FinancialTransaction[];
  habits: Habit[];
  goals: Goal[];
}

export interface HabitReportRow {
  id: string;
  name: string;
  checkIns: number;
  possible: number;
  rate: number;
  currentStreak: number;
}

export interface ReportSummary {
  rangeDays: number;
  tasksCompleted: number;
  tasksCreated: number;
  tasksOverdue: number;
  taskCompletionRate: number;
  habitCheckIns: number;
  habitPossible: number;
  habitRate: number;
  habitRows: HabitReportRow[];
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthBalanceCents: number;
  monthTransactionCount: number;
  categoryTotals: CategoryTotal[];
  eventsThisMonth: number;
  activeGoals: number;
  completedGoals: number;
  averageGoalProgress: number;
}

function currentMonthBounds(now: Date): { start: Date; end: Date } {
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

/** Consecutive days ending today (or yesterday), matching the habits page. */
function streakFromKeys(keys: Iterable<string>, now: Date): number {
  const completed = new Set(keys);
  let cursor = startOfDay(now);
  if (!completed.has(toDateKey(cursor))) {
    cursor = new Date(cursor.getTime() - 86_400_000);
  }

  let streak = 0;
  while (completed.has(toDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

export function buildReportSummary(
  data: ReportInput,
  now = new Date(),
  rangeDays = 30,
): ReportSummary {
  const days = getLastNDays(rangeDays, now);
  const rangeStart = days[0];
  const rangeEnd = days[days.length - 1];
  const dayKeys = new Set(days.map(toDateKey));

  const tasksCompleted = data.tasks.filter(
    (task) =>
      task.completedAt &&
      isWithinRange(new Date(task.completedAt), rangeStart, rangeEnd),
  ).length;
  const tasksCreated = data.tasks.filter((task) =>
    isWithinRange(new Date(task.createdAt), rangeStart, rangeEnd),
  ).length;
  const tasksOverdue = data.tasks.filter(
    (task) =>
      (task.status === "todo" || task.status === "in-progress") &&
      startOfDay(new Date(task.dueDate)) < startOfDay(now),
  ).length;

  const habitRows: HabitReportRow[] = data.habits.map((habit) => {
    const checkIns = habit.completions.filter((key) => dayKeys.has(key)).length;
    return {
      id: habit.id,
      name: habit.name,
      checkIns,
      possible: rangeDays,
      rate: rangeDays > 0 ? checkIns / rangeDays : 0,
      currentStreak: streakFromKeys(habit.completions, now),
    };
  });

  const habitCheckIns = habitRows.reduce((sum, row) => sum + row.checkIns, 0);
  const habitPossible = data.habits.length * rangeDays;

  const { start, end } = currentMonthBounds(now);
  const monthTransactions = data.transactions.filter((transaction) =>
    isWithinRange(new Date(transaction.date), start, new Date(end.getTime() - 1)),
  );
  const monthIncomeCents = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);
  const monthExpenseCents = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);

  const eventsThisMonth = data.events.filter((event) =>
    isWithinRange(new Date(event.start), start, new Date(end.getTime() - 1)),
  ).length;

  const activeGoals = data.goals.filter((goal) => goal.status === "active");
  const completedGoals = data.goals.filter(
    (goal) => goal.status === "completed",
  ).length;
  const averageGoalProgress =
    activeGoals.length > 0
      ? activeGoals.reduce(
          (sum, goal) => sum + goalProgress(goal.current, goal.target),
          0,
        ) / activeGoals.length
      : 0;

  return {
    rangeDays,
    tasksCompleted,
    tasksCreated,
    tasksOverdue,
    taskCompletionRate:
      tasksCreated > 0 ? Math.min(1, tasksCompleted / tasksCreated) : 0,
    habitCheckIns,
    habitPossible,
    habitRate: habitPossible > 0 ? habitCheckIns / habitPossible : 0,
    habitRows: habitRows.sort((a, b) => b.checkIns - a.checkIns),
    monthIncomeCents,
    monthExpenseCents,
    monthBalanceCents: monthIncomeCents - monthExpenseCents,
    monthTransactionCount: monthTransactions.length,
    categoryTotals: expenseCategoryTotals(monthTransactions),
    eventsThisMonth,
    activeGoals: activeGoals.length,
    completedGoals,
    averageGoalProgress,
  };
}
