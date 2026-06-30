"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { MemberStatus } from "@vytal-fit/shared";
import {
  Search, Users, UserCheck, UserX, Clock, Upload, Download, FileText,
  Mail, Smartphone, CreditCard, AlertTriangle, Eye, SearchX,
  ArrowUp, ArrowDown, Plus, Archive, X, Check,
  DollarSign, Activity,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { rowsToMembers } from "@/lib/member-mapper";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Pagination } from "@/components/pagination";
import { DetailPanel } from "@/components/detail-panel";
import { FilterDrawer, type FilterField } from "@/components/filter-drawer";

const planMap: Record<string, string> = {
  "m-1": "Unlimited", "m-2": "Unlimited", "m-3": "3x/week", "m-4": "3x/week",
  "m-5": "Trial", "m-6": "Unlimited", "m-7": "Unlimited", "m-8": "5x/week",
};

type FilterKey = "all" | "active" | "inactive" | "trial" | "at_risk";
type SortKey = "memberNumber" | "name" | "email" | "status" | "lastCheckIn" | "streakWeeks" | "totalCheckIns";
type SortDir = "asc" | "desc";

const avatarColors: Record<MemberStatus, string> = {
  active: "bg-vytal-green/10 text-vytal-green",
  inactive: "bg-vytal-red/10 text-vytal-red",
  trial: "bg-vytal-amber/10 text-vytal-amber",
  suspended: "bg-vytal-purple/10 text-vytal-purple",
};

function StatusBadge({ status, t }: { status: MemberStatus; t: (key: string) => string }) {
  const config: Record<MemberStatus, { labelKey: string; className: string }> = {
    active: { labelKey: "members.active", className: "bg-vytal-green/10 text-vytal-green" },
    inactive: { labelKey: "members.inactive", className: "bg-vytal-red/10 text-vytal-red" },
    trial: { labelKey: "members.trial", className: "bg-vytal-amber/10 text-vytal-amber" },
    suspended: { labelKey: "members.suspended", className: "bg-vytal-purple/10 text-vytal-purple" },
  };
  const c = config[status];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", c.className)}>{t(c.labelKey)}</span>;
}

function useFormatDate() {
  const { t } = useI18n();
  return (dateStr?: string): string => {
    if (!dateStr) return t("ui.never");
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t("ui.today");
    if (diffDays === 1) return t("ui.yesterday");
    if (diffDays < 7) return `${diffDays}${t("time.dAgo")}`;
    return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
  };
}

interface StatProps { label: string; value: number; icon: React.ReactNode; color: string }
function MiniStat({ label, value, icon, color }: StatProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>{icon}</div>
      <div><p className="text-lg font-bold text-vytal-text">{value}</p><p className="text-xs text-vytal-muted">{label}</p></div>
    </div>
  );
}

function SortIcon({ sortKey, currentKey, dir }: { sortKey: SortKey; currentKey: SortKey; dir: SortDir }) {
  if (sortKey !== currentKey) return null;
  return dir === "asc" ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />;
}

// ---------- Detail Panel Tab Types ----------
type PanelTab = "overview" | "activity" | "payments";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("memberNumber");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const { t } = useI18n();
  const router = useRouter();
  const plansQuery = trpc.subscriptions.plans.list.useQuery();
  const storePlans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const { toast } = useToast();
  const formatDate = useFormatDate();

  // ── tRPC: members list (status filter mapped to the router contract) ──
  const utils = trpc.useUtils();
  const statusFilter =
    filter === "active" || filter === "inactive" || filter === "trial" ? filter : undefined;
  const listQuery = trpc.members.list.useInfiniteQuery(
    { limit: 100, status: statusFilter },
    { getNextPageParam: (page) => page.nextCursor },
  );
  // Drain remaining cursor pages so client-side search/sort/pagination operate
  // on the full (org-scoped) set, matching the previous store behaviour.
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = listQuery;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const fetchedMembers = useMemo(
    () => rowsToMembers(listQuery.data?.pages.flatMap((p) => p.items) ?? []),
    [listQuery.data],
  );

  // Unfiltered query powers the stats bar + filter pill counts.
  const countsQuery = trpc.members.list.useQuery({ limit: 100 });

  const createMember = trpc.members.create.useMutation();
  const archiveMember = trpc.members.archive.useMutation();

  // Detail panel state
  const [panelMemberId, setPanelMemberId] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("overview");
  const panelMember = panelMemberId ? fetchedMembers.find((m) => m.id === panelMemberId) : null;

  // Real activity + payments for the open detail panel.
  const panelPaymentsQuery = trpc.payments.byMember.useQuery(
    { memberId: panelMemberId ?? "" },
    { enabled: !!panelMemberId },
  );
  const panelCheckInsQuery = trpc.checkIns.list.useQuery(
    { memberId: panelMemberId ?? "", limit: 8 },
    { enabled: !!panelMemberId },
  );
  const panelPayments = (panelPaymentsQuery.data ?? []).slice(0, 6).map((p) => ({
    date: new Date(p.paidAt ?? p.createdAt).toISOString().slice(0, 10),
    amount: Number(p.amount),
    method: p.method,
    status: p.status,
  }));
  const panelActivity = (panelCheckInsQuery.data?.items ?? []).map((c) => ({
    label: t("detailPanel.checkedIn"),
    time: new Date(c.checkedInAt).toLocaleString("pt-PT"),
  }));

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, unknown>>({});

  const filterFields: FilterField[] = useMemo(() => [
    {
      key: "statusAdv",
      label: t("members.status"),
      type: "multiselect",
      options: [
        { value: "active", label: t("members.active") },
        { value: "inactive", label: t("members.inactive") },
        { value: "trial", label: t("members.trial") },
        { value: "suspended", label: t("members.suspended") },
      ],
    },
    {
      key: "plan",
      label: t("members.plan"),
      type: "multiselect",
      options: storePlans.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      key: "gender",
      label: t("detailPanel.gender"),
      type: "select",
      options: [
        { value: "male", label: t("detailPanel.male") },
        { value: "female", label: t("detailPanel.female") },
      ],
    },
    {
      key: "joinDate",
      label: t("detailPanel.joinDate"),
      type: "daterange",
    },
    {
      key: "lastCheckIn",
      label: t("members.lastCheckIn"),
      type: "daterange",
    },
  ], [t, storePlans]);

  const advancedActiveCount = useMemo(() => {
    let count = 0;
    const v = advancedFilters;
    if (Array.isArray(v.statusAdv) && v.statusAdv.length > 0) count++;
    if (Array.isArray(v.plan) && v.plan.length > 0) count++;
    if (typeof v.gender === "string" && v.gender) count++;
    if (v.joinDate && typeof v.joinDate === "object") {
      const dr = v.joinDate as { from: string; to: string };
      if (dr.from || dr.to) count++;
    }
    if (v.lastCheckIn && typeof v.lastCheckIn === "object") {
      const dr = v.lastCheckIn as { from: string; to: string };
      if (dr.from || dr.to) count++;
    }
    return count;
  }, [advancedFilters]);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addStatus, setAddStatus] = useState<MemberStatus>("active");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleAdd() {
    if (!addName.trim()) { toast(t("members.nameRequired"), "error"); return; }
    if (!addEmail.trim()) { toast(t("members.emailRequired"), "error"); return; }
    createMember.mutate(
      {
        name: addName.trim(),
        email: addEmail.trim(),
        phone: addPhone.trim() || undefined,
        status: addStatus,
      },
      {
        onSuccess: () => {
          void utils.members.list.invalidate();
          toast(t("members.memberAdded"), "success");
          setAddName(""); setAddEmail(""); setAddPhone(""); setAddStatus("active");
          setShowAddForm(false);
        },
        onError: () => toast(t("ui.error"), "error"),
      },
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    archiveMember.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          void utils.members.list.invalidate();
          toast(t("members.memberArchived"), "success");
        },
        onError: () => toast(t("ui.error"), "error"),
      },
    );
    setDeleteTarget(null);
  }

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) { setSortDir((d) => (d === "asc" ? "desc" : "asc")); }
    else { setSortKey(key); setSortDir("asc"); }
  }, [sortKey]);

  function handleRowClick(memberId: string, e: React.MouseEvent) {
    if (e.shiftKey) {
      router.push(`/members/${memberId}`);
    } else {
      setPanelMemberId(memberId);
      setPanelTab("overview");
    }
  }

  const members = useMemo(() => {
    let list = [...fetchedMembers];

    // Quick filters (active/inactive/trial are already applied server-side via
    // the `status` input; re-applying here is a harmless safety net)
    if (filter === "active") list = list.filter((m) => m.status === "active");
    else if (filter === "inactive") list = list.filter((m) => m.status === "inactive");
    else if (filter === "trial") list = list.filter((m) => m.status === "trial");
    else if (filter === "at_risk") list = list.filter((m) => m.status === "active" && m.streakWeeks <= 1 && m.lastCheckIn !== undefined);

    // Advanced filters
    const af = advancedFilters;
    if (Array.isArray(af.statusAdv) && af.statusAdv.length > 0) {
      list = list.filter((m) => (af.statusAdv as string[]).includes(m.status));
    }
    if (Array.isArray(af.plan) && af.plan.length > 0) {
      list = list.filter((m) => m.planId && (af.plan as string[]).includes(m.planId));
    }
    if (typeof af.gender === "string" && af.gender) {
      list = list.filter((m) => m.gender === af.gender);
    }
    if (af.joinDate && typeof af.joinDate === "object") {
      const dr = af.joinDate as { from: string; to: string };
      if (dr.from) list = list.filter((m) => m.joinedAt >= dr.from);
      if (dr.to) list = list.filter((m) => m.joinedAt <= dr.to + "T23:59:59");
    }
    if (af.lastCheckIn && typeof af.lastCheckIn === "object") {
      const dr = af.lastCheckIn as { from: string; to: string };
      if (dr.from) list = list.filter((m) => m.lastCheckIn && m.lastCheckIn >= dr.from);
      if (dr.to) list = list.filter((m) => m.lastCheckIn && m.lastCheckIn <= dr.to + "T23:59:59");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.memberNumber.toString().includes(q));
    }
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "memberNumber": cmp = a.memberNumber - b.memberNumber; break;
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "email": cmp = a.email.localeCompare(b.email); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "lastCheckIn": cmp = (a.lastCheckIn ?? "").localeCompare(b.lastCheckIn ?? ""); break;
        case "streakWeeks": cmp = a.streakWeeks - b.streakWeeks; break;
        case "totalCheckIns": cmp = a.totalCheckIns - b.totalCheckIns; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [search, filter, sortKey, sortDir, fetchedMembers, advancedFilters]);

  useEffect(() => { setCurrentPage(1); }, [search, filter, sortKey, sortDir, advancedFilters]);

  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
  const pagedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return members.slice(start, start + PAGE_SIZE);
  }, [members, currentPage]);

  const counts = useMemo(() => {
    const all = countsQuery.data?.items ?? [];
    return {
      total: all.length,
      active: all.filter((m) => m.status === "active").length,
      inactive: all.filter((m) => m.status === "inactive").length,
      trial: all.filter((m) => m.status === "trial").length,
    };
  }, [countsQuery.data]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === members.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(members.map((m) => m.id)));
  };

  const handleExportCSV = useCallback(() => {
    const headers = ["#", "Name", "Email", "Phone", "Status", "Plan", "Last Check-in", "Streak", "Check-ins"];
    const rows = fetchedMembers.map((m) => [m.memberNumber, m.name, m.email, m.phone ?? "", m.status, planMap[m.id] ?? "N/A", m.lastCheckIn ?? "Never", m.streakWeeks, m.totalCheckIns]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "members.csv"; a.click();
    URL.revokeObjectURL(url);
    toast(t("members.csvExported"), "success");
  }, [toast, fetchedMembers, t]);

  const handleExportPDF = useCallback(() => { toast(t("members.pdfGenerated"), "success"); }, [toast, t]);

  const filters: { key: FilterKey; label: string; count?: number }[] = [
    { key: "all", label: t("members.all"), count: counts.total },
    { key: "active", label: t("members.active"), count: counts.active },
    { key: "inactive", label: t("members.inactive"), count: counts.inactive },
    { key: "trial", label: t("members.trial"), count: counts.trial },
    { key: "at_risk", label: t("members.atRisk") },
  ];

  const thClass = "cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted hover:text-vytal-text transition-colors";

  const inputClass = "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  const panelTabs: { key: PanelTab; label: string }[] = [
    { key: "overview", label: t("detailPanel.overview") },
    { key: "activity", label: t("detailPanel.activity") },
    { key: "payments", label: t("detailPanel.payments") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("members.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("members.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-lg border border-vytal-border px-3 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 rounded-lg border border-vytal-border px-3 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
            <FileText className="h-4 w-4" /> PDF
          </button>
          <Link href="/members/import" className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
            <Upload className="h-4 w-4" /> {t("action.import")}
          </Link>
          <button onClick={() => setShowAddForm((v) => !v)} className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddForm ? t("action.cancel") : t("members.addMember")}
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-green/20 bg-vytal-green/5 px-3.5 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10">
          <Plus className="h-3.5 w-3.5" />
          {t("quickAction.addMember")}
        </button>
        <Link href="/members/import" className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <Upload className="h-3.5 w-3.5" />
          {t("quickAction.import")}
        </Link>
        <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <Download className="h-3.5 w-3.5" />
          {t("quickAction.exportCsv")}
        </button>
        <button onClick={handleExportPDF} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <FileText className="h-3.5 w-3.5" />
          {t("quickAction.exportPdf")}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("members.addMemberTitle")}</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("members.name")}</label>
              <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Full name" className={inputClass} />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("members.email")}</label>
              <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email@example.com" className={inputClass} />
            </div>
            <div className="w-40">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("members.phone")}</label>
              <input type="text" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+351..." className={inputClass} />
            </div>
            <div className="w-32">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("members.status")}</label>
              <select value={addStatus} onChange={(e) => setAddStatus(e.target.value as MemberStatus)} className={inputClass}>
                <option value="active">{t("members.active")}</option>
                <option value="trial">{t("members.trial")}</option>
                <option value="inactive">{t("members.inactive")}</option>
              </select>
            </div>
            <button onClick={handleAdd} disabled={createMember.isPending} className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-50">
              <Check className="h-4 w-4" /> {t("action.save")}
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {countsQuery.isPending ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[58px] rounded-lg" />)
        ) : (
          <>
            <MiniStat label={t("members.total")} value={counts.total} icon={<Users className="h-4 w-4 text-vytal-blue" />} color="bg-vytal-blue/10" />
            <MiniStat label={t("members.active")} value={counts.active} icon={<UserCheck className="h-4 w-4 text-vytal-green" />} color="bg-vytal-green/10" />
            <MiniStat label={t("members.inactive")} value={counts.inactive} icon={<UserX className="h-4 w-4 text-vytal-red" />} color="bg-vytal-red/10" />
            <MiniStat label={t("members.trial")} value={counts.trial} icon={<Clock className="h-4 w-4 text-vytal-amber" />} color="bg-vytal-amber/10" />
          </>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button key={f.key} onClick={() => { setFilter(f.key); setSelectedIds(new Set()); }} className={cn("flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", filter === f.key ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text")}>
            {f.label}
            {f.count !== undefined && <span className={cn("font-mono text-[10px]", filter === f.key ? "text-vytal-green/70" : "text-vytal-muted")}>{f.count}</span>}
            {f.key === "at_risk" && <AlertTriangle className="h-3 w-3 text-vytal-red" />}
          </button>
        ))}
      </div>

      {/* Advanced Filter Drawer */}
      <FilterDrawer
        fields={filterFields}
        values={advancedFilters}
        onChange={(key, value) => setAdvancedFilters((prev) => ({ ...prev, [key]: value }))}
        onClear={() => setAdvancedFilters({})}
        activeCount={advancedActiveCount}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
        <input type="text" placeholder={t("members.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-vytal-green/20 bg-vytal-green/5 px-4 py-3">
          <span className="text-sm font-medium text-vytal-green">{t("members.selected").replace("{count}", String(selectedIds.size))}</span>
          <div className="flex gap-2">
            <button onClick={() => toast(t("members.emailSent").replace("{count}", String(selectedIds.size)), "success")} className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text hover:bg-vytal-bg3">
              <Mail className="h-3 w-3" /> {t("members.sendEmail")}
            </button>
            <button onClick={() => toast(t("members.smsSent").replace("{count}", String(selectedIds.size)), "success")} className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text hover:bg-vytal-bg3">
              <Smartphone className="h-3 w-3" /> {t("members.sendSms")}
            </button>
            <button onClick={() => toast(t("members.planChanged").replace("{count}", String(selectedIds.size)), "success")} className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text hover:bg-vytal-bg3">
              <CreditCard className="h-3 w-3" /> {t("members.changePlan")}
            </button>
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-vytal-muted hover:text-vytal-text">{t("members.clearSelection")}</button>
        </div>
      )}

      {/* Table */}
      {listQuery.isError ? (
        <EmptyState
          icon={AlertTriangle}
          title={t("ui.error")}
          description={t("members.loadError")}
          action={{ label: t("billing.retry"), onClick: () => void listQuery.refetch() }}
        />
      ) : listQuery.isPending ? (
        <div className="space-y-2 rounded-xl border border-vytal-border bg-vytal-card p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
      <div className="overflow-x-auto rounded-xl border border-vytal-border">
        <table className="zebra-table sticky-thead w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={members.length > 0 && selectedIds.size === members.length} onChange={toggleSelectAll} className="h-3.5 w-3.5 rounded border-vytal-border accent-vytal-green" />
              </th>
              <th className={thClass} onClick={() => handleSort("memberNumber")}># <SortIcon sortKey="memberNumber" currentKey={sortKey} dir={sortDir} /></th>
              <th className={thClass} onClick={() => handleSort("name")}>{t("members.name")} <SortIcon sortKey="name" currentKey={sortKey} dir={sortDir} /></th>
              <th className={cn(thClass, "hidden md:table-cell")} onClick={() => handleSort("email")}>{t("members.email")} <SortIcon sortKey="email" currentKey={sortKey} dir={sortDir} /></th>
              <th className={thClass} onClick={() => handleSort("status")}>{t("members.status")} <SortIcon sortKey="status" currentKey={sortKey} dir={sortDir} /></th>
              <th className={cn(thClass, "hidden lg:table-cell")}>{t("members.plan")}</th>
              <th className={cn(thClass, "hidden sm:table-cell")} onClick={() => handleSort("lastCheckIn")}>{t("members.lastCheckIn")} <SortIcon sortKey="lastCheckIn" currentKey={sortKey} dir={sortDir} /></th>
              <th className={cn(thClass, "hidden xl:table-cell text-right")} onClick={() => handleSort("streakWeeks")}>{t("members.streak")} <SortIcon sortKey="streakWeeks" currentKey={sortKey} dir={sortDir} /></th>
              <th className={cn(thClass, "hidden xl:table-cell text-right")} onClick={() => handleSort("totalCheckIns")}>{t("members.checkIns")} <SortIcon sortKey="totalCheckIns" currentKey={sortKey} dir={sortDir} /></th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {pagedMembers.map((member) => (
              <tr
                key={member.id}
                onClick={(e) => handleRowClick(member.id, e)}
                className={cn(
                  "cursor-pointer row-interactive transition-colors",
                  selectedIds.has(member.id) ? "bg-vytal-green/5" : "bg-vytal-card hover:bg-vytal-bg3"
                )}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(member.id)} onChange={() => toggleSelect(member.id)} className="h-3.5 w-3.5 rounded border-vytal-border accent-vytal-green" />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-vytal-muted">{member.memberNumber}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold", avatarColors[member.status])}>
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-vytal-text transition-colors hover:text-vytal-green">{member.name}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted md:table-cell">{member.email}</td>
                <td className="px-4 py-3"><StatusBadge status={member.status} t={t} /></td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted lg:table-cell">{planMap[member.id] || "N/A"}</td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted sm:table-cell">{formatDate(member.lastCheckIn)}</td>
                <td className="hidden px-4 py-3 text-right xl:table-cell">
                  {member.streakWeeks > 0 ? <span className="font-mono text-sm text-vytal-green">{member.streakWeeks}w</span> : <span className="font-mono text-sm text-vytal-muted">--</span>}
                </td>
                <td className="hidden px-4 py-3 text-right font-mono text-sm text-vytal-muted xl:table-cell">{member.totalCheckIns}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <Link href={`/members/${member.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-green" title={t("members.viewMember")}>
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <button onClick={() => setDeleteTarget({ id: member.id, name: member.name })} className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red" title={t("members.archiveMember")}>
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="bg-vytal-card p-12 text-center">
            <SearchX className="mx-auto h-8 w-8 text-vytal-muted" />
            <p className="mt-3 text-sm font-medium text-vytal-text">{t("members.noMembersFound")}</p>
            <p className="mt-1 text-xs text-vytal-muted">
              {search ? t("members.noResultsFor").replace("{query}", search) : t("members.noMembersInFilter").replace("{filter}", filter)}
            </p>
            {(search || filter !== "all") && (
              <button onClick={() => { setSearch(""); setFilter("all"); }} className="mt-4 rounded-lg border border-vytal-border px-4 py-2 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
                {t("members.clearFilters")}
              </button>
            )}
          </div>
        )}
      </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={members.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("members.archiveMember")}
        description={t("ui.areYouSure")}
        confirmLabel={t("action.confirm")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Detail Panel */}
      {panelMember && (
        <DetailPanel
          open={!!panelMember}
          onClose={() => setPanelMemberId(null)}
          title={panelMember.name}
          subtitle={panelMember.email}
          width="lg"
          actions={
            <div className="flex items-center gap-2">
              <Link
                href={`/members/${panelMember.id}`}
                className="rounded-lg border border-vytal-border px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
              >
                {t("detailPanel.viewFullProfile")}
              </Link>
              <button
                className="rounded-lg bg-vytal-green px-3 py-1.5 text-xs font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                onClick={() => toast(t("detailPanel.editMode"), "info")}
              >
                {t("action.edit")}
              </button>
            </div>
          }
        >
          <div className="px-6">
            {/* Avatar + Status */}
            <div className="flex items-center gap-4 border-b border-vytal-border py-5">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold", avatarColors[panelMember.status])}>
                {panelMember.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-vytal-text">{panelMember.name}</h3>
                <StatusBadge status={panelMember.status} t={t} />
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 border-b border-vytal-border">
              {panelTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPanelTab(tab.key)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors",
                    panelTab === tab.key
                      ? "border-b-2 border-vytal-green text-vytal-green"
                      : "text-vytal-muted hover:text-vytal-text"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="py-5">
              {panelTab === "overview" && (
                <div className="space-y-4">
                  {[
                    { label: t("members.email"), value: panelMember.email },
                    { label: t("members.phone"), value: panelMember.phone ?? "--" },
                    { label: t("members.plan"), value: planMap[panelMember.id] ?? "N/A" },
                    { label: t("detailPanel.joinDate"), value: new Date(panelMember.joinedAt).toLocaleDateString("pt-PT") },
                    { label: t("members.lastCheckIn"), value: formatDate(panelMember.lastCheckIn) },
                    { label: t("members.streak"), value: panelMember.streakWeeks > 0 ? `${panelMember.streakWeeks} weeks` : "--" },
                    { label: t("members.checkIns"), value: String(panelMember.totalCheckIns) },
                    { label: t("detailPanel.memberNumber"), value: `#${panelMember.memberNumber}` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-vytal-muted">{item.label}</span>
                      <span className="text-sm font-medium text-vytal-text">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {panelTab === "activity" && (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("detailPanel.recentActivity")}</p>
                  {panelActivity.length === 0 && (
                    <p className="text-xs text-vytal-muted">{t("ui.noData") || "Sem atividade recente"}</p>
                  )}
                  {panelActivity.map((act, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-bg3">
                        <Activity className="h-4 w-4 text-vytal-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-vytal-text">{act.label}</p>
                        <p className="text-[10px] text-vytal-muted">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {panelTab === "payments" && (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("detailPanel.paymentHistory")}</p>
                  {panelPayments.length === 0 && (
                    <p className="text-xs text-vytal-muted">{t("ui.noData") || "Sem pagamentos"}</p>
                  )}
                  {panelPayments.map((pmt, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-vytal-border bg-vytal-card p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-bg3">
                          <DollarSign className="h-4 w-4 text-vytal-green" />
                        </div>
                        <div>
                          <p className="text-sm text-vytal-text">{new Date(pmt.date).toLocaleDateString("pt-PT")}</p>
                          <p className="text-[10px] text-vytal-muted">{pmt.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-vytal-text">{pmt.amount} EUR</p>
                        <span className="inline-flex items-center rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-medium text-vytal-green">
                          {pmt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DetailPanel>
      )}
    </div>
  );
}
