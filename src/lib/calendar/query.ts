import { addDays, addMonths, startOfDay, toDateKey } from "@/lib/date";
import type { CalendarEvent, Task } from "@/lib/types";

/**
 * Calendar month helpers.
 *
 * Everything is computed in the server's local time zone and expressed as
 * `YYYY-MM-DD` keys, so a month grid never shifts because of UTC conversion.
 */

export interface CalendarMonth {
  /** YYYY-MM */
  key: string;
  label: string;
  /** First day of the month. */
  start: Date;
  /** Last day of the month. */
  end: Date;
  /** Six weeks of days, each week starting on `weekStartsOn`. */
  weeks: Date[][];
}

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

export function toMonthKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(value: string | undefined): Date | null {
  if (!value || !MONTH_KEY_PATTERN.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12) return null;
  const date = new Date(year, month - 1, 1);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function resolveMonth(
  value: string | undefined,
  now = new Date(),
): Date {
  return parseMonthKey(value) ?? new Date(now.getFullYear(), now.getMonth(), 1);
}

export function shiftMonth(month: Date, amount: number): string {
  return toMonthKey(addMonths(month, amount));
}

export function monthLabel(month: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(month);
}

export function buildCalendarMonth(
  month: Date,
  weekStartsOn: 0 | 1 = 1,
): CalendarMonth {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Offset of the first day from the desired week start.
  const offset = (start.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(start, -offset);

  const weeks: Date[][] = [];
  let cursor = gridStart;

  // Always render six rows so the layout does not jump between months.
  for (let week = 0; week < 6; week += 1) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day += 1) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(days);
  }

  return { key: toMonthKey(start), label: monthLabel(start), start, end, weeks };
}

export function weekdayLabels(weekStartsOn: 0 | 1 = 1): string[] {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const sunday = new Date(2026, 0, 4); // A known Sunday.
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(addDays(sunday, (index + weekStartsOn) % 7)),
  );
}

/** Group events by their local start date key, sorted by start time. */
export function groupEventsByDay(
  events: CalendarEvent[],
): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const key = toDateKey(new Date(event.start));
    grouped.set(key, [...(grouped.get(key) ?? []), event]);
  }

  for (const list of grouped.values()) {
    list.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  }

  return grouped;
}

/** Group open tasks by their local due date. */
export function groupTasksByDay(tasks: Task[]): Map<string, Task[]> {
  const grouped = new Map<string, Task[]>();

  for (const task of tasks) {
    if (task.status === "completed" || task.status === "cancelled") continue;
    const key = toDateKey(new Date(task.dueDate));
    grouped.set(key, [...(grouped.get(key) ?? []), task]);
  }

  return grouped;
}

export function eventsInMonth(
  events: CalendarEvent[],
  month: Date,
): CalendarEvent[] {
  const start = startOfDay(month).getTime();
  const end = addMonths(startOfDay(month), 1).getTime();
  return events.filter((event) => {
    const time = new Date(event.start).getTime();
    return time >= start && time < end;
  });
}

export function eventDurationMinutes(event: CalendarEvent): number {
  const diff = new Date(event.end).getTime() - new Date(event.start).getTime();
  return Math.max(0, Math.round(diff / 60_000));
}

export const EVENT_COLOR_STYLES: Record<
  CalendarEvent["color"],
  { dot: string; chip: string; block: string }
> = {
  violet: {
    dot: "bg-violet-500",
    chip: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    block: "border-l-violet-500 bg-violet-500/10",
  },
  emerald: {
    dot: "bg-emerald-500",
    chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    block: "border-l-emerald-500 bg-emerald-500/10",
  },
  amber: {
    dot: "bg-amber-500",
    chip: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    block: "border-l-amber-500 bg-amber-500/10",
  },
  sky: {
    dot: "bg-sky-500",
    chip: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    block: "border-l-sky-500 bg-sky-500/10",
  },
  rose: {
    dot: "bg-rose-500",
    chip: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    block: "border-l-rose-500 bg-rose-500/10",
  },
};
