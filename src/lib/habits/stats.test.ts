import { describe, expect, it } from "vitest";

import {
  bestStreak,
  currentStreak,
  isCompletedOn,
  lastSevenDays,
  weekSummary,
} from "@/lib/habits/stats";
import { makeHabit } from "@/test/fixtures";

const now = new Date(2026, 4, 14, 18, 0); // Thursday 14 May 2026.

describe("isCompletedOn", () => {
  it("checks the local date key list", () => {
    const habit = makeHabit({ completions: ["2026-05-14", "2026-05-13"] });
    expect(isCompletedOn(habit, "2026-05-14")).toBe(true);
    expect(isCompletedOn(habit, "2026-05-12")).toBe(false);
  });
});

describe("currentStreak", () => {
  it("counts consecutive days ending today", () => {
    const habit = makeHabit({
      completions: ["2026-05-14", "2026-05-13", "2026-05-12", "2026-05-10"],
    });
    expect(currentStreak(habit, now)).toBe(3);
  });

  it("keeps the streak alive when today is not checked in yet", () => {
    const habit = makeHabit({
      completions: ["2026-05-13", "2026-05-12", "2026-05-11"],
    });
    expect(currentStreak(habit, now)).toBe(3);
  });

  it("breaks when the last check-in is older than yesterday", () => {
    const habit = makeHabit({
      completions: ["2026-05-12", "2026-05-11"],
    });
    expect(currentStreak(habit, now)).toBe(0);
  });

  it("returns zero for a habit with no check-ins", () => {
    expect(currentStreak(makeHabit(), now)).toBe(0);
  });

  it("handles a streak crossing a month boundary", () => {
    const habit = makeHabit({
      completions: ["2026-05-01", "2026-04-30", "2026-04-29"],
    });
    expect(currentStreak(habit, new Date(2026, 4, 1, 8))).toBe(3);
  });
});

describe("bestStreak", () => {
  it("finds the longest run even when it is not current", () => {
    const habit = makeHabit({
      completions: [
        "2026-01-01",
        "2026-01-02",
        "2026-01-03",
        "2026-01-04",
        "2026-02-01",
        "2026-02-02",
      ],
    });
    expect(bestStreak(habit)).toBe(4);
  });

  it("ignores duplicate keys", () => {
    const habit = makeHabit({
      completions: ["2026-01-01", "2026-01-01", "2026-01-02"],
    });
    expect(bestStreak(habit)).toBe(2);
  });

  it("returns zero for no check-ins", () => {
    expect(bestStreak(makeHabit())).toBe(0);
  });
});

describe("weekSummary", () => {
  it("counts only the last seven days and never divides by zero", () => {
    expect(weekSummary([], now)).toEqual({
      checkIns: 0,
      possible: 0,
      rate: 0,
    });

    const habits = [
      makeHabit({
        completions: ["2026-05-14", "2026-05-13", "2026-04-01"],
      }),
      makeHabit({
        id: "habit-2",
        completions: ["2026-05-12", "2026-05-10", "2026-05-09"],
      }),
    ];

    const summary = weekSummary(habits, now);
    expect(summary.checkIns).toBe(5);
    expect(summary.possible).toBe(14);
    expect(summary.rate).toBeCloseTo(5 / 14);
  });
});

describe("lastSevenDays", () => {
  it("returns seven day keys, oldest first, ending today", () => {
    expect(lastSevenDays(now)).toEqual([
      "2026-05-08",
      "2026-05-09",
      "2026-05-10",
      "2026-05-11",
      "2026-05-12",
      "2026-05-13",
      "2026-05-14",
    ]);
  });
});
