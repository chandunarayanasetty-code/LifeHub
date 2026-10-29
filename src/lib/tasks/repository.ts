import { randomUUID } from "node:crypto";

import type { Task, TaskStatus } from "@/lib/types";

import { normalizeTags, type TaskFormValues } from "./schema";
import {
  readTasks,
  resetTasks as resetStoredTasks,
  updateTasks,
} from "./store";

/**
 * Task repository — the only place that knows how tasks are stored.
 *
 * Pages and server actions call these functions. When Phase 3 swaps the JSON
 * file for Prisma, this file changes and the UI does not.
 */

function completedAtFor(
  existing: Pick<Task, "status" | "completedAt"> | undefined,
  nextStatus: TaskStatus,
  now: string,
): string | undefined {
  if (nextStatus !== "completed") {
    return undefined;
  }

  if (existing?.status === "completed" && existing.completedAt) {
    return existing.completedAt;
  }

  return existing?.completedAt ?? now;
}

function fieldsFromForm(values: TaskFormValues) {
  return {
    title: values.title,
    description: values.description,
    status: values.status,
    priority: values.priority,
    category: values.category,
    tags: normalizeTags(values.tags ?? ""),
    dueDate: new Date(values.dueDate).toISOString(),
  };
}

export function listTasks(): Promise<Task[]> {
  return readTasks();
}

export async function getTaskCategories(): Promise<string[]> {
  const tasks = await readTasks();
  return [...new Set(tasks.map((task) => task.category))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function createTask(values: TaskFormValues): Promise<Task> {
  const now = new Date().toISOString();
  const task: Task = {
    id: `task-${randomUUID()}`,
    ...fieldsFromForm(values),
    createdAt: now,
    completedAt: completedAtFor(undefined, values.status, now),
  };

  return updateTasks((tasks) => {
    tasks.unshift(task);
    return task;
  });
}

export function updateTask(
  id: string,
  values: TaskFormValues,
): Promise<Task | null> {
  const now = new Date().toISOString();

  return updateTasks((tasks) => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;

    const existing = tasks[index];
    const updated: Task = {
      ...existing,
      ...fieldsFromForm(values),
      completedAt: completedAtFor(existing, values.status, now),
    };

    tasks[index] = updated;
    return updated;
  });
}

export function setTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<Task | null> {
  const now = new Date().toISOString();

  return updateTasks((tasks) => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;

    const existing = tasks[index];
    const updated: Task = {
      ...existing,
      status,
      completedAt: completedAtFor(existing, status, now),
    };

    tasks[index] = updated;
    return updated;
  });
}

export function removeTask(id: string): Promise<boolean> {
  return updateTasks((tasks) => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return false;

    tasks.splice(index, 1);
    return true;
  });
}

export function resetTasks(): Promise<Task[]> {
  return resetStoredTasks();
}
