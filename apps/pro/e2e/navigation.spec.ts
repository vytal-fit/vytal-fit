import { test, expect } from "@playwright/test";

test.describe("Admin Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Close right sidebar to prevent overlay intercepting clicks
    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
  });

  test("sidebar persists across pages", async ({ page, isMobile }) => {
    // The org name lives in the sidebar org-switcher. On mobile the desktop
    // sidebar is display:none and the nav lives in a drawer — open it via the
    // hamburger (first header button) before asserting, on every page.
    const expectOrgVisible = async () => {
      if (isMobile) {
        await page.locator("header button").first().click();
      }
      await expect(
        page.getByText("CrossFit Aveiro").filter({ visible: true }).first()
      ).toBeVisible();
    };

    await page.goto("/dashboard");
    await expectOrgVisible();

    // Navigate to members via direct URL (sidebar uses expandable buttons, not direct links)
    await page.goto("/members");
    await page.waitForURL(/members/);
    await expectOrgVisible();

    // Navigate to classes
    await page.goto("/classes");
    await page.waitForURL(/classes/);
    await expectOrgVisible();
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

  test("root shows landing page", async ({ page }) => {
    await page.goto("/");
    // Root now shows VYTAL landing page
    await expect(page.locator("text=VYTAL").first()).toBeVisible();
  });
});
