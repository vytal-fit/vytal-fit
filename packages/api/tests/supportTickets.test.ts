import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("supportTickets.list", () => {
  it("returns only org A tickets", async () => {
    const rows = await h.callerA.supportTickets.list();
    expect(rows.every((tk) => tk.organizationId === "org-a")).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("filters by status", async () => {
    const rows = await h.callerA.supportTickets.list({ status: "open" });
    expect(rows.every((tk) => tk.status === "open")).toBe(true);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.supportTickets.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.supportTickets.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects coaches for admin-only support screens", async () => {
    await expect(h.callerCoachA.supportTickets.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("supportTickets.create", () => {
  it("creates a ticket in org A", async () => {
    const created = await h.callerA.supportTickets.create({
      memberName: "New Member",
      subject: "Test ticket",
      description: "Something is broken.",
      priority: "high",
    });
    expect(created.organizationId).toBe("org-a");
    expect(created.status).toBe("open");
    expect(created.number).toBeGreaterThan(1000);
  });

  it("is scoped to the caller's org", async () => {
    await h.callerB.supportTickets.create({
      memberName: "Org B Member",
      subject: "Org B ticket",
      description: "Need help.",
      priority: "low",
    });
    const orgATickets = await h.callerA.supportTickets.list();
    expect(orgATickets.some((tk) => tk.subject === "Org B ticket")).toBe(false);
  });

  it("rejects invalid input", async () => {
    await expect(
      h.callerA.supportTickets.create({
        memberName: "",
        subject: "",
        description: "",
        priority: "urgent" as never,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("supportTickets.updateStatus", () => {
  it("updates status within the org", async () => {
    const rows = await h.callerA.supportTickets.list({ status: "open" });
    const target = rows[0];
    expect(target).toBeTruthy();
    const updated = await h.callerA.supportTickets.updateStatus({
      id: target!.id,
      status: "resolved",
    });
    expect(updated.status).toBe("resolved");
  });

  it("rejects cross-tenant updates with NOT_FOUND", async () => {
    const created = await h.callerB.supportTickets.create({
      memberName: "Hidden Member",
      subject: "Hidden ticket",
      description: "Should stay in org B.",
      priority: "medium",
    });
    await expect(
      h.callerA.supportTickets.updateStatus({
        id: created.id,
        status: "closed",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects unknown ids", async () => {
    await expect(
      h.callerA.supportTickets.updateStatus({ id: "missing", status: "closed" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
