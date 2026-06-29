"use client";

import Link from "next/link";
import { ArrowRight, Target, Trophy, TrendingUp } from "lucide-react";
import { useMemberPortalIdentity } from "@/lib/portal";
import { trpc } from "@/lib/trpc";

export default function ProgressPage() {
  const { session, currentMember } = useMemberPortalIdentity();
  const personalRecordsQuery = trpc.personalRecords.list.useQuery(
    { memberId: currentMember?.id ?? "", limit: 6 },
    { enabled: Boolean(currentMember?.id) },
  );
  const resultsQuery = trpc.wodResults.list.useQuery(
    { memberId: currentMember?.id ?? "", limit: 6 },
    { enabled: Boolean(currentMember?.id) },
  );

  const prs = personalRecordsQuery.data?.items ?? [];
  const results = resultsQuery.data?.items ?? [];

  return (
    <main className="page">
      <section className="shell">
        <div className="topline">
          <div className="brand">
            vytal <strong>my</strong>
          </div>
          <div>Progress</div>
        </div>

        <div className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Member portal</p>
            <h1>Progress that is visible without digging.</h1>
            <p>
              {currentMember
                ? `Progress for ${currentMember.name}.`
                : session.data
                  ? "Link a member profile to load progress data."
                  : "Sign in to load progress data."}
            </p>

            <div className="actions">
              <Link className="button primary" href="/login">
                Sign in
                <ArrowRight size={16} />
              </Link>
              <Link className="button" href="/">
                Back home
              </Link>
            </div>
          </div>

          <div className="summary-panel">
            <div className="summary-title">
              <TrendingUp size={18} />
              Summary
            </div>
            {personalRecordsQuery.isLoading || resultsQuery.isLoading ? (
              <p className="summary-list">Loading progress metrics...</p>
            ) : !currentMember ? (
              <p className="summary-list">Sign in to the matching account to load progress.</p>
            ) : (
              <ul className="summary-list">
                <li>{prs.length} PRs on file</li>
                <li>{results.length} logged WOD results</li>
                <li>
                  {results[0]
                    ? `Latest result: ${results[0].wod?.title ?? "WOD"}`
                    : "No WOD results yet"}
                </li>
              </ul>
            )}
          </div>

          <div className="tiles">
            {prs.length === 0 ? (
              <article className="tile">
                <h2>No PRs yet</h2>
                <p>Personal records will appear here once they are logged.</p>
              </article>
            ) : (
              prs.map((record) => (
                <article className="tile" key={record.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Trophy size={18} />
                    <h2 style={{ margin: 0 }}>{record.exercise?.name ?? record.exerciseId}</h2>
                  </div>
                  <p>{record.value} {record.unit}</p>
                  <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Target size={14} />
                    {record.previousValue ? `Prev ${record.previousValue}` : "Current best"}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
