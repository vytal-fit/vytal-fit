"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  Clock,
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Activity,
  Filter,
  X as XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

type ActionType =
  | "create"
  | "update"
  | "delete"
  | "payment"
  | "settings"
  | "login"
  | "logout"
  | "export"
  | "crm"
  | "refund";

const actionColors: Record<ActionType, string> = {
  create: "bg-vytal-green/10 text-vytal-green",
  update: "bg-vytal-blue/10 text-vytal-blue",
  delete: "bg-vytal-red/10 text-vytal-red",
  payment: "bg-vytal-amber/10 text-vytal-amber",
  settings: "bg-vytal-purple/10 text-vytal-purple",
  login: "bg-vytal-muted/10 text-vytal-muted",
  logout: "bg-vytal-muted/10 text-vytal-muted",
  export: "bg-vytal-orange/10 text-vytal-orange",
  crm: "bg-vytal-blue/10 text-vytal-blue",
  refund: "bg-vytal-red/10 text-vytal-red",
};

type ResourceType =
  | "Auth"
  | "Member"
  | "Class"
  | "Payment"
  | "Invoice"
  | "Settings"
  | "WOD"
  | "Lead"
  | "Plan"
  | "Automation"
  | "Report"
  | "Webhook"
  | "API Key"
  | "Permission"
  | "Email";

interface AuditEntry {
  id: number;
  timestamp: string;
  user: string;
  userInitials: string;
  action: ActionType;
  resource: ResourceType;
  details: string;
  expandedDetails?: string;
  ip: string;
}

const mockAuditLog: AuditEntry[] = [
  { id: 1, timestamp: "2026-06-04 10:42:15", user: "Andre Loureiro", userInitials: "AL", action: "login", resource: "Auth", details: "Logged in successfully", expandedDetails: "Browser: Chrome 126.0 / macOS 15.1 / Session ID: sess_a3f8c1", ip: "192.168.1.10" },
  { id: 2, timestamp: "2026-06-04 10:30:22", user: "System", userInitials: "SY", action: "payment", resource: "Payment", details: "Payment of 75 EUR processed for Rita Costa via Stripe", expandedDetails: "Stripe Payment Intent: pi_3QxR2aBc4DeF5gH6 / Card ending 4242", ip: "-- " },
  { id: 3, timestamp: "2026-06-04 09:55:10", user: "Andre Loureiro", userInitials: "AL", action: "create", resource: "Member", details: "Created member Carlos Mendes (#12)", expandedDetails: "Plan: Monthly (75 EUR) / Source: Referral from Ana Silva / Trial completed: Yes", ip: "192.168.1.10" },
  { id: 4, timestamp: "2026-06-04 09:30:00", user: "Marine Robba", userInitials: "MR", action: "update", resource: "Member", details: "Updated member status: Maria Oliveira -> inactive", expandedDetails: "Previous status: active / Reason: No attendance in 45 days / Automated flag", ip: "192.168.1.15" },
  { id: 5, timestamp: "2026-06-04 09:15:33", user: "Andre Loureiro", userInitials: "AL", action: "update", resource: "Member", details: "Changed plan for Pedro Almeida: Monthly -> Annual", expandedDetails: "Old plan: Monthly (75 EUR/mo) / New plan: Annual (720 EUR/yr) / Effective: 2026-06-05", ip: "192.168.1.10" },
  { id: 6, timestamp: "2026-06-04 08:45:00", user: "Ricardo Ribeiro", userInitials: "RR", action: "create", resource: "Class", details: "Created CrossFit class for June 5 at 18:00", expandedDetails: "Location: Main Box / Coach: Ricardo Ribeiro / Capacity: 16 / Duration: 60min", ip: "192.168.1.22" },
  { id: 7, timestamp: "2026-06-04 08:30:12", user: "Marine Robba", userInitials: "MR", action: "login", resource: "Auth", details: "Logged in successfully", ip: "192.168.1.15" },
  { id: 8, timestamp: "2026-06-03 18:00:00", user: "Andre Loureiro", userInitials: "AL", action: "delete", resource: "Class", details: "Cancelled Open Box class on June 8", expandedDetails: "Reason: Coach unavailable / 3 members notified / Rescheduled to June 9", ip: "192.168.1.10" },
  { id: 9, timestamp: "2026-06-03 17:22:44", user: "Ricardo Ribeiro", userInitials: "RR", action: "update", resource: "Class", details: "Marked attendance for CrossFit 18:00 (14/16 present)", expandedDetails: "Present: 14 / Absent: 2 (Ana Ferreira - no show, Joao Silva - cancelled) / Avg attendance: 87.5%", ip: "192.168.1.22" },
  { id: 10, timestamp: "2026-06-03 16:45:00", user: "System", userInitials: "SY", action: "payment", resource: "Invoice", details: "Invoice #2026-0089 generated for Sofia Santos", expandedDetails: "Amount: 75 EUR / Due: 2026-06-15 / Plan: Monthly / Auto-generated", ip: "--" },
  { id: 11, timestamp: "2026-06-03 15:30:00", user: "System", userInitials: "SY", action: "refund", resource: "Payment", details: "Refund of 25 EUR issued to Tiago Neves", expandedDetails: "Original payment: 75 EUR / Partial refund / Reason: Class cancellation / Stripe refund: re_3QxR2aBc", ip: "--" },
  { id: 12, timestamp: "2026-06-03 14:15:22", user: "Andre Loureiro", userInitials: "AL", action: "settings", resource: "Permission", details: "Updated role for Marine Robba: Staff -> Manager", expandedDetails: "New permissions: manage members, manage classes, view financials, manage leads", ip: "192.168.1.10" },
  { id: 13, timestamp: "2026-06-03 13:00:00", user: "Andre Loureiro", userInitials: "AL", action: "settings", resource: "Webhook", details: "Created webhook: Zapier -- New Member", expandedDetails: "URL: https://hooks.zapier.com/... / Events: member.created, member.updated / Secret generated", ip: "192.168.1.10" },
  { id: 14, timestamp: "2026-06-03 12:30:10", user: "Andre Loureiro", userInitials: "AL", action: "settings", resource: "API Key", details: "Created API key: Production API Key", expandedDetails: "Permissions: read_members, write_members, read_classes, read_financials / Expiry: Never", ip: "192.168.1.10" },
  { id: 15, timestamp: "2026-06-03 11:00:00", user: "Marine Robba", userInitials: "MR", action: "crm", resource: "Lead", details: "Lead stage changed: Helena Cardoso -> Contacted", expandedDetails: "Previous stage: New / Channel: Phone call / Follow-up scheduled: 2026-06-05", ip: "192.168.1.15" },
  { id: 16, timestamp: "2026-06-03 10:30:00", user: "Marine Robba", userInitials: "MR", action: "crm", resource: "Email", details: "Email sent to lead Bruno Ferreira", expandedDetails: "Template: Trial Invitation / Subject: 'Your free class is waiting!' / Opened: Yes", ip: "192.168.1.15" },
  { id: 17, timestamp: "2026-06-03 09:15:00", user: "Andre Loureiro", userInitials: "AL", action: "logout", resource: "Auth", details: "Logged out", ip: "192.168.1.10" },
  { id: 18, timestamp: "2026-06-02 18:00:00", user: "Ricardo Ribeiro", userInitials: "RR", action: "create", resource: "WOD", details: "Published WOD for June 3 (FRAN)", expandedDetails: "Type: Benchmark / Movements: Thrusters, Pull-ups / Time cap: 10min", ip: "192.168.1.22" },
  { id: 19, timestamp: "2026-06-02 16:30:00", user: "System", userInitials: "SY", action: "payment", resource: "Payment", details: "Payment of 60 EUR failed for Ana Ferreira via MBWay", expandedDetails: "Error: Insufficient funds / Retry scheduled: 2026-06-04 / Dunning email queued", ip: "--" },
  { id: 20, timestamp: "2026-06-02 14:00:00", user: "Andre Loureiro", userInitials: "AL", action: "export", resource: "Report", details: "Monthly attendance report exported (May 2026)", expandedDetails: "Format: CSV / Records: 1,247 attendance entries / Period: 2026-05-01 to 2026-05-31", ip: "192.168.1.10" },
];

const allUsers = ["All Users", "Andre Loureiro", "Marine Robba", "Ricardo Ribeiro", "System"];
const allActionTypes: ActionType[] = ["create", "update", "delete", "payment", "settings", "login", "logout", "export", "crm", "refund"];
const allResourceTypes: ResourceType[] = ["Auth", "Member", "Class", "Payment", "Invoice", "Settings", "WOD", "Lead", "Plan", "Automation", "Report", "Webhook", "API Key", "Permission", "Email"];

const PAGE_SIZE = 20;

export default function AuditLogPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedAction, setSelectedAction] = useState<ActionType | "all">("all");
  const [selectedResource, setSelectedResource] = useState<ResourceType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return mockAuditLog.filter((entry) => {
      if (selectedUser !== "All Users" && entry.user !== selectedUser) return false;
      if (selectedAction !== "all" && entry.action !== selectedAction) return false;
      if (selectedResource !== "all" && entry.resource !== selectedResource) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !entry.details.toLowerCase().includes(q) &&
          !entry.user.toLowerCase().includes(q) &&
          !entry.resource.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (dateFrom && entry.timestamp < dateFrom) return false;
      if (dateTo && entry.timestamp > dateTo + " 23:59:59") return false;
      return true;
    });
  }, [search, selectedUser, selectedAction, selectedResource, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedEntries = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Stats
  const eventsToday = mockAuditLog.filter((e) => e.timestamp.startsWith("2026-06-04")).length;
  const activeUsersToday = new Set(
    mockAuditLog
      .filter((e) => e.timestamp.startsWith("2026-06-04") && e.user !== "System")
      .map((e) => e.user)
  ).size;
  const mostActiveUser = (() => {
    const counts: Record<string, number> = {};
    mockAuditLog
      .filter((e) => e.user !== "System")
      .forEach((e) => {
        counts[e.user] = (counts[e.user] || 0) + 1;
      });
    let max = 0;
    let name = "--";
    for (const [user, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        name = user;
      }
    }
    return name;
  })();

  const hasFilters = selectedUser !== "All Users" || selectedAction !== "all" || selectedResource !== "all" || search || dateFrom || dateTo;

  function clearFilters() {
    setSelectedUser("All Users");
    setSelectedAction("all");
    setSelectedResource("all");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }

  function handleExport() {
    toast(t("toast.auditLogExported"), "success");
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: t("auditLog.title") },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("auditLog.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("auditLog.subtitle")}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <Download className="h-4 w-4" />
          {t("auditLog.exportCsv")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-vytal-green" />
            <span className="text-xs text-vytal-muted">{t("auditLog.eventsToday")}</span>
          </div>
          <p className="text-2xl font-bold text-vytal-text">{eventsToday}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-vytal-blue" />
            <span className="text-xs text-vytal-muted">{t("auditLog.usersActiveToday")}</span>
          </div>
          <p className="text-2xl font-bold text-vytal-text">{activeUsersToday}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-vytal-purple" />
            <span className="text-xs text-vytal-muted">{t("auditLog.mostActiveUser")}</span>
          </div>
          <p className="text-lg font-bold text-vytal-text truncate">{mostActiveUser}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-vytal-green" />
          <span className="text-xs font-semibold uppercase tracking-wider text-vytal-muted">{t("auditLog.filters")}</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 rounded-md bg-vytal-bg3 px-2 py-1 text-[10px] font-medium text-vytal-muted transition-colors hover:text-vytal-text"
            >
              <XIcon className="h-3 w-3" />
              {t("auditLog.clearAll")}
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-vytal-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder={t("auditLog.searchPlaceholder")}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 pl-9 pr-3 py-2 text-xs text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>

          {/* User Selector */}
          <select
            value={selectedUser}
            onChange={(e) => { setSelectedUser(e.target.value); setCurrentPage(1); }}
            className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          >
            {allUsers.map((u) => (
              <option key={u} value={u}>{u === "All Users" ? t("auditLog.allUsers") : u}</option>
            ))}
          </select>

          {/* Action Type */}
          <select
            value={selectedAction}
            onChange={(e) => { setSelectedAction(e.target.value as ActionType | "all"); setCurrentPage(1); }}
            className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          >
            <option value="all">{t("auditLog.allActions")}</option>
            {allActionTypes.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Resource Type */}
          <select
            value={selectedResource}
            onChange={(e) => { setSelectedResource(e.target.value as ResourceType | "all"); setCurrentPage(1); }}
            className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          >
            <option value="all">{t("auditLog.allResources")}</option>
            {allResourceTypes.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-vytal-muted" />
        <span className="text-xs font-medium text-vytal-muted">
          {filtered.length} {t("auditLog.entries")}
          {hasFilters && ` ${t("auditLog.filtered")}`}
        </span>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto rounded-xl border border-vytal-border">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("auditLog.timestamp")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("auditLog.user")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("auditLog.action")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("auditLog.resource")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("auditLog.details")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {paginatedEntries.map((entry) => (
              <>
                <tr
                  key={entry.id}
                  onClick={() =>
                    setExpandedRow(expandedRow === entry.id ? null : entry.id)
                  }
                  className={cn(
                    "bg-vytal-card transition-colors hover:bg-vytal-bg3 cursor-pointer",
                    expandedRow === entry.id && "bg-vytal-bg3"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-vytal-muted" />
                      <span className="font-mono text-xs text-vytal-muted">{entry.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                          entry.user === "System"
                            ? "bg-vytal-bg3 text-vytal-muted"
                            : "bg-vytal-green/10 text-vytal-green"
                        )}
                      >
                        {entry.userInitials}
                      </div>
                      <span className="text-sm text-vytal-text">{entry.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        actionColors[entry.action]
                      )}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded bg-vytal-bg3 px-2 py-0.5 text-xs text-vytal-muted">
                      {entry.resource}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-vytal-muted">{entry.details}</span>
                      {entry.expandedDetails && (
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 text-vytal-muted transition-transform",
                            expandedRow === entry.id && "rotate-180"
                          )}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-vytal-muted">{entry.ip}</span>
                  </td>
                </tr>
                {expandedRow === entry.id && entry.expandedDetails && (
                  <tr key={`${entry.id}-details`} className="bg-vytal-bg3">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="ml-8 rounded-lg border border-vytal-border bg-vytal-bg2 p-3">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                          {t("auditLog.expandedDetails")}
                        </span>
                        <p className="mt-1 text-xs text-vytal-text">{entry.expandedDetails}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-vytal-muted">
          {t("auditLog.page")} {currentPage} {t("auditLog.of")} {totalPages} ({filtered.length} {t("auditLog.entries")})
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                page === currentPage
                  ? "bg-vytal-green text-vytal-bg"
                  : "border border-vytal-border text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
              )}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
