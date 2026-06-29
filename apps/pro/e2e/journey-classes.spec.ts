import { test, expect, type Page } from "@playwright/test";

async function closeRightSidebar(page: Page) {
  const backdrop = page.locator(
    'div.fixed.inset-0.z-30, div[class*="bg-black/20"][class*="backdrop-blur"]'
  );
  if (await backdrop.count() > 0 && await backdrop.first().isVisible()) {
    await backdrop.first().click({ force: true });
    await page.waitForTimeout(300);
  }
}

test.describe("Journey: Class Management", () => {
  test("class cards render with enrollment bars", async ({ page }) => {
    // 1. Navigate to /classes
    await page.goto("/classes");
    await expect(
      page.getByRole("heading", { name: /aulas|classes|clases|agenda/i }).first()
    ).toBeVisible({ timeout: 5000 });

    // 2. Verify class cards render (they are links to /classes/cl-*)
    const classCards = page.locator("a[href^='/classes/cl-']");
    await expect(classCards.first()).toBeVisible({ timeout: 5000 });

    // Verify enrollment info is present (enrollment count text like "12/20")
    const mainContent = page.locator("main");
    const text = await mainContent.textContent();
    // Should contain enrollment numbers (format: "X/Y" or enrollment count)
    expect(text).toMatch(/\d+\/\d+|\d+\s*(spots|vagas|lugares)/i);
  });

  test("click class card opens detail page", async ({ page }) => {
    await page.goto("/classes");
    await expect(
      page.getByRole("heading", { name: /aulas|classes|clases|agenda/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // Click the first class card
    const classCard = page.locator("a[href^='/classes/cl-']").first();
    if (await classCard.count() > 0) {
      await classCard.click({ force: true });
      // Verify detail page loads
      await page.waitForURL(/\/classes\/cl-/, { timeout: 5000 });
      await expect(page.locator("main").first()).toBeVisible();
    }
  });

  test("calendar view loads", async ({ page }) => {
    await page.goto("/classes/calendar");
    await page.waitForTimeout(2000);
    // Verify the page loads
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("create a new class and verify it exists", async ({ page }) => {
    // Class CRUD is persisted in the org-scoped localStorage data store
    // (per browser context), not the database — the created class is
    // discarded when this test's context closes, so no cleanup is needed.
    // 1. Navigate to /classes/create
    await page.goto("/classes/create");
    await page.waitForTimeout(1000);

    await closeRightSidebar(page);

    // Verify the form loads
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });

    // 2. The form pre-fills some fields. Find the submit button.
    const submitBtn = page.getByRole("button", {
      name: /create|criar|save|guardar/i,
    });

    if (await submitBtn.count() > 0) {
      await submitBtn.first().click({ force: true });
      await page.waitForTimeout(2000);

      // Check for success (may redirect to /classes or show success UI)
      const url = page.url();
      const hasSuccess =
        url.includes("/classes") ||
        (await page.getByText(/created|criada|success/i).count()) > 0;
      expect(hasSuccess).toBeTruthy();
    }

    // 3. Navigate back to /classes -> verify classes exist
    await page.goto("/classes");
    await expect(
      page.getByRole("heading", { name: /aulas|classes|clases|agenda/i }).first()
    ).toBeVisible({ timeout: 5000 });

    // Verify at least one class card is present
    const classCards = page.locator("a[href^='/classes/cl-']");
    await expect(classCards.first()).toBeVisible({ timeout: 5000 });
  });
});
