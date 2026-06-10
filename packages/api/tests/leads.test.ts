import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("leads.list", () => {
  it("returns only org A leads", async () => {
    const rows = await h.callerA.leads.list();
    expect(rows.map((l) => l.id).sort()).toEqual([IDS.leadA, IDS.leadA2]);
    expect(rows.every((l) => l.organizationId === IDS.orgA)).toBe(true);
  });

  it("filters by stage", async () => {
    const rows = await h.callerA.leads.list({ stage: "contacted" });
    expect(rows.map((l) => l.id)).toEqual([IDS.leadA2]);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.leads.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.leads.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller never sees org A leads", async () => {
    const rows = await h.callerB.leads.list();
    expect(rows.map((l) => l.id)).toEqual([IDS.leadB]);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      // @ts-expect-error — invalid stage on purpose
      h.callerA.leads.list({ stage: "won" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("leads.create", () => {
  it("creates a lead in org A", async () => {
    const created = await h.callerA.leads.create({
      name: "New Lead",
      email: "lead@example.com",
      stage: "lead",
    });
    expect(created?.organizationId).toBe(IDS.orgA);
    expect(created?.stage).toBe("lead");
  });

  it("validates the assigned coach belongs to the org (NOT_FOUND)", async () => {
    await expect(
      h.callerA.leads.create({
        name: "Coach Lead",
        stage: "lead",
        assignedCoachId: IDS.coachB,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.leads.create({ name: "X", stage: "lead" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.leads.create({ name: "X", stage: "lead" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: leads created by org B stay invisible to org A", async () => {
    await h.callerB.leads.create({ name: "B Lead", stage: "lead" });
    const rows = await h.callerA.leads.list();
    expect(rows.some((l) => l.name === "B Lead")).toBe(false);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.leads.create({ name: "", stage: "lead" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("leads.updateStage", () => {
  it("updates the stage and stamps lastContactAt", async () => {
    const updated = await h.callerA.leads.updateStage({
      id: IDS.leadA,
      stage: "trial_booked",
    });
    expect(updated?.stage).toBe("trial_booked");
    expect(updated?.lastContactAt).toBeInstanceOf(Date);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.leads.updateStage({ id: IDS.leadA, stage: "lost" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.leads.updateStage({ id: IDS.leadA, stage: "lost" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot mutate an org A lead (NOT_FOUND)", async () => {
    await expect(
      h.callerB.leads.updateStage({ id: IDS.leadA, stage: "lost" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const rows = await h.callerA.leads.list({ stage: "trial_booked" });
    expect(rows.map((l) => l.id)).toEqual([IDS.leadA]);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      // @ts-expect-error — invalid stage on purpose
      h.callerA.leads.updateStage({ id: IDS.leadA, stage: "deleted" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
