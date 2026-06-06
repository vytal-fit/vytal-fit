"use client";

import { useState, useCallback, useRef } from "react";
import {
  Globe,
  Save,
  ExternalLink,
  Star,
  Search,
  FileText,
  Palette,
  Server,
  CalendarDays,
  CreditCard,
  ShoppingBag,
  UserCircle2,
  Mail,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Copy,
  Check,
  Image,
  Sun,
  Moon,
  AlignLeft,
  LayoutDashboard,
  ShieldCheck,
  MapPin,
  MessageSquare,
  Info,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useDataStore } from "@/stores/data-store";
import type {
  WebsiteConfig,
  WebsiteTestimonial,
  WebsiteFaqEntry,
} from "@/stores/data-store";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "pages" | "design" | "domain" | "seo" | "content";

// ---------------------------------------------------------------------------
// Default website config
// ---------------------------------------------------------------------------

function defaultWebsiteConfig(orgSettings: {
  slogan: string;
  name: string;
  email: string;
}): WebsiteConfig {
  return {
    hero: {
      enabled: true,
      slogan: orgSettings.slogan || "",
      showCoverImage: true,
      ctaText: "Começar Agora",
      ctaLink: "/schedule",
      showStats: true,
      showQuickLinks: true,
    },
    about: {
      enabled: true,
      description: "",
      foundingYear: "",
    },
    schedule: {
      enabled: true,
      classTypeIds: [],
      showBookingButton: true,
      showOpeningHours: true,
      headerText: "",
    },
    pricing: {
      enabled: true,
      planIds: [],
      showComparisonTable: true,
      showFaq: true,
      faqEntries: [
        { question: "Existe contrato de fidelização?", answer: "Não, os nossos planos são mensais sem permanência." },
        { question: "Posso experimentar antes de me inscrever?", answer: "Sim, oferecemos uma aula experimental gratuita." },
      ],
    },
    shop: {
      enabled: false,
      showCategories: true,
      currencyFormat: "EUR",
      headerText: "",
    },
    team: {
      enabled: true,
      coachIds: [],
      showCertifications: true,
      showBio: true,
      headerText: "",
    },
    contact: {
      enabled: true,
      showForm: true,
      showMap: true,
      showOpeningHours: true,
      successMessage: "Mensagem enviada! Entraremos em contacto em breve.",
      submissionsEmail: orgSettings.email || "",
    },
    gallery: {
      enabled: false,
    },
    testimonials: {
      enabled: false,
      items: [
        { name: "", text: "", rating: 5 },
        { name: "", text: "", rating: 5 },
        { name: "", text: "", rating: 5 },
      ],
    },
    design: {
      theme: "dark",
      primaryColor: "#22c55e",
      logoFileName: "",
      faviconFileName: "",
      font: "Inter",
      borderRadius: 8,
      navStyle: "topbar",
      footerText: `© ${new Date().getFullYear()} ${orgSettings.name}. Todos os direitos reservados.`,
      showSocialLinks: true,
      showPoweredBy: true,
    },
    domain: {
      customDomain: "",
      wwwRedirect: true,
    },
    seo: {
      metaTitle: orgSettings.name || "",
      metaDescription: "",
      showOgImage: true,
      gaTrackingId: "",
      fbPixelId: "",
      allowIndexing: true,
      autoSitemap: true,
    },
    content: {
      aboutText: "",
      announcementBar: false,
      announcementText: "",
      announcementColor: "#22c55e",
      cookieConsent: true,
      cookieText: "Utilizamos cookies para melhorar a sua experiência. Ao continuar a navegar, aceita a nossa política de privacidade.",
      privacyPolicyUrl: "",
      termsUrl: "",
    },
    contactForm: {
      enabled: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Primitive components
// ---------------------------------------------------------------------------

function Toggle({
  enabled,
  onToggle,
  size = "md",
}: {
  enabled: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  const track = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const thumb = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const offset = size === "sm" ? "left-[18px]" : "left-[22px]";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative shrink-0 rounded-full transition-colors duration-300",
        track,
        enabled ? "bg-vytal-green" : "bg-vytal-bg3"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 rounded-full bg-white shadow-sm transition-all duration-300",
          thumb,
          enabled ? offset : "left-0.5"
        )}
      />
    </button>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-4 w-4",
              n <= value
                ? "fill-vytal-amber text-vytal-amber"
                : "text-vytal-muted/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-vytal-muted">
      {children}
    </label>
  );
}

function VInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className={cn(
        "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/60 focus:border-vytal-green/40 focus:outline-none focus:ring-1 focus:ring-vytal-green/20",
        readOnly && "cursor-default opacity-70 select-all",
        className
      )}
    />
  );
}

function VTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/60 focus:border-vytal-green/40 focus:outline-none focus:ring-1 focus:ring-vytal-green/20",
        className
      )}
    />
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-vytal-text">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-vytal-muted">{description}</p>
        )}
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

// Page card with expand/collapse
function PageCard({
  icon,
  title,
  description,
  enabled,
  alwaysEnabled,
  onToggle,
  children,
  defaultOpen,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  alwaysEnabled?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const isEnabled = alwaysEnabled ? true : enabled;

  return (
    <div
      className={cn(
        "rounded-xl border bg-vytal-card transition-all duration-200",
        isEnabled
          ? "border-vytal-border hover:border-vytal-border/80"
          : "border-vytal-border/40 opacity-60"
      )}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            isEnabled
              ? "bg-vytal-green/10 text-vytal-green"
              : "bg-vytal-bg3 text-vytal-muted"
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-vytal-text">{title}</span>
            {alwaysEnabled ? (
              <span className="rounded-full bg-vytal-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-vytal-green">
                Sempre ativa
              </span>
            ) : !enabled ? (
              <span className="rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                Inativa
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-vytal-muted">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!alwaysEnabled && (
            <Toggle enabled={enabled} onToggle={onToggle} size="sm" />
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            {open ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-vytal-border/40 px-5 py-5 space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}

// Checkboxes grid for selecting items (class types, plans, coaches)
function CheckboxGrid<T extends { id: string; name: string; color?: string }>({
  items,
  selectedIds,
  onToggle,
  emptyLabel,
  allLabel,
}: {
  items: T[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyLabel: string;
  allLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-vytal-muted">{emptyLabel}</p>;
  }
  const allSelected = selectedIds.length === 0;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-vytal-muted/70 mb-2">
        {allSelected ? allLabel : `${selectedIds.length} selecionado(s)`}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const selected = allSelected || selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                selected
                  ? "border-vytal-green/40 bg-vytal-green/10 text-vytal-green"
                  : "border-vytal-border bg-vytal-bg2 text-vytal-muted hover:border-vytal-border/80"
              )}
            >
              {item.color && (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Section divider inside a card
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-vytal-muted/60 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 border-t border-vytal-border/40" />
    </div>
  );
}

// Contained section card
function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-vytal-text">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-vytal-muted">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// File upload stub
function FileUploadField({
  label,
  description,
  fileName,
  onFileSelect,
}: {
  label: string;
  description?: string;
  fileName: string;
  onFileSelect: (name: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {description && (
        <p className="mb-2 text-[11px] text-vytal-muted">{description}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <Upload className="h-3.5 w-3.5" />
          Carregar
        </button>
        <span className="truncate text-xs text-vytal-muted">
          {fileName || "Nenhum ficheiro selecionado"}
        </span>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file.name);
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Pages
// ---------------------------------------------------------------------------

function PagesTab({
  config,
  setConfig,
  classTypes,
  plans,
  coaches,
  t,
}: {
  config: WebsiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
  classTypes: { id: string; name: string; color: string }[];
  plans: { id: string; name: string; price: number; active: boolean }[];
  coaches: { id: string; name: string }[];
  t: (k: string) => string;
}) {
  const updateSection = useCallback(
    <S extends keyof WebsiteConfig>(
      section: S,
      partial: Partial<WebsiteConfig[S]>
    ) => {
      setConfig((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...partial },
      }));
    },
    [setConfig]
  );

  const toggleId = useCallback(
    (
      section: "schedule" | "pricing" | "team",
      field: string,
      id: string
    ) => {
      setConfig((prev) => {
        const sec = prev[section] as Record<string, unknown>;
        const current = (sec[field] as string[]) ?? [];
        const next = current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id];
        return {
          ...prev,
          [section]: { ...prev[section], [field]: next },
        };
      });
    },
    [setConfig]
  );

  const addFaq = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        faqEntries: [
          ...prev.pricing.faqEntries,
          { question: "", answer: "" },
        ],
      },
    }));
  }, [setConfig]);

  const updateFaq = useCallback(
    (index: number, partial: Partial<WebsiteFaqEntry>) => {
      setConfig((prev) => {
        const entries = prev.pricing.faqEntries.map((e, i) =>
          i === index ? { ...e, ...partial } : e
        );
        return { ...prev, pricing: { ...prev.pricing, faqEntries: entries } };
      });
    },
    [setConfig]
  );

  const removeFaq = useCallback(
    (index: number) => {
      setConfig((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          faqEntries: prev.pricing.faqEntries.filter((_, i) => i !== index),
        },
      }));
    },
    [setConfig]
  );

  const activePlans = plans.filter((p) => p.active);
  const coachItems = coaches.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-4">
      {/* Home */}
      <PageCard
        icon={<LayoutDashboard className="h-4 w-4" />}
        title={t("website.pages.home")}
        description={t("website.pages.home.desc")}
        enabled={config.hero.enabled}
        alwaysEnabled
        onToggle={() => {}}
        defaultOpen
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>{t("website.hero.slogan")}</FieldLabel>
            <VInput
              value={config.hero.slogan}
              onChange={(v) => updateSection("hero", { slogan: v })}
              placeholder={t("website.hero.sloganPlaceholder")}
            />
          </div>
          <div>
            <FieldLabel>{t("website.hero.ctaText")}</FieldLabel>
            <VInput
              value={config.hero.ctaText}
              onChange={(v) => updateSection("hero", { ctaText: v })}
              placeholder={t("website.hero.ctaPlaceholder")}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>{t("website.pages.home.ctaLink")}</FieldLabel>
            <VInput
              value={config.hero.ctaLink}
              onChange={(v) => updateSection("hero", { ctaLink: v })}
              placeholder="/schedule"
            />
          </div>
        </div>
        <SectionDivider label="Visibilidade" />
        <div className="space-y-2">
          <ToggleRow
            label={t("website.pages.home.showStats")}
            enabled={config.hero.showStats}
            onToggle={() =>
              updateSection("hero", { showStats: !config.hero.showStats })
            }
          />
          <ToggleRow
            label={t("website.pages.home.showQuickLinks")}
            enabled={config.hero.showQuickLinks}
            onToggle={() =>
              updateSection("hero", {
                showQuickLinks: !config.hero.showQuickLinks,
              })
            }
          />
        </div>
      </PageCard>

      {/* Schedule */}
      <PageCard
        icon={<CalendarDays className="h-4 w-4" />}
        title={t("website.pages.schedule")}
        description={t("website.pages.schedule.desc")}
        enabled={config.schedule.enabled}
        onToggle={() =>
          updateSection("schedule", { enabled: !config.schedule.enabled })
        }
      >
        <div>
          <FieldLabel>{t("website.schedule.classTypes")}</FieldLabel>
          <CheckboxGrid
            items={classTypes}
            selectedIds={config.schedule.classTypeIds}
            onToggle={(id) => toggleId("schedule", "classTypeIds", id)}
            emptyLabel={t("website.schedule.allTypes")}
            allLabel={t("website.schedule.allTypes")}
          />
        </div>
        <div>
          <FieldLabel>{t("website.pages.schedule.headerText")}</FieldLabel>
          <VInput
            value={config.schedule.headerText}
            onChange={(v) => updateSection("schedule", { headerText: v })}
            placeholder="Horário de Aulas"
          />
        </div>
        <SectionDivider label="Opções" />
        <div className="space-y-2">
          <ToggleRow
            label={t("website.pages.schedule.showBookingButton")}
            enabled={config.schedule.showBookingButton}
            onToggle={() =>
              updateSection("schedule", {
                showBookingButton: !config.schedule.showBookingButton,
              })
            }
          />
          <ToggleRow
            label={t("website.pages.schedule.showOpeningHours")}
            enabled={config.schedule.showOpeningHours}
            onToggle={() =>
              updateSection("schedule", {
                showOpeningHours: !config.schedule.showOpeningHours,
              })
            }
          />
        </div>
      </PageCard>

      {/* Pricing */}
      <PageCard
        icon={<CreditCard className="h-4 w-4" />}
        title={t("website.pages.pricing")}
        description={t("website.pages.pricing.desc")}
        enabled={config.pricing.enabled}
        onToggle={() =>
          updateSection("pricing", { enabled: !config.pricing.enabled })
        }
      >
        <div>
          <FieldLabel>{t("website.pricing.plans")}</FieldLabel>
          <CheckboxGrid
            items={activePlans.map((p) => ({ id: p.id, name: p.name }))}
            selectedIds={config.pricing.planIds}
            onToggle={(id) => toggleId("pricing", "planIds", id)}
            emptyLabel={t("website.pricing.allPlans")}
            allLabel={t("website.pricing.allPlans")}
          />
        </div>
        <SectionDivider label="Opções" />
        <div className="space-y-2">
          <ToggleRow
            label={t("website.pages.pricing.showComparison")}
            enabled={config.pricing.showComparisonTable}
            onToggle={() =>
              updateSection("pricing", {
                showComparisonTable: !config.pricing.showComparisonTable,
              })
            }
          />
          <ToggleRow
            label={t("website.pages.pricing.showFaq")}
            enabled={config.pricing.showFaq}
            onToggle={() =>
              updateSection("pricing", { showFaq: !config.pricing.showFaq })
            }
          />
        </div>

        {config.pricing.showFaq && (
          <>
            <SectionDivider label={t("website.pages.pricing.faqEntries")} />
            <div className="space-y-3">
              {config.pricing.faqEntries.map((entry, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-vytal-border bg-vytal-bg2 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                      FAQ {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFaq(i)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-vytal-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <FieldLabel>{t("website.pages.pricing.question")}</FieldLabel>
                    <VInput
                      value={entry.question}
                      onChange={(v) => updateFaq(i, { question: v })}
                      placeholder="Existe contrato de fidelização?"
                    />
                  </div>
                  <div>
                    <FieldLabel>{t("website.pages.pricing.answer")}</FieldLabel>
                    <VTextarea
                      value={entry.answer}
                      onChange={(v) => updateFaq(i, { answer: v })}
                      placeholder="Não, os nossos planos são mensais..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFaq}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-vytal-border py-2.5 text-sm text-vytal-muted transition-colors hover:border-vytal-green/40 hover:text-vytal-green"
              >
                <Plus className="h-4 w-4" />
                {t("website.pages.pricing.addFaq")}
              </button>
            </div>
          </>
        )}
      </PageCard>

      {/* Shop */}
      <PageCard
        icon={<ShoppingBag className="h-4 w-4" />}
        title={t("website.pages.shop")}
        description={t("website.pages.shop.desc")}
        enabled={config.shop.enabled}
        onToggle={() => updateSection("shop", { enabled: !config.shop.enabled })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>{t("website.pages.shop.headerText")}</FieldLabel>
            <VInput
              value={config.shop.headerText}
              onChange={(v) => updateSection("shop", { headerText: v })}
              placeholder="A Nossa Loja"
            />
          </div>
          <div>
            <FieldLabel>{t("website.pages.shop.currencyFormat")}</FieldLabel>
            <select
              value={config.shop.currencyFormat}
              onChange={(e) =>
                updateSection("shop", { currencyFormat: e.target.value })
              }
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            >
              <option value="EUR">EUR — €</option>
              <option value="USD">USD — $</option>
              <option value="GBP">GBP — £</option>
              <option value="BRL">BRL — R$</option>
            </select>
          </div>
        </div>
        <SectionDivider label="Opções" />
        <ToggleRow
          label={t("website.pages.shop.showCategories")}
          enabled={config.shop.showCategories}
          onToggle={() =>
            updateSection("shop", {
              showCategories: !config.shop.showCategories,
            })
          }
        />
      </PageCard>

      {/* Team */}
      <PageCard
        icon={<UserCircle2 className="h-4 w-4" />}
        title={t("website.pages.team")}
        description={t("website.pages.team.desc")}
        enabled={config.team.enabled}
        onToggle={() => updateSection("team", { enabled: !config.team.enabled })}
      >
        <div>
          <FieldLabel>{t("website.pages.team.coaches")}</FieldLabel>
          <CheckboxGrid
            items={coachItems}
            selectedIds={config.team.coachIds}
            onToggle={(id) => toggleId("team", "coachIds", id)}
            emptyLabel="Nenhum treinador disponível"
            allLabel="Todos os treinadores"
          />
        </div>
        <div>
          <FieldLabel>{t("website.pages.team.headerText")}</FieldLabel>
          <VInput
            value={config.team.headerText}
            onChange={(v) => updateSection("team", { headerText: v })}
            placeholder="A Nossa Equipa"
          />
        </div>
        <SectionDivider label="Opções" />
        <div className="space-y-2">
          <ToggleRow
            label={t("website.pages.team.showCertifications")}
            enabled={config.team.showCertifications}
            onToggle={() =>
              updateSection("team", {
                showCertifications: !config.team.showCertifications,
              })
            }
          />
          <ToggleRow
            label={t("website.pages.team.showBio")}
            enabled={config.team.showBio}
            onToggle={() =>
              updateSection("team", { showBio: !config.team.showBio })
            }
          />
        </div>
      </PageCard>

      {/* Contact */}
      <PageCard
        icon={<Mail className="h-4 w-4" />}
        title={t("website.pages.contact")}
        description={t("website.pages.contact.desc")}
        enabled={config.contact.enabled}
        onToggle={() =>
          updateSection("contact", { enabled: !config.contact.enabled })
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>{t("website.pages.contact.submissionsEmail")}</FieldLabel>
            <VInput
              type="email"
              value={config.contact.submissionsEmail}
              onChange={(v) =>
                updateSection("contact", { submissionsEmail: v })
              }
              placeholder="info@meubox.pt"
            />
          </div>
          <div>
            <FieldLabel>{t("website.pages.contact.successMessage")}</FieldLabel>
            <VInput
              value={config.contact.successMessage}
              onChange={(v) =>
                updateSection("contact", { successMessage: v })
              }
              placeholder="Mensagem enviada!"
            />
          </div>
        </div>
        <SectionDivider label="Opções" />
        <div className="space-y-2">
          <ToggleRow
            label={t("website.pages.contact.showForm")}
            enabled={config.contact.showForm}
            onToggle={() =>
              updateSection("contact", { showForm: !config.contact.showForm })
            }
          />
          <ToggleRow
            label={t("website.pages.contact.showMap")}
            enabled={config.contact.showMap}
            onToggle={() =>
              updateSection("contact", { showMap: !config.contact.showMap })
            }
          />
          <ToggleRow
            label={t("website.pages.contact.showOpeningHours")}
            enabled={config.contact.showOpeningHours}
            onToggle={() =>
              updateSection("contact", {
                showOpeningHours: !config.contact.showOpeningHours,
              })
            }
          />
        </div>
      </PageCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Design
// ---------------------------------------------------------------------------

function DesignTab({
  config,
  setConfig,
  t,
}: {
  config: WebsiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
  t: (k: string) => string;
}) {
  const update = useCallback(
    (partial: Partial<WebsiteConfig["design"]>) => {
      setConfig((prev) => ({
        ...prev,
        design: { ...prev.design, ...partial },
      }));
    },
    [setConfig]
  );

  return (
    <div className="space-y-4">
      {/* Theme & Color */}
      <SettingSection
        title={t("website.design.theme")}
        description="Aparência geral do site público"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(["dark", "light"] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => update({ theme })}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                config.design.theme === theme
                  ? "border-vytal-green/60 bg-vytal-green/5 ring-1 ring-vytal-green/30"
                  : "border-vytal-border bg-vytal-bg2 hover:border-vytal-border/80"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  theme === "dark"
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-900"
                )}
              >
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-vytal-text capitalize">
                  {t(`website.design.theme.${theme}`)}
                </p>
                <p className="text-xs text-vytal-muted">
                  {theme === "dark" ? "Fundo escuro" : "Fundo claro"}
                </p>
              </div>
              {config.design.theme === theme && (
                <Check className="ml-auto h-4 w-4 shrink-0 text-vytal-green" />
              )}
            </button>
          ))}
        </div>

        <div>
          <FieldLabel>{t("website.design.primaryColor")}</FieldLabel>
          <p className="mb-2 text-[11px] text-vytal-muted">
            {t("website.design.primaryColor.desc")}
          </p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.design.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
              className="h-10 w-10 cursor-pointer rounded-lg border border-vytal-border bg-transparent p-0.5"
            />
            <VInput
              value={config.design.primaryColor}
              onChange={(v) => {
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v))
                  update({ primaryColor: v });
              }}
              className="w-32 font-mono text-xs"
              placeholder="#22c55e"
            />
            <div
              className="h-10 w-10 shrink-0 rounded-lg border border-vytal-border"
              style={{ backgroundColor: config.design.primaryColor }}
            />
          </div>
        </div>
      </SettingSection>

      {/* Logo & Favicon */}
      <SettingSection
        title="Identidade Visual"
        description="Logótipo e ícone do browser"
      >
        <FileUploadField
          label={t("website.design.logo")}
          description={t("website.design.logo.desc")}
          fileName={config.design.logoFileName}
          onFileSelect={(name) => update({ logoFileName: name })}
        />
        <FileUploadField
          label={t("website.design.favicon")}
          description={t("website.design.favicon.desc")}
          fileName={config.design.faviconFileName}
          onFileSelect={(name) => update({ faviconFileName: name })}
        />
      </SettingSection>

      {/* Typography & Layout */}
      <SettingSection title="Tipografia e Layout">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>{t("website.design.font")}</FieldLabel>
            <select
              value={config.design.font}
              onChange={(e) =>
                update({
                  font: e.target.value as WebsiteConfig["design"]["font"],
                })
              }
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            >
              <option value="Inter">Inter</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="DM Sans">DM Sans</option>
            </select>
          </div>
          <div>
            <FieldLabel>
              {t("website.design.borderRadius")} —{" "}
              {config.design.borderRadius}px
            </FieldLabel>
            <input
              type="range"
              min={0}
              max={16}
              value={config.design.borderRadius}
              onChange={(e) =>
                update({ borderRadius: Number(e.target.value) })
              }
              className="mt-3 w-full accent-vytal-green"
            />
            <div className="mt-1 flex justify-between text-[10px] text-vytal-muted/60">
              <span>0px</span>
              <span>8px</span>
              <span>16px</span>
            </div>
          </div>
        </div>
        {/* Border radius preview */}
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-bg2 p-3">
          <span className="text-xs text-vytal-muted shrink-0">Pré-visualização:</span>
          <div
            className="flex h-8 w-24 items-center justify-center border border-vytal-green/30 bg-vytal-green/20 text-[11px] font-medium text-vytal-green"
            style={{ borderRadius: config.design.borderRadius }}
          >
            Botão
          </div>
          <div
            className="h-8 w-16 border border-vytal-border bg-vytal-bg3"
            style={{ borderRadius: config.design.borderRadius }}
          />
        </div>
      </SettingSection>

      {/* Navigation style */}
      <SettingSection
        title={t("website.design.navStyle")}
        description="Estilo da navegação no site público"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(["topbar", "sidebar"] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => update({ navStyle: style })}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                config.design.navStyle === style
                  ? "border-vytal-green/60 bg-vytal-green/5 ring-1 ring-vytal-green/30"
                  : "border-vytal-border bg-vytal-bg2 hover:border-vytal-border/80"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vytal-bg3 text-vytal-muted">
                {style === "topbar" ? (
                  <AlignLeft className="h-4 w-4" />
                ) : (
                  <LayoutDashboard className="h-4 w-4" />
                )}
              </div>
              <p className="font-medium text-vytal-text">
                {t(`website.design.navStyle.${style}`)}
              </p>
              {config.design.navStyle === style && (
                <Check className="ml-auto h-4 w-4 shrink-0 text-vytal-green" />
              )}
            </button>
          ))}
        </div>
      </SettingSection>

      {/* Footer */}
      <SettingSection
        title={t("website.design.footer")}
        description="Personalizar o rodapé do site público"
      >
        <div>
          <FieldLabel>{t("website.design.footer.text")}</FieldLabel>
          <VInput
            value={config.design.footerText}
            onChange={(v) => update({ footerText: v })}
            placeholder={`© ${new Date().getFullYear()} O Meu Box`}
          />
        </div>
        <div className="space-y-2">
          <ToggleRow
            label={t("website.design.footer.showSocialLinks")}
            enabled={config.design.showSocialLinks}
            onToggle={() =>
              update({ showSocialLinks: !config.design.showSocialLinks })
            }
          />
          <ToggleRow
            label={t("website.design.footer.showPoweredBy")}
            enabled={config.design.showPoweredBy}
            onToggle={() =>
              update({ showPoweredBy: !config.design.showPoweredBy })
            }
          />
        </div>
      </SettingSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Domain
// ---------------------------------------------------------------------------

function DomainTab({
  config,
  setConfig,
  slug,
  t,
}: {
  config: WebsiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
  slug: string;
  t: (k: string) => string;
}) {
  const [dnsOpen, setDnsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const vytalUrl = `vytal.fit/@${slug}`;

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const update = useCallback(
    (partial: Partial<WebsiteConfig["domain"]>) => {
      setConfig((prev) => ({
        ...prev,
        domain: { ...prev.domain, ...partial },
      }));
    },
    [setConfig]
  );

  return (
    <div className="space-y-4">
      {/* Vytal URL */}
      <SettingSection
        title={t("website.domain.vytalUrl")}
        description={t("website.domain.vytalUrl.desc")}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5">
            <Globe className="h-4 w-4 shrink-0 text-vytal-green" />
            <span className="flex-1 font-mono text-sm text-vytal-text">
              {vytalUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(`https://${vytalUrl}`)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            {copied ? (
              <Check className="h-4 w-4 text-vytal-green" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <a
            href={`/org/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </SettingSection>

      {/* Custom Domain */}
      <SettingSection
        title={t("website.domain.customDomain")}
        description="Aponte o seu domínio próprio para o site Vytal"
      >
        <div>
          <FieldLabel>{t("website.domain.customDomain")}</FieldLabel>
          <div className="flex items-center gap-2">
            <VInput
              value={config.domain.customDomain}
              onChange={(v) => update({ customDomain: v })}
              placeholder={t("website.domain.customDomain.placeholder")}
            />
            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                config.domain.customDomain
                  ? "bg-vytal-green/10 text-vytal-green"
                  : "bg-vytal-bg3 text-vytal-muted"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {config.domain.customDomain
                ? t("website.domain.ssl.active")
                : "—"}
            </div>
          </div>
        </div>

        {config.domain.customDomain && (
          <div className="flex items-start gap-2 rounded-lg border border-vytal-border/60 bg-vytal-bg2 p-4">
            <Info className="h-4 w-4 shrink-0 text-vytal-muted mt-0.5" />
            <p className="text-xs text-vytal-muted">
              SSL é provisionado automaticamente após verificação DNS. Pode demorar até 24 horas a propagar.
            </p>
          </div>
        )}

        {/* DNS Instructions collapsible */}
        <div className="rounded-xl border border-vytal-border overflow-hidden">
          <button
            type="button"
            onClick={() => setDnsOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-vytal-bg2"
          >
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-vytal-muted" />
              <span className="text-sm font-medium text-vytal-text">
                {t("website.domain.dnsInstructions")}
              </span>
            </div>
            {dnsOpen ? (
              <ChevronUp className="h-4 w-4 text-vytal-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-vytal-muted" />
            )}
          </button>
          {dnsOpen && (
            <div className="space-y-3 border-t border-vytal-border px-4 py-4">
              <p className="text-xs text-vytal-muted">
                {t("website.domain.dnsInstructions.desc")}
              </p>
              <div className="overflow-x-auto rounded-lg border border-vytal-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-vytal-border bg-vytal-bg2">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">
                        {t("website.domain.dnsInstructions.type")}
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">
                        {t("website.domain.dnsInstructions.name")}
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">
                        {t("website.domain.dnsInstructions.value")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2.5 font-mono text-vytal-text">
                        CNAME
                      </td>
                      <td className="px-3 py-2.5 font-mono text-vytal-text">
                        @
                      </td>
                      <td className="px-3 py-2.5 font-mono text-vytal-green">
                        cname.vytal.fit
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <ToggleRow
          label={t("website.domain.wwwRedirect")}
          description="Redireciona www.seudominio.com para seudominio.com"
          enabled={config.domain.wwwRedirect}
          onToggle={() => update({ wwwRedirect: !config.domain.wwwRedirect })}
        />
      </SettingSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: SEO
// ---------------------------------------------------------------------------

function SeoTab({
  config,
  setConfig,
  orgSettings,
  t,
}: {
  config: WebsiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
  orgSettings: { name: string; slug?: string };
  t: (k: string) => string;
}) {
  const update = useCallback(
    (partial: Partial<WebsiteConfig["seo"]>) => {
      setConfig((prev) => ({
        ...prev,
        seo: { ...prev.seo, ...partial },
      }));
    },
    [setConfig]
  );

  const descLen = config.seo.metaDescription.length;
  const titleLen = config.seo.metaTitle.length;

  return (
    <div className="space-y-4">
      {/* Meta Tags */}
      <SettingSection
        title="Meta Tags"
        description="Título e descrição para motores de pesquisa"
      >
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <FieldLabel>{t("website.seo.metaTitle")}</FieldLabel>
            <span
              className={cn(
                "text-[11px]",
                titleLen > 60 ? "text-red-400" : "text-vytal-muted"
              )}
            >
              {titleLen}/60 {t("website.seo.chars")}
            </span>
          </div>
          <VInput
            value={config.seo.metaTitle}
            onChange={(v) => update({ metaTitle: v })}
            placeholder={orgSettings.name}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <FieldLabel>{t("website.seo.metaDescription")}</FieldLabel>
            <span
              className={cn(
                "text-[11px]",
                descLen > 160
                  ? "text-red-400"
                  : descLen > 140
                  ? "text-vytal-amber"
                  : "text-vytal-muted"
              )}
            >
              {descLen}/160 {t("website.seo.chars")}
            </span>
          </div>
          <VTextarea
            value={config.seo.metaDescription}
            onChange={(v) => update({ metaDescription: v })}
            placeholder="Descrição breve do seu espaço para motores de pesquisa..."
            rows={3}
          />
        </div>
        <FileUploadField
          label={t("website.seo.ogImage")}
          description={t("website.seo.ogImage.desc")}
          fileName=""
          onFileSelect={() => {}}
        />
      </SettingSection>

      {/* Social Preview */}
      <SettingSection
        title={t("website.seo.socialPreview")}
        description="Prévia de como o link aparece nas redes sociais"
      >
        <div className="max-w-sm overflow-hidden rounded-xl border border-vytal-border">
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-vytal-bg3 to-vytal-bg2">
            <Image className="h-10 w-10 text-vytal-muted/30" />
          </div>
          <div className="border-t border-vytal-border bg-vytal-bg2 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-vytal-muted">
              {config.domain.customDomain ||
                `vytal.fit/@${orgSettings.slug ?? ""}`}
            </p>
            <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-vytal-text">
              {config.seo.metaTitle || orgSettings.name || "Título do site"}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-vytal-muted">
              {config.seo.metaDescription ||
                "Descrição do seu espaço aparece aqui."}
            </p>
          </div>
        </div>
      </SettingSection>

      {/* Analytics */}
      <SettingSection
        title="Analytics & Tracking"
        description="Integre ferramentas de análise no seu site público"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>{t("website.seo.gaTrackingId")}</FieldLabel>
            <VInput
              value={config.seo.gaTrackingId}
              onChange={(v) => update({ gaTrackingId: v })}
              placeholder={t("website.seo.gaTrackingId.placeholder")}
              className="font-mono text-xs"
            />
          </div>
          <div>
            <FieldLabel>{t("website.seo.fbPixelId")}</FieldLabel>
            <VInput
              value={config.seo.fbPixelId}
              onChange={(v) => update({ fbPixelId: v })}
              placeholder={t("website.seo.fbPixelId.placeholder")}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </SettingSection>

      {/* Indexing */}
      <SettingSection
        title="Indexação e Sitemap"
        description="Controle como os motores de pesquisa descobrem o seu site"
      >
        <div className="space-y-2">
          <ToggleRow
            label={t("website.seo.allowIndexing")}
            description="Permite que o Google e outros motores de pesquisa indexem o seu site"
            enabled={config.seo.allowIndexing}
            onToggle={() =>
              update({ allowIndexing: !config.seo.allowIndexing })
            }
          />
          <ToggleRow
            label={t("website.seo.autoSitemap")}
            description="Gera automaticamente um sitemap.xml para o seu site público"
            enabled={config.seo.autoSitemap}
            onToggle={() => update({ autoSitemap: !config.seo.autoSitemap })}
          />
        </div>
        {config.seo.autoSitemap && (
          <div className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-vytal-green" />
            <span className="font-mono text-xs text-vytal-muted">
              vytal.fit/@{orgSettings.slug ?? ""}/sitemap.xml
            </span>
          </div>
        )}
      </SettingSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Content
// ---------------------------------------------------------------------------

function ContentTab({
  config,
  setConfig,
  t,
}: {
  config: WebsiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
  t: (k: string) => string;
}) {
  const updateContent = useCallback(
    (partial: Partial<WebsiteConfig["content"]>) => {
      setConfig((prev) => ({
        ...prev,
        content: { ...prev.content, ...partial },
      }));
    },
    [setConfig]
  );

  const updateTestimonial = useCallback(
    (index: number, partial: Partial<WebsiteTestimonial>) => {
      setConfig((prev) => {
        const items = prev.testimonials.items.map((item, i) =>
          i === index ? { ...item, ...partial } : item
        );
        return { ...prev, testimonials: { ...prev.testimonials, items } };
      });
    },
    [setConfig]
  );

  const toggleTestimonials = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        enabled: !prev.testimonials.enabled,
      },
    }));
  }, [setConfig]);

  const toggleGallery = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, enabled: !prev.gallery.enabled },
    }));
  }, [setConfig]);

  return (
    <div className="space-y-4">
      {/* About text */}
      <SettingSection
        title={t("website.content.aboutText")}
        description="Texto exibido na secção «Sobre Nós» do site público"
      >
        <VTextarea
          value={config.content.aboutText}
          onChange={(v) => updateContent({ aboutText: v })}
          placeholder={t("website.content.aboutText.placeholder")}
          rows={5}
        />
      </SettingSection>

      {/* Testimonials */}
      <SettingSection
        title={t("website.content.testimonials")}
        description={t("website.content.testimonials.desc")}
      >
        <ToggleRow
          label="Mostrar testemunhos na página pública"
          enabled={config.testimonials.enabled}
          onToggle={toggleTestimonials}
        />
        {config.testimonials.enabled && (
          <div className="space-y-3">
            {config.testimonials.items.map((item, i) => (
              <div
                key={i}
                className="space-y-3 rounded-lg border border-vytal-border bg-vytal-bg2 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                    Testemunho {i + 1}
                  </span>
                  <StarRating
                    value={item.rating}
                    onChange={(v) => updateTestimonial(i, { rating: v })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>{t("website.testimonials.name")}</FieldLabel>
                    <VInput
                      value={item.name}
                      onChange={(v) => updateTestimonial(i, { name: v })}
                      placeholder="Ana Silva"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>{t("website.testimonials.text")}</FieldLabel>
                    <VTextarea
                      value={item.text}
                      onChange={(v) => updateTestimonial(i, { text: v })}
                      placeholder="O melhor box que já frequentei..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingSection>

      {/* Gallery */}
      <SettingSection
        title={t("website.content.gallery")}
        description={t("website.content.gallery.desc")}
      >
        <ToggleRow
          label="Ativar galeria de fotos"
          enabled={config.gallery.enabled}
          onToggle={toggleGallery}
        />
        {config.gallery.enabled && (
          <div className="rounded-lg border-2 border-dashed border-vytal-border bg-vytal-bg2 p-6 text-center">
            <Image className="mx-auto h-8 w-8 text-vytal-muted/40" />
            <p className="mt-2 text-sm text-vytal-muted">
              Gerencie as fotos na{" "}
              <a
                href="/media"
                className="text-vytal-green underline-offset-2 hover:underline"
              >
                Biblioteca de Multimédia
              </a>
            </p>
          </div>
        )}
      </SettingSection>

      {/* Announcement bar */}
      <SettingSection
        title={t("website.content.announcement")}
        description="Barra de destaque no topo do site público"
      >
        <ToggleRow
          label="Mostrar barra de anúncio"
          enabled={config.content.announcementBar}
          onToggle={() =>
            updateContent({
              announcementBar: !config.content.announcementBar,
            })
          }
        />
        {config.content.announcementBar && (
          <div className="space-y-3">
            <div>
              <FieldLabel>{t("website.content.announcement.text")}</FieldLabel>
              <VInput
                value={config.content.announcementText}
                onChange={(v) => updateContent({ announcementText: v })}
                placeholder="Aula experimental GRATUITA este fim de semana!"
              />
            </div>
            <div>
              <FieldLabel>
                {t("website.content.announcement.color")}
              </FieldLabel>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.content.announcementColor}
                  onChange={(e) =>
                    updateContent({ announcementColor: e.target.value })
                  }
                  className="h-10 w-10 cursor-pointer rounded-lg border border-vytal-border bg-transparent p-0.5"
                />
                <VInput
                  value={config.content.announcementColor}
                  onChange={(v) => {
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v))
                      updateContent({ announcementColor: v });
                  }}
                  className="w-32 font-mono text-xs"
                  placeholder="#22c55e"
                />
                <div
                  className="flex h-10 flex-1 items-center justify-center rounded-lg px-3 text-xs font-medium text-white"
                  style={{
                    backgroundColor: config.content.announcementColor,
                  }}
                >
                  {config.content.announcementText || "Pré-visualização"}
                </div>
              </div>
            </div>
          </div>
        )}
      </SettingSection>

      {/* Cookie consent */}
      <SettingSection
        title={t("website.content.cookieConsent")}
        description="Aviso de cookies exibido aos novos visitantes"
      >
        <ToggleRow
          label="Ativar aviso de cookies"
          enabled={config.content.cookieConsent}
          onToggle={() =>
            updateContent({ cookieConsent: !config.content.cookieConsent })
          }
        />
        {config.content.cookieConsent && (
          <div>
            <FieldLabel>{t("website.content.cookieConsent.text")}</FieldLabel>
            <VTextarea
              value={config.content.cookieText}
              onChange={(v) => updateContent({ cookieText: v })}
              placeholder="Utilizamos cookies para melhorar a sua experiência..."
              rows={2}
            />
          </div>
        )}
      </SettingSection>

      {/* Legal links */}
      <SettingSection
        title={t("website.content.legalLinks")}
        description="Links para documentos legais exibidos no rodapé"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>{t("website.content.privacyPolicyUrl")}</FieldLabel>
            <VInput
              type="url"
              value={config.content.privacyPolicyUrl}
              onChange={(v) => updateContent({ privacyPolicyUrl: v })}
              placeholder="https://seusite.pt/privacidade"
            />
          </div>
          <div>
            <FieldLabel>{t("website.content.termsUrl")}</FieldLabel>
            <VInput
              type="url"
              value={config.content.termsUrl}
              onChange={(v) => updateContent({ termsUrl: v })}
              placeholder="https://seusite.pt/termos"
            />
          </div>
        </div>
      </SettingSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function WebsiteConfigPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const orgSettings = useDataStore((s) => s.orgSettings);
  const updateOrgSettings = useDataStore((s) => s.updateOrgSettings);
  const classTypes = useDataStore((s) => s.classTypes);
  const plans = useDataStore((s) => s.plans);
  const coaches = useDataStore((s) => s.coaches);

  const [activeTab, setActiveTab] = useState<Tab>("pages");
  const [config, setConfig] = useState<WebsiteConfig>(
    () => orgSettings.websiteConfig ?? defaultWebsiteConfig(orgSettings)
  );

  const slug = orgSettings.slug || "meu-box";

  function handleSave() {
    updateOrgSettings({ websiteConfig: config });
    toast(t("website.saved"), "success");
  }

  function handlePreview() {
    window.open(`/org/${slug}`, "_blank");
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "pages",
      label: t("website.tab.pages"),
      icon: <FileText className="h-3.5 w-3.5" />,
    },
    {
      id: "design",
      label: t("website.tab.design"),
      icon: <Palette className="h-3.5 w-3.5" />,
    },
    {
      id: "domain",
      label: t("website.tab.domain"),
      icon: <Globe className="h-3.5 w-3.5" />,
    },
    {
      id: "seo",
      label: t("website.tab.seo"),
      icon: <Search className="h-3.5 w-3.5" />,
    },
    {
      id: "content",
      label: t("website.tab.content"),
      icon: <MessageSquare className="h-3.5 w-3.5" />,
    },
  ];

  const enabledPages = [
    true,
    config.schedule.enabled,
    config.pricing.enabled,
    config.shop.enabled,
    config.team.enabled,
    config.contact.enabled,
  ].filter(Boolean).length;

  return (
    <div className="space-y-0">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumbs
          items={[
            { label: t("nav.settings"), href: "/settings" },
            { label: t("website.breadcrumb") },
          ]}
        />
      </div>

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("website.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("website.subtitle")}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Globe className="h-3.5 w-3.5 text-vytal-green" />
              <span className="font-mono text-vytal-green">
                vytal.fit/@{slug}
              </span>
            </div>
            <span className="text-vytal-border">·</span>
            <span className="text-xs text-vytal-muted">
              {enabledPages} página{enabledPages !== 1 ? "s" : ""} ativa
              {enabledPages !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <ExternalLink className="h-4 w-4" />
            {t("website.preview")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            <Save className="h-4 w-4" />
            {t("action.save")}
          </button>
        </div>
      </div>

      {/* Horizontal tab bar */}
      <div className="mb-6 border-b border-vytal-border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-vytal-green text-vytal-green"
                  : "border-transparent text-vytal-muted hover:text-vytal-text"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-12">
        {activeTab === "pages" && (
          <PagesTab
            config={config}
            setConfig={setConfig}
            classTypes={classTypes}
            plans={plans}
            coaches={coaches}
            t={t}
          />
        )}
        {activeTab === "design" && (
          <DesignTab config={config} setConfig={setConfig} t={t} />
        )}
        {activeTab === "domain" && (
          <DomainTab
            config={config}
            setConfig={setConfig}
            slug={slug}
            t={t}
          />
        )}
        {activeTab === "seo" && (
          <SeoTab
            config={config}
            setConfig={setConfig}
            orgSettings={orgSettings}
            t={t}
          />
        )}
        {activeTab === "content" && (
          <ContentTab config={config} setConfig={setConfig} t={t} />
        )}
      </div>
    </div>
  );
}
