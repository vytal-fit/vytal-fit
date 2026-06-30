import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;
const FROM = "2020-01-01";
const TO = "2999-12-31";

beforeAll(async () => {
  h = await createHarness();
});

describe("classes.schedule (enriched)", () => {
  it("returns org A classes enriched with type, location, coaches and enrolledCount", async () => {
    const rows = await h.callerA.classes.schedule({ from: FROM, to: TO });
    expect(rows.length).toBeGreaterThan(0);
    const classA = rows.find((r) => r.id === IDS.classA);
    expect(classA).toBeTruthy();
    expect(classA?.classType?.id).toBe(IDS.classTypeA);
    expect(classA?.location?.id).toBe(IDS.locationA);
    expect(classA?.coaches.some((c) => c.id === IDS.coachA)).toBe(true);
    expect(typeof classA?.enrolledCount).toBe("number");
  });

  it("is org-scoped: org B sees none of org A's classes", async () => {
    const rows = await h.callerB.classes.schedule({ from: FROM, to: TO });
    expect(rows.every((r) => r.organizationId === IDS.orgB)).toBe(true);
    expect(rows.some((r) => r.id === IDS.classA)).toBe(false);
  });

  it("requires a session", async () => {
    await expect(
      h.callerNoSession.classes.schedule({ from: FROM, to: TO }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
