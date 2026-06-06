"use client";

import { Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "pt" as const, label: "PT" },
  { code: "en" as const, label: "EN" },
  { code: "es" as const, label: "ES" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language, setLanguage } = useI18n();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-vytal-bg">
      {/* Top-right controls */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        {/* Language switcher */}
        <div className="flex items-center rounded-lg border border-vytal-border bg-vytal-bg2/80 backdrop-blur-sm">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={cn(
                "px-2.5 py-1.5 text-[11px] font-semibold transition-colors first:rounded-l-lg last:rounded-r-lg",
                language === l.code
                  ? "bg-vytal-green/10 text-vytal-green"
                  : "text-vytal-muted hover:text-vytal-text"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2/80 backdrop-blur-sm text-vytal-muted transition-colors hover:text-vytal-text"
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Animated gradient background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-auth-gradient absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-vytal-green/[0.04] blur-[120px]" />
        <div className="animate-auth-gradient-delayed absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-vytal-green/[0.03] blur-[100px]" />
        <div className="animate-auth-gradient absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-vytal-green/[0.02] blur-[80px]" />
      </div>
      <div className="relative z-10 w-full px-4">{children}</div>
    </div>
  );
}
