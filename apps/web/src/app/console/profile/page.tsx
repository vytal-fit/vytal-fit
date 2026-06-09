"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Bell,
  Globe,
  LogOut,
  ChevronRight,
  CheckCircle,
  Calendar,
  Shield,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useDataStore } from "@/stores/data-store";
import { useAppStore } from "@/stores/app-store";
import { useI18n } from "@/lib/i18n";


const MOCK_PAYMENTS = [
  { id: "p-1", description: "Plano Mensal — Junho 2026", amount: "65,00 €", date: "01/06/2026" },
  { id: "p-2", description: "Plano Mensal — Maio 2026",  amount: "65,00 €", date: "01/05/2026" },
  { id: "p-3", description: "Plano Mensal — Abril 2026", amount: "65,00 €", date: "01/04/2026" },
  { id: "p-4", description: "Plano Mensal — Marco 2026", amount: "65,00 €", date: "01/03/2026" },
];

// Badge keys resolved via t() inside the component
const MOCK_BADGE_KEYS = [
  { emoji: "🔥", labelKey: "my.profile.badge.dedicated",   descKey: "my.profile.badge.dedicatedDesc" },
  { emoji: "💎", labelKey: "my.profile.badge.century",     descKey: "my.profile.badge.centuryDesc" },
  { emoji: "🏆", labelKey: "my.profile.badge.champ",       descKey: "my.profile.badge.champDesc" },
  { emoji: "⚡", labelKey: "my.profile.badge.starter",     descKey: "my.profile.badge.starterDesc" },
];

export default function ProfilePage() {
  const { user, hydrate, logout } = useAuthStore();
  const { members, plans, subscriptions } = useDataStore();
  const { theme, toggleTheme, hydrate: hydrateApp } = useAppStore();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState("pt");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPayments, setShowPayments] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
    hydrateApp();
    setMounted(true);
  }, [hydrate, hydrateApp]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const member = members?.[0];
  const initials = user?.user?.name
    ? user.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AT";
  const userName = user?.user?.name ?? "Atleta";
  const userEmail = user?.user?.email ?? "atleta@vytal.fit";

  const activeSub = (subscriptions ?? []).find((s) => s.status === "active" || s.status === "paused");
  const plan = activeSub?.plan ?? (plans ?? [])[0] ?? null;

  const memberSince = member?.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })
    : "Janeiro 2024";

  const planTypeLabel: Record<string, string> = {
    monthly:   t("my.profile.planMonthly"),
    quarterly: t("my.profile.planQuarterly"),
    semester:  t("my.profile.planSemester"),
    annual:    t("my.profile.planAnnual"),
  };

  const languageOptions = [
    { value: "pt", label: t("my.profile.langPt") },
    { value: "en", label: t("my.profile.langEn") },
    { value: "es", label: t("my.profile.langEs") },
  ];

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl animate-slide-in-right flex items-center gap-2"
          style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
        >
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {/* ── Avatar + name hero ── */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, var(--color-vytal-bg2) 60%)",
          border: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)" }}
        />

        {/* Avatar with gradient ring */}
        <div className="relative mb-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black relative z-10"
            style={{
              background: "linear-gradient(135deg, var(--color-vytal-green), #16a34a)",
              color: "var(--color-vytal-bg)",
            }}
          >
            {initials}
          </div>
          {/* Pulsing ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
            style={{ background: "var(--color-vytal-green)" }}
          />
          {/* Static outer ring */}
          <div
            className="absolute -inset-1.5 rounded-full pointer-events-none"
            style={{
              background: "transparent",
              border: "2px solid rgba(34,197,94,0.3)",
            }}
          />
        </div>

        <h1 className="text-2xl font-black" style={{ color: "var(--color-vytal-text)" }}>
          {userName}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
          {userEmail}
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          <Calendar size={11} style={{ color: "var(--color-vytal-muted)" }} />
          <span className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.profile.memberSince")} {memberSince}
          </span>
        </div>

        {/* Pro badge */}
        <div
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full mt-3"
          style={{
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          <Zap size={11} style={{ color: "var(--color-vytal-green)" }} />
          <span className="text-xs font-bold" style={{ color: "var(--color-vytal-green)" }}>
            {t("my.profile.memberPro")}
          </span>
        </div>
      </div>

      {/* ── Subscription card ── */}
      {plan && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "var(--color-vytal-bg2)",
            border: "1px solid var(--color-vytal-border)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)" }}
                >
                  <CreditCard size={13} style={{ color: "var(--color-vytal-green)" }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.profile.subscription")}
                </span>
              </div>

              <p className="font-black text-lg" style={{ color: "var(--color-vytal-text)" }}>
                {plan.name}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: "rgba(34,197,94,0.12)", color: "var(--color-vytal-green)" }}
                >
                  <CheckCircle size={9} />
                  {activeSub?.status === "active" ? t("my.profile.subActive") : t("my.profile.subPaused")}
                </span>
                {plan.sessionsPerWeek && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)" }}
                  >
                    {plan.sessionsPerWeek}{t("my.profile.perWeek")}
                  </span>
                )}
              </div>

              {activeSub?.nextBillingDate && (
                <p className="text-xs mt-2" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.profile.renewal")} {new Date(activeSub.nextBillingDate).toLocaleDateString("pt-PT")}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-2xl font-black" style={{ color: "var(--color-vytal-green)" }}>
                {plan.price}€
              </p>
              <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                {planTypeLabel[plan.type] ?? ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Achievements ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--color-vytal-bg2)",
          border: "1px solid var(--color-vytal-border)",
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-vytal-muted)" }}>
          {t("my.profile.achievements")}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {MOCK_BADGE_KEYS.map((badge, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.12)",
              }}
            >
              <span className="text-xl">{badge.emoji}</span>
              <p className="text-[10px] font-bold text-center leading-tight" style={{ color: "var(--color-vytal-text)" }}>
                {t(badge.labelKey)}
              </p>
              <p className="text-[8px] text-center leading-tight" style={{ color: "var(--color-vytal-muted)" }}>
                {t(badge.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payment history ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-vytal-bg2)",
          border: "1px solid var(--color-vytal-border)",
        }}
      >
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(34,197,94,0.03)] transition-colors"
          onClick={() => setShowPayments((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.1)" }}
            >
              <Shield size={13} style={{ color: "var(--color-vytal-muted)" }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--color-vytal-text)" }}>
              {t("my.profile.paymentHistory")}
            </span>
          </div>
          <ChevronRight
            size={15}
            style={{
              color: "var(--color-vytal-muted)",
              transform: showPayments ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>

        {showPayments && (
          <div style={{ borderTop: "1px solid var(--color-vytal-border)" }}>
            {MOCK_PAYMENTS.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-3.5"
                style={{
                  borderTop: i > 0 ? "1px solid var(--color-vytal-border)" : "none",
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-vytal-text)" }}>
                    {p.description}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
                    {p.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono" style={{ color: "var(--color-vytal-text)" }}>
                    {p.amount}
                  </p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(34,197,94,0.12)", color: "var(--color-vytal-green)" }}
                  >
                    {t("my.profile.payment.status")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Settings ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-vytal-bg2)",
          border: "1px solid var(--color-vytal-border)",
        }}
      >
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid var(--color-vytal-border)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.profile.settings")}
          </p>
        </div>

        {/* Language */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-vytal-border)" }}
        >
          <div className="flex items-center gap-3">
            <Globe size={15} style={{ color: "var(--color-vytal-muted)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-vytal-text)" }}>
                {t("my.profile.language")}
              </p>
              <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                {t("my.profile.languageSub")}
              </p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              showToast(t("my.profile.toastLanguage"));
            }}
            className="text-xs rounded-xl px-3 py-1.5 outline-none font-medium"
            style={{
              background: "var(--color-vytal-bg3)",
              color: "var(--color-vytal-text)",
              border: "1px solid var(--color-vytal-border)",
            }}
          >
            {languageOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Notifications toggle */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-vytal-border)" }}
        >
          <div className="flex items-center gap-3">
            <Bell size={15} style={{ color: "var(--color-vytal-muted)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-vytal-text)" }}>
                {t("my.profile.notifications")}
              </p>
              <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                {t("my.profile.notificationsSub")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setNotificationsEnabled((v) => !v);
              showToast(notificationsEnabled ? t("my.profile.toastNotifOff") : t("my.profile.toastNotifOn"));
            }}
            className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
            style={{
              background: notificationsEnabled ? "var(--color-vytal-green)" : "var(--color-vytal-bg3)",
              border: notificationsEnabled ? "1px solid var(--color-vytal-green)" : "1px solid var(--color-vytal-border)",
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
              style={{
                left: notificationsEnabled ? "calc(100% - 22px)" : "2px",
                background: notificationsEnabled ? "var(--color-vytal-bg)" : "var(--color-vytal-muted)",
              }}
            />
          </button>
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            {theme === "dark"
              ? <Moon size={15} style={{ color: "var(--color-vytal-muted)" }} />
              : <Sun size={15} style={{ color: "var(--color-vytal-muted)" }} />
            }
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-vytal-text)" }}>
                {t("my.profile.theme")}
              </p>
              <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                {theme === "dark" ? t("my.profile.themeDark") : t("my.profile.themeLight")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              toggleTheme();
              showToast(t("my.profile.toastTheme"));
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--color-vytal-bg3)",
              color: "var(--color-vytal-muted)",
              border: "1px solid var(--color-vytal-border)",
            }}
          >
            {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
            {theme === "dark" ? t("my.profile.themeToggleLight") : t("my.profile.themeToggleDark")}
          </button>
        </div>
      </div>

      {/* ── Logout ── */}
      <button
        onClick={() => {
          logout();
          showToast(t("my.profile.toastLogout"));
        }}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] hover:opacity-90"
        style={{
          background: "rgba(255,71,87,0.1)",
          color: "var(--color-vytal-red)",
          border: "1px solid rgba(255,71,87,0.2)",
        }}
      >
        <LogOut size={15} />
        {t("my.profile.logout")}
      </button>

      <p className="text-center text-[10px]" style={{ color: "var(--color-vytal-muted)", opacity: 0.5 }}>
        {t("my.profile.version")}
      </p>
    </div>
  );
}
