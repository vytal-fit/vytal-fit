import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("auditLog.list", () => {
  it("returns an array for an admin", async () => {
    const rows = await h.callerA.auditLog.list();
    expect(Array.isArray(rows)).toBe(true);
  });

  it("is admin-only: coach and athlete get FORBIDDEN", async () => {
    await expect(h.callerCoachA.auditLog.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(h.callerAthleteA.auditLog.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.auditLog.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
