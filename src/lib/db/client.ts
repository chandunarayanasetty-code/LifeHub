import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPGlite } from "pglite-prisma-adapter";

import { PrismaClient } from "@/generated/prisma/client";
import { applyLocalMigrations } from "@/lib/db/migrate";
import { seedDemoWorkspace } from "@/lib/db/seed";

/**
 * Database entry point.
 *
 * Two supported modes:
 *
 * 1. `DATABASE_URL` points at PostgreSQL (production, CI, or a locally
 *    installed server). Prisma connects with the `pg` driver adapter and
 *    migrations are applied by `prisma migrate deploy`.
 *
 * 2. No `DATABASE_URL`. The app runs an embedded PostgreSQL build (PGlite) in
 *    `.data/pglite`, applies the same migration files at startup, and seeds a
 *    clearly labelled demo workspace outside production. This makes the project
 *    runnable with zero external services, but the embedded database is
 *    single-process and must not be used for a multi-instance deployment.
 */

export interface DatabaseOptions {
  databaseUrl?: string;
  /** Where the embedded database stores its files. */
  dataDirectory?: string;
  /** Set to false in tests that want an empty database. */
  seedDemo?: boolean;
  /** Apply embedded migrations (default true). */
  migrate?: boolean;
}

export interface Database {
  prisma: PrismaClient;
  /** Present only when the embedded database is in use. */
  pglite: PGlite | null;
  mode: "postgres" | "embedded";
}

export const DEFAULT_DATA_DIRECTORY = path.join(
  process.cwd(),
  ".data",
  "pglite",
);

function normalizeUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  return trimmed ? trimmed : undefined;
}

export async function createDatabase(
  options: DatabaseOptions = {},
): Promise<Database> {
  const url = normalizeUrl(options.databaseUrl ?? process.env.DATABASE_URL);

  if (url) {
    if (!/^postgres(ql)?:\/\//i.test(url)) {
      throw new Error(
        "DATABASE_URL must start with postgresql:// or postgres://. Leave it unset to use the embedded local database.",
      );
    }

    const prisma = new PrismaClient({ adapter: new PrismaPg(url) });
    return { prisma, pglite: null, mode: "postgres" };
  }

  const dataDirectory =
    options.dataDirectory ??
    process.env.LIFEHUB_DATA_DIR ??
    DEFAULT_DATA_DIRECTORY;
  const pglite = new PGlite(dataDirectory);
  await pglite.waitReady;

  if (options.migrate !== false) {
    await applyLocalMigrations(pglite);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPGlite(pglite) });

  const seedAllowed =
    options.seedDemo !== false &&
    (process.env.NODE_ENV !== "production" ||
      process.env.SEED_DEMO_DATA === "true");

  if (seedAllowed) {
    await seedDemoWorkspace(prisma);
  }

  return { prisma, pglite, mode: "embedded" };
}

interface DatabaseGlobal {
  lifehubDatabase?: Promise<Database>;
}

const globalForDatabase = globalThis as unknown as DatabaseGlobal;

/**
 * One database per server process. In development the promise also survives
 * hot reloads, so migrations and seeding are not repeated on every edit.
 */
export function getDatabase(): Promise<Database> {
  if (!globalForDatabase.lifehubDatabase) {
    globalForDatabase.lifehubDatabase = createDatabase().catch((error) => {
      // Allow a later request to retry instead of caching a rejected promise.
      globalForDatabase.lifehubDatabase = undefined;
      throw error;
    });
  }
  return globalForDatabase.lifehubDatabase;
}

export function getDb(): Promise<PrismaClient> {
  return getDatabase().then((database) => database.prisma);
}

/** Close the embedded database. Used by scripts and integration tests. */
export async function closeDatabase(): Promise<void> {
  const database = await globalForDatabase.lifehubDatabase;
  globalForDatabase.lifehubDatabase = undefined;
  if (!database) return;
  await database.prisma.$disconnect();
  await database.pglite?.close();
}
