"use client";

import { useState, useCallback } from "react";
import {
  Globe,
  Save,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Image,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Search,
  Users,
  FileText,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useDataStore } from "@/stores/data-store";
import type { WebsiteConfig, WebsiteTestimonial } from "@/stores/data-store";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Default website config
// ---------------------------------------------------------------------------

function defaultWebsiteConfig(orgSettings: { slogan: string; name: string }): WebsiteConfig {
  return {
    hero: {
      enabled: true,
      slogan: orgSettings.slogan || "",
      showCoverImage: true,
      ctaText: "Começar Agora",
    },
    about: {
      enabled: true,
      description: "",
      foundingYear: "",
    },
    schedule: {
      enabled: true,
      classTypeIds: [],
    },
    pricing: {
      enabled: true,
      planIds: [],
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
    seo: {
      metaTitle: orgSettings.name || "",
      metaDescription: "",
      showOgImage: true,
    },
    contactForm: {
      enabled: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
        enabled ? "bg-vytal-green" : "bg-vytal-bg3"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300",
          enabled ? "left-[22px]" : "left-0.5"
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
              n <= value ? "fill-vytal-amber text-vytal-amber" : "text-vytal-muted/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SectionCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
  children,
  defaultOpen = false,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-xl border bg-vytal-card transition-all duration-200",
        enabled
          ? "border-vytal-border hover:border-[rgba(61,255,110,0.22)]"
          : "border-vytal-border/50 opacity-70"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vytal-green/10 text-vytal-green">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-vytal-text">{title}</h3>
            {!enabled && (
              <span className="rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                Inativo
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-vytal-muted">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Toggle enabled={enabled} onToggle={onToggle} />
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

      {/* Body */}
      {open && (
        <div className="border-t border-vytal-border/50 px-6 py-5">
          {children}
        </div>
      )}
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

  const [config, setConfig] = useState<WebsiteConfig>(
    () => orgSettings.websiteConfig ?? defaultWebsiteConfig(orgSettings)
  );

  const slug = orgSettings.slug || "meu-box";

  // Generic deep updater helpers
  const updateHero = useCallback(
    <K extends keyof WebsiteConfig["hero"]>(key: K, value: WebsiteConfig["hero"][K]) => {
      setConfig((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
    },
    []
  );

  const updateAbout = useCallback(
    <K extends keyof WebsiteConfig["about"]>(key: K, value: WebsiteConfig["about"][K]) => {
      setConfig((prev) => ({ ...prev, about: { ...prev.about, [key]: value } }));
    },
    []
  );

  const updateSeo = useCallback(
    <K extends keyof WebsiteConfig["seo"]>(key: K, value: WebsiteConfig["seo"][K]) => {
      setConfig((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
    },
    []
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
    []
  );

  const toggleSection = useCallback(
    (section: "hero" | "about" | "schedule" | "pricing" | "gallery" | "testimonials" | "contactForm") => {
      setConfig((prev) => ({
        ...prev,
        [section]: { ...prev[section], enabled: !(prev[section] as { enabled: boolean }).enabled },
      }));
    },
    []
  );

  const toggleClassType = useCallback((id: string) => {
    setConfig((prev) => {
      const ids = prev.schedule.classTypeIds;
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      return { ...prev, schedule: { ...prev.schedule, classTypeIds: next } };
    });
  }, []);

  const togglePlan = useCallback((id: string) => {
    setConfig((prev) => {
      const ids = prev.pricing.planIds;
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      return { ...prev, pricing: { ...prev.pricing, planIds: next } };
    });
  }, []);

  function handleSave() {
    updateOrgSettings({ websiteConfig: config });
    toast(t("website.saved"), "success");
  }

  function handlePreview() {
    window.open(`/org/${slug}`, "_blank");
  }

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";
  const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted";

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: t("website.breadcrumb") },
        ]}
      />

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("website.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("website.subtitle")}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-vytal-muted">
            <Globe className="h-3.5 w-3.5 text-vytal-green" />
            <span className="font-mono text-vytal-green">
              vytal.fit/@{slug}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
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

      {/* Section cards */}
      <div className="space-y-4">

        {/* Hero */}
        <SectionCard
          icon={<Globe className="h-4 w-4" />}
          title={t("website.hero")}
          description={t("website.hero.desc")}
          enabled={config.hero.enabled}
          onToggle={() => toggleSection("hero")}
          defaultOpen
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t("website.hero.slogan")}</label>
              <input
                type="text"
                value={config.hero.slogan}
                onChange={(e) => updateHero("slogan", e.target.value)}
                placeholder={t("website.hero.sloganPlaceholder")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("website.hero.ctaText")}</label>
              <input
                type="text"
                value={config.hero.ctaText}
                onChange={(e) => updateHero("ctaText", e.target.value)}
                placeholder={t("website.hero.ctaPlaceholder")}
                className={inputClass}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-vytal-bg2">
              <span className="text-sm text-vytal-text">{t("website.hero.showCoverImage")}</span>
              <Toggle
                enabled={config.hero.showCoverImage}
                onToggle={() => updateHero("showCoverImage", !config.hero.showCoverImage)}
              />
            </div>
          </div>
        </SectionCard>

        {/* About */}
        <SectionCard
          icon={<FileText className="h-4 w-4" />}
          title={t("website.about")}
          description={t("website.about.desc")}
          enabled={config.about.enabled}
          onToggle={() => toggleSection("about")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>{t("website.about.description")}</label>
              <textarea
                value={config.about.description}
                onChange={(e) => updateAbout("description", e.target.value)}
                placeholder={t("website.about.descriptionPlaceholder")}
                rows={4}
                className={cn(inputClass, "resize-none")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("website.about.foundingYear")}</label>
              <input
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                value={config.about.foundingYear}
                onChange={(e) => updateAbout("foundingYear", e.target.value)}
                placeholder={String(new Date().getFullYear())}
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* Schedule */}
        <SectionCard
          icon={<CalendarDays className="h-4 w-4" />}
          title={t("website.schedule")}
          description={t("website.schedule.desc")}
          enabled={config.schedule.enabled}
          onToggle={() => toggleSection("schedule")}
        >
          <div>
            <label className={labelClass}>{t("website.schedule.classTypes")}</label>
            {classTypes.length === 0 ? (
              <p className="text-sm text-vytal-muted">{t("website.schedule.allTypes")}</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {classTypes.map((ct) => {
                  const selected = config.schedule.classTypeIds.length === 0 || config.schedule.classTypeIds.includes(ct.id);
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => toggleClassType(ct.id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        selected
                          ? "border-vytal-green/40 bg-vytal-green/10 text-vytal-green"
                          : "border-vytal-border bg-vytal-bg2 text-vytal-muted hover:border-vytal-green/20"
                      )}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: ct.color }}
                      />
                      {ct.name}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-[11px] text-vytal-muted/70">
              {config.schedule.classTypeIds.length === 0
                ? t("website.schedule.allTypes")
                : `${config.schedule.classTypeIds.length} tipo(s) selecionado(s)`}
            </p>
          </div>
        </SectionCard>

        {/* Pricing */}
        <SectionCard
          icon={<CreditCard className="h-4 w-4" />}
          title={t("website.pricing")}
          description={t("website.pricing.desc")}
          enabled={config.pricing.enabled}
          onToggle={() => toggleSection("pricing")}
        >
          <div>
            <label className={labelClass}>{t("website.pricing.plans")}</label>
            {plans.length === 0 ? (
              <p className="text-sm text-vytal-muted">{t("website.pricing.allPlans")}</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {plans.filter((p) => p.active).map((plan) => {
                  const selected =
                    config.pricing.planIds.length === 0 ||
                    config.pricing.planIds.includes(plan.id);
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => togglePlan(plan.id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        selected
                          ? "border-vytal-green/40 bg-vytal-green/10 text-vytal-green"
                          : "border-vytal-border bg-vytal-bg2 text-vytal-muted hover:border-vytal-green/20"
                      )}
                    >
                      {plan.name}
                      <span className="font-mono text-[10px]">
                        {plan.price}€
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-[11px] text-vytal-muted/70">
              {config.pricing.planIds.length === 0
                ? t("website.pricing.allPlans")
                : `${config.pricing.planIds.length} plano(s) selecionado(s)`}
            </p>
          </div>
        </SectionCard>

        {/* Gallery */}
        <SectionCard
          icon={<Image className="h-4 w-4" />}
          title={t("website.gallery")}
          description={t("website.gallery.desc")}
          enabled={config.gallery.enabled}
          onToggle={() => toggleSection("gallery")}
        >
          <div className="rounded-lg border-2 border-dashed border-vytal-border bg-vytal-bg2 p-8 text-center">
            <Image className="mx-auto h-8 w-8 text-vytal-muted/40" />
            <p className="mt-2 text-sm text-vytal-muted">
              Gerencie as fotos da galeria na{" "}
              <a
                href="/media"
                className="text-vytal-green underline-offset-2 hover:underline"
              >
                Biblioteca de Multimédia
              </a>
            </p>
          </div>
        </SectionCard>

        {/* Testimonials */}
        <SectionCard
          icon={<Users className="h-4 w-4" />}
          title={t("website.testimonials")}
          description={t("website.testimonials.desc")}
          enabled={config.testimonials.enabled}
          onToggle={() => toggleSection("testimonials")}
        >
          <div className="space-y-4">
            {config.testimonials.items.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-vytal-border bg-vytal-bg2 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
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
                    <label className={labelClass}>{t("website.testimonials.name")}</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateTestimonial(i, { name: e.target.value })}
                      placeholder="Ana Silva"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>{t("website.testimonials.text")}</label>
                    <textarea
                      value={item.text}
                      onChange={(e) => updateTestimonial(i, { text: e.target.value })}
                      placeholder="O melhor box que já frequentei..."
                      rows={2}
                      className={cn(inputClass, "resize-none")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* SEO */}
        <SectionCard
          icon={<Search className="h-4 w-4" />}
          title={t("website.seo")}
          description={t("website.seo.desc")}
          enabled
          onToggle={() => {}}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t("website.seo.metaTitle")}</label>
              <input
                type="text"
                value={config.seo.metaTitle}
                onChange={(e) => updateSeo("metaTitle", e.target.value)}
                placeholder={orgSettings.name}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>{t("website.seo.metaDescription")}</label>
              <textarea
                value={config.seo.metaDescription}
                onChange={(e) => updateSeo("metaDescription", e.target.value)}
                placeholder="Descrição breve do seu espaço para motores de pesquisa..."
                rows={2}
                className={cn(inputClass, "resize-none")}
              />
              <p className="mt-1 text-right text-[11px] text-vytal-muted">
                {config.seo.metaDescription.length}/160
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-vytal-bg2 px-3 py-2.5">
              <span className="text-sm text-vytal-text">{t("website.seo.showOgImage")}</span>
              <Toggle
                enabled={config.seo.showOgImage}
                onToggle={() => updateSeo("showOgImage", !config.seo.showOgImage)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Contact Form */}
        <SectionCard
          icon={<MessageSquare className="h-4 w-4" />}
          title={t("website.contactForm")}
          description={t("website.contactForm.desc")}
          enabled={config.contactForm.enabled}
          onToggle={() => toggleSection("contactForm")}
        >
          <div className="rounded-lg border border-vytal-border bg-vytal-bg2 p-4">
            <p className="text-sm text-vytal-text">
              Quando ativo, um formulário de contacto será exibido na página pública. As mensagens serão encaminhadas para{" "}
              <span className="font-medium text-vytal-green">{orgSettings.email}</span>.
            </p>
          </div>
        </SectionCard>
      </div>

    </div>
  );
}
