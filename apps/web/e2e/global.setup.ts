import { test as setup, expect } from "@playwright/test";
import path from "node:path";
import { DEMO_PASSWORD, DEMO_USERS } from "./fixtures/test";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  // The dev server compiles routes on first hit — give the whole setup and
  // the first navigation generous timeouts so a cold start (local or CI)
  // does not abort the auth bootstrap every dependent project needs.
  setup.setTimeout(120_000);

  // Go to login page
  await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await expect(page).toHaveTitle(/vytal/i, { timeout: 30_000 });

  // Sign in through the UI with the seeded demo owner account.
  // Real Better Auth: wrong credentials would get a 401 + inline alert.
  await page.locator('input[type="email"]').fill(DEMO_USERS.owner.email);
  await page.locator('input[type="password"]').fill(DEMO_PASSWORD);

  // Click the submit button (contains "Entrar" in PT or "Login" in EN)
  await page.getByRole("button", { name: /entrar|login/i }).click();

  // Wait for redirect to dashboard. Real sign-in does a credential check +
  // org membership hydration round-trips, and /dashboard may be compiled on
  // first hit by the dev server — allow plenty of time on a cold start.
  await page.waitForURL(/dashboard/, { timeout: 60_000 });
  await expect(page).toHaveURL(/dashboard/);

  // Wait for the derived user snapshot cache written after a successful login
  await page.waitForFunction(() => {
    return localStorage.getItem("vytal-auth") !== null;
  });

  // The session now lives in an HttpOnly Better Auth cookie — make sure it
  // was actually set before persisting storage state, otherwise every
  // dependent test would start signed out.
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find((c) => c.name.includes("session_token"));
  expect(
    sessionCookie,
    "better-auth.session_token cookie must be captured in storage state"
  ).toBeTruthy();

  // Save authenticated state (includes both cookies and localStorage)
  await page.context().storageState({ path: authFile });
});
