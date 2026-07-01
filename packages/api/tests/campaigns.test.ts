import { beforeAll, describe, expect, it } from "vitest";
import { suppressEmail } from "@vytal-fit/db";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

const draft = {
  name: "Summer promo",
  subject: "Train with us this summer",
  body: "<p>Join our summer challenge!</p>",
  audience: "all_active",
};

beforeAll(async () => {
  h = await createHarness();
});

describe("campaigns", () => {
  it("creates a draft and lists it", async () => {
    const created = await h.callerA.campaigns.create(draft);
    expect(created?.status).toBe("draft");
    const list = await h.callerA.campaigns.list();
    expect(list.some((c) => c.id === created!.id)).toBe(true);
  });

  it("sends to active members and skips suppressed ones (comms policy)", async () => {
    // Suppress one known org-a member before sending.
    await suppressEmail(h.db, "org-a", "jose@example.com");
    const created = await h.callerA.campaigns.create(draft);
    const res = await h.callerA.campaigns.send({ id: created!.id });
    expect(res.total).toBeGreaterThan(0);
    expect(res.skipped).toBeGreaterThanOrEqual(1); // jose@example.com suppressed
    expect(res.sent + res.skipped + res.failed).toBe(res.total);

    // Re-sending is a conflict.
    await expect(h.callerA.campaigns.send({ id: created!.id })).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("create/send are admin-only: athlete gets FORBIDDEN", async () => {
    await expect(h.callerAthleteA.campaigns.create(draft)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B cannot delete an org A campaign (NOT_FOUND)", async () => {
    const created = await h.callerA.campaigns.create(draft);
    await expect(h.callerB.campaigns.delete({ id: created!.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.campaigns.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
