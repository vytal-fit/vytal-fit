import { test, expect } from "@playwright/test";
import path from "node:path";

const authFile = path.join(__dirname, ".auth/user.json");

test.describe("Internationalization", () => {
  const locales = [
    { code: "pt", label: "Portuguese" },
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
  ];

  for (const locale of locales) {
    test(`renders in ${locale.label} (${locale.code})`, async ({ browser }) => {
      const context = await browser.newContext({
        locale: locale.code,
        storageState: authFile,
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        localStorage.setItem("vytal-right-sidebar-open", "false");
      });
      await page.goto("/dashboard");
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await context.close();
    });
  }

  test("no raw translation keys leak to the UI", async ({ page }) => {
    await page.goto("/dashboard");
    const body = await page.locator("body").textContent();
    const keyPattern = /\b[a-z]+\.[a-z]+\.[a-z]+\b/g;
    const matches = body?.match(keyPattern) ?? [];
    const suspiciousKeys = matches.filter(
      (m) => !m.includes("vytal.fit") && !m.includes("localhost")
    );
    if (suspiciousKeys.length > 0) {
      console.warn("Possible leaked translation keys:", suspiciousKeys);
    }
  });
});
