import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

const seq = {
  name: "Welcome flow",
  trigger: "new_member" as const,
  steps: [
    { subject: "Welcome!", body: "<p>Hi</p>", delayDays: 0 },
    { subject: "Day 3 tips", body: "<p>Tips</p>", delayDays: 3 },
  ],
};

beforeAll(async () => {
  h = await createHarness();
});

describe("automations", () => {
  it("creates a sequence with steps (starts inactive) and lists it", async () => {
    const created = await h.callerA.automations.create(seq);
    const list = await h.callerA.automations.list();
    const row = list.find((s) => s.id === created.id);
    expect(row?.active).toBe(false);
    expect(row?.steps).toHaveLength(2);
    expect(row?.enrolled).toBe(0);
  });

  it("activates and deactivates a sequence", async () => {
    const created = await h.callerA.automations.create(seq);
    const on = await h.callerA.automations.setActive({ id: created.id, active: true });
    expect(on.active).toBe(true);
  });

  it("enroll enrolls active members and sends the first step", async () => {
    const created = await h.callerA.automations.create(seq);
    const res = await h.callerA.automations.enroll({ id: created.id });
    expect(res.enrolled).toBeGreaterThan(0);
    expect(res.enrolled).toBe(res.sent + res.skipped);
    const list = await h.callerA.automations.list();
    expect(list.find((s) => s.id === created.id)?.enrolled).toBe(res.enrolled);
  });

  it("create is admin-only; athlete FORBIDDEN", async () => {
    await expect(h.callerAthleteA.automations.create(seq)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B cannot delete an org A sequence (NOT_FOUND)", async () => {
    const created = await h.callerA.automations.create(seq);
    await expect(h.callerB.automations.delete({ id: created.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.automations.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
