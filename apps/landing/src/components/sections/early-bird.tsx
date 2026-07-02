"use client";

import { useState, type FormEvent } from "react";
import { Check, Sparkles, Crown, Rocket, Headset, ArrowRight, Loader2 } from "lucide-react";
import { AnimatedBorder, RevealGroup, RevealItem } from "@vytal-fit/brand/motion";
import type { Lang } from "@/lib/copy";

// Early-bird / pré-reserva capture. Replaces public pricing for the pre-launch
// phase: founding-member lead capture that writes to the waitlist table via
// /api/early-bird. Strings are co-located (PT/ES/EN) like the other data-driven
// sections (verticals, automations).
const COPY: Record<Lang, {
  badge: string; title: string; titleHighlight: string; subtitle: string;
  perks: { title: string; desc: string }[];
  fName: string; fEmail: string; fGym: string; fVertical: string; fVerticalDefault: string;
  submit: string; submitting: string;
  doneTitle: string; doneBody: string;
  error: string; privacy: string;
}> = {
  pt: {
    badge: "Acesso antecipado",
    title: "Seja um dos espaços",
    titleHighlight: "fundadores.",
    subtitle:
      "Estamos a abrir o Vytal a um grupo restrito de espaços fundadores. Deixe os seus dados e falamos consigo com condições early bird exclusivas.",
    perks: [
      { title: "Preço de fundador", desc: "Condição vitalícia, bloqueada antes do lançamento público." },
      { title: "Onboarding assistido", desc: "Migração de dados e configuração feitas connosco, sem custo." },
      { title: "Acesso prioritário", desc: "Novas funcionalidades primeiro e uma linha direta com a equipa." },
    ],
    fName: "Nome",
    fEmail: "Email",
    fGym: "Nome do espaço",
    fVertical: "Tipo de espaço",
    fVerticalDefault: "Selecione...",
    submit: "Quero acesso antecipado",
    submitting: "A enviar...",
    doneTitle: "Estamos quase lá!",
    doneBody: "Obrigado. Recebemos a sua pré-reserva e entramos em contacto muito em breve.",
    error: "Algo correu mal. Tente novamente ou escreva para vendas@vytal.fit.",
    privacy: "Sem spam. Usamos os seus dados apenas para falar sobre o acesso antecipado.",
  },
  en: {
    badge: "Early access",
    title: "Become a founding",
    titleHighlight: "member.",
    subtitle:
      "We're opening Vytal to a small group of founding spaces. Leave your details and we'll reach out with exclusive early-bird terms.",
    perks: [
      { title: "Founder pricing", desc: "A lifetime rate, locked in before the public launch." },
      { title: "Assisted onboarding", desc: "We handle your data migration and setup, at no cost." },
      { title: "Priority access", desc: "New features first, and a direct line to the team." },
    ],
    fName: "Name",
    fEmail: "Email",
    fGym: "Space name",
    fVertical: "Space type",
    fVerticalDefault: "Select...",
    submit: "I want early access",
    submitting: "Sending...",
    doneTitle: "You're almost in!",
    doneBody: "Thank you. We've got your pre-registration and we'll be in touch very soon.",
    error: "Something went wrong. Please try again or email vendas@vytal.fit.",
    privacy: "No spam. We only use your details to talk about early access.",
  },
  es: {
    badge: "Acceso anticipado",
    title: "Sé uno de los espacios",
    titleHighlight: "fundadores.",
    subtitle:
      "Estamos abriendo Vytal a un grupo reducido de espacios fundadores. Deja tus datos y hablamos contigo con condiciones early bird exclusivas.",
    perks: [
      { title: "Precio de fundador", desc: "Condición vitalicia, fijada antes del lanzamiento público." },
      { title: "Onboarding asistido", desc: "Migración de datos y configuración hechas con nosotros, sin coste." },
      { title: "Acceso prioritario", desc: "Nuevas funcionalidades primero y línea directa con el equipo." },
    ],
    fName: "Nombre",
    fEmail: "Email",
    fGym: "Nombre del espacio",
    fVertical: "Tipo de espacio",
    fVerticalDefault: "Selecciona...",
    submit: "Quiero acceso anticipado",
    submitting: "Enviando...",
    doneTitle: "¡Ya casi estás!",
    doneBody: "Gracias. Hemos recibido tu prerreserva y te contactaremos muy pronto.",
    error: "Algo salió mal. Inténtalo de nuevo o escribe a vendas@vytal.fit.",
    privacy: "Sin spam. Usamos tus datos solo para hablar del acceso anticipado.",
  },
};

const PERK_ICONS = [Crown, Headset, Rocket];

// Vertical options reuse the existing v_* copy keys.
const VERTICAL_KEYS = [
  "crossfit_box", "functional_training", "gym", "yoga_studio", "pilates_studio",
  "martial_arts", "personal_training", "dance_studio", "health_club", "other",
];

export function EarlyBird({ t, lang }: { t: (k: string) => string; lang: Lang }) {
  const c = COPY[lang];
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", gymName: "", vertical: "" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/early-bird", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, locale: lang }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-xl border border-[rgba(34,197,94,0.2)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_60%,transparent)] px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted outline-none transition-colors focus:border-vytal-green";

  return (
    <section id="early-bird" className="relative overflow-hidden py-24 border-t border-[rgba(34,197,94,0.08)]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealGroup className="text-center mb-12" stagger={0.08} amount={0.4}>
          <RevealItem>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
              <Sparkles size={12} className="text-vytal-green" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{c.badge}</span>
            </div>
          </RevealItem>
          <RevealItem>
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
              {c.title}{" "}
              <span
                className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-accent), serif" }}
              >
                {c.titleHighlight}
              </span>
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="text-vytal-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">{c.subtitle}</p>
          </RevealItem>
        </RevealGroup>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Perks */}
          <RevealGroup className="flex flex-col justify-center gap-4" stagger={0.1} amount={0.2}>
            {c.perks.map((perk, i) => {
              const Icon = PERK_ICONS[i];
              return (
                <RevealItem
                  key={perk.title}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-[rgba(34,197,94,0.12)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.2)]">
                    <Icon size={18} className="text-vytal-green" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-vytal-text mb-0.5">{perk.title}</div>
                    <div className="text-xs text-vytal-muted leading-relaxed">{perk.desc}</div>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>

          {/* Form */}
          <AnimatedBorder
            colors={["#22c55e", "rgba(34,197,94,0.06)", "#4ade80"]}
            borderWidth={1.5}
            radius={24}
            duration={6}
            className="h-full"
            innerClassName="h-full"
            innerStyle={{ background: "color-mix(in srgb, var(--color-vytal-bg) 94%, var(--color-vytal-green))" }}
          >
            <div className="h-full p-6 sm:p-8">
              {status === "done" ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] mb-4">
                    <Check size={26} className="text-vytal-green" />
                  </div>
                  <h3 className="text-lg font-bold text-vytal-text mb-2">{c.doneTitle}</h3>
                  <p className="text-sm text-vytal-muted max-w-sm">{c.doneBody}</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-3">
                  <input
                    required
                    type="text"
                    placeholder={c.fName}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={field}
                  />
                  <input
                    required
                    type="email"
                    placeholder={c.fEmail}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={field}
                  />
                  <input
                    type="text"
                    placeholder={c.fGym}
                    value={form.gymName}
                    onChange={(e) => setForm({ ...form, gymName: e.target.value })}
                    className={field}
                  />
                  <select
                    value={form.vertical}
                    onChange={(e) => setForm({ ...form, vertical: e.target.value })}
                    className={field}
                    aria-label={c.fVertical}
                  >
                    <option value="">{c.fVerticalDefault}</option>
                    {VERTICAL_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {t(`v_${k}`)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="vy-shimmer mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-vytal-green px-6 py-3.5 text-sm font-semibold text-vytal-bg transition-all duration-150 hover:bg-[#16a34a] disabled:opacity-70"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {c.submitting}
                      </>
                    ) : (
                      <>
                        {c.submit}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {status === "error" && (
                    <p className="text-xs text-[var(--color-vytal-red)] text-center">{c.error}</p>
                  )}
                  <p className="text-[11px] text-vytal-muted text-center leading-relaxed">{c.privacy}</p>
                </form>
              )}
            </div>
          </AnimatedBorder>
        </div>
      </div>
    </section>
  );
}
