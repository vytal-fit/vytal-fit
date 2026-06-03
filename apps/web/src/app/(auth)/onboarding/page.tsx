"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Dumbbell,
  Building,
  Leaf,
  CircleDot,
  Shield,
  User,
  Waves,
  Music,
  HeartPulse,
  Trophy,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import {
  ORGANIZATION_TYPE_LIST,
  type OrganizationType,
  type OrganizationTypeConfig,
} from "@vytal-fit/shared";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  dumbbell: Dumbbell,
  building: Building,
  leaf: Leaf,
  "circle-dot": CircleDot,
  shield: Shield,
  user: User,
  waves: Waves,
  music: Music,
  "heart-pulse": HeartPulse,
  trophy: Trophy,
  "plus-circle": PlusCircle,
};

const COUNTRIES = [
  { code: "PT", label: "Portugal" },
  { code: "BR", label: "Brasil" },
  { code: "ES", label: "Espanha" },
  { code: "US", label: "Estados Unidos" },
  { code: "GB", label: "Reino Unido" },
  { code: "FR", label: "Franca" },
  { code: "DE", label: "Alemanha" },
  { code: "IT", label: "Italia" },
  { code: "NL", label: "Paises Baixos" },
  { code: "OTHER", label: "Outro" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Organization type
  const [selectedType, setSelectedType] = useState<OrganizationType | null>(
    null
  );

  // Step 2: Space details
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
    timezone: "Europe/Lisbon",
  });
  const [slugEdited, setSlugEdited] = useState(false);

  const selectedConfig = useMemo<OrganizationTypeConfig | null>(() => {
    if (!selectedType) return null;
    return (
      ORGANIZATION_TYPE_LIST.find((c) => c.type === selectedType) ?? null
    );
  }, [selectedType]);

  const enabledFeatures = useMemo(() => {
    if (!selectedConfig) return [];
    return Object.entries(selectedConfig.features)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }, [selectedConfig]);

  const featureLabels: Record<string, string> = {
    wods: "WODs",
    leaderboard: "Leaderboard",
    personalRecords: "Personal Records",
    rxScaled: "Rx/Scaled",
    timers: "Timers",
    rmCalculator: "RM Calculator",
    gamification: "Gamification",
    fistbumps: "Fistbumps",
    dropins: "Drop-ins",
    tvDisplay: "TV Display",
    movementLibrary: "Movement Library",
    beltSystem: "Belt System",
    personalTraining: "Personal Training",
    nutritionTracking: "Nutrition",
    bodyComposition: "Body Composition",
    groupClasses: "Group Classes",
    openGym: "Open Gym",
    store: "Store",
  };

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
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-vytal-green">
            VYTAL
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Configure o seu espaco em 3 passos
          </p>
        </div>

        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  s < step
                    ? "bg-vytal-green text-vytal-bg"
                    : s === step
                      ? "bg-vytal-green/20 text-vytal-green ring-2 ring-vytal-green/40"
                      : "bg-vytal-bg3 text-vytal-muted"
                )}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "h-0.5 w-12 rounded-full transition-colors duration-300",
                    s < step ? "bg-vytal-green" : "bg-vytal-bg3"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose type */}
        {step === 1 && (
          <div>
            <h2 className="mb-1 text-center text-lg font-semibold text-vytal-text">
              Escolha o tipo do seu espaco
            </h2>
            <p className="mb-6 text-center text-sm text-vytal-muted">
              Isto define a terminologia, funcionalidades e experiencia da app
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {ORGANIZATION_TYPE_LIST.map((config) => {
                const Icon = ICON_MAP[config.icon] ?? PlusCircle;
                const isSelected = selectedType === config.type;
                return (
                  <button
                    key={config.type}
                    type="button"
                    onClick={() => setSelectedType(config.type)}
                    className={cn(
                      "group flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 hover:scale-[1.03] hover:border-vytal-green/40",
                      isSelected
                        ? "border-vytal-green bg-vytal-green/[0.08] shadow-[0_0_20px_rgba(61,255,110,0.12)]"
                        : "border-vytal-border bg-vytal-bg2 hover:bg-vytal-bg3"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                        isSelected
                          ? "bg-vytal-green/20 text-vytal-green"
                          : "bg-vytal-bg3 text-vytal-muted group-hover:text-vytal-text"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold transition-colors",
                        isSelected
                          ? "text-vytal-green"
                          : "text-vytal-text"
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-[10px] leading-tight text-vytal-muted line-clamp-2">
                      {config.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Space details */}
        {step === 2 && (
          <div>
            <h2 className="mb-1 text-center text-lg font-semibold text-vytal-text">
              Detalhes do seu espaco
            </h2>
            <p className="mb-6 text-center text-sm text-vytal-muted">
              Informacoes basicas sobre o seu{" "}
              {selectedConfig?.terminology.organization.toLowerCase() ??
                "espaco"}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={details.name}
                  onChange={(e) => updateDetail("name", e.target.value)}
                  placeholder={`Ex: CrossFit Aveiro`}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>

              {/* Slug */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Slug{" "}
                  <span className="normal-case tracking-normal text-vytal-muted/60">
                    (URL do espaco)
                  </span>
                </label>
                <div className="flex items-center gap-0">
                  <span className="rounded-l-lg border border-r-0 border-vytal-border bg-vytal-bg3 px-3 py-3 text-xs text-vytal-muted">
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
                    className="w-full rounded-r-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={details.email}
                  onChange={(e) => updateDetail("email", e.target.value)}
                  placeholder="info@seuespaco.pt"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={details.phone}
                  onChange={(e) => updateDetail("phone", e.target.value)}
                  placeholder="+351 234 567 890"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Morada
                </label>
                <input
                  type="text"
                  value={details.address}
                  onChange={(e) => updateDetail("address", e.target.value)}
                  placeholder="Rua Exemplo, 123"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>

              {/* City */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Cidade
                </label>
                <input
                  type="text"
                  value={details.city}
                  onChange={(e) => updateDetail("city", e.target.value)}
                  placeholder="Aveiro"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>

              {/* Zip Code */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Codigo Postal
                </label>
                <input
                  type="text"
                  value={details.zipCode}
                  onChange={(e) => updateDetail("zipCode", e.target.value)}
                  placeholder="3800-000"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>

              {/* Country */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Pais
                </label>
                <select
                  value={details.country}
                  onChange={(e) => updateDetail("country", e.target.value)}
                  className="w-full appearance-none rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Moeda
                </label>
                <select
                  value={details.currency}
                  onChange={(e) => updateDetail("currency", e.target.value)}
                  className="w-full appearance-none rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-text outline-none transition-colors focus:border-vytal-green/40 focus:ring-1 focus:ring-vytal-green/20"
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="BRL">BRL - Real</option>
                  <option value="USD">USD - Dolar</option>
                  <option value="GBP">GBP - Libra</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedConfig && (
          <div>
            <h2 className="mb-1 text-center text-lg font-semibold text-vytal-text">
              Tudo pronto!
            </h2>
            <p className="mb-6 text-center text-sm text-vytal-muted">
              Confirme os detalhes do seu espaco
            </p>

            {/* Summary card */}
            <div className="mb-6 rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
              <div className="flex items-start gap-4">
                {(() => {
                  const Icon = ICON_MAP[selectedConfig.icon] ?? PlusCircle;
                  return (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-vytal-green/15 text-vytal-green">
                      <Icon className="h-6 w-6" />
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-vytal-text">
                      {details.name || "Sem nome"}
                    </h3>
                    <span className="rounded-full bg-vytal-green/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-vytal-green">
                      {selectedConfig.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-vytal-muted">
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
            <div className="mb-6 rounded-xl border border-vytal-green/20 bg-vytal-green/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-vytal-green" />
                <span className="text-xs font-semibold uppercase tracking-wider text-vytal-green">
                  A sua experiencia personalizada
                </span>
              </div>
              <p className="text-sm text-vytal-text">
                Os seus{" "}
                <span className="font-semibold text-vytal-green">
                  {selectedConfig.terminology.memberPlural.toLowerCase()}
                </span>{" "}
                vao reservar{" "}
                <span className="font-semibold text-vytal-green">
                  {selectedConfig.terminology.sessionPlural.toLowerCase()}
                </span>{" "}
                com os seus{" "}
                <span className="font-semibold text-vytal-green">
                  {selectedConfig.terminology.instructorPlural.toLowerCase()}
                </span>
              </p>
            </div>

            {/* Feature badges */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                Funcionalidades ativas ({enabledFeatures.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {enabledFeatures.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 rounded-full border border-vytal-green/20 bg-vytal-green/[0.06] px-2.5 py-1 text-[11px] font-medium text-vytal-green"
                  >
                    <Check className="h-3 w-3" />
                    {featureLabels[f] ?? f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
              step === 1
                ? "cursor-not-allowed text-vytal-muted/40"
                : "text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className={cn(
              "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all",
              canProceed()
                ? "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90"
                : "cursor-not-allowed bg-vytal-bg3 text-vytal-muted"
            )}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
            ) : step === 3 ? (
              <>
                <Sparkles className="h-4 w-4" />
                Comecar
              </>
            ) : (
              <>
                Seguinte
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
