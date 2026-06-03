"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
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

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nome e obrigatorio";
    if (!form.email.trim()) errs.email = "Email e obrigatorio";
    if (form.password.length < 10)
      errs.password = "Password deve ter pelo menos 10 caracteres";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords nao coincidem";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Mock: redirect to onboarding
    setTimeout(() => {
      router.push("/onboarding");
    }, 600);
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
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-vytal-green">
            VYTAL
          </h1>
          <p className="mt-2 text-sm text-vytal-muted">
            Crie a sua conta para comecar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="O seu nome"
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-vytal-red">{errors.name}</p>
            )}
          </div>

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
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-vytal-red">{errors.email}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
            >
              Telefone{" "}
              <span className="normal-case tracking-normal text-vytal-muted/60">
                (opcional)
              </span>
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+351 912 345 678"
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
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Minimo 10 caracteres"
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
            {errors.password && (
              <p className="mt-1 text-xs text-vytal-red">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted"
            >
              Confirmar Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="Repita a password"
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
                <UserPlus className="h-4 w-4" />
                Criar conta
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-vytal-muted">
            Ja tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
            >
              Entrar
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
