"use client";

import { useEffect, useState } from "react";
import {
  User,
  CreditCard,
  Bell,
  Globe,
  LogOut,
  ChevronRight,
  CheckCircle,
  Calendar,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useDataStore } from "@/stores/data-store";
import { useAppStore } from "@/stores/app-store";

const LANGUAGE_OPTIONS = [
  { value: "pt", label: "Portugues" },
  { value: "en", label: "English" },
  { value: "es", label: "Espanol" },
];

const MOCK_PAYMENTS = [
  { id: "p-1", description: "Plano Mensal — Junho 2026", amount: "65,00 €", date: "01/06/2026", status: "pago" },
  { id: "p-2", description: "Plano Mensal — Maio 2026", amount: "65,00 €", date: "01/05/2026", status: "pago" },
  { id: "p-3", description: "Plano Mensal — Abril 2026", amount: "65,00 €", date: "01/04/2026", status: "pago" },
  { id: "p-4", description: "Plano Mensal — Marco 2026", amount: "65,00 €", date: "01/03/2026", status: "pago" },
];

export default function ProfilePage() {
  const { user, hydrate, logout } = useAuthStore();
  const { members, plans, subscriptions } = useDataStore();
  const { theme, toggleTheme, hydrate: hydrateApp } = useAppStore();
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
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const member = members?.[0];
  const initials = user?.user?.name
    ? user.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AT";

  // Find active subscription
  const activeSub = (subscriptions ?? []).find((s) => s.status === "active" || s.status === "paused");
  const plan = activeSub?.plan ?? (plans ?? [])[0] ?? null;

  const memberSince = member?.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString("pt-PT", {
        month: "long",
        year: "numeric",
      })
    : "Janeiro 2024";

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-16 left-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-[#080c0a] shadow-xl"
          style={{ background: "var(--color-vytal-green)" }}
        >
          {toast}
        </div>
      )}

      {/* Avatar + name */}
      <div className="flex flex-col items-center py-4 space-y-3">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
        >
          {initials}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: "var(--color-vytal-text)" }}>
            {user?.user?.name ?? "Atleta"}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-vytal-muted)" }}>
            {user?.user?.email ?? "atleta@vytal.fit"}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Calendar size={12} style={{ color: "var(--color-vytal-muted)" }} />
            <span className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
              Membro desde {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Active subscription */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={14} style={{ color: "var(--color-vytal-green)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
            Subscricao atual
          </span>
        </div>

        {plan ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold" style={{ color: "var(--color-vytal-text)" }}>
                {plan.name}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(34,197,94,0.12)", color: "var(--color-vytal-green)" }}
                >
                  <CheckCircle size={10} />
                  {activeSub?.status === "active" ? "Ativa" : activeSub?.status === "paused" ? "Pausada" : "Ativa"}
                </span>
                {plan.sessionsPerWeek && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)" }}
                  >
                    {plan.sessionsPerWeek}x/semana
                  </span>
                )}
              </div>
              {activeSub?.nextBillingDate && (
                <p className="text-xs mt-1" style={{ color: "var(--color-vytal-muted)" }}>
                  Renovacao: {new Date(activeSub.nextBillingDate).toLocaleDateString("pt-PT")}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: "var(--color-vytal-green)" }}>
                {plan.price}€
              </p>
              <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                {plan.type === "monthly" ? "/mes" :
                 plan.type === "quarterly" ? "/trimestre" :
                 plan.type === "semester" ? "/semestre" :
                 plan.type === "annual" ? "/ano" : ""}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-vytal-muted)" }}>
            Sem subscricao ativa
          </p>
        )}
      </div>

      {/* Payment history */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
      >
        <button
          className="w-full flex items-center justify-between px-4 py-3"
          onClick={() => setShowPayments((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <Shield size={14} style={{ color: "var(--color-vytal-muted)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--color-vytal-text)" }}>
              Historico de pagamentos
            </span>
          </div>
          <ChevronRight
            size={16}
            style={{
              color: "var(--color-vytal-muted)",
              transform: showPayments ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>

        {showPayments && (
          <div className="border-t divide-y" style={{ borderColor: "var(--color-vytal-border)" }}>
            {MOCK_PAYMENTS.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderColor: "var(--color-vytal-border)" }}
              >
                <div>
                  <p className="text-sm" style={{ color: "var(--color-vytal-text)" }}>
                    {p.description}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                    {p.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium font-mono" style={{ color: "var(--color-vytal-text)" }}>
                    {p.amount}
                  </p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(34,197,94,0.12)", color: "var(--color-vytal-green)" }}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-vytal-border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
            Definicoes
          </p>
        </div>

        {/* Language */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--color-vytal-border)" }}
        >
          <div className="flex items-center gap-2">
            <Globe size={14} style={{ color: "var(--color-vytal-muted)" }} />
            <span className="text-sm" style={{ color: "var(--color-vytal-text)" }}>
              Idioma
            </span>
          </div>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              showToast("Idioma atualizado");
            }}
            className="text-xs rounded-lg px-2 py-1 outline-none"
            style={{
              background: "var(--color-vytal-bg3)",
              color: "var(--color-vytal-text)",
              border: "1px solid var(--color-vytal-border)",
            }}
          >
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--color-vytal-border)" }}
        >
          <div className="flex items-center gap-2">
            <Bell size={14} style={{ color: "var(--color-vytal-muted)" }} />
            <div>
              <p className="text-sm" style={{ color: "var(--color-vytal-text)" }}>
                Notificacoes
              </p>
              <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                Lembretes de aulas, WODs
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setNotificationsEnabled((v) => !v);
              showToast(notificationsEnabled ? "Notificacoes desativadas" : "Notificacoes ativadas");
            }}
            className={cn(
              "w-10 h-6 rounded-full relative transition-all",
            )}
            style={{
              background: notificationsEnabled ? "var(--color-vytal-green)" : "var(--color-vytal-bg3)",
            }}
          >
            <span
              className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full transition-all",
                notificationsEnabled ? "left-[calc(100%-20px-2px)]" : "left-0.5"
              )}
              style={{ background: notificationsEnabled ? "#080c0a" : "var(--color-vytal-muted)" }}
            />
          </button>
        </div>

        {/* Theme */}
        <div
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <User size={14} style={{ color: "var(--color-vytal-muted)" }} />
            <span className="text-sm" style={{ color: "var(--color-vytal-text)" }}>
              Tema
            </span>
          </div>
          <button
            onClick={() => {
              toggleTheme();
              showToast("Tema alterado");
            }}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)" }}
          >
            {theme === "dark" ? "Escuro" : "Claro"}
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          showToast("Sessao terminada");
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
        style={{
          background: "rgba(255,71,87,0.12)",
          color: "var(--color-vytal-red)",
          border: "1px solid rgba(255,71,87,0.2)",
        }}
      >
        <LogOut size={16} />
        Terminar sessao
      </button>

      {/* App version */}
      <p className="text-center text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
        Vytal v1.0.0 — Portal do Atleta
      </p>
    </div>
  );
}
