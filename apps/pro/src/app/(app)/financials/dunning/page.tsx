"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { formatCurrency } from "@/stores/data-store";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Users,
  TrendingUp,
  RefreshCw,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  Ban,
} from "lucide-react";

interface DunningEntry {
  id: string;
  memberName: string;
  amountDue: number;
  daysOverdue: number;
  attempt: number;
  maxAttempts: number;
  nextRetryDate: string;
  status: "active" | "paused" | "exhausted";
}

interface DunningRule {
  attempt: number;
  daysAfterFailure: number;
  channels: { email: boolean; sms: boolean; push: boolean };
  action: string;
}

const defaultRules: DunningRule[] = [
  { attempt: 1, daysAfterFailure: 0, channels: { email: true, sms: false, push: false }, action: "notify" },
  { attempt: 2, daysAfterFailure: 3, channels: { email: true, sms: true, push: false }, action: "notify" },
  { attempt: 3, daysAfterFailure: 7, channels: { email: true, sms: true, push: true }, action: "block_booking" },
];

export default function DunningPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [rules, setRules] = useState<DunningRule[]>(defaultRules);

  // Derive the dunning queue from real overdue payments. Retry attempts/next
  // retry are projected from days overdue (the automation itself is post-MVP).
  const overdueQuery = trpc.payments.list.useQuery({ status: "overdue" });
  const mockDunning: DunningEntry[] = (overdueQuery.data ?? []).map((p) => {
    const daysOverdue = p.dueDate
      ? Math.max(0, Math.floor((Date.now() - new Date(p.dueDate).getTime()) / 86400000))
      : 0;
    const attempt = daysOverdue >= 7 ? 3 : daysOverdue >= 3 ? 2 : 1;
    const status: DunningEntry["status"] = daysOverdue >= 14 ? "exhausted" : "active";
    const next = p.dueDate
      ? new Date(new Date(p.dueDate).getTime() + attempt * 3 * 86400000)
          .toISOString()
          .slice(0, 10)
      : "-";
    return {
      id: p.id,
      memberName: p.memberName,
      amountDue: Number(p.amount),
      daysOverdue,
      attempt,
      maxAttempts: 3,
      nextRetryDate: status === "exhausted" ? "-" : next,
      status,
    };
  });

  const totalOverdue = mockDunning.reduce((s, d) => s + d.amountDue, 0);
  const membersAffected = mockDunning.length;
  const recoveryRate = 78;

  function toggleChannel(attemptIdx: number, channel: "email" | "sms" | "push") {
    setRules((prev) =>
      prev.map((r, i) =>
        i === attemptIdx
          ? { ...r, channels: { ...r.channels, [channel]: !r.channels[channel] } }
          : r
      )
    );
    toast(t("dunning.ruleUpdated"), "success");
  }

  function handleRetryNow(name: string) {
    toast(t("dunning.retryStarted").replace("{name}", name), "success");
  }

  function handleSendReminder(name: string) {
    toast(t("dunning.reminderSent").replace("{name}", name), "success");
  }

  const statusConfig = {
    active: { label: t("dunning.statusActive"), className: "bg-vytal-amber/10 text-vytal-amber" },
    paused: { label: t("dunning.statusPaused"), className: "bg-vytal-blue/10 text-vytal-blue" },
    exhausted: { label: t("dunning.statusExhausted"), className: "bg-vytal-red/10 text-vytal-red" },
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.financials"), href: "/financials" },
          { label: t("dunning.title") },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("dunning.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("dunning.subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-vytal-red/20 bg-vytal-card p-5 transition-colors hover:border-vytal-red/30">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("dunning.totalOverdue")}
              </span>
              <p className="mt-1 text-2xl font-bold text-vytal-red">
                {formatCurrency(totalOverdue)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
              <AlertTriangle className="h-5 w-5 text-vytal-red" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("dunning.membersAffected")}
              </span>
              <p className="mt-1 text-2xl font-bold text-vytal-text">{membersAffected}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Users className="h-5 w-5 text-vytal-amber" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("dunning.recoveryRate")}
              </span>
              <p className="mt-1 text-2xl font-bold text-vytal-green">{recoveryRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
              <TrendingUp className="h-5 w-5 text-vytal-green" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Dunning Sequences */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("dunning.activeSequences")}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="zebra-table sticky-thead w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.member")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("dunning.amountDue")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("dunning.daysOverdue")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("dunning.attempt")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("dunning.nextRetry")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.status")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {mockDunning.map((entry) => {
                const sc = statusConfig[entry.status];
                return (
                  <tr
                    key={entry.id}
                    className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-vytal-text">
                      {entry.memberName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-vytal-red">
                      {formatCurrency(entry.amountDue)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono text-sm font-semibold ${
                          entry.daysOverdue > 7 ? "text-vytal-red" : "text-vytal-amber"
                        }`}
                      >
                        {entry.daysOverdue}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-sm text-vytal-text">
                        {entry.attempt}/{entry.maxAttempts}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">
                      {entry.nextRetryDate === "-" ? (
                        <span className="text-vytal-red">{t("dunning.noMoreRetries")}</span>
                      ) : (
                        entry.nextRetryDate
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.className}`}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRetryNow(entry.memberName)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
                          title={t("dunning.retryNow")}
                        >
                          <RefreshCw className="h-3 w-3" />
                          {t("dunning.retryNow")}
                        </button>
                        <button
                          onClick={() => handleSendReminder(entry.memberName)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3 hover:text-vytal-green"
                          title={t("dunning.sendReminder")}
                        >
                          <Send className="h-3 w-3" />
                          {t("dunning.sendReminder")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dunning Rules Configuration */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("dunning.rulesConfig")}
        </h2>
        <div className="space-y-4">
          {rules.map((rule, idx) => (
            <div
              key={rule.attempt}
              className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      rule.attempt === 1
                        ? "bg-vytal-amber/10 text-vytal-amber"
                        : rule.attempt === 2
                          ? "bg-vytal-red/20 text-vytal-red"
                          : "bg-vytal-red/10 text-vytal-red"
                    }`}
                  >
                    {rule.attempt}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-vytal-text">
                      {t("dunning.attemptLabel").replace("{n}", String(rule.attempt))}
                    </p>
                    <p className="text-xs text-vytal-muted">
                      D+{rule.daysAfterFailure} — {t("dunning.daysAfterFailure")}
                    </p>
                  </div>
                </div>

                {/* Channel Toggles */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleChannel(idx, "email")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      rule.channels.email
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "bg-vytal-bg3 text-vytal-muted"
                    }`}
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </button>
                  <button
                    onClick={() => toggleChannel(idx, "sms")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      rule.channels.sms
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "bg-vytal-bg3 text-vytal-muted"
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                    SMS
                  </button>
                  <button
                    onClick={() => toggleChannel(idx, "push")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      rule.channels.push
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "bg-vytal-bg3 text-vytal-muted"
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Push
                  </button>
                </div>

                {/* Action */}
                {rule.action === "block_booking" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-vytal-red/10 px-3 py-1 text-xs font-medium text-vytal-red">
                    <Ban className="h-3 w-3" />
                    {t("dunning.blockBooking")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
