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
import { useAuthStore } from "@/stores/auth-store";
import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/stores/app-store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";



// Achievement catalog. `earned` derives real unlock state from member stats —
// no fabricated "all unlocked" badges; labels/descs resolved via t().
const BADGE_DEFS: {
  emoji: string;
  labelKey: string;
  descKey: string;
  earned: (s: { streakWeeks: number; totalCheckIns: number; prCount: number }) => boolean;
}[] = [
  { emoji: "⚡", labelKey: "my.profile.badge.starter",   descKey: "my.profile.badge.starterDesc",   earned: (s) => s.totalCheckIns >= 1 },
  { emoji: "🔥", labelKey: "my.profile.badge.dedicated", descKey: "my.profile.badge.dedicatedDesc", earned: (s) => s.streakWeeks >= 4 },
  { emoji: "💎", labelKey: "my.profile.badge.century",   descKey: "my.profile.badge.centuryDesc",   earned: (s) => s.totalCheckIns >= 100 },
  { emoji: "🏆", labelKey: "my.profile.badge.champ",     descKey: "my.profile.badge.champDesc",     earned: (s) => s.prCount >= 1 },
];

export default function ProfilePage() {
  const { user, hydrate, logout } = useAuthStore();
  const meQuery = trpc.members.me.useQuery();
  const memberId = meQuery.data?.id ?? null;
  const subsQuery = trpc.subscriptions.byMember.useQuery(
    { memberId: memberId ?? "" },
    { enabled: !!memberId },
  );
  const plansQuery = trpc.subscriptions.plans.list.useQuery();
  const paymentsQuery = trpc.payments.byMember.useQuery(
    { memberId: memberId ?? "" },
    { enabled: !!memberId },
  );
  const prQuery = trpc.personalRecords.list.useQuery(
    { memberId: memberId ?? "" },
    { enabled: !!memberId },
  );
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
          className="w-8 h-8 rounded-full border-2 border-vytal-green animate-spin"
          style={{ borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const member = meQuery.data ?? null;
  const initials = user?.user?.name
    ? user.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AT";
  const userName = user?.user?.name ?? "Atleta";
  const userEmail = user?.user?.email ?? "atleta@vytal.fit";

  const subs = subsQuery.data ?? [];
  const plansList = plansQuery.data ?? [];
  const activeSub = subs.find((s) => s.status === "active" || s.status === "paused") ?? null;
  const plan =
    plansList.find((p) => p.id === activeSub?.planId) ?? plansList[0] ?? null;

  const payments = (paymentsQuery.data ?? []).map((p) => {
    const when = p.paidAt ?? p.createdAt;
    return {
      id: p.id,
      description: p.reference
        ? `${t("my.profile.paymentHistory")} · ${p.reference}`
        : t("my.profile.paymentHistory"),
      amount: `${Number(p.amount).toFixed(2).replace(".", ",")} ${p.currency === "EUR" ? "€" : p.currency}`,
      date: new Date(when).toLocaleDateString("pt-PT"),
      paid: p.status === "paid",
    };
  });

  const memberSince = member?.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })
    : "—";

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
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl animate-slide-in-right flex items-center gap-2 bg-vytal-green text-vytal-bg"
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
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black relative z-10 text-vytal-bg"
            style={{
              background: "linear-gradient(135deg, var(--color-vytal-green), #16a34a)",
            }}
          >
            {initials}
          </div>
          {/* Pulsing ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none bg-vytal-green"
          />
          {/* Static outer ring */}
          <div
            className="absolute -inset-1.5 rounded-full pointer-events-none border-2 border-[rgba(34,197,94,0.3)]"
          />
        </div>

        <h1 className="text-2xl font-black text-vytal-text">
          {userName}
        </h1>
        <p className="text-sm mt-0.5 text-vytal-muted">
          {userEmail}
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          <Calendar size={11} className="text-vytal-muted" />
          <span className="text-xs text-vytal-muted">
            {t("my.profile.memberSince")} {memberSince}
          </span>
        </div>

        {/* Pro badge */}
        <div
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full mt-3 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)]"
        >
          <Zap size={11} className="text-vytal-green" />
          <span className="text-xs font-bold text-vytal-green">
            {t("my.profile.memberPro")}
          </span>
        </div>
      </div>

      {/* ── Subscription card ── */}
      {plan && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden bg-vytal-bg2 border border-vytal-border"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(34,197,94,0.15)]"
                >
                  <CreditCard size={13} className="text-vytal-green" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-vytal-muted">
                  {t("my.profile.subscription")}
                </span>
              </div>

              <p className="font-black text-lg text-vytal-text">
                {plan.name}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[rgba(34,197,94,0.12)] text-vytal-green"
                >
                  <CheckCircle size={9} />
                  {activeSub?.status === "active" ? t("my.profile.subActive") : t("my.profile.subPaused")}
                </span>
                {plan.sessionsPerWeek && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-vytal-bg3 text-vytal-muted"
                  >
                    {plan.sessionsPerWeek}{t("my.profile.perWeek")}
                  </span>
                )}
              </div>

              {activeSub?.nextBillingDate && (
                <p className="text-xs mt-2 text-vytal-muted">
                  {t("my.profile.renewal")} {new Date(activeSub.nextBillingDate).toLocaleDateString("pt-PT")}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-2xl font-black text-vytal-green">
                {plan.price}€
              </p>
              <p className="text-xs text-vytal-muted">
                {planTypeLabel[plan.type] ?? ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Achievements ── */}
      <div
        className="rounded-2xl p-5 bg-vytal-bg2 border border-vytal-border"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-vytal-muted">
          {t("my.profile.achievements")}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {BADGE_DEFS.map((badge, i) => {
            const earned = badge.earned({
              streakWeeks: meQuery.data?.streakWeeks ?? 0,
              totalCheckIns: meQuery.data?.totalCheckIns ?? 0,
              prCount: prQuery.data?.items.length ?? 0,
            });
            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 hover:scale-105 border",
                  earned
                    ? "bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.12)]"
                    : "bg-vytal-bg3 border-vytal-border opacity-40 grayscale",
                )}
              >
                <span className="text-xl">{badge.emoji}</span>
                <p className="text-[10px] font-bold text-center leading-tight text-vytal-text">
                  {t(badge.labelKey)}
                </p>
                <p className="text-[8px] text-center leading-tight text-vytal-muted">
                  {t(badge.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Payment history ── */}
      <div
        className="rounded-2xl overflow-hidden bg-vytal-bg2 border border-vytal-border"
      >
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(34,197,94,0.03)] transition-colors"
          onClick={() => setShowPayments((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center bg-[rgba(34,197,94,0.1)]"
            >
              <Shield size={13} className="text-vytal-muted" />
            </div>
            <span className="text-sm font-bold text-vytal-text">
              {t("my.profile.paymentHistory")}
            </span>
          </div>
          <ChevronRight
            size={15}
            className="text-vytal-muted"
            style={{
              transform: showPayments ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>

        {showPayments && (
          <div className="border-t border-vytal-border">
            {payments.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? "border-t border-vytal-border" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-vytal-text">
                    {p.description}
                  </p>
                  <p className="text-xs mt-0.5 text-vytal-muted">
                    {p.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-vytal-text">
                    {p.amount}
                  </p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[rgba(34,197,94,0.12)] text-vytal-green"
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
        className="rounded-2xl overflow-hidden bg-vytal-bg2 border border-vytal-border"
      >
        <div
          className="px-5 py-3 border-b border-vytal-border"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-vytal-muted">
            {t("my.profile.settings")}
          </p>
        </div>

        {/* Language */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-vytal-border"
        >
          <div className="flex items-center gap-3">
            <Globe size={15} className="text-vytal-muted" />
            <div>
              <p className="text-sm font-medium text-vytal-text">
                {t("my.profile.language")}
              </p>
              <p className="text-[10px] text-vytal-muted">
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
            className="text-xs rounded-xl px-3 py-1.5 outline-none font-medium bg-vytal-bg3 text-vytal-text border border-vytal-border"
          >
            {languageOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Notifications toggle */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-vytal-border"
        >
          <div className="flex items-center gap-3">
            <Bell size={15} className="text-vytal-muted" />
            <div>
              <p className="text-sm font-medium text-vytal-text">
                {t("my.profile.notifications")}
              </p>
              <p className="text-[10px] text-vytal-muted">
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
              ? <Moon size={15} className="text-vytal-muted" />
              : <Sun size={15} className="text-vytal-muted" />
            }
            <div>
              <p className="text-sm font-medium text-vytal-text">
                {t("my.profile.theme")}
              </p>
              <p className="text-[10px] text-vytal-muted">
                {theme === "dark" ? t("my.profile.themeDark") : t("my.profile.themeLight")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              toggleTheme();
              showToast(t("my.profile.toastTheme"));
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 bg-vytal-bg3 text-vytal-muted border border-vytal-border"
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
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] hover:opacity-90 bg-[rgba(255,71,87,0.1)] text-vytal-red border border-[rgba(255,71,87,0.2)]"
      >
        <LogOut size={15} />
        {t("my.profile.logout")}
      </button>

      <p className="text-center text-[10px] text-vytal-muted opacity-50">
        {t("my.profile.version")}
      </p>
    </div>
  );
}
