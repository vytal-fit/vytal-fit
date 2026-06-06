"use client";

import { useState } from "react";
import { Monitor, Camera, QrCode, Save, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

const timingOptions = [
  { value: "beginning", labelKey: "kiosk.atBeginning" },
  { value: "5min", labelKey: "kiosk.5minBefore" },
  { value: "15min", labelKey: "kiosk.15minBefore" },
  { value: "30min", labelKey: "kiosk.30minBefore" },
  { value: "60min", labelKey: "kiosk.60minBefore" },
];

const themeColors = [
  "#22c55e", "#00d4ff", "#ffb300", "#ff4757",
  "#c084fc", "#ff8c42", "#ffffff", "#6b8c72",
];

// Simple QR-like pattern (8x8 grid)
const QR_PATTERN = [
  [1,1,1,1,1,1,1,0],
  [1,0,0,0,0,0,1,0],
  [1,0,1,1,1,0,1,0],
  [1,0,1,1,1,0,1,0],
  [1,0,1,1,1,0,1,0],
  [1,0,0,0,0,0,1,0],
  [1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0],
];

export default function KioskConfigPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [images] = useState(Array(6).fill(""));
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
            "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
            enabled ? "bg-vytal-green" : "bg-vytal-bg3"
          )}
        >
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300", enabled ? "left-[22px]" : "left-0.5")} />
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

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("kiosk.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("kiosk.subtitle")}
          </p>
        </div>
        <button
          onClick={() => toast(t("action.save"), "success")}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("action.save")}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Slots */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)] lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Camera className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">{t("kiosk.slideshowImages")}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {images.map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="group relative flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-vytal-border bg-gradient-to-br from-vytal-bg2 to-vytal-bg3 transition-all hover:border-vytal-green/30">
                  {/* Number badge */}
                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg bg-vytal-bg font-mono text-xs font-bold text-vytal-muted">
                    {i + 1}
                  </span>
                  <div className="text-center">
                    <Camera className="mx-auto h-6 w-6 text-vytal-muted/40 transition-colors group-hover:text-vytal-green/60" />
                    <p className="mt-1 text-[10px] text-vytal-muted/60">{t("kiosk.imageN").replace("{n}", String(i + 1))}</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={overlays[i]}
                  onChange={(e) => updateOverlay(i, e.target.value)}
                  placeholder={t("kiosk.textOverlay")}
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
            <h2 className="text-lg font-semibold text-vytal-text">{t("kiosk.checkInSettings")}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("kiosk.checkInTiming")}</label>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {timingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <Toggle enabled={newMemberReg} onToggle={() => setNewMemberReg(!newMemberReg)} label={t("kiosk.newMemberRegistration")} />
              <Toggle enabled={digitalSignature} onToggle={() => setDigitalSignature(!digitalSignature)} label={t("kiosk.digitalSignature")} />
              <Toggle enabled={checkIn} onToggle={() => setCheckIn(!checkIn)} label={t("kiosk.checkIn")} />
              <Toggle enabled={scoreLogging} onToggle={() => setScoreLogging(!scoreLogging)} label={t("kiosk.scoreLogging")} />
            </div>
          </div>
        </div>

        {/* Theme & QR */}
        <div className="space-y-6">
          {/* Theme Color + Button Preview */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">{t("kiosk.themeColor")}</h2>
            <div className="flex flex-wrap gap-3">
              {themeColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setThemeColor(color)}
                  className={cn(
                    "h-10 w-10 rounded-lg border-2 transition-all duration-200",
                    themeColor === color ? "scale-110 border-white shadow-lg" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {/* Button Preview */}
            <div className="mt-5 space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("kiosk.buttonPreview")}
              </label>
              <div className="flex items-center justify-center rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
                <button
                  className="flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: themeColor,
                    color: themeColor === "#ffffff" ? "#080c0a" : "#ffffff",
                    boxShadow: `0 4px 20px ${themeColor}40`,
                  }}
                >
                  <ScanLine className="h-6 w-6" />
                  {t("kiosk.checkInButton")}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
            <div className="mb-5 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">{t("kiosk.tabletLaunch")}</h2>
            </div>
            <div className="flex items-center justify-center rounded-xl border border-vytal-border bg-white p-6">
              <div className="text-center">
                {/* QR-like pattern */}
                <div className="mx-auto inline-grid gap-0.5" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
                  {QR_PATTERN.flat().map((cell, idx) => (
                    <div
                      key={idx}
                      className="h-3 w-3 rounded-[1px]"
                      style={{ backgroundColor: cell ? "#080c0a" : "#ffffff" }}
                    />
                  ))}
                </div>
                {/* Bottom part of QR */}
                <div className="mx-auto mt-0.5 inline-grid gap-0.5" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
                  {[0,1,0,1,1,0,1,0, 1,0,1,0,0,1,0,1, 0,1,1,1,1,1,0,0, 1,1,0,0,1,0,1,1,
                    1,0,1,0,1,1,0,1, 0,0,1,1,0,1,1,0, 1,1,1,1,1,1,1,0, 1,0,0,1,0,0,1,0].map((cell, idx) => (
                    <div
                      key={idx}
                      className="h-3 w-3 rounded-[1px]"
                      style={{ backgroundColor: cell ? "#080c0a" : "#ffffff" }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-xs font-medium text-gray-600">{t("kiosk.scanToLaunch")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
