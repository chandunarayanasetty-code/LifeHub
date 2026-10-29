import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { getMockData } from "@/lib/mock-data";
import type { Task } from "@/lib/types";

import { storedTaskSchema } from "./schema";

/**
 * Phase 2 local task storage.
 *
 * Tasks are persisted as JSON in `.data/tasks.json` so the UI survives a
 * server restart. This is intentionally a small, single-user stand-in for a
 * real database:
 *
 * - it is not shared between users,
 * - it is not safe for concurrent multi-instance deployments,
 * - it is ignored by git and lives outside the source tree.
 *
 * Phase 3 replaces this module with Prisma/PostgreSQL. The repository layer
 * (`repository.ts`) is the only consumer, so pages and actions stay unchanged.
 */

const DATA_DIRECTORY = path.join(process.cwd(), ".data");
const TASKS_FILE = path.join(DATA_DIRECTORY, "tasks.json");
const taskListSchema = z.array(storedTaskSchema);

/**
 * Serializes reads and writes inside this Node process. Two server actions
 * arriving at the same time cannot interleave their read-modify-write cycle.
 * A real database handles this with transactions.
 */
let operationQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const result = operationQueue.then(operation, operation);
  operationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function writeTasksFile(tasks: Task[]): Promise<void> {
  // Validate before writing so a programming mistake never corrupts the file.
  const validated = taskListSchema.parse(tasks);
  await mkdir(DATA_DIRECTORY, { recursive: true });

  // Write to a temporary file first, then rename, so a crash mid-write cannot
  // leave a half-written JSON document behind.
  const temporaryFile = `${TASKS_FILE}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  await rename(temporaryFile, TASKS_FILE);
}

async function seedTasksFile(): Promise<Task[]> {
  // The Phase 1 sample tasks become the starting point on first run.
  const tasks = getMockData().tasks;
  await writeTasksFile(tasks);
  return tasks;
}

async function readTasksFromDisk(): Promise<Task[]> {
  let raw: string;

  try {
    raw = await readFile(TASKS_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return seedTasksFile();
    }
    throw error;
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    json = null;
  }

  const parsed = taskListSchema.safeParse(json);
  if (parsed.success) {
    return parsed.data;
  }

  // Never silently throw user data away: keep a copy of the unreadable file,
  // log why, and start again from the sample seed.
  const backupFile = `${TASKS_FILE}.corrupt-${Date.now()}.json`;
  await rename(TASKS_FILE, backupFile).catch(() => undefined);
  console.error(
    `[tasks] ${TASKS_FILE} could not be read. Backed it up to ${backupFile} and reseeded.`,
    parsed.error.issues,
  );
  return seedTasksFile();
}

/** Read every task. Seeds the file on first run. */
export function readTasks(): Promise<Task[]> {
  return enqueue(readTasksFromDisk);
}

/**
 * Read, mutate, validate and persist the task list as one serialized
 * operation. `mutator` receives the array and may change it in place.
 */
export function updateTasks<T>(
  mutator: (tasks: Task[]) => T | Promise<T>,
): Promise<T> {
  return enqueue(async () => {
    const tasks = await readTasksFromDisk();
    const result = await mutator(tasks);
    await writeTasksFile(tasks);
    return result;
  });
}

/** Replace the stored tasks with a fresh sample seed. */
export function resetTasks(): Promise<Task[]> {
  return enqueue(seedTasksFile);
}
