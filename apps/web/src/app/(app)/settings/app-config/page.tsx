"use client";

import { useState } from "react";
import { Smartphone, Save, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface SectionToggle {
  key: string;
  label: string;
  subOptions?: { key: string; label: string }[];
}

const appSections: SectionToggle[] = [
  { key: "classes", label: "Classes", subOptions: [
    { key: "book_class", label: "Book class" },
    { key: "drop_in", label: "Drop-in" },
    { key: "covid_cert", label: "COVID certificate" },
  ]},
  { key: "workouts", label: "Workouts" },
  { key: "records", label: "Records" },
  { key: "physical_eval", label: "Physical Evaluation" },
  { key: "dossiers", label: "Digital Dossiers" },
  { key: "news", label: "News" },
  { key: "store", label: "Store" },
  { key: "challenge", label: "Challenge" },
  { key: "ranking", label: "Ranking" },
  { key: "best_results", label: "Best Results" },
  { key: "fistbumps", label: "Fistbumps" },
  { key: "my_box", label: "My Box" },
  { key: "converters", label: "Converters" },
  { key: "timers", label: "Timers" },
  { key: "settings", label: "Settings" },
];

export default function AppConfigPage() {
  const { t } = useI18n();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of appSections) {
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
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          enabled ? "bg-vytal-green" : "bg-vytal-bg3"
        )}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", enabled ? "left-[22px]" : "left-0.5")} />
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("appConfig.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("appConfig.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={selectAll} className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-xs font-medium text-vytal-muted transition-colors hover:text-vytal-text">
            Select All
          </button>
          <button onClick={deselectAll} className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-xs font-medium text-vytal-muted transition-colors hover:text-vytal-text">
            Deselect All
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section Toggles */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">App Sections</h2>
          </div>
          <div className="space-y-3">
            {appSections.map((section) => (
              <div key={section.key}>
                <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-vytal-bg2">
                  <span className="text-sm font-medium text-vytal-text">{section.label}</span>
                  <ToggleSwitch enabled={toggles[section.key]} onToggle={() => toggle(section.key)} />
                </div>
                {section.subOptions && toggles[section.key] && (
                  <div className="ml-6 space-y-1 border-l border-vytal-border pl-4">
                    {section.subOptions.map((sub) => (
                      <div key={sub.key} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-vytal-bg2">
                        <span className="text-xs text-vytal-muted">{sub.label}</span>
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
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">Theme</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Background</label>
                <div className="flex gap-3">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBgTheme(t)}
                      className={cn(
                        "flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                        bgTheme === t
                          ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                          : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-vytal-text">Allow member color change</span>
                <ToggleSwitch enabled={allowColorChange} onToggle={() => setAllowColorChange(!allowColorChange)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">PWA Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">App Icon</label>
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-vytal-border bg-vytal-bg2">
                  <Camera className="h-6 w-6 text-vytal-muted" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Splash Color</label>
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
          Save Changes
        </button>
      </div>
    </div>
  );
}
