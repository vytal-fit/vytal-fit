"use client";

import {
  HelpCircle,
  ExternalLink,
  Bug,
  Keyboard,
  Info,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function HelpPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">
          {t("nav.help")}
        </h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Resources and shortcuts to help you get the most out of Vytal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Help Center */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
            <HelpCircle className="h-5 w-5 text-vytal-blue" />
          </div>
          <h3 className="text-sm font-bold text-vytal-text">Centro de Ajuda</h3>
          <p className="mt-1 text-xs text-vytal-muted">
            Guides, tutorials and frequently asked questions.
          </p>
          <a
            href="#"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Report Problem */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
            <Bug className="h-5 w-5 text-vytal-red" />
          </div>
          <h3 className="text-sm font-bold text-vytal-text">Reportar Problema</h3>
          <p className="mt-1 text-xs text-vytal-muted">
            Found a bug or issue? Let us know so we can fix it.
          </p>
          <a
            href="#"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
          >
            Report <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
            <Keyboard className="h-5 w-5 text-vytal-amber" />
          </div>
          <h3 className="text-sm font-bold text-vytal-text">Atalhos de Teclado</h3>
          <p className="mt-1 text-xs text-vytal-muted">
            Speed up your workflow with keyboard shortcuts.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-vytal-muted">Command Palette</span>
              <kbd className="rounded border border-vytal-border bg-vytal-bg3 px-1.5 py-0.5 text-[10px] font-semibold text-vytal-muted">
                Cmd+K
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-vytal-muted">Toggle Theme</span>
              <span className="text-[10px] text-vytal-muted">via top bar</span>
            </div>
          </div>
        </div>
      </div>

      {/* App Version */}
      <div className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
        <Info className="h-4 w-4 text-vytal-muted" />
        <span className="text-xs text-vytal-muted">Vytal v1.0.0</span>
      </div>
    </div>
  );
}
