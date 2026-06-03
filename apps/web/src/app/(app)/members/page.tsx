"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useDataStore } from "@/stores/data-store";
import type { MemberStatus } from "@vytal-fit/shared";
import {
  Search, Users, UserCheck, UserX, Clock, Upload, Download, FileText,
  Mail, Smartphone, CreditCard, AlertTriangle, Eye, SearchX,
  ArrowUp, ArrowDown, Plus, Trash2, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Pagination } from "@/components/pagination";

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

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("memberNumber");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const { t } = useI18n();
  const storeMembers = useDataStore((s) => s.members);
  const addMember = useDataStore((s) => s.addMember);
  const deleteMember = useDataStore((s) => s.deleteMember);
  const { toast } = useToast();
  const formatDate = useFormatDate();

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addStatus, setAddStatus] = useState<MemberStatus>("active");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleAdd() {
    if (!addName.trim()) { toast("Name is required", "error"); return; }
    if (!addEmail.trim()) { toast("Email is required", "error"); return; }
    const maxNum = storeMembers.reduce((max, m) => Math.max(max, m.memberNumber), 0);
    addMember({
      organizationId: "org-1",
      memberNumber: maxNum + 1,
      name: addName.trim(),
      email: addEmail.trim(),
      phone: addPhone.trim() || undefined,
      status: addStatus,
      joinedAt: new Date().toISOString(),
      lastCheckIn: undefined,
      streakWeeks: 0,
      totalCheckIns: 0,
    });
    toast("Member added", "success");
    setAddName(""); setAddEmail(""); setAddPhone(""); setAddStatus("active");
    setShowAddForm(false);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteMember(deleteTarget.id);
    toast("Member deleted", "success");
    setDeleteTarget(null);
  }

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) { setSortDir((d) => (d === "asc" ? "desc" : "asc")); }
    else { setSortKey(key); setSortDir("asc"); }
  }, [sortKey]);

  const members = useMemo(() => {
    let list = [...storeMembers];
    if (filter === "active") list = list.filter((m) => m.status === "active");
    else if (filter === "inactive") list = list.filter((m) => m.status === "inactive");
    else if (filter === "trial") list = list.filter((m) => m.status === "trial");
    else if (filter === "at_risk") list = list.filter((m) => m.status === "active" && m.streakWeeks <= 1 && m.lastCheckIn !== undefined);
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
  }, [search, filter, sortKey, sortDir, storeMembers]);

  useEffect(() => { setCurrentPage(1); }, [search, filter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
  const pagedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return members.slice(start, start + PAGE_SIZE);
  }, [members, currentPage]);

  const counts = useMemo(() => {
    const all = storeMembers;
    return {
      total: all.length,
      active: all.filter((m) => m.status === "active").length,
      inactive: all.filter((m) => m.status === "inactive").length,
      trial: all.filter((m) => m.status === "trial").length,
    };
  }, [storeMembers]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === members.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(members.map((m) => m.id)));
  };

  const handleExportCSV = useCallback(() => {
    const headers = ["#", "Name", "Email", "Phone", "Status", "Plan", "Last Check-in", "Streak", "Check-ins"];
    const rows = storeMembers.map((m) => [m.memberNumber, m.name, m.email, m.phone ?? "", m.status, planMap[m.id] ?? "N/A", m.lastCheckIn ?? "Never", m.streakWeeks, m.totalCheckIns]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "members.csv"; a.click();
    URL.revokeObjectURL(url);
    toast(t("members.csvExported"), "success");
  }, [toast, storeMembers, t]);

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
            {showAddForm ? t("action.cancel") : "Add Member"}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">Add Member</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Name</label>
              <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Full name" className={inputClass} />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Email</label>
              <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email@example.com" className={inputClass} />
            </div>
            <div className="w-40">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Phone</label>
              <input type="text" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+351..." className={inputClass} />
            </div>
            <div className="w-32">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Status</label>
              <select value={addStatus} onChange={(e) => setAddStatus(e.target.value as MemberStatus)} className={inputClass}>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button onClick={handleAdd} className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90">
              <Check className="h-4 w-4" /> {t("action.save")}
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat label={t("members.total")} value={counts.total} icon={<Users className="h-4 w-4 text-vytal-blue" />} color="bg-vytal-blue/10" />
        <MiniStat label={t("members.active")} value={counts.active} icon={<UserCheck className="h-4 w-4 text-vytal-green" />} color="bg-vytal-green/10" />
        <MiniStat label={t("members.inactive")} value={counts.inactive} icon={<UserX className="h-4 w-4 text-vytal-red" />} color="bg-vytal-red/10" />
        <MiniStat label={t("members.trial")} value={counts.trial} icon={<Clock className="h-4 w-4 text-vytal-amber" />} color="bg-vytal-amber/10" />
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
              <tr key={member.id} className={cn("transition-colors", selectedIds.has(member.id) ? "bg-vytal-green/5" : "bg-vytal-card hover:bg-vytal-bg3")}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(member.id)} onChange={() => toggleSelect(member.id)} className="h-3.5 w-3.5 rounded border-vytal-border accent-vytal-green" />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-vytal-muted">{member.memberNumber}</td>
                <td className="px-4 py-3">
                  <Link href={`/members/${member.id}`} className="group flex items-center gap-3">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold", avatarColors[member.status])}>
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-vytal-text transition-colors group-hover:text-vytal-green">{member.name}</span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted md:table-cell">{member.email}</td>
                <td className="px-4 py-3"><StatusBadge status={member.status} t={t} /></td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted lg:table-cell">{planMap[member.id] || "N/A"}</td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted sm:table-cell">{formatDate(member.lastCheckIn)}</td>
                <td className="hidden px-4 py-3 text-right xl:table-cell">
                  {member.streakWeeks > 0 ? <span className="font-mono text-sm text-vytal-green">{member.streakWeeks}w</span> : <span className="font-mono text-sm text-vytal-muted">--</span>}
                </td>
                <td className="hidden px-4 py-3 text-right font-mono text-sm text-vytal-muted xl:table-cell">{member.totalCheckIns}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/members/${member.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-green" title="View member">
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <button onClick={() => setDeleteTarget({ id: member.id, name: member.name })} className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red" title="Delete member">
                      <Trash2 className="h-3.5 w-3.5" />
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

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={members.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Member"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
