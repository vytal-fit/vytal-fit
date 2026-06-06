"use client";

import { useState, useRef } from "react";
import {
  Settings,
  Globe,
  Building2,
  Save,
  Camera,
  Upload,
  Trash2,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/components/toast";
import { useAppStore } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { useDataStore } from "@/stores/data-store";
import { useI18n } from "@/lib/i18n";

const businessTypes = ["Box", "Gym", "Studio", "Academy", "Training Center"];
const timezones = [
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
];
const currencies = ["EUR", "USD", "GBP", "BRL"];

const accentPresets = [
  { label: "Green", color: "#22c55e" },
  { label: "Blue", color: "#3b82f6" },
  { label: "Purple", color: "#8b5cf6" },
  { label: "Red", color: "#ef4444" },
  { label: "Orange", color: "#f97316" },
  { label: "Pink", color: "#ec4899" },
  { label: "Teal", color: "#14b8a6" },
  { label: "Yellow", color: "#eab308" },
];

export default function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const accentColor = useAppStore((s) => s.accentColor);
  const setOrgAccentColor = useAppStore((s) => s.setOrgAccentColor);
  const activeOrgId = useAuthStore((s) => s.user?.activeOrganizationId) ?? "org-1";
  const orgSettings = useDataStore((s) => s.orgSettings);
  const updateOrgSettings = useDataStore((s) => s.updateOrgSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: orgSettings.name,
    slogan: orgSettings.slogan,
    email: orgSettings.email,
    phone: orgSettings.phone,
    businessType: orgSettings.businessType,
    timezone: orgSettings.timezone,
    currency: orgSettings.currency,
    website: orgSettings.website,
    facebook: orgSettings.facebook,
    instagram: orgSettings.instagram,
    youtube: orgSettings.youtube,
    address: orgSettings.address,
    city: orgSettings.city,
    zipCode: orgSettings.zipCode,
    country: orgSettings.country,
    brandColor: accentColor,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSave() {
    updateOrgSettings({
      name: form.name,
      slug: form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      slogan: form.slogan,
      email: form.email,
      phone: form.phone,
      businessType: form.businessType,
      timezone: form.timezone,
      currency: form.currency,
      website: form.website,
      facebook: form.facebook,
      instagram: form.instagram,
      youtube: form.youtube,
      address: form.address,
      city: form.city,
      zipCode: form.zipCode,
      country: form.country,
    });
    toast(t("toast.settingsSaved"), "success");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("settings.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("settings.subtitle")}
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("action.save")}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* General Information */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">
              {t("settings.generalInfo")}
            </h2>
          </div>
          <div className="space-y-4">
            <Field
              label={t("settings.boxName")}
              value={form.name}
              onChange={(v) => update("name", v)}
            />
            <Field
              label={t("settings.slogan")}
              value={form.slogan}
              onChange={(v) => update("slogan", v)}
            />
            <Field
              label={t("settings.email")}
              value={form.email}
              onChange={(v) => update("email", v)}
              type="email"
            />
            <Field
              label={t("settings.phone")}
              value={form.phone}
              onChange={(v) => update("phone", v)}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("settings.businessType")}
              </label>
              <select
                value={form.businessType}
                onChange={(e) => update("businessType", e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {businessTypes.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("settings.timezone")}
                </label>
                <select
                  value={form.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("settings.currency")}
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Logo & Branding */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Camera className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">
                {t("settings.logo")}
              </h2>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLogoFileName(file.name);
                  toast(t("toast.logoSelected").replace("{name}", file.name), "success");
                }
              }}
            />
            <div
              className="group flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed border-vytal-border p-8 transition-colors hover:border-vytal-green/30 hover:bg-vytal-green/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-vytal-green/10">
                <span className="text-3xl font-bold text-vytal-green">V</span>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-vytal-card bg-vytal-bg3 text-vytal-muted transition-colors group-hover:bg-vytal-green/10 group-hover:text-vytal-green">
                  <Camera className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-center">
                {logoFileName ? (
                  <p className="text-sm font-medium text-vytal-green">{logoFileName}</p>
                ) : (
                  <p className="text-sm text-vytal-muted">
                    {t("settings.dragDropLogo")}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-vytal-muted">
                  {t("settings.logoHint")}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
              >
                <Upload className="h-3.5 w-3.5" />
                {t("settings.uploadLogo")}
              </button>
            </div>
          </div>

          {/* Brand Color & Mobile App Preview */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">
                {t("settings.brandColor")}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Color Picker */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("settings.primaryColor")}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => {
                        setOrgAccentColor(activeOrgId, e.target.value);
                        update("brandColor", e.target.value);
                      }}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-vytal-border bg-transparent"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => {
                        setOrgAccentColor(activeOrgId, e.target.value);
                        update("brandColor", e.target.value);
                      }}
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 font-mono text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </div>
                </div>
                {/* Preset Colors */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("settings.presets")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {accentPresets.map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => {
                          setOrgAccentColor(activeOrgId, preset.color);
                          update("brandColor", preset.color);
                        }}
                        className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: preset.color,
                          borderColor: accentColor === preset.color ? "white" : "transparent",
                        }}
                        title={preset.label}
                      >
                        {accentColor === preset.color && (
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Mini Phone Preview */}
              <div className="flex justify-center">
                <div className="w-32 rounded-2xl border-2 border-vytal-border bg-vytal-bg p-2">
                  <div
                    className="mb-2 flex h-6 items-center justify-center rounded-lg text-[8px] font-bold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {form.name}
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded bg-vytal-bg3" />
                    <div className="h-2 w-3/4 rounded bg-vytal-bg3" />
                    <div
                      className="mt-2 flex h-4 items-center justify-center rounded text-[6px] font-bold text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {t("settings.bookClass")}
                    </div>
                    <div className="h-2 rounded bg-vytal-bg3" />
                    <div className="h-2 w-1/2 rounded bg-vytal-bg3" />
                  </div>
                  <div className="mt-2 flex justify-around border-t border-vytal-border pt-1">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-vytal-muted/30" />
                    <div className="h-1.5 w-1.5 rounded-full bg-vytal-muted/30" />
                    <div className="h-1.5 w-1.5 rounded-full bg-vytal-muted/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Globe className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">
                {t("settings.addressSection")}
              </h2>
            </div>
            <div className="space-y-4">
              <Field
                label={t("settings.address")}
                value={form.address}
                onChange={(v) => update("address", v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={t("settings.city")}
                  value={form.city}
                  onChange={(v) => update("city", v)}
                />
                <Field
                  label={t("settings.zipCode")}
                  value={form.zipCode}
                  onChange={(v) => update("zipCode", v)}
                />
              </div>
              <Field
                label={t("settings.country")}
                value={form.country}
                onChange={(v) => update("country", v)}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Globe className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">
              {t("settings.socialLinks")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-vytal-muted">
                <Globe className="h-3.5 w-3.5" />
                Website
              </label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                <span className="text-[#1877F2]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </span>
                <span className="text-vytal-muted">Facebook</span>
              </label>
              <input
                type="text"
                value={form.facebook}
                onChange={(e) => update("facebook", e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                <span className="text-[#E4405F]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg>
                </span>
                <span className="text-vytal-muted">Instagram</span>
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                <span className="text-[#FF0000]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </span>
                <span className="text-vytal-muted">YouTube</span>
              </label>
              <input
                type="text"
                value={form.youtube}
                onChange={(e) => update("youtube", e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-vytal-red/20 bg-vytal-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-vytal-red" />
          <h2 className="text-lg font-semibold text-vytal-red">{t("settings.dangerZone")}</h2>
        </div>
        <p className="mb-4 text-sm text-vytal-muted">
          {t("settings.deleteOrgWarning")}
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-lg border border-vytal-red/30 bg-vytal-red/5 px-4 py-2.5 text-sm font-semibold text-vytal-red transition-colors hover:bg-vytal-red/10"
          >
            <Trash2 className="h-4 w-4" />
            {t("settings.deleteOrg")}
          </button>
        ) : (
          <div className="space-y-3 rounded-lg border border-vytal-red/20 bg-vytal-red/5 p-4">
            <p className="text-sm font-medium text-vytal-red">
              {t("settings.typeToConfirm").replace("{name}", form.name)}
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={form.name}
              className="w-full rounded-lg border border-vytal-red/20 bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-red/40 focus:outline-none focus:ring-1 focus:ring-vytal-red/20"
            />
            <div className="flex gap-2">
              <button
                disabled={deleteConfirmText !== form.name}
                onClick={() => {
                  if (deleteConfirmText === form.name) {
                    toast(t("settings.orgDeleted"), "error");
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-vytal-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-vytal-red/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                {t("settings.permanentlyDelete")}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
              >
                {t("action.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
      />
    </div>
  );
}
