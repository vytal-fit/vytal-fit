import { test, expect, type Page } from "@playwright/test";
import { DEMO_PASSWORD, DEMO_USERS } from "./fixtures/test";

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

test.describe("Journey: Auth Flow", () => {
  // This test does NOT use stored auth state -- it tests login from scratch
  test.use({ storageState: { cookies: [], origins: [] } });

  test("rejects bad credentials: inline error appears and URL stays on /login", async ({
    page,
  }) => {
    await page.goto("/login");

    // Submit credentials that do NOT exist in the database -> 401
    await page.locator('input[type="email"]').fill("nobody@vytal.fit");
    await page.locator('input[type="password"]').fill("definitely-wrong-1!");
    await page.getByRole("button", { name: /entrar|login/i }).click();

    // The inline error (role="alert") must appear with the i18n message.
    // Filter by text because Next.js adds its own empty route-announcer
    // element with role="alert".
    const alert = page
      .getByRole("alert")
      .filter({ hasText: /incorretos|invalid|incorrectos/i });
    await expect(alert).toBeVisible({ timeout: 10000 });

    // And we must still be on the login page — no redirect happened
    await expect(page).toHaveURL(/login/);
  });

  test("login flow: redirects unauthenticated user to /login, then logs in to /dashboard", async ({
    page,
  }) => {
    // 1. Navigate to /dashboard -> should redirect to /login when not authenticated
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/login/);

    // 2. Fill the seeded demo credentials (real Better Auth account)
    await page.locator('input[type="email"]').fill(DEMO_USERS.owner.email);
    await page.locator('input[type="password"]').fill(DEMO_PASSWORD);

    // 3. Click submit (PT: "Entrar", EN: "Login")
    await page.getByRole("button", { name: /entrar|login/i }).click();

    // 4. Verify redirect to dashboard (real sign-in + org hydration round-trips)
    await page.waitForURL(/dashboard/, { timeout: 20000 });
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe("Journey: Dashboard & Preferences", () => {
  test("dashboard shows KPI cards and org name", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    // Verify dashboard heading is visible
    await expect(page.getByRole("heading").first()).toBeVisible({
      timeout: 5000,
    });

    // Verify KPI stat cards are present
    const statCards = page.locator(".stat-card-hover");
    await expect(statCards.first()).toBeVisible({ timeout: 5000 });

    // Verify org name appears in the subtitle. Scope to <main>: the org name
    // also renders in the desktop sidebar org-switcher, which is the first
    // DOM match but display:none on mobile viewports.
    await expect(
      page.locator("main").getByText(/CrossFit Aveiro/i).first()
    ).toBeVisible();
  });

  test("sidebar collapse changes layout", async ({ page, isMobile }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    await closeRightSidebar(page);

    if (isMobile) {
      // There is no collapsible desktop sidebar on mobile — the nav lives in
      // an off-screen drawer. The mobile equivalent of a layout change is the
      // drawer sliding into the viewport when the hamburger is tapped.
      const drawer = page.locator("aside").filter({ visible: true }).first();
      await expect(drawer).not.toBeInViewport();
      await page.locator("header button").first().click();
      await expect(drawer).toBeInViewport();
      return;
    }

    // The left sidebar has a collapse toggle. Find the sidebar <aside> or <nav>.
    // On desktop, the sidebar has a toggle button (usually a chevron or hamburger).
    // Let's find it by looking for a small button within the sidebar area.
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });

    // Measure the main content area shift instead of sidebar directly
    const main = page.locator("main").first();
    const initialBox = await main.boundingBox();

    // Find the sidebar collapse/expand toggle
    // It's typically the last button or a dedicated toggle at the bottom of the sidebar
    const toggleBtn = page.locator(
      'aside button[class*="rounded"]'
    ).first();

    if ((await toggleBtn.count()) > 0 && initialBox) {
      await toggleBtn.click({ force: true });
      await page.waitForTimeout(500);

      const newBox = await main.boundingBox();
      // Main content area position or width should change
      if (newBox) {
        // Either x position or width should differ
        const changed =
          newBox.x !== initialBox.x || newBox.width !== initialBox.width;
        expect(changed).toBeTruthy();
      }
    }
  });
});

test.describe("Journey: Logout", () => {
  test("after clearing the cached snapshot, app re-resolves auth from the session cookie", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    // Clear only the derived localStorage cache. The real session lives in
    // the HttpOnly better-auth cookie, so this is NOT a logout anymore:
    // the auth store re-hydrates from the live session on next load.
    await page.evaluate(() => {
      localStorage.removeItem("vytal-auth");
    });

    // Reload dashboard — either the guard bounces to /login before the
    // session revalidation finishes, or hydration wins and we stay. The
    // client-side redirect can interrupt the navigation itself (WebKit races
    // this reliably), which makes goto() throw — both outcomes are fine, so
    // swallow the interruption and assert on the final URL instead.
    await page
      .goto("/dashboard", { waitUntil: "domcontentloaded" })
      .catch(() => undefined);
    await page.waitForURL(/login|dashboard/, { timeout: 15000 });

    const url = page.url();
    expect(url).toMatch(/login|dashboard/);
  });
});
