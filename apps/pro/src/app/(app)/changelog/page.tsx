"use client";

import { Newspaper, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Release {
  version: string;
  date: string;
  isLatest: boolean;
  features: { icon: string; text: string }[];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const releases: Release[] = [
  {
    version: "v2.4",
    date: "June 2026",
    isLatest: true,
    features: [
      { icon: "brain", text: "AI Insights dashboard with churn prediction and smart recommendations" },
      { icon: "calendar", text: "Smart Scheduling with AI-powered class time optimization" },
      { icon: "activity", text: "Body Composition tracking with progress charts and goal setting" },
      { icon: "map", text: "Multi-Location Dashboard for gym chains" },
      { icon: "image", text: "Media Library for centralized content management" },
      { icon: "wrench", text: "Equipment Inventory with maintenance tracking" },
    ],
  },
  {
    version: "v2.3",
    date: "May 2026",
    isLatest: false,
    features: [
      { icon: "check-square", text: "Task Management with drag-and-drop kanban board" },
      { icon: "inbox", text: "Unified Inbox aggregating all conversations" },
      { icon: "gift", text: "Gift Cards & Vouchers for the POS store" },
      { icon: "apple", text: "Nutrition Tracking with meal plans and macros" },
      { icon: "trophy", text: "Milestone Automation for member achievements" },
      { icon: "award", text: "Achievement Badges system with 63+ badges" },
    ],
  },
  {
    version: "v2.2",
    date: "April 2026",
    isLatest: false,
    features: [
      { icon: "trending-up", text: "Revenue Forecasting with trend analysis and projections" },
      { icon: "user", text: "Member 360 View -- complete member profile at a glance" },
      { icon: "award", text: "Achievement Badges with points and level progression" },
      { icon: "bar-chart", text: "Dashboard Customization with widget rearrangement" },
      { icon: "shield", text: "Audit Trail for complete admin action logging" },
      { icon: "clipboard", text: "Questionnaires builder for member surveys" },
    ],
  },
  {
    version: "v2.1",
    date: "March 2026",
    isLatest: false,
    features: [
      { icon: "dollar-sign", text: "Staff Payroll management with hours tracking" },
      { icon: "credit-card", text: "SEPA Direct Debit for automated recurring payments" },
      { icon: "file-text", text: "Digital Contracts with e-signature support" },
      { icon: "users", text: "Referral Program with tracking and rewards" },
      { icon: "shopping-bag", text: "POS Store for product sales and inventory" },
      { icon: "zap", text: "Webhooks & API Keys for developer integrations" },
    ],
  },
  {
    version: "v2.0",
    date: "February 2026",
    isLatest: false,
    features: [
      { icon: "layers", text: "Multi-vertical support -- 20 fitness/wellness business types" },
      { icon: "building", text: "Multi-organization model -- users across multiple gyms" },
      { icon: "globe", text: "i18n -- full Portuguese, English, and Spanish translations" },
      { icon: "tv", text: "TV Display / Coachboard with remote control" },
      { icon: "target", text: "Competition Builder with heats and scoring" },
      { icon: "lock", text: "Permissions system with granular RBAC" },
    ],
  },
  {
    version: "v1.0",
    date: "January 2026",
    isLatest: false,
    features: [
      { icon: "calendar", text: "Class Calendar with booking, waitlist, and attendance" },
      { icon: "users", text: "Member Management with profiles, plans, and billing" },
      { icon: "dumbbell", text: "WOD Builder with structured programming and movement library" },
      { icon: "user-plus", text: "CRM Pipeline with lead tracking and automations" },
      { icon: "layout", text: "Operations Dashboard with KPIs and real-time alerts" },
      { icon: "credit-card", text: "Financials with invoicing, expenses, and budget tracking" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChangelogPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Newspaper className="h-6 w-6 text-vytal-green" />
        <h1 className="text-2xl font-bold text-vytal-text">{t("changelog.title")}</h1>
      </div>
      <p className="text-sm text-vytal-muted">{t("changelog.subtitle")}</p>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-vytal-border" />

        <div className="space-y-8">
          {releases.map((release) => (
            <div key={release.version} className="relative pl-12">
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute left-2 top-1 h-4 w-4 rounded-full border-2",
                  release.isLatest
                    ? "border-vytal-green bg-vytal-green"
                    : "border-vytal-border bg-vytal-bg2"
                )}
              />

              {/* Card */}
              <div className={cn(
                "rounded-xl border bg-vytal-bg2 p-5",
                release.isLatest ? "border-vytal-green/30" : "border-vytal-border"
              )}>
                {/* Version header */}
                <div className="mb-3 flex items-center gap-3">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    release.isLatest
                      ? "bg-vytal-green/10 text-vytal-green"
                      : "bg-vytal-bg3 text-vytal-text"
                  )}>
                    {release.version}
                  </span>
                  <span className="text-xs text-vytal-muted">{release.date}</span>
                  {release.isLatest && (
                    <span className="flex items-center gap-1 rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">
                      <Sparkles className="h-3 w-3" />
                      NEW
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {release.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-vytal-bg3 text-[10px]">
                        {feature.icon === "brain" ? "\u{1F9E0}" :
                         feature.icon === "calendar" ? "\u{1F4C5}" :
                         feature.icon === "activity" ? "\u{1F4CA}" :
                         feature.icon === "map" ? "\u{1F5FA}" :
                         feature.icon === "image" ? "\u{1F5BC}" :
                         feature.icon === "wrench" ? "\u{1F527}" :
                         feature.icon === "check-square" ? "\u{2705}" :
                         feature.icon === "inbox" ? "\u{1F4E5}" :
                         feature.icon === "gift" ? "\u{1F381}" :
                         feature.icon === "apple" ? "\u{1F34E}" :
                         feature.icon === "trophy" ? "\u{1F3C6}" :
                         feature.icon === "award" ? "\u{1F3C5}" :
                         feature.icon === "trending-up" ? "\u{1F4C8}" :
                         feature.icon === "user" ? "\u{1F464}" :
                         feature.icon === "bar-chart" ? "\u{1F4CA}" :
                         feature.icon === "shield" ? "\u{1F6E1}" :
                         feature.icon === "clipboard" ? "\u{1F4CB}" :
                         feature.icon === "dollar-sign" ? "\u{1F4B2}" :
                         feature.icon === "credit-card" ? "\u{1F4B3}" :
                         feature.icon === "file-text" ? "\u{1F4C4}" :
                         feature.icon === "users" ? "\u{1F465}" :
                         feature.icon === "shopping-bag" ? "\u{1F6CD}" :
                         feature.icon === "zap" ? "\u{26A1}" :
                         feature.icon === "layers" ? "\u{1F4DA}" :
                         feature.icon === "building" ? "\u{1F3E2}" :
                         feature.icon === "globe" ? "\u{1F310}" :
                         feature.icon === "tv" ? "\u{1F4FA}" :
                         feature.icon === "target" ? "\u{1F3AF}" :
                         feature.icon === "lock" ? "\u{1F512}" :
                         feature.icon === "dumbbell" ? "\u{1F3CB}" :
                         feature.icon === "user-plus" ? "\u{1F464}" :
                         feature.icon === "layout" ? "\u{1F4CA}" :
                         "\u{2728}"}
                      </span>
                      <span className="text-sm text-vytal-text">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
