"use client";

import { useState, useMemo } from "react";
import { mockMembers } from "@vytal-fit/shared";
import type { MemberStatus } from "@vytal-fit/shared";
import { Search, Users, UserCheck, UserX, Clock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const planMap: Record<string, string> = {
  "m-1": "Unlimited",
  "m-2": "Unlimited",
  "m-3": "3x/week",
  "m-4": "3x/week",
  "m-5": "Trial",
  "m-6": "Unlimited",
  "m-7": "Unlimited",
  "m-8": "5x/week",
};

function StatusBadge({ status, t }: { status: MemberStatus; t: (key: string) => string }) {
  const config: Record<
    MemberStatus,
    { labelKey: string; className: string }
  > = {
    active: {
      labelKey: "members.active",
      className: "bg-vytal-green/10 text-vytal-green",
    },
    inactive: {
      labelKey: "members.inactive",
      className: "bg-vytal-red/10 text-vytal-red",
    },
    trial: {
      labelKey: "members.trial",
      className: "bg-vytal-amber/10 text-vytal-amber",
    },
    suspended: {
      labelKey: "members.suspended",
      className: "bg-vytal-purple/10 text-vytal-purple",
    },
  };

  const c = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.className
      )}
    >
      {t(c.labelKey)}
    </span>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

interface StatProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function MiniStat({ label, value, icon, color }: StatProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-vytal-text">{value}</p>
        <p className="text-xs text-vytal-muted">{label}</p>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const { t } = useI18n();

  const members = useMemo(() => {
    if (!search.trim()) return mockMembers;
    const q = search.toLowerCase();
    return mockMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.memberNumber.toString().includes(q)
    );
  }, [search]);

  const counts = useMemo(() => {
    const all = mockMembers;
    return {
      total: all.length,
      active: all.filter((m) => m.status === "active").length,
      inactive: all.filter((m) => m.status === "inactive").length,
      trial: all.filter((m) => m.status === "trial").length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("members.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("members.subtitle")}
          </p>
        </div>
        <Link
          href="/members/import"
          className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <Upload className="h-4 w-4" />
          {t("action.import")}
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat
          label={t("members.total")}
          value={counts.total}
          icon={<Users className="h-4 w-4 text-vytal-blue" />}
          color="bg-vytal-blue/10"
        />
        <MiniStat
          label={t("members.active")}
          value={counts.active}
          icon={<UserCheck className="h-4 w-4 text-vytal-green" />}
          color="bg-vytal-green/10"
        />
        <MiniStat
          label={t("members.inactive")}
          value={counts.inactive}
          icon={<UserX className="h-4 w-4 text-vytal-red" />}
          color="bg-vytal-red/10"
        />
        <MiniStat
          label={t("members.trial")}
          value={counts.trial}
          icon={<Clock className="h-4 w-4 text-vytal-amber" />}
          color="bg-vytal-amber/10"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
        <input
          type="text"
          placeholder={t("members.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-vytal-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("members.name")}
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted md:table-cell">
                {t("members.email")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("members.status")}
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted lg:table-cell">
                {t("members.plan")}
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">
                {t("members.lastCheckIn")}
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted xl:table-cell">
                {t("members.streak")}
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted xl:table-cell">
                {t("members.checkIns")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {members.map((member) => (
              <tr
                key={member.id}
                className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
              >
                <td className="px-4 py-3 font-mono text-xs text-vytal-muted">
                  {member.memberNumber}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/members/${member.id}`} className="flex items-center gap-3 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-semibold text-vytal-green">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-vytal-text group-hover:text-vytal-green transition-colors">
                      {member.name}
                    </span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted md:table-cell">
                  {member.email}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={member.status} t={t} />
                </td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted lg:table-cell">
                  {planMap[member.id] || "N/A"}
                </td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted sm:table-cell">
                  {formatDate(member.lastCheckIn)}
                </td>
                <td className="hidden px-4 py-3 text-right xl:table-cell">
                  {member.streakWeeks > 0 ? (
                    <span className="font-mono text-sm text-vytal-green">
                      {member.streakWeeks}w
                    </span>
                  ) : (
                    <span className="font-mono text-sm text-vytal-muted">
                      --
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-right font-mono text-sm text-vytal-muted xl:table-cell">
                  {member.totalCheckIns}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="bg-vytal-card p-8 text-center">
            <p className="text-sm text-vytal-muted">
              {t("members.noResults")} &quot;{search}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
