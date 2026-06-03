"use client";

import { mockMembers, mockSubscriptions, mockPersonalRecords } from "@vytal-fit/shared";
import type { MemberStatus } from "@vytal-fit/shared";
import {
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Flame,
  ScanLine,
  Trophy,
  ArrowLeft,
  Clock,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

function StatusBadge({ status }: { status: MemberStatus }) {
  const config: Record<MemberStatus, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "bg-vytal-green/10 text-vytal-green",
    },
    inactive: {
      label: "Inactive",
      className: "bg-vytal-red/10 text-vytal-red",
    },
    trial: {
      label: "Trial",
      className: "bg-vytal-amber/10 text-vytal-amber",
    },
    suspended: {
      label: "Suspended",
      className: "bg-vytal-purple/10 text-vytal-purple",
    },
  };

  const c = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        c.className
      )}
    >
      {c.label}
    </span>
  );
}

function InfoCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "green" | "blue" | "amber" | "red" | "purple";
  subtitle?: string;
}) {
  const colorMap = {
    green: "text-vytal-green",
    blue: "text-vytal-blue",
    amber: "text-vytal-amber",
    red: "text-vytal-red",
    purple: "text-vytal-purple",
  };
  const bgMap = {
    green: "bg-vytal-green/10",
    blue: "bg-vytal-blue/10",
    amber: "bg-vytal-amber/10",
    red: "bg-vytal-red/10",
    purple: "bg-vytal-purple/10",
  };

  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            bgMap[color]
          )}
        >
          <div className={colorMap[color]}>{icon}</div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
            {label}
          </span>
          <span className="text-lg font-bold text-vytal-text">{value}</span>
          {subtitle && (
            <span className={cn("text-xs", colorMap[color])}>{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatRelative(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

export default function MemberDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const member = mockMembers.find((m) => m.id === id);

  if (!member) {
    notFound();
  }

  const subscription = mockSubscriptions.find((s) => s.memberId === member.id);
  const records = mockPersonalRecords.filter(
    (r) => r.memberId === member.id
  );

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("members.title"), href: "/members" }, { label: t("ui.details") }]} />

      {/* Back link */}
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("memberDetail.backToMembers")}
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vytal-green/10 text-xl font-bold text-vytal-green">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-vytal-text">
                {member.name}
              </h1>
              <StatusBadge status={member.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-vytal-muted">
              <span className="font-mono text-xs">
                #{member.memberNumber}
              </span>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {member.email}
              </div>
              {member.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {member.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <InfoCard
          label="Plan"
          value={subscription?.plan.name ?? "No plan"}
          icon={<CreditCard className="h-4 w-4" />}
          color={subscription ? "green" : "amber"}
          subtitle={
            subscription
              ? `${subscription.plan.price} ${subscription.plan.currency}/mo`
              : undefined
          }
        />
        <InfoCard
          label="Joined"
          value={formatDate(member.joinedAt)}
          icon={<Calendar className="h-4 w-4" />}
          color="blue"
        />
        <InfoCard
          label="Last Check-in"
          value={formatRelative(member.lastCheckIn)}
          icon={<Clock className="h-4 w-4" />}
          color={
            !member.lastCheckIn
              ? "red"
              : new Date().getTime() - new Date(member.lastCheckIn).getTime() >
                  7 * 24 * 60 * 60 * 1000
                ? "amber"
                : "green"
          }
        />
        <InfoCard
          label="Streak"
          value={
            member.streakWeeks > 0
              ? `${member.streakWeeks} weeks`
              : "No streak"
          }
          icon={<Flame className="h-4 w-4" />}
          color={member.streakWeeks >= 4 ? "green" : "amber"}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <InfoCard
          label="Total Check-ins"
          value={member.totalCheckIns}
          icon={<ScanLine className="h-4 w-4" />}
          color="blue"
        />
        <InfoCard
          label="Personal Records"
          value={records.length}
          icon={<Trophy className="h-4 w-4" />}
          color="green"
        />
        {subscription?.sessionsUsed !== undefined &&
          subscription.plan.maxSessions && (
            <InfoCard
              label="Sessions Used"
              value={`${subscription.sessionsUsed}/${subscription.plan.maxSessions}`}
              icon={<Dumbbell className="h-4 w-4" />}
              color={
                subscription.sessionsUsed >= subscription.plan.maxSessions
                  ? "red"
                  : "blue"
              }
              subtitle={`${subscription.plan.maxSessions - subscription.sessionsUsed} remaining`}
            />
          )}
      </div>

      {/* Personal Records */}
      {records.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">
            Personal Records
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 transition-colors hover:border-[rgba(61,255,110,0.22)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
                  <TrendingUp className="h-4 w-4 text-vytal-green" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-vytal-text">
                    {pr.exercise.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-vytal-green">
                      {pr.value} {pr.unit}
                    </span>
                    {pr.previousValue && (
                      <span className="text-[10px] text-vytal-muted">
                        prev: {pr.previousValue} {pr.unit}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-vytal-muted">
                  {new Date(pr.achievedAt).toLocaleDateString("pt-PT", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          Activity Timeline
        </h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-vytal-border" />

          <div className="space-y-4">
            {[
              { type: "checkin" as const, description: "Checked in to WOD 17:30", time: "2 hours ago" },
              { type: "pr" as const, description: "Achieved PR: Back Squat 140kg", time: "Yesterday" },
              { type: "booking" as const, description: "Booked class: Strength 12:00", time: "Yesterday" },
              { type: "payment" as const, description: "Payment processed: \u20AC75.00", time: "3 days ago" },
              { type: "plan" as const, description: "Changed plan to Livre", time: "1 week ago" },
              { type: "achievement" as const, description: "Completed 30-day challenge", time: "2 weeks ago" },
              { type: "joined" as const, description: "Joined CrossFit Aveiro", time: "6 months ago" },
            ].map((entry, i) => {
              const dotColors: Record<string, string> = {
                checkin: "bg-vytal-green",
                pr: "bg-vytal-amber",
                booking: "bg-vytal-blue",
                payment: "bg-vytal-green",
                plan: "bg-vytal-purple",
                achievement: "bg-vytal-amber",
                joined: "bg-vytal-green",
              };
              return (
                <div key={i} className="relative flex items-start gap-4 pl-8">
                  {/* Dot */}
                  <div
                    className={cn(
                      "absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-vytal-bg2",
                      dotColors[entry.type] ?? "bg-vytal-muted"
                    )}
                  />
                  <div className="flex flex-1 items-center justify-between rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 transition-colors hover:border-[rgba(61,255,110,0.22)]">
                    <p className="text-sm text-vytal-text">{entry.description}</p>
                    <span className="ml-4 shrink-0 text-xs text-vytal-muted">{entry.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
