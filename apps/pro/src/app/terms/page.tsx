"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-vytal-bg px-4 py-10 text-vytal-text">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/register"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-vytal-muted transition-colors hover:text-vytal-green"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("legal.backToRegister")}
        </Link>

        <article className="space-y-8">
          <header className="border-b border-vytal-border pb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-vytal-green">
              {t("legal.updated")}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {t("legal.termsTitle")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-vytal-muted">
              {t("legal.termsIntro")}
            </p>
          </header>

          {["scope", "account", "data", "payments", "contact"].map((section) => (
            <section key={section} className="space-y-2">
              <h2 className="text-lg font-semibold">{t(`legal.${section}Title`)}</h2>
              <p className="text-sm leading-6 text-vytal-muted">
                {t(`legal.${section}Body`)}
              </p>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
