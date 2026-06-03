"use client";

import { useState } from "react";
import { Mail, Send, Save, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type Language = "pt" | "en";

interface EmailTemplate {
  id: string;
  name: string;
  subject: Record<Language, string>;
  greeting: Record<Language, string>;
  body: Record<Language, string>;
  closing: Record<Language, string>;
  includeClassDetails: boolean;
  includeCalendarLink: boolean;
  includeMapLink: boolean;
  includeCoachPhoto: boolean;
}

const initialTemplates: EmailTemplate[] = [
  {
    id: "t-1",
    name: "Welcome",
    subject: { pt: "Bem-vindo ao CrossFit Vytal!", en: "Welcome to CrossFit Vytal!" },
    greeting: { pt: "Ola {name}!", en: "Hi {name}!" },
    body: { pt: "Estamos muito felizes por te receber na nossa box. A tua jornada comeca agora!", en: "We are thrilled to have you at our box. Your journey starts now!" },
    closing: { pt: "Ate ja!\nEquipa CrossFit Vytal", en: "See you soon!\nCrossFit Vytal Team" },
    includeClassDetails: false,
    includeCalendarLink: false,
    includeMapLink: true,
    includeCoachPhoto: false,
  },
  {
    id: "t-2",
    name: "Trial Confirmation",
    subject: { pt: "A tua aula experimental esta confirmada!", en: "Your trial class is confirmed!" },
    greeting: { pt: "Ola {name}!", en: "Hi {name}!" },
    body: { pt: "A tua aula experimental esta confirmada. Traz roupa desportiva, sapatilhas e agua. Chega 10 minutos antes para conhecer o espaco.", en: "Your trial class is confirmed. Bring sportswear, trainers, and water. Arrive 10 minutes early to get familiar with the space." },
    closing: { pt: "Vemo-nos na box!", en: "See you at the box!" },
    includeClassDetails: true,
    includeCalendarLink: true,
    includeMapLink: true,
    includeCoachPhoto: true,
  },
  {
    id: "t-3",
    name: "Trial Feedback",
    subject: { pt: "Como foi a tua experiencia?", en: "How was your experience?" },
    greeting: { pt: "Ola {name}!", en: "Hi {name}!" },
    body: { pt: "Esperamos que tenhas gostado da tua aula experimental! Gostavamos de saber a tua opiniao e responder a qualquer duvida que tenhas.", en: "We hope you enjoyed your trial class! We would love to hear your feedback and answer any questions you might have." },
    closing: { pt: "Obrigado!\nEquipa CrossFit Vytal", en: "Thank you!\nCrossFit Vytal Team" },
    includeClassDetails: false,
    includeCalendarLink: false,
    includeMapLink: false,
    includeCoachPhoto: false,
  },
  {
    id: "t-4",
    name: "Payment Receipt",
    subject: { pt: "Recibo de pagamento", en: "Payment receipt" },
    greeting: { pt: "Ola {name},", en: "Hi {name}," },
    body: { pt: "O teu pagamento foi processado com sucesso. Em anexo encontras o recibo correspondente.", en: "Your payment has been processed successfully. Please find the receipt attached." },
    closing: { pt: "Obrigado,\nCrossFit Vytal", en: "Thank you,\nCrossFit Vytal" },
    includeClassDetails: false,
    includeCalendarLink: false,
    includeMapLink: false,
    includeCoachPhoto: false,
  },
];

export default function EmailTemplatesPage() {
  const { t } = useI18n();
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>("pt");

  const selected = templates.find((t) => t.id === selectedId);

  function updateTemplate(id: string, updates: Partial<EmailTemplate>) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }

  function updateField(id: string, field: "subject" | "greeting" | "body" | "closing", value: string) {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    updateTemplate(id, { [field]: { ...template[field], [lang]: value } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("templates.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("templates.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template List */}
        <div className="space-y-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedId(template.id)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-colors",
                selectedId === template.id
                  ? "border-vytal-green/30 bg-vytal-green/5"
                  : "border-vytal-border bg-vytal-card hover:border-[rgba(61,255,110,0.22)]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
                  <Mail className="h-4 w-4 text-vytal-green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-vytal-text">{template.name}</p>
                  <p className="text-xs text-vytal-muted">{template.subject[lang]}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Template Editor */}
        {selected ? (
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-vytal-text">{selected.name}</h2>
              <div className="flex gap-1">
                {(["pt", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      lang === l
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "text-vytal-muted hover:text-vytal-text"
                    )}
                  >
                    <Globe className="h-3 w-3" />
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Subject</label>
                <input
                  type="text"
                  value={selected.subject[lang]}
                  onChange={(e) => updateField(selected.id, "subject", e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Greeting</label>
                <input
                  type="text"
                  value={selected.greeting[lang]}
                  onChange={(e) => updateField(selected.id, "greeting", e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Body</label>
                <textarea
                  value={selected.body[lang]}
                  onChange={(e) => updateField(selected.id, "body", e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Closing</label>
                <textarea
                  value={selected.closing[lang]}
                  onChange={(e) => updateField(selected.id, "closing", e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 border-t border-vytal-border pt-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Options</label>
                {([
                  { key: "includeClassDetails" as const, label: "Include class details" },
                  { key: "includeCalendarLink" as const, label: "Google Calendar link" },
                  { key: "includeMapLink" as const, label: "Map link" },
                  { key: "includeCoachPhoto" as const, label: "Coach photo" },
                ]).map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between">
                    <span className="text-sm text-vytal-text">{opt.label}</span>
                    <button
                      type="button"
                      onClick={() => updateTemplate(selected.id, { [opt.key]: !selected[opt.key] })}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                        selected[opt.key] ? "bg-vytal-green" : "bg-vytal-bg3"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                          selected[opt.key] ? "left-[22px]" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 border-t border-vytal-border pt-4">
                <button className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-muted transition-colors hover:text-vytal-text">
                  <Send className="h-4 w-4" />
                  {t("templates.sendTest")}
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
                  <Save className="h-4 w-4" />
                  {t("action.save")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-vytal-border p-12 lg:col-span-2">
            <p className="text-sm text-vytal-muted">Select a template to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
