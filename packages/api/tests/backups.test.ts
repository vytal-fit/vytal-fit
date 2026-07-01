import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("backups", () => {
  it("summary returns real per-section counts", async () => {
    const s = await h.callerA.backups.summary();
    expect(typeof s.members).toBe("number");
    expect(s.members).toBeGreaterThanOrEqual(0);
    expect(s).toHaveProperty("classes");
    expect(s).toHaveProperty("payments");
    expect(s).toHaveProperty("wods");
    expect(s).toHaveProperty("crm");
  });

  it("create assembles the selected sections' real data + logs history", async () => {
    const res = await h.callerA.backups.create({ sections: ["members"], format: "json" });
    expect(res.sections).toEqual(["members"]);
    expect(Array.isArray(res.data.members)).toBe(true);
    expect(res.sizeBytes).toBeGreaterThan(0);

    const history = await h.callerA.backups.history();
    expect(history.some((b) => b.id === res.id)).toBe(true);
    // A single-section export is "partial".
    expect(history.find((b) => b.id === res.id)?.type).toBe("partial");
  });

  it("a full export is flagged full", async () => {
    const res = await h.callerA.backups.create({
      sections: ["members", "classes", "payments", "wods", "crm"],
      format: "json",
    });
    const history = await h.callerA.backups.history();
    expect(history.find((b) => b.id === res.id)?.type).toBe("full");
  });

  it("create is admin-only; athlete gets FORBIDDEN", async () => {
    await expect(
      h.callerAthleteA.backups.create({ sections: ["members"], format: "json" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.backups.summary()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
