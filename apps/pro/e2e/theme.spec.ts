import { test, expect } from "@playwright/test";
import path from "node:path";

const authFile = path.join(__dirname, ".auth/user.json");

test.describe("Theme", () => {
  test("renders in dark mode (default)", async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "dark",
      storageState: authFile,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await context.close();
  });

  test("renders in light mode", async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "light",
      storageState: authFile,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await context.close();
  });

  test("no invisible text in dark mode", async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "dark",
      storageState: authFile,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem("vytal-right-sidebar-open", "false");
    });
    await page.goto("/dashboard");
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
    await context.close();
  });
});
