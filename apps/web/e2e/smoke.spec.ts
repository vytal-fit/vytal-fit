import { test, expect } from "@playwright/test";

/**
 * Smoke tests — fast sanity checks that the app boots and critical
 * routes respond. Run these on every PR before the full suite.
 */
test.describe("Smoke tests", () => {
  test("app loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /vytal/i })).toBeVisible();

    // Filter out known benign errors (e.g., HMR in dev)
    const realErrors = errors.filter(
      (e) => !e.includes("[HMR]") && !e.includes("hydration")
    );
    expect(realErrors).toHaveLength(0);
  });

  test("404 page returns for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
