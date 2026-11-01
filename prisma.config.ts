import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration.
 *
 * Prisma Migrate and `prisma studio` need a TCP PostgreSQL URL. The app itself
 * does not: without DATABASE_URL it uses an embedded PGlite database and applies
 * the same migration files from `prisma/migrations` at startup.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
