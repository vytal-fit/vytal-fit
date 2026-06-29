"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth-store";
import { AuthDivider, SocialLogin } from "@/components/social-login";

/** Post-signup target from `?redirect=`/`?invite=`, else null. Same-origin relative paths only. */
function resolvePostAuthTarget(params: URLSearchParams): string | null {
  const redirect = params.get("redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  const invite = params.get("invite");
  if (invite) return `/invite/${encodeURIComponent(invite)}`;
  return null;
}

function getPasswordStrength(password: string): { score: number; labelKey: string; color: string } {
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

function RegisterForm() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const register = useAuthStore((s) => s.register);
  const target = resolvePostAuthTarget(searchParams);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const strength = useMemo(
    () => (form.password.length > 0 ? getPasswordStrength(form.password) : null),
    [form.password]
  );

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("auth.nameRequired");
    if (!form.email.trim()) errs.email = t("auth.emailRequired");
    if (form.password.length < 10)
      errs.password = t("auth.passwordMinLength");
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = t("auth.passwordMismatch");
    if (!acceptTerms) errs.terms = t("auth.termsRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const ok = await register(form.name.trim(), form.email.trim(), form.password);
    if (!ok) {
      setLoading(false);
      setErrors({ email: t("auth.registerFailed") });
      return;
    }
    // Hard navigation (not router.push): a fresh signup has no active org yet, so
    // a soft transition into /onboarding leaves the Better Auth org hooks pending
    // and the loader wedges. A full document load re-initialises them cleanly.
    window.location.assign(target ?? "/onboarding");
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-base font-medium text-vytal-muted/60">pro</span><span className="text-vytal-green">VYTAL</span>
          </h1>
          <p className="mt-2 text-sm text-vytal-muted">
            {t("auth.registerSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
            >
              {t("auth.name")}
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={t("auth.namePlaceholder")}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-vytal-red">{errors.name}</p>
            )}
          </div>

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
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-vytal-red">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
            >
              {t("auth.phone")}{" "}
              <span className="normal-case tracking-normal text-vytal-muted/60">
                ({t("auth.optional")})
              </span>
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder={t("auth.phonePlaceholder")}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>

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
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
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
            {errors.password && (
              <p className="mt-1 text-xs text-vytal-red">{errors.password}</p>
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
                type={showConfirm ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder={t("auth.confirmPlaceholder")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 pr-11 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vytal-muted transition-colors hover:text-vytal-text"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-vytal-red">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => {
                setAcceptTerms(!acceptTerms);
                if (errors.terms) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.terms;
                    return next;
                  });
                }
              }}
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors duration-200",
                acceptTerms
                  ? "border-vytal-green bg-vytal-green"
                  : "border-vytal-border bg-vytal-bg2"
              )}
            >
              {acceptTerms && (
                <svg className="h-3 w-3 text-vytal-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-xs text-vytal-muted leading-relaxed">
              {t("auth.acceptTermsPrefix")}{" "}
              <Link href="/terms" className="text-vytal-green hover:underline">
                {t("auth.terms")}
              </Link>{" "}
              {t("auth.acceptTermsMiddle")}{" "}
              <Link href="/privacy" className="text-vytal-green hover:underline">
                {t("auth.privacy")}
              </Link>
            </span>
          </div>
          {errors.terms && (
            <p className="text-xs text-vytal-red">{errors.terms}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-3 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {t("auth.createAccount")}
              </>
            )}
          </button>
        </form>

        <div className="my-6">
          <AuthDivider />
        </div>

        <SocialLogin callbackURL={target ?? "/welcome"} />

        <div className="mt-6 text-center">
          <span className="text-sm text-vytal-muted">
            {t("auth.hasAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
            >
              {t("auth.login")}
            </Link>
          </span>
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-vytal-muted/40">
        Powered by Vytal
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
