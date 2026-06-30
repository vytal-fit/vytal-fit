export interface NavItem {
  slug: string;
  title: string;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Curated information architecture. Slugs not listed here fall into "More". */
const NAV_ORDER: { label: string; slugs: string[] }[] = [
  { label: "Get started", slugs: ["getting-started", "quickstart"] },
  { label: "Core concepts", slugs: ["conventions", "auth-and-sessions", "errors", "rest-api-principles"] },
  { label: "Build", slugs: ["developer-api", "examples", "mobile", "deployment"] },
];

export function buildNav(docs: { slug: string; title: string }[]): NavGroup[] {
  const bySlug = new Map(docs.map((d) => [d.slug, d.title] as const));
  const used = new Set<string>();
  const groups: NavGroup[] = [];

  for (const group of NAV_ORDER) {
    const items: NavItem[] = [];
    for (const slug of group.slugs) {
      const title = bySlug.get(slug);
      if (!title) continue;
      items.push({ slug, title });
      used.add(slug);
    }
    if (items.length) groups.push({ label: group.label, items });
  }

  const leftover = docs.filter((d) => !used.has(d.slug));
  if (leftover.length) {
    groups.push({ label: "More", items: leftover.map((d) => ({ slug: d.slug, title: d.title })) });
  }
  return groups;
}

export function flattenNav(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((g) => g.items);
}
