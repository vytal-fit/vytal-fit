import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
  // A coach may create PRs for any member in the org.
  await h.callerCoachA.personalRecords.create({
    memberId: IDS.memberA2,
    exerciseId: IDS.exercise1,
    value: "100",
    unit: "kg",
  });
});

describe("personalRecords read authorization (self-service)", () => {
  it("athlete can list their OWN member's PRs", async () => {
    const { items } = await h.callerAthleteA.personalRecords.list({ memberId: IDS.memberA1 });
    expect(items.every((r) => r.memberId === IDS.memberA1)).toBe(true);
  });

  it("athlete CANNOT list another member's PRs (FORBIDDEN)", async () => {
    await expect(
      h.callerAthleteA.personalRecords.list({ memberId: IDS.memberA2 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("athlete CANNOT do an org-wide list (FORBIDDEN)", async () => {
    await expect(h.callerAthleteA.personalRecords.list({})).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("coach CAN do an org-wide list", async () => {
    const { items } = await h.callerCoachA.personalRecords.list({});
    expect(Array.isArray(items)).toBe(true);
  });

  it("athlete CANNOT read another member's PR by id (FORBIDDEN)", async () => {
    const created = await h.callerCoachA.personalRecords.create({
      memberId: IDS.memberA2,
      exerciseId: IDS.exercise2,
      value: "120",
      unit: "kg",
    });
    await expect(
      h.callerAthleteA.personalRecords.byId({ id: created.id }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
