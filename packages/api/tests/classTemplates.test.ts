import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

const base = {
  name: "Morning WOD",
  classType: "WOD",
  time: "07:00",
  duration: "60 min",
  coach: "Andre",
  capacity: 20,
  location: "Main Box",
  days: "Mon-Fri",
};

beforeAll(async () => {
  h = await createHarness();
});

describe("classTemplates CRUD", () => {
  it("creates a template (staff) and lists it", async () => {
    const created = await h.callerA.classTemplates.create(base);
    expect(created?.organizationId).toBe("org-a");
    const rows = await h.callerA.classTemplates.list();
    expect(rows.some((r) => r.id === created!.id && r.name === "Morning WOD")).toBe(true);
  });

  it("updates a template (staff)", async () => {
    const created = await h.callerA.classTemplates.create(base);
    const updated = await h.callerA.classTemplates.update({ id: created!.id, capacity: 30 });
    expect(updated?.capacity).toBe(30);
  });

  it("athlete gets FORBIDDEN on create (staff+)", async () => {
    await expect(h.callerAthleteA.classTemplates.create(base)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("coach gets FORBIDDEN on delete (admin+)", async () => {
    const created = await h.callerA.classTemplates.create(base);
    await expect(
      h.callerCoachA.classTemplates.delete({ id: created!.id }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B cannot delete an org A template (NOT_FOUND)", async () => {
    const created = await h.callerA.classTemplates.create(base);
    await expect(
      h.callerB.classTemplates.delete({ id: created!.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("owner deletes an org A template", async () => {
    const created = await h.callerA.classTemplates.create(base);
    const deleted = await h.callerA.classTemplates.delete({ id: created!.id });
    expect(deleted?.id).toBe(created!.id);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.classTemplates.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
