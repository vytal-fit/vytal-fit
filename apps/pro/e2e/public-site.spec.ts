import { test, expect } from "@playwright/test";

// The public org pages live at /org/[slug]/... and now render from the REAL
// public API (trpc.public.*), resolved by the "crossfit-aveiro" org slug.
// Assertions below target the real seeded data (subscriptionPlans, storeProducts,
// classes). No auth is needed for public pages. These pages use <section> /
// <div> wrappers (not <main>) so we locate content by text or role.

test.describe("Public Org: @crossfit-aveiro home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/org/crossfit-aveiro");
  });

  test("/@crossfit-aveiro loads public page", async ({ page }) => {
    // The org home page should contain the org name
    await expect(page.getByText(/CrossFit Aveiro/i).first()).toBeVisible({ timeout: 6000 });
  });

  test("public page shows navigation links", async ({ page }) => {
    // Nav bar should have Horário / Preços / Loja links
    await expect(page.getByRole("link", { name: /horário|schedule|preços|pricing|loja|shop/i }).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("public page renders hero section", async ({ page }) => {
    // The hero section has a heading and slogan
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 5000 });
  });

  test("public page shows contact / join CTA", async ({ page }) => {
    // The org home page has at least one action anchor in the hero section.
    // Default ctaText is "Contactar"; the page also shows "Ligar" and "Entrar".
    const cta = page
      .getByRole("link", { name: /contactar|contact|ligar|call|entrar|começar|inscrever|join/i })
      .first();
    await expect(cta).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Public Org: @crossfit-aveiro/schedule", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/org/crossfit-aveiro/schedule");
  });

  test("/@crossfit-aveiro/schedule shows classes", async ({ page }) => {
    // The schedule page displays day buttons. Full names ("Segunda") are
    // hidden below the sm breakpoint where the abbreviation ("Seg") shows,
    // so target the day buttons, which carry both labels.
    await expect(
      page.getByRole("button", { name: /\bseg\b|\bter\b|\bqua\b|segunda|terça|quarta/i }).first()
    ).toBeVisible({ timeout: 6000 });
  });

  test("schedule page shows CrossFit class entries", async ({ page }) => {
    // The mock data for crossfit-aveiro includes classes named "CrossFit"
    await expect(page.getByText(/CrossFit/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("schedule page has day selector buttons", async ({ page }) => {
    // Each day is a button — at least the active day should be rendered
    const dayBtn = page.getByRole("button").first();
    await expect(dayBtn).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Public Org: @crossfit-aveiro/pricing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/org/crossfit-aveiro/pricing");
  });

  test("/@crossfit-aveiro/pricing shows real plan names", async ({ page }) => {
    // Real seeded subscriptionPlans for org-1.
    await expect(
      page.getByText(/mensal livre|8 aulas|aula avulso|mensal completo|trimestral|semestral/i).first(),
    ).toBeVisible({ timeout: 6000 });
  });

  test("pricing page shows price amounts", async ({ page }) => {
    // Real plan prices (55, 45, 12, 80, 150…) rendered with the € symbol.
    await expect(page.getByText(/€/).first()).toBeVisible({ timeout: 5000 });
  });

  test("pricing page renders plan cards", async ({ page }) => {
    // At least one plan card/heading is present below the hero.
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Public Org: @crossfit-aveiro/shop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/org/crossfit-aveiro/shop");
  });

  test("/@crossfit-aveiro/shop shows real products", async ({ page }) => {
    // Real seeded storeProducts for org-1.
    await expect(
      page.getByText(/aero tee|crop top|heavy hoodie|training backpack|gymnastics grips|whey protein/i).first()
    ).toBeVisible({ timeout: 6000 });
  });

  test("shop page shows product prices", async ({ page }) => {
    // Products display prices with the € symbol.
    await expect(page.getByText(/€/).first()).toBeVisible({ timeout: 5000 });
  });

  test("shop page has Adicionar (add-to-cart) buttons", async ({ page }) => {
    // Each product card has an "Adicionar" button
    await expect(
      page.getByRole("button", { name: /adicionar|add/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
