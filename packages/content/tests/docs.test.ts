/**
 * Guards the public docs loader: the developer docs live in `apps/docs/content`
 * (rendered by apps/docs, synced to ReadMe). If the directory moves or the
 * loader's search paths drift, this fails instead of silently returning [].
 */
import { describe, it, expect } from "vitest";
import { listReadmeDocs } from "../src/readme-docs";

describe("readme docs loader", () => {
  it("loads the developer docs from apps/docs/content", async () => {
    const docs = await listReadmeDocs();
    const slugs = docs.map((d) => d.slug);
    for (const slug of [
      "getting-started",
      "quickstart",
      "auth-and-sessions",
      "errors",
      "conventions",
      "developer-api",
    ]) {
      expect(slugs, `missing doc: ${slug}`).toContain(slug);
    }
  });
});
