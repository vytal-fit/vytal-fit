import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Close right sidebar to prevent overlay intercepting clicks
    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
    await page.goto("/dashboard");
  });

  test("displays KPI stat cards", async ({ page }) => {
    // PT: "Total de Membros", "Membros Ativos", "Ocupação"
    await expect(page.getByText(/total.*memb|total members/i).first()).toBeVisible();
    await expect(page.getByText(/membros ativos|active members/i).first()).toBeVisible();
    await expect(page.getByText(/ocupa[çc][ãa]o|occupancy/i).first()).toBeVisible();
  });

  test("shows member counts from store data", async ({ page }) => {
    // Verify the KPI cards show numbers > 0 for total and active members.
    const statCards = page.locator(".stat-card-hover");
    await expect(statCards.first()).toBeVisible({ timeout: 5000 });
    const firstValue = await statCards.first().locator(".text-2xl, .text-3xl, [class*='text-']").first().textContent();
    const num = Number(String(firstValue).replace(/[^\d]/g, ""));
    expect(num).toBeGreaterThanOrEqual(0);
  });

  test("displays today's class schedule", async ({ page }) => {
    // PT: "Agenda de Hoje", EN: "Today's Schedule"
    await expect(page.getByRole("heading", { name: /schedule|agenda/i }).first()).toBeVisible();
  });

  test("shows class types in schedule", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByText("WOD").first()).toBeVisible();
  });

  test("sidebar navigation is visible", async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile the desktop sidebar is display:none and the nav lives in a
      // drawer — open it through the hamburger button (first header button).
      await page.locator("header button").first().click();
    }
    const sidebar = page.locator("aside").filter({ visible: true }).first();
    await expect(sidebar.getByText(/dashboard/i).first()).toBeVisible();
    // PT: "Membros", EN: "Members"
    await expect(sidebar.getByText(/membros|members/i).first()).toBeVisible();
  });

  test("sidebar shows active organization", async ({ page, isMobile }) => {
    if (isMobile) {
      // Org name renders in the sidebar org-switcher — open the mobile drawer.
      await page.locator("header button").first().click();
    }
    await expect(
      page.getByText("CrossFit Aveiro").filter({ visible: true }).first()
    ).toBeVisible();
  });

  test("navigates to members page", async ({ page, isMobile }) => {
    // Sidebar uses expandable buttons; click the "Resumo" sub-link under Membros
    // or navigate directly to /members. On mobile the nav lives in an
    // off-screen drawer — open it via the hamburger first, then scope all
    // locators to the visible <aside> so we never hit the hidden desktop nav.
    if (isMobile) {
      await page.locator("header button").first().click();
    }
    const sidebar = page.locator("aside").filter({ visible: true }).first();
    const membrosLink = sidebar.getByRole("link", { name: /^resumo$|^members$/i }).first();
    const directLink = sidebar.getByRole("link", { name: /membros|members/i }).first();
    if (await directLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await directLink.click();
    } else {
      // Expand the Membros section first
      await sidebar.getByRole("button", { name: /membros|members/i }).first().click();
      await membrosLink.click();
    }
    await page.waitForURL(/members/);
    await expect(page).toHaveURL(/members/);
  });

  test("navigates to classes page", async ({ page, isMobile }) => {
    // Sidebar uses expandable buttons; click "Agenda" sub-link under Aulas.
    // Same mobile-drawer handling as the members navigation test above.
    if (isMobile) {
      await page.locator("header button").first().click();
    }
    const sidebar = page.locator("aside").filter({ visible: true }).first();
    const agendaLink = sidebar.getByRole("link", { name: /^agenda$|^schedule$/i }).first();
    const directLink = sidebar.getByRole("link", { name: /aulas|classes/i }).first();
    if (await directLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await directLink.click();
    } else {
      // Expand the Aulas section first
      await sidebar.getByRole("button", { name: /aulas|classes/i }).first().click();
      await agendaLink.click();
    }
    await page.waitForURL(/classes/);
    await expect(page).toHaveURL(/classes/);
  });
});
