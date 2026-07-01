import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("certifications.create + list", () => {
  it("creates a certification for an org coach (staff) and lists it with coach name", async () => {
    const created = await h.callerA.certifications.create({
      coachId: "coach-a",
      name: "CrossFit Level 2",
      issuedDate: "2025-01-10",
      expiryDate: "2027-01-10",
    });
    expect(created?.coachId).toBe("coach-a");
    expect(created?.organizationId).toBe("org-a");

    const rows = await h.callerA.certifications.list();
    const row = rows.find((r) => r.id === created!.id);
    expect(row?.coachName).toBe("Andre Loureiro");
    expect(row?.name).toBe("CrossFit Level 2");
  });

  it("rejects attaching to a coach outside the caller's org (NOT_FOUND)", async () => {
    await expect(
      h.callerA.certifications.create({
        coachId: "coach-b",
        name: "x",
        issuedDate: "2025-01-01",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("athlete gets FORBIDDEN on create (staff+)", async () => {
    await expect(
      h.callerAthleteA.certifications.create({
        coachId: "coach-a",
        name: "x",
        issuedDate: "2025-01-01",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B never sees org A certifications", async () => {
    const rows = await h.callerB.certifications.list();
    // org A's certs are attached to coach-a; org B's list must never include it.
    expect(rows.every((r) => r.coachId !== "coach-a")).toBe(true);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.certifications.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

describe("certifications.delete", () => {
  it("coach gets FORBIDDEN (admin+)", async () => {
    const created = await h.callerA.certifications.create({
      coachId: "coach-a",
      name: "First Aid",
      issuedDate: "2025-02-01",
    });
    await expect(
      h.callerCoachA.certifications.delete({ id: created!.id }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("owner deletes an org A certification", async () => {
    const created = await h.callerA.certifications.create({
      coachId: "coach-a",
      name: "CPR",
      issuedDate: "2025-03-01",
    });
    const deleted = await h.callerA.certifications.delete({ id: created!.id });
    expect(deleted?.id).toBe(created!.id);
  });
});
