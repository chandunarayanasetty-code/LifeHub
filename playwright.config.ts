import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests.
 *
 * The app is started on port 3100 so a normal `npm run dev` on 3000 does not
 * clash. Locally Playwright reuses an existing server on that port and runs the
 * dev server, which keeps feedback fast. CI tests a real production build with
 * `next start`, because that is the artifact that gets deployed — and because a
 * production server has no on-demand compiler or file watcher to slow the first
 * request down.
 */

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Locally we use the installed Chrome channel; CI installs Chromium.
        channel: process.env.PLAYWRIGHT_CHANNEL ?? (isCI ? undefined : "chrome"),
      },
    },
  ],

  webServer: {
    command: isCI
      ? `npm run build && npm run start -- -p ${PORT}`
      : `npm run dev -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    // A cold CI build plus Chromium startup can take a few minutes.
    timeout: isCI ? 420_000 : 180_000,
    env: {
      // Keep the embedded database local and make sure the demo account exists.
      DATABASE_URL: "",
      // A separate directory so E2E never opens the same PGlite files as a
      // running `npm run dev`. PGlite is single-process.
      LIFEHUB_DATA_DIR: ".data/pglite-e2e",
      // CI serves a production build over plain HTTP, where Secure cookies are
      // rejected by the browser. This is the documented test-only escape hatch.
      ...(isCI ? { LIFEHUB_ALLOW_INSECURE_COOKIES: "true" } : {}),
    },
  },
});
