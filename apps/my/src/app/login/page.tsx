"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { SocialLogin } from "@/components/social-login";

function resolvePostAuthTarget(params: URLSearchParams): string {
  const redirect = params.get("redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const target = resolvePostAuthTarget(searchParams);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const { error: loginError } = await authClient.signIn.email({
      email,
      password,
    });
    if (!loginError) {
      router.push(target);
      return;
    }
    setError(true);
    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-base font-medium text-vytal-muted/60">my</span>
            <span className="text-vytal-green">VYTAL</span>
          </h1>
          <p className="mt-2 text-sm text-vytal-muted">
            Access your member portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              Email ou password incorretos.
            </div>
          )}

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
              placeholder="voce@exemplo.com"
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="A sua password"
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

        <div className="my-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-vytal-border" />
            <span className="text-xs uppercase tracking-widest text-vytal-muted">
              ou
            </span>
            <div className="h-px flex-1 bg-vytal-border" />
          </div>
        </div>

        <SocialLogin callbackURL={target} />

        <p className="mt-4 text-center text-[11px] text-vytal-muted/60">
          Conta de demonstração:{" "}
          <span className="font-mono text-vytal-muted/80">
            jose@vytal.fit · VytalDemo2026!
          </span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
