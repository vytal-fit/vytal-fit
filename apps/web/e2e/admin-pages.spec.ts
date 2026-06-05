import { test, expect } from "@playwright/test";

test.describe("Admin - All Pages Load", () => {
  const pages = [
    { path: "/dashboard", heading: /dashboard|bom dia|boa tarde|boa noite|good morning|good afternoon|good evening/i },
    { path: "/members", heading: /membros|members|miembros/i },
    { path: "/classes", heading: /aulas|classes|clases|agenda/i },
    { path: "/wods", heading: /wod/i },
    { path: "/crm", heading: /crm|leads|pipeline/i },
    { path: "/plans", heading: /plan|plano|subscription/i },
    { path: "/staff", heading: /staff|coach/i },
    { path: "/class-types", heading: /class.type|tipos de aula/i },
    { path: "/locations", heading: /location|localiza/i },
    { path: "/exercises", heading: /exerc[ií]/i },
    { path: "/reports", heading: /report|relat[oó]rio/i },
    { path: "/financials", heading: /financ/i },
    { path: "/communications", heading: /comunica|communication/i },
    { path: "/settings", heading: /setting|defini[çc]/i },
  ];

  for (const { path, heading } of pages) {
    test(`${path} loads and renders heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    });
  }
});

test.describe("Admin - WODs Page", () => {
  test("shows WOD cards with exercises", async ({ page }) => {
    await page.goto("/wods");
    await expect(page.getByText("FRAN").first()).toBeVisible();
  });

  test("shows WOD type badges", async ({ page }) => {
    await page.goto("/wods");
    const main = page.locator("main");
    await expect(main.getByText(/for time|amrap|emom|strength/i).first()).toBeVisible();
  });
});

test.describe("Admin - CRM Pipeline", () => {
  test("shows pipeline columns", async ({ page }) => {
    await page.goto("/crm");
    await expect(page.getByText(/lead/i).first()).toBeVisible();
    await expect(page.getByText(/contact|contactado/i).first()).toBeVisible();
    await expect(page.getByText(/prospect|prospeto/i).first()).toBeVisible();
  });

  test("shows lead cards", async ({ page }) => {
    await page.goto("/crm");
    await expect(page.getByText("Carlos Mendes").first()).toBeVisible();
  });
});

test.describe("Admin - Member Detail", () => {
  test("loads member by ID", async ({ page }) => {
    await page.goto("/members/m-1");
    await expect(page.getByText("Jose Fonte").first()).toBeVisible();
  });

  test("shows member stats", async ({ page }) => {
    await page.goto("/members/m-1");
    // PT: "Sequência", EN: "Streak"
    await expect(page.getByText(/streak|sequ[êe]ncia|check-in/i).first()).toBeVisible();
  });
});

test.describe("Admin - Financials", () => {
  test("shows revenue overview", async ({ page }) => {
    await page.goto("/financials");
    await expect(page.getByText(/18.*450|revenue/i).first()).toBeVisible();
  });
});

test.describe("Admin - Communications", () => {
  test("shows tabs for News, Email, SMS", async ({ page }) => {
    await page.goto("/communications");
    await expect(page.getByText(/news|notícias|noticias/i).first()).toBeVisible();
    await expect(page.getByText(/email/i).first()).toBeVisible();
    await expect(page.getByText(/sms/i).first()).toBeVisible();
  });
});

test.describe("Admin - Exercises", () => {
  test("shows exercise list", async ({ page }) => {
    await page.goto("/exercises");
    await expect(page.getByText("Back Squat").first()).toBeVisible();
    await expect(page.getByText("Deadlift").first()).toBeVisible();
  });

  test("has search functionality", async ({ page }) => {
    await page.goto("/exercises");
    // PT: "Pesquisar", EN: "Search"
    const search = page.getByPlaceholder(/pesquisar|search|buscar/i);
    await expect(search).toBeVisible();
  });
});

test.describe("Admin - Staff", () => {
  test("shows coach cards", async ({ page }) => {
    await page.goto("/staff");
    await expect(page.getByText("Andre Loureiro").first()).toBeVisible();
  });
});

test.describe("Admin - Settings", () => {
  test("shows box settings form", async ({ page }) => {
    await page.goto("/settings");
    // PT: "Guardar", EN: "Save"
    await expect(page.getByText(/save|guardar/i).first()).toBeVisible();
  });
});
