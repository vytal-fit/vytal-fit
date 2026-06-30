import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("dashboard.stats", () => {
  it("computes org A stats from org-scoped aggregates", async () => {
    const stats = await h.callerA.dashboard.stats();
    // Seed: memberA1, memberA2 active + memberA3 trial.
    expect(stats.activeMembers).toBe(2);
    // Seed: classA + classASmall today.
    expect(stats.classesToday).toBe(2);
    // Seed: bookingA booked now (defaultNow).
    expect(stats.bookingsToday).toBe(1);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.dashboard.stats()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.dashboard.stats()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B stats never include org A rows", async () => {
    const stats = await h.callerB.dashboard.stats();
    expect(stats.activeMembers).toBe(1);
    expect(stats.classesToday).toBe(1);
    expect(stats.bookingsToday).toBe(1);
  });

  it("stats change when org A data changes, org B unaffected", async () => {
    await h.callerA.members.create({
      name: "Extra",
      email: "extra@example.com",
      status: "active",
    });
    const statsA = await h.callerA.dashboard.stats();
    const statsB = await h.callerB.dashboard.stats();
    expect(statsA.activeMembers).toBe(3);
    expect(statsB.activeMembers).toBe(1);
  });
});

describe("dashboard.stats (extended) + occupancyByDay", () => {
  it("returns total members, MRR and occupancy as org-scoped numbers", async () => {
    const stats = await h.callerA.dashboard.stats();
    expect(stats.totalMembers).toBeGreaterThanOrEqual(stats.activeMembers);
    expect(typeof stats.monthlyRevenue).toBe("number");
    expect(stats.monthlyRevenue).toBeGreaterThanOrEqual(0);
    expect(stats.occupancyPercent).toBeGreaterThanOrEqual(0);
    expect(stats.occupancyPercent).toBeLessThanOrEqual(100);
  });

  it("occupancyByDay returns 7 days of 0–100 percentages", async () => {
    const days = await h.callerA.dashboard.occupancyByDay();
    expect(days).toHaveLength(7);
    expect(days.every((d) => typeof d.date === "string")).toBe(true);
    expect(days.every((d) => d.occupancy >= 0 && d.occupancy <= 100)).toBe(true);
  });

  it("occupancyByDay requires a session", async () => {
    await expect(h.callerNoSession.dashboard.occupancyByDay()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
