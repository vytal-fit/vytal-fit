import { test, expect } from "@playwright/test";

test.describe("Admin Members Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/members");
  });

  test("displays members heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /members/i })).toBeVisible();
  });

  test("shows member stats bar", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByText(/total/i).first()).toBeVisible();
  });

  test("displays member table with data", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByText("Jose Fonte")).toBeVisible();
    await expect(main.getByText("Ana Silva")).toBeVisible();
  });

  test("shows status badges", async ({ page }) => {
    const main = page.locator("main");
    const activeBadges = main.getByText(/^active$/i);
    expect(await activeBadges.count()).toBeGreaterThan(0);
  });

  test("has a search bar", async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await expect(search).toBeVisible();
  });

  test("search filters members by name", async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    const main = page.locator("main");
    await search.fill("Ana");
    await expect(main.locator("table, [role=table]").getByText("Ana Silva")).toBeVisible();
  });

  test("clearing search shows all members", async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    const main = page.locator("main");
    await search.fill("zzzzz");
    // Wait for filtering
    await page.waitForTimeout(300);
    await search.clear();
    await expect(main.getByText("Jose Fonte")).toBeVisible();
    await expect(main.getByText("Ana Silva")).toBeVisible();
  });
});
