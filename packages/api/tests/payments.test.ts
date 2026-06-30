import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("payments.list", () => {
  it("returns org A payments with member names", async () => {
    const rows = await h.callerA.payments.list();
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows.every((r) => typeof r.memberName === "string")).toBe(true);
  });

  it("filters by status", async () => {
    const rows = await h.callerA.payments.list({ status: "overdue" });
    expect(rows.every((r) => r.status === "overdue")).toBe(true);
  });

  it("cross-tenant: org B never sees org A payments", async () => {
    const rows = await h.callerB.payments.list();
    expect(rows.every((r) => r.reference !== "INV-A-001")).toBe(true);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.payments.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

describe("payments.byMember", () => {
  it("returns a member's payments", async () => {
    const rows = await h.callerA.payments.byMember({ memberId: IDS.memberA1 });
    expect(rows.every((r) => r.memberId === IDS.memberA1)).toBe(true);
  });

  it("cross-tenant: org B caller cannot read an org A member's payments (NOT_FOUND)", async () => {
    await expect(
      h.callerB.payments.byMember({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("payments.stats", () => {
  it("aggregates revenue, methods and overdue tallies (staff)", async () => {
    const stats = await h.callerA.payments.stats();
    expect(stats.months).toHaveLength(6);
    expect(stats.overdueCount).toBeGreaterThanOrEqual(1);
    expect(stats.byMethod.some((m) => m.method === "mbway")).toBe(true);
  });

  it("athlete gets FORBIDDEN (staff+)", async () => {
    await expect(h.callerAthleteA.payments.stats()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("payments.create + markPaid", () => {
  it("registers a payment and marks it paid", async () => {
    const created = await h.callerA.payments.create({
      memberId: IDS.memberA1,
      planId: IDS.planA,
      amount: 50,
      method: "cash",
      status: "pending",
      reference: "INV-A-NEW",
    });
    expect(created?.status).toBe("pending");
    expect(created?.amount).toBe("50.00");

    const paid = await h.callerA.payments.markPaid({ id: created!.id });
    expect(paid?.status).toBe("paid");
    expect(paid?.paidAt).toBeInstanceOf(Date);
  });

  it("validates the member belongs to the org (NOT_FOUND)", async () => {
    await expect(
      h.callerA.payments.create({ memberId: IDS.memberB1, amount: 10, method: "cash" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("athlete gets FORBIDDEN (staff+)", async () => {
    await expect(
      h.callerAthleteA.payments.create({ memberId: IDS.memberA1, amount: 10, method: "cash" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot mark an org A payment (NOT_FOUND)", async () => {
    await expect(
      h.callerB.payments.markPaid({ id: "pay-a-paid" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
