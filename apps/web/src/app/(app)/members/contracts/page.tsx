"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Plus,
  Pencil,
  RefreshCw,
} from "lucide-react";

interface ContractTemplate {
  id: string;
  name: string;
  required: boolean;
  lastUpdated: string;
}

const mockTemplates: ContractTemplate[] = [
  { id: "tpl-1", name: "Membership Agreement", required: true, lastUpdated: "2026-05-01" },
  { id: "tpl-2", name: "Health Waiver (PAR-Q)", required: true, lastUpdated: "2026-04-15" },
  { id: "tpl-3", name: "Privacy Policy (RGPD)", required: true, lastUpdated: "2026-03-20" },
];

interface MemberContract {
  id: string;
  memberName: string;
  contractType: string;
  status: "signed" | "pending" | "expired";
  signedDate: string | null;
  expiryDate: string | null;
}

const mockContracts: MemberContract[] = [
  { id: "mc-1", memberName: "Ana Silva", contractType: "Membership Agreement", status: "signed", signedDate: "2026-01-10", expiryDate: "2027-01-10" },
  { id: "mc-2", memberName: "Ana Silva", contractType: "Health Waiver (PAR-Q)", status: "signed", signedDate: "2026-01-10", expiryDate: null },
  { id: "mc-3", memberName: "Pedro Almeida", contractType: "Membership Agreement", status: "signed", signedDate: "2025-11-05", expiryDate: "2026-11-05" },
  { id: "mc-4", memberName: "Pedro Almeida", contractType: "Privacy Policy (RGPD)", status: "pending", signedDate: null, expiryDate: null },
  { id: "mc-5", memberName: "Tiago Neves", contractType: "Membership Agreement", status: "pending", signedDate: null, expiryDate: null },
  { id: "mc-6", memberName: "Sofia Santos", contractType: "Membership Agreement", status: "expired", signedDate: "2025-03-01", expiryDate: "2026-03-01" },
  { id: "mc-7", memberName: "Miguel Costa", contractType: "Health Waiver (PAR-Q)", status: "signed", signedDate: "2026-02-15", expiryDate: null },
  { id: "mc-8", memberName: "Maria Oliveira", contractType: "Membership Agreement", status: "expired", signedDate: "2025-01-20", expiryDate: "2026-01-20" },
];

const totalSigned = 320;
const totalPending = 15;
const totalExpired = 8;
const completionRate = 93;

export default function ContractsPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [contracts] = useState(mockContracts);

  const statusConfig = {
    signed: {
      label: t("contracts.signed"),
      className: "bg-vytal-green/10 text-vytal-green",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    pending: {
      label: t("contracts.pending"),
      className: "bg-vytal-amber/10 text-vytal-amber",
      icon: <Clock className="h-3 w-3" />,
    },
    expired: {
      label: t("contracts.expired"),
      className: "bg-vytal-red/10 text-vytal-red",
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: t("contracts.title") },
        ]}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("contracts.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("contracts.subtitle")}</p>
        </div>
        <button
          onClick={() =>
            toast(t("contracts.sendToAllPending"), "success")
          }
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Send className="h-4 w-4" />
          {t("contracts.sendToAllPending")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
            {t("contracts.totalSigned")}
          </span>
          <p className="mt-1 text-2xl font-bold text-vytal-green">{totalSigned}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
            {t("contracts.totalPending")}
          </span>
          <p className="mt-1 text-2xl font-bold text-vytal-amber">{totalPending}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
            {t("contracts.totalExpired")}
          </span>
          <p className="mt-1 text-2xl font-bold text-vytal-red">{totalExpired}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
            {t("contracts.completionRate")}
          </span>
          <p className="mt-1 text-2xl font-bold text-vytal-text">{completionRate}%</p>
        </div>
      </div>

      {/* Contract Templates */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-vytal-text">
            {t("contracts.templates")}
          </h2>
          <button
            onClick={() => toast(t("contracts.createTemplateToast"), "info")}
            className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Plus className="h-4 w-4" />
            {t("contracts.createTemplate")}
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
                    <FileText className="h-5 w-5 text-vytal-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-vytal-text">{tpl.name}</p>
                    <p className="mt-0.5 text-xs text-vytal-muted">
                      {t("contracts.lastUpdated")}: {tpl.lastUpdated}
                    </p>
                  </div>
                </div>
                {tpl.required && (
                  <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">
                    {t("contracts.required")}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => toast(t("contracts.editComingSoon"), "info")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  <Pencil className="h-3 w-3" />
                  {t("contracts.editTemplate")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Contracts Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("contracts.memberContracts")}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="zebra-table sticky-thead w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.member")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("contracts.contractType")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("contracts.signedDate")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("contracts.expiryDate")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("table.action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {contracts.map((c) => {
                const sc = statusConfig[c.status];
                return (
                  <tr
                    key={c.id}
                    className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-vytal-text">
                      {c.memberName}
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">{c.contractType}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.className}`}
                      >
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">
                      {c.signedDate ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">
                      {c.expiryDate ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.status === "pending" && (
                        <button
                          onClick={() =>
                            toast(
                              t("contracts.reminderSentTo").replace("{name}", c.memberName),
                              "success"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3 hover:text-vytal-green"
                        >
                          <Send className="h-3 w-3" />
                          {t("contracts.sendReminder")}
                        </button>
                      )}
                      {c.status === "expired" && (
                        <button
                          onClick={() =>
                            toast(
                              t("contracts.renewSent").replace("{name}", c.memberName),
                              "success"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3 hover:text-vytal-amber"
                        >
                          <RefreshCw className="h-3 w-3" />
                          {t("contracts.renew")}
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
    </div>
  );
}
