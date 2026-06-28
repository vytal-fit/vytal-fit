"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

function getPasswordStrength(password: string): {
  score: number;
  labelKey: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, labelKey: "auth.passwordWeak", color: "bg-vytal-red" };
  if (score <= 2) return { score: 2, labelKey: "auth.passwordFair", color: "bg-vytal-amber" };
  if (score <= 3) return { score: 3, labelKey: "auth.passwordGood", color: "bg-vytal-blue" };
  return { score: 4, labelKey: "auth.passwordStrong", color: "bg-vytal-green" };
}

function ResetPasswordForm() {
  const { t } = useI18n();
  const params = useParams<{ token: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const token = params?.token ?? "";
  const callbackURL = search?.get("callbackURL") ?? "/login";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(
    () => (password.length > 0 ? getPasswordStrength(password) : null),
    [password]
  );

  const tooShort = password.length > 0 && password.length < 10;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 10 && password === confirm && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message ?? t("auth.resetInvalidToken"));
      return;
    }

    setSuccess(true);
    // Soft nav is fine here: there's no session yet (user signs in afterwards).
    setTimeout(() => router.replace(callbackURL), 1600);
  }

  // No token in the URL — the link is malformed/expired.
  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8 text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-base font-medium text-vytal-muted/60">pro</span><span className="text-vytal-green">VYTAL</span>
            </h1>
          </div>
          <h2 className="text-lg font-bold text-vytal-text">
            {t("auth.resetLinkInvalidTitle")}
          </h2>
          <p className="mt-2 text-sm text-vytal-muted">
            {t("auth.resetLinkInvalidDesc")}
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
          >
            {t("auth.requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-base font-medium text-vytal-muted/60">pro</span><span className="text-vytal-green">VYTAL</span>
          </h1>
          <p className="mt-2 text-sm text-vytal-muted">
            {t("auth.newPasswordTitle")}
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-vytal-green/10">
              <CheckCircle2 className="h-8 w-8 text-vytal-green" />
            </div>
            <h2 className="text-lg font-bold text-vytal-text">
              {t("auth.passwordUpdatedTitle")}
            </h2>
            <p className="mt-2 text-sm text-vytal-muted">
              {t("auth.passwordUpdatedDesc")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-vytal-muted">
              {t("auth.newPasswordDescription")}
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
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
              >
                {t("auth.newPassword")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.minChars")}
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
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors duration-300",
                          level <= strength.score ? strength.color : "bg-vytal-bg3"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn("mt-1 text-[10px] font-medium", strength.color.replace("bg-", "text-"))}>
                    {t(strength.labelKey)}
                  </p>
                </div>
              )}
              {tooShort && (
                <p className="mt-1 text-xs text-vytal-red">
                  {t("auth.passwordMinLength")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
              >
                {t("auth.confirmPassword")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("auth.confirmPlaceholder")}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              {mismatch && (
                <p className="mt-1 text-xs text-vytal-red">
                  {t("auth.passwordMismatch")}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-3 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  {t("auth.updatePassword")}
                </>
              )}
            </button>
          </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
