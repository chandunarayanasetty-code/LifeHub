import { z } from "zod";

import type { FormActionState } from "@/lib/form-utils";

/** Event validation shared by the form and the server action. */

export const EVENT_COLORS = [
  "violet",
  "emerald",
  "amber",
  "sky",
  "rose",
] as const;

export const EVENT_COLOR_LABELS: Record<(typeof EVENT_COLORS)[number], string> = {
  violet: "Violet",
  emerald: "Emerald",
  amber: "Amber",
  sky: "Sky",
  rose: "Rose",
};

export const eventColorSchema = z.enum(EVENT_COLORS);

function isValidDateTime(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Use at least 2 characters.")
      .max(120, "Keep the title under 120 characters."),
    description: z
      .string()
      .trim()
      .max(1000, "Keep the description under 1,000 characters."),
    start: z
      .string()
      .trim()
      .min(1, "Choose a start date and time.")
      .refine(isValidDateTime, "Enter a valid start date and time."),
    end: z
      .string()
      .trim()
      .min(1, "Choose an end date and time.")
      .refine(isValidDateTime, "Enter a valid end date and time."),
    allDay: z.enum(["on", "off"]).optional().default("off"),
    location: z.string().trim().max(120, "Keep the location under 120 characters."),
    color: eventColorSchema,
  })
  .superRefine((values, context) => {
    if (new Date(values.end).getTime() < new Date(values.start).getTime()) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "The end time must be after the start time.",
      });
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export type EventActionState = FormActionState;
export const initialEventActionState: EventActionState = { status: "idle" };

/** `YYYY-MM-DDTHH:mm` for a datetime-local input. */
export function toDateTimeLocalValue(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultEventTimes(now = new Date()): { start: string; end: string } {
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    start: toDateTimeLocalValue(start.toISOString()),
    end: toDateTimeLocalValue(end.toISOString()),
  };
}

/** Apply all-day semantics: local midnight to 23:59 on the chosen day. */
export function resolveEventRange(values: EventFormValues): {
  start: Date;
  end: Date;
  allDay: boolean;
} {
  const allDay = values.allDay === "on";
  const start = new Date(values.start);
  const end = new Date(values.end);

  if (!allDay) return { start, end, allDay };

  const dayStart = new Date(start);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(end);
  dayEnd.setHours(23, 59, 0, 0);

  return {
    start: dayStart,
    end: dayEnd < dayStart ? dayStart : dayEnd,
    allDay,
  };
}
