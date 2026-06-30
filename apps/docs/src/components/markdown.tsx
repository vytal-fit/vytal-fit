import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { childrenToString, slugify } from "@/lib/toc";

function Heading({
  level,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"h2"> & { level: 1 | 2 | 3 }) {
  const id = level === 1 ? undefined : slugify(childrenToString(children));
  const Tag = (`h${level}` as const);
  return (
    <Tag id={id} className={`group scroll-mt-24 ${className ?? ""}`} {...props}>
      {id ? (
        <a
          href={`#${id}`}
          aria-label="Link to this section"
          className="mr-2 -ml-5 inline-block w-3 align-middle text-vytal-green opacity-0 no-underline transition group-hover:opacity-100"
        >
          #
        </a>
      ) : null}
      {children}
    </Tag>
  );
}

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <Heading level={1} className="mt-12 text-3xl font-bold tracking-tight first:mt-0" {...props}>
      {children}
    </Heading>
  ),
  h2: ({ children, ...props }) => (
    <Heading
      level={2}
      className="mt-12 border-t border-vytal-border pt-8 text-2xl font-semibold tracking-tight"
      {...props}
    >
      {children}
    </Heading>
  ),
  h3: ({ children, ...props }) => (
    <Heading level={3} className="mt-8 text-lg font-semibold tracking-tight" {...props}>
      {children}
    </Heading>
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="mt-4 text-[15px] leading-7 text-vytal-text/85" />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-vytal-text/85 marker:text-vytal-green" />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-vytal-text/85 marker:text-vytal-muted" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} className="pl-1" />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="mt-5 rounded-r-lg border-l-2 border-vytal-green bg-vytal-green/[0.06] py-2 pl-4 pr-3 text-[15px] leading-7 text-vytal-text/80"
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className="font-medium text-vytal-green underline decoration-vytal-green/30 underline-offset-4 transition hover:decoration-vytal-green"
    />
  ),
  hr: () => <hr className="my-10 border-0 border-t border-vytal-border" />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-semibold text-vytal-text" />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="mt-5 overflow-x-auto rounded-xl border border-vytal-border bg-[#0b110d] p-4 text-[13px] leading-6 [&_code]:text-vytal-text/90"
    />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => {
    const isBlock = className?.includes("language-");
    if (isBlock) return <code {...props} className={`font-mono ${className ?? ""}`} />;
    return (
      <code
        {...props}
        className="rounded-md border border-vytal-border bg-vytal-bg3/60 px-1.5 py-0.5 font-mono text-[0.85em] text-vytal-green"
      />
    );
  },
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-6 overflow-x-auto rounded-xl border border-vytal-border">
      <table {...props} className="w-full border-collapse text-left text-sm" />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead {...props} className="bg-vytal-bg3/50" />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th {...props} className="border-b border-vytal-border px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-vytal-muted" />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td {...props} className="border-b border-vytal-border/60 px-4 py-2.5 align-top text-[14px] text-vytal-text/85" />
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="docs-prose">
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
