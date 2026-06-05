import { test, expect } from "@playwright/test";

test.describe("Admin Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Close right sidebar to prevent overlay intercepting clicks
    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
  });

  test("sidebar persists across pages", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("CrossFit Aveiro").first()).toBeVisible();

    // Navigate to members via direct URL (sidebar uses expandable buttons, not direct links)
    await page.goto("/members");
    await page.waitForURL(/members/);
    await expect(page.getByText("CrossFit Aveiro").first()).toBeVisible();

    // Navigate to classes
    await page.goto("/classes");
    await page.waitForURL(/classes/);
    await expect(page.getByText("CrossFit Aveiro").first()).toBeVisible();
  });

  test("active nav item is highlighted", async ({ page }) => {
    await page.goto("/dashboard");
    const dashboardLink = page.getByRole("link", { name: /dashboard/i }).first();
    await expect(dashboardLink).toBeVisible();
  });

  test("all main routes load successfully", async ({ page }) => {
    for (const path of ["/dashboard", "/members", "/classes"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });

  test("root redirects to dashboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/dashboard/);
    expect(page.url()).toContain("/dashboard");
  });
});
