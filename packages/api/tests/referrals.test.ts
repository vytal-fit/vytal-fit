import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("referrals.create + list + stats", () => {
  it("creates a referral for an org member (staff) and lists it with the referrer name", async () => {
    const created = await h.callerA.referrals.create({
      referrerMemberId: "member-a1",
      referredName: "Carlos Mendes",
      referredEmail: "carlos@example.com",
      rewardAmount: 10,
    });
    expect(created?.organizationId).toBe("org-a");
    expect(created?.status).toBe("pending");

    const rows = await h.callerA.referrals.list();
    const row = rows.find((r) => r.id === created!.id);
    expect(row?.referrerName).toBe("Jose Fonte");
    expect(row?.referredName).toBe("Carlos Mendes");
  });

  it("updateStatus marks converted + reward applied, reflected in stats", async () => {
    const created = await h.callerA.referrals.create({
      referrerMemberId: "member-a1",
      referredName: "Ana Ref",
      referredEmail: "ana.ref@example.com",
      rewardAmount: 25,
    });
    await h.callerA.referrals.updateStatus({
      id: created!.id,
      status: "converted",
      rewardApplied: true,
    });

    const stats = await h.callerA.referrals.stats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.converted).toBeGreaterThanOrEqual(1);
    expect(stats.rewardsPaid).toBeGreaterThanOrEqual(25);
    expect(stats.conversionRate).toBeGreaterThan(0);
    expect(stats.topReferrers.some((r) => r.name === "Jose Fonte")).toBe(true);
  });

  it("rejects a referrer outside the caller's org (NOT_FOUND)", async () => {
    await expect(
      h.callerA.referrals.create({
        referrerMemberId: "member-b1",
        referredName: "x",
        referredEmail: "x@example.com",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("athlete gets FORBIDDEN on create (staff+)", async () => {
    await expect(
      h.callerAthleteA.referrals.create({
        referrerMemberId: "member-a1",
        referredName: "x",
        referredEmail: "x@example.com",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B never sees org A referrals", async () => {
    const rows = await h.callerB.referrals.list();
    expect(rows.every((r) => r.referredEmail !== "carlos@example.com")).toBe(true);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.referrals.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
