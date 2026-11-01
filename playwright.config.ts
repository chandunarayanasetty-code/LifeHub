import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests.
 *
 * The app is started on port 3100 so a normal `npm run dev` on 3000 does not
 * clash. Playwright reuses an existing server locally, but always starts a
 * fresh production build in CI.
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
    // Dev mode keeps Secure cookies off (they need HTTPS in a real production
    // deployment) so the browser can sign in over plain HTTP locally and in CI.
    command: `npm run dev -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    env: {
      // Keep the embedded database local and make sure the demo account exists.
      DATABASE_URL: "",
      // A separate directory so E2E never opens the same PGlite files as a
      // running `npm run dev`. PGlite is single-process.
      LIFEHUB_DATA_DIR: ".data/pglite-e2e",
    },
  },
});
