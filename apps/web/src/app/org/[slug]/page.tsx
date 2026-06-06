"use client";

import { use } from "react";
import { ORGANIZATION_CONFIGS } from "@vytal-fit/shared";
import { MapPin, Clock, Globe, AtSign, Phone, Mail, CalendarDays, Users, Star } from "lucide-react";
import Link from "next/link";

// Mock org data — in production this would come from the API
const MOCK_ORGS: Record<string, {
  name: string;
  type: string;
  slogan: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website: string;
  instagram: string;
  logo?: string;
  schedule: { day: string; hours: string }[];
  stats: { members: number; classes: number; coaches: number; rating: number };
}> = {
  "crossfit-aveiro": {
    name: "CrossFit Aveiro",
    type: "crossfit_box",
    slogan: "Stronger Every Day",
    email: "info@crossfitaveiro.pt",
    phone: "+351 234 567 890",
    address: "Rua do Desporto 42",
    city: "Aveiro",
    country: "Portugal",
    website: "https://crossfitaveiro.pt",
    instagram: "@crossfitaveiro",
    schedule: [
      { day: "Segunda - Sexta", hours: "06:30 - 21:00" },
      { day: "Sábado", hours: "09:00 - 13:00" },
      { day: "Domingo", hours: "Fechado" },
    ],
    stats: { members: 245, classes: 35, coaches: 6, rating: 4.9 },
  },
  "yoga-flow-porto": {
    name: "Yoga Flow Porto",
    type: "yoga_studio",
    slogan: "Find Your Balance",
    email: "hello@yogaflowporto.pt",
    phone: "+351 222 333 444",
    address: "Rua das Flores 15",
    city: "Porto",
    country: "Portugal",
    website: "https://yogaflowporto.pt",
    instagram: "@yogaflowporto",
    schedule: [
      { day: "Segunda - Sexta", hours: "07:00 - 21:30" },
      { day: "Sábado", hours: "08:00 - 14:00" },
      { day: "Domingo", hours: "09:00 - 12:00" },
    ],
    stats: { members: 180, classes: 28, coaches: 4, rating: 4.8 },
  },
  "iron-temple": {
    name: "Iron Temple",
    type: "weightlifting_club",
    slogan: "Lift Heavy, Live Strong",
    email: "info@irontemple.pt",
    phone: "+351 211 222 333",
    address: "Av. da Liberdade 100",
    city: "Lisboa",
    country: "Portugal",
    website: "https://irontemple.pt",
    instagram: "@irontemple",
    schedule: [
      { day: "Segunda - Sexta", hours: "06:00 - 22:00" },
      { day: "Sábado", hours: "08:00 - 18:00" },
      { day: "Domingo", hours: "09:00 - 14:00" },
    ],
    stats: { members: 120, classes: 20, coaches: 3, rating: 4.7 },
  },
};

export default function OrgPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const org = MOCK_ORGS[slug];

  if (!org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vytal-bg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-vytal-text">404</h1>
          <p className="mt-2 text-vytal-muted">Organização não encontrada</p>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const config = ORGANIZATION_CONFIGS[org.type];
  const verticalLabel = config?.label ?? org.type;

  return (
    <div className="min-h-screen bg-vytal-bg">
      {/* Header */}
      <header className="border-b border-vytal-border bg-vytal-bg2">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-bold text-vytal-green">
            vytal.fit
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-vytal-green/10 text-3xl font-bold text-vytal-green">
            {org.name.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold text-vytal-text">{org.name}</h1>
          <p className="mt-2 text-lg text-vytal-muted">{org.slogan}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-vytal-green/10 px-3 py-1 text-xs font-semibold text-vytal-green">
              {verticalLabel}
            </span>
            <span className="flex items-center gap-1 text-sm text-vytal-amber">
              <Star className="h-3.5 w-3.5 fill-vytal-amber" />
              {org.stats.rating}
            </span>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <a
              href={`mailto:${org.email}`}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-3 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
            >
              <Mail className="h-4 w-4" />
              Contactar
            </a>
            <a
              href={`tel:${org.phone}`}
              className="flex items-center gap-2 rounded-lg border border-vytal-border px-6 py-3 text-sm font-semibold text-vytal-text hover:bg-vytal-bg3"
            >
              <Phone className="h-4 w-4" />
              Ligar
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-vytal-border">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px bg-vytal-border md:grid-cols-4">
          {[
            { label: config?.terminology.memberPlural ?? "Members", value: org.stats.members, icon: Users },
            { label: config?.terminology.sessionPlural ?? "Classes", value: `${org.stats.classes}/sem`, icon: CalendarDays },
            { label: config?.terminology.instructorPlural ?? "Coaches", value: org.stats.coaches, icon: Users },
            { label: "Rating", value: `${org.stats.rating}/5`, icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 bg-vytal-bg px-6 py-8">
              <stat.icon className="h-5 w-5 text-vytal-green" />
              <span className="text-2xl font-bold text-vytal-text">{stat.value}</span>
              <span className="text-xs text-vytal-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Info Grid */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Schedule */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">Horário</h2>
            </div>
            <div className="space-y-3">
              {org.schedule.map((s) => (
                <div key={s.day} className="flex items-center justify-between">
                  <span className="text-sm text-vytal-text">{s.day}</span>
                  <span className="text-sm font-medium text-vytal-muted">{s.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Contact */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">Localização</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-vytal-muted" />
                <span className="text-sm text-vytal-text">{org.address}, {org.city}, {org.country}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-vytal-muted" />
                <span className="text-sm text-vytal-text">{org.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-vytal-muted" />
                <span className="text-sm text-vytal-text">{org.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-vytal-muted" />
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-sm text-vytal-green hover:underline">
                  {org.website.replace("https://", "")}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <AtSign className="h-4 w-4 text-vytal-muted" />
                <span className="text-sm text-vytal-text">{org.instagram}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-vytal-border bg-vytal-bg2 py-8 text-center">
        <p className="text-xs text-vytal-muted">
          Powered by{" "}
          <Link href="/" className="font-semibold text-vytal-green hover:underline">
            Vytal
          </Link>
        </p>
        <p className="mt-1 text-[10px] text-vytal-muted/60">
          vytal.fit/@{slug}
        </p>
      </footer>
    </div>
  );
}
