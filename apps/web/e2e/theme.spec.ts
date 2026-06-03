import { test, expect } from "@playwright/test";

test.describe("Theme", () => {
  test("renders in dark mode (default)", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    await context.close();
  });

  test("renders in light mode", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    await context.close();
  });

  test("no invisible text in dark mode", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/dashboard");
    const heading = page.getByRole("heading", { name: /dashboard/i });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
    await context.close();
  });
});
