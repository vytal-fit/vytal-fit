import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, todayString, type TestHarness } from "./helpers";

let h: TestHarness;
const today = todayString();

beforeAll(async () => {
  h = await createHarness();
});

describe("wods.list", () => {
  it("returns only org A WODs", async () => {
    const rows = await h.callerA.wods.list();
    expect(rows.map((w) => w.id).sort()).toEqual([IDS.wodA, IDS.wodAPublished]);
    expect(rows.every((w) => w.organizationId === IDS.orgA)).toBe(true);
  });

  it("filters by date range", async () => {
    const rows = await h.callerA.wods.list({ from: "2000-01-01", to: "2000-01-31" });
    expect(rows).toEqual([]);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.wods.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.wods.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller never sees org A WODs", async () => {
    const rows = await h.callerB.wods.list();
    expect(rows.map((w) => w.id)).toEqual([IDS.wodB]);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(h.callerA.wods.list({ from: "06/10/2026" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});

describe("wods.byId", () => {
  it("returns the WOD with its parts", async () => {
    const row = await h.callerA.wods.byId({ id: IDS.wodA });
    expect(row.title).toBe("FRAN");
    expect(row.parts).toHaveLength(1);
    expect(row.parts[0]?.exercises[0]?.exerciseId).toBe(IDS.exercise1);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.wods.byId({ id: IDS.wodA })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.wods.byId({ id: IDS.wodA })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller gets NOT_FOUND for an org A WOD", async () => {
    await expect(h.callerB.wods.byId({ id: IDS.wodA })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(h.callerA.wods.byId({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});

describe("wods.create", () => {
  const validInput = {
    classTypeId: IDS.classTypeA,
    date: today,
    title: "New WOD",
    parts: [
      {
        name: "WOD",
        type: "amrap" as const,
        timeCap: 20,
        exercises: [{ exerciseId: IDS.exercise1, reps: "5" }],
      },
    ],
  };

  it("creates a WOD in org A stamped with the creator", async () => {
    const created = await h.callerA.wods.create(validInput);
    expect(created?.organizationId).toBe(IDS.orgA);
    expect(created?.createdBy).toBe(IDS.userA);
    expect(created?.publishedAt).toBeNull();
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.wods.create(validInput)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.wods.create(validInput)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller cannot use org A's class type (NOT_FOUND)", async () => {
    await expect(h.callerB.wods.create(validInput)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.wods.create({
        ...validInput,
        // @ts-expect-error — invalid WOD type on purpose
        parts: [{ name: "X", type: "yoga", exercises: [] }],
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unknown exercise ids", async () => {
    await expect(
      h.callerA.wods.create({
        ...validInput,
        parts: [
          {
            name: "WOD",
            type: "amrap" as const,
            timeCap: 20,
            exercises: [{ exerciseId: "missing-exercise", reps: "5" }],
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("wods.publish", () => {
  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.wods.publish({ id: IDS.wodA }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.wods.publish({ id: IDS.wodA })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B caller cannot publish an org A WOD (NOT_FOUND)", async () => {
    await expect(h.callerB.wods.publish({ id: IDS.wodA })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(h.callerA.wods.publish({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("publishes an org A WOD", async () => {
    const published = await h.callerA.wods.publish({ id: IDS.wodA });
    expect(published?.publishedAt).toBeInstanceOf(Date);
  });

  it("throws CONFLICT when publishing twice", async () => {
    await expect(h.callerA.wods.publish({ id: IDS.wodA })).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});

describe("wods.update", () => {
  it("coach can partially update a draft WOD (title/date/parts)", async () => {
    const draft = await h.callerCoachA.wods.create({
      classTypeId: IDS.classTypeA,
      date: todayString(3),
      title: "DRAFT",
      parts: [],
    });
    const updated = await h.callerCoachA.wods.update({
      id: draft.id,
      data: {
        title: "DRAFT v2",
        date: todayString(4),
        parts: [
          {
            name: "WOD",
            type: "amrap",
            timeCap: 12,
            exercises: [{ exerciseId: IDS.exercise2, reps: "10" }],
          },
        ],
      },
    });
    expect(updated?.title).toBe("DRAFT v2");
    expect(updated?.date).toBe(todayString(4));
    expect(updated?.parts).toHaveLength(1);
    // Untouched fields survive a partial update.
    expect(updated?.classTypeId).toBe(IDS.classTypeA);
    expect(updated?.publishedAt).toBeNull();
  });

  it("also works on a published WOD without altering publishedAt", async () => {
    const updated = await h.callerA.wods.update({
      id: IDS.wodAPublished,
      data: { title: "CINDY RX" },
    });
    expect(updated?.title).toBe("CINDY RX");
    expect(updated?.publishedAt).toBeInstanceOf(Date);
  });

  it("athlete gets FORBIDDEN (coach+)", async () => {
    await expect(
      h.callerAthleteA.wods.update({ id: IDS.wodA, data: { title: "NOPE" } }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.wods.update({ id: IDS.wodA, data: { title: "X" } }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.wods.update({ id: IDS.wodA, data: { title: "X" } }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot update an org A WOD (NOT_FOUND)", async () => {
    await expect(
      h.callerB.wods.update({ id: IDS.wodA, data: { title: "HACKED" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const row = await h.callerA.wods.byId({ id: IDS.wodA });
    expect(row.title).not.toBe("HACKED");
  });

  it("cross-tenant: cannot re-target an org B class type (NOT_FOUND)", async () => {
    await expect(
      h.callerA.wods.update({ id: IDS.wodA, data: { classTypeId: IDS.classTypeB } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.wods.update({ id: IDS.wodA, data: { date: "June 1st" } }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unknown exercise ids in partial updates", async () => {
    await expect(
      h.callerA.wods.update({
        id: IDS.wodA,
        data: {
          parts: [
            {
              name: "WOD",
              type: "amrap",
              timeCap: 10,
              exercises: [{ exerciseId: "missing-exercise", reps: "5" }],
            },
          ],
        },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
