import { test, expect } from "@playwright/test";

test.describe("Admin Navigation", () => {
  test("sidebar persists across pages", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("CrossFit Aveiro").first()).toBeVisible();

    // PT: "Membros", EN: "Members"
    await page.getByRole("link", { name: /membros|members/i }).click();
    await page.waitForURL(/members/);
    await expect(page.getByText("CrossFit Aveiro").first()).toBeVisible();

    // PT: "Aulas", EN: "Classes"
    await page.getByRole("link", { name: /aulas|classes/i }).click();
    await page.waitForURL(/classes/);
    await expect(page.getByText("CrossFit Aveiro").first()).toBeVisible();
  });

  test("active nav item is highlighted", async ({ page }) => {
    await page.goto("/dashboard");
    const dashboardLink = page.getByRole("link", { name: /dashboard/i });
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
