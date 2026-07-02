"use client";

import { Check, Zap } from "lucide-react";
import { ParallaxLayer, RevealGroup, RevealItem } from "@vytal-fit/brand/motion";
import { useScrollReveal } from "@/lib/hooks";

// ── Feature Deep Dive ────────────────────────────────────────────────────────
function CheckinMockup() {
  const members = [
    { name: "Ana Costa", status: "checked" },
    { name: "João Silva", status: "checked" },
    { name: "Maria Santos", status: "noshow" },
  ];
  return (
    <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_90%,transparent)] p-5 shadow-xl shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-semibold text-vytal-text">CrossFit 09:00</div>
          <div className="text-[10px] text-vytal-muted">12/15 atletas</div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center border border-[rgba(34,197,94,0.2)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-green)" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
        </div>
      </div>
      {/* Member rows */}
      <div className="space-y-2 mb-4">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--color-vytal-bg3)_60%,transparent)] border border-[rgba(34,197,94,0.07)]">
            <div className="w-7 h-7 rounded-full bg-[rgba(34,197,94,0.15)] flex items-center justify-center text-[10px] font-bold text-vytal-green">
              {m.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <span className="text-xs text-vytal-text flex-1">{m.name}</span>
            {m.status === "checked" ? (
              <div className="w-5 h-5 rounded-full bg-[rgba(34,197,94,0.2)] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-green)" strokeWidth="3"><path d="M5 12l5 5L19 7" /></svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[rgba(255,71,87,0.15)] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-red)" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* QR Button */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] cursor-pointer hover:bg-[rgba(34,197,94,0.15)] transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-green)" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          <path d="M14 14h.01M14 17h3M17 14v3M20 14h.01M20 20h.01" />
        </svg>
        <span className="text-xs font-medium text-vytal-green">Scan QR Code</span>
      </div>
    </div>
  );
}

function CRMMockup() {
  const columns = [
    { title: "Lead", color: "var(--color-vytal-muted)", cards: ["Sara M.", "Pedro F."] },
    { title: "Contactado", color: "var(--color-vytal-blue)", cards: ["Bruno A."] },
    { title: "Trial", color: "var(--color-vytal-amber)", cards: ["Inês R.", "Rui C."] },
    { title: "Subscrito", color: "var(--color-vytal-green)", cards: ["Ana P."] },
  ];
  return (
    <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_90%,transparent)] p-4 shadow-xl shadow-black/40">
      <div className="text-xs font-semibold text-vytal-text mb-3">Pipeline de Vendas</div>
      <div className="grid grid-cols-4 gap-2">
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: col.color }}>{col.title}</span>
            </div>
            {col.cards.map((card) => (
              <div key={card} className="px-2 py-2 rounded-lg border text-[9px] text-vytal-text bg-[color-mix(in_srgb,var(--color-vytal-bg3)_80%,transparent)] cursor-grab active:cursor-grabbing hover:border-opacity-50 transition-colors"
                style={{ borderColor: `color-mix(in srgb, ${col.color} 25%, transparent)` }}>
                {card}
              </div>
            ))}
            <div className="px-2 py-1.5 rounded-lg border border-dashed border-[rgba(34,197,94,0.1)] text-[9px] text-vytal-muted text-center">+ Add</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebsiteMockup() {
  return (
    <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_90%,transparent)] overflow-hidden shadow-xl shadow-black/40">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[color-mix(in_srgb,var(--color-vytal-bg3)_80%,transparent)] border-b border-[rgba(34,197,94,0.08)]">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-vytal-red/60" />
          <div className="w-2 h-2 rounded-full bg-vytal-amber/60" />
          <div className="w-2 h-2 rounded-full bg-vytal-green/60" />
        </div>
        <div className="flex-1 h-4 rounded bg-[rgba(34,197,94,0.06)] flex items-center px-2">
          <span className="text-[8px] text-vytal-muted">vytal.fit/crossfit-aveiro</span>
        </div>
      </div>
      {/* Mini site */}
      <div className="p-3">
        {/* Nav */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(34,197,94,0.08)]">
          <span className="text-[9px] font-bold text-vytal-green">CrossFit Aveiro</span>
          <div className="flex gap-2">
            {["Horários", "Planos", "Equipa"].map((n) => (
              <span key={n} className="text-[7px] text-vytal-muted">{n}</span>
            ))}
          </div>
        </div>
        {/* Hero */}
        <div className="rounded-xl bg-gradient-to-br from-[rgba(34,197,94,0.12)] to-[rgba(0,212,255,0.06)] p-3 mb-2 border border-[rgba(34,197,94,0.1)]">
          <div className="text-[9px] font-bold text-vytal-text mb-1">Forja o Teu Melhor.</div>
          <div className="text-[7px] text-vytal-muted mb-2">CrossFit em Aveiro desde 2015</div>
          <div className="inline-flex px-2 py-1 rounded-md bg-vytal-green text-[7px] font-bold text-vytal-bg">Inscreve-te</div>
        </div>
        {/* Pricing mini cards */}
        <div className="grid grid-cols-3 gap-1">
          {[{ n: "Starter", p: "Free" }, { n: "Pro", p: "49€" }, { n: "Elite", p: "79€" }].map((plan) => (
            <div key={plan.n} className="rounded-lg border border-[rgba(34,197,94,0.1)] p-1.5 text-center">
              <div className="text-[7px] font-semibold text-vytal-text">{plan.n}</div>
              <div className="text-[8px] font-bold text-vytal-green">{plan.p}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const bars = [30, 55, 40, 70, 60, 85, 75, 90, 65, 80, 95, 70];
  const stats = [{ label: "Receita", value: "€12.4k", change: "+18%" }, { label: "Membros", value: "247", change: "+12" }, { label: "Retenção", value: "87%", change: "+3%" }];
  return (
    <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_90%,transparent)] p-4 shadow-xl shadow-black/40">
      <div className="text-xs font-semibold text-vytal-text mb-3">Analytics · Junho 2026</div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-[color-mix(in_srgb,var(--color-vytal-bg3)_60%,transparent)] border border-[rgba(34,197,94,0.08)] p-2">
            <div className="text-[8px] text-vytal-muted mb-0.5">{s.label}</div>
            <div className="text-xs font-bold text-vytal-text">{s.value}</div>
            <div className="text-[8px] text-vytal-green">{s.change}</div>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] border border-[rgba(34,197,94,0.06)] p-3">
        <div className="text-[8px] text-vytal-muted mb-2">Presenças por mês</div>
        <div className="flex items-end gap-1 h-12">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(34,197,94,${0.2 + (h / 100) * 0.7})` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {["Jan", "Mar", "Mai", "Jun"].map((m) => (
            <span key={m} className="text-[6px] text-vytal-muted">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureDeepDive({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  const features = [
    {
      side: "left" as const,
      titleKey: "deepDiveCheckinTitle",
      descKey: "deepDiveCheckinDesc",
      bulletKeys: ["deepDiveCheckinB1", "deepDiveCheckinB2", "deepDiveCheckinB3", "deepDiveCheckinB4"],
      accent: "var(--color-vytal-green)",
      Mockup: CheckinMockup,
    },
    {
      side: "right" as const,
      titleKey: "deepDiveCrmTitle",
      descKey: "deepDiveCrmDesc",
      bulletKeys: ["deepDiveCrmB1", "deepDiveCrmB2", "deepDiveCrmB3", "deepDiveCrmB4"],
      accent: "var(--color-vytal-blue)",
      Mockup: CRMMockup,
    },
    {
      side: "left" as const,
      titleKey: "deepDiveWebsiteTitle",
      descKey: "deepDiveWebsiteDesc",
      bulletKeys: ["deepDiveWebsiteB1", "deepDiveWebsiteB2", "deepDiveWebsiteB3", "deepDiveWebsiteB4"],
      accent: "var(--color-vytal-purple)",
      Mockup: WebsiteMockup,
    },
    {
      side: "right" as const,
      titleKey: "deepDiveAnalyticsTitle",
      descKey: "deepDiveAnalyticsDesc",
      bulletKeys: ["deepDiveAnalyticsB1", "deepDiveAnalyticsB2", "deepDiveAnalyticsB3", "deepDiveAnalyticsB4"],
      accent: "var(--color-vytal-amber)",
      Mockup: AnalyticsMockup,
    },
  ];

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Zap size={12} className="text-vytal-green" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("deepDiveBadge")}</span>
          </div>
        </div>

        <div className="space-y-24">
          {features.map((feat) => {
            const { Mockup } = feat;
            const isLeft = feat.side === "left";
            const textBlock = (
              <RevealGroup className="flex flex-col justify-center" stagger={0.08} amount={0.3}>
                <RevealItem>
                  <h3 className="text-2xl sm:text-3xl font-bold text-vytal-text mb-4" style={{ color: feat.accent }}>
                    {t(feat.titleKey)}
                  </h3>
                </RevealItem>
                <RevealItem>
                  <p className="text-vytal-muted leading-relaxed mb-6 text-sm">{t(feat.descKey)}</p>
                </RevealItem>
                <ul className="space-y-3">
                  {feat.bulletKeys.map((bk) => (
                    <li key={bk}>
                      <RevealItem className="flex items-start gap-3 text-sm text-vytal-text">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${feat.accent}20` }}
                        >
                          <Check size={11} style={{ color: feat.accent }} />
                        </div>
                        {t(bk)}
                      </RevealItem>
                    </li>
                  ))}
                </ul>
              </RevealGroup>
            );
            const mockupBlock = (
              <div className="flex items-center justify-center">
                <ParallaxLayer distance={isLeft ? 40 : -40} className="w-full max-w-md">
                  <Mockup />
                </ParallaxLayer>
              </div>
            );
            return (
              <div key={feat.titleKey} className="grid lg:grid-cols-2 gap-12 items-center">
                {isLeft ? (
                  <>
                    {textBlock}
                    {mockupBlock}
                  </>
                ) : (
                  <>
                    {mockupBlock}
                    {textBlock}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
