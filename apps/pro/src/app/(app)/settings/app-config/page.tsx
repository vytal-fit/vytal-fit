"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Smartphone, Save, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

const APP_CONFIG_KEY = "vytal-app-config";

interface SectionDef {
  key: string;
  labelKey: string;
  subOptions?: { key: string; labelKey: string }[];
}

const appSectionDefs: SectionDef[] = [
  { key: "classes", labelKey: "appConfig.classes", subOptions: [
    { key: "book_class", labelKey: "appConfig.bookClass" },
    { key: "drop_in", labelKey: "appConfig.dropIn" },
    { key: "covid_cert", labelKey: "appConfig.covidCert" },
  ]},
  { key: "workouts", labelKey: "appConfig.workouts" },
  { key: "records", labelKey: "appConfig.records" },
  { key: "physical_eval", labelKey: "appConfig.physicalEval" },
  { key: "dossiers", labelKey: "appConfig.digitalDossiers" },
  { key: "news", labelKey: "appConfig.news" },
  { key: "store", labelKey: "appConfig.store" },
  { key: "challenge", labelKey: "appConfig.challenge" },
  { key: "ranking", labelKey: "appConfig.ranking" },
  { key: "best_results", labelKey: "appConfig.bestResults" },
  { key: "fistbumps", labelKey: "appConfig.fistbumps" },
  { key: "my_box", labelKey: "appConfig.myBox" },
  { key: "converters", labelKey: "appConfig.converters" },
  { key: "timers", labelKey: "appConfig.timers" },
  { key: "settings", labelKey: "appConfig.settings" },
];

function getAllKeys(): string[] {
  const keys: string[] = [];
  for (const section of appSectionDefs) {
    keys.push(section.key);
    if (section.subOptions) {
      for (const sub of section.subOptions) {
        keys.push(sub.key);
      }
    }
  }
  return keys;
}

const ALL_KEYS = getAllKeys();

interface AppConfigData {
  toggles: Record<string, boolean>;
  bgTheme: "dark" | "light";
  allowColorChange: boolean;
  splashColor: string;
}

function getDefaultConfig(): AppConfigData {
  const toggles: Record<string, boolean> = {};
  for (const key of ALL_KEYS) {
    toggles[key] = true;
  }
  return {
    toggles,
    bgTheme: "dark",
    allowColorChange: true,
    splashColor: "#080c0a",
  };
}

function loadConfig(): AppConfigData {
  if (typeof window === "undefined") return getDefaultConfig();
  try {
    const raw = localStorage.getItem(APP_CONFIG_KEY);
    if (!raw) return getDefaultConfig();
    const parsed = JSON.parse(raw) as Partial<AppConfigData>;
    const defaults = getDefaultConfig();
    return {
      toggles: { ...defaults.toggles, ...(parsed.toggles ?? {}) },
      bgTheme: parsed.bgTheme ?? defaults.bgTheme,
      allowColorChange: parsed.allowColorChange ?? defaults.allowColorChange,
      splashColor: parsed.splashColor ?? defaults.splashColor,
    };
  } catch {
    return getDefaultConfig();
  }
}

function persistConfig(config: AppConfigData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_CONFIG_KEY, JSON.stringify(config));
}

export default function AppConfigPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [config, setConfig] = useState<AppConfigData>(getDefaultConfig);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setConfig(loadConfig());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration
  useEffect(() => {
    if (hydrated) {
      persistConfig(config);
    }
  }, [config, hydrated]);

  const { toggles, bgTheme, allowColorChange, splashColor } = config;

  const enabledCount = useMemo(() => Object.values(toggles).filter(Boolean).length, [toggles]);
  const totalCount = ALL_KEYS.length;

  function toggle(key: string) {
    setConfig((prev) => ({
      ...prev,
      toggles: { ...prev.toggles, [key]: !prev.toggles[key] },
    }));
  }

  function selectAll() {
    setConfig((prev) => {
      const newToggles = { ...prev.toggles };
      for (const k of ALL_KEYS) newToggles[k] = true;
      return { ...prev, toggles: newToggles };
    });
  }

  function deselectAll() {
    setConfig((prev) => {
      const newToggles = { ...prev.toggles };
      for (const k of ALL_KEYS) newToggles[k] = false;
      return { ...prev, toggles: newToggles };
    });
  }

  const handleSave = useCallback(() => {
    persistConfig(config);
    toast("App configuration saved!", "success");
  }, [config, toast]);

  function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          enabled ? "bg-vytal-green" : "bg-vytal-bg3"
        )}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200", enabled ? "left-[22px]" : "left-0.5")} />
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: t("appConfig.title") },
        ]}
      />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("appConfig.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("appConfig.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-vytal-green/10 px-3 py-1 text-xs font-medium text-vytal-green">
            {enabledCount}/{totalCount} sections enabled
          </span>
          <button onClick={selectAll} className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-xs font-medium text-vytal-muted transition-colors hover:text-vytal-text">
            {t("appConfig.selectAll")}
          </button>
          <button onClick={deselectAll} className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-xs font-medium text-vytal-muted transition-colors hover:text-vytal-text">
            {t("appConfig.deselectAll")}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            <Save className="h-4 w-4" />
            {t("action.save")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section Toggles */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
          <div className="mb-5 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">{t("appConfig.appSections")}</h2>
          </div>
          <div className="space-y-3">
            {appSectionDefs.map((section) => (
              <div key={section.key}>
                <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-vytal-bg2">
                  <span className={cn(
                    "text-sm font-medium",
                    toggles[section.key] ? "text-vytal-text" : "text-vytal-muted line-through"
                  )}>
                    {t(section.labelKey)}
                  </span>
                  <ToggleSwitch enabled={toggles[section.key]} onToggle={() => toggle(section.key)} />
                </div>
                {section.subOptions && toggles[section.key] && (
                  <div className="ml-6 space-y-1 border-l border-vytal-border pl-4">
                    {section.subOptions.map((sub) => (
                      <div key={sub.key} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-vytal-bg2">
                        <span className={cn(
                          "text-xs",
                          toggles[sub.key] ? "text-vytal-muted" : "text-vytal-muted/50 line-through"
                        )}>
                          {t(sub.labelKey)}
                        </span>
                        <ToggleSwitch enabled={toggles[sub.key]} onToggle={() => toggle(sub.key)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Theme & PWA */}
        <div className="space-y-6">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">{t("appConfig.theme")}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("appConfig.background")}</label>
                <div className="flex gap-3">
                  {(["dark", "light"] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, bgTheme: theme }))}
                      className={cn(
                        "flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                        bgTheme === theme
                          ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                          : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-vytal-text">{t("appConfig.allowMemberColorChange")}</span>
                <ToggleSwitch
                  enabled={allowColorChange}
                  onToggle={() => setConfig((prev) => ({ ...prev, allowColorChange: !prev.allowColorChange }))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">{t("appConfig.pwaSettings")}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("appConfig.appIcon")}</label>
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-vytal-border bg-vytal-bg2">
                  <Camera className="h-6 w-6 text-vytal-muted" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("appConfig.splashColor")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={splashColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, splashColor: e.target.value }))}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-vytal-border bg-transparent"
                  />
                  <span className="font-mono text-sm text-vytal-muted">{splashColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
