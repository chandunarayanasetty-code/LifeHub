import { z } from "zod";

import type { FormActionState } from "@/lib/form-utils";
import type { HabitFrequency } from "@/lib/types";

export const HABIT_ICONS = [
  "activity",
  "book",
  "droplets",
  "code",
  "brain",
] as const;

export const HABIT_FREQUENCIES = ["daily", "weekly"] as const;

export const ACCENT_COLORS = [
  "violet",
  "emerald",
  "amber",
  "sky",
  "rose",
] as const;

export const HABIT_ICON_LABELS: Record<(typeof HABIT_ICONS)[number], string> = {
  activity: "Movement",
  book: "Reading",
  droplets: "Water",
  code: "Learning",
  brain: "Mindfulness",
};

export const HABIT_FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: "Every day",
  weekly: "Weekly target",
};

export const ACCENT_COLOR_LABELS: Record<(typeof ACCENT_COLORS)[number], string> = {
  violet: "Violet",
  emerald: "Emerald",
  amber: "Amber",
  sky: "Sky",
  rose: "Rose",
};

export const habitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(60, "Keep the name under 60 characters."),
  icon: z.enum(HABIT_ICONS),
  frequency: z.enum(HABIT_FREQUENCIES),
  color: z.enum(ACCENT_COLORS),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;

export type HabitActionState = FormActionState;
export const initialHabitActionState: HabitActionState = { status: "idle" };

/** Local calendar day in YYYY-MM-DD form, validated as a real date. */
export const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid day.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Invalid day.");
