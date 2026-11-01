import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  endOfDay,
  fromDateKey,
  getLastNDays,
  isSameDay,
  isWithinRange,
  startOfDay,
  startOfWeek,
  toDateKey,
} from "@/lib/date";

const base = new Date(2026, 4, 14, 15, 42, 7); // Thursday 14 May 2026, local time.

describe("date helpers", () => {
  it("starts and ends a day in local time", () => {
    expect(toDateKey(startOfDay(base))).toBe("2026-05-14");
    expect(startOfDay(base).getHours()).toBe(0);
    expect(endOfDay(base).getHours()).toBe(23);
    expect(endOfDay(base).getMinutes()).toBe(59);
  });

  it("adds days across a month boundary", () => {
    expect(toDateKey(addDays(base, 20))).toBe("2026-06-03");
    expect(toDateKey(addDays(base, -14))).toBe("2026-04-30");
  });

  it("clamps month arithmetic to the last valid day", () => {
    const jan31 = new Date(2026, 0, 31);
    expect(toDateKey(addMonths(jan31, 1))).toBe("2026-02-28");
    expect(toDateKey(addMonths(new Date(2024, 0, 31), 1))).toBe("2024-02-29");
  });

  it("compares calendar days, not timestamps", () => {
    expect(isSameDay(base, new Date(2026, 4, 14, 0, 0))).toBe(true);
    expect(isSameDay(base, new Date(2026, 4, 15, 0, 0))).toBe(false);
  });

  it("round-trips a date key without shifting the day", () => {
    expect(toDateKey(fromDateKey("2026-05-14"))).toBe("2026-05-14");
  });

  it("starts the week on Monday", () => {
    expect(toDateKey(startOfWeek(base))).toBe("2026-05-11");
    expect(toDateKey(startOfWeek(new Date(2026, 4, 17)))).toBe("2026-05-11");
  });

  it("returns the last N days oldest first", () => {
    const days = getLastNDays(3, base).map(toDateKey);
    expect(days).toEqual(["2026-05-12", "2026-05-13", "2026-05-14"]);
  });

  it("includes both ends of a range", () => {
    const start = startOfDay(base);
    const end = endOfDay(addDays(base, 1));
    expect(isWithinRange(base, start, end)).toBe(true);
    expect(isWithinRange(start, start, end)).toBe(true);
    expect(isWithinRange(addDays(end, 1), start, end)).toBe(false);
  });
});
