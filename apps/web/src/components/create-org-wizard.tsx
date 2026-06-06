"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Check, X, ArrowLeft } from "lucide-react";
import {
  ORGANIZATION_TYPE_LIST,
  type OrganizationType,
  type OrganizationTypeConfig,
  type OrganizationFeatures,
} from "@vytal-fit/shared";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ---- Types ----

export interface CreateOrgData {
  name: string;
  type: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  currency: string;
  timezone: string;
  features?: OrganizationFeatures;
}

export interface CreateOrgWizardProps {
  onComplete: (orgData: CreateOrgData) => void;
  onCancel: () => void;
  isModal?: boolean;
}

// ---- Emoji map ----

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

// ---- Feature groups for onboarding ----

interface FeatureGroup {
  titleKey: string;
  keys: Array<keyof OrganizationFeatures>;
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    titleKey: "onboarding.categoryTraining",
    keys: ["groupClasses", "wods", "personalTraining", "openGym", "movementLibrary", "personalRecords", "leaderboard", "rxScaled", "timers", "rmCalculator"],
  },
  {
    titleKey: "onboarding.categoryCommunity",
    keys: ["gamification", "fistbumps", "dropins", "beltSystem"],
  },
  {
    titleKey: "onboarding.categoryHealth",
    keys: ["nutritionTracking", "bodyComposition"],
  },
  {
    titleKey: "onboarding.categoryOperations",
    keys: ["financials", "payroll", "crm", "reports", "store", "communications", "automations", "tasks", "support", "marketing", "tvDisplay"],
  },
];

// Required features that can't be disabled
const REQUIRED_FEATURES: Set<keyof OrganizationFeatures> = new Set(["financials", "reports", "communications"]);

// ---- Constants ----

const TOP_TYPES = [
  "crossfit_box",
  "functional_training",
  "gym",
  "yoga_studio",
  "pilates_studio",
  "martial_arts",
  "personal_training",
  "bootcamp",
];

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

// ---- Helpers ----

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

// ---- Step wrapper with fade transition ----

function StepWrapper({
  children,
  stepKey,
}: {
  children: React.ReactNode;
  stepKey: number;
}) {
  return (
    <div key={stepKey} className="wizard-step-fade">
      {children}
    </div>
  );
}

// ---- Main Component ----

export function CreateOrgWizard({
  onComplete,
  onCancel,
  isModal,
}: CreateOrgWizardProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const stepKey = useRef(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Step 1
  const [selectedType, setSelectedType] = useState<OrganizationType | null>(
    null,
  );
  const [typeSearch, setTypeSearch] = useState("");

  // Step 2
  const [details, setDetails] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    country: "PT",
    currency: "EUR",
    timezone: detectTimezone(),
  });
  const [slugEdited, setSlugEdited] = useState(false);

  // Step 3 — feature toggles
  const [features, setFeatures] = useState<OrganizationFeatures | null>(null);

  const toggleFeature = useCallback((key: keyof OrganizationFeatures) => {
    setFeatures((prev) => prev ? { ...prev, [key]: !prev[key] } : prev);
  }, []);

  useEffect(() => {
    setDetails((prev) => ({ ...prev, timezone: detectTimezone() }));
  }, []);

  // Auto-focus name input on step 2
  useEffect(() => {
    if (step === 2) {
      // Small delay for transition
      const timer = setTimeout(() => nameInputRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const selectedConfig = useMemo<OrganizationTypeConfig | null>(() => {
    if (!selectedType) return null;
    return ORGANIZATION_TYPE_LIST.find((c) => c.type === selectedType) ?? null;
  }, [selectedType]);

  // Initialize features from selected vertical
  useEffect(() => {
    if (selectedConfig) {
      setFeatures({ ...selectedConfig.features });
    }
  }, [selectedConfig]);

  const visibleTypes = useMemo(() => {
    if (!typeSearch.trim()) return ORGANIZATION_TYPE_LIST;
    const q = typeSearch.toLowerCase();
    return ORGANIZATION_TYPE_LIST.filter((c) =>
      t(`vertical.${c.type}`).toLowerCase().includes(q) || c.type.includes(q)
    );
  }, [typeSearch, t]);

  const updateDetail = useCallback(
    (field: string, value: string) => {
      setDetails((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "name" && !slugEdited) {
          next.slug = slugify(value);
        }
        return next;
      });
    },
    [slugEdited],
  );

  function canProceed(): boolean {
    if (step === 1) return selectedType !== null;
    if (step === 2) return details.name.trim() !== "" && details.email.trim() !== "";
    return true;
  }

  function handleNext() {
    if (step < 4) {
      stepKey.current += 1;
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        onComplete({
          name: details.name,
          type: selectedType ?? "other",
          slug: details.slug,
          email: details.email,
          phone: details.phone,
          address: "",
          city: "",
          zipCode: "",
          country: details.country,
          currency: details.currency,
          timezone: details.timezone,
          features: features ?? undefined,
        });
        setLoading(false);
      }, 400);
    }
  }

  function handleBack() {
    if (step > 1) {
      stepKey.current += 1;
      setStep(step - 1);
    }
  }

  const progressPercent = ((step - 1) / 3) * 100;

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-vytal-bg",
        isModal && "fixed inset-0 z-[60] overflow-y-auto",
      )}
    >
      {/* Progress bar — thin line at the very top */}
      <div className="fixed left-0 right-0 top-0 z-[70] h-[2px] bg-vytal-bg3">
        <div
          className="h-full bg-vytal-green transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top bar: Back + Close/Skip */}
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("onboarding.back")}
            </button>
          ) : (
            <div />
          )}
        </div>
        <div>
          {isModal ? (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-vytal-muted transition-colors hover:text-vytal-text"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Main content — centered */}
      <div className="flex flex-1 items-start justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <StepWrapper stepKey={stepKey.current}>
            {/* ── STEP 1: What do you manage? ── */}
            {step === 1 && (
              <div>
                <h1 className="text-center text-[28px] font-bold leading-tight text-vytal-text">
                  {t("onboarding.step1Title")}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-center text-sm text-vytal-muted">
                  {t("onboarding.step1Subtitle")}
                </p>

                {/* Search bar */}
                <div className="mt-6">
                  <input
                    type="text"
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    placeholder={t("ui.searchPlaceholder") || "Pesquisar..."}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none focus:border-vytal-green/40"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {visibleTypes.map((config) => {
                    const isSelected = selectedType === config.type;
                    const emoji = EMOJI_MAP[config.type] ?? "\u2795";
                    return (
                      <button
                        key={config.type}
                        type="button"
                        onClick={() => setSelectedType(config.type)}
                        className={cn(
                          "group relative flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all duration-200",
                          "hover:-translate-y-0.5 hover:border-vytal-green/30",
                          isSelected
                            ? "border-vytal-green bg-vytal-green/[0.06]"
                            : "border-vytal-border bg-vytal-bg2",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-vytal-green text-vytal-bg">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </div>
                        )}
                        <span className="text-2xl leading-none">{emoji}</span>
                        <span
                          className={cn(
                            "text-xs font-medium transition-colors",
                            isSelected
                              ? "text-vytal-green"
                              : "text-vytal-text",
                          )}
                        >
                          {t(`vertical.${config.type}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {visibleTypes.length === 0 && (
                  <p className="mt-4 text-center text-sm text-vytal-muted">
                    {t("ui.noData")}
                  </p>
                )}

                {/* Continue button */}
                <div className="mt-10 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={cn(
                      "rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200",
                      canProceed()
                        ? "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90"
                        : "cursor-not-allowed bg-vytal-bg3 text-vytal-muted",
                    )}
                  >
                    {t("onboarding.next")}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Set up your space ── */}
            {step === 2 && (
              <div>
                <h1 className="text-center text-[28px] font-bold leading-tight text-vytal-text">
                  {t("onboarding.step2Title")}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-center text-sm text-vytal-muted">
                  {t("onboarding.step2Subtitle")}{" "}
                  {selectedConfig?.terminology.organization.toLowerCase() ??
                    "space"}
                </p>

                <div className="mx-auto mt-10 max-w-lg space-y-5">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">
                      {t("onboarding.fieldName")}
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={details.name}
                      onChange={(e) => updateDetail("name", e.target.value)}
                      placeholder={t("onboarding.fieldNamePlaceholder")}
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-base text-vytal-text placeholder:text-vytal-muted/40 outline-none transition-colors focus:border-vytal-green/50"
                    />
                    {details.slug && (
                      <p className="mt-1.5 text-xs text-vytal-muted">
                        vytal.fit/
                        <span className="text-vytal-text">{details.slug}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">
                      {t("onboarding.fieldEmail")}
                    </label>
                    <input
                      type="email"
                      value={details.email}
                      onChange={(e) => updateDetail("email", e.target.value)}
                      placeholder={t("onboarding.fieldEmailPlaceholder")}
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-base text-vytal-text placeholder:text-vytal-muted/40 outline-none transition-colors focus:border-vytal-green/50"
                    />
                  </div>

                  {/* Phone (optional) */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">
                      {t("onboarding.fieldPhone")}{" "}
                      <span className="font-normal text-vytal-muted/60">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={details.phone}
                      onChange={(e) => updateDetail("phone", e.target.value)}
                      placeholder={t("onboarding.fieldPhonePlaceholder")}
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-base text-vytal-text placeholder:text-vytal-muted/40 outline-none transition-colors focus:border-vytal-green/50"
                    />
                  </div>

                  {/* Country + Currency row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-vytal-muted">
                        {t("onboarding.fieldCountry")}
                      </label>
                      <select
                        value={details.country}
                        onChange={(e) =>
                          updateDetail("country", e.target.value)
                        }
                        className="w-full appearance-none rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text outline-none transition-colors focus:border-vytal-green/50"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-vytal-muted">
                        {t("onboarding.fieldCurrency")}
                      </label>
                      <select
                        value={details.currency}
                        onChange={(e) =>
                          updateDetail("currency", e.target.value)
                        }
                        className="w-full appearance-none rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text outline-none transition-colors focus:border-vytal-green/50"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Continue button */}
                <div className="mx-auto mt-10 flex max-w-lg justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={cn(
                      "rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200",
                      canProceed()
                        ? "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90"
                        : "cursor-not-allowed bg-vytal-bg3 text-vytal-muted",
                    )}
                  >
                    {t("onboarding.next")}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Feature Configuration ── */}
            {step === 3 && selectedConfig && features && (
              <div>
                <h1 className="text-center text-[28px] font-bold leading-tight text-vytal-text">
                  {t("onboarding.step3FeaturesTitle")}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-center text-sm text-vytal-muted">
                  {t("onboarding.step3FeaturesSubtitle")}
                </p>

                <div className="mx-auto mt-8 max-w-lg space-y-6">
                  {FEATURE_GROUPS.map((group) => {
                    const groupFeatures = group.keys.filter((k) => k in features);
                    const allOn = groupFeatures.every((k) => features[k]);
                    const someOn = groupFeatures.some((k) => features[k]);

                    return (
                      <div key={group.titleKey} className="rounded-xl border border-vytal-border bg-vytal-bg2 overflow-hidden">
                        {/* Group header with toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = !allOn;
                            setFeatures((prev) => {
                              if (!prev) return prev;
                              const next = { ...prev };
                              groupFeatures.forEach((k) => { next[k] = newVal; });
                              return next;
                            });
                          }}
                          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-vytal-bg3/50"
                        >
                          <span className="text-xs font-bold uppercase tracking-wider text-vytal-muted">
                            {t(group.titleKey)}
                          </span>
                          <div
                            className={cn(
                              "relative h-5 w-9 rounded-full transition-colors",
                              allOn ? "bg-vytal-green" : someOn ? "bg-vytal-green/40" : "bg-vytal-muted/30",
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                                allOn ? "left-[18px]" : "left-0.5",
                              )}
                            />
                          </div>
                        </button>

                        {/* Individual features */}
                        <div className="border-t border-vytal-border/50">
                          {groupFeatures.map((key) => {
                            const isOn = features[key];
                            const isDefault = selectedConfig.features[key];
                            const isRequired = REQUIRED_FEATURES.has(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => !isRequired && toggleFeature(key)}
                                disabled={isRequired}
                                className={cn(
                                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                                  isRequired ? "cursor-default" : "hover:bg-vytal-bg3/30",
                                  !isOn && !isRequired && "opacity-50",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                                    isOn
                                      ? "border-vytal-green bg-vytal-green"
                                      : "border-vytal-muted/40 bg-transparent",
                                  )}
                                >
                                  {isOn && <Check className="h-2.5 w-2.5 text-vytal-bg" strokeWidth={3} />}
                                </div>
                                <span className="text-sm text-vytal-text">
                                  {t(`feature.${key}`)}
                                </span>
                                {isRequired && (
                                  <span className="rounded-full bg-vytal-muted/10 px-1.5 py-0.5 text-[8px] font-bold text-vytal-muted">
                                    {t("onboarding.required")}
                                  </span>
                                )}
                                {!isRequired && isOn !== isDefault && (
                                  <span className="rounded-full bg-vytal-amber/10 px-1.5 py-0.5 text-[8px] font-bold text-vytal-amber">
                                    {t("onboarding.customized")}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="mx-auto mt-4 flex max-w-lg items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFeatures((prev) => {
                          if (!prev) return prev;
                          const next = { ...prev };
                          (Object.keys(next) as Array<keyof OrganizationFeatures>).forEach((k) => { next[k] = true; });
                          return next;
                        });
                      }}
                      className="text-xs text-vytal-muted transition-colors hover:text-vytal-green"
                    >
                      {t("onboarding.enableAll")}
                    </button>
                    <span className="text-vytal-border">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFeatures((prev) => {
                          if (!prev) return prev;
                          const next = { ...prev };
                          (Object.keys(next) as Array<keyof OrganizationFeatures>).forEach((k) => {
                            next[k] = REQUIRED_FEATURES.has(k) ? true : false;
                          });
                          return next;
                        });
                      }}
                      className="text-xs text-vytal-muted transition-colors hover:text-vytal-red"
                    >
                      {t("onboarding.disableAll")}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatures({ ...selectedConfig.features })}
                    className="text-xs text-vytal-muted transition-colors hover:text-vytal-green"
                  >
                    {t("onboarding.resetDefaults")}
                  </button>
                </div>

                {/* Continue button */}
                <div className="mx-auto mt-8 flex max-w-lg justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-all duration-200 hover:bg-vytal-green/90"
                  >
                    {t("onboarding.next")}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: You're ready ── */}
            {step === 4 && selectedConfig && (
              <div className="text-center">
                {/* Simple green checkmark */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-vytal-green/30 bg-vytal-green/10">
                  <Check
                    className="h-8 w-8 text-vytal-green"
                    strokeWidth={2.5}
                  />
                </div>

                <h1 className="text-[28px] font-bold leading-tight text-vytal-text">
                  {t("onboarding.step3Title")}
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm text-vytal-muted">
                  {details.name && (
                    <>
                      <span className="font-medium text-vytal-text">
                        {details.name}
                      </span>{" "}
                      {t("onboarding.step3Subtitle")
                        .replace("Everything is set up. ", "")
                        .replace("Tudo configurado. ", "")
                        .replace("Todo configurado. ", "")}
                    </>
                  )}
                </p>

                {/* Terminology preview */}
                <div className="mx-auto mt-8 max-w-sm rounded-lg border border-vytal-border bg-vytal-bg2 p-4">
                  <p className="text-sm text-vytal-muted">
                    {t("onboarding.terminologySentence")
                      .replace(
                        "{members}",
                        selectedConfig.terminology.memberPlural.toLowerCase(),
                      )
                      .replace(
                        "{sessions}",
                        selectedConfig.terminology.sessionPlural.toLowerCase(),
                      )
                      .replace(
                        "{instructors}",
                        selectedConfig.terminology.instructorPlural.toLowerCase(),
                      )
                      .split(
                        /(\b(?:athletes|students|members|clients|swimmers|dancers|players|climbers|riders|runners|gymnasts|patients|lifters|participants|classes|sessions|trainings|lessons|rides|practices|runs|appointments|coaches|instructors|trainers|pts|teachers|therapists|sensei|atletas|alunos|membros|clientes|nadadores|dan\u00e7arinos|jogadores|escaladores|ciclistas|corredores|ginastas|pacientes|levantadores|participantes|aulas|sess\u00f5es|treinos|li\u00e7\u00f5es|pr\u00e1ticas|corridas|consultas|treinadores|instrutores|professores|fisioterapeutas)\b)/i,
                      )
                      .map((part, idx) => {
                        const lower = part.toLowerCase();
                        const termLower = [
                          selectedConfig.terminology.memberPlural,
                          selectedConfig.terminology.sessionPlural,
                          selectedConfig.terminology.instructorPlural,
                        ].map((tm) => tm.toLowerCase());
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

                {/* Go to Dashboard */}
                <div className="mt-10">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="rounded-lg bg-vytal-green px-8 py-3 text-sm font-semibold text-vytal-bg transition-all duration-200 hover:bg-vytal-green/90"
                  >
                    {loading ? (
                      <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
                    ) : (
                      t("onboarding.getStarted")
                    )}
                  </button>
                </div>
              </div>
            )}
          </StepWrapper>
        </div>
      </div>
    </div>
  );
}
