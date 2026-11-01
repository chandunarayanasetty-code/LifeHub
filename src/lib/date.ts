/**
 * Small, timezone-aware date helpers.
 *
 * We deliberately avoid heavy date libraries. All helpers operate on the
 * server's local time and return either Date objects or "YYYY-MM-DD" keys,
 * which keeps comparisons stable across daylight-saving changes.
 */

export function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function addDays(value: Date, amount: number): Date {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

export function addMonths(value: Date, amount: number): Date {
  const date = new Date(value);
  const targetDay = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  // Clamp to the last valid day, e.g. Jan 31 + 1 month -> Feb 28/29.
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(targetDay, lastDay));
  return date;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Local date key in the form YYYY-MM-DD (never UTC-shifted). */
export function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse a local YYYY-MM-DD key into a Date at local midnight. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfWeek(value: Date): Date {
  const date = startOfDay(value);
  // Week starts on Monday. getDay(): Sunday = 0, Monday = 1.
  const offset = (date.getDay() + 6) % 7;
  return addDays(date, -offset);
}

export function endOfWeek(value: Date): Date {
  return addDays(startOfWeek(value), 6);
}

export function isWithinRange(
  value: Date,
  start: Date,
  end: Date,
): boolean {
  return value >= start && value <= end;
}

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor <= last) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function getLastNDays(count: number, now = new Date()): Date[] {
  const end = startOfDay(now);
  return Array.from({ length: count }, (_, index) =>
    addDays(end, index - (count - 1)),
  );
}
