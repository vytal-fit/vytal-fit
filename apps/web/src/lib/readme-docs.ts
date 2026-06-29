import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const DOCS_DIR_CANDIDATES = [
  path.join(process.cwd(), "readme/docs"),
  path.join(process.cwd(), "..", "readme/docs"),
  path.join(process.cwd(), "..", "..", "readme/docs"),
];

let docsDirPromise: Promise<string> | null = null;

async function resolveDocsDir(): Promise<string> {
  for (const candidate of DOCS_DIR_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Keep trying the next candidate.
    }
  }

  return DOCS_DIR_CANDIDATES[0];
}

async function getDocsDir(): Promise<string> {
  docsDirPromise ??= resolveDocsDir();
  return docsDirPromise;
}

export interface ReadmeDocMeta {
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  parent?: string;
}

export interface ReadmeDoc extends ReadmeDocMeta {
  content: string;
  sourceFile: string;
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

async function readDocFile(fileName: string): Promise<ReadmeDoc> {
  const sourceFile = path.join(await getDocsDir(), fileName);
  const raw = await fs.readFile(sourceFile, "utf8");
  const parsed = matter(raw);
  const slug = String(parsed.data.slug ?? fileName.replace(/\.md$/, ""));
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
    excerpt:
      frontmatterExcerpt ?? summarizeMarkdown(parsed.content),
    parent:
      parent && typeof parent === "object" && "uri" in parent
        ? String((parent as { uri?: unknown }).uri ?? "")
        : undefined,
    content: parsed.content,
    sourceFile,
  };
}

export async function listReadmeDocs(): Promise<ReadmeDocMeta[]> {
  const files = await fs.readdir(await getDocsDir());
  const docs = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map((file) => readDocFile(file)),
  );
  return docs
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(({ title, slug, category, excerpt, parent }) => ({
      title,
      slug,
      category,
      excerpt,
      parent,
    }));
}

export async function getReadmeDoc(slug: string): Promise<ReadmeDoc | null> {
  const files = await fs.readdir(await getDocsDir());
  const file = files.find((entry) => entry.replace(/\.md$/, "") === slug);
  if (!file) return null;
  return readDocFile(file);
}
