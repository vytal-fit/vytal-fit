import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("today.briefing", () => {
  it("returns a structured briefing for the caller's org", async () => {
    const b = await h.callerA.today.briefing();
    expect(typeof b.date).toBe("string");
    expect(Array.isArray(b.agenda)).toBe(true);
    expect(Array.isArray(b.focus)).toBe(true);
    expect(Array.isArray(b.todos)).toBe(true);
    expect(Array.isArray(b.highlights)).toBe(true);
    expect(b.counts).toBeDefined();
    expect(typeof b.counts.classesToday).toBe("number");
  });

  it("agenda entries carry class-type + capacity + coach info", async () => {
    const b = await h.callerA.today.briefing();
    for (const a of b.agenda) {
      expect(typeof a.name).toBe("string");
      expect(typeof a.startTime).toBe("string");
      expect(typeof a.maxCapacity).toBe("number");
      expect(a.enrolled).toBeGreaterThanOrEqual(0);
      expect(typeof a.hasCoach).toBe("boolean");
    }
  });

  it("is org-scoped: org B briefing derives only from org B data", async () => {
    const b = await h.callerB.today.briefing();
    expect(b.counts.newLeads).toBeGreaterThanOrEqual(0);
    expect(b.counts.pendingPayments).toBeGreaterThanOrEqual(0);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.today.briefing()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
