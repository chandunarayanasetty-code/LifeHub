import { getDb } from "@/lib/db/client";
import { goalStatusToDb, toGoal } from "@/lib/db/mappers";
import type { Goal } from "@/lib/types";

import { dateInputToDate } from "@/lib/expenses/schema";
import type { GoalFormValues } from "./schema";

/** Goal repository. Every query is scoped to the signed-in user. */

export async function listGoals(userId: string): Promise<Goal[]> {
  const prisma = await getDb();
  const records = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { deadline: "asc" }],
  });
  return records.map(toGoal);
}

function fieldsFromForm(values: GoalFormValues) {
  return {
    title: values.title,
    description: values.description,
    category: values.category,
    current: values.current,
    target: values.target,
    unit: values.unit,
    deadline: dateInputToDate(values.deadline),
    status: goalStatusToDb(values.status),
  };
}

export async function createGoal(
  userId: string,
  values: GoalFormValues,
): Promise<Goal> {
  const prisma = await getDb();
  const record = await prisma.goal.create({
    data: { userId, ...fieldsFromForm(values) },
  });
  return toGoal(record);
}

export async function updateGoal(
  userId: string,
  id: string,
  values: GoalFormValues,
): Promise<Goal | null> {
  const prisma = await getDb();
  const existing = await prisma.goal.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) return null;

  const record = await prisma.goal.update({
    where: { id: existing.id },
    data: fieldsFromForm(values),
  });
  return toGoal(record);
}

export async function removeGoal(userId: string, id: string): Promise<boolean> {
  const prisma = await getDb();
  const result = await prisma.goal.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

/** Quick progress bump used by the goal card controls. */
export async function incrementGoal(
  userId: string,
  id: string,
  amount: number,
): Promise<Goal | null> {
  if (!Number.isInteger(amount) || amount === 0) return null;

  const prisma = await getDb();
  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const nextValue = Math.max(0, existing.current + amount);
  const record = await prisma.goal.update({
    where: { id: existing.id },
    data: {
      current: nextValue,
      status:
        nextValue >= existing.target && existing.status === "active"
          ? "completed"
          : existing.status,
    },
  });
  return toGoal(record);
}
