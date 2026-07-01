import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("memberGroups CRUD", () => {
  it("creates a group (staff) and lists it with an empty member set", async () => {
    const created = await h.callerA.memberGroups.create({
      name: "Competition Team",
      description: "Throwdown athletes",
      color: "#f59e0b",
    });
    expect(created?.organizationId).toBe("org-a");

    const rows = await h.callerA.memberGroups.list();
    const row = rows.find((r) => r.id === created!.id);
    expect(row?.name).toBe("Competition Team");
    expect(row?.members).toEqual([]);
  });

  it("updates a group's name and color (staff)", async () => {
    const created = await h.callerA.memberGroups.create({ name: "Beginners" });
    const updated = await h.callerA.memberGroups.update({
      id: created!.id,
      name: "New Members",
      color: "#8b5cf6",
    });
    expect(updated?.name).toBe("New Members");
    expect(updated?.color).toBe("#8b5cf6");
  });

  it("athlete gets FORBIDDEN on create (staff+)", async () => {
    await expect(
      h.callerAthleteA.memberGroups.create({ name: "x" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("coach gets FORBIDDEN on delete (admin+)", async () => {
    const created = await h.callerA.memberGroups.create({ name: "ToDelete" });
    await expect(
      h.callerCoachA.memberGroups.delete({ id: created!.id }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B cannot update or delete an org A group (NOT_FOUND)", async () => {
    const created = await h.callerA.memberGroups.create({ name: "OrgA only" });
    await expect(
      h.callerB.memberGroups.update({ id: created!.id, name: "hijack" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      h.callerB.memberGroups.delete({ id: created!.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("owner deletes an org A group", async () => {
    const created = await h.callerA.memberGroups.create({ name: "Temp" });
    const deleted = await h.callerA.memberGroups.delete({ id: created!.id });
    expect(deleted?.id).toBe(created!.id);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.memberGroups.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
