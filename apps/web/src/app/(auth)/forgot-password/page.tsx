"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);

    // `redirectTo` is the path the server appends the token to — the email hook
    // builds the final `${baseURL}/reset-password/${token}` link from it.
    const { error: resetError } = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (resetError) {
      setError(true);
      return;
    }

    setSent(true);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-base font-medium text-vytal-muted/60">pro</span><span className="text-vytal-green">VYTAL</span>
          </h1>
          <p className="mt-2 text-sm text-vytal-muted">
            {t("auth.resetTitle")}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-vytal-muted">
              {t("auth.resetDescription")}
            </p>

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
                {t("auth.resetError")}
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-3 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t("auth.sendResetLink")}
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-vytal-green/10">
              <Mail className="h-8 w-8 text-vytal-green" />
            </div>
            <h2 className="text-lg font-bold text-vytal-text">
              {t("auth.checkEmailTitle")}
            </h2>
            <p className="mt-2 text-sm text-vytal-muted">
              {t("auth.checkEmailBefore")}{" "}
              <span className="font-medium text-vytal-text">{email}</span>
              {t("auth.checkEmailAfter")}
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-vytal-muted transition-colors hover:text-vytal-green"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("auth.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
