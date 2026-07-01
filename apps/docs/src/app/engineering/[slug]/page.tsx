import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getEngineeringDoc, listEngineeringDocs } from "@vytal-fit/content/engineering-docs";
import { Markdown } from "@/components/markdown";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const docs = await listEngineeringDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export default async function EngineeringDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getEngineeringDoc(slug);

  if (!doc) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/engineering"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium transition hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Engineering
            </Link>
            <Link
              href="https://docs.vytal.fit"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium transition hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              ReadMe
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight">{doc.title}</h1>
            {doc.excerpt ? (
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {doc.excerpt}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <article className="max-w-none">
          <Markdown>{doc.content}</Markdown>
        </article>
      </section>
    </main>
  );
}
