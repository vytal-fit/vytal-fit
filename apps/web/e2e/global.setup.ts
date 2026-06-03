import { test as setup, expect } from "@playwright/test";
import path from "node:path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  // Go to login page
  await page.goto("/login");
  await expect(page).toHaveTitle(/vytal/i);

  // Fill in credentials using input type selectors (more resilient than placeholder text)
  await page.locator('input[type="email"]').fill("test@vytal.fit");
  await page.locator('input[type="password"]').fill("testpassword123");

  // Click the submit button (contains "Entrar" in PT or "Login" in EN)
  await page.getByRole("button", { name: /entrar|login/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  await expect(page).toHaveURL(/dashboard/);

  // Wait for localStorage to be populated with auth state
  await page.waitForFunction(() => {
    return localStorage.getItem("vytal-auth") !== null;
  });

  // Save authenticated state (includes both cookies and localStorage)
  await page.context().storageState({ path: authFile });
});
