import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("community feed + posting", () => {
  it("staff post keeps the announcement kind and an owner/coach badge", async () => {
    const created = await h.callerA.community.post({ content: "Welcome!", kind: "announcement" });
    expect(created?.kind).toBe("announcement");
    expect(["owner", "coach"]).toContain(created?.authorType);

    const feed = await h.callerA.community.feed();
    const row = feed.find((p) => p.id === created!.id);
    expect(row?.content).toBe("Welcome!");
    expect(row?.fistbumps).toBe(0);
    expect(row?.hasReacted).toBe(false);
  });

  it("athlete may post but an announcement is downgraded to a plain post", async () => {
    const created = await h.callerAthleteA.community.post({
      content: "Open gym Saturday?",
      kind: "announcement",
    });
    expect(created?.kind).toBe("post");
    expect(created?.authorType).toBe("athlete");
  });

  it("react toggles the caller's fistbump", async () => {
    const post = await h.callerA.community.post({ content: "React to me" });
    const on = await h.callerAthleteA.community.react({ postId: post!.id });
    expect(on.reacted).toBe(true);
    const off = await h.callerAthleteA.community.react({ postId: post!.id });
    expect(off.reacted).toBe(false);
  });

  it("comments are created and listed", async () => {
    const post = await h.callerA.community.post({ content: "Discuss" });
    await h.callerAthleteA.community.comment({ postId: post!.id, content: "Nice" });
    const comments = await h.callerA.community.comments({ postId: post!.id });
    expect(comments.some((c) => c.content === "Nice")).toBe(true);
  });
});

describe("community moderation", () => {
  it("pin is staff-only", async () => {
    const post = await h.callerA.community.post({ content: "Pin me" });
    await expect(
      h.callerAthleteA.community.pin({ id: post!.id, pinned: true }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    const pinned = await h.callerA.community.pin({ id: post!.id, pinned: true });
    expect(pinned.pinned).toBe(true);
  });

  it("an athlete cannot delete another author's post, but staff can", async () => {
    const post = await h.callerA.community.post({ content: "Owner's post" });
    await expect(
      h.callerAthleteA.community.deletePost({ id: post!.id }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    const del = await h.callerCoachA.community.deletePost({ id: post!.id });
    expect(del.id).toBe(post!.id);
  });

  it("an author can delete their own post", async () => {
    const post = await h.callerAthleteA.community.post({ content: "Mine to remove" });
    const del = await h.callerAthleteA.community.deletePost({ id: post!.id });
    expect(del.id).toBe(post!.id);
  });

  it("cross-tenant: reacting to another org's post is NOT_FOUND", async () => {
    const post = await h.callerA.community.post({ content: "org A only" });
    await expect(
      h.callerB.community.react({ postId: post!.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws UNAUTHORIZED without a session", async () => {
    await expect(h.callerNoSession.community.feed()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
