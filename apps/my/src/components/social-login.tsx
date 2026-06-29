"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function resolveCallbackTarget(callbackURL: string): string {
  return callbackURL && callbackURL.startsWith("/") && !callbackURL.startsWith("//")
    ? callbackURL
    : "/";
}

export function SocialLogin({ callbackURL = "/" }: { callbackURL?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | null>(null);
  const target = useMemo(() => resolveCallbackTarget(callbackURL), [callbackURL]);

  async function signInWithGoogle() {
    setLoading("google");
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: target,
      });
      if (!error) return;
    } finally {
      setLoading(null);
    }
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={loading !== null}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm font-medium text-vytal-text transition-colors hover:border-vytal-green/30 hover:bg-vytal-green/5 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
      Continuar com Google
    </button>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#EA4335" d="M17.64 9.2045c0-.638-.057-1.251-.163-1.84H9v3.48h4.844a4.14 4.14 0 0 1-1.795 2.714v2.255h2.908c1.702-1.567 2.683-3.876 2.683-6.609z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.806 5.96-2.187l-2.908-2.255c-.806.54-1.839.86-3.052.86-2.345 0-4.33-1.582-5.04-3.71H.958v2.32A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.96 10.708A5.41 5.41 0 0 1 3.66 9c0-.593.102-1.167.3-1.708V4.972H.958A9 9 0 0 0 0 9c0 1.45.346 2.82.958 4.028l3.002-2.32z" />
      <path fill="#4285F4" d="M9 3.58c1.321 0 2.507.454 3.437 1.346l2.576-2.576C13.463.99 11.43 0 9 0A8.999 8.999 0 0 0 .958 4.972l3.002 2.32C4.67 5.162 6.655 3.58 9 3.58z" />
    </svg>
  );
}
