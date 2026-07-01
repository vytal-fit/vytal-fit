import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("classes feedback", () => {
  it("submits feedback and aggregates it (average + distribution)", async () => {
    await h.callerAthleteA.classes.submitFeedback({ classId: "class-a", rating: 5, comment: "Great" });
    await h.callerA.classes.submitFeedback({ classId: "class-a", rating: 3 });
    const fb = await h.callerA.classes.feedback({ classId: "class-a" });
    expect(fb.count).toBe(2);
    expect(fb.average).toBe(4);
    expect(fb.distribution.find((d) => d.stars === 5)?.count).toBe(1);
    expect(fb.items.some((i) => i.comment === "Great")).toBe(true);
  });

  it("is org-scoped: org B sees no feedback for org A's class", async () => {
    const fb = await h.callerB.classes.feedback({ classId: "class-a" });
    expect(fb.count).toBe(0);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.classes.feedback({ classId: "x" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
