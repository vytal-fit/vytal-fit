import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

const post = {
  platform: "instagram" as const,
  content: "New WOD today!",
  scheduledDate: "2026-07-10",
  scheduledTime: "18:00",
};

beforeAll(async () => {
  h = await createHarness();
});

describe("marketing (social posts)", () => {
  it("creates a scheduled post (staff) and lists it", async () => {
    const created = await h.callerA.marketing.create(post);
    expect(created?.status).toBe("scheduled");
    const list = await h.callerA.marketing.posts();
    expect(list.some((p) => p.id === created!.id)).toBe(true);
  });

  it("setStatus publishes a post", async () => {
    const created = await h.callerA.marketing.create(post);
    const res = await h.callerA.marketing.setStatus({ id: created!.id, status: "published" });
    expect(res.status).toBe("published");
  });

  it("athlete gets FORBIDDEN on create (staff+)", async () => {
    await expect(h.callerAthleteA.marketing.create(post)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B cannot delete an org A post (NOT_FOUND)", async () => {
    const created = await h.callerA.marketing.create(post);
    await expect(h.callerB.marketing.delete({ id: created!.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.marketing.posts()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
