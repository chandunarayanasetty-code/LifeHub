import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { PGlite } from "@electric-sql/pglite";

/**
 * Local migration runner.
 *
 * `prisma migrate deploy` needs a TCP PostgreSQL connection, but the local
 * development database is embedded (PGlite). This runner applies the exact same
 * SQL files that Prisma generated, in filename order, and records each one.
 *
 * Production never uses this: there, `prisma migrate deploy` runs against the
 * real PostgreSQL database.
 */

const MIGRATIONS_TABLE = "_lifehub_migrations";

export const MIGRATIONS_DIRECTORY = path.join(
  process.cwd(),
  "prisma",
  "migrations",
);

async function listMigrationNames(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export async function applyLocalMigrations(
  db: PGlite,
  directory = MIGRATIONS_DIRECTORY,
): Promise<string[]> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" (
      "name" text PRIMARY KEY,
      "appliedAt" timestamptz NOT NULL DEFAULT now()
    );
  `);

  const applied: string[] = [];
  let names: string[];

  try {
    names = await listMigrationNames(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return applied;
    throw error;
  }

  const existing = await db.query<{ name: string }>(
    `SELECT "name" FROM "${MIGRATIONS_TABLE}"`,
  );
  const done = new Set(existing.rows.map((row) => row.name));

  for (const name of names) {
    if (done.has(name)) continue;

    const sql = await readFile(path.join(directory, name, "migration.sql"), "utf8");

    await db.transaction(async (tx) => {
      await tx.exec(sql);
      await tx.query(
        `INSERT INTO "${MIGRATIONS_TABLE}" ("name") VALUES ($1)`,
        [name],
      );
    });

    applied.push(name);
  }

  return applied;
}
