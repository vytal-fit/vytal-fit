"use client";

import { useState, useCallback } from "react";
import { Mail, Send, Save, Globe, Eye, EyeOff, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
  lastEdited: string;
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
    lastEdited: "2026-06-01",
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
    lastEdited: "2026-06-02",
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
    lastEdited: "2026-05-28",
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
    lastEdited: "2026-05-20",
  },
];

function EmailPreview({ template, lang }: { template: EmailTemplate; lang: Language }) {
  return (
    <div className="rounded-xl border border-vytal-border bg-white p-6 text-gray-800">
      {/* Email header */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <p className="text-xs text-gray-500">From: CrossFit Vytal &lt;info@crossfitvytal.pt&gt;</p>
        <p className="text-xs text-gray-500">To: member@example.com</p>
        <p className="mt-1 text-sm font-semibold text-gray-900">{template.subject[lang]}</p>
      </div>

      {/* Logo area */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#3dd96e] text-xs font-bold text-white">V</div>
        <span className="text-sm font-bold text-gray-900">CrossFit Vytal</span>
      </div>

      {/* Greeting */}
      <p className="mb-3 text-sm text-gray-800">{template.greeting[lang].replace("{name}", "Joao")}</p>

      {/* Body */}
      <div className="mb-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
        {template.body[lang]}
      </div>

      {/* Optional sections */}
      {template.includeClassDetails && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-600 uppercase">Class Details</p>
          <p className="mt-1 text-sm text-gray-800">WOD - Monday, June 9 at 07:00</p>
          <p className="text-xs text-gray-500">CrossFit Aveiro - Rua do Desporto 42</p>
        </div>
      )}

      {template.includeCalendarLink && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">
            <Clock className="h-3 w-3" />
            Add to Google Calendar
          </span>
        </div>
      )}

      {template.includeMapLink && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-600">
            View on Map
          </span>
        </div>
      )}

      {template.includeCoachPhoto && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">AL</div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Coach Andre Loureiro</p>
            <p className="text-xs text-gray-500">Your coach for this class</p>
          </div>
        </div>
      )}

      {/* Closing */}
      <div className="mt-4 whitespace-pre-line text-sm text-gray-700">
        {template.closing[lang]}
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-gray-200 pt-3">
        <p className="text-[10px] text-gray-400">CrossFit Aveiro | Rua do Desporto 42, Aveiro | crossfitaveiro.pt</p>
      </div>
    </div>
  );
}

export default function EmailTemplatesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>("pt");
  const [showPreview, setShowPreview] = useState(false);

  const selected = templates.find((tmpl) => tmpl.id === selectedId);

  const updateTemplate = useCallback((id: string, updates: Partial<EmailTemplate>) => {
    setTemplates((prev) =>
      prev.map((tmpl) => (tmpl.id === id ? { ...tmpl, ...updates, lastEdited: new Date().toISOString().split("T")[0] } : tmpl))
    );
  }, []);

  const updateField = useCallback((id: string, field: "subject" | "greeting" | "body" | "closing", value: string) => {
    const template = templates.find((tmpl) => tmpl.id === id);
    if (!template) return;
    updateTemplate(id, { [field]: { ...template[field], [lang]: value } });
  }, [templates, lang, updateTemplate]);

  const handleSave = useCallback(() => {
    if (selected) {
      toast(`Template "${selected.name}" saved successfully!`, "success");
    }
  }, [selected, toast]);

  const handleSendTest = useCallback(() => {
    if (selected) {
      toast(`Test email for "${selected.name}" sent to your address!`, "success");
    }
  }, [selected, toast]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("communications.title"), href: "/communications" }, { label: "Templates" }]} />

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
              onClick={() => { setSelectedId(template.id); setShowPreview(false); }}
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
                <div className="flex-1">
                  <p className="text-sm font-semibold text-vytal-text">{template.name}</p>
                  <p className="text-xs text-vytal-muted">{template.subject[lang]}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-vytal-muted">Last edited: {template.lastEdited}</span>
                <div className="flex gap-1">
                  {(["pt", "en"] as const).map((l) => (
                    <span
                      key={l}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-medium",
                        l === lang ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg3 text-vytal-muted"
                      )}
                    >
                      {l.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Template Editor / Preview */}
        {selected ? (
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-vytal-text">{selected.name}</h2>
              <div className="flex items-center gap-2">
                {/* Preview Toggle */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    showPreview
                      ? "bg-vytal-green/10 text-vytal-green"
                      : "text-vytal-muted hover:text-vytal-text"
                  )}
                >
                  {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showPreview ? "Edit" : "Preview"}
                </button>
                <div className="mx-1 h-5 w-px bg-vytal-border" />
                {/* Language tabs */}
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

            {showPreview ? (
              <EmailPreview template={selected} lang={lang} />
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("templates.subject")}</label>
                  <input
                    type="text"
                    value={selected.subject[lang]}
                    onChange={(e) => updateField(selected.id, "subject", e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("templates.greeting")}</label>
                  <input
                    type="text"
                    value={selected.greeting[lang]}
                    onChange={(e) => updateField(selected.id, "greeting", e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                  <p className="mt-1 text-[10px] text-vytal-muted">Use {"{name}"} for the member name</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("templates.body")}</label>
                  <textarea
                    value={selected.body[lang]}
                    onChange={(e) => updateField(selected.id, "body", e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                  <p className="mt-1 text-[10px] text-vytal-muted">Tip: Use blank lines for paragraphs. Keep it concise and personal.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("templates.closing")}</label>
                  <textarea
                    value={selected.closing[lang]}
                    onChange={(e) => updateField(selected.id, "closing", e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3 border-t border-vytal-border pt-4">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("templates.options")}</label>
                  {([
                    { key: "includeClassDetails" as const, labelKey: "templates.includeClassDetails" },
                    { key: "includeCalendarLink" as const, labelKey: "templates.googleCalendarLink" },
                    { key: "includeMapLink" as const, labelKey: "templates.mapLink" },
                    { key: "includeCoachPhoto" as const, labelKey: "templates.coachPhoto" },
                  ]).map((opt) => (
                    <div key={opt.key} className="flex items-center justify-between">
                      <span className="text-sm text-vytal-text">{t(opt.labelKey)}</span>
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
                  <button
                    onClick={handleSendTest}
                    className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-muted transition-colors hover:text-vytal-text"
                  >
                    <Send className="h-4 w-4" />
                    {t("templates.sendTest")}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                  >
                    <Save className="h-4 w-4" />
                    {t("action.save")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-vytal-border p-12 lg:col-span-2">
            <p className="text-sm text-vytal-muted">{t("templates.selectTemplate")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
