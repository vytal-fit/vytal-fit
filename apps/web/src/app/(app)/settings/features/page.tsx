"use client";

import { useState, useEffect } from "react";
import { Check, RotateCcw, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useDataStore } from "@/stores/data-store";
import { useAuthStore } from "@/stores/auth-store";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  ORGANIZATION_CONFIGS,
  type OrganizationFeatures,
} from "@vytal-fit/shared";

// Required features that can't be disabled
const REQUIRED_FEATURES: Set<keyof OrganizationFeatures> = new Set(["financials", "reports", "communications"]);

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

export default function SettingsFeaturesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const orgSettings = useDataStore((s) => s.orgSettings);
  const updateOrgSettings = useDataStore((s) => s.updateOrgSettings);
  const user = useAuthStore((s) => s.user);
  const activeOrg = user?.memberships.find(
    (m) => m.organizationId === user.activeOrganizationId
  );
  const orgType = activeOrg?.organization.type ?? "other";
  const orgConfig = ORGANIZATION_CONFIGS[orgType];

  const defaultFeatures = orgConfig?.features ?? {};
  const [features, setFeatures] = useState<OrganizationFeatures>(() => {
    return orgSettings.features
      ? { ...defaultFeatures, ...orgSettings.features } as OrganizationFeatures
      : defaultFeatures as OrganizationFeatures;
  });

  useEffect(() => {
    if (orgConfig) {
      setFeatures(
        orgSettings.features
          ? { ...(orgConfig.features as OrganizationFeatures), ...orgSettings.features } as OrganizationFeatures
          : orgConfig.features as OrganizationFeatures
      );
    }
  }, [orgConfig, orgSettings.features]);

  function toggleFeature(key: keyof OrganizationFeatures) {
    if (REQUIRED_FEATURES.has(key)) return;
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    updateOrgSettings({ features });
    toast(t("settings.saved"), "success");
  }

  function handleResetDefaults() {
    if (orgConfig) {
      setFeatures(orgConfig.features as OrganizationFeatures);
    }
  }

  function handleEnableAll() {
    setFeatures((prev) => {
      const next = { ...prev };
      (Object.keys(next) as Array<keyof OrganizationFeatures>).forEach((k) => { next[k] = true; });
      return next;
    });
  }

  function handleDisableAll() {
    setFeatures((prev) => {
      const next = { ...prev };
      (Object.keys(next) as Array<keyof OrganizationFeatures>).forEach((k) => {
        next[k] = REQUIRED_FEATURES.has(k) ? true : false;
      });
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: t("settingsFeatures.title") },
        ]}
      />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("settingsFeatures.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("settingsFeatures.subtitle")}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Check className="h-4 w-4" />
          {t("action.save")}
        </button>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleEnableAll}
          className="flex items-center gap-1.5 rounded-lg border border-vytal-border px-3 py-1.5 text-xs text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ToggleRight className="h-3.5 w-3.5" />
          {t("onboarding.enableAll")}
        </button>
        <button
          onClick={handleDisableAll}
          className="flex items-center gap-1.5 rounded-lg border border-vytal-border px-3 py-1.5 text-xs text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ToggleLeft className="h-3.5 w-3.5" />
          {t("onboarding.disableAll")}
        </button>
        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 rounded-lg border border-vytal-border px-3 py-1.5 text-xs text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("onboarding.resetDefaults")}
        </button>
      </div>

      {/* Feature groups */}
      <div className="space-y-6">
        {FEATURE_GROUPS.map((group) => {
          const groupFeatures = group.keys.filter((k) => k in features);
          const allOn = groupFeatures.every((k) => features[k]);
          const someOn = groupFeatures.some((k) => features[k]);

          return (
            <div key={group.titleKey} className="rounded-xl border border-vytal-border bg-vytal-card overflow-hidden">
              {/* Group header */}
              <button
                type="button"
                onClick={() => {
                  const newVal = !allOn;
                  setFeatures((prev) => {
                    const next = { ...prev };
                    groupFeatures.forEach((k) => {
                      if (!REQUIRED_FEATURES.has(k)) next[k] = newVal;
                      else next[k] = true;
                    });
                    return next;
                  });
                }}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-vytal-bg3/30"
              >
                <span className="text-sm font-bold text-vytal-text">
                  {t(group.titleKey)}
                </span>
                <div
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    allOn ? "bg-vytal-green" : someOn ? "bg-vytal-green/40" : "bg-vytal-muted/30",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                      allOn ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </div>
              </button>

              {/* Individual features */}
              <div className="border-t border-vytal-border/50 divide-y divide-vytal-border/30">
                {groupFeatures.map((key) => {
                  const isOn = features[key];
                  const isRequired = REQUIRED_FEATURES.has(key);
                  const isDefault = (defaultFeatures as unknown as Record<string, boolean>)[key];

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleFeature(key)}
                      disabled={isRequired}
                      className={cn(
                        "flex w-full items-center justify-between px-5 py-3 text-left transition-colors",
                        isRequired ? "cursor-default" : "hover:bg-vytal-bg3/20",
                        !isOn && !isRequired && "opacity-50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                            isOn
                              ? "border-vytal-green bg-vytal-green"
                              : "border-vytal-muted/40 bg-transparent",
                          )}
                        >
                          {isOn && <Check className="h-3 w-3 text-vytal-bg" strokeWidth={3} />}
                        </div>
                        <span className="text-sm text-vytal-text">{t(`feature.${key}`)}</span>
                        {isRequired && (
                          <span className="rounded-full bg-vytal-muted/10 px-2 py-0.5 text-[9px] font-bold text-vytal-muted">
                            {t("onboarding.required")}
                          </span>
                        )}
                        {!isRequired && isOn !== isDefault && (
                          <span className="rounded-full bg-vytal-amber/10 px-2 py-0.5 text-[9px] font-bold text-vytal-amber">
                            {t("onboarding.customized")}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
