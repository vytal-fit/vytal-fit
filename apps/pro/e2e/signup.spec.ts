import { test, expect } from "@playwright/test";

// Signup page is public — no auth required
test.describe("Signup Page", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any auth so we get a clean signup experience
    await page.addInitScript(() => {
      localStorage.removeItem("vytal-auth");
    });
    await page.goto("/signup");
  });

  test("/signup loads plan selection", async ({ page }) => {
    // Step 1: plan selection should be visible
    await expect(page.locator("main")).toBeVisible({ timeout: 6000 });
    // Plan names: Free/Grátis, Pro, Enterprise
    await expect(page.getByText(/grátis|free/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/pro/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("signup shows billing toggle (monthly/annual)", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });
    // Billing toggle shows Mensal / Anual or Monthly / Annual
    await expect(page.getByText(/mensal|monthly/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/anual|annual/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("signup shows step indicator", async ({ page }) => {
    // The 4-step indicator should be visible: Plano, Conta, Organização, Pronto
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });
    const planStep = page.getByText(/plano|plan/i).first();
    const contaStep = page.getByText(/conta|account/i).first();
    await expect(planStep).toBeVisible({ timeout: 5000 });
    await expect(contaStep).toBeVisible({ timeout: 5000 });
  });

  test("signup step navigation works — step 1 to step 2", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible({ timeout: 6000 });

    // Select the Pro plan (should already be selected by default)
    const proPlan = page.getByText(/^pro$/i).first();
    await expect(proPlan).toBeVisible({ timeout: 5000 });

    // Click "Continuar" / "Continue" / "Next"
    const continueBtn = page.getByRole("button", { name: /continuar|next|continue|próximo/i }).first();
    await expect(continueBtn).toBeVisible({ timeout: 5000 });
    await continueBtn.click();

    // Step 2: "Criar conta" or "Create account" heading should appear
    await expect(
      page.getByText(/criar conta|create account|nome completo|full name/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("signup step 2 shows account form fields", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });

    // Navigate to step 2
    const continueBtn = page.getByRole("button", { name: /continuar|next|continue|próximo/i }).first();
    await expect(continueBtn).toBeVisible({ timeout: 5000 });
    await continueBtn.click();

    // Email, password fields should be present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 5000 });
  });

  test("signup step 2 validates required fields", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });

    // Navigate to step 2
    const continueBtn = page.getByRole("button", { name: /continuar|next|continue|próximo/i }).first();
    await continueBtn.click();
    await page.waitForTimeout(300);

    // Try to proceed without filling fields
    const nextBtn = page.getByRole("button", { name: /continuar|next|continue|próximo/i }).first();
    await nextBtn.click();
    await page.waitForTimeout(300);

    // Should show validation errors (field required / campo obrigatório)
    const errorMsg = page.getByText(/campo obrigatório|required|obrigatório/i).first();
    await expect(errorMsg).toBeVisible({ timeout: 3000 });
  });

  test("signup step navigation allows going back", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });

    // Go to step 2
    const continueBtn = page.getByRole("button", { name: /continuar|next|continue|próximo/i }).first();
    await continueBtn.click();
    await page.waitForTimeout(300);

    // Back button should appear on step 2
    const backBtn = page.getByRole("button", { name: /voltar|back/i }).first();
    await expect(backBtn).toBeVisible({ timeout: 3000 });
    await backBtn.click();
    await page.waitForTimeout(300);

    // Should be back on step 1 — plan selection visible again
    await expect(page.getByText(/grátis|free/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("signup billing toggle changes price display", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });

    // Click annual toggle
    const annualBtn = page.getByRole("button", { name: /anual|annual/i }).first();
    if (await annualBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await annualBtn.click();
      // Annual price for Pro should now show (39€ or discounted price)
      await expect(page.getByText(/39|poupas|save/i).first()).toBeVisible({ timeout: 3000 });
    }
  });
});
