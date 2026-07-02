"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Headset, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { APP_LINKS } from "@/lib/constants";
import { PageShell } from "@/components/page-shell";

const ACCENT_FONT = { fontFamily: "var(--font-accent), serif" } as const;

const CONTACT_METHODS = [
  { icon: Mail, titleKey: "contactGeneralTitle", descKey: "contactGeneralDesc", email: "geral@vytal.fit" },
  { icon: Headset, titleKey: "contactSupportTitle", descKey: "contactSupportDesc", email: "suporte@vytal.fit" },
  { icon: Phone, titleKey: "contactSalesTitle", descKey: "contactSalesDesc", email: "vendas@vytal.fit" },
] as const;

function ContactBody({ t }: { t: (k: string) => string }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Non-wired form: open the visitor's mail client pre-filled, then show a
    // confirmation state. No data leaves the browser.
    const subject = encodeURIComponent(`[Vytal] ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:geral@vytal.fit?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Heading */}
      <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-vytal-green mb-4">
        {t("contactEyebrow")}
      </p>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
        {t("contactHeadline")}{" "}
        <span
          className="italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
          style={ACCENT_FONT}
        >
          {t("contactHeadlineAccent")}
        </span>
      </h1>
      <p className="mt-5 text-lg text-vytal-muted max-w-2xl leading-relaxed">{t("contactIntro")}</p>

      {/* Contact methods */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
        {CONTACT_METHODS.map((m) => (
          <a
            key={m.email}
            href={`mailto:${m.email}`}
            className="group rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg2 p-6 transition-all duration-150 hover:border-[rgba(34,197,94,0.4)] hover:-translate-y-0.5"
          >
            <span className="w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center text-vytal-green mb-4">
              <m.icon size={18} />
            </span>
            <h3 className="text-base font-semibold text-vytal-text">{t(m.titleKey)}</h3>
            <p className="text-sm text-vytal-muted mt-1 leading-relaxed">{t(m.descKey)}</p>
            <p className="text-sm font-medium text-vytal-green mt-3 group-hover:underline">{m.email}</p>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-16">
        {/* Location */}
        <div>
          <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg2 p-6">
            <span className="w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center text-vytal-green mb-4">
              <MapPin size={18} />
            </span>
            <h3 className="text-base font-semibold text-vytal-text">{t("contactLocationTitle")}</h3>
            <p className="text-lg font-semibold text-vytal-text mt-2">{t("contactLocationValue")}</p>
            <p className="text-sm text-vytal-muted mt-2 leading-relaxed">{t("contactLocationDesc")}</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg2 p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-start gap-4 py-6">
              <span className="w-12 h-12 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center text-vytal-green">
                <CheckCircle2 size={24} />
              </span>
              <h3 className="text-xl font-semibold text-vytal-text">{t("contactFormThanksTitle")}</h3>
              <p className="text-sm text-vytal-muted leading-relaxed">{t("contactFormThanksDesc")}</p>
              <button
                onClick={() => setSent(false)}
                className="text-sm font-medium text-vytal-green hover:underline"
              >
                {t("contactFormAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-semibold text-vytal-text mb-2">{t("contactFormTitle")}</h3>
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-vytal-muted uppercase tracking-wider mb-1.5">
                  {t("contactFormName")}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("contactFormNamePlaceholder")}
                  className="w-full rounded-lg border border-[rgba(34,197,94,0.2)] bg-vytal-bg px-3.5 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/60 focus:border-vytal-green focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-vytal-muted uppercase tracking-wider mb-1.5">
                  {t("contactFormEmail")}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("contactFormEmailPlaceholder")}
                  className="w-full rounded-lg border border-[rgba(34,197,94,0.2)] bg-vytal-bg px-3.5 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/60 focus:border-vytal-green focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-vytal-muted uppercase tracking-wider mb-1.5">
                  {t("contactFormMessage")}
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("contactFormMessagePlaceholder")}
                  className="w-full rounded-lg border border-[rgba(34,197,94,0.2)] bg-vytal-bg px-3.5 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted/60 focus:border-vytal-green focus:outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-vytal-green text-vytal-bg font-semibold text-sm px-5 py-2.5 hover:bg-[#16a34a] transition-colors duration-150"
              >
                <Send size={15} />
                {t("contactFormSubmit")}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Product CTA */}
      <div className="mt-16 flex flex-wrap gap-3">
        <Link
          href={APP_LINKS.getStarted}
          className="text-sm px-5 py-2.5 rounded-lg bg-vytal-green text-vytal-bg font-semibold hover:bg-[#16a34a] transition-colors duration-150"
        >
          {t("ctaStart")}
        </Link>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return <PageShell>{({ t }) => <ContactBody t={t} />}</PageShell>;
}
