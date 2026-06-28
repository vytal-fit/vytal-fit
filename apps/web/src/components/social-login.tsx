"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";

/** Google "G" mark, inlined so no external asset is fetched (CSP-safe). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

/** "Continue with Google" button. `callbackURL` is where Better Auth returns after sign-in. */
export function SocialLogin({ callbackURL = "/welcome" }: { callbackURL?: string }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleGoogle() {
    setError(false);
    setLoading(true);
    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
      if (signInError) {
        setError(true);
        setLoading(false);
      }
      // On success the browser redirects to Google — keep the spinner up.
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm font-semibold text-vytal-text transition-colors hover:border-vytal-green/40 hover:bg-vytal-bg3 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-text border-t-transparent" />
        ) : (
          <GoogleIcon className="h-[18px] w-[18px]" />
        )}
        {t("auth.continueWithGoogle")}
      </button>
      {error && (
        <p className="text-center text-xs text-vytal-red">
          {t("auth.googleError")}
        </p>
      )}
    </div>
  );
}

/** Labelled "— or —" divider for separating the email form from social sign-in. */
export function AuthDivider() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-vytal-border" />
      <span className="text-[11px] font-medium uppercase tracking-wider text-vytal-muted/60">
        {t("auth.or")}
      </span>
      <div className="h-px flex-1 bg-vytal-border" />
    </div>
  );
}
