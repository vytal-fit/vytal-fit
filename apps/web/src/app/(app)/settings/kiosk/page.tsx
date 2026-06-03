"use client";

import { useState } from "react";
import { Monitor, Camera, QrCode, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

const timingOptions = [
  { value: "beginning", label: "At beginning" },
  { value: "5min", label: "5 min before" },
  { value: "15min", label: "15 min before" },
  { value: "30min", label: "30 min before" },
  { value: "60min", label: "60 min before" },
];

const themeColors = [
  "#22c55e", "#00d4ff", "#ffb300", "#ff4757",
  "#c084fc", "#ff8c42", "#ffffff", "#6b8c72",
];

export default function KioskConfigPage() {
  const { t } = useI18n();
  const [images, setImages] = useState(Array(6).fill(""));
  const [overlays, setOverlays] = useState(Array(6).fill(""));
  const [timing, setTiming] = useState("15min");
  const [themeColor, setThemeColor] = useState("#22c55e");
  const [newMemberReg, setNewMemberReg] = useState(true);
  const [digitalSignature, setDigitalSignature] = useState(true);
  const [checkIn, setCheckIn] = useState(true);
  const [scoreLogging, setScoreLogging] = useState(false);

  function updateOverlay(index: number, value: string) {
    if (value.length <= 30) {
      const next = [...overlays];
      next[index] = value;
      setOverlays(next);
    }
  }

  function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
    return (
      <div className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-vytal-bg2">
        <span className="text-sm text-vytal-text">{label}</span>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: t("kiosk.title") },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("kiosk.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("kiosk.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Slots */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)] lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Camera className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Slideshow Images</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {images.map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-vytal-border bg-vytal-bg2">
                  <div className="text-center">
                    <Camera className="mx-auto h-6 w-6 text-vytal-muted" />
                    <p className="mt-1 text-[10px] text-vytal-muted">Image {i + 1}</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={overlays[i]}
                  onChange={(e) => updateOverlay(i, e.target.value)}
                  placeholder="Text overlay (max 30)"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                />
                <span className="text-[10px] text-vytal-muted">{overlays[i].length}/30</span>
              </div>
            ))}
          </div>
        </div>

        {/* Check-in Settings */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
          <div className="mb-5 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Check-in Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Check-in Timing</label>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {timingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <Toggle enabled={newMemberReg} onToggle={() => setNewMemberReg(!newMemberReg)} label="New member registration" />
              <Toggle enabled={digitalSignature} onToggle={() => setDigitalSignature(!digitalSignature)} label="Digital signature" />
              <Toggle enabled={checkIn} onToggle={() => setCheckIn(!checkIn)} label="Check-in" />
              <Toggle enabled={scoreLogging} onToggle={() => setScoreLogging(!scoreLogging)} label="Score logging" />
            </div>
          </div>
        </div>

        {/* Theme & QR */}
        <div className="space-y-6">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">Theme Color</h2>
            <div className="flex flex-wrap gap-3">
              {themeColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setThemeColor(color)}
                  className={cn(
                    "h-10 w-10 rounded-lg border-2 transition-transform",
                    themeColor === color ? "scale-110 border-white" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
            <div className="mb-5 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">Tablet Launch</h2>
            </div>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-vytal-border bg-vytal-bg2 p-8">
              <div className="text-center">
                <QrCode className="mx-auto h-16 w-16 text-vytal-muted" />
                <p className="mt-2 text-sm text-vytal-muted">QR Code</p>
                <p className="text-xs text-vytal-muted">Scan to launch kiosk on tablet</p>
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
