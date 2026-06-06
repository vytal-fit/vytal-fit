"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "pt" as const, label: "PT" },
  { code: "en" as const, label: "EN" },
  { code: "es" as const, label: "ES" },
];

export default function ConsoleLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { language, setLanguage } = useI18n();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const hydrateApp = useAppStore((s) => s.hydrate);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
    hydrateApp();
  }, [hydrate, hydrateApp]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/console");
    }
  }, [isAuthenticated, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        router.push("/console");
      } else {
        setError("Email ou palavra-passe incorretos.");
      }
      setLoading(false);
    }, 400);
  }

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

      {/* Card */}
      <div className="relative z-10 w-full px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
            {/* Logo */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-vytal-muted/70">my</span>
                <span className="text-vytal-green">VYTAL</span>
              </h1>
              <p className="mt-2 text-sm text-vytal-muted">
                Portal do Atleta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium"
                  style={{
                    background: "rgba(255,71,87,0.10)",
                    color: "var(--color-vytal-red)",
                    border: "1px solid rgba(255,71,87,0.20)",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="atleta@exemplo.com"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
                >
                  Palavra-passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 pr-11 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vytal-muted transition-colors hover:text-vytal-text"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-3 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            {/* No account note */}
            <div className="mt-6 text-center">
              <p className="text-sm text-vytal-muted">
                Nao tem conta?{" "}
                <span className="font-medium text-vytal-text">
                  Fale com o seu espaco.
                </span>
              </p>
            </div>
          </div>

          {/* Powered by footer */}
          <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-vytal-muted/40">
            Powered by Vytal
          </p>
        </div>
      </div>
    </div>
  );
}
