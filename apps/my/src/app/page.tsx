import Link from "next/link";
import { CalendarDays, Dumbbell, Trophy, ArrowRight } from "lucide-react";

export default function MyHomePage() {
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
          <h1>The member portal for booking, tracking, and progress.</h1>
          <p>
            This app surface is where athletes manage their own training flow.
            The detailed member routes will be extracted here next.
          </p>

          <div className="actions">
            <Link className="button primary" href="https://pro.vytal.fit/login">
              Sign in
              <ArrowRight size={16} />
            </Link>
            <Link className="button" href="https://docs.vytal.fit">
              Read docs
            </Link>
          </div>

          <div className="tiles">
            <article className="tile">
              <CalendarDays size={18} />
              <h2>Bookings</h2>
              <p>Class schedules and reservation flows.</p>
            </article>
            <article className="tile">
              <Dumbbell size={18} />
              <h2>Training</h2>
              <p>WOD history, results, and personal records.</p>
            </article>
            <article className="tile">
              <Trophy size={18} />
              <h2>Progress</h2>
              <p>Leaderboards, streaks, and athlete summaries.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
