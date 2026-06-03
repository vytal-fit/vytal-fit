"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Search,
  X,
  MapPin,
  Mail,
  Phone,
  Globe,
  Zap,
} from "lucide-react";
import {
  ORGANIZATION_TYPE_LIST,
  type OrganizationType,
  type OrganizationTypeConfig,
} from "@vytal-fit/shared";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/stores/data-store";

// ─── Emoji map for org types ─────────────────────────────────────────────────

const EMOJI_MAP: Record<string, string> = {
  crossfit_box: "\uD83C\uDFCB\uFE0F",
  functional_training: "\uD83D\uDCAA",
  gym: "\uD83D\uDCAA",
  yoga_studio: "\uD83E\uDDD8",
  pilates_studio: "\uD83C\uDF93",
  martial_arts: "\uD83E\uDD4A",
  personal_training: "\uD83C\uDFAF",
  swimming: "\uD83C\uDFCA",
  dance_studio: "\uD83E\uDE70",
  health_club: "\uD83C\uDFE2",
  sports_club: "\u26BD",
  climbing_gym: "\uD83E\uDDD7",
  cycling_studio: "\uD83D\uDEB4",
  running_club: "\uD83C\uDFC3",
  gymnastics_academy: "\uD83E\uDD38",
  rehabilitation: "\uD83C\uDFE5",
  weightlifting_club: "\uD83C\uDFC6",
  bootcamp: "\u2600\uFE0F",
  surf_water_sports: "\uD83C\uDFC4",
  other: "\u2795",
};

// ─── Constants ───────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "PT", label: "Portugal", flag: "\uD83C\uDDF5\uD83C\uDDF9" },
  { code: "BR", label: "Brasil", flag: "\uD83C\uDDE7\uD83C\uDDF7" },
  { code: "ES", label: "Espa\u00f1a", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  { code: "US", label: "United States", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { code: "GB", label: "United Kingdom", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "FR", label: "France", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "DE", label: "Deutschland", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
  { code: "IT", label: "Italia", flag: "\uD83C\uDDEE\uD83C\uDDF9" },
  { code: "NL", label: "Nederland", flag: "\uD83C\uDDF3\uD83C\uDDF1" },
  { code: "OTHER", label: "Other", flag: "\uD83C\uDF10" },
];

const CURRENCIES = [
  { code: "EUR", label: "EUR - Euro" },
  { code: "BRL", label: "BRL - Real" },
  { code: "USD", label: "USD - Dollar" },
  { code: "GBP", label: "GBP - Pound" },
];

const STEP_LABELS = [
  "onboarding.step1Label",
  "onboarding.step2Label",
  "onboarding.step3Label",
] as const;

// ─── Feature categories ──────────────────────────────────────────────────────

interface FeatureInfo {
  key: string;
  label: string;
  category: "training" | "community" | "tools" | "management";
}

const ALL_FEATURES: FeatureInfo[] = [
  { key: "wods", label: "WODs", category: "training" },
  { key: "groupClasses", label: "Group Classes", category: "training" },
  { key: "openGym", label: "Open Gym", category: "training" },
  { key: "personalTraining", label: "Personal Training", category: "training" },
  { key: "movementLibrary", label: "Movement Library", category: "training" },
  { key: "leaderboard", label: "Leaderboard", category: "community" },
  { key: "gamification", label: "Gamification", category: "community" },
  { key: "fistbumps", label: "Fistbumps", category: "community" },
  { key: "dropins", label: "Drop-ins", category: "community" },
  { key: "timers", label: "Timers", category: "tools" },
  { key: "rmCalculator", label: "RM Calculator", category: "tools" },
  { key: "tvDisplay", label: "TV Display", category: "tools" },
  { key: "personalRecords", label: "Personal Records", category: "tools" },
  { key: "rxScaled", label: "Rx/Scaled", category: "tools" },
  { key: "beltSystem", label: "Belt System", category: "management" },
  { key: "nutritionTracking", label: "Nutrition", category: "management" },
  { key: "bodyComposition", label: "Body Composition", category: "management" },
  { key: "store", label: "Store", category: "management" },
];

const CATEGORY_KEYS = ["training", "community", "tools", "management"] as const;
const CATEGORY_I18N: Record<string, string> = {
  training: "onboarding.categoryTraining",
  community: "onboarding.categoryCommunity",
  tools: "onboarding.categoryTools",
  management: "onboarding.categoryManagement",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Europe/Lisbon";
  }
}

// ─── Confetti component (CSS-only) ───────────────────────────────────────────

function Confetti() {
  const particles = useMemo(() => {
    const colors = [
      "#22c55e",
      "#00d4ff",
      "#ffb300",
      "#c084fc",
      "#ff8c42",
      "#ff4757",
    ];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.8}s`,
      duration: `${1 + Math.random() * 1}s`,
      size: `${6 + Math.random() * 6}px`,
      rotation: `${Math.random() * 360}deg`,
      xDrift: `${-50 + Math.random() * 100}px`,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-1/2 rounded-sm"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `onboarding-confetti ${p.duration} ease-out ${p.delay} both`,
            transform: `rotate(${p.rotation}) translateX(${p.xDrift})`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated checkmark (SVG, CSS animation) ────────────────────────────────

function AnimatedCheckmark() {
  return (
    <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
      {/* Celebration rings */}
      <div className="absolute inset-0 rounded-full border-2 border-vytal-green/30 onboarding-celebrate-ring" />
      <div
        className="absolute inset-0 rounded-full border-2 border-vytal-green/20 onboarding-celebrate-ring"
        style={{ animationDelay: "0.2s" }}
      />
      <svg
        className="h-24 w-24"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="onboarding-checkmark-circle"
          cx="26"
          cy="26"
          r="25"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
        />
        <path
          className="onboarding-checkmark-check"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ─── Floating Input ──────────────────────────────────────────────────────────

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="onboarding-floating-input peer w-full rounded-xl border border-vytal-border bg-vytal-bg2 px-4 pb-2 pt-6 text-sm text-vytal-text outline-none transition-all duration-200 focus:border-vytal-green/50 focus:ring-2 focus:ring-vytal-green/20 focus:shadow-[0_0_20px_rgba(34,197,94,0.08)]"
      />
      <label className="onboarding-floating-label">{label}</label>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const updateOrgSettings = useDataStore((s) => s.updateOrgSettings);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const stepKey = useRef(0);

  // Step 1
  const [selectedType, setSelectedType] = useState<OrganizationType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Step 2
  const [details, setDetails] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "PT",
    currency: "EUR",
    timezone: detectTimezone(),
  });
  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-detect timezone on mount
  useEffect(() => {
    setDetails((prev) => ({ ...prev, timezone: detectTimezone() }));
  }, []);

  const selectedConfig = useMemo<OrganizationTypeConfig | null>(() => {
    if (!selectedType) return null;
    return ORGANIZATION_TYPE_LIST.find((c) => c.type === selectedType) ?? null;
  }, [selectedType]);

  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return ORGANIZATION_TYPE_LIST;
    const q = searchQuery.toLowerCase();
    return ORGANIZATION_TYPE_LIST.filter(
      (c) =>
        t(`vertical.${c.type}`).toLowerCase().includes(q) ||
        t(`vertical.${c.type}.desc`).toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [searchQuery, t]);

  const featuresByCategory = useMemo(() => {
    if (!selectedConfig) return {};
    const result: Record<string, { key: string; label: string; enabled: boolean }[]> = {};
    for (const cat of CATEGORY_KEYS) {
      result[cat] = ALL_FEATURES.filter((f) => f.category === cat).map(
        (f) => ({
          key: f.key,
          label: f.label,
          enabled:
            selectedConfig.features[
              f.key as keyof typeof selectedConfig.features
            ] ?? false,
        })
      );
    }
    return result;
  }, [selectedConfig]);

  function updateDetail(field: string, value: string) {
    setDetails((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !slugEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  function canProceed(): boolean {
    if (step === 1) return selectedType !== null;
    if (step === 2)
      return details.name.trim() !== "" && details.email.trim() !== "";
    return true;
  }

  function handleNext() {
    if (step < 3) {
      setDirection("forward");
      stepKey.current += 1;
      setStep(step + 1);
    } else {
      setLoading(true);
      // Persist onboarding data to the data store
      updateOrgSettings({
        name: details.name,
        slug: details.slug,
        email: details.email,
        phone: details.phone,
        currency: details.currency,
        timezone: details.timezone,
        country: details.country,
        address: details.address,
        city: details.city,
        zipCode: details.zipCode,
        businessType: selectedType ?? undefined,
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    }
  }

  function handleBack() {
    if (step > 1) {
      setDirection("backward");
      stepKey.current += 1;
      setStep(step - 1);
    }
  }

  const progressPercent = ((step - 1) / 2) * 100;

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* ── Outer card ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-vytal-border bg-vytal-card backdrop-blur-xl">
        {/* Animated gradient accent at top */}
        <div className="absolute inset-x-0 top-0 h-1 animate-onboarding-gradient bg-gradient-to-r from-vytal-green via-vytal-blue to-vytal-green" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-10">
          {/* ── Header ──────────────────────────────────────────── */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-vytal-green sm:text-4xl">
              VYTAL
            </h1>
            <p className="mt-2 text-sm text-vytal-muted">
              {t("onboarding.setupSteps")}
            </p>
          </div>

          {/* ── Progress bar ────────────────────────────────────── */}
          <div className="mx-auto mb-10 max-w-md">
            {/* Step labels */}
            <div className="mb-3 flex items-center justify-between">
              {STEP_LABELS.map((labelKey, i) => {
                const stepNum = i + 1;
                const isActive = step >= stepNum;
                const isCurrent = step === stepNum;
                return (
                  <div
                    key={labelKey}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-500",
                        stepNum < step
                          ? "bg-vytal-green text-vytal-bg shadow-[0_0_16px_rgba(34,197,94,0.3)]"
                          : isCurrent
                            ? "bg-vytal-green/20 text-vytal-green ring-2 ring-vytal-green/40 animate-onboarding-progress-glow"
                            : "bg-vytal-bg3 text-vytal-muted"
                      )}
                    >
                      {stepNum < step ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-medium transition-colors duration-300",
                        isActive ? "text-vytal-green" : "text-vytal-muted"
                      )}
                    >
                      {t(labelKey)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bar */}
            <div className="relative h-1.5 overflow-hidden rounded-full bg-vytal-bg3">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-vytal-green to-vytal-blue transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* ── Step content ─────────────────────────────────────── */}
          <div key={stepKey.current} className="onboarding-step-enter">
            {/* ════════════════════════════════════════════════════ */}
            {/* STEP 1: Choose your space                          */}
            {/* ════════════════════════════════════════════════════ */}
            {step === 1 && (
              <div>
                <h2 className="mb-1 text-center text-xl font-bold text-vytal-text sm:text-2xl">
                  {t("onboarding.step1Title")}
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-center text-sm text-vytal-muted">
                  {t("onboarding.step1Subtitle")}
                </p>

                {/* Search bar */}
                <div className="relative mx-auto mb-8 max-w-md">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("onboarding.searchPlaceholder")}
                    className="w-full rounded-xl border border-vytal-border bg-vytal-bg2 py-3 pl-11 pr-10 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-all duration-200 focus:border-vytal-green/40 focus:ring-2 focus:ring-vytal-green/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-vytal-muted transition-colors hover:text-vytal-text"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Type grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filteredTypes.map((config, i) => {
                    const isSelected = selectedType === config.type;
                    const emoji = EMOJI_MAP[config.type] ?? "\u2795";
                    return (
                      <button
                        key={config.type}
                        type="button"
                        onClick={() => setSelectedType(config.type)}
                        style={{ animationDelay: `${i * 30}ms` }}
                        className={cn(
                          "animate-onboarding-scale-in group relative flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-all duration-300",
                          "hover:scale-[1.04] hover:border-vytal-green/40 hover:shadow-[0_0_24px_rgba(34,197,94,0.08)]",
                          isSelected
                            ? "border-vytal-green bg-vytal-green/[0.08] shadow-[0_0_30px_rgba(34,197,94,0.15)] scale-[1.03]"
                            : "border-vytal-border bg-vytal-bg2 hover:bg-vytal-bg3"
                        )}
                      >
                        {/* Checkmark overlay */}
                        {isSelected && (
                          <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-vytal-green text-vytal-bg">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </div>
                        )}

                        {/* Emoji */}
                        <span
                          className={cn(
                            "text-[40px] leading-none transition-transform duration-300",
                            isSelected && "scale-110"
                          )}
                        >
                          {emoji}
                        </span>

                        {/* Label */}
                        <span
                          className={cn(
                            "text-xs font-bold tracking-wide transition-colors duration-200",
                            isSelected
                              ? "text-vytal-green"
                              : "text-vytal-text"
                          )}
                        >
                          {t(`vertical.${config.type}`)}
                        </span>

                        {/* Description */}
                        <span className="line-clamp-1 text-[10px] leading-tight text-vytal-muted">
                          {t(`vertical.${config.type}.desc`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* STEP 2: Space details                              */}
            {/* ════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div>
                <h2 className="mb-1 text-center text-xl font-bold text-vytal-text sm:text-2xl">
                  {t("onboarding.step2Title")}
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-center text-sm text-vytal-muted">
                  {t("onboarding.step2Subtitle")}{" "}
                  {selectedConfig?.terminology.organization.toLowerCase() ??
                    "space"}
                </p>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                  {/* ── Form (left) ────────────────────────────── */}
                  <div className="space-y-4 lg:col-span-3">
                    {/* Name */}
                    <FloatingInput
                      label={t("onboarding.fieldName")}
                      value={details.name}
                      onChange={(v) => updateDetail("name", v)}
                      required
                    />

                    {/* Slug */}
                    <div className="relative">
                      <div className="flex items-stretch">
                        <span className="flex items-center rounded-l-xl border border-r-0 border-vytal-border bg-vytal-bg3 px-3 text-xs font-medium text-vytal-muted">
                          vytal.fit/
                        </span>
                        <input
                          type="text"
                          value={details.slug}
                          onChange={(e) => {
                            setSlugEdited(true);
                            setDetails((prev) => ({
                              ...prev,
                              slug: slugify(e.target.value),
                            }));
                          }}
                          className="w-full rounded-r-xl border border-vytal-border bg-vytal-bg2 px-4 py-3.5 text-sm text-vytal-text outline-none transition-all duration-200 focus:border-vytal-green/50 focus:ring-2 focus:ring-vytal-green/20"
                        />
                      </div>
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FloatingInput
                        label={t("onboarding.fieldEmail")}
                        value={details.email}
                        onChange={(v) => updateDetail("email", v)}
                        type="email"
                        required
                      />
                      <FloatingInput
                        label={t("onboarding.fieldPhone")}
                        value={details.phone}
                        onChange={(v) => updateDetail("phone", v)}
                        type="tel"
                      />
                    </div>

                    {/* Address */}
                    <FloatingInput
                      label={t("onboarding.fieldAddress")}
                      value={details.address}
                      onChange={(v) => updateDetail("address", v)}
                    />

                    {/* City + Zip */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FloatingInput
                        label={t("onboarding.fieldCity")}
                        value={details.city}
                        onChange={(v) => updateDetail("city", v)}
                      />
                      <FloatingInput
                        label={t("onboarding.fieldZipCode")}
                        value={details.zipCode}
                        onChange={(v) => updateDetail("zipCode", v)}
                      />
                    </div>

                    {/* Country + Currency */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">
                          {t("onboarding.fieldCountry")}
                        </label>
                        <select
                          value={details.country}
                          onChange={(e) =>
                            updateDetail("country", e.target.value)
                          }
                          className="w-full appearance-none rounded-xl border border-vytal-border bg-vytal-bg2 px-4 py-3.5 text-sm text-vytal-text outline-none transition-all duration-200 focus:border-vytal-green/50 focus:ring-2 focus:ring-vytal-green/20"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">
                          {t("onboarding.fieldCurrency")}
                        </label>
                        <select
                          value={details.currency}
                          onChange={(e) =>
                            updateDetail("currency", e.target.value)
                          }
                          className="w-full appearance-none rounded-xl border border-vytal-border bg-vytal-bg2 px-4 py-3.5 text-sm text-vytal-text outline-none transition-all duration-200 focus:border-vytal-green/50 focus:ring-2 focus:ring-vytal-green/20"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Timezone (auto-detected) */}
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">
                        {t("onboarding.fieldTimezone")}
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-vytal-border bg-vytal-bg2 px-4 py-3.5">
                        <Globe className="h-4 w-4 text-vytal-muted" />
                        <span className="text-sm text-vytal-text">
                          {details.timezone}
                        </span>
                        <span className="ml-auto text-[10px] text-vytal-muted">
                          auto
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Live preview (right) ───────────────────── */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-6 rounded-2xl border border-vytal-border bg-vytal-bg2 p-6">
                      <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-widest text-vytal-muted">
                        {t("onboarding.livePreviewLabel")}
                      </p>

                      {/* Logo placeholder */}
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-vytal-green/20 to-vytal-green/5 text-3xl font-bold text-vytal-green animate-onboarding-float">
                        {details.name
                          ? details.name.charAt(0).toUpperCase()
                          : "?"}
                      </div>

                      {/* Space name */}
                      <h3 className="mb-1 text-center text-lg font-bold text-vytal-text">
                        {details.name || t("onboarding.noName")}
                      </h3>

                      {/* Type badge */}
                      {selectedConfig && (
                        <div className="mb-4 flex justify-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-vytal-green/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-vytal-green">
                            <span>{EMOJI_MAP[selectedConfig.type]}</span>
                            {t(`vertical.${selectedConfig.type}`)}
                          </span>
                        </div>
                      )}

                      {/* Details preview */}
                      <div className="space-y-2.5 border-t border-vytal-border pt-4">
                        {details.slug && (
                          <div className="flex items-center gap-2 text-xs text-vytal-muted">
                            <Globe className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              vytal.fit/{details.slug}
                            </span>
                          </div>
                        )}
                        {details.email && (
                          <div className="flex items-center gap-2 text-xs text-vytal-muted">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{details.email}</span>
                          </div>
                        )}
                        {details.phone && (
                          <div className="flex items-center gap-2 text-xs text-vytal-muted">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{details.phone}</span>
                          </div>
                        )}
                        {(details.address || details.city) && (
                          <div className="flex items-center gap-2 text-xs text-vytal-muted">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {[details.address, details.city, details.zipCode]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* STEP 3: Ready!                                     */}
            {/* ════════════════════════════════════════════════════ */}
            {step === 3 && selectedConfig && (
              <div className="relative">
                <Confetti />

                {/* Animated checkmark */}
                <AnimatedCheckmark />

                <h2 className="mb-1 text-center text-2xl font-bold text-vytal-text sm:text-3xl">
                  {t("onboarding.step3Title")}
                </h2>
                <p className="mx-auto mb-8 max-w-md text-center text-sm text-vytal-muted">
                  {t("onboarding.step3Subtitle")}
                </p>

                {/* Space card preview */}
                <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-vytal-border bg-vytal-bg2 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-vytal-green/20 to-vytal-green/5 text-2xl font-bold text-vytal-green">
                      {details.name
                        ? details.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-vytal-text truncate">
                          {details.name || t("onboarding.noName")}
                        </h3>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-vytal-green/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-vytal-green">
                          {EMOJI_MAP[selectedConfig.type]}{" "}
                          {t(`vertical.${selectedConfig.type}`)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-vytal-muted truncate">
                        {details.email}
                      </p>
                      {details.slug && (
                        <p className="mt-0.5 text-xs text-vytal-muted">
                          vytal.fit/{details.slug}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terminology preview */}
                <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-vytal-green/20 bg-vytal-green/[0.04] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-vytal-green" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-vytal-green">
                      {t("onboarding.terminologyPreview")}
                    </span>
                  </div>
                  <p className="text-sm text-vytal-text">
                    {t("onboarding.terminologySentence")
                      .replace(
                        "{members}",
                        selectedConfig.terminology.memberPlural.toLowerCase()
                      )
                      .replace(
                        "{sessions}",
                        selectedConfig.terminology.sessionPlural.toLowerCase()
                      )
                      .replace(
                        "{instructors}",
                        selectedConfig.terminology.instructorPlural.toLowerCase()
                      )
                      .split(
                        /(\b(?:athletes|students|members|clients|swimmers|dancers|players|climbers|riders|runners|gymnasts|patients|lifters|participants|classes|sessions|trainings|lessons|rides|practices|runs|appointments|coaches|instructors|trainers|pts|teachers|therapists|sensei)\b)/i
                      )
                      .map((part, idx) => {
                        const lower = part.toLowerCase();
                        const termLower = [
                          selectedConfig.terminology.memberPlural,
                          selectedConfig.terminology.sessionPlural,
                          selectedConfig.terminology.instructorPlural,
                        ].map((t) => t.toLowerCase());
                        if (termLower.includes(lower)) {
                          return (
                            <span
                              key={idx}
                              className="font-semibold text-vytal-green"
                            >
                              {part}
                            </span>
                          );
                        }
                        return part;
                      })}
                  </p>
                </div>

                {/* Feature list by category */}
                <div className="mx-auto mb-8 max-w-lg">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {CATEGORY_KEYS.map((cat) => {
                      const features = featuresByCategory[cat];
                      if (!features) return null;
                      return (
                        <div
                          key={cat}
                          className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4"
                        >
                          <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">
                            {t(CATEGORY_I18N[cat])}
                          </h4>
                          <div className="space-y-1.5">
                            {features.map((f) => (
                              <div
                                key={f.key}
                                className="flex items-center gap-2"
                              >
                                {f.enabled ? (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-vytal-green/15">
                                    <Check className="h-2.5 w-2.5 text-vytal-green" />
                                  </div>
                                ) : (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-vytal-bg3">
                                    <X className="h-2.5 w-2.5 text-vytal-muted/40" />
                                  </div>
                                )}
                                <span
                                  className={cn(
                                    "text-xs",
                                    f.enabled
                                      ? "text-vytal-text"
                                      : "text-vytal-muted/50 line-through"
                                  )}
                                >
                                  {f.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats teaser */}
                <div className="mx-auto mb-2 max-w-lg text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-vytal-bg2 border border-vytal-border px-4 py-2">
                    <Zap className="h-3.5 w-3.5 text-vytal-amber" />
                    <span className="text-xs text-vytal-muted">
                      {t("onboarding.joinTeaser")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation buttons ──────────────────────────────── */}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200",
                step === 1
                  ? "cursor-not-allowed text-vytal-muted/30"
                  : "text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("onboarding.back")}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={cn(
                "flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all duration-300",
                step === 3
                  ? "bg-gradient-to-r from-vytal-green to-vytal-green/80 text-vytal-bg shadow-[0_0_30px_rgba(34,197,94,0.25)] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:scale-[1.03]"
                  : canProceed()
                    ? "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    : "cursor-not-allowed bg-vytal-bg3 text-vytal-muted"
              )}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
              ) : step === 3 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t("onboarding.getStarted")}
                </>
              ) : (
                <>
                  {t("onboarding.next")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
