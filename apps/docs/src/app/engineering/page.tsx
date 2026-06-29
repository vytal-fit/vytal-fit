import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import { listEngineeringDocs } from "@vytal-fit/shared/engineering-docs";

export const dynamic = "force-static";

export default async function EngineeringIndexPage() {
  const docs = await listEngineeringDocs();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium transition hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Docs
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Engineering
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">Repo notes</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Internal planning, PRD, execution, and QA documents for the repo.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {docs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/engineering/${doc.slug}`}
              className="group rounded-lg border border-border bg-card p-5 transition hover:border-foreground/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold">{doc.title}</h2>
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {doc.excerpt ?? "Internal repo documentation"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
