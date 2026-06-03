import { mockCoaches } from "@vytal-fit/shared";
import type { Coach } from "@vytal-fit/shared";
import { Users, Plus } from "lucide-react";

function RoleBadge({ role }: { role: Coach["role"] }) {
  const config: Record<Coach["role"], { label: string; className: string }> = {
    head_coach: {
      label: "Head Coach",
      className: "bg-vytal-green/10 text-vytal-green",
    },
    coach: {
      label: "Coach",
      className: "bg-vytal-blue/10 text-vytal-blue",
    },
    assistant: {
      label: "Assistant",
      className: "bg-vytal-amber/10 text-vytal-amber",
    },
  };

  const c = config[role];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function CoachCard({ coach }: { coach: Coach }) {
  const initials = coach.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-vytal-green/10 text-lg font-semibold text-vytal-green">
          {initials}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-vytal-text">
            {coach.name}
          </span>
          <span className="text-xs text-vytal-muted">{coach.email}</span>
          <div className="mt-1">
            <RoleBadge role={coach.role} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const coaches = mockCoaches;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">Staff</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Manage your coaching team
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
          <Plus className="h-4 w-4" />
          Add Coach
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-blue/10">
          <Users className="h-4 w-4 text-vytal-blue" />
        </div>
        <div>
          <p className="text-lg font-bold text-vytal-text">{coaches.length}</p>
          <p className="text-xs text-vytal-muted">Total Staff</p>
        </div>
      </div>

      {/* Coach Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coaches.map((coach) => (
          <CoachCard key={coach.id} coach={coach} />
        ))}
      </div>
    </div>
  );
}
