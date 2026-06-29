"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { useMemberPortalIdentity } from "@/lib/portal";
import { trpc } from "@/lib/trpc";

function formatBookingTime(date: string, startTime: string): string {
  return `${date} · ${startTime}`;
}

export default function BookingsPage() {
  const { session, currentMember } = useMemberPortalIdentity();
  const bookingsQuery = trpc.bookings.listByMember.useQuery(
    { memberId: currentMember?.id ?? "" },
    { enabled: Boolean(currentMember?.id) },
  );

  return (
    <main className="page">
      <section className="shell">
        <div className="topline">
          <div className="brand">
            vytal <strong>my</strong>
          </div>
          <div>Bookings</div>
        </div>

        <div className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Member portal</p>
            <h1>Your classes and reservations.</h1>
            <p>
              {currentMember
                ? `Bookings for ${currentMember.name}.`
                : session.data
                  ? "Link a member profile to load your bookings."
                  : "Sign in to load your bookings."}
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
            {bookingsQuery.isLoading ? (
              <article className="tile">
                <h2>Loading bookings...</h2>
                <p>Fetching your current schedule from the API.</p>
              </article>
            ) : !currentMember ? (
              <article className="tile">
                <h2>No linked member</h2>
                <p>Sign in to the right account to load your bookings.</p>
              </article>
            ) : (bookingsQuery.data ?? []).length === 0 ? (
              <article className="tile">
                <h2>No bookings yet</h2>
                <p>Your upcoming classes will appear here once they are booked.</p>
              </article>
            ) : (
              bookingsQuery.data?.map((item) => (
                <article className="tile" key={item.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CalendarDays size={18} />
                    <h2 style={{ margin: 0 }}>
                      {item.class?.classType?.name ?? "Class"}
                    </h2>
                  </div>
                  <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock3 size={14} />
                    {item.class
                      ? formatBookingTime(item.class.date, item.class.startTime)
                      : "Scheduled"}
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={14} />
                    {item.class?.location?.name ?? "Location pending"}
                  </p>
                  <p>{item.status}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
