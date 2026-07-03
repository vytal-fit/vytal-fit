"use client";

import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import { useLandingLang } from "@/lib/hooks";

const COPY = {
  pt: { title: "Página não encontrada", body: "A página que procura não existe ou foi movida.", home: "Voltar ao início", cta: "Acesso antecipado" },
  en: { title: "Page not found", body: "The page you're looking for doesn't exist or has moved.", home: "Back home", cta: "Early access" },
  es: { title: "Página no encontrada", body: "La página que buscas no existe o se ha movido.", home: "Volver al inicio", cta: "Acceso anticipado" },
};

export default function NotFound() {
  const { lang } = useLandingLang();
  const c = COPY[lang] ?? COPY.pt;

  return (
    <main className="min-h-screen bg-vytal-bg text-vytal-text flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="flex items-center gap-0.5 mb-10">
        <span className="text-2xl font-bold text-vytal-green">Vytal</span>
        <span className="text-2xl font-bold text-vytal-muted">.fit</span>
      </Link>

      <p
        className="text-[clamp(4rem,14vw,9rem)] font-bold leading-none bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent italic"
        style={{ fontFamily: "var(--font-accent), serif" }}
      >
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-vytal-text">{c.title}</h1>
      <p className="mt-2 max-w-md text-sm text-vytal-muted leading-relaxed">{c.body}</p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-vytal-green px-6 py-3 text-sm font-semibold text-vytal-bg transition-colors hover:bg-[#16a34a]"
        >
          <Home size={16} />
          {c.home}
        </Link>
        <Link
          href="/#early-bird"
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(34,197,94,0.25)] px-6 py-3 text-sm font-medium text-vytal-text transition-colors hover:border-vytal-green/60 hover:bg-[rgba(34,197,94,0.05)]"
        >
          {c.cta}
          <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
