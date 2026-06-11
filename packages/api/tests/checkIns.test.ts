/**
 * checkIns router — full matrix:
 *  - auth: UNAUTHORIZED without a session, FORBIDDEN without an active org
 *  - list: org-scoped, filters (memberId / classId / date range), pagination
 *  - todayStats: today's totals + unique members
 *  - create: coach+ (athlete FORBIDDEN), cross-tenant NOT_FOUND for foreign
 *    member/class/booking ids, duplicate member+class CONFLICT, Zod rejection
 *  - delete: admin+ and org-scoped (cross-tenant NOT_FOUND)
 */
import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, todayString, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

const UNAUTHORIZED = { code: "UNAUTHORIZED" } as const;
const FORBIDDEN = { code: "FORBIDDEN" } as const;
const NOT_FOUND = { code: "NOT_FOUND" } as const;
const CONFLICT = { code: "CONFLICT" } as const;
const BAD_REQUEST = { code: "BAD_REQUEST" } as const;

describe("auth gates", () => {
  it("rejects callers without a session", async () => {
    await expect(h.callerNoSession.checkIns.list()).rejects.toMatchObject(UNAUTHORIZED);
    await expect(h.callerNoSession.checkIns.todayStats()).rejects.toMatchObject(
      UNAUTHORIZED,
    );
    await expect(
      h.callerNoSession.checkIns.create({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject(UNAUTHORIZED);
    await expect(
      h.callerNoSession.checkIns.delete({ id: IDS.checkInA1 }),
    ).rejects.toMatchObject(UNAUTHORIZED);
  });

  it("rejects callers without an active organization", async () => {
    await expect(h.callerNoOrg.checkIns.list()).rejects.toMatchObject(FORBIDDEN);
    await expect(h.callerNoOrg.checkIns.todayStats()).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerNoOrg.checkIns.create({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerNoOrg.checkIns.delete({ id: IDS.checkInA1 }),
    ).rejects.toMatchObject(FORBIDDEN);
  });
});

describe("list", () => {
  it("returns only the active org's check-ins", async () => {
    const { items } = await h.callerA.checkIns.list();
    expect(items).toHaveLength(3);
    expect(items.every((c) => c.organizationId === IDS.orgA)).toBe(true);
    expect(items.map((c) => c.id)).not.toContain(IDS.checkInB);

    const orgB = await h.callerB.checkIns.list();
    expect(orgB.items.map((c) => c.id)).toEqual([IDS.checkInB]);
  });

  it("athletes can read check-ins (org member read)", async () => {
    const { items } = await h.callerAthleteA.checkIns.list();
    expect(items).toHaveLength(3);
  });

  it("filters by memberId", async () => {
    const { items } = await h.callerA.checkIns.list({ memberId: IDS.memberA1 });
    expect(items.map((c) => c.id)).toEqual([IDS.checkInA1]);
  });

  it("filters by classId", async () => {
    const { items } = await h.callerA.checkIns.list({ classId: IDS.classA });
    expect(items.map((c) => c.id)).toEqual([IDS.checkInA1]);
  });

  it("filters by date range", async () => {
    const today = await h.callerA.checkIns.list({ from: todayString() });
    expect(today.items.map((c) => c.id).sort()).toEqual([
      IDS.checkInA1,
      IDS.checkInA3,
    ]);

    const history = await h.callerA.checkIns.list({ to: todayString(-1) });
    expect(history.items.map((c) => c.id)).toEqual([IDS.checkInA2]);
  });

  it("paginates with a cursor", async () => {
    const first = await h.callerA.checkIns.list({ limit: 2 });
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).not.toBeNull();

    const second = await h.callerA.checkIns.list({
      limit: 2,
      cursor: first.nextCursor,
    });
    expect(second.items).toHaveLength(1);
    expect(second.nextCursor).toBeNull();

    const all = [...first.items, ...second.items].map((c) => c.id);
    expect(new Set(all).size).toBe(3);
  });
});

describe("todayStats", () => {
  it("counts today's check-ins and unique members, per org", async () => {
    const statsA = await h.callerA.checkIns.todayStats();
    expect(statsA).toEqual({ total: 2, uniqueMembers: 2 });

    const statsB = await h.callerB.checkIns.todayStats();
    expect(statsB).toEqual({ total: 1, uniqueMembers: 1 });
  });
});

describe("create — coach+", () => {
  it("athlete gets FORBIDDEN", async () => {
    await expect(
      h.callerAthleteA.checkIns.create({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("Coach"),
    });
  });

  it("coach can check a member into a class", async () => {
    const created = await h.callerCoachA.checkIns.create({
      memberId: IDS.memberA2,
      classId: IDS.classA,
      method: "qr",
    });
    expect(created?.organizationId).toBe(IDS.orgA);
    expect(created?.memberId).toBe(IDS.memberA2);
    expect(created?.classId).toBe(IDS.classA);
    expect(created?.method).toBe("qr");
  });

  it("supports open-gym check-ins (no class) and defaults method to manual", async () => {
    const created = await h.callerCoachA.checkIns.create({
      memberId: IDS.memberA3,
    });
    expect(created?.classId).toBeNull();
    expect(created?.bookingId).toBeNull();
    expect(created?.method).toBe("manual");
  });

  it("rejects a duplicate same-member-same-class check-in with CONFLICT", async () => {
    // checkin-a1 already checks member-a1 into class-a.
    await expect(
      h.callerCoachA.checkIns.create({
        memberId: IDS.memberA1,
        classId: IDS.classA,
      }),
    ).rejects.toMatchObject(CONFLICT);
  });

  it("allows repeated open-gym check-ins for the same member", async () => {
    const again = await h.callerCoachA.checkIns.create({
      memberId: IDS.memberA3,
      method: "kiosk",
    });
    expect(again?.id).toBeTruthy();
  });

  it("cross-tenant: org A cannot check in org B's member, class, or booking", async () => {
    await expect(
      h.callerA.checkIns.create({ memberId: IDS.memberB1 }),
    ).rejects.toMatchObject(NOT_FOUND);
    await expect(
      h.callerA.checkIns.create({ memberId: IDS.memberA1, classId: IDS.classB }),
    ).rejects.toMatchObject(NOT_FOUND);
    await expect(
      h.callerA.checkIns.create({
        memberId: IDS.memberA1,
        bookingId: IDS.bookingB,
      }),
    ).rejects.toMatchObject(NOT_FOUND);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerCoachA.checkIns.create({ memberId: "" }),
    ).rejects.toMatchObject(BAD_REQUEST);
    await expect(
      h.callerCoachA.checkIns.create({
        memberId: IDS.memberA1,
        // @ts-expect-error invalid method value
        method: "teleport",
      }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });
});

describe("delete — admin+", () => {
  it("coach and athlete get FORBIDDEN", async () => {
    await expect(
      h.callerCoachA.checkIns.delete({ id: IDS.checkInA2 }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("Admin"),
    });
    await expect(
      h.callerAthleteA.checkIns.delete({ id: IDS.checkInA2 }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("cross-tenant: org B cannot delete org A's check-in", async () => {
    await expect(
      h.callerB.checkIns.delete({ id: IDS.checkInA2 }),
    ).rejects.toMatchObject(NOT_FOUND);
  });

  it("owner can delete an own-org check-in (and a re-delete is NOT_FOUND)", async () => {
    const deleted = await h.callerA.checkIns.delete({ id: IDS.checkInA2 });
    expect(deleted.id).toBe(IDS.checkInA2);
    await expect(
      h.callerA.checkIns.delete({ id: IDS.checkInA2 }),
    ).rejects.toMatchObject(NOT_FOUND);
  });
});
