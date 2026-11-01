import { getDb } from "@/lib/db/client";
import { taskStatusFromDb, taskStatusToDb, toTask } from "@/lib/db/mappers";
import { getMockData } from "@/lib/mock-data";
import type { Task, TaskStatus } from "@/lib/types";

import { normalizeTags, type TaskFormValues } from "./schema";

/**
 * Task repository — the only module that knows how tasks are stored.
 *
 * Every function takes the signed-in user's id and includes it in the query, so
 * one account can never read or mutate another account's rows. Pages and server
 * actions never touch Prisma directly.
 */

function completedAtFor(
  existing: Pick<Task, "status" | "completedAt"> | undefined,
  nextStatus: TaskStatus,
  now: Date,
): Date | null {
  if (nextStatus !== "completed") return null;
  if (existing?.status === "completed" && existing.completedAt) {
    return new Date(existing.completedAt);
  }
  return existing?.completedAt ? new Date(existing.completedAt) : now;
}

function fieldsFromForm(values: TaskFormValues) {
  return {
    title: values.title,
    description: values.description,
    status: taskStatusToDb(values.status),
    priority: values.priority,
    category: values.category,
    tags: normalizeTags(values.tags ?? ""),
    dueDate: new Date(values.dueDate),
  };
}

export async function listTasks(userId: string): Promise<Task[]> {
  const prisma = await getDb();
  const records = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
  });
  return records.map(toTask);
}

export async function getTask(userId: string, id: string): Promise<Task | null> {
  const prisma = await getDb();
  const record = await prisma.task.findFirst({ where: { id, userId } });
  return record ? toTask(record) : null;
}

export async function getTaskCategories(userId: string): Promise<string[]> {
  const prisma = await getDb();
  const records = await prisma.task.findMany({
    where: { userId },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return records.map((record) => record.category);
}

export async function createTask(
  userId: string,
  values: TaskFormValues,
): Promise<Task> {
  const prisma = await getDb();
  const record = await prisma.task.create({
    data: {
      userId,
      ...fieldsFromForm(values),
      completedAt: completedAtFor(undefined, values.status, new Date()),
    },
  });
  return toTask(record);
}

export async function updateTask(
  userId: string,
  id: string,
  values: TaskFormValues,
): Promise<Task | null> {
  const prisma = await getDb();
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const record = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...fieldsFromForm(values),
      completedAt: completedAtFor(
        {
          status: taskStatusFromDb(existing.status),
          completedAt: existing.completedAt?.toISOString(),
        },
        values.status,
        new Date(),
      ),
    },
  });

  return toTask(record);
}

export async function setTaskStatus(
  userId: string,
  id: string,
  status: TaskStatus,
): Promise<Task | null> {
  const prisma = await getDb();
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const record = await prisma.task.update({
    where: { id: existing.id },
    data: {
      status: taskStatusToDb(status),
      completedAt: completedAtFor(
        {
          status: taskStatusFromDb(existing.status),
          completedAt: existing.completedAt?.toISOString(),
        },
        status,
        new Date(),
      ),
    },
  });

  return toTask(record);
}

export async function removeTask(userId: string, id: string): Promise<boolean> {
  const prisma = await getDb();
  const result = await prisma.task.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

/**
 * Replace a user's tasks with fresh sample records.
 *
 * The settings page only offers this for the demo account, so sample rows are
 * never injected into a real workspace without the user asking for it.
 */
export async function resetTasks(userId: string): Promise<Task[]> {
  const prisma = await getDb();
  const sample = getMockData().tasks;

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { userId } }),
    prisma.task.createMany({
      data: sample.map((task) => ({
        userId,
        title: task.title,
        description: task.description,
        status: taskStatusToDb(task.status),
        priority: task.priority,
        category: task.category,
        tags: task.tags,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
      })),
    }),
  ]);

  return listTasks(userId);
}
