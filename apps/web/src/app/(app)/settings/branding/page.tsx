"use client";

import { useState, useRef } from "react";
import {
  Palette,
  Upload,
  Globe,
  Mail,
  Smartphone,
  Save,
  Image,
  Type,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useAppStore } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const fontOptions = [
  { label: "Inter", value: "Inter" },
  { label: "Outfit", value: "Outfit" },
  { label: "DM Sans", value: "DM Sans" },
  { label: "Manrope", value: "Manrope" },
  { label: "Poppins", value: "Poppins" },
];

export default function BrandingPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const accentColor = useAppStore((s) => s.accentColor);
  const setOrgAccentColor = useAppStore((s) => s.setOrgAccentColor);
  const activeOrgId = useAuthStore((s) => s.user?.activeOrganizationId) ?? "org-1";

  const primaryLogoRef = useRef<HTMLInputElement>(null);
  const iconLogoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const [primaryLogoName, setPrimaryLogoName] = useState<string | null>(null);
  const [iconLogoName, setIconLogoName] = useState<string | null>(null);
  const [faviconName, setFaviconName] = useState<string | null>(null);

  const [colors, setColors] = useState({
    primary: accentColor,
    secondary: "#3b82f6",
    background: "#0a0a0a",
    text: "#ffffff",
  });

  const [font, setFont] = useState("Inter");

  const [domain, setDomain] = useState({
    value: "app.crossfitaveiro.pt",
    sslStatus: "active" as "active" | "pending" | "error",
  });

  const [emailBranding, setEmailBranding] = useState({
    fromName: "CrossFit Aveiro",
    fromEmail: "no-reply@crossfitaveiro.pt",
    replyTo: "info@crossfitaveiro.pt",
    footerText: "CrossFit Aveiro - Rua do Desporto 42, 3800-100 Aveiro",
  });

  const [appBranding, setAppBranding] = useState({
    appName: "CrossFit Aveiro",
    splashColor: accentColor,
  });

  const [copiedDns, setCopiedDns] = useState(false);

  function updateColor(key: string, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }));
    if (key === "primary") {
      setOrgAccentColor(activeOrgId, value);
    }
  }

  function handleSave() {
    toast("Branding settings saved successfully", "success");
  }

  function handleCopyDns() {
    navigator.clipboard.writeText("CNAME app.crossfitaveiro.pt -> cname.vytal.fit");
    setCopiedDns(true);
    toast("DNS record copied to clipboard", "success");
    setTimeout(() => setCopiedDns(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: "Branding" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">White-Label & Branding</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Customize your platform appearance, emails, and mobile app branding.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo Section */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Image className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Logos</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Primary Logo */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Primary Logo
              </label>
              <input
                ref={primaryLogoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPrimaryLogoName(file.name);
                    toast(`Primary logo selected: ${file.name}`, "success");
                  }
                }}
              />
              <div
                onClick={() => primaryLogoRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-vytal-border p-6 transition-colors hover:border-vytal-green/30 hover:bg-vytal-green/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-vytal-green/10">
                  <span className="text-2xl font-bold text-vytal-green">V</span>
                </div>
                {primaryLogoName ? (
                  <p className="text-xs font-medium text-vytal-green">{primaryLogoName}</p>
                ) : (
                  <p className="text-xs text-vytal-muted">Click to upload</p>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    primaryLogoRef.current?.click();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </button>
              </div>
            </div>

            {/* Icon Logo */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Icon Logo (Mobile)
              </label>
              <input
                ref={iconLogoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIconLogoName(file.name);
                    toast(`Icon logo selected: ${file.name}`, "success");
                  }
                }}
              />
              <div
                onClick={() => iconLogoRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-vytal-border p-6 transition-colors hover:border-vytal-green/30 hover:bg-vytal-green/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-vytal-green/10">
                  <span className="text-2xl font-bold text-vytal-green">V</span>
                </div>
                {iconLogoName ? (
                  <p className="text-xs font-medium text-vytal-green">{iconLogoName}</p>
                ) : (
                  <p className="text-xs text-vytal-muted">Click to upload</p>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    iconLogoRef.current?.click();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </button>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Favicon
              </label>
              <input
                ref={faviconRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFaviconName(file.name);
                    toast(`Favicon selected: ${file.name}`, "success");
                  }
                }}
              />
              <div
                onClick={() => faviconRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-vytal-border p-6 transition-colors hover:border-vytal-green/30 hover:bg-vytal-green/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-vytal-bg3">
                  <span className="text-lg font-bold text-vytal-green">V</span>
                </div>
                {faviconName ? (
                  <p className="text-xs font-medium text-vytal-green">{faviconName}</p>
                ) : (
                  <p className="text-xs text-vytal-muted">Click to upload</p>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    faviconRef.current?.click();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Palette className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Colors</h2>
          </div>
          <div className="space-y-4">
            {(
              [
                { key: "primary", label: "Primary Color" },
                { key: "secondary", label: "Secondary Color" },
                { key: "background", label: "Background Color" },
                { key: "text", label: "Text Color" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {label}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-vytal-border bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 font-mono text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                  <div
                    className="h-10 w-16 shrink-0 rounded-lg border border-vytal-border"
                    style={{ backgroundColor: colors[key] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-6">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Type className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">Typography</h2>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Font Family
              </label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {fontOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 rounded-lg border border-vytal-border bg-vytal-bg2 p-4">
              <p className="text-lg font-bold text-vytal-text" style={{ fontFamily: font }}>
                The quick brown fox jumps over the lazy dog
              </p>
              <p className="mt-1 text-sm text-vytal-muted" style={{ fontFamily: font }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </div>
          </div>

          {/* Preview Card */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">Mobile App Preview</h2>
            </div>
            <div className="flex justify-center">
              <div className="w-40 rounded-2xl border-2 border-vytal-border bg-vytal-bg p-2.5" style={{ fontFamily: font }}>
                <div
                  className="mb-2.5 flex h-8 items-center justify-center rounded-xl text-[9px] font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {appBranding.appName}
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 rounded bg-vytal-bg3" />
                  <div className="h-2.5 w-3/4 rounded bg-vytal-bg3" />
                  <div
                    className="mt-3 flex h-5 items-center justify-center rounded-lg text-[7px] font-bold text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Book Class
                  </div>
                  <div className="h-2.5 rounded bg-vytal-bg3" />
                  <div className="h-2.5 w-2/3 rounded bg-vytal-bg3" />
                </div>
                <div className="mt-3 flex justify-around border-t border-vytal-border pt-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <div className="h-2 w-2 rounded-full bg-vytal-muted/30" />
                  <div className="h-2 w-2 rounded-full bg-vytal-muted/30" />
                  <div className="h-2 w-2 rounded-full bg-vytal-muted/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Domain */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Globe className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Custom Domain</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Domain
              </label>
              <input
                type="text"
                value={domain.value}
                onChange={(e) => setDomain((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="app.yourdomain.com"
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                SSL Status
              </label>
              <div className="flex items-center gap-2">
                {domain.sslStatus === "active" ? (
                  <CheckCircle className="h-4 w-4 text-vytal-green" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-vytal-amber" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    domain.sslStatus === "active"
                      ? "text-vytal-green"
                      : "text-vytal-amber"
                  )}
                >
                  {domain.sslStatus === "active"
                    ? "SSL Active"
                    : domain.sslStatus === "pending"
                    ? "SSL Pending"
                    : "SSL Error"}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                DNS Instructions
              </label>
              <div className="rounded-lg border border-vytal-border bg-vytal-bg2 p-3">
                <p className="mb-2 text-xs text-vytal-muted">
                  Add the following CNAME record to your DNS provider:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-vytal-bg3 px-3 py-2 font-mono text-xs text-vytal-text">
                    CNAME {domain.value} -&gt; cname.vytal.fit
                  </code>
                  <button
                    onClick={handleCopyDns}
                    className="flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg3 px-2.5 py-2 text-xs text-vytal-muted transition-colors hover:text-vytal-text"
                  >
                    {copiedDns ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Branding */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Mail className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Email Branding</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                From Name
              </label>
              <input
                type="text"
                value={emailBranding.fromName}
                onChange={(e) =>
                  setEmailBranding((prev) => ({ ...prev, fromName: e.target.value }))
                }
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                From Email
              </label>
              <input
                type="email"
                value={emailBranding.fromEmail}
                onChange={(e) =>
                  setEmailBranding((prev) => ({ ...prev, fromEmail: e.target.value }))
                }
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Reply-To Email
              </label>
              <input
                type="email"
                value={emailBranding.replyTo}
                onChange={(e) =>
                  setEmailBranding((prev) => ({ ...prev, replyTo: e.target.value }))
                }
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Footer Text
              </label>
              <textarea
                value={emailBranding.footerText}
                onChange={(e) =>
                  setEmailBranding((prev) => ({ ...prev, footerText: e.target.value }))
                }
                rows={2}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Mobile App Branding */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Mobile App Branding</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                App Name
              </label>
              <input
                type="text"
                value={appBranding.appName}
                onChange={(e) =>
                  setAppBranding((prev) => ({ ...prev, appName: e.target.value }))
                }
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Splash Screen Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appBranding.splashColor}
                  onChange={(e) =>
                    setAppBranding((prev) => ({ ...prev, splashColor: e.target.value }))
                  }
                  className="h-10 w-10 cursor-pointer rounded-lg border border-vytal-border bg-transparent"
                />
                <input
                  type="text"
                  value={appBranding.splashColor}
                  onChange={(e) =>
                    setAppBranding((prev) => ({ ...prev, splashColor: e.target.value }))
                  }
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 font-mono text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                App Icon Preview
              </label>
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg"
                style={{ backgroundColor: appBranding.splashColor }}
              >
                {appBranding.appName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          Save Branding
        </button>
      </div>
    </div>
  );
}
