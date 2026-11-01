import { expect, test } from "@playwright/test";

import {
  DEMO_EMAIL,
  gotoApp,
  registerNewAccount,
  signInAsDemo,
  waitForHydration,
} from "./support";

/**
 * End-to-end coverage for the flows a real person uses: authentication,
 * per-account task CRUD, responsive layout, and theming.
 *
 * Every test gets a fresh browser context, so sessions never leak between
 * tests.
 */

test.describe("authentication", () => {
  test("protects the workspace and remembers where you were going", async ({
    page,
  }) => {
    await page.goto("/tasks");

    await expect(page).toHaveURL(/\/login\?next=%2Ftasks/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("sends you back to the page you asked for after signing in", async ({
    page,
  }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login\?next=%2Ftasks/);

    await waitForHydration(page);
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill("lifehub-demo-2026");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();
  });

  test("rejects a wrong password without revealing the account", async ({
    page,
  }) => {
    await gotoApp(page, "/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "Email or password is incorrect." }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("the demo account is clearly labelled as sample data", async ({
    page,
  }) => {
    await signInAsDemo(page);

    await expect(
      page.getByText("Sample workspace", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/sample data|sample records/i).first(),
    ).toBeVisible();

    // Every module is reachable.
    await page.getByRole("link", { name: "Expenses" }).first().click();
    await expect(page.getByRole("heading", { name: "Expenses" })).toBeVisible();
  });

  test("a new account starts empty and can sign out", async ({ page }) => {
    await registerNewAccount(page, "E2E Tester");

    await expect(page.getByText("Live data", { exact: true })).toBeVisible();
    await expect(
      page.getByText(/workspace is ready and completely empty/i),
    ).toBeVisible();

    await page.getByRole("button", { name: "Open profile menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("task management", () => {
  test("creates, edits, completes and deletes a task", async ({ page }) => {
    const suffix = Math.random().toString(36).slice(2, 8);
    const originalTitle = `E2E task ${suffix}`;
    const editedTitle = `${originalTitle} edited`;

    // A fresh account so the assertions are unaffected by seeded demo rows.
    await registerNewAccount(page, "Task Tester");
    await gotoApp(page, "/tasks");

    await expect(page.getByText("No tasks yet")).toBeVisible();

    // Create.
    await page.getByRole("button", { name: "New task" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("New task", { exact: true })).toBeVisible();
    await dialog.getByLabel("Title").fill(originalTitle);
    await dialog.getByLabel("Category").fill("E2E");
    await dialog.getByRole("button", { name: "Create task" }).click();

    const row = page.locator("li").filter({ hasText: originalTitle }).first();
    await expect(row).toBeVisible();

    // Complete. The default tab only lists open tasks, so the row leaves it.
    await row.getByTitle("Mark as done").click();
    await expect(page.getByText(originalTitle)).toHaveCount(0);

    await page.getByRole("link", { name: /^Completed/ }).click();
    const completedRow = page
      .locator("li")
      .filter({ hasText: originalTitle })
      .first();
    await expect(completedRow.getByTitle("Mark as not done")).toBeVisible();

    // Edit.
    await completedRow
      .getByRole("button", { name: `Edit ${originalTitle}` })
      .click();
    const editDialog = page.getByRole("dialog");
    await expect(editDialog.getByText("Edit task", { exact: true })).toBeVisible();
    await editDialog.getByLabel("Title").fill(editedTitle);
    await editDialog.getByRole("button", { name: "Save changes" }).click();

    const editedRow = page.locator("li").filter({ hasText: editedTitle }).first();
    await expect(editedRow).toBeVisible();

    // Delete.
    await editedRow
      .getByRole("button", { name: `Delete ${editedTitle}` })
      .click();
    const deleteDialog = page.getByRole("dialog");
    await expect(deleteDialog.getByText("Delete task?").first()).toBeVisible();
    await deleteDialog.getByRole("button", { name: "Delete task" }).click();

    await expect(page.getByText(editedTitle)).toHaveCount(0);
    await expect(page.getByText("No tasks yet")).toBeVisible();
  });

  test("opens the create dialog from ?intent=create and persists the task", async ({
    page,
  }) => {
    const title = `Persisted ${Math.random().toString(36).slice(2, 8)}`;

    await signInAsDemo(page);
    await gotoApp(page, "/tasks?intent=create");

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("New task", { exact: true })).toBeVisible();
    await dialog.getByLabel("Title").fill(title);
    await dialog.getByLabel("Category").fill("E2E");
    await dialog.getByRole("button", { name: "Create task" }).click();

    await expect(page.getByText(title).first()).toBeVisible();

    // The one-off intent parameter is removed from the URL.
    await expect(page).toHaveURL(/\/tasks$/);

    await page.reload();
    await waitForHydration(page);
    await expect(page.getByText(title).first()).toBeVisible();

    // Clean up so the demo workspace does not grow on every run.
    const row = page.locator("li").filter({ hasText: title }).first();
    await row.getByRole("button", { name: `Delete ${title}` }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete task" })
      .click();
    await expect(page.getByText(title)).toHaveCount(0);
  });
});

test.describe("responsive layout and theme", () => {
  test("shows the mobile navigation on a phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signInAsDemo(page);

    const bottomNav = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: "Money" })).toBeVisible();

    // The drawer opens too.
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByRole("link", { name: "Reports" })).toBeVisible();
  });

  test("switches to dark mode and remembers it after reload", async ({
    page,
  }) => {
    await signInAsDemo(page);

    await page.getByRole("button", { name: "Choose colour theme" }).click();
    await page.getByRole("menuitem", { name: "Dark" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await waitForHydration(page);
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
