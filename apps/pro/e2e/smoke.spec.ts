import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("app loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    const realErrors = errors.filter(
      (e) =>
        !e.includes("[HMR]") &&
        !e.includes("hydration") &&
        !e.includes("NEXT_REDIRECT") &&
        !e.includes("recoverableError") &&
        !e.includes("favicon")
    );
    expect(realErrors).toHaveLength(0);
  });

  test("404 page returns for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
