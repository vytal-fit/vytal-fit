"use client";

import { useEffect, useState, useRef } from "react";
import { STORAGE_KEYS } from "@vytal-fit/shared";
import { LANDING_COPY, type Lang } from "@/lib/copy";

// ── Scroll Reveal Hook ──────────────────────────────────────────────────────
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-revealed", "true");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useLandingLang() {
  const [lang, setLang] = useState<Lang>("pt");
  // Restore + persist the visitor's language (preferences-only localStorage).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.language);
    if (stored === "pt" || stored === "en" || stored === "es") setLang(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, lang);
  }, [lang]);
  const t = (key: string) => LANDING_COPY[lang][key] ?? key;
  return { lang, setLang, t };
}

// ── Pricing toggle ──────────────────────────────────────────────────────────
export function usePricingToggle() {
  const [annual, setAnnual] = useState(false);
  return { annual, setAnnual };
}
