import { test, expect } from "@playwright/test";

test.describe("Admin Members Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
    await page.goto("/members");
  });

  test("displays members heading", async ({ page }) => {
    // PT: "Membros", EN: "Members"
    await expect(page.getByRole("heading", { name: /membros|members/i })).toBeVisible();
  });

  test("shows member stats bar", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByText(/total/i).first()).toBeVisible();
  });

  test("displays member table with data", async ({ page }) => {
    // Scope to the data table: the header user menu (inside <main>) also
    // renders "Jose Fonte" but is hidden on mobile viewports. Rows load via
    // tRPC, so wait for the table to replace the loading skeleton first.
    const table = page.locator("main").locator("table").first();
    await expect(table).toBeVisible({ timeout: 15000 });
    await expect(table.getByText("Jose Fonte").first()).toBeVisible();
    await expect(table.getByText("Ana Silva").first()).toBeVisible();
  });

  test("shows status badges", async ({ page }) => {
    // Wait for the table to render, then check for status badges
    await expect(page.locator("table").first()).toBeVisible();
    const activeBadges = page.locator("table").getByText(/ativo|active|activo/i);
    expect(await activeBadges.count()).toBeGreaterThan(0);
  });

  test("has a search bar", async ({ page }) => {
    // PT: "Pesquisar...", EN: "Search..."
    const search = page.getByPlaceholder(/pesquisar|search/i);
    await expect(search).toBeVisible();
  });

  test("search filters members by name", async ({ page }) => {
    const search = page.getByPlaceholder(/pesquisar|search/i);
    const main = page.locator("main");
    await search.fill("Ana");
    await expect(main.locator("table, [role=table]").getByText("Ana Silva")).toBeVisible();
  });

  test("clearing search shows all members", async ({ page }) => {
    const search = page.getByPlaceholder(/pesquisar|search/i);
    // Scope to the data table (the header user menu also contains
    // "Jose Fonte" and is hidden on mobile viewports).
    const table = page.locator("main").locator("table").first();
    await search.fill("zzzzz");
    // Wait for filtering
    await page.waitForTimeout(300);
    await search.clear();
    await expect(table.getByText("Jose Fonte").first()).toBeVisible();
    await expect(table.getByText("Ana Silva").first()).toBeVisible();
  });
});
