import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("members.list", () => {
  it("returns only org A members", async () => {
    const { items, nextCursor } = await h.callerA.members.list();
    expect(items.map((m) => m.id).sort()).toEqual([
      IDS.memberA1,
      IDS.memberA2,
      IDS.memberA3,
    ]);
    expect(items.every((m) => m.organizationId === IDS.orgA)).toBe(true);
    expect(nextCursor).toBeNull();
  });

  it("filters by status", async () => {
    const { items } = await h.callerA.members.list({ status: "trial" });
    expect(items.map((m) => m.id)).toEqual([IDS.memberA3]);
  });

  it("paginates with a cursor", async () => {
    const first = await h.callerA.members.list({ limit: 2 });
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).not.toBeNull();
    const second = await h.callerA.members.list({
      limit: 2,
      cursor: first.nextCursor,
    });
    expect(second.items).toHaveLength(1);
    expect(second.nextCursor).toBeNull();
    const seen = [...first.items, ...second.items].map((m) => m.id);
    expect(new Set(seen).size).toBe(3);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.members.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.members.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      // @ts-expect-error — invalid status on purpose
      h.callerA.members.list({ status: "nope" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("cross-tenant: org B caller never sees org A members", async () => {
    const { items } = await h.callerB.members.list();
    expect(items.map((m) => m.id)).toEqual([IDS.memberB1]);
  });
});

describe("members.byId", () => {
  it("returns the member in org A", async () => {
    const row = await h.callerA.members.byId({ id: IDS.memberA1 });
    expect(row.name).toBe("Jose Fonte");
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.members.byId({ id: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.members.byId({ id: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller gets NOT_FOUND for org A member", async () => {
    await expect(
      h.callerB.members.byId({ id: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.members.byId({ id: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("members.create", () => {
  it("creates a member in org A with auto-incremented memberNumber", async () => {
    const created = await h.callerA.members.create({
      name: "New Athlete",
      email: "new@example.com",
      status: "active",
    });
    expect(created?.organizationId).toBe(IDS.orgA);
    expect(created?.memberNumber).toBe(4);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.members.create({ name: "X", email: "x@example.com", status: "active" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.members.create({ name: "X", email: "x@example.com", status: "active" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.members.create({ name: "X", email: "not-an-email", status: "active" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("cross-tenant: rows created by org B stay invisible to org A", async () => {
    await h.callerB.members.create({
      name: "B Athlete",
      email: "b-athlete@example.com",
      status: "active",
    });
    const { items } = await h.callerA.members.list();
    expect(items.some((m) => m.email === "b-athlete@example.com")).toBe(false);
  });
});

describe("members.update", () => {
  it("updates a member in org A", async () => {
    const updated = await h.callerA.members.update({
      id: IDS.memberA2,
      data: { phone: "913000000" },
    });
    expect(updated?.phone).toBe("913000000");
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.members.update({ id: IDS.memberA2, data: {} }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.members.update({ id: IDS.memberA2, data: {} }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot mutate an org A member (NOT_FOUND)", async () => {
    await expect(
      h.callerB.members.update({ id: IDS.memberA2, data: { name: "Hacked" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const row = await h.callerA.members.byId({ id: IDS.memberA2 });
    expect(row.name).toBe("Ana Silva");
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.members.update({
        id: IDS.memberA2,
        // @ts-expect-error — invalid status on purpose
        data: { status: "bogus" },
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("members.archive", () => {
  it("archives a member in org A", async () => {
    const archived = await h.callerA.members.archive({ id: IDS.memberA3 });
    expect(archived?.status).toBe("inactive");
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(
      h.callerNoSession.members.archive({ id: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(
      h.callerNoOrg.members.archive({ id: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B caller cannot archive an org A member (NOT_FOUND)", async () => {
    await expect(
      h.callerB.members.archive({ id: IDS.memberA1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const row = await h.callerA.members.byId({ id: IDS.memberA1 });
    expect(row.status).toBe("active");
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(h.callerA.members.archive({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});

describe("members.me", () => {
  it("returns the athlete's own gym-member profile", async () => {
    const me = await h.callerAthleteA.members.me();
    expect(me?.id).toBe(IDS.memberA1);
    expect(me?.organizationId).toBe(IDS.orgA);
  });

  it("returns null for a user with no linked member in the org", async () => {
    // The org A owner has no gym-member profile linked to their user id.
    const me = await h.callerA.members.me();
    expect(me).toBeNull();
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.members.me()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
