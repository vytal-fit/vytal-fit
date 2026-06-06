"use client";

import { use } from "react";
import { Users, Award, Star } from "lucide-react";
import { MOCK_ORGS } from "../org-data";

export default function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const org = MOCK_ORGS[slug];

  if (!org) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-vytal-muted">Organização não encontrada</p>
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
            Conheça os coaches e profissionais de {org.name}
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-vytal-border">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-px bg-vytal-border">
          <div className="flex flex-col items-center gap-1 bg-vytal-bg px-6 py-6">
            <span className="text-2xl font-bold text-vytal-green">{org.coaches.length}</span>
            <span className="text-xs text-vytal-muted">Coaches</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-vytal-bg px-6 py-6">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-vytal-text">{org.stats.rating}</span>
              <Star className="h-5 w-5 fill-vytal-amber text-vytal-amber" />
            </div>
            <span className="text-xs text-vytal-muted">Avaliação</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-vytal-bg px-6 py-6">
            <span className="text-2xl font-bold text-vytal-text">{org.stats.members}</span>
            <span className="text-xs text-vytal-muted">Atletas</span>
          </div>
        </div>
      </section>

      {/* Coach cards */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {org.coaches.map((coach) => (
            <div
              key={coach.id}
              className="group rounded-2xl border border-vytal-border bg-vytal-card p-6 transition-all hover:border-vytal-green/30 hover:shadow-md"
            >
              {/* Avatar */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${coach.color}`}
                >
                  {coach.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-vytal-text">{coach.name}</h3>
                  <p className="text-xs font-semibold text-vytal-green">{coach.role}</p>
                  <p className="mt-0.5 text-xs text-vytal-muted">{coach.specialty}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="mt-4 text-sm leading-relaxed text-vytal-muted">{coach.bio}</p>

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
