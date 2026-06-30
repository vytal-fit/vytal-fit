import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("wellnessCheckins.upsert", () => {
  it("lets an athlete log a check-in for their OWN member profile", async () => {
    const row = await h.callerAthleteA.wellnessCheckins.upsert({
      memberId: IDS.memberA1, // linked to the athlete user in the harness
      date: "2026-02-01",
      sleep: 8,
      fatigue: 3,
      stress: 2,
      mood: 9,
      notes: "Slept well.",
    });
    expect(row?.organizationId).toBe(IDS.orgA);
    expect(row?.memberId).toBe(IDS.memberA1);
    expect(row?.sleep).toBe(8);
  });

  it("upserts: a second check-in for the same member+day updates in place", async () => {
    const first = await h.callerCoachA.wellnessCheckins.upsert({
      memberId: IDS.memberA2,
      date: "2026-02-03",
      sleep: 5,
    });
    const second = await h.callerCoachA.wellnessCheckins.upsert({
      memberId: IDS.memberA2,
      date: "2026-02-03",
      sleep: 9,
      stress: 7,
    });
    expect(second?.id).toBe(first?.id); // same row, not a duplicate
    expect(second?.sleep).toBe(9);
    expect(second?.stress).toBe(7);
  });

  it("forbids an athlete logging for someone else's member", async () => {
    await expect(
      h.callerAthleteA.wellnessCheckins.upsert({ memberId: IDS.memberA2, sleep: 5 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an out-of-range scale (Zod 1–10)", async () => {
    await expect(
      h.callerCoachA.wellnessCheckins.upsert({ memberId: IDS.memberA1, sleep: 11 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a malformed date", async () => {
    await expect(
      h.callerCoachA.wellnessCheckins.upsert({ memberId: IDS.memberA1, date: "01-02-2026" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("cross-tenant: org B caller cannot log for an org A member (NOT_FOUND)", async () => {
    await expect(
      h.callerB.wellnessCheckins.upsert({ memberId: IDS.memberA1, sleep: 5 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.wellnessCheckins.upsert({ memberId: IDS.memberA1, sleep: 5 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.wellnessCheckins.upsert({ memberId: IDS.memberA1, sleep: 5 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("wellnessCheckins.forDay / list / byId", () => {
  it("forDay returns the member's check-in for a date, or null", async () => {
    await h.callerCoachA.wellnessCheckins.upsert({
      memberId: IDS.memberA1,
      date: "2026-02-05",
      fatigue: 4,
    });
    const hit = await h.callerA.wellnessCheckins.forDay({
      memberId: IDS.memberA1,
      date: "2026-02-05",
    });
    expect(hit?.fatigue).toBe(4);

    const miss = await h.callerA.wellnessCheckins.forDay({
      memberId: IDS.memberA1,
      date: "1999-01-01",
    });
    expect(miss).toBeNull();
  });

  it("lists an org A member's check-ins, scoped to the org", async () => {
    const { items } = await h.callerA.wellnessCheckins.list({ memberId: IDS.memberA1 });
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.every((c) => c.organizationId === IDS.orgA)).toBe(true);
    expect(items.every((c) => c.memberId === IDS.memberA1)).toBe(true);
  });

  it("cross-tenant: org B caller cannot read an org A check-in by id (NOT_FOUND)", async () => {
    const created = await h.callerA.wellnessCheckins.upsert({
      memberId: IDS.memberA1,
      date: "2026-02-09",
      sleep: 7,
    });
    await expect(
      h.callerB.wellnessCheckins.byId({ id: created.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
