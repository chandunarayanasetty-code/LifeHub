import { getDb } from "@/lib/db/client";
import { toHabit } from "@/lib/db/mappers";
import type { Habit } from "@/lib/types";

import type { HabitFormValues } from "./schema";

/** Habit repository. Every query is scoped to the signed-in user. */

export async function listHabits(userId: string): Promise<Habit[]> {
  const prisma = await getDb();
  const records = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { completions: { select: { dateKey: true } } },
  });
  return records.map(toHabit);
}

export async function createHabit(
  userId: string,
  values: HabitFormValues,
): Promise<Habit> {
  const prisma = await getDb();
  const record = await prisma.habit.create({
    data: { userId, ...values },
    include: { completions: { select: { dateKey: true } } },
  });
  return toHabit(record);
}

export async function updateHabit(
  userId: string,
  id: string,
  values: HabitFormValues,
): Promise<Habit | null> {
  const prisma = await getDb();
  const existing = await prisma.habit.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) return null;

  const record = await prisma.habit.update({
    where: { id: existing.id },
    data: values,
    include: { completions: { select: { dateKey: true } } },
  });
  return toHabit(record);
}

export async function removeHabit(userId: string, id: string): Promise<boolean> {
  const prisma = await getDb();
  const result = await prisma.habit.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

/**
 * Toggle one day for one habit. Returns the new state, or null when the habit
 * does not belong to this user.
 */
export async function toggleHabitCompletion(
  userId: string,
  habitId: string,
  dateKey: string,
): Promise<boolean | null> {
  const prisma = await getDb();
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { id: true },
  });
  if (!habit) return null;

  const existing = await prisma.habitCompletion.findUnique({
    where: { habitId_dateKey: { habitId: habit.id, dateKey } },
    select: { id: true },
  });

  if (existing) {
    await prisma.habitCompletion.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.habitCompletion.create({
    data: { habitId: habit.id, dateKey },
  });
  return true;
}
