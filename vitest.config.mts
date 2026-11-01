import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit and integration tests.
 *
 * These run in Node (no DOM) because the logic under test is plain TypeScript:
 * date helpers, query parsing, statistics, report aggregation, password hashing
 * and database migrations. Browser behaviour is covered by Playwright in `e2e/`.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", ".next", "e2e"],
    // PGlite and Prisma are slow to boot once; keep the default generous.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
