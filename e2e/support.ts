import { expect, type Page } from "@playwright/test";

/**
 * Shared helpers for the end-to-end suite.
 *
 * These live outside the spec so the tests read as user stories rather than
 * browser plumbing.
 */

export const DEMO_EMAIL = "demo@lifehub.app";
export const DEMO_PASSWORD = "lifehub-demo-2026";
export const TEST_PASSWORD = "e2e-password-2026";

/** A fresh address per run: the embedded database survives between runs. */
export function uniqueEmail(): string {
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `e2e-${stamp}-${random}@lifehub.test`;
}

/**
 * Wait until React has hydrated the page.
 *
 * Playwright can click a server-rendered button before the browser attaches its
 * event handlers, and the click is silently lost. `HydrationMarker` sets this
 * attribute from a `useEffect`, so it is a real readiness signal rather than a
 * guessed timeout.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page
    .locator('html[data-hydrated="true"]')
    .waitFor({ state: "attached" });
}

/** Navigate and wait for the app to become interactive. */
export async function gotoApp(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForHydration(page);
}

export async function signInAsDemo(page: Page): Promise<void> {
  await gotoApp(page, "/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/** Create an empty account and land on its dashboard. */
export async function registerNewAccount(
  page: Page,
  name: string,
): Promise<string> {
  const email = uniqueEmail();

  await gotoApp(page, "/register");
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await page.getByLabel("Confirm password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/$/);
  await waitForHydration(page);

  return email;
}
