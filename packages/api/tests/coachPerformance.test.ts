import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("coaches.performance", () => {
  it("returns a derived performance shape for a real coach", async () => {
    const p = await h.callerA.coaches.performance({ id: "coach-a" });
    expect(p.classesThisMonth).toBeGreaterThanOrEqual(0);
    expect(p.avgAttendance).toBeGreaterThanOrEqual(0);
    expect(p.attendanceRate).toBeGreaterThanOrEqual(0);
    expect(p.attendanceRate).toBeLessThanOrEqual(100);
    expect(Array.isArray(p.attendanceTrend)).toBe(true);
    expect(Array.isArray(p.classBreakdown)).toBe(true);
    // Breakdown is sorted best-first, so bestClass >= worstClass when both exist.
    if (p.bestClass && p.worstClass) {
      expect(p.bestClass.avg).toBeGreaterThanOrEqual(p.worstClass.avg);
    }
  });

  it("throws NOT_FOUND for an unknown coach", async () => {
    await expect(h.callerA.coaches.performance({ id: "nope" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("cross-tenant: org B cannot read org A coach performance (NOT_FOUND)", async () => {
    await expect(h.callerB.coaches.performance({ id: "coach-a" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.coaches.performance({ id: "coach-a" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
