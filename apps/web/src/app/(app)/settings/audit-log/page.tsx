"use client";

import { Shield, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

type ActionType = "create" | "update" | "delete" | "payment" | "settings" | "login" | "export";

const actionColors: Record<ActionType, string> = {
  create: "bg-vytal-green/10 text-vytal-green",
  update: "bg-vytal-blue/10 text-vytal-blue",
  delete: "bg-vytal-red/10 text-vytal-red",
  payment: "bg-vytal-amber/10 text-vytal-amber",
  settings: "bg-vytal-purple/10 text-vytal-purple",
  login: "bg-vytal-muted/10 text-vytal-muted",
  export: "bg-vytal-orange/10 text-vytal-orange",
};

interface AuditEntry {
  id: number;
  timestamp: string;
  user: string;
  action: ActionType;
  resource: string;
  details: string;
}

const mockAuditLog: AuditEntry[] = [
  { id: 1, timestamp: "2026-06-03 09:15:22", user: "Andre Loureiro", action: "create", resource: "Member", details: "Created member Tiago Neves (#5)" },
  { id: 2, timestamp: "2026-06-03 09:10:05", user: "Andre Loureiro", action: "update", resource: "Class", details: "Updated WOD class schedule for June 5" },
  { id: 3, timestamp: "2026-06-03 08:45:30", user: "System", action: "payment", resource: "Payment", details: "Payment of 75 EUR processed for Rita Costa via Stripe" },
  { id: 4, timestamp: "2026-06-03 08:30:00", user: "Marine Robba", action: "login", resource: "Auth", details: "Logged in from 192.168.1.15" },
  { id: 5, timestamp: "2026-06-02 18:22:11", user: "Andre Loureiro", action: "settings", resource: "Settings", details: "Updated box operating hours" },
  { id: 6, timestamp: "2026-06-02 17:45:33", user: "Ricardo Ribeiro", action: "update", resource: "WOD", details: "Published WOD for June 3 (FRAN)" },
  { id: 7, timestamp: "2026-06-02 16:30:00", user: "System", action: "payment", resource: "Payment", details: "Payment of 60 EUR failed for Ana Ferreira via MBWay" },
  { id: 8, timestamp: "2026-06-02 15:12:44", user: "Andre Loureiro", action: "update", resource: "Member", details: "Updated member status: Maria Oliveira -> inactive" },
  { id: 9, timestamp: "2026-06-02 14:05:00", user: "Marine Robba", action: "create", resource: "Lead", details: "Created lead Helena Cardoso (source: Flyers)" },
  { id: 10, timestamp: "2026-06-02 12:30:20", user: "Andre Loureiro", action: "delete", resource: "Class", details: "Cancelled Open Box class on June 8" },
  { id: 11, timestamp: "2026-06-01 17:00:00", user: "System", action: "export", resource: "Report", details: "Monthly attendance report exported (May 2026)" },
  { id: 12, timestamp: "2026-06-01 16:22:10", user: "Andre Loureiro", action: "settings", resource: "Automation", details: "Enabled win-back automation" },
  { id: 13, timestamp: "2026-06-01 14:45:30", user: "Ricardo Ribeiro", action: "create", resource: "Plan", details: "Created plan: Summer Special (55 EUR/month)" },
  { id: 14, timestamp: "2026-06-01 10:15:00", user: "System", action: "payment", resource: "Payment", details: "Bulk billing processed: 42 subscriptions renewed" },
  { id: 15, timestamp: "2026-05-31 18:00:00", user: "Andre Loureiro", action: "update", resource: "Settings", details: "Updated email templates (Welcome, Trial Confirmation)" },
];

export default function AuditLogPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: t("auditLog.title") },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("auditLog.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("auditLog.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2">
          <Shield className="h-4 w-4 text-vytal-muted" />
          <span className="text-xs font-medium text-vytal-muted">{mockAuditLog.length} entries</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-vytal-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Resource</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {mockAuditLog.map((entry) => (
              <tr key={entry.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-vytal-muted" />
                    <span className="font-mono text-xs text-vytal-muted">{entry.timestamp}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-vytal-text">{entry.user}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    actionColors[entry.action]
                  )}>
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded bg-vytal-bg3 px-2 py-0.5 text-xs text-vytal-muted">
                    {entry.resource}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-vytal-muted">{entry.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
