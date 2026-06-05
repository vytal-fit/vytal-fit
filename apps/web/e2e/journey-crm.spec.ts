import { test, expect, type Page } from "@playwright/test";

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

test.describe("Journey: CRM Pipeline Flow", () => {
  const testLeadName = "E2E Lead Test";
  const testLeadPhone = "+351777666555";

  test("create a new lead and verify it appears in pipeline", async ({
    page,
  }) => {
    // 1. Navigate to /crm
    await page.goto("/crm");
    await expect(
      page.getByRole("heading", { name: /crm|leads|pipeline/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // 2. Click "+ Novo Lead" quick action using dispatchEvent to bypass overlay issues
    await page.evaluate(() => {
      // Find the "+ Novo Lead" button by its text content
      const buttons = document.querySelectorAll("button");
      for (const btn of buttons) {
        if (
          btn.textContent?.includes("Novo Lead") ||
          btn.textContent?.includes("New Lead")
        ) {
          btn.click();
          break;
        }
      }
    });
    await page.waitForTimeout(500);

    // 3. Fill the inline form
    const nameInput = page.locator('input[placeholder="Name"]');
    if (await nameInput.count() > 0) {
      await nameInput.first().fill(testLeadName);

      const phoneInput = page.locator('input[placeholder="Phone"]');
      await phoneInput.first().fill(testLeadPhone);

      // Select a source
      const sourceSelect = page
        .locator('[class*="green"] select')
        .first();
      if ((await sourceSelect.count()) > 0) {
        await sourceSelect.selectOption("Instagram");
      }

      // Submit: click "Add Lead" button
      await page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        for (const btn of buttons) {
          if (btn.textContent?.trim() === "Add Lead") {
            btn.click();
            break;
          }
        }
      });

      await page.waitForTimeout(1000);

      // Verify lead appears in the pipeline
      await expect(page.getByText(testLeadName).first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("pipeline columns are visible", async ({ page }) => {
    await page.goto("/crm");
    await expect(
      page.getByRole("heading", { name: /crm|leads|pipeline/i }).first()
    ).toBeVisible({ timeout: 5000 });

    // Verify pipeline columns exist
    await expect(page.getByText(/lead/i).first()).toBeVisible();
    await expect(
      page.getByText(/contact|contactado/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/prospect|prospeto/i).first()
    ).toBeVisible();
  });

  test("drag lead card to Contacted column", async ({ page }) => {
    await page.goto("/crm");
    await expect(
      page.getByRole("heading", { name: /crm|leads|pipeline/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // Find a lead card (draggable)
    const leadCards = page.locator('[draggable="true"]');
    const firstCard = leadCards.first();

    if ((await firstCard.count()) > 0) {
      const contactedColumn = page
        .getByText(/contactado|contacted/i)
        .first()
        .locator("..");

      const cardBox = await firstCard.boundingBox();
      const columnBox = await contactedColumn.boundingBox();

      if (cardBox && columnBox) {
        await page.mouse.move(
          cardBox.x + cardBox.width / 2,
          cardBox.y + cardBox.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(
          columnBox.x + columnBox.width / 2,
          columnBox.y + columnBox.height / 2,
          { steps: 10 }
        );
        await page.mouse.up();
        await page.waitForTimeout(500);
      }
    }
  });

  test("switch to Statistics view and verify charts render", async ({
    page,
  }) => {
    await page.goto("/crm");
    await expect(
      page.getByRole("heading", { name: /crm|leads|pipeline/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // Click Statistics view toggle
    const statsBtn = page.getByRole("button", { name: "Statistics" });
    await statsBtn.first().click({ force: true });
    await page.waitForTimeout(1000);

    // Verify charts render (recharts renders SVG elements)
    const svgCharts = page.locator(".recharts-responsive-container");
    await expect(svgCharts.first()).toBeVisible({ timeout: 5000 });
  });

  test("switch to Activity view and verify log entries", async ({
    page,
  }) => {
    await page.goto("/crm");
    await expect(
      page.getByRole("heading", { name: /crm|leads|pipeline/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // Click Activity view toggle
    const activityBtn = page
      .locator("button")
      .filter({ hasText: /^Activity$/ });
    await activityBtn.first().click({ force: true });
    await page.waitForTimeout(1000);

    // Verify activity log entries are visible
    // The activity entries show action text like "Created new lead" or "Sent welcome email to"
    // Avoid matching hidden <option> elements by targeting visible text in main content
    await expect(
      page.locator("main").getByText(/Created new lead|Sent welcome email/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
