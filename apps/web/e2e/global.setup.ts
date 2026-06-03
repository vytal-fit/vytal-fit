import { test as setup, expect } from "@playwright/test";
import path from "node:path";

const authFile = path.join(__dirname, ".auth/user.json");

/**
 * Global setup: authenticate once, save storage state for all tests.
 *
 * This runs before all test projects. It registers a test user (or logs in
 * if the user already exists) and saves the authenticated session to
 * `e2e/.auth/user.json` so every test starts already logged in.
 *
 * Adjust the selectors and flow below once the auth UI is built.
 */
setup("authenticate", async ({ page }) => {
  // TODO: Replace with actual auth flow once login/register pages exist
  //
  // Example flow:
  // await page.goto("/register");
  // await page.getByLabel("Email").fill("test@vytal.fit");
  // await page.getByLabel("Password").fill("testpassword123");
  // await page.getByRole("button", { name: /register|criar conta/i }).click();
  // await expect(page).toHaveURL(/dashboard|onboarding/);

  await page.goto("/");
  await expect(page).toHaveTitle(/vytal/i);

  await page.context().storageState({ path: authFile });
});
