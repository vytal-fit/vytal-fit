"use client";

import { use } from "react";
import { Users, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const coachesQuery = trpc.public.coaches.useQuery({ slug });
  const siteQuery = trpc.public.site.useQuery({ slug });

  const coaches = coachesQuery.data ?? [];

  if (coachesQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vytal-border border-t-vytal-green" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-green/10">
            <Users className="h-6 w-6 text-vytal-green" />
          </div>
          <h1 className="text-2xl font-bold text-vytal-text">A Nossa Equipa</h1>
          <p className="mt-2 text-sm text-vytal-muted">
            Conheça os coaches e profissionais de {siteQuery.data?.name}
          </p>
        </div>
      </section>

      {/* Coach cards */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="group rounded-2xl border border-vytal-border bg-vytal-card p-6 transition-all hover:border-vytal-green/30 hover:shadow-md"
            >
              {/* Avatar */}
              <div className="flex items-start gap-4">
                {coach.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coach.photo}
                    alt={coach.name}
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-vytal-green/10 text-lg font-black text-vytal-green">
                    {coach.initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-vytal-text">{coach.name}</h3>
                </div>
              </div>

              {/* Certifications */}
              {coach.certifications.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-vytal-green" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                      Certificações
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {coach.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="rounded-full border border-vytal-border bg-vytal-bg2 px-2.5 py-0.5 text-[11px] font-medium text-vytal-muted"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <section className="border-t border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-12 text-center">
          <h2 className="text-xl font-bold text-vytal-text">Quer treinar com a nossa equipa?</h2>
          <p className="mt-2 text-sm text-vytal-muted">
            Experimente uma aula gratuita e conheça os nossos coaches pessoalmente.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`/@${slug}/contact`}
              className="rounded-xl bg-vytal-green px-6 py-3 text-sm font-bold text-vytal-bg hover:bg-vytal-green/90"
            >
              Agendar Aula Grátis
            </a>
            <a
              href={`/@${slug}/schedule`}
              className="rounded-xl border border-vytal-border px-6 py-3 text-sm font-semibold text-vytal-text hover:bg-vytal-bg3"
            >
              Ver Horário
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
