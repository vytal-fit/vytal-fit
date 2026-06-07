import { test, expect } from "@playwright/test";

const dashboardHeading = /bom dia|boa tarde|boa noite|good morning|good afternoon|good evening|dashboard/i;

test.describe("Home / Dashboard", () => {
  test("landing page loads at root", async ({ page }) => {
    await page.goto("/");
    // Root now shows the landing page (VYTAL marketing), not a redirect
    await expect(page.locator("text=VYTAL").first()).toBeVisible();
  });

  test("renders the dashboard heading", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/vytal/i);
  });

  test("is responsive at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });
});
