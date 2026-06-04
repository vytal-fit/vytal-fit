"use client";

import { useState } from "react";
import { Smartphone, Save, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

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

export default function AppConfigPage() {
  const { t } = useI18n();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of appSectionDefs) {
      initial[section.key] = true;
      if (section.subOptions) {
        for (const sub of section.subOptions) {
          initial[sub.key] = true;
        }
      }
    }
    return initial;
  });

  const [bgTheme, setBgTheme] = useState<"dark" | "light">("dark");
  const [allowColorChange, setAllowColorChange] = useState(true);
  const [splashColor, setSplashColor] = useState("#080c0a");

  function toggle(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function selectAll() {
    setToggles((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) next[k] = true;
      return next;
    });
  }

  function deselectAll() {
    setToggles((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) next[k] = false;
      return next;
    });
  }

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("appConfig.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("appConfig.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={selectAll} className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-xs font-medium text-vytal-muted transition-colors hover:text-vytal-text">
            {t("appConfig.selectAll")}
          </button>
          <button onClick={deselectAll} className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-xs font-medium text-vytal-muted transition-colors hover:text-vytal-text">
            {t("appConfig.deselectAll")}
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
                  <span className="text-sm font-medium text-vytal-text">{t(section.labelKey)}</span>
                  <ToggleSwitch enabled={toggles[section.key]} onToggle={() => toggle(section.key)} />
                </div>
                {section.subOptions && toggles[section.key] && (
                  <div className="ml-6 space-y-1 border-l border-vytal-border pl-4">
                    {section.subOptions.map((sub) => (
                      <div key={sub.key} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-vytal-bg2">
                        <span className="text-xs text-vytal-muted">{t(sub.labelKey)}</span>
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
                      onClick={() => setBgTheme(theme)}
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
                <ToggleSwitch enabled={allowColorChange} onToggle={() => setAllowColorChange(!allowColorChange)} />
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
                    onChange={(e) => setSplashColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-vytal-border bg-transparent"
                  />
                  <span className="font-mono text-sm text-vytal-muted">{splashColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
          <Save className="h-4 w-4" />
          {t("action.save")}
        </button>
      </div>
    </div>
  );
}
