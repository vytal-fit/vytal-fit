/**
 * Regression: zod applies .default() even inside .partial(), so update
 * procedures built from a naive `createInput.partial()` silently reset
 * defaulted fields (status → "active", role → "coach", active → true,
 * scale → "rx", isPR → false) on every partial update. These tests fail
 * against the naive pattern and pass with default-stripped update inputs.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("partial updates do not reset defaulted fields", () => {
  it("members.update keeps a non-active status when editing another field", async () => {
    // memberA3 is seeded as "trial"
    const before = await h.callerA.members.byId({ id: IDS.memberA3 });
    expect(before.status).toBe("trial");

    const updated = await h.callerA.members.update({
      id: IDS.memberA3,
      data: { phone: "+351 900 000 001" },
    });
    expect(updated.status).toBe("trial");
  });

  it("coaches.update keeps a non-default role when renaming", async () => {
    const promoted = await h.callerA.coaches.update({
      id: IDS.coachA,
      data: { role: "head_coach" },
    });
    expect(promoted.role).toBe("head_coach");

    const renamed = await h.callerA.coaches.update({
      id: IDS.coachA,
      data: { name: "Renamed Head Coach" },
    });
    expect(renamed.role).toBe("head_coach");
  });

  it("classTypes.update keeps active=false when editing another field", async () => {
    const deactivated = await h.callerA.classTypes.update({
      id: IDS.classTypeA,
      data: { active: false },
    });
    expect(deactivated.active).toBe(false);

    const recolored = await h.callerA.classTypes.update({
      id: IDS.classTypeA,
      data: { color: "#112233" },
    });
    expect(recolored.active).toBe(false);

    // restore for other suites sharing the harness file
    await h.callerA.classTypes.update({ id: IDS.classTypeA, data: { active: true } });
  });

  it("wodResults.update keeps scale and isPR when editing the score", async () => {
    const flagged = await h.callerA.wodResults.update({
      id: IDS.wodResultA2,
      data: { isPR: true },
    });
    expect(flagged.isPR).toBe(true);
    expect(flagged.scale).toBe("scaled"); // seeded as scaled

    const rescored = await h.callerA.wodResults.update({
      id: IDS.wodResultA2,
      data: { score: "21+3" },
    });
    expect(rescored.scale).toBe("scaled");
    expect(rescored.isPR).toBe(true);
  });
});
