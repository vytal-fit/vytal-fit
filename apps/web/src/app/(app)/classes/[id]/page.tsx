"use client";

import { useState, useCallback } from "react";
import { useDataStore } from "@/stores/data-store";
import {
  MapPin,
  User,
  Clock,
  Users,
  CalendarDays,
  CheckCircle,
  Circle,
  XCircle,
  UserPlus,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

type AttendanceStatus = "confirmed" | "checked_in" | "no_show" | "cancelled";

function getEnrollmentStatus(enrolled: number, capacity: number) {
  const pct = (enrolled / capacity) * 100;
  if (pct >= 100)
    return { color: "bg-vytal-red", textColor: "text-vytal-red", labelKey: "classes.full" } as const;
  if (pct >= 80)
    return { color: "bg-vytal-amber", textColor: "text-vytal-amber", labelKey: "classes.fillingUp" } as const;
  return { color: "bg-vytal-green", textColor: "text-vytal-green", labelKey: "classes.available" } as const;
}

export default function ClassDetailPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const storeClasses = useDataStore((s) => s.classes);
  const storeMembers = useDataStore((s) => s.members);
  const cls = storeClasses.find((c) => c.id === id);

  // Local attendance state
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    if (!cls) return {};
    const initial: Record<string, AttendanceStatus> = {};
    storeMembers.slice(0, Math.min(cls.enrolledCount, storeMembers.length)).forEach((m) => {
      initial[m.id] = "confirmed";
    });
    return initial;
  });

  const [showAddMember, setShowAddMember] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  const handleCheckIn = useCallback((memberId: string, memberName: string) => {
    setAttendance((prev) => ({ ...prev, [memberId]: "checked_in" }));
    toast(t("classDetail.checkedIn").replace("{name}", memberName), "success");
  }, [toast, t]);

  const handleNoShow = useCallback((memberId: string, memberName: string) => {
    setAttendance((prev) => ({ ...prev, [memberId]: "no_show" }));
    toast(t("classDetail.markedNoShow").replace("{name}", memberName), "info");
  }, [toast, t]);

  const handleCancel = useCallback((memberId: string, memberName: string) => {
    setAttendance((prev) => ({ ...prev, [memberId]: "cancelled" }));
    toast(t("classDetail.bookingCancelled").replace("{name}", memberName), "info");
  }, [toast, t]);

  const handleCheckInAll = useCallback(() => {
    setAttendance((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (next[id] === "confirmed") next[id] = "checked_in";
      });
      return next;
    });
    toast(t("classDetail.allCheckedIn"), "success");
  }, [toast, t]);

  const handleQrScan = useCallback(() => {
    setShowQrScanner(true);
    setTimeout(() => {
      // Simulate QR scan — check in first confirmed member
      const firstConfirmed = Object.entries(attendance).find(([, s]) => s === "confirmed");
      if (firstConfirmed) {
        const member = storeMembers.find((m) => m.id === firstConfirmed[0]);
        if (member) handleCheckIn(member.id, member.name);
      }
      setShowQrScanner(false);
      toast(t("classDetail.qrScanned"), "success");
    }, 1500);
  }, [attendance, storeMembers, handleCheckIn, toast, t]);

  const handleAddWalkIn = useCallback(() => {
    // Find a member not in attendance yet
    const available = storeMembers.find((m) => !attendance[m.id]);
    if (available) {
      setAttendance((prev) => ({ ...prev, [available.id]: "checked_in" }));
      toast(t("classDetail.walkInAdded").replace("{name}", available.name), "success");
    }
    setShowAddMember(false);
  }, [storeMembers, attendance, toast, t]);

  if (!cls) {
    notFound();
  }

  const enrolledIds = Object.keys(attendance);
  const enrolledMembers = enrolledIds
    .map((id) => storeMembers.find((m) => m.id === id))
    .filter(Boolean) as typeof storeMembers;

  const checkedInCount = Object.values(attendance).filter((s) => s === "checked_in").length;
  const confirmedCount = Object.values(attendance).filter((s) => s === "confirmed").length;
  const noShowCount = Object.values(attendance).filter((s) => s === "no_show").length;

  const pct = Math.min((enrolledMembers.length / cls.maxCapacity) * 100, 100);
  const status = getEnrollmentStatus(enrolledMembers.length, cls.maxCapacity);
  const isFull = enrolledMembers.length >= cls.maxCapacity;

  const durationMin = (() => {
    const [sh, sm] = cls.startTime.split(":").map(Number);
    const [eh, em] = cls.endTime.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  })();

  const statusConfig: Record<AttendanceStatus, { icon: typeof CheckCircle; className: string; labelKey: string }> = {
    confirmed: { icon: Circle, className: "bg-vytal-blue/10 text-vytal-blue", labelKey: "classDetail.statusConfirmed" },
    checked_in: { icon: CheckCircle, className: "bg-vytal-green/10 text-vytal-green", labelKey: "classDetail.statusCheckedIn" },
    no_show: { icon: XCircle, className: "bg-vytal-red/10 text-vytal-red", labelKey: "classDetail.statusNoShow" },
    cancelled: { icon: XCircle, className: "bg-vytal-muted/10 text-vytal-muted", labelKey: "classDetail.statusCancelled" },
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("classes.title"), href: "/classes" }, { label: cls.classType.name }]} />

      {/* Class Header */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cls.classType.color }} />
              <h1 className="text-2xl font-bold text-vytal-text">{cls.classType.name}</h1>
              <span className="rounded bg-vytal-bg3 px-2 py-0.5 font-mono text-xs font-medium text-vytal-muted">
                {cls.classType.abbreviation}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-vytal-muted">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span>{new Date(cls.date).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{cls.startTime} - {cls.endTime}</span>
                <span className="text-xs">({durationMin} min)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {cls.location.name}
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {cls.coaches.map((c) => c.name).join(", ") || "Open Box"}
              </div>
            </div>
          </div>
          <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            isFull ? "bg-vytal-red/10 text-vytal-red" : pct >= 80 ? "bg-vytal-amber/10 text-vytal-amber" : "bg-vytal-green/10 text-vytal-green"
          )}>
            {t(status.labelKey)}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 text-center">
          <p className="text-2xl font-bold text-vytal-green">{checkedInCount}</p>
          <p className="text-xs text-vytal-muted">{t("classDetail.checkedInCount")}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 text-center">
          <p className="text-2xl font-bold text-vytal-blue">{confirmedCount}</p>
          <p className="text-xs text-vytal-muted">{t("classDetail.pendingCount")}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 text-center">
          <p className="text-2xl font-bold text-vytal-red">{noShowCount}</p>
          <p className="text-xs text-vytal-muted">{t("classDetail.noShowCount")}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 text-center">
          <p className="text-2xl font-bold text-vytal-text">{cls.maxCapacity - enrolledMembers.length}</p>
          <p className="text-xs text-vytal-muted">{t("classDetail.spotsLeft")}</p>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-vytal-muted" />
            <span className="text-sm font-medium text-vytal-text">{t("classDetail.capacity")}</span>
          </div>
          <span className={cn("font-mono text-lg font-bold", isFull ? "text-vytal-red" : status.textColor)}>
            {enrolledMembers.length}/{cls.maxCapacity}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-vytal-bg3">
          <div className={cn("h-full rounded-full transition-all", status.color)} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCheckInAll}
          disabled={confirmedCount === 0}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-40"
        >
          <CheckCircle className="h-4 w-4" />
          {t("classDetail.checkInAll")} ({confirmedCount})
        </button>
        <button
          onClick={handleQrScan}
          className="flex items-center gap-2 rounded-lg border border-vytal-border px-5 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <QrCode className="h-4 w-4" />
          {t("classDetail.scanQr")}
          {showQrScanner && <span className="ml-1 h-3 w-3 animate-spin rounded-full border-2 border-vytal-green border-t-transparent" />}
        </button>
        <button
          onClick={handleAddWalkIn}
          disabled={isFull}
          className="flex items-center gap-2 rounded-lg border border-vytal-border px-5 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3 disabled:opacity-40"
        >
          <UserPlus className="h-4 w-4" />
          {t("classDetail.addWalkIn")}
        </button>
      </div>

      {/* Enrolled Members Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("classDetail.enrolledMembers")} ({enrolledMembers.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-vytal-border">
          <table className="zebra-table w-full">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.member")}</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted md:table-cell">{t("table.email")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.status")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {enrolledMembers.map((member, i) => {
                const memberStatus = attendance[member.id] ?? "confirmed";
                const sc = statusConfig[memberStatus];
                const StatusIcon = sc.icon;
                const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

                return (
                  <tr key={member.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                    <td className="px-4 py-3 font-mono text-xs text-vytal-muted">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/members/${member.id}`} className="flex items-center gap-3 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-semibold text-vytal-green">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-vytal-text group-hover:text-vytal-green transition-colors">
                          {member.name}
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-vytal-muted md:table-cell">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", sc.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {t(sc.labelKey)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {memberStatus === "confirmed" && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCheckIn(member.id, member.name)}
                            className="rounded-lg bg-vytal-green/10 px-3 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/20"
                          >
                            {t("classDetail.checkIn")}
                          </button>
                          <button
                            onClick={() => handleNoShow(member.id, member.name)}
                            className="rounded-lg bg-vytal-red/10 px-2 py-1.5 text-xs text-vytal-red transition-colors hover:bg-vytal-red/20"
                            title={t("classDetail.markNoShow")}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      {memberStatus === "checked_in" && (
                        <span className="text-xs text-vytal-green">{t("classDetail.done")}</span>
                      )}
                      {memberStatus === "no_show" && (
                        <button
                          onClick={() => handleCheckIn(member.id, member.name)}
                          className="text-xs text-vytal-muted hover:text-vytal-green"
                        >
                          {t("classDetail.undoNoShow")}
                        </button>
                      )}
                      {memberStatus === "cancelled" && (
                        <span className="text-xs text-vytal-muted">{t("classDetail.cancelled")}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {enrolledMembers.length === 0 && (
            <div className="bg-vytal-card p-8 text-center">
              <p className="text-sm text-vytal-muted">{t("classDetail.noEnrolled")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
