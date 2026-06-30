"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sun, Moon } from "lucide-react";

// ── The mark: a vital-sign pulse on a rounded green tile ─────────────────────
function Mark({ size = 64, strokeWidth = 5 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#22c55e" />
      <path
        d="M11 35 L23 35 L27 25 L32 45 L37 16 L41 35 L53 35"
        fill="none"
        stroke="#08120c"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Design tokens ────────────────────────────────────────────────────────────
const GREEN_SCALE: [string, string][] = [
  ["50", "#f0fdf4"], ["100", "#dcfce7"], ["200", "#bbf7d0"], ["300", "#86efac"],
  ["400", "#4ade80"], ["500", "#22c55e"], ["600", "#16a34a"], ["700", "#15803d"],
  ["800", "#166534"], ["900", "#14532d"], ["950", "#052e16"],
];

// Vytal "ink": a green-biased neutral ramp (never a pure grey)
const NEUTRAL_SCALE: [string, string][] = [
  ["0", "#f3f7f4"], ["50", "#dceee0"], ["100", "#c8d6cc"], ["200", "#a7b8ac"],
  ["300", "#7f9488"], ["400", "#5d6f64"], ["500", "#3d4f43"], ["600", "#2a382e"],
  ["700", "#1e2a22"], ["800", "#162018"], ["900", "#0f1610"], ["950", "#080c0a"],
];

const SEMANTIC: { nm: string; hex: string; role: string }[] = [
  { nm: "Success", hex: "#22c55e", role: "ok · positive · on-track" },
  { nm: "Info", hex: "#00d4ff", role: "neutral data · links" },
  { nm: "Warning", hex: "#ffb300", role: "attention · at-risk" },
  { nm: "Danger", hex: "#ff4757", role: "errors · destructive" },
  { nm: "Accent", hex: "#c084fc", role: "highlights · AI" },
];

const FONT_COLORS_DARK: { nm: string; hex: string }[] = [
  { nm: "Primary", hex: "#dceee0" }, { nm: "Secondary", hex: "#a7b8ac" },
  { nm: "Muted", hex: "#7f9488" }, { nm: "Disabled", hex: "#3d4f43" },
  { nm: "Accent", hex: "#22c55e" }, { nm: "On green", hex: "#08120c" },
];
const FONT_COLORS_LIGHT: { nm: string; hex: string }[] = [
  { nm: "Primary", hex: "#0f1610" }, { nm: "Secondary", hex: "#3d4f43" },
  { nm: "Muted", hex: "#5d6f64" }, { nm: "Disabled", hex: "#a7b8ac" },
  { nm: "Accent", hex: "#16a34a" }, { nm: "On green", hex: "#08120c" },
];

const TYPE_SCALE: { name: string; px: number; w: number; lh: number; tr: string; sample: string; mono?: boolean; upper?: boolean }[] = [
  { name: "Display", px: 64, w: 800, lh: 0.9, tr: "-0.05em", sample: "vytal." },
  { name: "H1", px: 42, w: 800, lh: 1.0, tr: "-0.04em", sample: "Manage your box" },
  { name: "H2", px: 30, w: 700, lh: 1.1, tr: "-0.03em", sample: "Today’s operation" },
  { name: "H3", px: 21, w: 700, lh: 1.2, tr: "-0.02em", sample: "At-risk members" },
  { name: "Body L", px: 18, w: 400, lh: 1.55, tr: "0", sample: "Book a class, log the WOD, watch the pulse." },
  { name: "Body", px: 15, w: 400, lh: 1.55, tr: "0", sample: "Book a class, log the WOD, watch the pulse." },
  { name: "Small", px: 13, w: 500, lh: 1.5, tr: "0", sample: "Updated 2 minutes ago" },
  { name: "Caption", px: 11, w: 500, lh: 1.4, tr: "0.16em", sample: "Members · Active", mono: true, upper: true },
];

const WEIGHTS: [string, number][] = [
  ["Regular", 400], ["Medium", 500], ["Semibold", 600], ["Bold", 700], ["Extrabold", 800],
];

const RADII: [string, string][] = [
  ["sm", "8px"], ["md", "12px"], ["lg", "16px"], ["xl", "18px"], ["pill", "9999px"],
];

// ── Trilingual copy ──────────────────────────────────────────────────────────
type Lang = "pt" | "en" | "es";

const COPY: Record<Lang, Record<string, string>> = {
  pt: {
    back: "Voltar ao site",
    eyebrow: "Vytal · Styleguide",
    lede: "Um sinal vital para negócios de fitness. Um só pulso: a marca, a cor, a tipografia e os produtos que mantêm o batimento do ginásio à vista.",
    secLogo: "Logótipo",
    onDark: "Sobre escuro",
    onLight: "Sobre claro",
    secSub: "Sub-marcas · pro & my",
    subNote:
      "O nome do produto lidera, numa só palavra. myVytal é o espaço pessoal do atleta; proVytal, para quem gere o box. O tile do pulso nunca muda; o ícone da app é sempre o Vytal.",
    proLabel: "pro · staff & gestão",
    myLabel: "my · portal do atleta",
    secMark: "A marca · resiste a qualquer tamanho",
    secColor: "Cor",
    colorNote: "O verde é a única cor de marca. Os neutros têm sempre um tom verde, nunca cinzento puro. As cores de sinal servem dados e estado, nunca a marca.",
    colorBrandT: "Verde da marca",
    colorNeutralT: "Neutros · ink com tom verde",
    colorSurfaceT: "Superfícies (escuro)",
    colorSemanticT: "Cores de sinal",
    secFontColor: "Cores de texto",
    fontColorNote: "Hierarquia de texto por fundo. Primário para conteúdo, secundário e mudo para apoio, acento para ação.",
    secType: "Tipografia",
    famT: "Famílias",
    famSansRole: "Display, títulos e corpo",
    famMonoRole: "Código, dados, etiquetas",
    scaleT: "Escala tipográfica",
    weightsT: "Pesos · Inter",
    secTokens: "Tokens",
    radiusT: "Raio",
    elevationT: "Elevação",
    secUsage: "Uso",
    doH: "Fazer",
    dontH: "Não fazer",
    do1: "Escolher o lockup que combina com o fundo: claro ou escuro.",
    do2: "Manter espaço livre ≈ ao raio do canto do tile à volta do logo.",
    do3: "Deixar o pulso respirar; o tile verde é a constante.",
    dont1: "Recolorir o tile ou o pulso, ou aplicar gradientes.",
    dont2: "Esticar, rodar ou contornar o lockup.",
    dont3: "Usar as cores de sinal (cyan/amber/red) como marca.",
    foot: "Vytal · vytal.fit · um só pulso, na marca e nos produtos.",
    themeLight: "Modo claro",
    themeDark: "Modo escuro",
  },
  en: {
    back: "Back to site",
    eyebrow: "Vytal · Styleguide",
    lede: "A vital sign for fitness businesses. One pulse: the brand, the colour, the type and the products that keep a gym’s heartbeat in view.",
    secLogo: "Logo",
    onDark: "On dark",
    onLight: "On light",
    secSub: "Sub-brands · pro & my",
    subNote:
      "The product name leads, as one word. myVytal is the athlete’s own space; proVytal, for the people who run the box. The pulse tile never changes; the app icon is always the Vytal mark.",
    proLabel: "pro · staff & management",
    myLabel: "my · athlete portal",
    secMark: "The mark · holds at any size",
    secColor: "Colour",
    colorNote: "Green is the only brand colour. Neutrals always carry a green bias, never pure grey. Signal colours serve data and status, never the brand.",
    colorBrandT: "Brand green",
    colorNeutralT: "Neutrals · green-biased ink",
    colorSurfaceT: "Surfaces (dark)",
    colorSemanticT: "Signal colours",
    secFontColor: "Text colours",
    fontColorNote: "Text hierarchy per background. Primary for content, secondary and muted for support, accent for action.",
    secType: "Typography",
    famT: "Families",
    famSansRole: "Display, headings and body",
    famMonoRole: "Code, data, labels",
    scaleT: "Type scale",
    weightsT: "Weights · Inter",
    secTokens: "Tokens",
    radiusT: "Radius",
    elevationT: "Elevation",
    secUsage: "Usage",
    doH: "Do",
    dontH: "Don’t",
    do1: "Pick the lockup that fits the background: light or dark.",
    do2: "Keep clear space ≈ the tile’s corner radius around the logo.",
    do3: "Let the pulse breathe; the green tile is the constant.",
    dont1: "Recolor the tile or the pulse, or add gradients.",
    dont2: "Stretch, rotate, or outline the lockup.",
    dont3: "Use the signal colors (cyan/amber/red) as the brand.",
    foot: "Vytal · vytal.fit · one pulse across the brand and its products.",
    themeLight: "Light mode",
    themeDark: "Dark mode",
  },
  es: {
    back: "Volver al sitio",
    eyebrow: "Vytal · Styleguide",
    lede: "Un signo vital para negocios de fitness. Un solo pulso: la marca, el color, la tipografía y los productos que mantienen el latido del gimnasio a la vista.",
    secLogo: "Logotipo",
    onDark: "Sobre oscuro",
    onLight: "Sobre claro",
    secSub: "Sub-marcas · pro & my",
    subNote:
      "El nombre del producto lidera, en una sola palabra. myVytal es el espacio personal del atleta; proVytal, para quienes gestionan el box. El tile del pulso nunca cambia; el icono de la app es siempre el Vytal.",
    proLabel: "pro · staff & gestión",
    myLabel: "my · portal del atleta",
    secMark: "La marca · resiste cualquier tamaño",
    secColor: "Color",
    colorNote: "El verde es el único color de marca. Los neutros llevan siempre un tono verde, nunca gris puro. Los colores de señal sirven datos y estado, nunca la marca.",
    colorBrandT: "Verde de marca",
    colorNeutralT: "Neutros · ink con tono verde",
    colorSurfaceT: "Superficies (oscuro)",
    colorSemanticT: "Colores de señal",
    secFontColor: "Colores de texto",
    fontColorNote: "Jerarquía de texto por fondo. Primario para contenido, secundario y mudo para apoyo, acento para acción.",
    secType: "Tipografía",
    famT: "Familias",
    famSansRole: "Display, títulos y cuerpo",
    famMonoRole: "Código, datos, etiquetas",
    scaleT: "Escala tipográfica",
    weightsT: "Pesos · Inter",
    secTokens: "Tokens",
    radiusT: "Radio",
    elevationT: "Elevación",
    secUsage: "Uso",
    doH: "Hacer",
    dontH: "No hacer",
    do1: "Elige el lockup que combina con el fondo: claro u oscuro.",
    do2: "Mantén espacio libre ≈ al radio de esquina del tile alrededor del logo.",
    do3: "Deja respirar el pulso; el tile verde es la constante.",
    dont1: "Recolorear el tile o el pulso, o aplicar gradientes.",
    dont2: "Estirar, rotar o contornear el lockup.",
    dont3: "Usar los colores de señal (cyan/amber/red) como marca.",
    foot: "Vytal · vytal.fit · un solo pulso, en la marca y los productos.",
    themeLight: "Modo claro",
    themeDark: "Modo oscuro",
  },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-xs tracking-[0.26em] uppercase font-medium mb-2 text-[var(--b-muted)] flex items-center gap-2.5 before:content-[''] before:w-[7px] before:h-[7px] before:rounded-[2px] before:bg-[#22c55e]">
      {children}
    </h2>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--b-muted)] mb-3">{children}</div>
  );
}

// A horizontal colour ramp with step + hex under each cell
function Ramp({ scale, brandStep }: { scale: [string, string][]; brandStep?: string }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="flex gap-1.5 min-w-max">
        {scale.map(([step, hex]) => (
          <div key={step} className="flex flex-col items-center" style={{ width: 66 }}>
            <div
              className="w-full h-14 rounded-lg border"
              style={{
                background: hex,
                borderColor: step === brandStep ? "#22c55e" : "var(--b-hair)",
                boxShadow: step === brandStep ? "0 0 0 2px rgba(34,197,94,0.35)" : "none",
              }}
            />
            <div className="mt-1.5 text-[10px] font-semibold text-[var(--b-text)]">{step}</div>
            <div className="font-mono text-[9.5px] text-[var(--b-muted)] uppercase">{hex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandPage() {
  const [lang, setLang] = useState<Lang>("pt");
  const [light, setLight] = useState(false);
  const t = (k: string) => COPY[lang][k] ?? k;

  return (
    <main className={`brandpage min-h-screen font-sans bg-[var(--b-bg)] text-[var(--b-text)] ${light ? "light" : ""}`}>
      <style>{`
        .brandpage {
          --b-bg: #080c0a;
          --b-surface: #0f1610;
          --b-text: #dceee0;
          --b-muted: #6b8c72;
          --b-hair: rgba(34,197,94,0.14);
        }
        .brandpage.light {
          --b-bg: #f3f7f4;
          --b-surface: #ffffff;
          --b-text: #0f1610;
          --b-muted: #5d6f64;
          --b-hair: rgba(8,18,12,0.12);
        }
        @keyframes brand-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: no-preference) {
          .brand-hero-pulse { stroke-dasharray: 140; stroke-dashoffset: 140; animation: brand-draw 1.1s 0.15s ease-out forwards; }
        }
      `}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-10 backdrop-blur-md border-b bg-[var(--b-bg)]/90 border-[var(--b-hair)]">
        <div className="max-w-3xl mx-auto px-7 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--b-muted)] hover:text-[var(--b-text)] transition-colors"
          >
            <ArrowLeft size={15} />
            {t("back")}
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(["pt", "en", "es"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs font-semibold px-2 py-1 rounded transition-all ${
                    lang === l
                      ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]"
                      : "text-[var(--b-muted)] hover:text-[var(--b-text)]"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => setLight((v) => !v)}
              aria-label={light ? t("themeDark") : t("themeLight")}
              title={light ? t("themeDark") : t("themeLight")}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--b-hair)] text-[var(--b-muted)] hover:text-[#22c55e] transition-all"
            >
              {light ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-7 pt-16 pb-28">
        <p className="font-mono text-[11px] tracking-[0.34em] uppercase text-[#22c55e] mb-5">{t("eyebrow")}</p>

        {/* Hero */}
        <div className="flex items-center gap-9 flex-wrap">
          <svg width={120} height={120} viewBox="0 0 64 64" aria-label="Vytal" className="shrink-0">
            <rect x="2" y="2" width="60" height="60" rx="16" fill="#22c55e" />
            <path
              className="brand-hero-pulse"
              d="M11 35 L23 35 L27 25 L32 45 L37 16 L41 35 L53 35"
              fill="none"
              stroke="#08120c"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex-1 min-w-[260px]">
            <h1 className="text-[clamp(52px,11vw,96px)] font-extrabold tracking-[-0.05em] leading-[0.9]">
              vytal<span className="text-[#22c55e]">.</span>
            </h1>
            <p className="text-[var(--b-muted)] text-lg mt-4 max-w-[54ch]">{t("lede")}</p>
          </div>
        </div>

        <hr className="my-14 border-0 h-px bg-[var(--b-hair)]" />

        {/* Logo lockups: fixed dark/light demo swatches */}
        <SectionTitle>{t("secLogo")}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="rounded-2xl border p-9 flex flex-col items-center justify-center gap-3 min-h-[150px]" style={{ borderColor: "var(--b-hair)", background: "#0f1610" }}>
            <div className="flex items-center gap-4">
              <Mark size={56} />
              <span className="text-[44px] font-extrabold tracking-[-0.05em] leading-none text-[#dceee0]">vytal<span className="text-[#22c55e]">.</span></span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#6b8c72]">{t("onDark")} · #080c0a</span>
          </div>
          <div className="rounded-2xl border p-9 flex flex-col items-center justify-center gap-3 min-h-[150px]" style={{ borderColor: "var(--b-hair)", background: "#f3f7f4" }}>
            <div className="flex items-center gap-4">
              <Mark size={56} />
              <span className="text-[44px] font-extrabold tracking-[-0.05em] leading-none text-[#0f1610]">vytal<span className="text-[#22c55e]">.</span></span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#5d6f64]">{t("onLight")} · #f3f7f4</span>
          </div>
        </div>

        <hr className="my-14 border-0 h-px bg-[var(--b-hair)]" />

        {/* Sub-brands */}
        <SectionTitle>{t("secSub")}</SectionTitle>
        <p className="text-[var(--b-muted)] text-sm max-w-[64ch] mt-3 mb-6">{t("subNote")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { lead: "my", label: t("myLabel"), bg: "#0f1610", fg: "#dceee0" },
            { lead: "pro", label: t("proLabel"), bg: "#f3f7f4", fg: "#0f1610" },
          ].map((p) => (
            <div key={p.lead} className="rounded-2xl border p-9 flex flex-col items-center justify-center gap-3 min-h-[150px]" style={{ borderColor: "var(--b-hair)", background: p.bg }}>
              <div className="flex items-center gap-4">
                <Mark size={48} />
                <span className="text-[38px] font-extrabold tracking-[-0.05em] leading-none">
                  <span className="text-[#22c55e]">{p.lead}</span>
                  <span style={{ color: p.fg }}>Vytal</span>
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: p.bg === "#f3f7f4" ? "#5d6f64" : "#6b8c72" }}>{p.label}</span>
            </div>
          ))}
        </div>

        <hr className="my-14 border-0 h-px bg-[var(--b-hair)]" />

        {/* Mark at sizes */}
        <SectionTitle>{t("secMark")}</SectionTitle>
        <div className="flex items-end gap-8 flex-wrap mt-5">
          {[
            { px: 88, sw: 5, cap: "88" }, { px: 48, sw: 6, cap: "48" },
            { px: 32, sw: 7, cap: "32 · favicon" }, { px: 20, sw: 8, cap: "20" },
          ].map((s) => (
            <div key={s.px} className="flex flex-col items-center gap-2.5">
              <Mark size={s.px} strokeWidth={s.sw} />
              <span className="font-mono text-[11px] text-[var(--b-muted)]">{s.cap}</span>
            </div>
          ))}
        </div>

        <hr className="my-14 border-0 h-px bg-[var(--b-hair)]" />

        {/* COLOUR */}
        <SectionTitle>{t("secColor")}</SectionTitle>
        <p className="text-[var(--b-muted)] text-sm max-w-[64ch] mt-3 mb-7">{t("colorNote")}</p>

        <SubLabel>{t("colorBrandT")}</SubLabel>
        <Ramp scale={GREEN_SCALE} brandStep="500" />

        <div className="mt-8">
          <SubLabel>{t("colorNeutralT")}</SubLabel>
          <Ramp scale={NEUTRAL_SCALE} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
          <div>
            <SubLabel>{t("colorSurfaceT")}</SubLabel>
            <div className="flex flex-col gap-2">
              {[
                ["Background", "#080c0a"], ["Surface", "#0f1610"],
                ["Surface raised", "#162018"], ["Hairline", "#1e2a22"],
              ].map(([nm, hex]) => (
                <div key={hex} className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg border shrink-0" style={{ background: hex, borderColor: "var(--b-hair)" }} />
                  <span className="text-[13px] font-medium flex-1">{nm}</span>
                  <span className="font-mono text-[11px] text-[var(--b-muted)] uppercase">{hex}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SubLabel>{t("colorSemanticT")}</SubLabel>
            <div className="flex flex-col gap-2">
              {SEMANTIC.map((s) => (
                <div key={s.hex} className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `${s.hex}22` }}>
                    <span className="w-4 h-4 rounded-[5px]" style={{ background: s.hex }} />
                  </span>
                  <span className="flex-1">
                    <span className="text-[13px] font-medium block leading-tight">{s.nm}</span>
                    <span className="text-[11px] text-[var(--b-muted)]">{s.role}</span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--b-muted)] uppercase">{s.hex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-14 border-0 h-px bg-[var(--b-hair)]" />

        {/* TEXT COLOURS */}
        <SectionTitle>{t("secFontColor")}</SectionTitle>
        <p className="text-[var(--b-muted)] text-sm max-w-[64ch] mt-3 mb-7">{t("fontColorNote")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { tag: t("onDark"), bg: "#0f1610", rows: FONT_COLORS_DARK },
            { tag: t("onLight"), bg: "#ffffff", rows: FONT_COLORS_LIGHT },
          ].map((card) => (
            <div key={card.tag} className="rounded-2xl border p-6" style={{ borderColor: "var(--b-hair)", background: card.bg }}>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase mb-4" style={{ color: card.bg === "#ffffff" ? "#5d6f64" : "#6b8c72" }}>{card.tag}</div>
              <div className="flex flex-col gap-2.5">
                {card.rows.map((r) => (
                  <div key={r.nm} className="flex items-baseline justify-between gap-3">
                    <span className="text-[17px] font-semibold tracking-[-0.01em]" style={{ color: r.hex }}>{r.nm}</span>
                    <span className="font-mono text-[10.5px] uppercase" style={{ color: card.bg === "#ffffff" ? "#5d6f64" : "#6b8c72" }}>{r.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="my-14 border-0 h-px bg-[var(--b-hair)]" />

        {/* TYPOGRAPHY */}
        <SectionTitle>{t("secType")}</SectionTitle>

        <div className="mt-5">
          <SubLabel>{t("famT")}</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-6" style={{ borderColor: "var(--b-hair)" }}>
              <div className="font-sans text-[56px] font-extrabold tracking-[-0.04em] leading-none">Aa</div>
              <div className="mt-4 text-[15px] font-semibold">Inter</div>
              <div className="text-[12px] text-[var(--b-muted)]">{t("famSansRole")}</div>
              <div className="font-sans text-[13px] text-[var(--b-muted)] mt-3 leading-relaxed">ABCDEFGHIJKLM<br />abcdefghijklm 0123456789</div>
            </div>
            <div className="rounded-2xl border p-6" style={{ borderColor: "var(--b-hair)" }}>
              <div className="font-mono text-[56px] font-medium tracking-[-0.02em] leading-none">Aa</div>
              <div className="mt-4 text-[15px] font-semibold">JetBrains Mono</div>
              <div className="text-[12px] text-[var(--b-muted)]">{t("famMonoRole")}</div>
              <div className="font-mono text-[13px] text-[var(--b-muted)] mt-3 leading-relaxed">ABCDEFGHIJKLM<br />abcdefghijklm 0123456789</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <SubLabel>{t("scaleT")}</SubLabel>
          <div>
            {TYPE_SCALE.map((row) => (
              <div
                key={row.name}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t first:border-t-0 py-4 border-[var(--b-hair)]"
              >
                <span
                  className={`${row.mono ? "font-mono" : "font-sans"} min-w-0 truncate`}
                  style={{
                    fontSize: row.px,
                    fontWeight: row.w,
                    lineHeight: row.lh,
                    letterSpacing: row.tr,
                    textTransform: row.upper ? "uppercase" : "none",
                  }}
                >
                  {row.mono && row.name === "Caption" ? <span className="text-[var(--b-muted)]">{row.sample}</span> : row.sample}
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-[var(--b-muted)] shrink-0 text-right">
                  {row.name} · {row.px}/{Math.round(row.px * row.lh)} · {row.w}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <SubLabel>{t("weightsT")}</SubLabel>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {WEIGHTS.map(([nm, w]) => (
              <div key={w} className="flex flex-col">
                <span className="text-[30px] tracking-[-0.03em] leading-none" style={{ fontWeight: w }}>Vytal</span>
                <span className="font-mono text-[10.5px] text-[var(--b-muted)] uppercase tracking-[0.1em] mt-1.5">{nm} · {w}</span>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-14 border-0 h-px bg-[var(--b-hair)]" />

        {/* TOKENS */}
        <SectionTitle>{t("secTokens")}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-5">
          <div>
            <SubLabel>{t("radiusT")}</SubLabel>
            <div className="flex items-end gap-4 flex-wrap">
              {RADII.map(([nm, v]) => (
                <div key={nm} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 border-2"
                    style={{ borderColor: "#22c55e", borderTopLeftRadius: v === "9999px" ? "9999px" : v, borderBottomRightRadius: v === "9999px" ? "9999px" : v, background: "rgba(34,197,94,0.08)" }}
                  />
                  <span className="font-mono text-[10.5px] text-[var(--b-muted)]">{nm} · {v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SubLabel>{t("elevationT")}</SubLabel>
            <div className="flex items-center gap-5 flex-wrap">
              {[
                { nm: "sm", sh: "0 1px 2px rgba(0,0,0,0.4)" },
                { nm: "md", sh: "0 6px 16px rgba(0,0,0,0.45)" },
                { nm: "lg", sh: "0 16px 40px rgba(0,0,0,0.5)" },
              ].map((e) => (
                <div key={e.nm} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl" style={{ background: "var(--b-surface)", boxShadow: e.sh, border: "1px solid var(--b-hair)" }} />
                  <span className="font-mono text-[10.5px] text-[var(--b-muted)]">{e.nm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-14 border-0 h-px bg-[var(--b-hair)]" />

        {/* Usage */}
        <SectionTitle>{t("secUsage")}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          <div className="rounded-xl border p-5 border-[var(--b-hair)]">
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase mb-2.5 text-[#22c55e]">✓ {t("doH")}</div>
            <ul className="list-disc pl-5 text-sm text-[var(--b-muted)] space-y-1.5 marker:text-[#22c55e]">
              <li>{t("do1")}</li>
              <li>{t("do2")}</li>
              <li>{t("do3")}</li>
            </ul>
          </div>
          <div className="rounded-xl border p-5 border-[var(--b-hair)]">
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase mb-2.5 text-[#ff6b6b]">✕ {t("dontH")}</div>
            <ul className="list-disc pl-5 text-sm text-[var(--b-muted)] space-y-1.5 marker:text-[#ff6b6b]">
              <li>{t("dont1")}</li>
              <li>{t("dont2")}</li>
              <li>{t("dont3")}</li>
            </ul>
          </div>
        </div>

        <p className="mt-16 font-mono text-xs text-[var(--b-muted)] tracking-wide">
          {t("foot").split("vytal.fit").map((part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>
                {part}
                <span className="text-[#22c55e]">vytal.fit</span>
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      </div>
    </main>
  );
}
