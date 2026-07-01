"use client";

import { use, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Link2,
  MessageSquare,
  CheckCircle,
  AtSign,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const siteQuery = trpc.public.site.useQuery({ slug });
  const profile = siteQuery.data?.profile;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (siteQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vytal-border border-t-vytal-green" />
      </div>
    );
  }

  if (!siteQuery.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-vytal-muted">Organização não encontrada</p>
      </div>
    );
  }

  const org = siteQuery.data;
  const fullAddress = [profile?.address, profile?.zipCode, profile?.city, profile?.country]
    .filter(Boolean)
    .join(", ");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate async send
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-green/10">
            <MessageSquare className="h-6 w-6 text-vytal-green" />
          </div>
          <h1 className="text-2xl font-bold text-vytal-text">Contacto</h1>
          <p className="mt-2 text-sm text-vytal-muted">
            Fale connosco — respondemos em menos de 24 horas
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-vytal-green/30 bg-vytal-green/5 p-10 text-center">
                <CheckCircle className="h-14 w-14 text-vytal-green" />
                <h3 className="text-xl font-bold text-vytal-text">Mensagem enviada!</h3>
                <p className="max-w-sm text-sm text-vytal-muted">
                  Obrigado pelo contacto. A nossa equipa irá responder em breve.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="mt-2 rounded-lg border border-vytal-border px-5 py-2 text-sm font-medium text-vytal-text hover:bg-vytal-bg3"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                      Nome <span className="text-vytal-green">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="O seu nome completo"
                      className="w-full rounded-xl border border-vytal-border bg-vytal-card px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/50 focus:border-vytal-green/40 focus:outline-none focus:ring-2 focus:ring-vytal-green/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                      Email <span className="text-vytal-green">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="você@exemplo.com"
                      className="w-full rounded-xl border border-vytal-border bg-vytal-card px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/50 focus:border-vytal-green/40 focus:outline-none focus:ring-2 focus:ring-vytal-green/10"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+351 9XX XXX XXX"
                      className="w-full rounded-xl border border-vytal-border bg-vytal-card px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/50 focus:border-vytal-green/40 focus:outline-none focus:ring-2 focus:ring-vytal-green/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                      Assunto
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      className="w-full rounded-xl border border-vytal-border bg-vytal-card px-4 py-2.5 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none focus:ring-2 focus:ring-vytal-green/10"
                    >
                      <option value="">Selecionar assunto</option>
                      <option value="info">Informações gerais</option>
                      <option value="trial">Aula de experiência</option>
                      <option value="pricing">Planos e preços</option>
                      <option value="schedule">Horário de aulas</option>
                      <option value="membership">Inscrição / Matrícula</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                    Mensagem <span className="text-vytal-green">*</span>
                  </label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Como podemos ajudar? Descreva a sua questão ou pedido..."
                    rows={5}
                    className="w-full resize-none rounded-xl border border-vytal-border bg-vytal-card px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/50 focus:border-vytal-green/40 focus:outline-none focus:ring-2 focus:ring-vytal-green/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-vytal-green py-3 text-sm font-bold text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  {loading ? "A enviar..." : "Enviar Mensagem"}
                </button>
              </form>
            )}
          </div>

          {/* Contact info sidebar */}
          <div className="space-y-4 lg:col-span-2">
            {/* Contact details */}
            <div className="rounded-2xl border border-vytal-border bg-vytal-card p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-vytal-muted">
                Informações de Contacto
              </h3>
              <div className="space-y-3">
                {profile?.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-3 rounded-lg p-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-vytal-green/10">
                      <Phone className="h-4 w-4 text-vytal-green" />
                    </div>
                    {profile.phone}
                  </a>
                )}
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-3 rounded-lg p-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-vytal-green/10">
                      <Mail className="h-4 w-4 text-vytal-green" />
                    </div>
                    <span className="truncate">{profile.email}</span>
                  </a>
                )}
                {fullAddress && (
                  <div className="flex items-start gap-3 rounded-lg p-2 text-sm text-vytal-text">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-vytal-green/10">
                      <MapPin className="h-4 w-4 text-vytal-green" />
                    </div>
                    <span>{fullAddress}</span>
                  </div>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg p-2 text-sm transition-colors hover:bg-vytal-bg3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-vytal-green/10">
                      <Globe className="h-4 w-4 text-vytal-green" />
                    </div>
                    <span className="text-vytal-green hover:underline">
                      {profile.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}
              </div>
            </div>

            {/* Social */}
            <div className="rounded-2xl border border-vytal-border bg-vytal-card p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-vytal-muted">
                Redes Sociais
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs font-medium text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {profile.instagram}
                  </a>
                )}
                {profile?.facebook && (
                  <a
                    href={profile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs font-medium text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Facebook
                  </a>
                )}
                {profile?.youtube && (
                  <a
                    href={profile.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs font-medium text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    YouTube
                  </a>
                )}
                {profile?.instagram && (
                  <div className="flex items-center gap-2 rounded-xl border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs font-medium text-vytal-muted">
                    <AtSign className="h-3.5 w-3.5" />
                    {profile.instagram}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="border-t border-vytal-border">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="overflow-hidden rounded-2xl border border-vytal-border bg-vytal-card">
            <div className="flex h-48 items-center justify-center bg-vytal-bg3 sm:h-64">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-vytal-muted/40" />
                <p className="mt-2 text-sm font-medium text-vytal-text">{org.name}</p>
                {fullAddress && <p className="text-xs text-vytal-muted">{fullAddress}</p>}
                {fullAddress && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-vytal-green/10 px-4 py-1.5 text-xs font-semibold text-vytal-green hover:bg-vytal-green/20"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Abrir no Google Maps
                  </a>
                )}
              </div>
            </div>
            {fullAddress && (
              <div className="border-t border-vytal-border bg-vytal-card px-5 py-3">
                <p className="text-xs text-vytal-muted">{fullAddress}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
