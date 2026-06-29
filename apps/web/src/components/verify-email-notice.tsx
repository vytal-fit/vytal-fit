"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailWarning, RefreshCw, LogOut, Check, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth-store";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type ResendStatus = "idle" | "sending" | "sent" | "error";

/**
 * Email-confirmation gate shown before onboarding. A fresh signup is auto
 * signed in but stays unverified; clicking the emailed link verifies the
 * account and bounces back to `/welcome`, completing the loop.
 */
export function VerifyEmailNotice() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [status, setStatus] = useState<ResendStatus>("idle");
  const [error, setError] = useState("");

  const email = user?.user.email ?? "";

  async function handleResend() {
    if (!email) return;
    setStatus("sending");
    setError("");
    try {
      const { error: sendError } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/welcome",
      });
      if (sendError) {
        setStatus("error");
        setError(sendError.message ?? t("verifyEmail.resendError"));
        return;
      }
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : t("verifyEmail.resendError"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card p-8 backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-vytal-amber/10 text-vytal-amber">
            <MailWarning className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-vytal-text">
            {t("verifyEmail.title")}
          </h1>
          <p className="mt-2 text-sm text-vytal-muted">
            {t("verifyEmail.body")}
          </p>
          <p className="mt-1 text-sm font-semibold text-vytal-text">{email}</p>
          <p className="mt-3 text-xs text-vytal-muted">{t("verifyEmail.spam")}</p>
        </div>

        {status === "error" && error && (
          <p className="mb-3 rounded-lg bg-vytal-red/10 px-3 py-2 text-center text-xs text-vytal-red">
            {error}
          </p>
        )}

        <button
          onClick={handleResend}
          disabled={status === "sending"}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
            status === "sent"
              ? "bg-vytal-green/10 text-vytal-green"
              : "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90",
            status === "sending" && "cursor-not-allowed opacity-60",
          )}
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("verifyEmail.resending")}
            </>
          ) : status === "sent" ? (
            <>
              <Check className="h-4 w-4" />
              {t("verifyEmail.resent")}
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              {t("verifyEmail.resend")}
            </>
          )}
        </button>

        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs text-vytal-muted transition-colors hover:text-vytal-text"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t("verifyEmail.signOut")}
        </button>
      </div>
    </div>
  );
}
