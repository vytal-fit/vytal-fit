import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getReadmeDoc, listReadmeDocs } from "@/lib/readme-docs";

export const dynamic = "force-static";

const markdownComponents: Components = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 {...props} className="mt-10 text-3xl font-semibold tracking-tight first:mt-0" />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 {...props} className="mt-8 text-2xl font-semibold tracking-tight" />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className="mt-6 text-xl font-semibold tracking-tight" />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="mt-4 text-sm leading-7 text-foreground" />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-foreground" />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-foreground" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="mt-4 border-l-2 border-border pl-4 text-sm leading-7 text-muted-foreground"
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className="font-medium text-foreground underline decoration-border underline-offset-4 transition hover:text-muted-foreground"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs leading-6 text-foreground"
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code {...props} className="font-mono text-[0.92em] text-foreground" />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-4 overflow-x-auto">
      <table {...props} className="w-full border-collapse text-left text-sm" />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th {...props} className="border-b border-border px-3 py-2 font-semibold" />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td {...props} className="border-b border-border px-3 py-2 align-top" />
  ),
};

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
  const doc = await getReadmeDoc(slug);

  if (!doc) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-medium transition hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Docs
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
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {doc.content}
          </ReactMarkdown>
        </article>

      </section>
    </main>
  );
}
