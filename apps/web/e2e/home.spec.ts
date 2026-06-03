import { test, expect } from "@playwright/test";

test.describe("Home / Dashboard", () => {
  test("redirects to dashboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/dashboard/);
    await expect(page).toHaveURL(/dashboard/);
  });

  test("renders the dashboard heading", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/vytal/i);
  });

  test("is responsive at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });
});
