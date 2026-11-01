import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  createDatabase,
  type Database,
} from "@/lib/db/client";

/**
 * Database integration test.
 *
 * Boots a real embedded PostgreSQL (PGlite) in memory, applies the exact
 * migration files that production uses, then exercises the Prisma schema. This
 * checks the parts unit tests cannot: SQL validity, relations, unique indexes,
 * cascades, and per-user isolation.
 */

let database: Database;
let aliceId: string;
let bobId: string;

beforeAll(async () => {
  database = await createDatabase({
    databaseUrl: "",
    dataDirectory: "memory://",
    seedDemo: false,
  });

  const alice = await database.prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@example.test",
      passwordHash: "scrypt$test",
    },
    select: { id: true },
  });
  const bob = await database.prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@example.test",
      passwordHash: "scrypt$test",
    },
    select: { id: true },
  });

  aliceId = alice.id;
  bobId = bob.id;
});

afterAll(async () => {
  await database.prisma.$disconnect();
  await database.pglite?.close();
});

const task = {
  title: "Alice only",
  category: "Work",
  dueDate: new Date(2026, 4, 20, 9),
};

describe("embedded database", () => {
  it("reports the embedded mode and applies migrations", async () => {
    expect(database.mode).toBe("embedded");

    const tables = await database.pglite!.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`,
    );
    const names = tables.rows.map((row) => row.table_name);

    expect(names).toContain("users");
    expect(names).toContain("tasks");
    expect(names).toContain("habit_completions");
    expect(names).toContain("_lifehub_migrations");
  });

  it("creates rows and reads them back through Prisma", async () => {
    const created = await database.prisma.task.create({
      data: { ...task, userId: aliceId },
    });

    expect(created.title).toBe("Alice only");
    expect(created.status).toBe("todo");
    expect(created.priority).toBe("medium");
    expect(created.tags).toEqual([]);
    expect(created.completedAt).toBeNull();
  });

  it("keeps each user's rows separate", async () => {
    await database.prisma.task.create({
      data: { title: "Bob only", category: "Personal", dueDate: task.dueDate, userId: bobId },
    });

    const aliceTasks = await database.prisma.task.findMany({
      where: { userId: aliceId },
    });
    const bobTasks = await database.prisma.task.findMany({
      where: { userId: bobId },
    });

    expect(aliceTasks.map((row) => row.title)).toEqual(["Alice only"]);
    expect(bobTasks.map((row) => row.title)).toEqual(["Bob only"]);
  });

  it("refuses a cross-user update when the query includes the owner", async () => {
    const bobTask = await database.prisma.task.findFirstOrThrow({
      where: { userId: bobId },
    });

    // This is the repository pattern: id plus userId, never id alone.
    const result = await database.prisma.task.updateMany({
      where: { id: bobTask.id, userId: aliceId },
      data: { title: "hijacked" },
    });

    expect(result.count).toBe(0);
    const unchanged = await database.prisma.task.findUniqueOrThrow({
      where: { id: bobTask.id },
    });
    expect(unchanged.title).toBe("Bob only");
  });

  it("enforces one check-in per habit per day", async () => {
    const habit = await database.prisma.habit.create({
      data: { userId: aliceId, name: "Walk", completions: { create: { dateKey: "2026-05-14" } } },
      include: { completions: true },
    });

    expect(habit.completions).toHaveLength(1);

    await expect(
      database.prisma.habitCompletion.create({
        data: { habitId: habit.id, dateKey: "2026-05-14" },
      }),
    ).rejects.toThrow();
  });

  it("enforces unique notification dedupe keys per user", async () => {
    const base = {
      title: "Task due",
      description: "Due tomorrow",
      href: "/tasks",
      kind: "deadline" as const,
    };

    await database.prisma.notification.create({
      data: { ...base, userId: aliceId, dedupeKey: "task:1:due" },
    });

    await expect(
      database.prisma.notification.create({
        data: { ...base, userId: aliceId, dedupeKey: "task:1:due" },
      }),
    ).rejects.toThrow();

    // The same key is fine for a different user.
    await expect(
      database.prisma.notification.create({
        data: { ...base, userId: bobId, dedupeKey: "task:1:due" },
      }),
    ).resolves.toBeTruthy();
  });

  it("cascades deletes from the user to owned rows", async () => {
    const carol = await database.prisma.user.create({
      data: {
        name: "Carol",
        email: "carol@example.test",
        passwordHash: "scrypt$test",
      },
    });

    await database.prisma.task.create({
      data: { ...task, title: "Carol task", userId: carol.id },
    });
    await database.prisma.note.create({
      data: { userId: carol.id, title: "Carol note" },
    });

    await database.prisma.user.delete({ where: { id: carol.id } });

    await expect(
      database.prisma.task.count({ where: { userId: carol.id } }),
    ).resolves.toBe(0);
    await expect(
      database.prisma.note.count({ where: { userId: carol.id } }),
    ).resolves.toBe(0);
  });
});
