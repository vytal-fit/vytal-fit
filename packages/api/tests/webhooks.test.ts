import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

const base = { name: "Zapier", url: "https://hooks.example.com/abc", events: ["member.created"] as const };

describe("webhooks CRUD", () => {
  it("creates a webhook DISABLED by default (cost saver) and returns the secret once", async () => {
    const created = await h.callerA.webhooks.create(base);
    expect(created.secret.startsWith("whsec_")).toBe(true);
    const list = await h.callerA.webhooks.list();
    const row = list.find((w) => w.id === created.id);
    expect(row?.active).toBe(false); // default off
    expect(row?.secretMasked).not.toContain(created.secret.slice(-8)); // masked, not full
  });

  it("can be activated and deactivated", async () => {
    const created = await h.callerA.webhooks.create(base);
    const on = await h.callerA.webhooks.setActive({ id: created.id, active: true });
    expect(on.active).toBe(true);
    const off = await h.callerA.webhooks.setActive({ id: created.id, active: false });
    expect(off.active).toBe(false);
  });

  it("is admin-only for writes: coach/athlete get FORBIDDEN", async () => {
    await expect(h.callerCoachA.webhooks.create(base)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(h.callerAthleteA.webhooks.create(base)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B cannot delete an org A webhook (NOT_FOUND)", async () => {
    const created = await h.callerA.webhooks.create(base);
    await expect(h.callerB.webhooks.delete({ id: created.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("owner deletes a webhook", async () => {
    const created = await h.callerA.webhooks.create(base);
    const del = await h.callerA.webhooks.delete({ id: created.id });
    expect(del.id).toBe(created.id);
  });

  it("events list + empty deliveries are readable; no session is UNAUTHORIZED", async () => {
    expect((await h.callerA.webhooks.events()).length).toBeGreaterThan(0);
    expect(Array.isArray(await h.callerA.webhooks.deliveries())).toBe(true);
    await expect(h.callerNoSession.webhooks.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
