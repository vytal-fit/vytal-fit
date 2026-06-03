import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("displays KPI stat cards", async ({ page }) => {
    // PT: "Total de Membros", "Membros Ativos", "Ocupação"
    await expect(page.getByText(/total.*memb|total members/i).first()).toBeVisible();
    await expect(page.getByText(/membros ativos|active members/i).first()).toBeVisible();
    await expect(page.getByText(/ocupa[çc][ãa]o|occupancy/i).first()).toBeVisible();
  });

  test("shows member counts from mock data", async ({ page }) => {
    await expect(page.getByText("428")).toBeVisible();
    await expect(page.getByText("367")).toBeVisible();
  });

  test("displays today's class schedule", async ({ page }) => {
    // PT: "Agenda de Hoje", EN: "Today's Schedule"
    await expect(page.getByRole("heading", { name: /schedule|agenda/i })).toBeVisible();
  });

  test("shows class types in schedule", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByText("WOD").first()).toBeVisible();
  });

  test("sidebar navigation is visible", async ({ page }) => {
    const sidebar = page.locator("aside, nav").first();
    await expect(sidebar.getByText(/dashboard/i).first()).toBeVisible();
    // PT: "Membros", EN: "Members"
    await expect(sidebar.getByText(/membros|members/i).first()).toBeVisible();
  });

  test("sidebar shows active organization", async ({ page }) => {
    await expect(page.getByText("CrossFit Aveiro").first()).toBeVisible();
  });

  test("navigates to members page", async ({ page }) => {
    // PT: "Membros", EN: "Members"
    await page.getByRole("link", { name: /membros|members/i }).click();
    await page.waitForURL(/members/);
    await expect(page).toHaveURL(/members/);
  });

  test("navigates to classes page", async ({ page }) => {
    // PT: "Aulas", EN: "Classes"
    await page.getByRole("link", { name: /aulas|classes/i }).click();
    await page.waitForURL(/classes/);
    await expect(page).toHaveURL(/classes/);
  });
});
