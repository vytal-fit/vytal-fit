"use client";

import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
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
  const utils = trpc.useUtils();

  const classQuery = trpc.classes.byId.useQuery({ id });
  const classTypesQuery = trpc.classTypes.list.useQuery();
  const locationsQuery = trpc.locations.list.useQuery();
  const coachesQuery = trpc.coaches.list.useQuery();
  const rosterQuery = trpc.bookings.listByClass.useQuery({ classId: id });
  const membersQuery = trpc.members.list.useQuery({});

  const invalidateRoster = useCallback(
    () => utils.bookings.listByClass.invalidate({ classId: id }),
    [utils, id],
  );
  const setAttendanceMut = trpc.bookings.setAttendance.useMutation({
    onSuccess: invalidateRoster,
  });
  const bookMut = trpc.bookings.book.useMutation({ onSuccess: invalidateRoster });

  const [showQrScanner, setShowQrScanner] = useState(false);

  const row = classQuery.data;
  const cls = useMemo(() => {
    if (!row) return undefined;
    return {
      ...row,
      classType:
        classTypesQuery.data?.find((ct) => ct.id === row.classTypeId) ?? {
          name: "-",
          color: "#888888",
          abbreviation: "",
        },
      location: locationsQuery.data?.find((l) => l.id === row.locationId) ?? { name: "-" },
      coaches: row.coachIds
        .map((cid) => coachesQuery.data?.find((c) => c.id === cid))
        .filter((c): c is NonNullable<typeof c> => !!c),
    };
  }, [row, classTypesQuery.data, locationsQuery.data, coachesQuery.data]);

  // Active roster (exclude cancelled + waitlisted — the waitlist has its own view).
  const roster = useMemo(
    () =>
      (rosterQuery.data ?? []).filter(
        (b) => b.status !== "cancelled" && b.status !== "waitlisted",
      ),
    [rosterQuery.data],
  );
  const attendance = useMemo<Record<string, AttendanceStatus>>(
    () => Object.fromEntries(roster.map((b) => [b.memberId, b.status as AttendanceStatus])),
    [roster],
  );
  const bookingIdByMember = useMemo(
    () => Object.fromEntries(roster.map((b) => [b.memberId, b.id])),
    [roster],
  );
  const enrolledMembers = useMemo(
    () => roster.map((b) => ({ id: b.memberId, name: b.memberName, email: b.memberEmail })),
    [roster],
  );

  const handleCheckIn = useCallback(
    (memberId: string, memberName: string) => {
      const bookingId = bookingIdByMember[memberId];
      if (!bookingId) return;
      setAttendanceMut.mutate({ id: bookingId, status: "checked_in" });
      toast(t("classDetail.checkedIn").replace("{name}", memberName), "success");
    },
    [bookingIdByMember, setAttendanceMut, toast, t],
  );

  const handleNoShow = useCallback(
    (memberId: string, memberName: string) => {
      const bookingId = bookingIdByMember[memberId];
      if (!bookingId) return;
      setAttendanceMut.mutate({ id: bookingId, status: "no_show" });
      toast(t("classDetail.markedNoShow").replace("{name}", memberName), "info");
    },
    [bookingIdByMember, setAttendanceMut, toast, t],
  );

  const handleCheckInAll = useCallback(() => {
    roster
      .filter((b) => b.status === "confirmed")
      .forEach((b) => setAttendanceMut.mutate({ id: b.id, status: "checked_in" }));
    toast(t("classDetail.allCheckedIn"), "success");
  }, [roster, setAttendanceMut, toast, t]);

  const handleQrScan = useCallback(() => {
    setShowQrScanner(true);
    const firstConfirmed = roster.find((b) => b.status === "confirmed");
    setTimeout(() => {
      if (firstConfirmed) handleCheckIn(firstConfirmed.memberId, firstConfirmed.memberName);
      setShowQrScanner(false);
      toast(t("classDetail.qrScanned"), "success");
    }, 1500);
  }, [roster, handleCheckIn, toast, t]);

  const handleAddWalkIn = useCallback(() => {
    // Book the first org member not already on this class's roster.
    const booked = new Set(roster.map((b) => b.memberId));
    const available = (membersQuery.data?.items ?? []).find((m) => !booked.has(m.id));
    if (!available) return;
    bookMut.mutate({ classId: id, memberId: available.id });
    toast(t("classDetail.walkInAdded").replace("{name}", available.name), "success");
  }, [roster, membersQuery.data, bookMut, id, toast, t]);

  if (classQuery.error?.data?.code === "NOT_FOUND") {
    notFound();
  }
  if (classQuery.isPending || !cls) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-vytal-muted">{t("ui.loading")}</p>
      </div>
    );
  }

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
