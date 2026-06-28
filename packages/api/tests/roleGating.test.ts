/**
 * Role gating across all routers.
 *
 * Policy:
 *  - READS (list/byId/dashboard/stats)            → any org member
 *  - notifications.markRead / markAllRead         → any org member
 *  - Operational writes (classes, wods, leads)    → coach or above
 *  - Athlete self-service writes
 *    (bookings, wodResults/PRs create+update)     → own member only; coach+ any member
 *  - Destructive/management (members CRUD,
 *    coaches/locations/classTypes CRUD, plans &
 *    subscriptions create, deletes)               → admin or above
 *
 * Every gated procedure is asserted both ways: the minimum allowed role
 * passes, the role just below gets FORBIDDEN.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { parseHighestRole } from "../src/trpc";
import { IDS, createHarness, todayString, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

const FORBIDDEN = { code: "FORBIDDEN" } as const;

// ─────────────────────────────────────────────────────────────────────────────
// parseHighestRole — better-auth comma-separated multi-role strings
// ─────────────────────────────────────────────────────────────────────────────

describe("parseHighestRole", () => {
  it("returns the single role as-is", () => {
    expect(parseHighestRole("coach")).toBe("coach");
  });

  it("picks the highest-ranked role from a comma-separated string", () => {
    expect(parseHighestRole("admin,coach")).toBe("admin");
    expect(parseHighestRole("athlete,owner")).toBe("owner");
    expect(parseHighestRole("pt, coach")).toBe("coach");
  });

  it("ignores unknown tokens", () => {
    expect(parseHighestRole("member,athlete")).toBe("athlete");
    expect(parseHighestRole("member")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(parseHighestRole("")).toBeNull();
    expect(parseHighestRole(null)).toBeNull();
    expect(parseHighestRole(undefined)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Reads stay open to every org member (athlete included)
// ─────────────────────────────────────────────────────────────────────────────

describe("reads as athlete", () => {
  it("athlete can read org data (members.list, classes.list, dashboard.stats)", async () => {
    const { items } = await h.callerAthleteA.members.list();
    expect(items.length).toBeGreaterThan(0);
    const classes = await h.callerAthleteA.classes.list({
      from: todayString(),
      to: todayString(),
    });
    expect(classes.length).toBeGreaterThan(0);
    const stats = await h.callerAthleteA.dashboard.stats();
    expect(stats).toBeDefined();
  });

  it("athlete can markRead / markAllRead notifications", async () => {
    const updated = await h.callerAthleteA.notifications.markRead({
      id: IDS.notifA1,
    });
    expect(updated.read).toBe(true);
    const { updated: n } = await h.callerAthleteA.notifications.markAllRead({});
    expect(n).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Operational writes — coach or above (athlete FORBIDDEN)
// ─────────────────────────────────────────────────────────────────────────────

describe("classes create/cancel — coach+", () => {
  const input = {
    classTypeId: IDS.classTypeA,
    locationId: IDS.locationA,
    coachIds: [IDS.coachA],
    date: todayString(1),
    startTime: "18:00",
    endTime: "19:00",
    maxCapacity: 12,
  };

  it("athlete gets FORBIDDEN with a clear message", async () => {
    await expect(h.callerAthleteA.classes.create(input)).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("Coach"),
    });
  });

  it("coach can create and cancel a class", async () => {
    const created = await h.callerCoachA.classes.create(input);
    expect(created.organizationId).toBe(IDS.orgA);
    await expect(
      h.callerAthleteA.classes.cancel({ id: created.id }),
    ).rejects.toMatchObject(FORBIDDEN);
    const cancelled = await h.callerCoachA.classes.cancel({ id: created.id });
    expect(cancelled.cancelledAt).not.toBeNull();
  });
});

describe("wods create/publish — coach+", () => {
  it("athlete gets FORBIDDEN on create and publish", async () => {
    await expect(
      h.callerAthleteA.wods.create({
        classTypeId: IDS.classTypeA,
        date: todayString(1),
        title: "NOPE",
        parts: [],
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerAthleteA.wods.publish({ id: IDS.wodA }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("coach can create and publish a WOD", async () => {
    const created = await h.callerCoachA.wods.create({
      classTypeId: IDS.classTypeA,
      date: todayString(2),
      title: "COACH WOD",
      parts: [],
    });
    expect(created.organizationId).toBe(IDS.orgA);
    const published = await h.callerCoachA.wods.publish({ id: created.id });
    expect(published.publishedAt).not.toBeNull();
  });
});

describe("leads create/updateStage — coach+", () => {
  it("athlete gets FORBIDDEN on create and updateStage", async () => {
    await expect(
      h.callerAthleteA.leads.create({ name: "Nope Lead", stage: "lead" }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerAthleteA.leads.updateStage({ id: IDS.leadA, stage: "contacted" }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("coach can create a lead and move its stage", async () => {
    const created = await h.callerCoachA.leads.create({
      name: "Coach Lead",
      stage: "lead",
    });
    expect(created.organizationId).toBe(IDS.orgA);
    const moved = await h.callerCoachA.leads.updateStage({
      id: created.id,
      stage: "contacted",
    });
    expect(moved.stage).toBe("contacted");
  });
});

describe("bookings book/cancel — athlete own member or coach+", () => {
  it("athlete can book and cancel for their linked member profile", async () => {
    const booked = await h.callerAthleteA.bookings.book({
      classId: IDS.classASmall,
      memberId: IDS.memberA1,
    });
    expect(booked.organizationId).toBe(IDS.orgA);
    expect(booked.memberId).toBe(IDS.memberA1);

    const cancelled = await h.callerAthleteA.bookings.cancel({ id: booked.id });
    expect(cancelled.status).toBe("cancelled");
  });

  it("athlete gets FORBIDDEN on another member's booking", async () => {
    const otherMemberBooking = await h.callerCoachA.bookings.book({
      classId: IDS.classA,
      memberId: IDS.memberA3,
    });

    await expect(
      h.callerAthleteA.bookings.book({
        classId: IDS.classA,
        memberId: IDS.memberA2,
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerAthleteA.bookings.cancel({ id: otherMemberBooking.id }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("coach can book and cancel", async () => {
    const booked = await h.callerCoachA.bookings.book({
      classId: IDS.classA,
      memberId: IDS.memberA2,
    });
    expect(booked.organizationId).toBe(IDS.orgA);
    const cancelled = await h.callerCoachA.bookings.cancel({ id: booked.id });
    expect(cancelled.status).toBe("cancelled");
  });
});

describe("wodResults create/update — athlete own member or coach+", () => {
  it("athlete can create and update their own result", async () => {
    const created = await h.callerAthleteA.wodResults.create({
      wodId: IDS.wodAPublished,
      memberId: IDS.memberA1,
      score: "4:00",
      scoreType: "time",
    });
    expect(created.memberId).toBe(IDS.memberA1);

    const updated = await h.callerAthleteA.wodResults.update({
      id: created.id,
      data: { score: "3:50" },
    });
    expect(updated.score).toBe("3:50");
  });

  it("athlete gets FORBIDDEN on another member's result", async () => {
    await expect(
      h.callerAthleteA.wodResults.create({
        wodId: IDS.wodA,
        memberId: IDS.memberA2,
        score: "4:00",
        scoreType: "time",
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerAthleteA.wodResults.update({
        id: IDS.wodResultA2,
        data: { score: "3:30" },
      }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("coach can create and update a result", async () => {
    const created = await h.callerCoachA.wodResults.create({
      wodId: IDS.wodA,
      memberId: IDS.memberA2,
      score: "5:10",
      scoreType: "time",
    });
    expect(created.organizationId).toBe(IDS.orgA);
    const updated = await h.callerCoachA.wodResults.update({
      id: created.id,
      data: { score: "5:00" },
    });
    expect(updated.score).toBe("5:00");
  });
});

describe("personalRecords create/update — athlete own member or coach+", () => {
  it("athlete can create and update their own PR", async () => {
    const created = await h.callerAthleteA.personalRecords.create({
      memberId: IDS.memberA1,
      exerciseId: IDS.exercise2,
      value: "20",
      unit: "reps",
    });
    expect(created.memberId).toBe(IDS.memberA1);

    const updated = await h.callerAthleteA.personalRecords.update({
      id: created.id,
      data: { value: "21" },
    });
    expect(updated.value).toBe("21");
  });

  it("athlete gets FORBIDDEN on another member's PR", async () => {
    await expect(
      h.callerAthleteA.personalRecords.create({
        memberId: IDS.memberA2,
        exerciseId: IDS.exercise1,
        value: "125",
        unit: "kg",
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerAthleteA.personalRecords.update({
        id: IDS.prA2,
        data: { value: "130" },
      }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("coach can create and update a PR", async () => {
    const created = await h.callerCoachA.personalRecords.create({
      memberId: IDS.memberA2,
      exerciseId: IDS.exercise1,
      value: "80",
      unit: "kg",
    });
    expect(created.organizationId).toBe(IDS.orgA);
    const updated = await h.callerCoachA.personalRecords.update({
      id: created.id,
      data: { value: "82.5" },
    });
    expect(updated.value).toBe("82.5");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Destructive / management — admin or above (coach FORBIDDEN, owner passes)
// ─────────────────────────────────────────────────────────────────────────────

describe("members create/update/archive — admin+", () => {
  it("coach gets FORBIDDEN with a clear message", async () => {
    await expect(
      h.callerCoachA.members.create({
        name: "Nope",
        email: "nope@example.com",
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("Admin"),
    });
    await expect(
      h.callerCoachA.members.update({
        id: IDS.memberA2,
        data: { name: "Hacked" },
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerCoachA.members.archive({ id: IDS.memberA2 }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner can create, update and archive members", async () => {
    const created = await h.callerA.members.create({
      name: "New Member",
      email: "new-member@example.com",
    });
    expect(created.organizationId).toBe(IDS.orgA);
    const updated = await h.callerA.members.update({
      id: created.id,
      data: { name: "Renamed Member" },
    });
    expect(updated.name).toBe("Renamed Member");
    const archived = await h.callerA.members.archive({ id: created.id });
    expect(archived.status).toBe("inactive");
  });
});

describe("coaches CRUD — admin+", () => {
  it("coach gets FORBIDDEN on create/update/delete", async () => {
    await expect(
      h.callerCoachA.coaches.create({
        name: "Nope",
        email: "nope-coach@example.com",
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerCoachA.coaches.update({ id: IDS.coachA, data: { name: "X" } }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerCoachA.coaches.delete({ id: IDS.coachA }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner can create, update and delete a coach", async () => {
    const created = await h.callerA.coaches.create({
      name: "Temp Coach",
      email: "temp-coach@example.com",
    });
    const updated = await h.callerA.coaches.update({
      id: created.id,
      data: { name: "Temp Coach 2" },
    });
    expect(updated.name).toBe("Temp Coach 2");
    const deleted = await h.callerA.coaches.delete({ id: created.id });
    expect(deleted.id).toBe(created.id);
  });
});

describe("locations CRUD — admin+", () => {
  it("coach gets FORBIDDEN on create/update/delete", async () => {
    await expect(
      h.callerCoachA.locations.create({ name: "Nope Room" }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerCoachA.locations.update({
        id: IDS.locationA,
        data: { name: "X" },
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerCoachA.locations.delete({ id: IDS.locationA }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner can create, update and delete a location", async () => {
    const created = await h.callerA.locations.create({
      name: "Temp Room",
      capacity: 8,
    });
    const updated = await h.callerA.locations.update({
      id: created.id,
      data: { name: "Temp Room 2" },
    });
    expect(updated.name).toBe("Temp Room 2");
    const deleted = await h.callerA.locations.delete({ id: created.id });
    expect(deleted.id).toBe(created.id);
  });
});

describe("classTypes CRUD — admin+", () => {
  it("coach gets FORBIDDEN on create/update/delete", async () => {
    await expect(
      h.callerCoachA.classTypes.create({
        name: "Nope",
        abbreviation: "NP",
        color: "#112233",
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerCoachA.classTypes.update({
        id: IDS.classTypeA,
        data: { name: "X" },
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerCoachA.classTypes.delete({ id: IDS.classTypeA }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner can create, update and delete a class type", async () => {
    const created = await h.callerA.classTypes.create({
      name: "Open Gym",
      abbreviation: "OG",
      color: "#aabbcc",
    });
    const updated = await h.callerA.classTypes.update({
      id: created.id,
      data: { name: "Open Gym 2" },
    });
    expect(updated.name).toBe("Open Gym 2");
    const deleted = await h.callerA.classTypes.delete({ id: created.id });
    expect(deleted.id).toBe(created.id);
  });
});

describe("subscriptions plans.create / create — admin+", () => {
  it("coach gets FORBIDDEN on plan and subscription create", async () => {
    await expect(
      h.callerCoachA.subscriptions.plans.create({
        name: "Nope Plan",
        type: "monthly",
        price: 10,
      }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerCoachA.subscriptions.create({
        memberId: IDS.memberA2,
        planId: IDS.planA,
        startDate: todayString(),
      }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner can create a plan and a subscription", async () => {
    const plan = await h.callerA.subscriptions.plans.create({
      name: "Temp Plan",
      type: "monthly",
      price: 50,
    });
    expect(plan.organizationId).toBe(IDS.orgA);
    const sub = await h.callerA.subscriptions.create({
      memberId: IDS.memberA2,
      planId: plan.id,
      startDate: todayString(),
    });
    expect(sub.organizationId).toBe(IDS.orgA);
  });
});

describe("notifications.delete — admin+", () => {
  it("coach gets FORBIDDEN, athlete gets FORBIDDEN", async () => {
    await expect(
      h.callerCoachA.notifications.delete({ id: IDS.notifA2 }),
    ).rejects.toMatchObject(FORBIDDEN);
    await expect(
      h.callerAthleteA.notifications.delete({ id: IDS.notifA2 }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner can delete a notification", async () => {
    const deleted = await h.callerA.notifications.delete({ id: IDS.notifA2 });
    expect(deleted.id).toBe(IDS.notifA2);
  });
});

describe("wodResults.delete — admin+", () => {
  it("coach gets FORBIDDEN", async () => {
    await expect(
      h.callerCoachA.wodResults.delete({ id: IDS.wodResultA2 }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner can delete a result", async () => {
    const deleted = await h.callerA.wodResults.delete({ id: IDS.wodResultA2 });
    expect(deleted.id).toBe(IDS.wodResultA2);
  });
});

describe("personalRecords.delete — admin+", () => {
  it("coach gets FORBIDDEN", async () => {
    await expect(
      h.callerCoachA.personalRecords.delete({ id: IDS.prA2 }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner can delete a PR", async () => {
    const deleted = await h.callerA.personalRecords.delete({ id: IDS.prA2 });
    expect(deleted.id).toBe(IDS.prA2);
  });
});
