"use client";

import { useState } from "react";
import {
  Globe, MapPin, Save, DollarSign, ShieldCheck, Image as ImageIcon, Camera, Eye, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useDataStore } from "@/stores/data-store";

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

function formatCoord(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(4);
}

export default function DropInsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const updateOrgSettings = useDataStore((s) => s.updateOrgSettings);
  const orgSettings = useDataStore((s) => s.orgSettings);

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
      about: "Somos um box de CrossFit localizado em Lisboa. Oferecemos aulas para todos os niveis.",
      equipment: "Barras olimpicas, kettlebells, rowers, assault bikes, rigs",
      parking: "Estacionamento gratuito no parque adjacente",
      showers: "2 balnearios com chuveiros quentes",
      payment: "MBWay, Multibanco, Dinheiro",
    },
    en: {
      about: "We are a CrossFit box located in Lisbon. We offer classes for all levels.",
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

  function handleSave() {
    updateOrgSettings({
      slogan: orgSettings.slogan,
    });
    toast(t("dropins.title") + " - " + t("action.save"), "success");
  }

  function handleLatBlur() {
    setLat(formatCoord(lat));
  }

  function handleLngBlur() {
    setLng(formatCoord(lng));
  }

  const content = langContent[activeLang];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("dropins.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("dropins.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("action.save")}
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
                  <p className="text-sm font-semibold text-vytal-text">{t("dropins.active")}</p>
                  <p className="text-xs text-vytal-muted">{t("dropins.activeDesc")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", active ? "bg-vytal-green" : "bg-vytal-bg3")}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300", active ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("dropins.price")}</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("dropins.description")}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
            </div>
          </div>

          {/* GPS Location */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-vytal-green" />
              <h3 className="text-sm font-semibold text-vytal-text">{t("dropins.location")}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("dropins.latitude")}</label>
                <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} onBlur={handleLatBlur} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 font-mono text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("dropins.longitude")}</label>
                <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} onBlur={handleLngBlur} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 font-mono text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
              </div>
            </div>
            {/* Improved map placeholder */}
            <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-vytal-green/20 bg-gradient-to-br from-vytal-bg2 to-vytal-bg3">
              {/* Grid pattern for map feel */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }} />
              <div className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vytal-green/10">
                  <MapPin className="h-6 w-6 text-vytal-green" />
                </div>
                <p className="mt-2 font-mono text-xs text-vytal-muted">{t("dropins.mapPreview")}</p>
                <p className="font-mono text-[10px] text-vytal-muted/60">{lat}, {lng}</p>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-vytal-green" />
              <h3 className="text-sm font-semibold text-vytal-text">{t("dropins.photos")}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="group relative flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-vytal-border bg-vytal-bg2 transition-all hover:border-vytal-green/30 hover:bg-vytal-green/5">
                  <div className="text-center">
                    <Camera className="mx-auto h-5 w-5 text-vytal-muted/40 transition-colors group-hover:text-vytal-green/60" />
                    <p className="mt-1.5 text-[10px] font-medium text-vytal-muted/60 transition-colors group-hover:text-vytal-green/60">
                      {t("dropins.uploadPhoto")}
                    </p>
                  </div>
                  {/* Number badge */}
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-vytal-bg3 text-[9px] font-bold text-vytal-muted">
                    {n}
                  </span>
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
              <h3 className="text-sm font-semibold text-vytal-text">{t("dropins.rules")}</h3>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("dropins.whoCanRegister")}</label>
              <div className="flex gap-3">
                {([{ value: "all", labelKey: "dropins.membersVisitors" }, { value: "members", labelKey: "dropins.membersOnly" }] as const).map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setRegistration(opt.value)} className={cn("rounded-lg border px-4 py-2 text-xs font-medium transition-colors", registration === opt.value ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green" : "border-vytal-border text-vytal-muted hover:text-vytal-text")}>
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vytal-text">{t("dropins.emailValidation")}</p>
                <p className="text-xs text-vytal-muted">{t("dropins.emailValidationDesc")}</p>
              </div>
              <button type="button" onClick={() => setEmailValidation(!emailValidation)} className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", emailValidation ? "bg-vytal-green" : "bg-vytal-bg3")}>
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300", emailValidation ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("dropins.requiredDetails")}</label>
              <div className="flex gap-3">
                {([{ value: "full", labelKey: "dropins.fullDetails" }, { value: "basic", labelKey: "dropins.basicDetails" }] as const).map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setDetailLevel(opt.value)} className={cn("rounded-lg border px-4 py-2 text-xs font-medium transition-colors", detailLevel === opt.value ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green" : "border-vytal-border text-vytal-muted hover:text-vytal-text")}>
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("dropins.absenceLimit")}</label>
              <input type="number" value={absenceLimit} onChange={(e) => setAbsenceLimit(e.target.value)} className="w-24 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
            </div>
          </div>

          {/* Multi-language Content */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-vytal-text">{t("dropins.details")}</h3>
              <div className="flex rounded-lg border border-vytal-border">
                {TABS.map((tab) => (
                  <button key={tab.value} type="button" onClick={() => setActiveLang(tab.value)} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeLang === tab.value ? "bg-vytal-green/10 text-vytal-green" : "text-vytal-muted hover:text-vytal-text")}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {([
              { key: "about", labelKey: "dropins.about" },
              { key: "equipment", labelKey: "dropins.equipment" },
              { key: "parking", labelKey: "dropins.parking" },
              { key: "showers", labelKey: "dropins.showers" },
              { key: "payment", labelKey: "dropins.paymentMethods" },
            ] as const).map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t(field.labelKey)}</label>
                <textarea value={content[field.key]} onChange={(e) => updateLangField(field.key, e.target.value)} rows={2} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
              </div>
            ))}
          </div>

          {/* Visitor Preview Card */}
          <div className="rounded-xl border border-vytal-green/20 bg-gradient-to-br from-vytal-card to-vytal-green/5 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-vytal-green" />
              <h3 className="text-sm font-semibold text-vytal-text">{t("dropins.previewCard")}</h3>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-bg p-5 space-y-3">
              {/* Preview header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-vytal-text">{orgSettings.name}</h4>
                  <p className="text-xs text-vytal-muted">{orgSettings.address}, {orgSettings.city}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
                  <Globe className="h-5 w-5 text-vytal-green" />
                </div>
              </div>
              {/* Description */}
              <p className="text-sm text-vytal-muted">{description}</p>
              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-vytal-green">{price} EUR</span>
                <span className="text-xs text-vytal-muted">{t("dropins.perSession")}</span>
              </div>
              {/* Equipment preview */}
              <div className="flex flex-wrap gap-1.5">
                {content.equipment.split(",").slice(0, 4).map((item, i) => (
                  <span key={i} className="rounded-full bg-vytal-bg2 px-2 py-0.5 text-[10px] font-medium text-vytal-muted">
                    {item.trim()}
                  </span>
                ))}
              </div>
              {/* Book button */}
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green py-2.5 text-sm font-semibold text-vytal-bg">
                <ArrowRight className="h-4 w-4" />
                {t("dropins.bookNow")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
