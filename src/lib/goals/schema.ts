import { z } from "zod";

import type { FormActionState } from "@/lib/form-utils";
import type { GoalStatus } from "@/lib/types";

export const GOAL_STATUSES = ["active", "completed", "archived"] as const;

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const goalStatusSchema = z.enum(GOAL_STATUSES);

const wholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .regex(/^\d{1,9}$/, "Use a whole number.")
    .transform((value) => Number(value));

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime());
}

export const goalFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(120, "Keep the title under 120 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description under 1,000 characters."),
  category: z
    .string()
    .trim()
    .min(1, "Choose or type a category.")
    .max(40, "Keep the category under 40 characters."),
  current: wholeNumber("the current value"),
  target: wholeNumber("the target")
    .refine((value) => value >= 1, "The target must be at least 1."),
  unit: z
    .string()
    .trim()
    .max(20, "Keep the unit under 20 characters."),
  deadline: z
    .string()
    .trim()
    .min(1, "Choose a deadline.")
    .refine(isValidDateInput, "Enter a valid deadline."),
  status: goalStatusSchema,
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;

export type GoalActionState = FormActionState;
export const initialGoalActionState: GoalActionState = { status: "idle" };

export function goalProgress(current: number, target: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, current / target));
}
