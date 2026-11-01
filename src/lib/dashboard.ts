import {
  addDays,
  addMonths,
  endOfDay,
  getLastNDays,
  isSameDay,
  startOfDay,
  toDateKey,
} from "@/lib/date";
import { clampPercent } from "@/lib/format";
import type {
  CashflowPoint,
  CalendarEvent,
  DashboardSnapshot,
  FinancialTransaction,
  Goal,
  Habit,
  Task,
  WeeklyProductivityPoint,
} from "@/lib/types";

/**
 * Input to the dashboard calculations. Real database rows for the signed-in
 * account are passed in; there are no defaults and no sample fallbacks.
 */
export interface DashboardInput {
  tasks: Task[];
  events: CalendarEvent[];
  transactions: FinancialTransaction[];
  habits: Habit[];
  goals: Goal[];
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

function sumCents(
  transactions: DashboardInput["transactions"],
  type: "income" | "expense",
): number {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amountCents, 0);
}

function buildWeeklyProductivity(
  tasks: Task[],
  now: Date,
): WeeklyProductivityPoint[] {
  const days = getLastNDays(7, now);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" });

  return days.map((day) => {
    const completed = tasks.filter(
      (task) =>
        task.completedAt && isSameDay(new Date(task.completedAt), day),
    ).length;
    const created = tasks.filter((task) =>
      isSameDay(new Date(task.createdAt), day),
    ).length;

    return { day: weekday.format(day), completed, created };
  });
}

function buildCashflow(
  transactions: DashboardInput["transactions"],
  now: Date,
): CashflowPoint[] {
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short" });
  const points: CashflowPoint[] = [];

  for (let offset = -5; offset <= 0; offset += 1) {
    const monthStart = addMonths(startOfDay(now), offset);
    monthStart.setDate(1);
    const nextMonth = addMonths(monthStart, 1);
    const inMonth = transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return date >= monthStart && date < nextMonth;
    });

    points.push({
      month: monthLabel.format(monthStart),
      incomeCents: sumCents(inMonth, "income"),
      expenseCents: sumCents(inMonth, "expense"),
    });
  }

  return points;
}

export function getDashboardSnapshot(
  data: DashboardInput,
  now = new Date(),
): DashboardSnapshot {
  const today = startOfDay(now);
  const weekStart = addDays(today, -6);
  const previousWeekStart = addDays(today, -13);
  const previousWeekEnd = addDays(today, -7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const currentMonthTransactions = data.transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= monthStart && date < nextMonth;
  });

  const monthlyIncomeCents = sumCents(currentMonthTransactions, "income");
  const monthlyExpenseCents = sumCents(currentMonthTransactions, "expense");

  const activeStatuses = new Set<Task["status"]>(["todo", "in-progress"]);
  const todaysTasks = data.tasks
    .filter(
      (task) =>
        activeStatuses.has(task.status) &&
        isSameDay(new Date(task.dueDate), today),
    )
    .sort((a, b) => {
      const priorityDelta =
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDelta !== 0) return priorityDelta;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const tasksCompletedThisWeek = data.tasks.filter((task) => {
    if (!task.completedAt) return false;
    const completed = new Date(task.completedAt);
    return completed >= weekStart && completed <= endOfDay(now);
  }).length;

  const tasksCompletedLastWeek = data.tasks.filter((task) => {
    if (!task.completedAt) return false;
    const completed = new Date(task.completedAt);
    return completed >= previousWeekStart && completed <= previousWeekEnd;
  }).length;

  const weekKeys = new Set(
    getLastNDays(7, now).map((day) => toDateKey(day)),
  );
  const habitCheckInsThisWeek = data.habits.reduce(
    (total, habit) =>
      total + habit.completions.filter((key) => weekKeys.has(key)).length,
    0,
  );
  const habitPossibleCheckIns = data.habits.length * 7;

  const activeGoals = data.goals
    .filter((goal) => goal.status === "active")
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );

  const upcomingEvents = [...data.events]
    .filter((event) => new Date(event.end) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 4);

  return {
    tasksDueToday: todaysTasks.length,
    tasksCompletedThisWeek,
    tasksCompletedLastWeek,
    monthlyIncomeCents,
    monthlyExpenseCents,
    monthlySavingsCents: monthlyIncomeCents - monthlyExpenseCents,
    habitCompletionRate: clampPercent(
      habitCheckInsThisWeek,
      habitPossibleCheckIns,
    ) / 100,
    habitCheckInsThisWeek,
    habitPossibleCheckIns,
    activeGoals,
    upcomingEvents,
    todaysTasks,
    weeklyProductivity: buildWeeklyProductivity(data.tasks, now),
    cashflow: buildCashflow(data.transactions, now),
    transactionsThisMonth: currentMonthTransactions.length,
  };
}
