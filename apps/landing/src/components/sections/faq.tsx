"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { WaveDivider } from "@/components/decor";
import { useScrollReveal } from "@/lib/hooks";

// ── FAQ accordion ───────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-vytal-border rounded-xl overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[rgba(34,197,94,0.04)] transition-colors duration-150"
      >
        <span className="font-medium text-vytal-text text-sm leading-snug pr-4">{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-vytal-green transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-vytal-muted text-sm leading-relaxed border-t border-[rgba(34,197,94,0.08)] pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_KEYS = [
  { q: "faq1q", a: "faq1a" },
  { q: "faq2q", a: "faq2a" },
  { q: "faq3q", a: "faq3a" },
  { q: "faq4q", a: "faq4a" },
  { q: "faq5q", a: "faq5a" },
  { q: "faq6q", a: "faq6a" },
];

export function FAQ({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section id="faq" className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("faqBadge")}</span>
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
            {t("faqTitle")} <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">{t("faqTitleHighlight")}</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ_KEYS.map((item) => (
            <FAQItem key={item.q} question={t(item.q)} answer={t(item.a)} />
          ))}
        </div>
      </div>
    </section>
  );
}
