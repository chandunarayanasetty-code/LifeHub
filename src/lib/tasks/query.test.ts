import { describe, expect, it } from "vitest";

import {
  buildTasksHref,
  countTasks,
  hasActiveFilters,
  matchesTaskFilters,
  matchesTaskStatus,
  parseTaskQuery,
  sortTasks,
} from "@/lib/tasks/query";
import { makeTask } from "@/test/fixtures";

const tasks = [
  makeTask({
    id: "a",
    title: "Submit taxes",
    category: "Finance",
    priority: "critical",
    status: "todo",
    dueDate: new Date(2026, 2, 12, 9).toISOString(),
    createdAt: new Date(2026, 2, 1, 9).toISOString(),
    tags: ["money"],
  }),
  makeTask({
    id: "b",
    title: "Read a chapter",
    category: "Learning",
    priority: "low",
    status: "completed",
    dueDate: new Date(2026, 2, 11, 9).toISOString(),
    createdAt: new Date(2026, 2, 3, 9).toISOString(),
    tags: ["book"],
  }),
  makeTask({
    id: "c",
    title: "Book dentist",
    category: "Health",
    priority: "high",
    status: "in-progress",
    dueDate: new Date(2026, 2, 13, 9).toISOString(),
    createdAt: new Date(2026, 2, 2, 9).toISOString(),
    tags: ["appointment"],
  }),
];

describe("parseTaskQuery", () => {
  it("falls back to defaults for missing or invalid values", () => {
    expect(parseTaskQuery({})).toEqual({
      q: "",
      status: "active",
      priority: "all",
      category: "all",
      sort: "due",
    });

    expect(parseTaskQuery({ status: "nonsense", sort: "nonsense" })).toMatchObject(
      { status: "active", sort: "due" },
    );
  });

  it("accepts valid values and trims whitespace", () => {
    const query = parseTaskQuery({
      q: "  taxes  ",
      status: "completed",
      priority: "critical",
      category: " Finance ",
      sort: "priority",
    });

    expect(query).toEqual({
      q: "taxes",
      status: "completed",
      priority: "critical",
      category: "Finance",
      sort: "priority",
    });
  });

  it("uses the first value when a param repeats", () => {
    expect(parseTaskQuery({ status: ["todo", "completed"] }).status).toBe("todo");
  });

  it("caps very long search terms", () => {
    expect(parseTaskQuery({ q: "x".repeat(400) }).q).toHaveLength(120);
  });
});

describe("task filtering", () => {
  it("matches status tabs including the combined active tab", () => {
    const active = parseTaskQuery({ status: "active" });
    expect(tasks.filter((task) => matchesTaskStatus(task, active))).toHaveLength(2);

    const completed = parseTaskQuery({ status: "completed" });
    expect(tasks.filter((task) => matchesTaskStatus(task, completed))).toHaveLength(1);
  });

  it("searches across title, tags, category and priority", () => {
    const byTag = parseTaskQuery({ q: "appointment" });
    expect(tasks.filter((task) => matchesTaskFilters(task, byTag))).toHaveLength(1);

    const byCategory = parseTaskQuery({ q: "finance" });
    expect(tasks.filter((task) => matchesTaskFilters(task, byCategory))).toHaveLength(1);

    const byPriority = parseTaskQuery({ q: "critical" });
    expect(tasks.filter((task) => matchesTaskFilters(task, byPriority))).toHaveLength(1);
  });

  it("requires every search term to match", () => {
    const query = parseTaskQuery({ q: "book taxes" });
    expect(tasks.filter((task) => matchesTaskFilters(task, query))).toHaveLength(0);
  });

  it("filters by priority and category together", () => {
    const query = parseTaskQuery({ priority: "high", category: "Health" });
    expect(tasks.filter((task) => matchesTaskFilters(task, query))).toHaveLength(1);
  });
});

describe("sortTasks", () => {
  it("does not mutate the input array", () => {
    const copy = [...tasks];
    sortTasks(tasks, "title");
    expect(tasks).toEqual(copy);
  });

  it("sorts by due date with a title tie-breaker", () => {
    expect(sortTasks(tasks, "due").map((task) => task.id)).toEqual(["b", "a", "c"]);
  });

  it("sorts by newest created first", () => {
    expect(sortTasks(tasks, "created").map((task) => task.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by priority then due date", () => {
    expect(sortTasks(tasks, "priority").map((task) => task.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts titles alphabetically", () => {
    expect(sortTasks(tasks, "title").map((task) => task.title)).toEqual([
      "Book dentist",
      "Read a chapter",
      "Submit taxes",
    ]);
  });
});

describe("countTasks", () => {
  it("counts every status plus the combined active bucket", () => {
    expect(countTasks(tasks)).toEqual({
      all: 3,
      active: 2,
      todo: 1,
      "in-progress": 1,
      completed: 1,
      cancelled: 0,
    });
  });

  it("returns zeroes for an empty list", () => {
    expect(countTasks([])).toMatchObject({ all: 0, active: 0 });
  });
});

describe("hasActiveFilters", () => {
  it("is false for the default view", () => {
    expect(hasActiveFilters(parseTaskQuery({}))).toBe(false);
  });

  it("is true when any filter or sort differs", () => {
    expect(hasActiveFilters(parseTaskQuery({ q: "tax" }))).toBe(true);
    expect(hasActiveFilters(parseTaskQuery({ sort: "title" }))).toBe(true);
    expect(hasActiveFilters(parseTaskQuery({ category: "Work" }))).toBe(true);
  });
});

describe("buildTasksHref", () => {
  const base = parseTaskQuery({ q: "tax" });

  it("omits defaults and keeps the search term", () => {
    expect(buildTasksHref(base)).toBe("/tasks?q=tax");
  });

  it("applies overrides, including returning to defaults", () => {
    expect(buildTasksHref(base, { status: "completed" })).toBe(
      "/tasks?q=tax&status=completed",
    );
    expect(buildTasksHref(base, { q: "" })).toBe("/tasks");
  });

  it("encodes user input", () => {
    expect(buildTasksHref(parseTaskQuery({ q: "a & b" }))).toBe(
      "/tasks?q=a+%26+b",
    );
  });
});
