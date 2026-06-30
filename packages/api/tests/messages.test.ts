import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("messages.conversations", () => {
  it("returns org A conversations with threads and unread counts", async () => {
    const rows = await h.callerA.messages.conversations();
    expect(rows.map((c) => c.id)).toEqual([IDS.convA]);
    const conv = rows[0];
    expect(conv.contactInitials).toBe("AS");
    expect(conv.messages.length).toBe(2);
    // one inbound unread message
    expect(conv.unreadCount).toBe(1);
  });

  it("cross-tenant: org B caller never sees org A conversations", async () => {
    const rows = await h.callerB.messages.conversations();
    expect(rows.map((c) => c.id)).toEqual([IDS.convB]);
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.messages.conversations()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN without an active organization", async () => {
    await expect(h.callerNoOrg.messages.conversations()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("messages.send", () => {
  it("appends a staff reply and bumps the conversation", async () => {
    const created = await h.callerA.messages.send({
      conversationId: IDS.convA,
      body: "Confirmado!",
    });
    expect(created?.fromStaff).toBe(true);
    expect(created?.organizationId).toBe(IDS.orgA);

    const rows = await h.callerA.messages.conversations();
    const conv = rows.find((c) => c.id === IDS.convA);
    expect(conv?.messages.some((m) => m.body === "Confirmado!")).toBe(true);
  });

  it("cross-tenant: org B caller cannot post to an org A conversation (NOT_FOUND)", async () => {
    await expect(
      h.callerB.messages.send({ conversationId: IDS.convA, body: "hax" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("athlete gets FORBIDDEN (staff+)", async () => {
    await expect(
      h.callerAthleteA.messages.send({ conversationId: IDS.convA, body: "x" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects empty body (Zod)", async () => {
    await expect(
      h.callerA.messages.send({ conversationId: IDS.convA, body: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("messages.markRead", () => {
  it("clears the inbound unread count", async () => {
    const before = await h.callerA.messages.conversations();
    expect(before.find((c) => c.id === IDS.convA)?.unreadCount).toBeGreaterThan(0);

    const res = await h.callerA.messages.markRead({ conversationId: IDS.convA });
    expect(res.updated).toBeGreaterThan(0);

    const after = await h.callerA.messages.conversations();
    expect(after.find((c) => c.id === IDS.convA)?.unreadCount).toBe(0);
  });

  it("cross-tenant: org B caller cannot mark an org A conversation (NOT_FOUND)", async () => {
    await expect(
      h.callerB.messages.markRead({ conversationId: IDS.convA }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
