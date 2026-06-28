"use client";

import Link from "next/link";
import { ArrowLeft, LifeBuoy, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const SUPPORT_EMAIL = "support@vytal.fit";

export default function SupportPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-vytal-bg px-4 py-10 text-vytal-text">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-vytal-muted transition-colors hover:text-vytal-green"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("supportPage.backToApp")}
        </Link>

        <article className="rounded-2xl border border-vytal-border bg-vytal-card p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-green/10 text-vytal-green">
            <LifeBuoy className="h-7 w-7" />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            {t("supportPage.title")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-vytal-muted">
            {t("supportPage.intro")}
          </p>

          <div className="mt-8 space-y-4">
            <section className="space-y-1.5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-vytal-muted">
                {t("supportPage.contactTitle")}
              </h2>
              <p className="text-sm leading-6 text-vytal-muted">
                {t("supportPage.contactBody")}
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-3 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
              >
                <Mail className="h-4 w-4" />
                {SUPPORT_EMAIL}
              </a>
            </section>

            <section className="space-y-1.5 border-t border-vytal-border pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-vytal-muted">
                {t("supportPage.securityTitle")}
              </h2>
              <p className="text-sm leading-6 text-vytal-muted">
                {t("supportPage.securityBody")}
              </p>
            </section>
          </div>
        </article>

        <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-vytal-muted/40">
          Powered by Vytal
        </p>
      </div>
    </main>
  );
}
