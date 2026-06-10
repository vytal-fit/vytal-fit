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
