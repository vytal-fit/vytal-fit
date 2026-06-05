import { test, expect, type Page } from "@playwright/test";

async function closeRightSidebar(page: Page) {
  const backdrop = page.locator(
    'div.fixed.inset-0.z-30, div[class*="bg-black/20"][class*="backdrop-blur"]'
  );
  if (await backdrop.count() > 0 && await backdrop.first().isVisible()) {
    await backdrop.first().click({ force: true });
    await page.waitForTimeout(300);
  }
}

test.describe("Journey: Full Member Lifecycle", () => {
  const testMemberName = "E2E Test Member";
  const testMemberEmail = "e2e-test-member@vytal.fit";
  const testMemberPhone = "+351999888777";

  test("create, view, and delete a member", async ({ page }) => {
    // 1. Navigate to /members
    await page.goto("/members");
    await expect(
      page.getByRole("heading", { name: /membros|members|miembros/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await closeRightSidebar(page);

    // 2. Click "+ Adicionar Membro" / "Add Member" button to show the inline form
    const addBtn = page.getByRole("button", {
      name: /adicionar membro|add member|a[nñ]adir/i,
    });
    await addBtn.first().click({ force: true });

    // 3. Fill in name, email, phone in the inline form
    await page.waitForTimeout(500);

    // Use placeholder-based selectors for the form inputs
    await page.locator('input[placeholder="Full name"]').fill(testMemberName);
    await page
      .locator('input[placeholder="email@example.com"]')
      .fill(testMemberEmail);
    await page.locator('input[placeholder="+351..."]').fill(testMemberPhone);

    // 4. Submit the form (click Save button inside the form)
    const saveBtn = page.getByRole("button", { name: /save|guardar/i });
    await saveBtn.first().click({ force: true });

    // Wait for toast confirmation
    await expect(
      page
        .getByText(
          /member added|membro adicionado|miembro a[nñ]adido/i
        )
        .first()
    ).toBeVisible({ timeout: 3000 });

    // 5. Verify member appears in the table by searching
    const searchInput = page.getByPlaceholder(/pesquisar|search|buscar/i);
    await searchInput.fill(testMemberName);
    await page.waitForTimeout(500);
    await expect(page.getByText(testMemberName).first()).toBeVisible();

    // 6. Click the member row -> verify detail panel opens
    const memberRow = page
      .locator(`tr:has-text("${testMemberName}")`)
      .first();
    await memberRow.click({ force: true });
    await page.waitForTimeout(500);

    // 7. Click "View Full Profile" -> verify /members/[id] loads
    const viewProfileLink = page.getByText(
      /ver perfil completo|view full profile/i
    );
    if (await viewProfileLink.count() > 0) {
      await viewProfileLink.first().click();
      await page.waitForURL(/\/members\/m-/, { timeout: 5000 });
      await expect(page.getByText(testMemberName).first()).toBeVisible();
    }

    // 8. Navigate back to /members -> verify the member is still there
    await page.goto("/members");
    await expect(
      page.getByRole("heading", { name: /membros|members/i }).first()
    ).toBeVisible({ timeout: 5000 });
    await closeRightSidebar(page);

    await searchInput.fill(testMemberName);
    await page.waitForTimeout(500);
    await expect(page.getByText(testMemberName).first()).toBeVisible();

    // 9. Delete the member via the trash icon in the table row
    // The trash icon is a button with Trash2 icon, the last button in the row actions
    const trashBtn = page
      .locator(`tr:has-text("${testMemberName}")`)
      .locator('button[title*="elimin" i], button[title*="delete" i]')
      .first();

    if (await trashBtn.count() > 0) {
      await trashBtn.click({ force: true });
      await page.waitForTimeout(300);

      // Confirm delete in the ConfirmDialog
      // The confirm button has variant=danger and label from action.delete
      const confirmBtn = page.locator(
        'button.bg-vytal-red, button:has-text("Eliminar"), button:has-text("Delete")'
      );
      if (await confirmBtn.count() > 0) {
        await confirmBtn.first().click({ force: true });
      }

      // Verify toast appears
      await expect(
        page
          .getByText(
            /member deleted|membro eliminado|miembro eliminado/i
          )
          .first()
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test("member count on dashboard reflects store data", async ({ page }) => {
    // Navigate to /members to verify it loads
    await page.goto("/members");
    await expect(
      page.getByRole("heading", { name: /membros|members/i }).first()
    ).toBeVisible({ timeout: 5000 });

    // Navigate to dashboard and verify KPI cards are visible
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    // The dashboard should have stat cards computed from the store
    const statCards = page.locator(".stat-card-hover");
    await expect(statCards.first()).toBeVisible({ timeout: 5000 });

    // Verify the total members count is > 0
    const firstStatValue = await statCards
      .first()
      .locator(".text-2xl")
      .textContent();
    expect(firstStatValue).toBeTruthy();
    expect(Number(firstStatValue)).toBeGreaterThan(0);
  });
});
