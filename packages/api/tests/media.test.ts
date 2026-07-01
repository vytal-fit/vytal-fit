import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("media", () => {
  it("creates an asset (staff) and lists it", async () => {
    const created = await h.callerA.media.create({
      name: "Deadlift guide",
      type: "video",
      folder: "Exercises",
      sizeBytes: 1000,
    });
    expect(created?.organizationId).toBe("org-a");
    const list = await h.callerA.media.list();
    expect(list.some((a) => a.id === created!.id && a.type === "video")).toBe(true);
  });

  it("athlete gets FORBIDDEN on create (staff+)", async () => {
    await expect(
      h.callerAthleteA.media.create({ name: "x", type: "image", folder: "Marketing" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("coach gets FORBIDDEN on delete (admin+)", async () => {
    const created = await h.callerA.media.create({ name: "toremove", type: "document", folder: "Documents" });
    await expect(h.callerCoachA.media.delete({ id: created!.id })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("cross-tenant: org B cannot delete an org A asset (NOT_FOUND)", async () => {
    const created = await h.callerA.media.create({ name: "orgA", type: "image", folder: "Events" });
    await expect(h.callerB.media.delete({ id: created!.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("owner deletes an asset; no session is UNAUTHORIZED", async () => {
    const created = await h.callerA.media.create({ name: "temp", type: "image", folder: "Events" });
    expect((await h.callerA.media.delete({ id: created!.id })).id).toBe(created!.id);
    await expect(h.callerNoSession.media.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
