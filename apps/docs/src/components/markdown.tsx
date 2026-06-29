import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

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

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
      {children}
    </ReactMarkdown>
  );
}
