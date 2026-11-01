import { addDays, startOfDay, toDateKey } from "@/lib/date";
import type { Habit } from "@/lib/types";

/** Pure habit statistics. No React, no database — easy to unit test. */

export function isCompletedOn(habit: Habit, dateKey: string): boolean {
  return habit.completions.includes(dateKey);
}

/**
 * Consecutive days ending today (or yesterday, so a streak is not "lost" before
 * the day is over). Weekly habits use the same rule; the frequency only affects
 * how the target is presented.
 */
export function currentStreak(habit: Habit, now = new Date()): number {
  const completed = new Set(habit.completions);
  let cursor = startOfDay(now);

  if (!completed.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (completed.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreak(habit: Habit): number {
  const keys = [...new Set(habit.completions)].sort();
  let best = 0;
  let run = 0;
  let lastDate: Date | null = null;

  for (const key of keys) {
    const date = new Date(`${key}T12:00:00`);
    if (Number.isNaN(date.getTime())) continue;

    const previous = run > 0 ? lastDate : null;
    if (previous && toDateKey(addDays(previous, 1)) === key) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    lastDate = date;
  }

  return best;
}

export interface HabitWeekSummary {
  checkIns: number;
  possible: number;
  rate: number;
}

export function weekSummary(
  habits: Habit[],
  now = new Date(),
): HabitWeekSummary {
  const days = Array.from({ length: 7 }, (_, index) =>
    toDateKey(addDays(startOfDay(now), index - 6)),
  );
  const daySet = new Set(days);

  const checkIns = habits.reduce(
    (total, habit) =>
      total + habit.completions.filter((key) => daySet.has(key)).length,
    0,
  );
  const possible = habits.length * 7;

  return {
    checkIns,
    possible,
    rate: possible > 0 ? checkIns / possible : 0,
  };
}

/** The seven day keys shown in the check-in grid, oldest first. */
export function lastSevenDays(now = new Date()): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    toDateKey(addDays(startOfDay(now), index - 6)),
  );
}
