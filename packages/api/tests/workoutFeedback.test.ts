import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("workoutFeedback.create", () => {
  it("lets an athlete log feedback for their OWN member profile", async () => {
    const created = await h.callerAthleteA.workoutFeedback.create({
      memberId: IDS.memberA1, // linked to the athlete user in the harness
      classId: IDS.classA,
      rpe: 8,
      enjoyment: 9,
      injuryLimitation: 1,
      notes: "Felt strong.",
    });
    expect(created?.organizationId).toBe(IDS.orgA);
    expect(created?.memberId).toBe(IDS.memberA1);
    expect(created?.rpe).toBe(8);
  });

  it("forbids an athlete logging feedback for someone else's member", async () => {
    await expect(
      h.callerAthleteA.workoutFeedback.create({ memberId: IDS.memberA2, rpe: 5 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("lets a coach log feedback for any member in the org", async () => {
    const created = await h.callerCoachA.workoutFeedback.create({
      memberId: IDS.memberA2,
      rpe: 6,
      enjoyment: 7,
    });
    expect(created?.memberId).toBe(IDS.memberA2);
  });

  it("rejects an out-of-range scale (Zod 1–9)", async () => {
    await expect(
      h.callerCoachA.workoutFeedback.create({ memberId: IDS.memberA1, rpe: 10 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("cross-tenant: org B caller cannot log for an org A member (NOT_FOUND)", async () => {
    await expect(
      h.callerB.workoutFeedback.create({ memberId: IDS.memberA1, rpe: 5 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.workoutFeedback.create({ memberId: IDS.memberA1, rpe: 5 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.workoutFeedback.create({ memberId: IDS.memberA1, rpe: 5 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("workoutFeedback.list / byId", () => {
  it("lists an org A member's feedback, scoped to the org", async () => {
    const { items } = await h.callerA.workoutFeedback.list({ memberId: IDS.memberA1 });
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.every((f) => f.organizationId === IDS.orgA)).toBe(true);
    expect(items.every((f) => f.memberId === IDS.memberA1)).toBe(true);
  });

  it("cross-tenant: org B caller cannot read an org A feedback by id (NOT_FOUND)", async () => {
    const created = await h.callerA.workoutFeedback.create({
      memberId: IDS.memberA1,
      rpe: 7,
    });
    await expect(
      h.callerB.workoutFeedback.byId({ id: created.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
