import { test, expect } from "@playwright/test";

/**
 * i18n tests — verify the app renders correctly in all supported locales.
 *
 * These tests navigate with Accept-Language headers to trigger locale
 * switching. Adjust once the i18n system is wired up.
 */
test.describe("Internationalization", () => {
  const locales = [
    { code: "pt", label: "Portuguese", expectedContent: /vytal/i },
    { code: "en", label: "English", expectedContent: /vytal/i },
    { code: "es", label: "Spanish", expectedContent: /vytal/i },
  ];

  for (const locale of locales) {
    test(`renders in ${locale.label} (${locale.code})`, async ({ browser }) => {
      const context = await browser.newContext({
        locale: locale.code,
      });
      const page = await context.newPage();
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: locale.expectedContent })
      ).toBeVisible();
      await context.close();
    });
  }

  test("no raw translation keys leak to the UI", async ({ page }) => {
    await page.goto("/");
    const body = await page.locator("body").textContent();
    // Translation keys typically look like "module.key.subkey"
    const keyPattern = /\b[a-z]+\.[a-z]+\.[a-z]+\b/g;
    const matches = body?.match(keyPattern) ?? [];
    // Filter out things that look like keys but aren't (e.g., domain names)
    const suspiciousKeys = matches.filter(
      (m) => !m.includes("vytal.fit") && !m.includes("localhost")
    );
    // This is a soft check — inspect manually if it flags false positives
    if (suspiciousKeys.length > 0) {
      console.warn("Possible leaked translation keys:", suspiciousKeys);
    }
  });
});
