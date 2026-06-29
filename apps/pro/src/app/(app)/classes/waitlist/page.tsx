"use client";

import { useState } from "react";
import { useDataStore } from "@/stores/data-store";
import {
  Users,
  CalendarDays,
  Clock,
  UserPlus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useToast } from "@/components/toast";

interface WaitlistEntry {
  id: string;
  classId: string;
  className: string;
  classDate: string;
  classTime: string;
  location: string;
  position: number;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  waitingSince: string;
}

export default function WaitlistPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const storeClasses = useDataStore((s) => s.classes);
  const storeMembers = useDataStore((s) => s.members);

  // Build mock waitlist data from classes that have waitlists
  const classesWithWaitlist = storeClasses.filter((c) => c.waitlistCount > 0);

  const initialEntries: WaitlistEntry[] = [];
  let memberIdx = 5; // Start from member index 5 to use different members

  classesWithWaitlist.forEach((cls) => {
    for (let pos = 1; pos <= cls.waitlistCount; pos++) {
      const member = storeMembers[memberIdx % storeMembers.length];
      memberIdx++;

      const hoursAgo = Math.floor(Math.random() * 48) + 1;
      const waitingSince = new Date(
        Date.now() - hoursAgo * 60 * 60 * 1000
      ).toISOString();

      initialEntries.push({
        id: `wl-${cls.id}-${pos}`,
        classId: cls.id,
        className: `${cls.classType.name} ${cls.startTime}`,
        classDate: cls.date,
        classTime: `${cls.startTime} - ${cls.endTime}`,
        location: cls.location.name,
        position: pos,
        memberName: member.name,
        memberEmail: member.email,
        memberPhone: member.phone ?? "",
        waitingSince,
      });
    }
  });

  const [entries, setEntries] = useState<WaitlistEntry[]>(initialEntries);

  const totalWaiting = entries.length;
  const classesWithWaitlists = new Set(entries.map((e) => e.classId)).size;

  // Group entries by class
  const grouped = entries.reduce<Record<string, WaitlistEntry[]>>((acc, entry) => {
    if (!acc[entry.classId]) acc[entry.classId] = [];
    acc[entry.classId].push(entry);
    return acc;
  }, {});

  function handlePromote(entryId: string) {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    toast(t("waitlist.promotedSuccess"), "success");
  }

  function handleRemove(entryId: string) {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    toast(t("waitlist.removedSuccess"), "info");
  }

  function formatWaitingSince(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 60) return `${diffMin}m`;
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("classes.title"), href: "/classes" },
          { label: t("waitlist.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("waitlist.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("waitlist.subtitle")}
          </p>
        </div>
        <Link
          href="/classes"
          className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <CalendarDays className="h-4 w-4" />
          {t("waitlist.backToClasses")}
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Users className="h-4 w-4 text-vytal-amber" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("waitlist.totalWaiting")}
              </span>
              <p className="text-lg font-bold text-vytal-text">{totalWaiting}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-blue/10">
              <CalendarDays className="h-4 w-4 text-vytal-blue" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("waitlist.classesWithWaitlists")}
              </span>
              <p className="text-lg font-bold text-vytal-text">
                {classesWithWaitlists}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Tables grouped by class */}
      {Object.entries(grouped).length === 0 ? (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-vytal-muted/40" />
          <p className="mt-3 text-sm text-vytal-muted">
            {t("waitlist.noWaitlists")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([classId, classEntries]) => {
            const first = classEntries[0];
            return (
              <div key={classId}>
                {/* Class header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/classes/${classId}`}
                      className="text-sm font-semibold text-vytal-text hover:text-vytal-green transition-colors"
                    >
                      {first.className} &mdash; {first.location}
                    </Link>
                    <span className="text-xs text-vytal-muted">
                      {new Date(first.classDate).toLocaleDateString("pt-PT", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <span className="rounded-full bg-vytal-amber/10 px-2.5 py-0.5 text-xs font-semibold text-vytal-amber">
                    {classEntries.length}{" "}
                    {classEntries.length === 1
                      ? t("waitlist.person")
                      : t("waitlist.people")}
                  </span>
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
                          {t("waitlist.memberName")}
                        </th>
                        <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted md:table-cell">
                          {t("waitlist.email")}
                        </th>
                        <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted lg:table-cell">
                          {t("waitlist.phone")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                          {t("waitlist.waitingSince")}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                          {t("waitlist.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vytal-border">
                      {classEntries.map((entry) => {
                        const initials = entry.memberName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2);

                        return (
                          <tr
                            key={entry.id}
                            className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                          >
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-vytal-amber">
                              #{entry.position}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-amber/10 text-xs font-semibold text-vytal-amber">
                                  {initials}
                                </div>
                                <span className="text-sm font-medium text-vytal-text">
                                  {entry.memberName}
                                </span>
                              </div>
                            </td>
                            <td className="hidden px-4 py-3 text-sm text-vytal-muted md:table-cell">
                              {entry.memberEmail}
                            </td>
                            <td className="hidden px-4 py-3 text-sm text-vytal-muted lg:table-cell">
                              {entry.memberPhone}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
                                <Clock className="h-3 w-3" />
                                {formatWaitingSince(entry.waitingSince)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handlePromote(entry.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-vytal-green/10 px-3 py-1.5 text-xs font-medium text-vytal-green transition-colors hover:bg-vytal-green/20"
                                >
                                  <UserPlus className="h-3 w-3" />
                                  {t("waitlist.promote")}
                                </button>
                                <button
                                  onClick={() => handleRemove(entry.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-vytal-red/10 px-3 py-1.5 text-xs font-medium text-vytal-red transition-colors hover:bg-vytal-red/20"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  {t("waitlist.remove")}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
