import { test, expect } from "@playwright/test";

// The public org pages live at /org/[slug]/... and use MOCK_ORGS data that
// includes "crossfit-aveiro". No auth is needed for public pages.
// These pages use <section> / <div> wrappers (not <main>) so we locate
// visible content by text or role instead.

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

  test("/@crossfit-aveiro/pricing shows plans", async ({ page }) => {
    // Pricing page shows plan names from mock data
    await expect(page.getByText(/aula avulso|8 aulas|ilimitado|família/i).first()).toBeVisible({
      timeout: 6000,
    });
  });

  test("pricing page shows price amounts", async ({ page }) => {
    // Plans have prices like 15€, 55€, 75€, 130€
    await expect(page.getByText(/15|55|75|130/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("pricing page shows FAQ section", async ({ page }) => {
    // The pricing page includes a FAQ below the plans
    await expect(
      page.getByText(/existe período|período de fidelização|perguntas|faq/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Public Org: @crossfit-aveiro/shop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/org/crossfit-aveiro/shop");
  });

  test("/@crossfit-aveiro/shop shows products", async ({ page }) => {
    // Shop has product cards with names from mock data
    await expect(
      page.getByText(/t-shirt|hoodie|shorts|wrist wraps|chalk|shaker|proteína|creatina/i).first()
    ).toBeVisible({ timeout: 6000 });
  });

  test("shop page shows product prices", async ({ page }) => {
    // Products display prices ending in €
    await expect(page.getByText(/29\.99€|54\.99€|34\.99€|19\.99€/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("shop page has Adicionar (add-to-cart) buttons", async ({ page }) => {
    // Each product card has an "Adicionar" button
    await expect(
      page.getByRole("button", { name: /adicionar|add/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
