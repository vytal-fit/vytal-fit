"use client";

import { use, useMemo, useState } from "react";
import { CreditCard, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

type DisplayPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  popular: boolean;
};

function formatPrice(price: number, currency: string): string {
  return currency === "EUR" ? `${price}€` : `${price} ${currency}`;
}

function deriveFeatures(plan: {
  sessionsPerWeek: number | null;
  maxSessions: number | null;
}): string[] {
  const features: string[] = [];
  if (plan.sessionsPerWeek != null) features.push(`${plan.sessionsPerWeek}x / semana`);
  if (plan.maxSessions != null) features.push(`${plan.maxSessions} sessões`);
  return features;
}

const FAQ = [
  {
    q: "Existe período de fidelização?",
    a: "Não. Todos os planos mensais podem ser cancelados a qualquer momento sem custos adicionais.",
  },
  {
    q: "Posso experimentar antes de subscrever?",
    a: "Sim! Oferecemos uma aula de experiência gratuita para novos membros. Contacte-nos para marcar.",
  },
  {
    q: "Os preços incluem IVA?",
    a: "Sim, todos os preços apresentados já incluem IVA à taxa em vigor.",
  },
  {
    q: "Posso pausar a minha subscrição?",
    a: "Sim, é possível pausar a subscrição por motivos de lesão ou férias. Consulte a nossa equipa.",
  },
  {
    q: "Há desconto para estudantes ou famílias?",
    a: "Temos planos específicos para famílias e oferecemos 10% de desconto para estudantes mediante apresentação de comprovativo.",
  },
];

export default function PricingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const plansQuery = trpc.public.plans.useQuery({ slug });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = useMemo<DisplayPlan[]>(() => {
    const raw = plansQuery.data ?? [];
    const mid = Math.floor(raw.length / 2);
    return raw.map((p, i) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      period: "/mês",
      features: deriveFeatures(p),
      popular: raw.length > 1 && i === mid,
    }));
  }, [plansQuery.data]);

  if (plansQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-vytal-green" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-vytal-muted">Sem planos disponíveis de momento</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-green/10">
            <CreditCard className="h-6 w-6 text-vytal-green" />
          </div>
          <h1 className="text-2xl font-bold text-vytal-text">Planos & Preços</h1>
          <p className="mt-2 text-sm text-vytal-muted">
            Escolha o plano que melhor se adapta ao seu ritmo de treino
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all hover:shadow-md ${
                plan.popular
                  ? "border-vytal-green bg-vytal-green/5 shadow-vytal-green/10 shadow-lg"
                  : "border-vytal-border bg-vytal-card"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-vytal-green px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-vytal-bg shadow">
                  Popular
                </span>
              )}

              <div className="mb-4">
                <h2 className="text-base font-bold text-vytal-text">{plan.name}</h2>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-black text-vytal-text">{formatPrice(plan.price, plan.currency)}</span>
                </div>
                <p className="mt-0.5 text-xs text-vytal-muted">{plan.period}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-vytal-text">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-vytal-green" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold transition-colors ${
                  plan.popular
                    ? "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90"
                    : "border border-vytal-border text-vytal-text hover:bg-vytal-bg3 hover:border-vytal-green/30"
                }`}
              >
                Começar Agora
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-vytal-muted">
          Todos os preços incluem IVA · Sem custos de inscrição · Cancele quando quiser
        </p>
      </section>

      {/* Compare table */}
      <section className="border-t border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="mb-6 text-center text-xl font-bold text-vytal-text">Comparar Planos</h2>
          <div className="overflow-x-auto rounded-xl border border-vytal-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vytal-border bg-vytal-card">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                    Funcionalidade
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                        plan.popular ? "text-vytal-green" : "text-vytal-muted"
                      }`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Build feature rows from all plans */}
                {Array.from(new Set(plans.flatMap((p) => p.features))).map((feature, i) => (
                  <tr
                    key={feature}
                    className={`border-b border-vytal-border/50 ${i % 2 === 0 ? "bg-vytal-bg" : "bg-vytal-bg2"}`}
                  >
                    <td className="px-4 py-3 text-vytal-text">{feature}</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-center">
                        {plan.features.includes(feature) ? (
                          <Check className="mx-auto h-4 w-4 text-vytal-green" />
                        ) : (
                          <span className="text-vytal-muted/30">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Price row */}
                <tr className="border-b border-vytal-border bg-vytal-card font-semibold">
                  <td className="px-4 py-3 text-vytal-text">Preço</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className={`px-4 py-3 text-center ${plan.popular ? "text-vytal-green" : "text-vytal-text"}`}>
                      {formatPrice(plan.price, plan.currency)}
                      <span className="block text-[10px] font-normal text-vytal-muted">{plan.period}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-vytal-border">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 text-center text-xl font-bold text-vytal-text">Perguntas Frequentes</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-vytal-border bg-vytal-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-vytal-text">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-vytal-green" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-vytal-muted" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="border-t border-vytal-border/50 px-5 py-4">
                    <p className="text-sm leading-relaxed text-vytal-muted">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-6 text-center">
            <p className="text-sm text-vytal-text">Ainda tem dúvidas?</p>
            <Link
              href={`/@${slug}/contact`}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
            >
              Fale connosco
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
