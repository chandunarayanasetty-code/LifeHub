import { describe, expect, it } from "vitest";

import { buildReportSummary } from "@/lib/reports";
import {
  makeEvent,
  makeGoal,
  makeHabit,
  makeTask,
  makeTransaction,
} from "@/test/fixtures";

const now = new Date(2026, 4, 14, 12, 0); // Thursday 14 May 2026.
const empty = { tasks: [], events: [], transactions: [], habits: [], goals: [] };

describe("buildReportSummary with an empty workspace", () => {
  it("returns honest zeroes instead of sample figures", () => {
    const summary = buildReportSummary(empty, now, 30);

    expect(summary.rangeDays).toBe(30);
    expect(summary.tasksCompleted).toBe(0);
    expect(summary.tasksCreated).toBe(0);
    expect(summary.tasksOverdue).toBe(0);
    expect(summary.taskCompletionRate).toBe(0);
    expect(summary.habitCheckIns).toBe(0);
    expect(summary.habitPossible).toBe(0);
    expect(summary.habitRate).toBe(0);
    expect(summary.monthIncomeCents).toBe(0);
    expect(summary.monthExpenseCents).toBe(0);
    expect(summary.monthBalanceCents).toBe(0);
    expect(summary.categoryTotals).toEqual([]);
    expect(summary.eventsThisMonth).toBe(0);
    expect(summary.activeGoals).toBe(0);
    expect(summary.averageGoalProgress).toBe(0);
  });
});

describe("buildReportSummary with records", () => {
  const data = {
    tasks: [
      makeTask({
        id: "completed-in-range",
        status: "completed",
        createdAt: new Date(2026, 4, 2, 9).toISOString(),
        completedAt: new Date(2026, 4, 5, 9).toISOString(),
      }),
      makeTask({
        id: "completed-out-of-range",
        status: "completed",
        createdAt: new Date(2026, 1, 2, 9).toISOString(),
        completedAt: new Date(2026, 1, 3, 9).toISOString(),
      }),
      makeTask({
        id: "overdue",
        status: "todo",
        dueDate: new Date(2026, 4, 1, 9).toISOString(),
        createdAt: new Date(2026, 4, 3, 9).toISOString(),
      }),
    ],
    events: [
      makeEvent({ start: new Date(2026, 4, 20, 9).toISOString() }),
      makeEvent({
        id: "event-last-month",
        start: new Date(2026, 3, 20, 9).toISOString(),
      }),
    ],
    transactions: [
      makeTransaction({
        id: "income",
        type: "income",
        amountCents: 200_000,
        category: "Salary",
        date: new Date(2026, 4, 1, 9).toISOString(),
      }),
      makeTransaction({
        id: "expense",
        type: "expense",
        amountCents: 50_000,
        category: "Rent",
        date: new Date(2026, 4, 2, 9).toISOString(),
      }),
      makeTransaction({
        id: "expense-old",
        type: "expense",
        amountCents: 9_999,
        category: "Rent",
        date: new Date(2026, 2, 2, 9).toISOString(),
      }),
    ],
    habits: [
      makeHabit({
        completions: ["2026-05-14", "2026-05-13", "2026-05-12", "2026-05-01"],
      }),
      makeHabit({ id: "habit-2", completions: [] }),
    ],
    goals: [
      makeGoal({ current: 12, target: 24 }),
      makeGoal({ id: "goal-completed", status: "completed" }),
      makeGoal({ id: "goal-archived", status: "archived" }),
    ],
  };

  const summary = buildReportSummary(data, now, 30);

  it("counts completions and creations inside the range only", () => {
    expect(summary.tasksCompleted).toBe(1);
    expect(summary.tasksCreated).toBe(2);
    expect(summary.taskCompletionRate).toBe(0.5);
  });

  it("counts every open task past its due date", () => {
    expect(summary.tasksOverdue).toBe(1);
  });

  it("measures habit consistency over the range", () => {
    expect(summary.habitCheckIns).toBe(4);
    expect(summary.habitPossible).toBe(60);
    expect(summary.habitRate).toBeCloseTo(4 / 60);
    expect(summary.habitRows.map((row) => row.checkIns)).toEqual([4, 0]);
    expect(summary.habitRows[0].currentStreak).toBe(3);
  });

  it("uses the current calendar month for money and events", () => {
    expect(summary.monthIncomeCents).toBe(200_000);
    expect(summary.monthExpenseCents).toBe(50_000);
    expect(summary.monthBalanceCents).toBe(150_000);
    expect(summary.monthTransactionCount).toBe(2);
    expect(summary.categoryTotals).toEqual([
      { category: "Rent", totalCents: 50_000, share: 1 },
    ]);
    expect(summary.eventsThisMonth).toBe(1);
  });

  it("averages progress across active goals only", () => {
    expect(summary.activeGoals).toBe(1);
    expect(summary.completedGoals).toBe(1);
    expect(summary.averageGoalProgress).toBe(0.5);
  });
});
