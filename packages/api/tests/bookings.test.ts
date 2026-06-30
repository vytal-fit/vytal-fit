import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("bookings.book", () => {
  it("confirms a booking when capacity is available", async () => {
    const created = await h.callerA.bookings.book({
      classId: IDS.classA,
      memberId: IDS.memberA2,
    });
    expect(created?.status).toBe("confirmed");
    expect(created?.organizationId).toBe(IDS.orgA);
  });

  it("rejects duplicate active bookings with CONFLICT", async () => {
    await expect(
      h.callerA.bookings.book({ classId: IDS.classA, memberId: IDS.memberA2 }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("waitlists when the class is full (capacity check)", async () => {
    // classASmall has maxCapacity 1.
    const first = await h.callerA.bookings.book({
      classId: IDS.classASmall,
      memberId: IDS.memberA1,
    });
    expect(first?.status).toBe("confirmed");
    const second = await h.callerA.bookings.book({
      classId: IDS.classASmall,
      memberId: IDS.memberA2,
    });
    expect(second?.status).toBe("waitlisted");
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.bookings.book({ classId: IDS.classA, memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.bookings.book({ classId: IDS.classA, memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot book into an org A class (NOT_FOUND)", async () => {
    await expect(
      h.callerB.bookings.book({ classId: IDS.classA, memberId: IDS.memberB1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("cross-tenant: org A caller cannot book an org B member (NOT_FOUND)", async () => {
    await expect(
      h.callerA.bookings.book({ classId: IDS.classA, memberId: IDS.memberB1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.bookings.book({ classId: "", memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("bookings.cancel", () => {
  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.bookings.cancel({ id: IDS.bookingA }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.bookings.cancel({ id: IDS.bookingA }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot cancel an org A booking (NOT_FOUND)", async () => {
    await expect(
      h.callerB.bookings.cancel({ id: IDS.bookingA }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(h.callerA.bookings.cancel({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("cancels an org A booking", async () => {
    const cancelled = await h.callerA.bookings.cancel({ id: IDS.bookingA });
    expect(cancelled?.status).toBe("cancelled");
  });

  it("throws CONFLICT when cancelling twice", async () => {
    await expect(
      h.callerA.bookings.cancel({ id: IDS.bookingA }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("bookings.listByMember", () => {
  it("lists bookings for an org A member", async () => {
    const rows = await h.callerA.bookings.listByMember({ memberId: IDS.memberA1 });
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows.every((b) => b.organizationId === IDS.orgA)).toBe(true);
    expect(rows.every((b) => b.memberId === IDS.memberA1)).toBe(true);
    expect(rows.every((b) => b.class?.classType?.name)).toBe(true);
    expect(rows.every((b) => b.class?.location?.name)).toBe(true);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.bookings.listByMember({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.bookings.listByMember({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot list an org A member's bookings (NOT_FOUND)", async () => {
    await expect(
      h.callerB.bookings.listByMember({ memberId: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.bookings.listByMember({ memberId: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("bookings.listByClass", () => {
  it("lists the roster for an org A class with member info", async () => {
    const rows = await h.callerA.bookings.listByClass({ classId: IDS.classA });
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows.every((b) => b.classId === IDS.classA)).toBe(true);
    expect(rows.every((b) => typeof b.memberName === "string")).toBe(true);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.bookings.listByClass({ classId: IDS.classA }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("cross-tenant: org B caller cannot read an org A class roster (NOT_FOUND)", async () => {
    await expect(
      h.callerB.bookings.listByClass({ classId: IDS.classA }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.bookings.listByClass({ classId: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("includes the member email", async () => {
    const rows = await h.callerA.bookings.listByClass({ classId: IDS.classA });
    expect(rows.every((b) => typeof b.memberEmail === "string")).toBe(true);
  });
});

describe("bookings.setAttendance", () => {
  it("marks a booking checked_in and stamps checkedInAt", async () => {
    const booking = await h.callerA.bookings.book({
      classId: IDS.classA,
      memberId: IDS.memberA3,
    });
    const updated = await h.callerA.bookings.setAttendance({
      id: booking!.id,
      status: "checked_in",
    });
    expect(updated?.status).toBe("checked_in");
    expect(updated?.checkedInAt).toBeInstanceOf(Date);

    const reverted = await h.callerA.bookings.setAttendance({
      id: booking!.id,
      status: "no_show",
    });
    expect(reverted?.status).toBe("no_show");
    expect(reverted?.checkedInAt).toBeNull();
  });

  it("athlete gets FORBIDDEN (staff+)", async () => {
    await expect(
      h.callerAthleteA.bookings.setAttendance({ id: IDS.bookingA, status: "checked_in" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot mark an org A booking (NOT_FOUND)", async () => {
    await expect(
      h.callerB.bookings.setAttendance({ id: IDS.bookingA, status: "checked_in" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects an invalid status (Zod)", async () => {
    await expect(
      // @ts-expect-error — waitlisted is not an attendance status
      h.callerA.bookings.setAttendance({ id: IDS.bookingA, status: "waitlisted" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
