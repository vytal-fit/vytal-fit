import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("displays KPI stat cards", async ({ page }) => {
    await expect(page.getByText(/total members/i)).toBeVisible();
    await expect(page.getByText(/active members/i)).toBeVisible();
    await expect(page.getByText(/occupancy/i)).toBeVisible();
  });

  test("shows member counts from mock data", async ({ page }) => {
    await expect(page.getByText("428")).toBeVisible();
    await expect(page.getByText("367")).toBeVisible();
  });

  test("displays today's class schedule", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /schedule/i })).toBeVisible();
  });

  test("shows class types in schedule", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByText("WOD").first()).toBeVisible();
  });

  test("sidebar navigation is visible", async ({ page }) => {
    const sidebar = page.locator("aside, nav").first();
    await expect(sidebar.getByText(/dashboard/i).first()).toBeVisible();
    await expect(sidebar.getByText(/members/i).first()).toBeVisible();
  });

  test("sidebar shows Vytal branding", async ({ page }) => {
    await expect(page.getByText("VYTAL")).toBeVisible();
  });

  test("navigates to members page", async ({ page }) => {
    await page.getByRole("link", { name: /members/i }).click();
    await page.waitForURL(/members/);
    await expect(page).toHaveURL(/members/);
  });

  test("navigates to classes page", async ({ page }) => {
    await page.getByRole("link", { name: /classes/i }).click();
    await page.waitForURL(/classes/);
    await expect(page).toHaveURL(/classes/);
  });
});
