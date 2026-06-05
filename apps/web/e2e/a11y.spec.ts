import { test, expect } from "@playwright/test";

/**
 * Accessibility baseline tests.
 *
 * These catch the low-hanging a11y fruit. For deeper audits, add
 * @axe-core/playwright once the UI is more mature.
 */
test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
  });

  test("page has a main landmark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });

  test("page has an h1 heading", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();
    const count = await h1.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("html lang attribute is set", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
    expect(["pt", "en", "es"]).toContain(lang);
  });

  test("all images have alt text", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `Image ${i} is missing alt text`).toBeTruthy();
    }
  });

  test("interactive elements are keyboard focusable", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator('button, a[href], input, [tabindex="0"]');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const tabindex = await buttons.nth(i).getAttribute("tabindex");
      expect(tabindex).not.toBe("-1");
    }
  });
});
