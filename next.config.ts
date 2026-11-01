import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The dev server is opened from both `localhost` and `127.0.0.1` (Playwright
   * uses the latter). Next.js blocks dev-only assets for unknown origins, which
   * silently stops client hydration, so both names are allowed here.
   */
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  // Tailwind CSS v4 is compiled through Turbopack in Next.js 16.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  /**
   * The embedded database and its Prisma driver adapters read WASM bundles and
   * files from `node_modules` at runtime. Bundling them breaks Node's fs/path
   * resolution, so Next must load them as regular server packages instead.
   */
  serverExternalPackages: [
    "@electric-sql/pglite",
    "pglite-prisma-adapter",
    "@prisma/adapter-pg",
    "pg",
  ],
};

export default nextConfig;
