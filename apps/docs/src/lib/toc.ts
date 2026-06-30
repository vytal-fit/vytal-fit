import type { ReactNode } from "react";

export interface TocItem {
  depth: 2 | 3;
  text: string;
  id: string;
}

/** Stable slug from heading text, shared by the TOC and the heading anchors. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Flatten React markdown children down to a plain string for id derivation. */
export function childrenToString(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToString).join("");
  if (typeof children === "object" && "props" in children) {
    return childrenToString((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/** Pull h2/h3 headings from raw markdown, skipping fenced code blocks. */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.*\S)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1].length as 2 | 3;
    const text = m[2].replace(/[`*_~]/g, "").trim();
    items.push({ depth, text, id: slugify(text) });
  }
  return items;
}
