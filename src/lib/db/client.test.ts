import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDatabase, type Database } from "@/lib/db/client";

/**
 * Regression test for a fresh checkout.
 *
 * `.data` is gitignored, so the embedded database's parent directory does not
 * exist on a clean clone. PGlite creates its own data directory but not missing
 * parents, which used to make the first request fail with ENOENT and left CI
 * showing a server that never became healthy.
 */

let root: string;
let dataDirectory: string;
let database: Database;

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "lifehub-client-"));
  // Neither `nested` nor `pglite` exists yet, mirroring a fresh clone.
  dataDirectory = path.join(root, "nested", "pglite");

  database = await createDatabase({
    databaseUrl: "",
    dataDirectory,
    seedDemo: false,
  });
});

afterAll(async () => {
  await database.prisma.$disconnect();
  await database.pglite?.close();
  await rm(root, { recursive: true, force: true });
});

describe("embedded database directory", () => {
  it("creates missing parent directories", async () => {
    const info = await stat(dataDirectory);
    expect(info.isDirectory()).toBe(true);
  });

  it("is usable straight away", async () => {
    const rows = await database.prisma.$queryRaw<{ ok: number }[]>`
      SELECT 1 AS ok
    `;
    expect(Number(rows[0]?.ok)).toBe(1);
  });
});
