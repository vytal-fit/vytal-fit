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

describe("leads.get", () => {
  it("returns the lead with its coach and activity timeline", async () => {
    const lead = await h.callerA.leads.get({ id: IDS.leadA });
    expect(lead.id).toBe(IDS.leadA);
    expect(lead.organizationId).toBe(IDS.orgA);
    expect(Array.isArray(lead.activities)).toBe(true);
    expect("coach" in lead).toBe(true);
  });

  it("throws NOT_FOUND for an unknown id", async () => {
    await expect(h.callerA.leads.get({ id: "nope" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("cross-tenant: org B caller cannot read an org A lead (NOT_FOUND)", async () => {
    await expect(h.callerB.leads.get({ id: IDS.leadA })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.leads.get({ id: IDS.leadA })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

describe("leads.update", () => {
  it("edits profile fields without resetting others", async () => {
    const updated = await h.callerA.leads.update({
      id: IDS.leadA,
      notes: "Prefers morning WODs",
      phone: "+351900000000",
    });
    expect(updated?.notes).toBe("Prefers morning WODs");
    expect(updated?.phone).toBe("+351900000000");
    // name was never touched by this patch — must survive
    expect(updated?.name).toBeTruthy();
  });

  it("validates the assigned coach belongs to the org (NOT_FOUND)", async () => {
    await expect(
      h.callerA.leads.update({ id: IDS.leadA, assignedCoachId: IDS.coachB }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("cross-tenant: org B caller cannot edit an org A lead (NOT_FOUND)", async () => {
    await expect(
      h.callerB.leads.update({ id: IDS.leadA, notes: "hax" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("athlete gets FORBIDDEN (staff+)", async () => {
    await expect(
      h.callerAthleteA.leads.update({ id: IDS.leadA, notes: "x" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("leads.logActivity", () => {
  it("appends a timeline entry and stamps lastContactAt", async () => {
    const created = await h.callerA.leads.logActivity({
      leadId: IDS.leadA,
      type: "call",
      title: "Phone call logged",
      details: "Discussed schedule",
    });
    expect(created?.type).toBe("call");
    expect(created?.organizationId).toBe(IDS.orgA);

    const lead = await h.callerA.leads.get({ id: IDS.leadA });
    expect(lead.activities.some((a) => a.title === "Phone call logged")).toBe(true);
  });

  it("cross-tenant: org B caller cannot log on an org A lead (NOT_FOUND)", async () => {
    await expect(
      h.callerB.leads.logActivity({ leadId: IDS.leadA, type: "note", title: "x" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("athlete gets FORBIDDEN (staff+)", async () => {
    await expect(
      h.callerAthleteA.leads.logActivity({ leadId: IDS.leadA, type: "note", title: "x" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects invalid activity type (Zod)", async () => {
    await expect(
      // @ts-expect-error — invalid type on purpose
      h.callerA.leads.logActivity({ leadId: IDS.leadA, type: "carrier_pigeon", title: "x" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("leads.delete", () => {
  it("athlete and coach get FORBIDDEN (admin+)", async () => {
    await expect(
      h.callerAthleteA.leads.delete({ id: IDS.leadA }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      h.callerCoachA.leads.delete({ id: IDS.leadA }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.leads.delete({ id: IDS.leadA }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.leads.delete({ id: IDS.leadA })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller cannot delete an org A lead (NOT_FOUND)", async () => {
    await expect(h.callerB.leads.delete({ id: IDS.leadA })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    const rows = await h.callerA.leads.list();
    expect(rows.some((l) => l.id === IDS.leadA)).toBe(true);
  });

  it("throws NOT_FOUND for an unknown id", async () => {
    await expect(h.callerA.leads.delete({ id: "nope" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(h.callerA.leads.delete({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("owner hard-deletes a lead", async () => {
    const deleted = await h.callerA.leads.delete({ id: IDS.leadA2 });
    expect(deleted?.id).toBe(IDS.leadA2);
    const rows = await h.callerA.leads.list();
    expect(rows.some((l) => l.id === IDS.leadA2)).toBe(false);
  });
});

describe("leads.activityLog + stats", () => {
  it("activityLog returns org A entries with lead names", async () => {
    // Ensure at least one activity exists.
    await h.callerA.leads.logActivity({ leadId: IDS.leadA, type: "note", title: "Stats note" });
    const log = await h.callerA.leads.activityLog({});
    expect(log.length).toBeGreaterThanOrEqual(1);
    expect(log.every((e) => typeof e.leadName === "string")).toBe(true);
  });

  it("stats returns 6-month leads + source/conversion breakdowns", async () => {
    const s = await h.callerA.leads.stats();
    expect(s.leadsPerMonth).toHaveLength(6);
    expect(Array.isArray(s.leadsBySource)).toBe(true);
    expect(Array.isArray(s.conversionBySource)).toBe(true);
    expect(typeof s.activeLeads).toBe("number");
  });

  it("activityLog requires a session", async () => {
    await expect(h.callerNoSession.leads.activityLog({})).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
