"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ChevronDown,
  X,
} from "lucide-react";
import { ORGANIZATION_TYPE_LIST } from "@vytal-fit/shared";

// ── Types ────────────────────────────────────────────────────────────────────

type PlanId = "free" | "pro" | "enterprise";
type Step = 1 | 2 | 3 | 4;

interface FormData {
  plan: PlanId;
  billing: "monthly" | "annual";
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  orgName: string;
  orgSlug: string;
  orgType: string;
  country: string;
  currency: string;
}

// ── Copy ─────────────────────────────────────────────────────────────────────

const COPY = {
  back: "Voltar",
  next: "Continuar",
  step1Title: "Escolha o seu plano",
  step1Sub: "30 dias grátis em qualquer plano pago. Sem cartão de crédito.",
  step2Title: "Criar conta",
  step2Sub: "Já tem conta?",
  step2SignIn: "Entrar",
  step3Title: "Configurar organização",
  step3Sub: "Pode alterar tudo isto depois nas definições.",
  step4Title: "Conta criada com sucesso!",
  step4Sub: "O seu espaço está pronto. Bem-vindo ao Vytal.",
  namePlaceholder: "O seu nome completo",
  emailPlaceholder: "o.seu@email.com",
  passwordPlaceholder: "Mínimo 8 caracteres",
  confirmPasswordPlaceholder: "Repetir password",
  termsText: "Ao criar conta, aceita os",
  termsLink: "Termos de Serviço",
  andText: "e",
  privacyLink: "Política de Privacidade",
  orgNamePlaceholder: "Ex: CrossFit Aveiro",
  orgTypePlaceholder: "Selecionar tipo de espaço",
  countryLabel: "País",
  currencyLabel: "Moeda",
  slugLabel: "URL do espaço",
  slugPrefix: "vytal.fit/",
  freeTrial: "30 dias grátis",
  mostPopular: "Mais Popular",
  monthly: "Mensal",
  annual: "Anual (-20%)",
  planFreeLabel: "Grátis",
  planFreePrice: "0€",
  planFreePeriod: "para sempre",
  planFreeDesc: "Para começar sem compromisso.",
  planProLabel: "Pro",
  planProPrice: "49€",
  planProAnnualPrice: "39€",
  planProPeriod: "/mês",
  planProDesc: "Para espaços em crescimento.",
  planEntLabel: "Enterprise",
  planEntPrice: "Sob consulta",
  planEntPeriod: "personalizado",
  planEntDesc: "Para redes e franquias fitness.",
  goToDashboard: "Ir para o proVYTAL",
  accountCreated: "A sua conta foi criada!",
  freeDaysOf: "dias grátis do plano",
  passwordStrengthWeak: "Fraca",
  passwordStrengthFair: "Razoável",
  passwordStrengthGood: "Boa",
  passwordStrengthStrong: "Forte",
  passwordMismatch: "As passwords não coincidem",
  fieldRequired: "Campo obrigatório",
  acceptTermsRequired: "Deve aceitar os termos para continuar",
};

const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: [
    "Até 20 membros",
    "1 localização",
    "Calendário de aulas",
    "Perfis básicos",
    "App mobile (leitura)",
    "Suporte por email",
  ],
  pro: [
    "Membros ilimitados",
    "1 localização",
    "Todas as funcionalidades",
    "Website público personalizado",
    "Pagamentos MBWay & SEPA",
    "SAF-T & ATCUD",
    "CRM & Leads",
    "App mobile completa",
    "Suporte prioritário",
  ],
  enterprise: [
    "Multi-localização",
    "Membros ilimitados",
    "API Aberta & Webhooks",
    "Integrações personalizadas",
    "Suporte dedicado 24/7",
    "Onboarding assistido",
    "SLA garantido",
    "Facturação centralizada",
  ],
};

const COUNTRIES = [
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Espanha" },
  { code: "BR", name: "Brasil" },
  { code: "GB", name: "Reino Unido" },
  { code: "FR", name: "França" },
  { code: "DE", name: "Alemanha" },
  { code: "IT", name: "Itália" },
  { code: "NL", name: "Países Baixos" },
  { code: "BE", name: "Bélgica" },
  { code: "CH", name: "Suíça" },
  { code: "US", name: "Estados Unidos" },
];

const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "Libra Esterlina" },
  { code: "BRL", symbol: "R$", name: "Real Brasileiro" },
  { code: "USD", symbol: "$", name: "Dólar Americano" },
  { code: "CHF", symbol: "CHF", name: "Franco Suíço" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 4) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 0;
  if (score === 2) return 1;
  if (score === 3) return 2;
  return 3;
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Plano" },
    { n: 2, label: "Conta" },
    { n: 3, label: "Organização" },
    { n: 4, label: "Pronto" },
  ];
  const pct = ((step - 1) / 3) * 100;

  return (
    <div className="w-full max-w-lg mx-auto mb-10">
      {/* Progress bar */}
      <div className="h-1 bg-[rgba(34,197,94,0.12)] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-vytal-green rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Step dots */}
      <div className="flex items-center justify-between">
        {steps.map((s) => {
          const done = step > s.n;
          const active = step === s.n;
          return (
            <div key={s.n} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? "bg-vytal-green text-vytal-bg"
                    : active
                    ? "bg-[rgba(34,197,94,0.15)] border-2 border-vytal-green text-vytal-green"
                    : "bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.15)] text-vytal-muted"
                }`}
              >
                {done ? <Check size={14} /> : s.n}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-vytal-green" : done ? "text-vytal-text" : "text-vytal-muted"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({
  id,
  selected,
  onSelect,
  billing,
}: {
  id: PlanId;
  selected: boolean;
  onSelect: () => void;
  billing: "monthly" | "annual";
}) {
  const isEnterprise = id === "enterprise";
  const isFree = id === "free";
  const isPro = id === "pro";

  const label =
    id === "free"
      ? COPY.planFreeLabel
      : id === "pro"
      ? COPY.planProLabel
      : COPY.planEntLabel;

  const desc =
    id === "free"
      ? COPY.planFreeDesc
      : id === "pro"
      ? COPY.planProDesc
      : COPY.planEntDesc;

  const priceDisplay = isEnterprise
    ? COPY.planEntPrice
    : isFree
    ? COPY.planFreePrice
    : billing === "annual"
    ? COPY.planProAnnualPrice
    : COPY.planProPrice;

  const period = isEnterprise
    ? COPY.planEntPeriod
    : isFree
    ? COPY.planFreePeriod
    : COPY.planProPeriod;

  const features = PLAN_FEATURES[id];
  const color = isFree ? "#6b8c72" : isPro ? "#22c55e" : "#c084fc";

  return (
    <div
      onClick={isEnterprise ? undefined : onSelect}
      className={`relative rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200 ${
        isEnterprise
          ? "opacity-60 cursor-not-allowed border-[rgba(192,132,252,0.15)] bg-vytal-bg3/30"
          : selected
          ? "border-vytal-green bg-[rgba(34,197,94,0.06)] shadow-lg shadow-[rgba(34,197,94,0.1)] cursor-pointer"
          : "border-[rgba(34,197,94,0.12)] bg-vytal-bg3/40 hover:border-[rgba(34,197,94,0.3)] cursor-pointer"
      }`}
    >
      {isPro && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="px-2.5 py-0.5 rounded-full bg-vytal-green text-vytal-bg text-[10px] font-bold">
            {COPY.mostPopular}
          </span>
        </div>
      )}

      {/* Selected ring */}
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-vytal-green flex items-center justify-center">
          <Check size={11} className="text-vytal-bg" />
        </div>
      )}

      <div>
        <div className="flex items-baseline gap-1 mb-0.5">
          <span className="text-sm font-bold" style={{ color }}>
            {label}
          </span>
        </div>
        <p className="text-[11px] text-vytal-muted">{desc}</p>
      </div>

      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-vytal-text leading-none">{priceDisplay}</span>
        <span className="text-xs text-vytal-muted mb-0.5">{period}</span>
      </div>

      {isPro && billing === "annual" && (
        <p className="text-[10px] text-vytal-green -mt-2">
          Poupas 120€/ano
        </p>
      )}

      <ul className="space-y-1.5 mt-1">
        {features.slice(0, 5).map((f) => (
          <li key={f} className="flex items-center gap-2 text-[11px] text-vytal-muted">
            <Check size={10} style={{ color }} className="shrink-0" />
            {f}
          </li>
        ))}
        {features.length > 5 && (
          <li className="text-[10px] text-vytal-muted/60 pl-4">
            +{features.length - 5} mais...
          </li>
        )}
      </ul>

      {isEnterprise && (
        <a
          href="mailto:sales@vytal.fit"
          className="mt-auto block text-center text-[11px] font-semibold text-vytal-purple border border-[rgba(192,132,252,0.25)] rounded-lg py-2 hover:bg-[rgba(192,132,252,0.06)] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Falar com Vendas
        </a>
      )}
    </div>
  );
}

// ── Password Strength Meter ───────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const strength = passwordStrength(password);
  const labels = [
    COPY.passwordStrengthWeak,
    COPY.passwordStrengthFair,
    COPY.passwordStrengthGood,
    COPY.passwordStrengthStrong,
  ];
  const colors = ["#ff4757", "#ffb300", "#00d4ff", "#22c55e"];
  const widths = ["25%", "50%", "75%", "100%"];

  return (
    <div className="mt-1.5">
      <div className="h-1 bg-[rgba(34,197,94,0.1)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: widths[strength], background: colors[strength] }}
        />
      </div>
      <p className="text-[10px] mt-1" style={{ color: colors[strength] }}>
        Password {labels[strength]}
      </p>
    </div>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  prefix,
  suffix,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  prefix?: string;
  suffix?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-vytal-text">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs text-vytal-muted pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-vytal-bg3/60 text-sm text-vytal-text placeholder-vytal-muted/60 px-4 py-3 outline-none transition-all duration-150 focus:border-vytal-green focus:ring-1 focus:ring-[rgba(34,197,94,0.3)] ${
            prefix ? "pl-[calc(1rem+var(--prefix-w,0px))]" : ""
          } ${error ? "border-vytal-red/60" : "border-[rgba(34,197,94,0.15)]"}`}
          style={prefix ? { paddingLeft: `${prefix.length * 7.5 + 16}px` } : undefined}
        />
        {suffix && (
          <div className="absolute right-3">{suffix}</div>
        )}
      </div>
      {error && <p className="text-[10px] text-vytal-red">{error}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-vytal-text">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl border bg-vytal-bg3/60 text-sm text-vytal-text px-4 py-3 pr-10 outline-none transition-all duration-150 focus:border-vytal-green focus:ring-1 focus:ring-[rgba(34,197,94,0.3)] ${
            error ? "border-vytal-red/60" : "border-[rgba(34,197,94,0.15)]"
          } ${!value ? "text-vytal-muted/60" : ""}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-vytal-bg2 text-vytal-text">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-vytal-muted pointer-events-none"
        />
      </div>
      {error && <p className="text-[10px] text-vytal-red">{error}</p>}
    </div>
  );
}

// ── Step 1: Choose Plan ───────────────────────────────────────────────────────

function Step1({
  form,
  setForm,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="wizard-step-fade">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-vytal-green animate-pulse" />
          <span className="text-xs font-semibold text-vytal-green">{COPY.freeTrial}</span>
        </div>
        <h2 className="text-2xl font-bold text-vytal-text mb-2">{COPY.step1Title}</h2>
        <p className="text-sm text-vytal-muted">{COPY.step1Sub}</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => setForm((f) => ({ ...f, billing: "monthly" }))}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
            form.billing === "monthly"
              ? "bg-[rgba(34,197,94,0.15)] text-vytal-green"
              : "text-vytal-muted hover:text-vytal-text"
          }`}
        >
          {COPY.monthly}
        </button>
        <button
          onClick={() => setForm((f) => ({ ...f, billing: "annual" }))}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
            form.billing === "annual"
              ? "bg-[rgba(34,197,94,0.15)] text-vytal-green"
              : "text-vytal-muted hover:text-vytal-text"
          }`}
        >
          {COPY.annual}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["free", "pro", "enterprise"] as PlanId[]).map((id) => (
          <PlanCard
            key={id}
            id={id}
            selected={form.plan === id}
            onSelect={() => setForm((f) => ({ ...f, plan: id }))}
            billing={form.billing}
          />
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Create Account ────────────────────────────────────────────────────

function Step2({
  form,
  setForm,
  errors,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="wizard-step-fade">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-vytal-text mb-2">{COPY.step2Title}</h2>
        <p className="text-sm text-vytal-muted">
          {COPY.step2Sub}{" "}
          <Link href="/login" className="text-vytal-green hover:underline font-medium">
            {COPY.step2SignIn}
          </Link>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Nome completo"
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          placeholder={COPY.namePlaceholder}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          placeholder={COPY.emailPlaceholder}
          error={errors.email}
          autoComplete="email"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-vytal-text">Password</label>
          <div className="relative flex items-center">
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={COPY.passwordPlaceholder}
              autoComplete="new-password"
              className={`w-full rounded-xl border bg-vytal-bg3/60 text-sm text-vytal-text placeholder-vytal-muted/60 px-4 py-3 pr-10 outline-none transition-all duration-150 focus:border-vytal-green focus:ring-1 focus:ring-[rgba(34,197,94,0.3)] ${
                errors.password ? "border-vytal-red/60" : "border-[rgba(34,197,94,0.15)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 text-vytal-muted hover:text-vytal-text transition-colors"
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] text-vytal-red">{errors.password}</p>}
          <PasswordStrengthBar password={form.password} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-vytal-text">Confirmar password</label>
          <div className="relative flex items-center">
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder={COPY.confirmPasswordPlaceholder}
              autoComplete="new-password"
              className={`w-full rounded-xl border bg-vytal-bg3/60 text-sm text-vytal-text placeholder-vytal-muted/60 px-4 py-3 pr-10 outline-none transition-all duration-150 focus:border-vytal-green focus:ring-1 focus:ring-[rgba(34,197,94,0.3)] ${
                errors.confirmPassword ? "border-vytal-red/60" : "border-[rgba(34,197,94,0.15)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 text-vytal-muted hover:text-vytal-text transition-colors"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] text-vytal-red">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={`relative mt-0.5 w-4 h-4 rounded shrink-0 border transition-all duration-150 flex items-center justify-center ${
                form.acceptTerms
                  ? "bg-vytal-green border-vytal-green"
                  : "border-[rgba(34,197,94,0.3)] group-hover:border-[rgba(34,197,94,0.6)]"
              }`}
              onClick={() => setForm((f) => ({ ...f, acceptTerms: !f.acceptTerms }))}
            >
              {form.acceptTerms && <Check size={10} className="text-vytal-bg" />}
            </div>
            <span className="text-xs text-vytal-muted leading-relaxed">
              {COPY.termsText}{" "}
              <a href="/signup" className="text-vytal-green hover:underline">
                {COPY.termsLink}
              </a>{" "}
              {COPY.andText}{" "}
              <a href="/signup" className="text-vytal-green hover:underline">
                {COPY.privacyLink}
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-[10px] text-vytal-red pl-7">{errors.acceptTerms}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Organisation Setup ────────────────────────────────────────────────

function Step3({
  form,
  setForm,
  errors,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  const orgTypeOptions = ORGANIZATION_TYPE_LIST.map((o) => ({
    value: o.type,
    label: o.label,
  }));

  const countryOptions = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.symbol} — ${c.name}`,
  }));

  function handleOrgName(name: string) {
    setForm((f) => ({
      ...f,
      orgName: name,
      orgSlug: slugify(name),
    }));
  }

  return (
    <div className="wizard-step-fade">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-vytal-text mb-2">{COPY.step3Title}</h2>
        <p className="text-sm text-vytal-muted">{COPY.step3Sub}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Nome da organização"
          value={form.orgName}
          onChange={handleOrgName}
          placeholder={COPY.orgNamePlaceholder}
          error={errors.orgName}
          autoComplete="organization"
        />

        {/* Slug preview */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-vytal-text">{COPY.slugLabel}</label>
          <div className="flex items-center rounded-xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg3/60 overflow-hidden">
            <span className="px-3 py-3 text-xs text-vytal-muted bg-[rgba(34,197,94,0.04)] border-r border-[rgba(34,197,94,0.1)] shrink-0 select-none">
              {COPY.slugPrefix}
            </span>
            <input
              type="text"
              value={form.orgSlug}
              onChange={(e) => setForm((f) => ({ ...f, orgSlug: slugify(e.target.value) }))}
              className="flex-1 bg-transparent text-sm text-vytal-text px-3 py-3 outline-none placeholder-vytal-muted/60"
              placeholder="o-meu-espaco"
            />
          </div>
          <p className="text-[10px] text-vytal-muted">
            Pode usar o seu domínio próprio mais tarde.
          </p>
        </div>

        <Select
          label="Tipo de espaço"
          value={form.orgType}
          onChange={(v) => setForm((f) => ({ ...f, orgType: v }))}
          options={orgTypeOptions}
          placeholder={COPY.orgTypePlaceholder}
          error={errors.orgType}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label={COPY.countryLabel}
            value={form.country}
            onChange={(v) => setForm((f) => ({ ...f, country: v }))}
            options={countryOptions}
            placeholder="Selecionar"
            error={errors.country}
          />
          <Select
            label={COPY.currencyLabel}
            value={form.currency}
            onChange={(v) => setForm((f) => ({ ...f, currency: v }))}
            options={currencyOptions}
            placeholder="Selecionar"
            error={errors.currency}
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Success ────────────────────────────────────────────────────────────

function Step4({ plan }: { plan: PlanId }) {
  const planLabel =
    plan === "free"
      ? COPY.planFreeLabel
      : plan === "pro"
      ? COPY.planProLabel
      : COPY.planEntLabel;

  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="wizard-step-fade text-center">
      {/* Animated check */}
      <div className="flex justify-center mb-8">
        <div
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 ${
            show ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
          style={{
            background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)",
            boxShadow: show ? "0 0 40px rgba(34,197,94,0.3)" : "none",
          }}
        >
          <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.15)] border-2 border-vytal-green flex items-center justify-center">
            <Check size={28} className="text-vytal-green" strokeWidth={3} />
          </div>
          {/* Orbiting ring */}
          <div
            className="absolute inset-0 rounded-full border border-[rgba(34,197,94,0.3)]"
            style={{ animation: "spin 8s linear infinite" }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />

      <h2 className="text-3xl font-bold text-vytal-text mb-3">{COPY.accountCreated}</h2>
      <p className="text-vytal-muted mb-2">
        {plan !== "free" && (
          <>
            <span className="text-vytal-green font-semibold">30</span>{" "}
            {COPY.freeDaysOf}{" "}
            <span className="text-vytal-green font-semibold">{planLabel}</span>.
          </>
        )}
        {plan === "free" && "O seu espaço está configurado e pronto a usar."}
      </p>
      <p className="text-sm text-vytal-muted mb-10">{COPY.step4Sub}</p>

      {/* Feature checklist */}
      <div className="flex flex-col gap-2 mb-10 max-w-xs mx-auto text-left">
        {[
          "Conta criada",
          "Organização configurada",
          plan !== "free" ? "30 dias grátis activados" : "Plano gratuito activado",
          "App mobile disponível",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[rgba(34,197,94,0.15)] flex items-center justify-center shrink-0">
              <Check size={10} className="text-vytal-green" />
            </div>
            <span className="text-sm text-vytal-text">{item}</span>
          </div>
        ))}
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-vytal-green text-vytal-bg font-bold text-sm hover:bg-vytal-green/90 transition-all duration-150 shadow-lg shadow-[rgba(34,197,94,0.25)] hover:shadow-[rgba(34,197,94,0.4)] hover:-translate-y-0.5"
      >
        {COPY.goToDashboard}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateStep(
  step: Step,
  form: FormData
): Partial<Record<keyof FormData, string>> {
  const errs: Partial<Record<keyof FormData, string>> = {};

  if (step === 2) {
    if (!form.name.trim()) errs.name = COPY.fieldRequired;
    if (!form.email.trim()) errs.email = COPY.fieldRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email inválido";
    if (!form.password) errs.password = COPY.fieldRequired;
    else if (form.password.length < 8)
      errs.password = "Mínimo 8 caracteres";
    if (!form.confirmPassword) errs.confirmPassword = COPY.fieldRequired;
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = COPY.passwordMismatch;
    if (!form.acceptTerms) errs.acceptTerms = COPY.acceptTermsRequired;
  }

  if (step === 3) {
    if (!form.orgName.trim()) errs.orgName = COPY.fieldRequired;
    if (!form.orgType) errs.orgType = COPY.fieldRequired;
    if (!form.country) errs.country = COPY.fieldRequired;
    if (!form.currency) errs.currency = COPY.fieldRequired;
  }

  return errs;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [form, setForm] = useState<FormData>({
    plan: "pro",
    billing: "monthly",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    orgName: "",
    orgSlug: "",
    orgType: "",
    country: "PT",
    currency: "EUR",
  });

  function handleNext() {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-vytal-bg text-vytal-text flex flex-col">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #22c55e 0%, transparent 70%)",
            top: "-150px",
            right: "-100px",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, #c084fc 0%, transparent 70%)",
            bottom: "-100px",
            left: "-100px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-[rgba(34,197,94,0.08)]">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-bold text-vytal-green tracking-tight">Vytal</span>
          <span className="text-xl font-bold text-vytal-muted tracking-tight">.fit</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-vytal-muted hover:text-vytal-text transition-colors"
        >
          <X size={14} />
          Fechar
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-10">
        {step < 4 && <StepIndicator step={step} />}

        <div
          className={`w-full ${
            step === 1 ? "max-w-3xl" : step === 4 ? "max-w-md" : "max-w-lg"
          }`}
        >
          {/* Card */}
          <div
            className={`rounded-2xl border border-[rgba(34,197,94,0.12)] bg-vytal-bg2/80 backdrop-blur-md p-6 sm:p-8 ${
              step === 4 ? "text-center" : ""
            }`}
          >
            {step === 1 && (
              <Step1 form={form} setForm={setForm} />
            )}
            {step === 2 && (
              <Step2 form={form} setForm={setForm} errors={errors} />
            )}
            {step === 3 && (
              <Step3 form={form} setForm={setForm} errors={errors} />
            )}
            {step === 4 && <Step4 plan={form.plan} />}

            {/* Navigation buttons */}
            {step < 4 && (
              <div className={`flex items-center mt-8 ${step > 1 ? "justify-between" : "justify-end"}`}>
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-vytal-muted hover:text-vytal-text transition-colors"
                  >
                    <ArrowLeft size={14} />
                    {COPY.back}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-vytal-green text-vytal-bg font-semibold text-sm hover:bg-vytal-green/90 transition-all duration-150 shadow-md shadow-[rgba(34,197,94,0.2)] hover:-translate-y-0.5"
                >
                  {COPY.next}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Step context hints */}
          {step === 1 && (
            <p className="text-center text-xs text-vytal-muted mt-4">
              Sem cartão de crédito · Cancele quando quiser · Suporte em Português
            </p>
          )}
          {step === 2 && (
            <p className="text-center text-xs text-vytal-muted mt-4">
              Dados encriptados e seguros · Conformidade RGPD
            </p>
          )}
          {step === 3 && (
            <p className="text-center text-xs text-vytal-muted mt-4">
              Pode configurar múltiplas localizações depois.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-5 border-t border-[rgba(34,197,94,0.06)]">
        <p className="text-xs text-vytal-muted">
          © 2026 Vytal · vytal.fit ·{" "}
          <a href="/signup" className="hover:text-vytal-text transition-colors">Privacidade</a>
          {" · "}
          <a href="/signup" className="hover:text-vytal-text transition-colors">Termos</a>
        </p>
      </footer>
    </div>
  );
}
