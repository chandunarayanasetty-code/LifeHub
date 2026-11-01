import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { seedDemoWorkspace } from "../src/lib/db/seed";

/**
 * Create the demo account in a real PostgreSQL database.
 *
 *     DATABASE_URL="postgresql://..." npm run db:seed
 *
 * The embedded local database seeds itself at startup, so this script is only
 * needed when you point the app at a hosted PostgreSQL instance. The demo user
 * is created with `isDemo: true`, which makes the interface label every figure
 * as sample data. Nothing happens if any other user already exists.
 */
async function main() {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    console.error(
      "DATABASE_URL is not set. Leave it unset to use the embedded local database, which seeds itself.",
    );
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

  try {
    const created = await seedDemoWorkspace(prisma);
    console.log(
      created
        ? "Demo workspace created (demo@lifehub.app / lifehub-demo-2026)."
        : "Skipped: the demo account already exists or this database has other users.",
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
