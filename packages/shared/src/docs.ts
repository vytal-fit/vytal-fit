import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type DocsSource = "public" | "engineering";

export interface DocsEntryMeta {
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  parent?: string;
}

export interface DocsEntry extends DocsEntryMeta {
  content: string;
  sourceFile: string;
}

const DOC_SOURCE_DIRS: Record<DocsSource, string[]> = {
  public: [
    path.join(process.cwd(), "apps", "api", "readme"),
    path.join(process.cwd(), "..", "apps", "api", "readme"),
    path.join(process.cwd(), "..", "..", "apps", "api", "readme"),
  ],
  engineering: [
    path.join(process.cwd(), "docs"),
    path.join(process.cwd(), "..", "docs"),
    path.join(process.cwd(), "..", "..", "docs"),
  ],
};

const docsDirCache = new Map<DocsSource, Promise<string>>();

async function resolveDocsDir(source: DocsSource): Promise<string> {
  for (const candidate of DOC_SOURCE_DIRS[source]) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Keep trying the next candidate.
    }
  }

  return DOC_SOURCE_DIRS[source][0];
}

async function getDocsDir(source: DocsSource): Promise<string> {
  const cached = docsDirCache.get(source);
  if (cached) return cached;
  const resolved = resolveDocsDir(source);
  docsDirCache.set(source, resolved);
  return resolved;
}

function summarizeMarkdown(content: string): string | undefined {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const paragraph = blocks.find((block) => {
    if (block.startsWith("#")) return false;
    if (block.startsWith("- ") || block.startsWith("* ")) return false;
    if (block.startsWith("```")) return false;
    return true;
  });

  if (!paragraph) return undefined;

  return paragraph
    .replace(/\s+/g, " ")
    .replace(/[`*_>#\[\]]/g, "")
    .trim();
}

function normalizeSlug(fileName: string): string {
  return fileName.replace(/\.md$/i, "").toLowerCase();
}

async function readDocFile(
  source: DocsSource,
  fileName: string,
): Promise<DocsEntry> {
  const sourceFile = path.join(await getDocsDir(source), fileName);
  const raw = await fs.readFile(sourceFile, "utf8");
  const parsed = matter(raw);
  const slug = String(parsed.data.slug ?? normalizeSlug(fileName));
  const category = parsed.data.category;
  const parent = parsed.data.parent;
  const frontmatterExcerpt =
    typeof parsed.data.content === "object" &&
    parsed.data.content !== null &&
    "excerpt" in parsed.data.content
      ? String((parsed.data.content as { excerpt?: unknown }).excerpt ?? "")
      : undefined;

  return {
    title: String(parsed.data.title ?? slug),
    slug,
    category:
      typeof category === "string"
        ? category
        : category && typeof category === "object" && "uri" in category
          ? String((category as { uri?: unknown }).uri ?? "")
          : undefined,
    excerpt: frontmatterExcerpt ?? summarizeMarkdown(parsed.content),
    parent:
      parent && typeof parent === "object" && "uri" in parent
        ? String((parent as { uri?: unknown }).uri ?? "")
        : undefined,
    content: parsed.content,
    sourceFile,
  };
}

async function listSourceDocs(source: DocsSource): Promise<DocsEntry[]> {
  const docsDir = await getDocsDir(source);
  const files = await fs.readdir(docsDir, { withFileTypes: true });
  const docs = await Promise.all(
    files
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => readDocFile(source, entry.name)),
  );
  return docs.sort((a, b) => a.title.localeCompare(b.title));
}

async function getSourceDoc(
  source: DocsSource,
  slug: string,
): Promise<DocsEntry | null> {
  const docs = await listSourceDocs(source);
  const normalized = slug.toLowerCase();
  return (
    docs.find(
      (entry) =>
        entry.slug.toLowerCase() === normalized ||
        normalizeSlug(path.basename(entry.sourceFile)).toLowerCase() === normalized,
    ) ?? null
  );
}

export async function listReadmeDocs(): Promise<DocsEntryMeta[]> {
  return listSourceDocs("public").then((docs) =>
    docs.map(({ title, slug, category, excerpt, parent }) => ({
      title,
      slug,
      category,
      excerpt,
      parent,
    })),
  );
}

export async function getReadmeDoc(slug: string): Promise<DocsEntry | null> {
  return getSourceDoc("public", slug);
}

export async function listEngineeringDocs(): Promise<DocsEntryMeta[]> {
  return listSourceDocs("engineering").then((docs) =>
    docs.map(({ title, slug, category, excerpt, parent }) => ({
      title,
      slug,
      category,
      excerpt,
      parent,
    })),
  );
}

export async function getEngineeringDoc(
  slug: string,
): Promise<DocsEntry | null> {
  return getSourceDoc("engineering", slug);
}
