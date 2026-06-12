import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("subscriptions.plans.list", () => {
  it("returns only org A plans", async () => {
    const rows = await h.callerA.subscriptions.plans.list();
    expect(rows.map((p) => p.id)).toEqual([IDS.planA]);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.subscriptions.plans.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.subscriptions.plans.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller never sees org A plans", async () => {
    const rows = await h.callerB.subscriptions.plans.list();
    expect(rows.map((p) => p.id)).toEqual([IDS.planB]);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      // @ts-expect-error — invalid flag type on purpose
      h.callerA.subscriptions.plans.list({ activeOnly: "yes" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("subscriptions.plans.create", () => {
  it("creates a plan in org A", async () => {
    const created = await h.callerA.subscriptions.plans.create({
      name: "Trial 30",
      type: "trial",
      price: 29.9,
      currency: "EUR",
      allowedClassTypes: [IDS.classTypeA],
      active: true,
    });
    expect(created?.organizationId).toBe(IDS.orgA);
    expect(created?.price).toBe("29.90");
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.subscriptions.plans.create({
        name: "X",
        type: "monthly",
        price: 10,
        currency: "EUR",
        allowedClassTypes: [],
        active: true,
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.subscriptions.plans.create({
        name: "X",
        type: "monthly",
        price: 10,
        currency: "EUR",
        allowedClassTypes: [],
        active: true,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: cannot reference org B's class types (NOT_FOUND)", async () => {
    await expect(
      h.callerA.subscriptions.plans.create({
        name: "X",
        type: "monthly",
        price: 10,
        currency: "EUR",
        allowedClassTypes: [IDS.classTypeB],
        active: true,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.subscriptions.plans.create({
        name: "X",
        // @ts-expect-error — invalid plan type on purpose
        type: "weekly",
        price: 10,
        currency: "EUR",
        allowedClassTypes: [],
        active: true,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("subscriptions.list", () => {
  it("returns only org A subscriptions", async () => {
    const rows = await h.callerA.subscriptions.list();
    expect(rows.map((s) => s.id)).toEqual([IDS.subA]);
  });

  it("filters by status", async () => {
    const rows = await h.callerA.subscriptions.list({ status: "cancelled" });
    expect(rows).toEqual([]);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.subscriptions.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.subscriptions.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller never sees org A subscriptions", async () => {
    const rows = await h.callerB.subscriptions.list();
    expect(rows.map((s) => s.id)).toEqual([IDS.subB]);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      // @ts-expect-error — invalid status on purpose
      h.callerA.subscriptions.list({ status: "frozen" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("subscriptions.byMember", () => {
  it("returns subscriptions for an org A member", async () => {
    const rows = await h.callerA.subscriptions.byMember({ memberId: IDS.memberA1 });
    expect(rows.map((s) => s.id)).toEqual([IDS.subA]);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.subscriptions.byMember({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.subscriptions.byMember({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot read an org A member's subscriptions (NOT_FOUND)", async () => {
    await expect(
      h.callerB.subscriptions.byMember({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.subscriptions.byMember({ memberId: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("subscriptions.create", () => {
  it("creates a subscription in org A", async () => {
    const created = await h.callerA.subscriptions.create({
      memberId: IDS.memberA2,
      planId: IDS.planA,
      startDate: "2026-06-01",
      status: "active",
    });
    expect(created?.organizationId).toBe(IDS.orgA);
    expect(created?.memberId).toBe(IDS.memberA2);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.subscriptions.create({
        memberId: IDS.memberA2,
        planId: IDS.planA,
        startDate: "2026-06-01",
        status: "active",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.subscriptions.create({
        memberId: IDS.memberA2,
        planId: IDS.planA,
        startDate: "2026-06-01",
        status: "active",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: cannot subscribe an org B member (NOT_FOUND)", async () => {
    await expect(
      h.callerA.subscriptions.create({
        memberId: IDS.memberB1,
        planId: IDS.planA,
        startDate: "2026-06-01",
        status: "active",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("cross-tenant: cannot use an org B plan (NOT_FOUND)", async () => {
    await expect(
      h.callerA.subscriptions.create({
        memberId: IDS.memberA1,
        planId: IDS.planB,
        startDate: "2026-06-01",
        status: "active",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.subscriptions.create({
        memberId: IDS.memberA1,
        planId: IDS.planA,
        startDate: "June 1st",
        status: "active",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("subscriptions.plans.update", () => {
  it("owner can partially update a plan (name/price/active)", async () => {
    const updated = await h.callerA.subscriptions.plans.update({
      id: IDS.planA,
      data: { name: "Unlimited Plus", price: 85, active: false },
    });
    expect(updated?.name).toBe("Unlimited Plus");
    expect(updated?.price).toBe("85.00");
    expect(updated?.active).toBe(false);
    // Untouched fields survive a partial update.
    expect(updated?.type).toBe("monthly");
    expect(updated?.allowedClassTypes).toEqual([IDS.classTypeA]);

    // Re-activate (covers activate/deactivate via `active`).
    const reactivated = await h.callerA.subscriptions.plans.update({
      id: IDS.planA,
      data: { active: true },
    });
    expect(reactivated?.active).toBe(true);
    expect(reactivated?.name).toBe("Unlimited Plus");
  });

  it("coach and athlete get FORBIDDEN (admin+)", async () => {
    await expect(
      h.callerCoachA.subscriptions.plans.update({
        id: IDS.planA,
        data: { active: false },
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      h.callerAthleteA.subscriptions.plans.update({
        id: IDS.planA,
        data: { active: false },
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.subscriptions.plans.update({
        id: IDS.planA,
        data: { name: "X" },
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.subscriptions.plans.update({
        id: IDS.planA,
        data: { name: "X" },
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot update an org A plan (NOT_FOUND)", async () => {
    await expect(
      h.callerB.subscriptions.plans.update({
        id: IDS.planA,
        data: { name: "HACKED" },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const rows = await h.callerA.subscriptions.plans.list();
    expect(rows.some((p) => p.name === "HACKED")).toBe(false);
  });

  it("cross-tenant: cannot reference an org B class type (NOT_FOUND)", async () => {
    await expect(
      h.callerA.subscriptions.plans.update({
        id: IDS.planA,
        data: { allowedClassTypes: [IDS.classTypeB] },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.subscriptions.plans.update({
        id: IDS.planA,
        data: { price: -10 },
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("subscriptions.plans.delete", () => {
  it("coach and athlete get FORBIDDEN (admin+)", async () => {
    await expect(
      h.callerCoachA.subscriptions.plans.delete({ id: IDS.planA }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      h.callerAthleteA.subscriptions.plans.delete({ id: IDS.planA }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.subscriptions.plans.delete({ id: IDS.planA }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.subscriptions.plans.delete({ id: IDS.planA }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot delete an org A plan (NOT_FOUND)", async () => {
    await expect(
      h.callerB.subscriptions.plans.delete({ id: IDS.planA }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const rows = await h.callerA.subscriptions.plans.list();
    expect(rows.some((p) => p.id === IDS.planA)).toBe(true);
  });

  it("throws CONFLICT (with a count) when ACTIVE subscriptions reference the plan", async () => {
    // Seed: subA is active on planA; subscriptions.create above added a 2nd.
    await expect(
      h.callerA.subscriptions.plans.delete({ id: IDS.planA }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: expect.stringMatching(/2 active subscriptions/),
    });
    const rows = await h.callerA.subscriptions.plans.list();
    expect(rows.some((p) => p.id === IDS.planA)).toBe(true);
  });

  it("throws CONFLICT when only historical (cancelled) subscriptions reference the plan", async () => {
    const plan = await h.callerA.subscriptions.plans.create({
      name: "Retired Plan",
      type: "monthly",
      price: 30,
    });
    await h.callerA.subscriptions.create({
      memberId: IDS.memberA2,
      planId: plan.id,
      startDate: "2026-01-01",
      status: "cancelled",
    });
    // FK is `restrict`: never orphan or cascade-delete member subscriptions.
    await expect(
      h.callerA.subscriptions.plans.delete({ id: plan.id }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: expect.stringContaining("past subscription"),
    });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.subscriptions.plans.delete({ id: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("owner deletes an unreferenced plan", async () => {
    const plan = await h.callerA.subscriptions.plans.create({
      name: "Throwaway Plan",
      type: "day_pass",
      price: 12,
    });
    const deleted = await h.callerA.subscriptions.plans.delete({ id: plan.id });
    expect(deleted?.id).toBe(plan.id);
    const rows = await h.callerA.subscriptions.plans.list();
    expect(rows.some((p) => p.id === plan.id)).toBe(false);
  });
});
