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
