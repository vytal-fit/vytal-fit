import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("members.retention", () => {
  it("returns a 16-week cohort shape scoped to the org", async () => {
    const rows = await h.callerA.members.retention();
    expect(Array.isArray(rows)).toBe(true);
    for (const r of rows) {
      expect(r.weeklyAttendance).toHaveLength(16);
      expect(r.joinWeek).toBeGreaterThanOrEqual(0);
      expect(r.joinWeek).toBeLessThanOrEqual(15);
      expect(r.weeklyAttendance.every((n) => n >= 0)).toBe(true);
    }
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.members.retention()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
