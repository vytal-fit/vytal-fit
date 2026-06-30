"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

// ── Trilingual copy ──────────────────────────────────────────────────────────
type Lang = "pt" | "en" | "es";

const COPY: Record<Lang, Record<string, string>> = {
  pt: {
    back: "Voltar ao site",
    eyebrow: "Vytal · Marca",
    lede: "Um sinal vital para negócios de fitness. Um só pulso: a marca e os produtos que mantêm o batimento do ginásio à vista.",
    secLogo: "Logótipo",
    onDark: "Sobre escuro",
    onLight: "Sobre claro",
    secSub: "Sub-marcas · pro & my",
    subNote:
      "O nome do produto lidera, numa só palavra. myVytal é o espaço pessoal do atleta; proVytal, para quem gere o box. O tile do pulso nunca muda; o ícone da app é sempre o Vytal.",
    proLabel: "pro · staff & gestão",
    myLabel: "my · portal do atleta",
    secMark: "A marca · resiste a qualquer tamanho",
    secPalette: "Paleta",
    palGreen: "Marca · tile · acento · o “.”",
    palBg: "Fundo da app (preto com tom verde)",
    palSurface: "Painéis, cartões",
    palText: "Texto sobre escuro",
    palInk: "Traço do pulso no verde",
    palSignal: "Dados e estado, nunca a marca",
    secType: "Tipografia",
    typeDisplay: "Display · Inter / 800",
    typeBody: "Corpo · Inter",
    typeMono: "Mono · JetBrains Mono",
    typeBodySample: "Reserva uma aula, regista o WOD, observa o pulso.",
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
  },
  en: {
    back: "Back to site",
    eyebrow: "Vytal · Brand",
    lede: "A vital sign for fitness businesses. One pulse: the brand and the products that keep a gym’s heartbeat in view.",
    secLogo: "Logo",
    onDark: "On dark",
    onLight: "On light",
    secSub: "Sub-brands · pro & my",
    subNote:
      "The product name leads, as one word. myVytal is the athlete’s own space; proVytal, for the people who run the box. The pulse tile never changes; the app icon is always the Vytal mark.",
    proLabel: "pro · staff & management",
    myLabel: "my · athlete portal",
    secMark: "The mark · holds at any size",
    secPalette: "Palette",
    palGreen: "Brand · tile · accent · the “.”",
    palBg: "App ground (green-tinted black)",
    palSurface: "Panels, cards",
    palText: "Foreground on dark",
    palInk: "Pulse stroke on green",
    palSignal: "Data & status, never the brand",
    secType: "Type",
    typeDisplay: "Display · Inter / 800",
    typeBody: "Body · Inter",
    typeMono: "Mono · JetBrains Mono",
    typeBodySample: "Book a class, log the WOD, watch the pulse.",
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
  },
  es: {
    back: "Volver al sitio",
    eyebrow: "Vytal · Marca",
    lede: "Un signo vital para negocios de fitness. Un solo pulso: la marca y los productos que mantienen el latido del gimnasio a la vista.",
    secLogo: "Logotipo",
    onDark: "Sobre oscuro",
    onLight: "Sobre claro",
    secSub: "Sub-marcas · pro & my",
    subNote:
      "El nombre del producto lidera, en una sola palabra. myVytal es el espacio personal del atleta; proVytal, para quienes gestionan el box. El tile del pulso nunca cambia; el icono de la app es siempre el Vytal.",
    proLabel: "pro · staff & gestión",
    myLabel: "my · portal del atleta",
    secMark: "La marca · resiste cualquier tamaño",
    secPalette: "Paleta",
    palGreen: "Marca · tile · acento · el “.”",
    palBg: "Fondo de la app (negro con tono verde)",
    palSurface: "Paneles, tarjetas",
    palText: "Texto sobre oscuro",
    palInk: "Trazo del pulso en el verde",
    palSignal: "Datos y estado, nunca la marca",
    secType: "Tipografía",
    typeDisplay: "Display · Inter / 800",
    typeBody: "Cuerpo · Inter",
    typeMono: "Mono · JetBrains Mono",
    typeBodySample: "Reserva una clase, registra el WOD, observa el pulso.",
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
  },
};

const HAIR = "rgba(34,197,94,0.14)";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-xs tracking-[0.26em] uppercase text-[#6b8c72] font-medium mb-6">
      {children}
    </h2>
  );
}

export default function BrandPage() {
  const [lang, setLang] = useState<Lang>("pt");
  const t = (k: string) => COPY[lang][k] ?? k;

  const palette = [
    { nm: "Green", hex: "#22c55e", role: t("palGreen"), fill: "#22c55e" },
    { nm: "Background", hex: "#080c0a", role: t("palBg"), fill: "#080c0a" },
    { nm: "Surface", hex: "#0f1610", role: t("palSurface"), fill: "#0f1610" },
    { nm: "Text", hex: "#dceee0", role: t("palText"), fill: "#dceee0" },
    { nm: "Ink", hex: "#08120c", role: t("palInk"), fill: "#08120c" },
  ];

  return (
    <main className="min-h-screen bg-[#080c0a] text-[#dceee0] font-sans">
      <style>{`
        @keyframes brand-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: no-preference) {
          .brand-hero-pulse { stroke-dasharray: 140; stroke-dashoffset: 140; animation: brand-draw 1.1s 0.15s ease-out forwards; }
        }
      `}</style>

      {/* Top bar */}
      <div
        className="sticky top-0 z-10 backdrop-blur-md bg-[#080c0a]/85 border-b"
        style={{ borderColor: HAIR }}
      >
        <div className="max-w-3xl mx-auto px-7 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#6b8c72] hover:text-[#dceee0] transition-colors"
          >
            <ArrowLeft size={15} />
            {t("back")}
          </Link>
          <div className="flex items-center gap-1">
            {(["pt", "en", "es"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs font-semibold px-2 py-1 rounded transition-all ${
                  lang === l
                    ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]"
                    : "text-[#6b8c72] hover:text-[#dceee0]"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-7 pt-16 pb-28">
        <p className="font-mono text-[11px] tracking-[0.34em] uppercase text-[#22c55e] mb-5">
          {t("eyebrow")}
        </p>

        {/* Hero */}
        <div className="flex items-center gap-9 flex-wrap">
          <svg width={128} height={128} viewBox="0 0 64 64" aria-label="Vytal" className="shrink-0">
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
            <h1 className="text-[clamp(56px,12vw,104px)] font-extrabold tracking-[-0.05em] leading-[0.9]">
              vytal<span className="text-[#22c55e]">.</span>
            </h1>
            <p className="text-[#6b8c72] text-lg mt-4 max-w-[54ch]">{t("lede")}</p>
          </div>
        </div>

        <hr className="my-14 border-0 h-px" style={{ background: HAIR }} />

        {/* Logo lockups */}
        <SectionTitle>{t("secLogo")}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="rounded-2xl border p-9 flex flex-col items-center justify-center gap-3 min-h-[150px]"
            style={{ borderColor: HAIR, background: "#0f1610" }}
          >
            <div className="flex items-center gap-4">
              <Mark size={56} />
              <span className="text-[44px] font-extrabold tracking-[-0.05em] leading-none text-[#dceee0]">
                vytal<span className="text-[#22c55e]">.</span>
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#6b8c72]">
              {t("onDark")} · #080c0a
            </span>
          </div>
          <div
            className="rounded-2xl border p-9 flex flex-col items-center justify-center gap-3 min-h-[150px]"
            style={{ borderColor: HAIR, background: "#f3f7f4" }}
          >
            <div className="flex items-center gap-4">
              <Mark size={56} />
              <span className="text-[44px] font-extrabold tracking-[-0.05em] leading-none text-[#0f1610]">
                vytal<span className="text-[#22c55e]">.</span>
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#5d6f64]">
              {t("onLight")} · #f3f7f4
            </span>
          </div>
        </div>

        <hr className="my-14 border-0 h-px" style={{ background: HAIR }} />

        {/* Sub-brands */}
        <SectionTitle>{t("secSub")}</SectionTitle>
        <p className="text-[#6b8c72] text-sm max-w-[64ch] mb-6">{t("subNote")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { lead: "my", label: t("myLabel") },
            { lead: "pro", label: t("proLabel") },
          ].map((p) => (
            <div
              key={p.lead}
              className="rounded-2xl border p-9 flex flex-col items-center justify-center gap-3 min-h-[150px]"
              style={{ borderColor: HAIR, background: "#0f1610" }}
            >
              <div className="flex items-center gap-4">
                <Mark size={48} />
                <span className="text-[38px] font-extrabold tracking-[-0.05em] leading-none">
                  <span className="text-[#22c55e]">{p.lead}</span>
                  <span className="text-[#dceee0]">Vytal</span>
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#6b8c72]">
                {p.label}
              </span>
            </div>
          ))}
        </div>

        <hr className="my-14 border-0 h-px" style={{ background: HAIR }} />

        {/* Mark at sizes */}
        <SectionTitle>{t("secMark")}</SectionTitle>
        <div className="flex items-end gap-8 flex-wrap">
          {[
            { px: 88, sw: 5, cap: "88" },
            { px: 48, sw: 6, cap: "48" },
            { px: 32, sw: 7, cap: "32 · favicon" },
            { px: 20, sw: 8, cap: "20" },
          ].map((s) => (
            <div key={s.px} className="flex flex-col items-center gap-2.5">
              <Mark size={s.px} strokeWidth={s.sw} />
              <span className="font-mono text-[11px] text-[#6b8c72]">{s.cap}</span>
            </div>
          ))}
        </div>

        <hr className="my-14 border-0 h-px" style={{ background: HAIR }} />

        {/* Palette */}
        <SectionTitle>{t("secPalette")}</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {palette.map((c) => (
            <div key={c.hex} className="rounded-xl border overflow-hidden" style={{ borderColor: HAIR }}>
              <div className="h-[76px]" style={{ background: c.fill }} />
              <div className="p-3.5">
                <div className="text-[13px] font-semibold">{c.nm}</div>
                <div className="font-mono text-xs text-[#6b8c72] uppercase tracking-wide">{c.hex}</div>
                <div className="text-[11.5px] text-[#6b8c72] mt-0.5">{c.role}</div>
              </div>
            </div>
          ))}
          {/* Signal colors */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: HAIR }}>
            <div className="h-[76px] flex items-center justify-center gap-2" style={{ background: "#0f1610" }}>
              {["#00d4ff", "#ffb300", "#ff4757", "#c084fc"].map((s) => (
                <span key={s} className="w-3.5 h-3.5 rounded-[3px]" style={{ background: s }} />
              ))}
            </div>
            <div className="p-3.5">
              <div className="text-[13px] font-semibold">Signal</div>
              <div className="font-mono text-xs text-[#6b8c72]">cyan · amber · red · violet</div>
              <div className="text-[11.5px] text-[#6b8c72] mt-0.5">{t("palSignal")}</div>
            </div>
          </div>
        </div>

        <hr className="my-14 border-0 h-px" style={{ background: HAIR }} />

        {/* Type */}
        <SectionTitle>{t("secType")}</SectionTitle>
        <div>
          {[
            { sample: <span className="text-[34px] font-extrabold tracking-[-0.03em]">vytal · strong &amp; tight</span>, k: t("typeDisplay") },
            { sample: <span className="text-lg text-[#dceee0]">{t("typeBodySample")}</span>, k: t("typeBody") },
            { sample: <span className="font-mono text-[15px] text-[#22c55e]">--green: #22c55e;</span>, k: t("typeMono") },
          ].map((row, i) => (
            <div
              key={i}
              className="flex flex-wrap gap-x-6 gap-y-1.5 items-baseline justify-between border-t first:border-t-0"
              style={{ borderColor: HAIR, paddingTop: i === 0 ? 0 : 22, paddingBottom: 22 }}
            >
              {row.sample}
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#6b8c72]">{row.k}</span>
            </div>
          ))}
        </div>

        <hr className="my-14 border-0 h-px" style={{ background: HAIR }} />

        {/* Usage */}
        <SectionTitle>{t("secUsage")}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-xl border p-5" style={{ borderColor: HAIR }}>
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase mb-2.5 text-[#22c55e]">✓ {t("doH")}</div>
            <ul className="list-disc pl-5 text-sm text-[#6b8c72] space-y-1.5 marker:text-[#22c55e]">
              <li>{t("do1")}</li>
              <li>{t("do2")}</li>
              <li>{t("do3")}</li>
            </ul>
          </div>
          <div className="rounded-xl border p-5" style={{ borderColor: HAIR }}>
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase mb-2.5 text-[#ff6b6b]">✕ {t("dontH")}</div>
            <ul className="list-disc pl-5 text-sm text-[#6b8c72] space-y-1.5 marker:text-[#ff6b6b]">
              <li>{t("dont1")}</li>
              <li>{t("dont2")}</li>
              <li>{t("dont3")}</li>
            </ul>
          </div>
        </div>

        <p className="mt-16 font-mono text-xs text-[#6b8c72] tracking-wide">
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
