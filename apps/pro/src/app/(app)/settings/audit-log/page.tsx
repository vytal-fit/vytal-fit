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
import { trpc } from "@/lib/trpc";

function fmtTs(d: string | Date): string {
  const dt = new Date(d);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`;
}

function initialsOf(name: string): string {
  return name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

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
  id: string;
  timestamp: string;
  user: string;
  userInitials: string;
  action: ActionType;
  resource: ResourceType;
  details: string;
  expandedDetails?: string;
  ip: string;
}

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
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const logQuery = trpc.auditLog.list.useQuery();
  const entries: AuditEntry[] = useMemo(
    () =>
      (logQuery.data ?? []).map((r) => ({
        id: r.id,
        timestamp: fmtTs(r.createdAt),
        user: r.actorName,
        userInitials: initialsOf(r.actorName),
        action: r.action as ActionType,
        resource: r.resource as ResourceType,
        details: r.details,
        expandedDetails: r.expandedDetails ?? undefined,
        ip: r.ip ?? "--",
      })),
    [logQuery.data],
  );

  const allUsers = useMemo(
    () => ["All Users", ...Array.from(new Set(entries.map((e) => e.user)))],
    [entries],
  );

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
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
  }, [entries, search, selectedUser, selectedAction, selectedResource, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedEntries = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Stats (real, relative to today)
  const todayPrefix = fmtTs(new Date()).slice(0, 10);
  const eventsToday = entries.filter((e) => e.timestamp.startsWith(todayPrefix)).length;
  const activeUsersToday = new Set(
    entries.filter((e) => e.timestamp.startsWith(todayPrefix) && e.user !== "System").map((e) => e.user),
  ).size;
  const mostActiveUser = (() => {
    const counts: Record<string, number> = {};
    entries.filter((e) => e.user !== "System").forEach((e) => {
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
