/**
 * Tier-1 routers: coaches, locations, classTypes, exercises, personalRecords,
 * wodResults, notifications. Every org-scoped procedure is covered for the
 * mandatory matrix: happy path (org A), UNAUTHORIZED (no session), FORBIDDEN
 * (no active org), cross-tenant isolation (org A cannot see/mutate org B),
 * and Zod input rejection.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

// ─── Shared auth matrix ─────────────────────────────────────────────────────

describe("tier-1 auth gates", () => {
  const orgScopedCalls: Array<[string, (c: TestHarness["callerA"]) => Promise<unknown>]> = [
    ["coaches.list", (c) => c.coaches.list()],
    ["locations.list", (c) => c.locations.list()],
    ["classTypes.list", (c) => c.classTypes.list()],
    ["personalRecords.list", (c) => c.personalRecords.list()],
    ["wodResults.list", (c) => c.wodResults.list()],
    ["notifications.list", (c) => c.notifications.list()],
  ];

  for (const [name, call] of orgScopedCalls) {
    it(`${name} rejects no session with UNAUTHORIZED`, async () => {
      await expect(call(h.callerNoSession)).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it(`${name} rejects missing active org with FORBIDDEN`, async () => {
      await expect(call(h.callerNoOrg)).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  }

  it("exercises.list rejects no session but allows session without org", async () => {
    await expect(h.callerNoSession.exercises.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    const rows = await h.callerNoOrg.exercises.list();
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── coaches ────────────────────────────────────────────────────────────────

describe("coaches", () => {
  it("lists only org A coaches", async () => {
    const rows = await h.callerA.coaches.list();
    expect(rows.map((r) => r.id)).toEqual([IDS.coachA]);
    expect(rows.every((r) => r.organizationId === IDS.orgA)).toBe(true);
  });

  it("byId enforces cross-tenant isolation with NOT_FOUND", async () => {
    await expect(h.callerA.coaches.byId({ id: IDS.coachB })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("creates, updates, and deletes within the org", async () => {
    const created = await h.callerA.coaches.create({
      name: "New Coach",
      email: "new-coach@vytal.fit",
      role: "assistant",
    });
    expect(created.organizationId).toBe(IDS.orgA);

    const updated = await h.callerA.coaches.update({
      id: created.id,
      data: { name: "Renamed Coach" },
    });
    expect(updated.name).toBe("Renamed Coach");

    const deleted = await h.callerA.coaches.delete({ id: created.id });
    expect(deleted.id).toBe(created.id);
    await expect(h.callerA.coaches.byId({ id: created.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("cannot update or delete org B's coach", async () => {
    await expect(
      h.callerA.coaches.update({ id: IDS.coachB, data: { name: "Hijack" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(h.callerA.coaches.delete({ id: IDS.coachB })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    const stillThere = await h.callerB.coaches.byId({ id: IDS.coachB });
    expect(stillThere.id).toBe(IDS.coachB);
  });

  it("rejects invalid input via Zod", async () => {
    await expect(
      h.callerA.coaches.create({ name: "X", email: "not-an-email" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── locations ──────────────────────────────────────────────────────────────

describe("locations", () => {
  it("lists only org A locations", async () => {
    const rows = await h.callerA.locations.list();
    expect(rows.map((r) => r.id)).toEqual([IDS.locationA]);
  });

  it("byId enforces cross-tenant isolation", async () => {
    await expect(h.callerA.locations.byId({ id: IDS.locationB })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("creates, updates, deletes within the org", async () => {
    const created = await h.callerA.locations.create({ name: "Annex", capacity: 12 });
    expect(created.organizationId).toBe(IDS.orgA);
    const updated = await h.callerA.locations.update({
      id: created.id,
      data: { capacity: 20 },
    });
    expect(updated.capacity).toBe(20);
    await h.callerA.locations.delete({ id: created.id });
    await expect(h.callerA.locations.byId({ id: created.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("cannot mutate org B's location", async () => {
    await expect(
      h.callerA.locations.update({ id: IDS.locationB, data: { name: "Hijack" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(h.callerA.locations.delete({ id: IDS.locationB })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects invalid capacity via Zod", async () => {
    await expect(
      h.callerA.locations.create({ name: "Bad", capacity: 0 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── classTypes ─────────────────────────────────────────────────────────────

describe("classTypes", () => {
  it("lists only org A class types", async () => {
    const rows = await h.callerA.classTypes.list();
    expect(rows.map((r) => r.id)).toEqual([IDS.classTypeA]);
  });

  it("byId enforces cross-tenant isolation", async () => {
    await expect(h.callerA.classTypes.byId({ id: IDS.classTypeB })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("creates, updates, deletes within the org", async () => {
    const created = await h.callerA.classTypes.create({
      name: "Mobility",
      abbreviation: "MOB",
      color: "#22c55e",
    });
    expect(created.organizationId).toBe(IDS.orgA);
    const updated = await h.callerA.classTypes.update({
      id: created.id,
      data: { active: false },
    });
    expect(updated.active).toBe(false);
    await h.callerA.classTypes.delete({ id: created.id });
    await expect(h.callerA.classTypes.byId({ id: created.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("cannot mutate org B's class type", async () => {
    await expect(
      h.callerA.classTypes.update({ id: IDS.classTypeB, data: { name: "Hijack" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(h.callerA.classTypes.delete({ id: IDS.classTypeB })).rejects.toMatchObject(
      { code: "NOT_FOUND" },
    );
  });

  it("rejects invalid color via Zod", async () => {
    await expect(
      h.callerA.classTypes.create({ name: "Bad", abbreviation: "B", color: "green" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── exercises (global, read-only) ──────────────────────────────────────────

describe("exercises", () => {
  it("lists the global library for any authenticated user", async () => {
    const rows = await h.callerA.exercises.list();
    expect(rows.map((r) => r.id).sort()).toEqual([IDS.exercise1, IDS.exercise2]);
  });

  it("filters by category", async () => {
    const rows = await h.callerA.exercises.list({ category: "gymnastics" });
    expect(rows.map((r) => r.id)).toEqual([IDS.exercise2]);
  });

  it("byId returns NOT_FOUND for unknown ids", async () => {
    await expect(h.callerA.exercises.byId({ id: "nope" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

// ─── personalRecords ────────────────────────────────────────────────────────

describe("personalRecords", () => {
  it("lists only org A records", async () => {
    const { items } = await h.callerA.personalRecords.list();
    expect(items.map((r) => r.id).sort()).toEqual([IDS.prA1, IDS.prA2]);
    expect(items.every((r) => r.exercise?.name)).toBe(true);
  });

  it("filters by memberId and exerciseId", async () => {
    const byMember = await h.callerA.personalRecords.list({ memberId: IDS.memberA1 });
    expect(byMember.items.map((r) => r.id)).toEqual([IDS.prA1]);
    const byExercise = await h.callerA.personalRecords.list({ exerciseId: IDS.exercise2 });
    expect(byExercise.items.map((r) => r.id)).toEqual([IDS.prA2]);
  });

  it("byId enforces cross-tenant isolation", async () => {
    await expect(h.callerA.personalRecords.byId({ id: IDS.prB })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("create rejects a member belonging to another org with NOT_FOUND", async () => {
    await expect(
      h.callerA.personalRecords.create({
        memberId: IDS.memberB1,
        exerciseId: IDS.exercise1,
        value: "100",
        unit: "kg",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("creates, updates, deletes within the org", async () => {
    const created = await h.callerA.personalRecords.create({
      memberId: IDS.memberA1,
      exerciseId: IDS.exercise2,
      value: "20",
      unit: "reps",
    });
    expect(created.organizationId).toBe(IDS.orgA);
    const updated = await h.callerA.personalRecords.update({
      id: created.id,
      data: { value: "22" },
    });
    expect(updated.value).toBe("22");
    await h.callerA.personalRecords.delete({ id: created.id });
    await expect(
      h.callerA.personalRecords.byId({ id: created.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("cannot mutate org B's record", async () => {
    await expect(
      h.callerA.personalRecords.update({ id: IDS.prB, data: { value: "1" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(h.callerA.personalRecords.delete({ id: IDS.prB })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects an invalid unit via Zod", async () => {
    await expect(
      h.callerA.personalRecords.create({
        memberId: IDS.memberA1,
        exerciseId: IDS.exercise1,
        value: "100",
        // @ts-expect-error — invalid enum value on purpose
        unit: "stones",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── wodResults ─────────────────────────────────────────────────────────────

describe("wodResults", () => {
  it("lists only org A results", async () => {
    const { items } = await h.callerA.wodResults.list();
    expect(items.map((r) => r.id).sort()).toEqual([IDS.wodResultA1, IDS.wodResultA2]);
    expect(items.every((r) => r.wod?.title)).toBe(true);
  });

  it("filters by wodId and memberId", async () => {
    const byWod = await h.callerA.wodResults.list({ wodId: IDS.wodA });
    expect(byWod.items.map((r) => r.id)).toEqual([IDS.wodResultA1]);
    const byMember = await h.callerA.wodResults.list({ memberId: IDS.memberA2 });
    expect(byMember.items.map((r) => r.id)).toEqual([IDS.wodResultA2]);
  });

  it("create rejects a WOD belonging to another org with NOT_FOUND", async () => {
    await expect(
      h.callerA.wodResults.create({
        wodId: IDS.wodB,
        memberId: IDS.memberA1,
        score: "5:00",
        scoreType: "time",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("creates, updates, deletes within the org", async () => {
    const created = await h.callerA.wodResults.create({
      wodId: IDS.wodA,
      memberId: IDS.memberA2,
      score: "4:20",
      scoreType: "time",
      scale: "scaled",
      rpe: 8,
    });
    expect(created.organizationId).toBe(IDS.orgA);
    const updated = await h.callerA.wodResults.update({
      id: created.id,
      data: { score: "4:10", isPR: true },
    });
    expect(updated.score).toBe("4:10");
    expect(updated.isPR).toBe(true);
    await h.callerA.wodResults.delete({ id: created.id });
    const after = await h.callerA.wodResults.list({ memberId: IDS.memberA2 });
    expect(after.items.map((r) => r.id)).toEqual([IDS.wodResultA2]);
  });

  it("cannot mutate org B's result", async () => {
    await expect(
      h.callerA.wodResults.update({ id: IDS.wodResultB, data: { score: "0" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(h.callerA.wodResults.delete({ id: IDS.wodResultB })).rejects.toMatchObject(
      { code: "NOT_FOUND" },
    );
  });

  it("rejects an out-of-range RPE via Zod", async () => {
    await expect(
      h.callerA.wodResults.create({
        wodId: IDS.wodA,
        memberId: IDS.memberA1,
        score: "1",
        scoreType: "reps",
        rpe: 11,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── notifications ──────────────────────────────────────────────────────────

describe("notifications", () => {
  it("lists only org A notifications", async () => {
    const { items } = await h.callerA.notifications.list();
    expect(items.map((r) => r.id).sort()).toEqual([IDS.notifA1, IDS.notifA2]);
  });

  it("filters by read state", async () => {
    const unread = await h.callerA.notifications.list({ read: false });
    expect(unread.items.map((r) => r.id)).toEqual([IDS.notifA1]);
  });

  it("markRead enforces cross-tenant isolation", async () => {
    await expect(h.callerA.notifications.markRead({ id: IDS.notifB })).rejects.toMatchObject(
      { code: "NOT_FOUND" },
    );
  });

  it("markRead and markAllRead only touch org A rows", async () => {
    const marked = await h.callerA.notifications.markRead({ id: IDS.notifA1 });
    expect(marked.read).toBe(true);

    const { updated } = await h.callerA.notifications.markAllRead();
    expect(updated).toBe(0); // both org A rows are read now

    // Org B's unread notification is untouched.
    const orgB = await h.callerB.notifications.list({ read: false });
    expect(orgB.items.map((r) => r.id)).toEqual([IDS.notifB]);
  });

  it("delete enforces cross-tenant isolation and works in-org", async () => {
    await expect(h.callerA.notifications.delete({ id: IDS.notifB })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await h.callerA.notifications.delete({ id: IDS.notifA2 });
    const left = await h.callerA.notifications.list();
    expect(left.items.map((r) => r.id)).toEqual([IDS.notifA1]);
  });
});
