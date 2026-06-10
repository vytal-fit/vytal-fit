"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useI18n } from "@/lib/i18n";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const success = await login(email, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-base font-medium text-vytal-muted/60">pro</span><span className="text-vytal-green">VYTAL</span>
          </h1>
          <p className="mt-2 text-sm text-vytal-muted">
            {t("auth.subtitle")}
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-all hover:bg-vytal-bg3 hover:border-vytal-green/20 hover:shadow-sm active:scale-[0.98]"
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-all hover:bg-vytal-bg3 hover:border-vytal-green/20 hover:shadow-sm active:scale-[0.98]"
          >
            <AppleIcon />
            Apple
          </button>
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-vytal-border" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-vytal-muted">ou</span>
          <div className="h-px flex-1 bg-vytal-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-lg px-4 py-3 text-sm font-medium"
              style={{
                background: "rgba(255,71,87,0.10)",
                color: "var(--color-vytal-red)",
                border: "1px solid rgba(255,71,87,0.20)",
              }}
            >
              {t("auth.invalidCredentials")}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
            >
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
            >
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
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

          {/* Forgot password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-vytal-muted transition-colors hover:text-vytal-green"
            >
              {t("auth.forgotPassword")}
            </Link>
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
                {t("auth.login")}
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-vytal-muted">
            {t("auth.noAccount")}{" "}
            <Link
              href="/register"
              className="font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
            >
              {t("auth.createAccount")}
            </Link>
          </span>
        </div>

        {/* Demo credentials hint */}
        <p className="mt-4 text-center text-[11px] text-vytal-muted/60">
          {t("auth.demoHint")}{" "}
          <span className="font-mono text-vytal-muted/80">
            jose@vytal.fit · VytalDemo2026!
          </span>
        </p>
      </div>

      {/* Powered by footer */}
      <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-vytal-muted/40">
        Powered by Vytal
      </p>
    </div>
  );
}
