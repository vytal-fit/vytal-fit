import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("expenses.list", () => {
  it("returns org A expenses", async () => {
    const rows = await h.callerA.expenses.list();
    expect(rows.some((e) => e.subcategory === "Rent")).toBe(true);
    expect(rows.every((e) => e.organizationId === "org-a")).toBe(true);
  });

  it("filters by category", async () => {
    const rows = await h.callerA.expenses.list({ category: "Fixed" });
    expect(rows.every((e) => e.category === "Fixed")).toBe(true);
  });

  it("cross-tenant: org B never sees org A expenses", async () => {
    const rows = await h.callerB.expenses.list();
    expect(rows.every((e) => e.subcategory !== "Rent")).toBe(true);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.expenses.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

describe("expenses.create + delete", () => {
  it("creates an expense (staff)", async () => {
    const created = await h.callerA.expenses.create({
      date: "2026-06-01",
      category: "Variable",
      subcategory: "Cleaning",
      amount: 120,
      method: "transfer",
      hasReceipt: false,
    });
    expect(created?.amount).toBe("120.00");
    expect(created?.organizationId).toBe("org-a");
  });

  it("athlete gets FORBIDDEN on create (staff+)", async () => {
    await expect(
      h.callerAthleteA.expenses.create({
        date: "2026-06-01",
        category: "Fixed",
        subcategory: "x",
        amount: 1,
        method: "cash",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("coach gets FORBIDDEN on delete (admin+)", async () => {
    await expect(
      h.callerCoachA.expenses.delete({ id: "exp-a-1" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot delete an org A expense (NOT_FOUND)", async () => {
    await expect(
      h.callerB.expenses.delete({ id: "exp-a-1" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("owner deletes an org A expense", async () => {
    const created = await h.callerA.expenses.create({
      date: "2026-06-02",
      category: "Tax",
      subcategory: "IVA",
      amount: 500,
      method: "transfer",
    });
    const deleted = await h.callerA.expenses.delete({ id: created!.id });
    expect(deleted?.id).toBe(created!.id);
  });
});
