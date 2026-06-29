"use client";

import { use, useEffect, useState } from "react";
import { ORGANIZATION_CONFIGS } from "@vytal-fit/shared";
import {
  MapPin,
  Clock,
  Globe,
  AtSign,
  Phone,
  Mail,
  CalendarDays,
  Users,
  Star,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Link2,
  ChevronRight,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";
import type { WebsiteConfig } from "@/stores/data-store";
import { MOCK_ORGS } from "./org-data";

// MOCK_ORGS is now imported from ./org-data

// ---------------------------------------------------------------------------
// Load websiteConfig from localStorage (saved by the admin settings page)
// ---------------------------------------------------------------------------

function loadWebsiteConfig(slug: string): WebsiteConfig | null {
  if (typeof window === "undefined") return null;
  try {
    // Try each org ID
    for (const orgId of ["org-1", "org-2", "org-3"]) {
      const raw = localStorage.getItem(`vytal-org-settings-${orgId}`);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { slug?: string; websiteConfig?: WebsiteConfig };
      if (parsed.slug === slug && parsed.websiteConfig) {
        return parsed.websiteConfig;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 text-center text-2xl font-bold text-vytal-text">{children}</h2>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? "fill-vytal-amber text-vytal-amber" : "text-vytal-muted/30"}`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function OrgPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const org = MOCK_ORGS[slug];
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    setWebsiteConfig(loadWebsiteConfig(slug));
  }, [slug]);

  if (!org) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-vytal-text">404</h1>
          <p className="mt-2 text-vytal-muted">Organização não encontrada</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const config = ORGANIZATION_CONFIGS[org.type];
  const verticalLabel = config?.label ?? org.type;

  // Resolve display values: websiteConfig overrides defaults when present
  const displaySlogan = websiteConfig?.hero?.slogan || org.slogan;
  const heroEnabled = websiteConfig ? websiteConfig.hero.enabled : true;
  const aboutEnabled = websiteConfig ? websiteConfig.about.enabled : false;
  const scheduleEnabled = websiteConfig ? websiteConfig.schedule.enabled : true;
  const pricingEnabled = websiteConfig ? websiteConfig.pricing.enabled : false;
  const galleryEnabled = websiteConfig ? websiteConfig.gallery.enabled : false;
  const testimonialsEnabled = websiteConfig ? websiteConfig.testimonials.enabled : false;
  const contactFormEnabled = websiteConfig ? websiteConfig.contactForm.enabled : false;
  const ctaText = websiteConfig?.hero?.ctaText || "Contactar";

  const testimonials = (websiteConfig?.testimonials?.items ?? []).filter(
    (t) => t.name.trim() !== "" && t.text.trim() !== ""
  );

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactSent(true);
  }

  const basePath = `/@${slug}`;

  return (
    <>
      {/* Hero */}
      {heroEnabled && (
        <section className="border-b border-vytal-border bg-vytal-bg2">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-vytal-green/10 text-3xl font-bold text-vytal-green">
              {org.name.charAt(0)}
            </div>
            <h1 className="text-3xl font-bold text-vytal-text">{org.name}</h1>
            <p className="mt-2 text-lg text-vytal-muted">{displaySlogan}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="rounded-full bg-vytal-green/10 px-3 py-1 text-xs font-semibold text-vytal-green">
                {verticalLabel}
              </span>
              <span className="flex items-center gap-1 text-sm text-vytal-amber">
                <Star className="h-3.5 w-3.5 fill-vytal-amber" />
                {org.stats.rating}
              </span>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={contactFormEnabled ? "#contact" : `mailto:${org.email}`}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-3 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
              >
                <Mail className="h-4 w-4" />
                {ctaText}
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
      )}

      {/* Stats */}
      <section className="border-b border-vytal-border">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-vytal-border md:grid-cols-4">
          {[
            { label: config?.terminology.memberPlural ?? "Members", value: org.stats.members, icon: Users },
            { label: config?.terminology.sessionPlural ?? "Classes", value: `${org.stats.classes}/sem`, icon: CalendarDays },
            { label: config?.terminology.instructorPlural ?? "Coaches", value: org.stats.coaches, icon: Dumbbell },
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

      {/* Quick links to sub-pages */}
      <section className="border-b border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: `${basePath}/schedule`, label: "Ver Horário", icon: CalendarDays, desc: `${org.stats.classes} aulas/sem` },
              { href: `${basePath}/pricing`, label: "Ver Preços", icon: CreditCard, desc: `A partir de ${Math.min(...org.plans.map((p) => p.price))}€` },
              { href: `${basePath}/team`, label: "A Nossa Equipa", icon: Users, desc: `${org.stats.coaches} coaches` },
              { href: `${basePath}/contact`, label: "Contacto", icon: MessageSquare, desc: org.city },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col gap-2 rounded-xl border border-vytal-border bg-vytal-card p-4 transition-all hover:border-vytal-green/30 hover:bg-vytal-bg3"
              >
                <item.icon className="h-5 w-5 text-vytal-green" />
                <div>
                  <p className="text-sm font-semibold text-vytal-text group-hover:text-vytal-green">{item.label}</p>
                  <p className="text-xs text-vytal-muted">{item.desc}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 self-end text-vytal-muted/40 transition-transform group-hover:translate-x-0.5 group-hover:text-vytal-green" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      {aboutEnabled && websiteConfig?.about?.description && (
        <section className="border-b border-vytal-border">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <SectionHeading>Sobre Nós</SectionHeading>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-vytal-text">
                  {websiteConfig.about.description}
                </p>
              </div>
              {websiteConfig.about.foundingYear && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-vytal-border bg-vytal-card p-6 text-center">
                  <span className="text-4xl font-bold text-vytal-green">
                    {websiteConfig.about.foundingYear}
                  </span>
                  <span className="mt-1 text-sm text-vytal-muted">Ano de fundação</span>
                  <span className="mt-3 text-lg font-semibold text-vytal-text">
                    {new Date().getFullYear() - parseInt(websiteConfig.about.foundingYear || "0")} anos
                  </span>
                  <span className="text-xs text-vytal-muted">de experiência</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Info Grid: Opening Hours + Location */}
      <section className="mx-auto max-w-5xl px-6 py-12" id="schedule">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Opening hours */}
          {scheduleEnabled && (
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-vytal-green" />
                  <h2 className="text-lg font-semibold text-vytal-text">Horário de Funcionamento</h2>
                </div>
                <Link href={`${basePath}/schedule`} className="text-xs text-vytal-green hover:underline">
                  Ver aulas →
                </Link>
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
          )}

          {/* Location & Contact */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">Localização & Contacto</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-vytal-muted" />
                <span className="text-sm text-vytal-text">
                  {org.address}, {org.city}, {org.country}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-vytal-muted" />
                <a href={`tel:${org.phone}`} className="text-sm text-vytal-text hover:text-vytal-green">
                  {org.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-vytal-muted" />
                <a href={`mailto:${org.email}`} className="text-sm text-vytal-text hover:text-vytal-green">
                  {org.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-vytal-muted" />
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-vytal-green hover:underline"
                >
                  {org.website.replace("https://", "")}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <AtSign className="h-4 w-4 text-vytal-muted" />
                <span className="text-sm text-vytal-text">{org.instagram}</span>
              </div>
              {/* Social links */}
              <div className="flex items-center gap-2 pt-1">
                {org.instagram && (
                  <a
                    href={`https://instagram.com/${org.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </a>
                )}
                {org.facebook && (
                  <a
                    href={org.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </a>
                )}
                {org.youtube && (
                  <a
                    href={org.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      {pricingEnabled && (
        <section className="border-t border-vytal-border bg-vytal-bg2" id="pricing">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="mb-6 flex items-center justify-between">
              <SectionHeading>Planos & Preços</SectionHeading>
              <Link href={`${basePath}/pricing`} className="text-xs text-vytal-green hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {org.plans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-6 ${
                    plan.popular
                      ? "border-vytal-green bg-vytal-green/5"
                      : "border-vytal-border bg-vytal-card"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-vytal-green px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-vytal-bg">
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-vytal-green" />
                    <h3 className="font-semibold text-vytal-text">{plan.name}</h3>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-vytal-text">{plan.price}€</p>
                  <p className="mt-1 text-sm text-vytal-muted">{plan.period}</p>
                  <Link
                    href={`${basePath}/pricing`}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                      plan.popular
                        ? "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90"
                        : "border border-vytal-border text-vytal-text hover:bg-vytal-bg3"
                    }`}
                  >
                    Começar Agora
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery placeholder */}
      {galleryEnabled && (
        <section className="border-t border-vytal-border">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <SectionHeading>Galeria</SectionHeading>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl border border-vytal-border bg-vytal-bg2 flex items-center justify-center"
                >
                  <span className="text-vytal-muted/30 text-xs">Foto {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonialsEnabled && testimonials.length > 0 && (
        <section className="border-t border-vytal-border bg-vytal-bg2">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <SectionHeading>O que dizem os nossos atletas</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-vytal-border bg-vytal-card p-5"
                >
                  <StarDisplay rating={t.rating} />
                  <p className="mt-3 text-sm leading-relaxed text-vytal-text">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-vytal-border/50 pt-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-bold text-vytal-green">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-vytal-text">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form */}
      {contactFormEnabled && (
        <section className="border-t border-vytal-border" id="contact">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <SectionHeading>Contacte-nos</SectionHeading>
            <div className="mx-auto max-w-lg">
              {contactSent ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-vytal-green/30 bg-vytal-green/5 p-8 text-center">
                  <CheckCircle className="h-10 w-10 text-vytal-green" />
                  <h3 className="text-lg font-semibold text-vytal-text">Mensagem enviada!</h3>
                  <p className="text-sm text-vytal-muted">
                    Entraremos em contacto brevemente.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  className="rounded-xl border border-vytal-border bg-vytal-card p-6 space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                      Nome
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="O seu nome"
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="você@exemplo.com"
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                      Mensagem
                    </label>
                    <textarea
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Como podemos ajudar?"
                      rows={4}
                      className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green py-2.5 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Enviar Mensagem
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

    </>
  );
}
