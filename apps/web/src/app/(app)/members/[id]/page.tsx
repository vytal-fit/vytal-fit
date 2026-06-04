"use client";

import { useState } from "react";
import { useDataStore, formatCurrency } from "@/stores/data-store";
import type { MemberStatus } from "@vytal-fit/shared";
import {
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Flame,
  ScanLine,
  Trophy,
  ArrowLeft,
  Clock,
  Dumbbell,
  TrendingUp,
  User,
  Activity,
  Heart,
  StickyNote,
  Compass,
  Scale,
  FileText,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookOpen,
  MessageSquare,
  Pencil,
  RefreshCw,
  Send,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useToast } from "@/components/toast";

function StatusBadge({ status }: { status: MemberStatus }) {
  const config: Record<MemberStatus, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "bg-vytal-green/10 text-vytal-green",
    },
    inactive: {
      label: "Inactive",
      className: "bg-vytal-red/10 text-vytal-red",
    },
    trial: {
      label: "Trial",
      className: "bg-vytal-amber/10 text-vytal-amber",
    },
    suspended: {
      label: "Suspended",
      className: "bg-vytal-purple/10 text-vytal-purple",
    },
  };

  const c = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        c.className
      )}
    >
      {c.label}
    </span>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatRelative(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

type Tab = "overview" | "activity" | "payments" | "communications" | "health" | "notes";

// Mock payment data
const mockPayments = [
  { id: "pay-1", date: "2026-06-01", amount: 75, method: "Stripe", plan: "Livre", status: "paid" as const, receiptId: "REC-2026-001" },
  { id: "pay-2", date: "2026-05-01", amount: 75, method: "Stripe", plan: "Livre", status: "paid" as const, receiptId: "REC-2026-002" },
  { id: "pay-3", date: "2026-04-01", amount: 75, method: "Stripe", plan: "Livre", status: "paid" as const, receiptId: "REC-2026-003" },
  { id: "pay-4", date: "2026-03-01", amount: 75, method: "MB Way", plan: "Livre", status: "paid" as const, receiptId: "REC-2026-004" },
  { id: "pay-5", date: "2026-02-01", amount: 75, method: "Stripe", plan: "Livre", status: "failed" as const, receiptId: "REC-2026-005" },
  { id: "pay-6", date: "2026-01-01", amount: 75, method: "Stripe", plan: "Livre", status: "pending" as const, receiptId: "REC-2026-006" },
];

// Mock activity timeline
const mockActivities = [
  { type: "checkin" as const, description: "Checked in to WOD 17:30", time: "2h ago" },
  { type: "booking" as const, description: "Booked class Strength 12:00", time: "Yesterday" },
  { type: "pr" as const, description: "New PR: Back Squat 140kg (+5kg)", time: "2 days ago" },
  { type: "cancellation" as const, description: "Cancelled class Open Box 10:00", time: "3 days ago" },
  { type: "payment" as const, description: "Payment processed: \u20AC75.00 (Stripe)", time: "5 days ago" },
  { type: "plan" as const, description: "Changed plan to Livre", time: "2 weeks ago" },
  { type: "checkin" as const, description: "Checked in to WOD 09:00", time: "2 weeks ago" },
  { type: "pr" as const, description: "New PR: Deadlift 180kg (+10kg)", time: "3 weeks ago" },
  { type: "booking" as const, description: "Booked class Endurance 07:00", time: "3 weeks ago" },
  { type: "achievement" as const, description: "Completed 100 check-in milestone", time: "1 month ago" },
];

// Mock health data
const mockHealthNotes = [
  { id: "hn-1", date: "2026-04-15", author: "Andre Loureiro", text: "Recommend focusing on mobility work for hip flexors. Slight limitation on deep squat." },
  { id: "hn-2", date: "2026-02-10", author: "Marine Robba", text: "Great progress on overhead movements. Cleared for full rx weights." },
];

// Mock staff notes
const mockStaffNotes = [
  { id: "sn-1", date: "2026-05-20", author: "Andre Loureiro", text: "Very consistent member. Interested in competing at local throwdowns. Consider for competition team." },
  { id: "sn-2", date: "2026-04-01", author: "Marine Robba", text: "Asked about nutrition coaching options. Referred to our partner nutritionist." },
  { id: "sn-3", date: "2026-02-15", author: "Ricardo Ribeiro", text: "Upgraded from 8x to Livre plan. Very happy with programming." },
];

// ---------------------------------------------------------------------------
// Mock communication entries
// ---------------------------------------------------------------------------

const mockCommunications = [
  { id: "comm-1", type: "email" as const, subject: "Confirmacao de reserva - WOD 17:30", date: "2026-06-03T14:22:00Z", status: "opened" as const },
  { id: "comm-2", type: "push" as const, subject: "Lembrete: Aula amanha as 09:00", date: "2026-06-02T18:00:00Z", status: "delivered" as const },
  { id: "comm-3", type: "email" as const, subject: "Recibo de pagamento - Junho 2026", date: "2026-06-01T09:15:00Z", status: "opened" as const },
  { id: "comm-4", type: "sms" as const, subject: "O seu plano foi renovado com sucesso", date: "2026-06-01T09:00:00Z", status: "delivered" as const },
  { id: "comm-5", type: "email" as const, subject: "Novo PR! Parabens pelo recorde em Back Squat", date: "2026-05-28T17:45:00Z", status: "sent" as const },
  { id: "comm-6", type: "push" as const, subject: "Desafio semanal: 5 treinos esta semana", date: "2026-05-26T08:00:00Z", status: "delivered" as const },
];

function CommunicationsTab({ memberName, memberEmail }: { memberName: string; memberEmail: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showSmsForm, setShowSmsForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsBody, setSmsBody] = useState("");

  const typeIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-4 w-4 text-vytal-blue" />,
    sms: <Phone className="h-4 w-4 text-vytal-green" />,
    push: <Bell className="h-4 w-4 text-vytal-amber" />,
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    sent: { label: t("memberComms.status.sent"), className: "bg-vytal-muted/10 text-vytal-muted" },
    delivered: { label: t("memberComms.status.delivered"), className: "bg-vytal-blue/10 text-vytal-blue" },
    opened: { label: t("memberComms.status.opened"), className: "bg-vytal-green/10 text-vytal-green" },
  };

  function handleSendEmail() {
    if (!emailSubject.trim() || !emailBody.trim()) return;
    toast(t("memberComms.emailSent"), "success");
    setShowEmailForm(false);
    setEmailSubject("");
    setEmailBody("");
  }

  function handleSendSms() {
    if (!smsBody.trim()) return;
    toast(t("memberComms.smsSent"), "success");
    setShowSmsForm(false);
    setSmsBody("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-vytal-text">{t("memberComms.title")}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowEmailForm((v) => !v); setShowSmsForm(false); }}
            className="inline-flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Mail className="h-4 w-4" />
            {t("memberComms.sendEmail")}
          </button>
          <button
            onClick={() => { setShowSmsForm((v) => !v); setShowEmailForm(false); }}
            className="inline-flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Phone className="h-4 w-4" />
            {t("memberComms.sendSms")}
          </button>
        </div>
      </div>

      {/* Email Compose */}
      {showEmailForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm text-vytal-muted">
            <span className="font-medium">{t("memberComms.composeTo")}:</span>
            <span className="text-vytal-text">{memberName} ({memberEmail})</span>
          </div>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder={t("memberComms.composeSubject")}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          />
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder={t("memberComms.composeBody")}
            rows={4}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowEmailForm(false)} className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text hover:bg-vytal-bg3">
              {t("memberComms.cancel")}
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!emailSubject.trim() || !emailBody.trim()}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {t("memberComms.send")}
            </button>
          </div>
        </div>
      )}

      {/* SMS Compose */}
      {showSmsForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm text-vytal-muted">
            <span className="font-medium">{t("memberComms.composeTo")}:</span>
            <span className="text-vytal-text">{memberName}</span>
          </div>
          <textarea
            value={smsBody}
            onChange={(e) => setSmsBody(e.target.value)}
            placeholder={t("memberComms.composeBody")}
            rows={3}
            maxLength={160}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-vytal-muted">{smsBody.length}/160</span>
            <div className="flex gap-2">
              <button onClick={() => setShowSmsForm(false)} className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text hover:bg-vytal-bg3">
                {t("memberComms.cancel")}
              </button>
              <button
                onClick={handleSendSms}
                disabled={!smsBody.trim()}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {t("memberComms.send")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Communication Timeline */}
      <div className="space-y-3">
        {mockCommunications.map((comm) => {
          const cfg = statusConfig[comm.status];
          return (
            <div
              key={comm.id}
              className="flex items-center gap-4 rounded-xl border border-vytal-border bg-vytal-card px-5 py-4 transition-colors hover:border-[rgba(61,255,110,0.22)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-bg3">
                {typeIcons[comm.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-vytal-bg3 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-vytal-muted">
                    {t(`memberComms.type.${comm.type}`)}
                  </span>
                  <p className="text-sm font-medium text-vytal-text truncate">{comm.subject}</p>
                </div>
                <p className="mt-0.5 text-xs text-vytal-muted">
                  {new Date(comm.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold", cfg.className)}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MemberDetailPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const members = useDataStore((s) => s.members);
  const subscriptions = useDataStore((s) => s.subscriptions);
  const personalRecords = useDataStore((s) => s.personalRecords);
  const params = useParams();
  const id = params.id as string;
  const member = members.find((m) => m.id === id);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [noteText, setNoteText] = useState("");
  const [staffNotes, setStaffNotes] = useState(mockStaffNotes);

  if (!member) {
    notFound();
  }

  const subscription = subscriptions.find((s) => s.memberId === member.id);
  const records = personalRecords.filter((r) => r.memberId === member.id);

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("memberTabs.overview"), icon: <User className="h-4 w-4" /> },
    { key: "activity", label: t("memberTabs.activity"), icon: <Activity className="h-4 w-4" /> },
    { key: "payments", label: t("memberTabs.payments"), icon: <CreditCard className="h-4 w-4" /> },
    { key: "communications", label: t("memberTabs.communications"), icon: <MessageSquare className="h-4 w-4" /> },
    { key: "health", label: t("memberTabs.health"), icon: <Heart className="h-4 w-4" /> },
    { key: "notes", label: t("memberTabs.notes"), icon: <StickyNote className="h-4 w-4" /> },
  ];

  function handleAddNote() {
    if (!noteText.trim()) return;
    const newNote = {
      id: `sn-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      author: "You",
      text: noteText.trim(),
    };
    setStaffNotes((prev) => [newNote, ...prev]);
    setNoteText("");
    toast(t("memberNotes.savedSuccess"), "success");
  }

  function handleDownloadReceipt(receiptId: string) {
    toast(`${t("memberPayments.downloadStarted")} ${receiptId}`, "info");
  }

  const totalPaidThisYear = mockPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("members.title"), href: "/members" }, { label: member.name }]} />

      {/* Back link */}
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("memberDetail.backToMembers")}
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vytal-green/10 text-xl font-bold text-vytal-green">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-vytal-text">
                {member.name}
              </h1>
              <StatusBadge status={member.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-vytal-muted">
              <span className="font-mono text-xs">
                #{member.memberNumber}
              </span>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {member.email}
              </div>
              {member.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {member.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-vytal-border bg-vytal-bg2 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "bg-vytal-green/10 text-vytal-green shadow-sm"
                : "text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─────────── OVERVIEW TAB ─────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-blue/10">
                  <ScanLine className="h-4 w-4 text-vytal-blue" />
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("memberOverview.checkIns")}</span>
                  <p className="text-lg font-bold text-vytal-text">{member.totalCheckIns}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-amber/10">
                  <Flame className="h-4 w-4 text-vytal-amber" />
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("memberOverview.streak")}</span>
                  <p className="text-lg font-bold text-vytal-text">
                    {member.streakWeeks > 0 ? `${member.streakWeeks} ${t("memberOverview.weeks")}` : t("memberOverview.noStreak")}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
                  <Trophy className="h-4 w-4 text-vytal-green" />
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("memberOverview.prs")}</span>
                  <p className="text-lg font-bold text-vytal-text">{records.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-purple/10">
                  <Calendar className="h-4 w-4 text-vytal-purple" />
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("memberOverview.memberSince")}</span>
                  <p className="text-lg font-bold text-vytal-text">
                    {new Date(member.joinedAt).toLocaleDateString("pt-PT", { month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Personal Info Card */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("memberOverview.personalInfo")}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberOverview.email")}</span>
                  <span className="text-vytal-text">{member.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberOverview.phone")}</span>
                  <span className="text-vytal-text">{member.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberOverview.gender")}</span>
                  <span className="text-vytal-text capitalize">{member.gender || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberOverview.joined")}</span>
                  <span className="text-vytal-text">{formatDate(member.joinedAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberOverview.lastCheckIn")}</span>
                  <span className="text-vytal-text">{formatRelative(member.lastCheckIn)}</span>
                </div>
              </div>
            </div>

            {/* Plan Card */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("memberOverview.planInfo")}</h2>
              {subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-vytal-muted">{t("memberOverview.planName")}</span>
                    <span className="text-vytal-text font-medium">{subscription.plan.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-vytal-muted">{t("memberOverview.planType")}</span>
                    <span className="text-vytal-text capitalize">{subscription.plan.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-vytal-muted">{t("memberOverview.price")}</span>
                    <span className="text-vytal-green font-mono font-semibold">
                      {formatCurrency(subscription.plan.price)}/{t("memberOverview.month")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-vytal-muted">{t("memberOverview.startDate")}</span>
                    <span className="text-vytal-text">{formatDate(subscription.startDate)}</span>
                  </div>
                  {subscription.plan.maxSessions && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-vytal-muted">{t("memberOverview.sessionsUsed")}</span>
                      <span className="text-vytal-text font-mono">
                        {subscription.sessionsUsed}/{subscription.plan.maxSessions}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-vytal-muted">{t("memberOverview.noPlan")}</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/members/${member.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Pencil className="h-4 w-4" />
              {t("memberOverview.editProfile")}
            </Link>
            <button
              onClick={() => toast(t("memberOverview.planChangeToast"), "info")}
              className="inline-flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <RefreshCw className="h-4 w-4" />
              {t("memberOverview.changePlan")}
            </button>
            <button
              onClick={() => toast(t("memberOverview.messageSentToast"), "success")}
              className="inline-flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Send className="h-4 w-4" />
              {t("memberOverview.sendMessage")}
            </button>
            <Link
              href={`/members/${member.id}/billing`}
              className="inline-flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <CreditCard className="h-4 w-4" />
              {t("memberOverview.viewBilling") || "View Billing"}
            </Link>
            <Link
              href={`/members/${member.id}/360`}
              className="inline-flex items-center gap-2 rounded-lg border border-vytal-green/20 bg-vytal-green/5 px-4 py-2 text-sm font-medium text-vytal-green transition-colors hover:bg-vytal-green/10"
            >
              <Compass className="h-4 w-4" />
              {t("memberOverview.view360") || "360\u00B0 View"}
            </Link>
            <Link
              href={`/members/${member.id}/body`}
              className="inline-flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Scale className="h-4 w-4" />
              {t("memberOverview.bodyComposition") || "Body Composition"}
            </Link>
          </div>

          {/* Personal Records */}
          {records.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-vytal-text">
                {t("memberDetail.personalRecords")}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {records.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 transition-colors hover:border-[rgba(61,255,110,0.22)]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
                      <TrendingUp className="h-4 w-4 text-vytal-green" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-vytal-text">
                        {pr.exercise.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-vytal-green">
                          {pr.value} {pr.unit}
                        </span>
                        {pr.previousValue && (
                          <span className="text-[10px] text-vytal-muted">
                            prev: {pr.previousValue} {pr.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-vytal-muted">
                      {new Date(pr.achievedAt).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────── ACTIVITY TAB ─────────── */}
      {activeTab === "activity" && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">
            {t("memberDetail.activityTimeline")}
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-vytal-border" />

            <div className="space-y-4">
              {mockActivities.map((entry, i) => {
                const dotColors: Record<string, string> = {
                  checkin: "bg-vytal-green",
                  pr: "bg-vytal-amber",
                  booking: "bg-vytal-blue",
                  payment: "bg-vytal-green",
                  plan: "bg-vytal-purple",
                  achievement: "bg-vytal-amber",
                  cancellation: "bg-vytal-red",
                };
                const iconMap: Record<string, React.ReactNode> = {
                  checkin: <ScanLine className="h-3.5 w-3.5 text-vytal-green" />,
                  pr: <Trophy className="h-3.5 w-3.5 text-vytal-amber" />,
                  booking: <Calendar className="h-3.5 w-3.5 text-vytal-blue" />,
                  payment: <CreditCard className="h-3.5 w-3.5 text-vytal-green" />,
                  plan: <RefreshCw className="h-3.5 w-3.5 text-vytal-purple" />,
                  achievement: <Trophy className="h-3.5 w-3.5 text-vytal-amber" />,
                  cancellation: <XCircle className="h-3.5 w-3.5 text-vytal-red" />,
                };
                return (
                  <div key={i} className="relative flex items-start gap-4 pl-8">
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-vytal-bg2",
                        dotColors[entry.type] ?? "bg-vytal-muted"
                      )}
                    />
                    <div className="flex flex-1 items-center justify-between rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 transition-colors hover:border-[rgba(61,255,110,0.22)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-vytal-bg3">
                          {iconMap[entry.type]}
                        </div>
                        <p className="text-sm text-vytal-text">{entry.description}</p>
                      </div>
                      <span className="ml-4 shrink-0 text-xs text-vytal-muted">{entry.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────── PAYMENTS TAB ─────────── */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Total paid */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("memberPayments.totalPaidYear")}
                </span>
                <p className="text-2xl font-bold text-vytal-green font-mono">
                  {formatCurrency(totalPaidThisYear)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-green/10">
                <CreditCard className="h-6 w-6 text-vytal-green" />
              </div>
            </div>
          </div>

          {/* Payment history table */}
          <div className="overflow-hidden rounded-xl border border-vytal-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-vytal-border bg-vytal-bg2">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("memberPayments.date")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("memberPayments.amount")}
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted md:table-cell">
                    {t("memberPayments.method")}
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted lg:table-cell">
                    {t("memberPayments.plan")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("memberPayments.status")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("memberPayments.receipt")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vytal-border">
                {mockPayments.map((payment) => {
                  const statusConfig = {
                    paid: { label: t("memberPayments.paid"), className: "bg-vytal-green/10 text-vytal-green", icon: <CheckCircle className="h-3 w-3" /> },
                    pending: { label: t("memberPayments.pending"), className: "bg-vytal-amber/10 text-vytal-amber", icon: <Clock className="h-3 w-3" /> },
                    failed: { label: t("memberPayments.failed"), className: "bg-vytal-red/10 text-vytal-red", icon: <XCircle className="h-3 w-3" /> },
                  };
                  const cfg = statusConfig[payment.status];
                  return (
                    <tr key={payment.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                      <td className="px-4 py-3 text-sm text-vytal-text">
                        {new Date(payment.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-vytal-text">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-vytal-muted md:table-cell">
                        {payment.method}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-vytal-muted lg:table-cell">
                        {payment.plan}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.status === "paid" && (
                          <button
                            onClick={() => handleDownloadReceipt(payment.receiptId)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-vytal-bg3 px-3 py-1.5 text-xs font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3/80 hover:text-vytal-text"
                          >
                            <Download className="h-3 w-3" />
                            {t("memberPayments.download")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────── COMMUNICATIONS TAB ─────────── */}
      {activeTab === "communications" && (
        <CommunicationsTab memberName={member.name} memberEmail={member.email} />
      )}

      {/* ─────────── HEALTH TAB ─────────── */}
      {activeTab === "health" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Injuries / Restrictions */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-vytal-amber" />
                <h2 className="text-lg font-semibold text-vytal-text">{t("memberHealth.injuries")}</h2>
              </div>
              <p className="text-sm text-vytal-muted leading-relaxed">
                {t("memberHealth.injuriesDetail")}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-vytal-muted">{t("memberHealth.visibleToCoaches")}</span>
                <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-vytal-green/20 transition-colors">
                  <div className="absolute left-[18px] h-3.5 w-3.5 rounded-full bg-vytal-green transition-transform" />
                </div>
              </div>
            </div>

            {/* PAR-Q & Emergency Contact */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-vytal-green" />
                <h2 className="text-lg font-semibold text-vytal-text">{t("memberHealth.medicalInfo")}</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberHealth.parqStatus")}</span>
                  <span className="inline-flex items-center gap-1.5 text-vytal-green text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    {t("memberHealth.parqCompleted")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberHealth.emergencyContact")}</span>
                  <span className="text-vytal-text">{t("memberHealth.emergencyContactValue")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberHealth.weight")}</span>
                  <span className="text-vytal-text font-mono">82 kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">{t("memberHealth.height")}</span>
                  <span className="text-vytal-text font-mono">178 cm</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vytal-muted">BMI</span>
                  <span className="text-vytal-text font-mono">25.9</span>
                </div>
              </div>
            </div>
          </div>

          {/* PT Notes */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-vytal-blue" />
              <h2 className="text-lg font-semibold text-vytal-text">{t("memberHealth.ptNotes")}</h2>
            </div>
            <div className="space-y-3">
              {mockHealthNotes.map((note) => (
                <div key={note.id} className="rounded-lg border border-vytal-border bg-vytal-bg2 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-vytal-text">{note.author}</span>
                    <span className="text-[10px] text-vytal-muted">
                      {new Date(note.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-vytal-muted leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────── NOTES TAB ─────────── */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Private badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-vytal-purple/10 px-3 py-1 text-xs font-semibold text-vytal-purple">
              {t("memberNotes.private")}
            </span>
            <span className="text-xs text-vytal-muted">{t("memberNotes.privateDesc")}</span>
          </div>

          {/* Add note form */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-vytal-text">{t("memberNotes.addNote")}</h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t("memberNotes.placeholder")}
              rows={3}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-3 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none focus:border-vytal-green/40 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-medium text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4" />
                {t("memberNotes.save")}
              </button>
            </div>
          </div>

          {/* Existing notes */}
          <div className="space-y-3">
            {staffNotes.map((note) => (
              <div key={note.id} className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vytal-purple/10 text-[9px] font-bold text-vytal-purple">
                      {note.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-xs font-semibold text-vytal-text">{note.author}</span>
                  </div>
                  <span className="text-[10px] text-vytal-muted">
                    {new Date(note.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-vytal-muted leading-relaxed">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
