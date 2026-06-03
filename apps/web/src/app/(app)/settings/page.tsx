"use client";

import { useState } from "react";
import { Settings, Globe, Building2, Save } from "lucide-react";

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

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "CrossFit Vytal",
    slogan: "Forging Elite Fitness",
    email: "info@vytal.fit",
    phone: "+351 912 345 678",
    businessType: "Box",
    timezone: "Europe/Lisbon",
    currency: "EUR",
    website: "https://vytal.fit",
    facebook: "https://facebook.com/crossfitvytal",
    instagram: "https://instagram.com/crossfitvytal",
    youtube: "https://youtube.com/@crossfitvytal",
    address: "Rua do CrossFit 123",
    city: "Lisboa",
    zipCode: "1200-001",
    country: "Portugal",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Settings</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Manage your box profile and preferences
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* General Information */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">
              General Information
            </h2>
          </div>
          <div className="space-y-4">
            <Field
              label="Box Name"
              value={form.name}
              onChange={(v) => update("name", v)}
            />
            <Field
              label="Slogan"
              value={form.slogan}
              onChange={(v) => update("slogan", v)}
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => update("email", v)}
              type="email"
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => update("phone", v)}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Business Type
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
                  Timezone
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
                  Currency
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
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Settings className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">
                Logo
              </h2>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-vytal-border p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-vytal-green/10">
                <span className="text-3xl font-bold text-vytal-green">V</span>
              </div>
              <p className="text-sm text-vytal-muted">
                Drag and drop your logo here, or click to browse
              </p>
              <button className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3">
                Upload Logo
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Globe className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">
                Address
              </h2>
            </div>
            <div className="space-y-4">
              <Field
                label="Address"
                value={form.address}
                onChange={(v) => update("address", v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="City"
                  value={form.city}
                  onChange={(v) => update("city", v)}
                />
                <Field
                  label="Zip Code"
                  value={form.zipCode}
                  onChange={(v) => update("zipCode", v)}
                />
              </div>
              <Field
                label="Country"
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
              Social Links
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Website"
              value={form.website}
              onChange={(v) => update("website", v)}
            />
            <Field
              label="Facebook"
              value={form.facebook}
              onChange={(v) => update("facebook", v)}
            />
            <Field
              label="Instagram"
              value={form.instagram}
              onChange={(v) => update("instagram", v)}
            />
            <Field
              label="YouTube"
              value={form.youtube}
              onChange={(v) => update("youtube", v)}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
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
