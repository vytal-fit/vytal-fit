import { test, expect } from "@playwright/test";

// The classes page loads today's agenda through tRPC (live DB) — cards appear
// only after the query round-trip, so use a realistic timeout. Locators are
// scoped to <main>: the sidebar also matches texts like "WOD(s)" but is
// hidden (display:none) on mobile viewports, where an unscoped .first()
// resolves to the hidden sidebar node.
const TRPC_TIMEOUT = 20000;

test.describe("Admin Classes Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/classes");
  });

  test("displays classes heading", async ({ page }) => {
    // PT: "Aulas" / "Agenda de aulas", EN: "Classes" / "Class schedule"
    await expect(page.getByRole("heading", { name: /aulas|classes|agenda/i })).toBeVisible();
  });

  test("shows class cards", async ({ page }) => {
    await expect(page.locator("main").getByText("WOD").first()).toBeVisible({
      timeout: TRPC_TIMEOUT,
    });
  });

  test("displays class times", async ({ page }) => {
    await expect(page.locator("main").getByText("07:00").first()).toBeVisible({
      timeout: TRPC_TIMEOUT,
    });
  });

  test("shows coach names", async ({ page }) => {
    // Classes page renders first names only (e.g. "Andre", "Marine", "Ricardo")
    await expect(
      page.locator("main").getByText(/Andre|Marine|Ricardo/i).first()
    ).toBeVisible({ timeout: TRPC_TIMEOUT });
  });

  test("shows location names", async ({ page }) => {
    await expect(
      page.locator("main").getByText(/Main Box|Strength Room|Open Box|Outdoors/i).first()
    ).toBeVisible({ timeout: TRPC_TIMEOUT });
  });

  test("shows enrollment counts", async ({ page }) => {
    // Should show enrollment numbers like "18/20" or similar
    await expect(
      page.locator("main").getByText(/\/20|\/12|\/15|\/30/).first()
    ).toBeVisible({ timeout: TRPC_TIMEOUT });
  });
});
