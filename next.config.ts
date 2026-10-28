import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS v4 is compiled through Turbopack in Next.js 16.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
