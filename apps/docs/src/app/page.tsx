import Link from "next/link";
import { ExternalLink, FileText, Sparkles } from "lucide-react";
import { listReadmeDocs } from "@vytal-fit/shared/readme-docs";

export const dynamic = "force-static";

export default async function DocsHomePage() {
  const publicDocs = await listReadmeDocs();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Vytal Docs
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Documentation dashboard
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Public markdown lives in <code className="font-mono">apps/api/readme</code>,
              syncs to ReadMe, and renders here as the production docs home.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="https://api.vytal.fit/openapi.json"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              OpenAPI
            </Link>
            <Link
              href="https://api.vytal.fit/openapi.json"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              JSON
            </Link>
            <Link
              href="https://docs.readme.com"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              ReadMe
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  ReadMe synced
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Public docs</h2>
              </div>
              <span className="text-sm text-muted-foreground">{publicDocs.length} pages</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {publicDocs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/${doc.slug}`}
                  className="group rounded-lg border border-border bg-card p-5 transition hover:border-foreground/20 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold">{doc.title}</h3>
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {doc.excerpt ?? "Markdown-backed docs page synced to ReadMe."}
                  </p>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
