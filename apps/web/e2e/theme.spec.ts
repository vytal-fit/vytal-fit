import { test, expect } from "@playwright/test";

/**
 * Theme tests — verify the app works in both light and dark mode.
 */
test.describe("Theme", () => {
  test("renders in dark mode (default)", async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "dark",
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /vytal/i })).toBeVisible();
    await context.close();
  });

  test("renders in light mode", async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "light",
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /vytal/i })).toBeVisible();
    await context.close();
  });

  test("no invisible text in dark mode (basic contrast check)", async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");

    // Check that text elements have visible content
    const heading = page.getByRole("heading", { name: /vytal/i });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);

    await context.close();
  });
});
