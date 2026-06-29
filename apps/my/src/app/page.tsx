"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  LineChart,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useMemberPortalIdentity } from "@/lib/portal";
import { trpc } from "@/lib/trpc";

const sections = [
  {
    href: "/bookings",
    icon: CalendarDays,
    title: "Bookings",
    description: "Reserve classes, check your schedule, and manage attendance.",
  },
  {
    href: "/training",
    icon: Dumbbell,
    title: "Training",
    description: "Track WOD history, session notes, and workout results.",
  },
  {
    href: "/progress",
    icon: LineChart,
    title: "Progress",
    description: "Follow PRs, streaks, and personal performance trends.",
  },
  {
    href: "/progress",
    icon: Trophy,
    title: "Leaderboards",
    description: "See rankings and compare recent performance at a glance.",
  },
];

function formatCount(value: number): string {
  return value.toLocaleString("en-GB");
}

export default function MyHomePage() {
  const { session, currentMember } = useMemberPortalIdentity();

  const bookingsQuery = trpc.bookings.listByMember.useQuery(
    { memberId: currentMember?.id ?? "" },
    { enabled: Boolean(currentMember?.id) },
  );
  const personalRecordsQuery = trpc.personalRecords.list.useQuery(
    { memberId: currentMember?.id ?? "", limit: 6 },
    { enabled: Boolean(currentMember?.id) },
  );
  const resultsQuery = trpc.wodResults.list.useQuery(
    { memberId: currentMember?.id ?? "", limit: 6 },
    { enabled: Boolean(currentMember?.id) },
  );

  const upcomingBookings =
    bookingsQuery.data?.filter((booking) => booking.status !== "cancelled") ?? [];
  const latestResult = resultsQuery.data?.items[0] ?? null;
  const latestPR = personalRecordsQuery.data?.items[0] ?? null;

  return (
    <main className="page">
      <section className="shell">
        <div className="topline">
          <div className="brand">
            vytal <strong>my</strong>
          </div>
          <div>my.vytal.fit</div>
        </div>

        <div className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Member portal</p>
            <h1>Your training, bookings, and progress in one place.</h1>
            <p>
              {session.data && currentMember
                ? `Signed in as ${session.data.user?.name ?? session.data.user?.email ?? "member"}.`
                : "Sign in to manage your own schedule, record results, and review recent progress."}
            </p>

            <div className="actions">
              <Link className="button primary" href="/login">
                Sign in
                <ArrowRight size={16} />
              </Link>
              <Link className="button" href="/progress">
                Open portal
              </Link>
            </div>
          </div>

          <div className="summary-panel">
            <div className="summary-title">
              <ShieldCheck size={18} />
              Today
            </div>
            {session.isPending || bookingsQuery.isLoading ? (
              <p className="summary-list">Loading your member data...</p>
            ) : currentMember ? (
              <ul className="summary-list">
                <li>{formatCount(upcomingBookings.length)} active bookings</li>
                <li>{formatCount(personalRecordsQuery.data?.items.length ?? 0)} PRs on file</li>
                <li>
                  {latestResult
                    ? `Latest result: ${latestResult.wod?.title ?? "WOD"}`
                    : "No WOD results yet"}
                </li>
                <li>
                  {latestPR
                    ? `Latest PR: ${latestPR.exercise?.name ?? latestPR.exerciseId}`
                    : "No PRs logged yet"}
                </li>
              </ul>
            ) : (
              <p className="summary-list">
                Link your member profile after sign-in to see bookings, results,
                and PRs here.
              </p>
            )}
          </div>

          <div className="tiles">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link className="tile tile-link" href={section.href} key={section.title}>
                  <Icon size={18} />
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
