import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders the Vytal landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /vytal/i })).toBeVisible();
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/vytal/i);
  });

  test("is responsive at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /vytal/i })).toBeVisible();
  });
});
