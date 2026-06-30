"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Save,
  Wallet,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { OrganizationPaymentMethods as PaymentMethodConfig } from "@vytal-fit/db";
import { trpc } from "@/lib/trpc";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MethodKey = keyof PaymentMethodConfig;

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

const defaultPaymentMethods: Required<PaymentMethodConfig> = {
  mbway: { enabled: true, phone: "", merchantId: "" },
  multibanco: { enabled: true, entity: "", subEntity: "" },
  sepa: { enabled: false, iban: "", bic: "", creditorId: "" },
  card: { enabled: false, processor: "Stripe" },
  cash: { enabled: true },
  transfer: { enabled: false, iban: "", bankName: "", accountHolder: "" },
};

// ---------------------------------------------------------------------------
// Method card component
// ---------------------------------------------------------------------------

interface MethodCardProps {
  methodKey: MethodKey;
  icon: React.ReactNode;
  badge?: "popular" | "recommended";
  config: PaymentMethodConfig;
  expandedKey: MethodKey | null;
  onToggle: (key: MethodKey) => void;
  onExpand: (key: MethodKey | null) => void;
  children?: React.ReactNode;
}

function MethodCard({
  methodKey,
  icon,
  badge,
  config,
  expandedKey,
  onToggle,
  onExpand,
  children,
}: MethodCardProps) {
  const { t } = useI18n();
  const methodCfg = config[methodKey] as { enabled: boolean } | undefined;
  const isEnabled = methodCfg?.enabled ?? false;
  const isExpanded = expandedKey === methodKey;
  const nameKey = `payments.${methodKey}.name`;
  const descKey = `payments.${methodKey}.desc`;

  return (
    <div
      className={cn(
        "rounded-xl border bg-vytal-card transition-all",
        isEnabled
          ? "border-vytal-border hover:border-[rgba(34,197,94,0.3)]"
          : "border-vytal-border/50 opacity-70 hover:opacity-80"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 p-5">
        {/* Icon */}
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
            isEnabled ? "bg-vytal-green/10" : "bg-vytal-bg3"
          )}
        >
          <span className={cn("h-5 w-5", isEnabled ? "text-vytal-green" : "text-vytal-muted")}>
            {icon}
          </span>
        </div>

        {/* Label + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-vytal-text">{t(nameKey)}</span>
            {badge && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  badge === "popular"
                    ? "bg-vytal-green/10 text-vytal-green"
                    : "bg-vytal-blue/10 text-vytal-blue"
                )}
              >
                {t(`payments.badge.${badge}`)}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-vytal-muted line-clamp-1">{t(descKey)}</p>
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Configure button — only shown when enabled and has config fields */}
          {isEnabled && children && (
            <button
              onClick={() => onExpand(isExpanded ? null : methodKey)}
              className="inline-flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              {isExpanded ? (
                <>
                  {t("payments.configureHide")} <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  {t("payments.configure")} <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}

          {/* Toggle switch */}
          <button
            role="switch"
            aria-checked={isEnabled}
            onClick={() => onToggle(methodKey)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none",
              isEnabled ? "bg-vytal-green" : "bg-vytal-bg3"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform",
                isEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* Expanded config area */}
      {isEnabled && isExpanded && children && (
        <div className="border-t border-vytal-border bg-vytal-bg2/40 px-5 pb-5 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field helper
// ---------------------------------------------------------------------------

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-vytal-muted">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted/60 focus:border-vytal-green/50 focus:outline-none focus:ring-1 focus:ring-vytal-green/30"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-vytal-muted">
        {label}
      </span>
      <div className="h-px flex-1 bg-vytal-border/60" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PaymentsSettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const activeOrgId = useAuthStore((s) => s.user?.activeOrganizationId) ?? "org-1";
  const utils = trpc.useUtils();
  const settingsQuery = trpc.orgSettings.get.useQuery();
  const updateSettings = trpc.orgSettings.update.useMutation({
    onSuccess: () => {
      void utils.orgSettings.get.invalidate();
      setSaved(true);
      toast(t("payments.saved"), "success");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (error) =>
      toast(
        error.data?.code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"),
        "error",
      ),
  });

  const [config, setConfig] = useState<PaymentMethodConfig>(defaultPaymentMethods);
  const [expandedKey, setExpandedKey] = useState<MethodKey | null>(null);
  const [, setSaved] = useState(false);

  // Hydrate from the API when settings arrive or the active org changes.
  useEffect(() => {
    if (settingsQuery.data) {
      setConfig(settingsQuery.data.paymentMethods ?? defaultPaymentMethods);
    }
  }, [activeOrgId, settingsQuery.data]);

  function toggleMethod(key: MethodKey) {
    setConfig((prev) => {
      const current = (prev[key] as { enabled: boolean } | undefined) ?? { enabled: false };
      return { ...prev, [key]: { ...current, enabled: !current.enabled } };
    });
    setSaved(false);
  }

  function updateField<K extends MethodKey>(
    key: K,
    field: string,
    value: string
  ) {
    setConfig((prev) => {
      const current = (prev[key] as Record<string, unknown>) ?? {};
      return { ...prev, [key]: { ...current, [field]: value } };
    });
    setSaved(false);
  }

  function getStr(key: MethodKey, field: string): string {
    const obj = config[key] as Record<string, unknown> | undefined;
    return (obj?.[field] as string | undefined) ?? "";
  }

  function handleSave() {
    // The API accepts an open record of method configs; our typed blob is a
    // compatible subset.
    updateSettings.mutate({
      paymentMethods: config as Record<
        string,
        { enabled: boolean } & Record<string, string | boolean>
      >,
    });
  }

  // Count enabled methods
  const enabledCount = Object.values(config).filter(
    (m) => (m as { enabled?: boolean })?.enabled
  ).length;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("settings.title"), href: "/settings" },
          { label: t("payments.title") },
        ]}
      />

      {/* Page Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("payments.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("payments.subtitle")}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("action.save")}
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 rounded-xl border border-vytal-border bg-vytal-card px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
          <Wallet className="h-4 w-4 text-vytal-green" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-vytal-text">
            {enabledCount} {enabledCount === 1 ? "método ativo" : "métodos ativos"}
          </p>
          <p className="text-xs text-vytal-muted">
            Ative ou desative métodos e expanda para configurar os detalhes.
          </p>
        </div>
      </div>

      {/* Portuguese Methods */}
      <div className="space-y-3">
        <SectionHeader label={t("payments.section.portuguese")} />

        {/* MB Way */}
        <MethodCard
          methodKey="mbway"
          icon={<Smartphone className="h-5 w-5" />}
          badge="popular"
          config={config}
          expandedKey={expandedKey}
          onToggle={toggleMethod}
          onExpand={setExpandedKey}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("payments.mbway.phone")}
              placeholder={t("payments.mbway.phonePlaceholder")}
              value={getStr("mbway", "phone")}
              onChange={(v) => updateField("mbway", "phone", v)}
            />
            <Field
              label={t("payments.mbway.merchantId")}
              placeholder={t("payments.mbway.merchantIdPlaceholder")}
              value={getStr("mbway", "merchantId")}
              onChange={(v) => updateField("mbway", "merchantId", v)}
            />
          </div>
        </MethodCard>

        {/* Multibanco */}
        <MethodCard
          methodKey="multibanco"
          icon={<Building2 className="h-5 w-5" />}
          badge="recommended"
          config={config}
          expandedKey={expandedKey}
          onToggle={toggleMethod}
          onExpand={setExpandedKey}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("payments.multibanco.entity")}
              placeholder={t("payments.multibanco.entityPlaceholder")}
              value={getStr("multibanco", "entity")}
              onChange={(v) => updateField("multibanco", "entity", v)}
            />
            <Field
              label={t("payments.multibanco.subEntity")}
              placeholder={t("payments.multibanco.subEntityPlaceholder")}
              value={getStr("multibanco", "subEntity")}
              onChange={(v) => updateField("multibanco", "subEntity", v)}
            />
          </div>
        </MethodCard>
      </div>

      {/* International Methods */}
      <div className="space-y-3">
        <SectionHeader label={t("payments.section.international")} />

        {/* SEPA */}
        <MethodCard
          methodKey="sepa"
          icon={<ArrowLeftRight className="h-5 w-5" />}
          config={config}
          expandedKey={expandedKey}
          onToggle={toggleMethod}
          onExpand={setExpandedKey}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("payments.sepa.iban")}
              placeholder={t("payments.sepa.ibanPlaceholder")}
              value={getStr("sepa", "iban")}
              onChange={(v) => updateField("sepa", "iban", v)}
            />
            <Field
              label={t("payments.sepa.bic")}
              placeholder={t("payments.sepa.bicPlaceholder")}
              value={getStr("sepa", "bic")}
              onChange={(v) => updateField("sepa", "bic", v)}
            />
            <Field
              label={t("payments.sepa.creditorId")}
              placeholder={t("payments.sepa.creditorIdPlaceholder")}
              value={getStr("sepa", "creditorId")}
              onChange={(v) => updateField("sepa", "creditorId", v)}
            />
          </div>
        </MethodCard>

        {/* Card */}
        <MethodCard
          methodKey="card"
          icon={<CreditCard className="h-5 w-5" />}
          config={config}
          expandedKey={expandedKey}
          onToggle={toggleMethod}
          onExpand={setExpandedKey}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-vytal-muted">
              {t("payments.card.processor")}
            </label>
            <div className="flex flex-wrap gap-2">
              {(["Stripe", "Adyen", "Ifthenpay"] as const).map((proc) => {
                const current = getStr("card", "processor") || "Stripe";
                return (
                  <button
                    key={proc}
                    onClick={() => updateField("card", "processor", proc)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      current === proc
                        ? "border-vytal-green/40 bg-vytal-green/10 text-vytal-green"
                        : "border-vytal-border bg-vytal-bg text-vytal-text hover:bg-vytal-bg3"
                    )}
                  >
                    {proc}
                  </button>
                );
              })}
            </div>
          </div>
        </MethodCard>
      </div>

      {/* Other Methods */}
      <div className="space-y-3">
        <SectionHeader label={t("payments.section.other")} />

        {/* Cash */}
        <MethodCard
          methodKey="cash"
          icon={<Banknote className="h-5 w-5" />}
          config={config}
          expandedKey={expandedKey}
          onToggle={toggleMethod}
          onExpand={setExpandedKey}
        />

        {/* Bank Transfer */}
        <MethodCard
          methodKey="transfer"
          icon={<Building2 className="h-5 w-5" />}
          config={config}
          expandedKey={expandedKey}
          onToggle={toggleMethod}
          onExpand={setExpandedKey}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("payments.transfer.iban")}
              placeholder={t("payments.transfer.ibanPlaceholder")}
              value={getStr("transfer", "iban")}
              onChange={(v) => updateField("transfer", "iban", v)}
            />
            <Field
              label={t("payments.transfer.bankName")}
              placeholder={t("payments.transfer.bankNamePlaceholder")}
              value={getStr("transfer", "bankName")}
              onChange={(v) => updateField("transfer", "bankName", v)}
            />
            <div className="sm:col-span-2">
              <Field
                label={t("payments.transfer.accountHolder")}
                placeholder={t("payments.transfer.accountHolderPlaceholder")}
                value={getStr("transfer", "accountHolder")}
                onChange={(v) => updateField("transfer", "accountHolder", v)}
              />
            </div>
          </div>
        </MethodCard>
      </div>

    </div>
  );
}
