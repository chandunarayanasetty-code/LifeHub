import { z } from "zod";

import type { TaskPriority, TaskStatus } from "@/lib/types";

/**
 * Task validation shared by server actions and forms.
 *
 * Keeping the rules here means the browser and the server agree on what a
 * valid task looks like. The server always re-validates; the form hints are
 * only a convenience.
 */

export const TASK_STATUSES = [
  "todo",
  "in-progress",
  "completed",
  "cancelled",
] as const;

export const TASK_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function normalizeTags(raw: string): string[] {
  const tags = raw
    .split(",")
    .map((tag) => tag.trim().replace(/^#/, "").replace(/\s+/g, " ").toLowerCase())
    .filter(Boolean);

  return [...new Set(tags)];
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

/** Shape of a record as stored in the local JSON file. */
export const storedTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(160),
  description: z.string().max(2000),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  category: z.string().min(1).max(60),
  tags: z.array(z.string().min(1).max(24)),
  dueDate: z.string().refine(isValidDate, "Invalid due date"),
  createdAt: z.string().refine(isValidDate, "Invalid creation date"),
  completedAt: z.string().refine(isValidDate, "Invalid completion date").optional(),
});

/** Incoming values from the create/edit form. */
export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(120, "Keep the title under 120 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description under 1,000 characters."),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  category: z
    .string()
    .trim()
    .min(1, "Choose or type a category.")
    .max(40, "Keep the category under 40 characters."),
  dueDate: z
    .string()
    .trim()
    .min(1, "Choose a due date.")
    .refine(isValidDate, "Enter a valid date and time."),
  tags: z
    .string()
    .max(400, "That is too many tags.")
    .optional()
    .default("")
    .refine(
      (value) => normalizeTags(value).length <= 8,
      "Use 8 tags or fewer.",
    )
    .refine(
      (value) => normalizeTags(value).every((tag) => tag.length <= 24),
      "Each tag must be 24 characters or fewer.",
    ),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

/** Convert an ISO timestamp into the value a datetime-local input expects. */
export function toDateTimeLocalValue(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Default due date for a new task: today at 5:00 PM local time. */
export function defaultDueDateValue(now = new Date()): string {
  const date = new Date(now);
  date.setHours(17, 0, 0, 0);
  return toDateTimeLocalValue(date.toISOString());
}
