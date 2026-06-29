"use client";

import Link from "next/link";
import { ArrowRight, Dumbbell, Flame, MessageSquareText } from "lucide-react";
import { useMemberPortalIdentity } from "@/lib/portal";
import { trpc } from "@/lib/trpc";

export default function TrainingPage() {
  const { session, currentMember } = useMemberPortalIdentity();
  const resultsQuery = trpc.wodResults.list.useQuery(
    { memberId: currentMember?.id ?? "", limit: 6 },
    { enabled: Boolean(currentMember?.id) },
  );

  return (
    <main className="page">
      <section className="shell">
        <div className="topline">
          <div className="brand">
            vytal <strong>my</strong>
          </div>
          <div>Training</div>
        </div>

        <div className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Member portal</p>
            <h1>Workout history and score tracking.</h1>
            <p>
              {currentMember
                ? `Recent sessions for ${currentMember.name}.`
                : session.data
                  ? "Link a member profile to load workout history."
                  : "Sign in to load workout history."}
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

          <div className="tiles">
            {resultsQuery.isLoading ? (
              <article className="tile">
                <h2>Loading training history...</h2>
                <p>Fetching WOD results from the API.</p>
              </article>
            ) : !currentMember ? (
              <article className="tile">
                <h2>No linked member</h2>
                <p>Sign in to the matching account to load workout results.</p>
              </article>
            ) : (resultsQuery.data?.items ?? []).length === 0 ? (
              <article className="tile">
                <h2>No results yet</h2>
                <p>Workout results will appear here after they are logged.</p>
              </article>
            ) : (
              resultsQuery.data?.items.map((result) => (
                <article className="tile" key={result.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Dumbbell size={18} />
                    <h2 style={{ margin: 0 }}>{result.wod?.title ?? "WOD"}</h2>
                  </div>
                  <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Flame size={14} />
                    {result.score} {result.scoreType}
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MessageSquareText size={14} />
                    {result.scale.toUpperCase()}
                    {result.isPR ? " · PR" : ""}
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
