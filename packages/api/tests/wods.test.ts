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
