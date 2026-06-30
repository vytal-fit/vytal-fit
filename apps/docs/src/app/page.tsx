import Link from "next/link";
import { ArrowRight, Rocket, FileJson } from "lucide-react";
import { listReadmeDocs } from "@vytal-fit/shared/readme-docs";
import { DocsShell } from "@/components/docs-shell";
import { buildNav } from "@/lib/nav";

export const dynamic = "force-static";

export default async function DocsHomePage() {
  const docs = await listReadmeDocs();
  const nav = buildNav(docs);
  const bySlug = new Map(docs.map((d) => [d.slug, d] as const));

  return (
    <DocsShell nav={nav} toc={[]} current="">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-vytal-green">
          Vytal · Developer docs
        </p>
        <h1 className="mt-4 text-[clamp(36px,6vw,52px)] font-bold leading-[1.05] tracking-[-0.03em]">
          One API for the gym’s heartbeat.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-vytal-muted">
          Members, classes, bookings, WODs and results, all scoped to the caller’s active
          organization. Sign in once, carry the session by cookie or bearer token, and build.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/quickstart"
            className="inline-flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-[#08120c] transition hover:opacity-90"
          >
            <Rocket className="h-4 w-4" />
            Quickstart
          </Link>
          <Link
            href="https://api.vytal.fit/openapi.json"
            className="inline-flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2.5 text-sm font-medium text-vytal-text transition hover:border-vytal-green/40"
          >
            <FileJson className="h-4 w-4" />
            OpenAPI spec
          </Link>
        </div>

        {/* Grouped index */}
        <div className="mt-16 flex flex-col gap-12">
          {nav.map((group) => (
            <section key={group.label}>
              <h2 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-vytal-muted">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map((item) => {
                  const doc = bySlug.get(item.slug);
                  return (
                    <Link
                      key={item.slug}
                      href={`/${item.slug}`}
                      className="group rounded-xl border border-vytal-border bg-vytal-bg2/40 p-5 transition hover:border-vytal-green/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-vytal-text">{item.title}</h3>
                        <ArrowRight className="h-4 w-4 shrink-0 text-vytal-muted transition group-hover:translate-x-0.5 group-hover:text-vytal-green" />
                      </div>
                      {doc?.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-[13.5px] leading-6 text-vytal-muted">
                          {doc.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DocsShell>
  );
}
