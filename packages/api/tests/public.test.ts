import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("public site router (unauthenticated, slug-scoped)", () => {
  it("resolves an org by slug WITHOUT a session and returns identity + stats", async () => {
    const site = await h.callerNoSession.public.site({ slug: "crossfit-aveiro" });
    expect(site.name).toBe("CrossFit Aveiro");
    expect(site.slug).toBe("crossfit-aveiro");
    expect(site.stats.coaches).toBeGreaterThanOrEqual(0);
    expect(site.stats.members).toBeGreaterThanOrEqual(0);
  });

  it("returns active plans, coaches, and a weekly schedule by slug", async () => {
    const [plans, team, schedule] = await Promise.all([
      h.callerNoSession.public.plans({ slug: "crossfit-aveiro" }),
      h.callerNoSession.public.coaches({ slug: "crossfit-aveiro" }),
      h.callerNoSession.public.weeklySchedule({ slug: "crossfit-aveiro" }),
    ]);
    expect(Array.isArray(plans)).toBe(true);
    expect(Array.isArray(team)).toBe(true);
    expect(Array.isArray(schedule)).toBe(true);
    for (const s of schedule) {
      expect(s.day).toBeGreaterThanOrEqual(0);
      expect(s.day).toBeLessThanOrEqual(6);
      expect(s.spotsLeft).toBeLessThanOrEqual(s.spots);
    }
  });

  it("does not leak across orgs (slug scopes the data)", async () => {
    const a = await h.callerNoSession.public.site({ slug: "crossfit-aveiro" });
    const b = await h.callerNoSession.public.site({ slug: "iron-temple" });
    expect(a.id).not.toBe(b.id);
    expect(b.name).toBe("Iron Temple");
  });

  it("throws NOT_FOUND for an unknown slug", async () => {
    await expect(
      h.callerNoSession.public.site({ slug: "does-not-exist" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
