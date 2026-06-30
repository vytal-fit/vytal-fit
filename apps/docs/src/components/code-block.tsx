"use client";

import { useState, type ComponentPropsWithoutRef, type ReactElement } from "react";
import { Check, Copy } from "lucide-react";
import { childrenToString } from "@/lib/toc";

const LANG_LABEL: Record<string, string> = {
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  zsh: "Shell",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  json: "JSON",
  http: "HTTP",
  curl: "cURL",
  sql: "SQL",
  yaml: "YAML",
  bash5: "Shell",
};

export function CodeBlock({ children }: ComponentPropsWithoutRef<"pre">) {
  const [copied, setCopied] = useState(false);

  const first = Array.isArray(children) ? children[0] : children;
  const isElement = Boolean(first) && typeof first === "object" && "props" in (first as object);
  const codeEl = isElement
    ? (first as ReactElement<{ className?: string; children?: React.ReactNode }>)
    : undefined;
  const className = codeEl?.props?.className ?? "";
  const lang = /language-([\w-]+)/.exec(className)?.[1];
  const raw = childrenToString(children);

  async function copy() {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked; no-op
    }
  }

  return (
    <div className="group relative mt-5 overflow-hidden rounded-xl border border-vytal-border bg-[#0b110d]">
      <div className="flex items-center justify-between border-b border-vytal-border/70 px-4 py-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.15em] text-vytal-muted">
          {lang ? (LANG_LABEL[lang] ?? lang) : "Code"}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-vytal-muted opacity-0 transition hover:text-vytal-green focus-visible:opacity-100 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-vytal-green" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6">{children}</pre>
    </div>
  );
}
