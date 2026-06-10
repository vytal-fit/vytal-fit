import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, todayString, type TestHarness } from "./helpers";

let h: TestHarness;
const today = todayString();

beforeAll(async () => {
  h = await createHarness();
});

describe("classes.list", () => {
  it("returns org A classes within the date range", async () => {
    const rows = await h.callerA.classes.list({ from: today, to: today });
    expect(rows.map((c) => c.id).sort()).toEqual([IDS.classA, IDS.classASmall]);
    expect(rows.every((c) => c.organizationId === IDS.orgA)).toBe(true);
  });

  it("returns an empty list outside the range", async () => {
    const rows = await h.callerA.classes.list({
      from: "2000-01-01",
      to: "2000-01-31",
    });
    expect(rows).toEqual([]);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.classes.list({ from: today, to: today }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.classes.list({ from: today, to: today }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller never sees org A classes", async () => {
    const rows = await h.callerB.classes.list({ from: today, to: today });
    expect(rows.map((c) => c.id)).toEqual([IDS.classB]);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.classes.list({ from: "not-a-date", to: today }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("classes.byId", () => {
  it("returns the class with bookings counts", async () => {
    const row = await h.callerA.classes.byId({ id: IDS.classA });
    expect(row.id).toBe(IDS.classA);
    expect(row.enrolledCount).toBe(1);
    expect(row.waitlistCount).toBe(0);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.classes.byId({ id: IDS.classA }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.classes.byId({ id: IDS.classA }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller gets NOT_FOUND for an org A class", async () => {
    await expect(h.callerB.classes.byId({ id: IDS.classA })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(h.callerA.classes.byId({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});

describe("classes.create", () => {
  const validInput = {
    classTypeId: IDS.classTypeA,
    locationId: IDS.locationA,
    coachIds: [IDS.coachA],
    date: today,
    startTime: "18:00",
    endTime: "19:00",
    maxCapacity: 16,
  };

  it("creates a class in org A", async () => {
    const created = await h.callerA.classes.create(validInput);
    expect(created?.organizationId).toBe(IDS.orgA);
    expect(created?.maxCapacity).toBe(16);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.classes.create(validInput)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.classes.create(validInput)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller cannot use org A's class type (NOT_FOUND)", async () => {
    await expect(
      h.callerB.classes.create({ ...validInput, locationId: IDS.locationB }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("cross-tenant: org A caller cannot use org B's location (NOT_FOUND)", async () => {
    await expect(
      h.callerA.classes.create({ ...validInput, locationId: IDS.locationB }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.classes.create({ ...validInput, startTime: "25:99" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("classes.cancel", () => {
  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.classes.cancel({ id: IDS.classASmall }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.classes.cancel({ id: IDS.classASmall }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot cancel an org A class (NOT_FOUND)", async () => {
    await expect(
      h.callerB.classes.cancel({ id: IDS.classASmall }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(h.callerA.classes.cancel({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("cancels the class and its active bookings", async () => {
    const cancelled = await h.callerA.classes.cancel({ id: IDS.classA });
    expect(cancelled?.cancelledAt).toBeInstanceOf(Date);
    const memberBookings = await h.callerA.bookings.listByMember({
      memberId: IDS.memberA1,
    });
    const booking = memberBookings.find((b) => b.id === IDS.bookingA);
    expect(booking?.status).toBe("cancelled");
  });

  it("throws CONFLICT when cancelling twice", async () => {
    await expect(h.callerA.classes.cancel({ id: IDS.classA })).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});
