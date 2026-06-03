"use client";

import { useState } from "react";
import {
  Globe,
  MapPin,
  Save,
  DollarSign,
  ShieldCheck,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Lang = "pt" | "en";

const TABS: { value: Lang; label: string }[] = [
  { value: "pt", label: "PT" },
  { value: "en", label: "EN" },
];

interface LangContent {
  about: string;
  equipment: string;
  parking: string;
  showers: string;
  payment: string;
}

export default function DropInsPage() {
  const [active, setActive] = useState(true);
  const [price, setPrice] = useState("15");
  const [description, setDescription] = useState(
    "CrossFit drop-in session for visiting athletes. Full access to our WOD classes."
  );
  const [lat, setLat] = useState("38.7223");
  const [lng, setLng] = useState("-9.1393");
  const [registration, setRegistration] = useState<"all" | "members">("all");
  const [emailValidation, setEmailValidation] = useState(true);
  const [detailLevel, setDetailLevel] = useState<"full" | "basic">("full");
  const [absenceLimit, setAbsenceLimit] = useState("3");
  const [activeLang, setActiveLang] = useState<Lang>("pt");

  const [langContent, setLangContent] = useState<Record<Lang, LangContent>>({
    pt: {
      about:
        "Somos um box de CrossFit localizado em Lisboa. Oferecemos aulas para todos os niveis.",
      equipment: "Barras olimpicas, kettlebells, rowers, assault bikes, rigs",
      parking: "Estacionamento gratuito no parque adjacente",
      showers: "2 balnearios com chuveiros quentes",
      payment: "MBWay, Multibanco, Dinheiro",
    },
    en: {
      about:
        "We are a CrossFit box located in Lisbon. We offer classes for all levels.",
      equipment: "Olympic bars, kettlebells, rowers, assault bikes, rigs",
      parking: "Free parking in adjacent lot",
      showers: "2 changing rooms with hot showers",
      payment: "MBWay, Multibanco, Cash",
    },
  });

  function updateLangField(field: keyof LangContent, value: string) {
    setLangContent((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [field]: value },
    }));
  }

  const content = langContent[activeLang];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            Drop-in Configuration
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Configure drop-in sessions for visiting athletes
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Active Toggle + Price */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-vytal-green" />
                <div>
                  <p className="text-sm font-semibold text-vytal-text">
                    Drop-in Active
                  </p>
                  <p className="text-xs text-vytal-muted">
                    Allow visitors to register for drop-in sessions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  active ? "bg-vytal-green" : "bg-vytal-bg3"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    active ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Drop-in Price (EUR)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
          </div>

          {/* GPS Location */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-vytal-green" />
              <h3 className="text-sm font-semibold text-vytal-text">
                Location
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                  Latitude
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                  Longitude
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
            </div>

            {/* Map placeholder */}
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-vytal-border bg-vytal-bg2">
              <div className="text-center">
                <MapPin className="mx-auto h-6 w-6 text-vytal-muted" />
                <p className="mt-2 text-xs text-vytal-muted">
                  Map preview ({lat}, {lng})
                </p>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-vytal-green" />
              <h3 className="text-sm font-semibold text-vytal-text">Photos</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-vytal-border bg-vytal-bg2 transition-colors hover:border-vytal-green/30"
                >
                  <span className="text-xs text-vytal-muted">+</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Rules */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-vytal-green" />
              <h3 className="text-sm font-semibold text-vytal-text">Rules</h3>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Who can register
              </label>
              <div className="flex gap-3">
                {(
                  [
                    { value: "all", label: "Members + Visitors" },
                    { value: "members", label: "Members Only" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRegistration(opt.value)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                      registration === opt.value
                        ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                        : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vytal-text">Email Validation</p>
                <p className="text-xs text-vytal-muted">
                  Require email verification before check-in
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailValidation(!emailValidation)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  emailValidation ? "bg-vytal-green" : "bg-vytal-bg3"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    emailValidation ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Required Details
              </label>
              <div className="flex gap-3">
                {(
                  [
                    { value: "full", label: "Full (Name, Email, Phone, ID)" },
                    { value: "basic", label: "Basic (Name, Email)" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDetailLevel(opt.value)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                      detailLevel === opt.value
                        ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                        : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Absence Limit (no-shows)
              </label>
              <input
                type="number"
                value={absenceLimit}
                onChange={(e) => setAbsenceLimit(e.target.value)}
                className="w-24 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
          </div>

          {/* Multi-language Content */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-vytal-text">
                Details
              </h3>
              <div className="flex rounded-lg border border-vytal-border">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveLang(tab.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      activeLang === tab.value
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "text-vytal-muted hover:text-vytal-text"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {(
              [
                { key: "about", label: "About" },
                { key: "equipment", label: "Equipment" },
                { key: "parking", label: "Parking" },
                { key: "showers", label: "Showers" },
                { key: "payment", label: "Payment Methods" },
              ] as const
            ).map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                  {field.label}
                </label>
                <textarea
                  value={content[field.key]}
                  onChange={(e) => updateLangField(field.key, e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
