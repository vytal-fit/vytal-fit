"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Mock: any email/password combination logs in
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-vytal-green">
            VYTAL
          </h1>
          <p className="mt-2 text-sm text-vytal-muted">
            Plataforma inteligente para o seu espaco fitness
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="voce@exemplo.com"
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>

          {/* Password */}
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

          {/* Forgot password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-vytal-muted transition-colors hover:text-vytal-green"
            >
              Esqueceu a password?
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
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-vytal-muted">
            Nao tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
            >
              Criar conta
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
