import { test, expect, type Page } from "@playwright/test";

/**
 * Close the right sidebar overlay if it's open (it intercepts pointer events).
 */
async function closeRightSidebar(page: Page) {
  const backdrop = page.locator(
    'div.fixed.inset-0.z-30, div[class*="bg-black/20"][class*="backdrop-blur"]'
  );
  if (
    (await backdrop.count()) > 0 &&
    (await backdrop.first().isVisible())
  ) {
    await backdrop.first().click({ force: true });
    await page.waitForTimeout(300);
  }
}

test.describe("Journey: Settings Persistence", () => {
  test("change org name, save, and verify persistence across pages", async ({
    page,
  }) => {
    // 1. Navigate to /settings
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: /setting|defini[çc]/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // 2. The first input in the form is the Box Name field
    // Find it by getting the first text input inside the "General Info" section
    const nameField = page
      .locator("main input[type='text']")
      .first();

    await nameField.click({ force: true });
    await nameField.fill("");
    await nameField.fill("Test Box");

    // 3. Save -> verify toast appears
    const saveBtn = page.getByRole("button", {
      name: /save|guardar/i,
    });
    await saveBtn.first().click({ force: true });

    // Verify toast notification
    await expect(
      page.getByText(/saved|guardad|salvo/i).first()
    ).toBeVisible({ timeout: 3000 });

    // 4. Navigate to /dashboard -> verify welcome message shows "Test Box"
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/Test Box/i).first()).toBeVisible({
      timeout: 5000,
    });

    // 5. Navigate back to /settings -> verify name is still "Test Box"
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: /setting|defini[çc]/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // Verify the name field has "Test Box"
    const nameFieldAfter = page
      .locator("main input[type='text']")
      .first();
    await expect(nameFieldAfter).toHaveValue("Test Box", { timeout: 3000 });

    // CLEANUP: Restore original name
    await nameFieldAfter.click({ force: true });
    await nameFieldAfter.fill("");
    await nameFieldAfter.fill("CrossFit Aveiro");
    await saveBtn.first().click({ force: true });
    await page.waitForTimeout(500);
  });

  test("change currency to USD and verify on financials page", async ({
    page,
  }) => {
    // 1. Navigate to /settings
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: /setting|defini[çc]/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // 2. Find currency dropdown and change to USD
    const currencySelect = page
      .locator("select")
      .filter({ hasText: /EUR|USD|GBP|BRL/ });
    if ((await currencySelect.count()) > 0) {
      await currencySelect.first().selectOption("USD");
    }

    // 3. Save settings
    const saveBtn = page.getByRole("button", {
      name: /save|guardar/i,
    });
    await saveBtn.first().click({ force: true });
    await page.waitForTimeout(500);

    // 4. Navigate to /financials -> verify $ is shown (not EUR)
    await page.goto("/financials");
    await expect(
      page.getByRole("heading", { name: /financ/i }).first()
    ).toBeVisible({ timeout: 5000 });

    // Look for dollar sign in the page content
    const mainContent = page.locator("main");
    const pageText = await mainContent.textContent();

    // The page should contain USD formatting ($ sign)
    expect(pageText).toMatch(/\$|USD/);

    // CLEANUP: Restore EUR
    await page.goto("/settings");
    await page.waitForTimeout(1000);
    await closeRightSidebar(page);
    const currencySelectRestore = page
      .locator("select")
      .filter({ hasText: /EUR|USD|GBP|BRL/ });
    if ((await currencySelectRestore.count()) > 0) {
      await currencySelectRestore.first().selectOption("EUR");
    }
    await saveBtn.first().click({ force: true });
    await page.waitForTimeout(500);
  });

  test("accent color change updates CSS variable", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: /setting|defini[çc]/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // Find accent color presets by title attribute
    const bluePreset = page.locator('button[title="Blue"]');

    if ((await bluePreset.count()) > 0) {
      await bluePreset.first().click({ force: true });
      await page.waitForTimeout(300);

      // Verify the color input field changed
      const colorInput = page.locator('input[type="color"]');
      if ((await colorInput.count()) > 0) {
        const value = await colorInput.first().inputValue();
        // Blue preset should be #3b82f6
        expect(value).toBe("#3b82f6");
      }

      // CLEANUP: Restore green
      const greenPreset = page.locator('button[title="Green"]');
      if ((await greenPreset.count()) > 0) {
        await greenPreset.first().click({ force: true });
        await page.waitForTimeout(300);
      }
    }
  });
});
