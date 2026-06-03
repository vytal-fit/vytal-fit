import { test, expect } from "@playwright/test";

test.describe("Admin Classes Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/classes");
  });

  test("displays classes heading", async ({ page }) => {
    // PT: "Aulas" / "Agenda de aulas", EN: "Classes" / "Class schedule"
    await expect(page.getByRole("heading", { name: /aulas|classes|agenda/i })).toBeVisible();
  });

  test("shows class cards", async ({ page }) => {
    await expect(page.getByText("WOD").first()).toBeVisible();
  });

  test("displays class times", async ({ page }) => {
    await expect(page.getByText("07:00").first()).toBeVisible();
  });

  test("shows coach names", async ({ page }) => {
    await expect(page.getByText(/Andre Loureiro|Marine Robba|Ricardo Ribeiro/i).first()).toBeVisible();
  });

  test("shows location names", async ({ page }) => {
    await expect(page.getByText(/Main Box|Strength Room|Open Box|Outdoors/i).first()).toBeVisible();
  });

  test("shows enrollment counts", async ({ page }) => {
    // Should show enrollment numbers like "18/20" or similar
    await expect(page.getByText(/\/20|\/12|\/15|\/30/).first()).toBeVisible();
  });
});
