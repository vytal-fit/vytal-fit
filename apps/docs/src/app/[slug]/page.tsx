import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getReadmeDoc, listReadmeDocs } from "@vytal-fit/shared/readme-docs";
import { Markdown } from "@/components/markdown";
import { DocsShell } from "@/components/docs-shell";
import { buildNav, flattenNav } from "@/lib/nav";
import { extractToc } from "@/lib/toc";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const docs = await listReadmeDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export default async function DocsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doc, docs] = await Promise.all([getReadmeDoc(slug), listReadmeDocs()]);

  if (!doc) {
    notFound();
  }

  const nav = buildNav(docs);
  const flat = flattenNav(nav);
  const toc = extractToc(doc.content);
  const idx = flat.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const groupLabel = nav.find((g) => g.items.some((i) => i.slug === slug))?.label;

  // Drop a leading H1 that duplicates the page title.
  const body = doc.content.replace(/^\s*#\s+.+\n+/, "");

  return (
    <DocsShell nav={nav} toc={toc} current={slug}>
      <div className="mx-auto max-w-2xl">
        <header className="border-b border-vytal-border pb-8">
          {groupLabel ? (
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-vytal-green">
              {groupLabel}
            </p>
          ) : null}
          <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
          {doc.excerpt ? (
            <p className="mt-4 text-[15px] leading-7 text-vytal-muted">{doc.excerpt}</p>
          ) : null}
        </header>

        <article className="max-w-none">
          <Markdown>{body}</Markdown>
        </article>

        {(prev || next) && (
          <nav className="mt-16 grid grid-cols-1 gap-3 border-t border-vytal-border pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/${prev.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-vytal-border p-4 transition hover:border-vytal-green/40"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-vytal-muted">
                  <ArrowLeft className="h-3.5 w-3.5" /> Previous
                </span>
                <span className="font-medium text-vytal-text group-hover:text-vytal-green">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/${next.slug}`}
                className="group flex flex-col items-end gap-1 rounded-xl border border-vytal-border p-4 text-right transition hover:border-vytal-green/40"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-vytal-muted">
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium text-vytal-text group-hover:text-vytal-green">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </DocsShell>
  );
}
