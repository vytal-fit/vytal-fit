"use client";

import { useState } from "react";
import {
  Mail,
  Play,
  Pause,
  Plus,
  Clock,
  Eye,
  MousePointer,
  Send,
  TrendingUp,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface CampaignEmail {
  subject: string;
  delay: number; // days after trigger
  previewText: string;
}

interface Campaign {
  id: string;
  name: string;
  trigger: "new_member" | "inactive" | "trial" | "manual";
  status: "active" | "paused" | "draft";
  emails: CampaignEmail[];
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  openRate: number;
  clickRate: number;
}

const mockCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "New Member Welcome",
    trigger: "new_member",
    status: "active",
    emails: [
      { subject: "Bem-vindo ao CrossFit Aveiro!", delay: 0, previewText: "Estamos muito felizes por te ter connosco..." },
      { subject: "Dicas para os teus primeiros treinos", delay: 3, previewText: "Aqui estao algumas dicas para tirares o maximo..." },
      { subject: "Como esta a ser a tua experiencia?", delay: 7, previewText: "Ja la vai uma semana! Conta-nos como..." },
      { subject: "Conhece os nossos planos especiais", delay: 14, previewText: "Temos planos que se adaptam ao teu ritmo..." },
      { subject: "1 mes juntos! Parabens!", delay: 30, previewText: "Ja passou um mes desde que te juntaste..." },
    ],
    stats: { sent: 635, opened: 495, clicked: 178, converted: 42 },
    openRate: 78,
    clickRate: 28,
  },
  {
    id: "camp-2",
    name: "Win-Back Inactive",
    trigger: "inactive",
    status: "active",
    emails: [
      { subject: "Sentimos a tua falta!", delay: 0, previewText: "Ja nao te vemos ha algum tempo..." },
      { subject: "Oferta especial para voltares", delay: 7, previewText: "Preparamos algo especial para ti..." },
      { subject: "Ultima oportunidade - 20% desconto", delay: 14, previewText: "Nao percas esta oportunidade unica..." },
    ],
    stats: { sent: 189, opened: 43, clicked: 12, converted: 5 },
    openRate: 23,
    clickRate: 6,
  },
  {
    id: "camp-3",
    name: "Trial Follow-Up",
    trigger: "trial",
    status: "paused",
    emails: [
      { subject: "Como foi a tua aula experimental?", delay: 1, previewText: "Esperamos que tenhas gostado da experiencia..." },
      { subject: "Plano especial para novos membros", delay: 7, previewText: "Temos uma oferta exclusiva para ti..." },
    ],
    stats: { sent: 87, opened: 57, clicked: 23, converted: 11 },
    openRate: 65,
    clickRate: 26,
  },
];

const triggerLabels: Record<string, string> = {
  new_member: "New Member",
  inactive: "Inactive (14 days)",
  trial: "Trial Sign-up",
  manual: "Manual",
};

export default function CampaignsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    trigger: "new_member" as Campaign["trigger"],
  });
  const [newEmails, setNewEmails] = useState<CampaignEmail[]>([
    { subject: "", delay: 0, previewText: "" },
  ]);

  const toggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c
      )
    );
    toast(t("campaigns.statusUpdated"), "success");
  };

  const handleCreate = () => {
    if (!newCampaign.name || newEmails.some((e) => !e.subject)) {
      toast(t("campaigns.fillAllFields"), "error");
      return;
    }
    const camp: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampaign.name,
      trigger: newCampaign.trigger,
      status: "draft",
      emails: newEmails,
      stats: { sent: 0, opened: 0, clicked: 0, converted: 0 },
      openRate: 0,
      clickRate: 0,
    };
    setCampaigns((prev) => [...prev, camp]);
    setShowCreate(false);
    setNewCampaign({ name: "", trigger: "new_member" });
    setNewEmails([{ subject: "", delay: 0, previewText: "" }]);
    toast(t("campaigns.created"), "success");
  };

  const addEmailToSequence = () => {
    const lastDelay = newEmails.length > 0 ? newEmails[newEmails.length - 1].delay : 0;
    setNewEmails([...newEmails, { subject: "", delay: lastDelay + 3, previewText: "" }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: t("nav.automations"), href: "/automations" },
              { label: t("campaigns.title") },
            ]}
          />
          <p className="mt-1 text-sm text-vytal-muted">{t("campaigns.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("campaigns.create")}
        </button>
      </div>

      {/* Campaign list */}
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const isExpanded = expandedId === campaign.id;
          const durationDays =
            campaign.emails.length > 0
              ? campaign.emails[campaign.emails.length - 1].delay
              : 0;

          return (
            <div
              key={campaign.id}
              className="rounded-xl border border-vytal-border bg-vytal-bg2 overflow-hidden"
            >
              <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : campaign.id)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vytal-bg3">
                  <Mail className="h-5 w-5 text-vytal-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-vytal-text">{campaign.name}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        campaign.status === "active"
                          ? "bg-vytal-green/10 text-vytal-green"
                          : campaign.status === "paused"
                          ? "bg-vytal-amber/10 text-vytal-amber"
                          : "bg-vytal-muted/10 text-vytal-muted"
                      )}
                    >
                      {campaign.status === "active"
                        ? t("campaigns.active")
                        : campaign.status === "paused"
                        ? t("campaigns.paused")
                        : t("campaigns.draft")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-vytal-muted">
                    <span>{campaign.emails.length} emails</span>
                    <span>{durationDays} {t("campaigns.days")}</span>
                    <span>{triggerLabels[campaign.trigger]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-xs text-vytal-muted">
                      <Eye className="h-3 w-3" />
                      {t("campaigns.openRate")}
                    </div>
                    <span className="text-sm font-bold text-vytal-text">{campaign.openRate}%</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-xs text-vytal-muted">
                      <MousePointer className="h-3 w-3" />
                      {t("campaigns.clickRate")}
                    </div>
                    <span className="text-sm font-bold text-vytal-text">{campaign.clickRate}%</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(campaign.id);
                    }}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      campaign.status === "active"
                        ? "text-vytal-amber hover:bg-vytal-amber/10"
                        : "text-vytal-green hover:bg-vytal-green/10"
                    )}
                  >
                    {campaign.status === "active" ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-vytal-muted transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-vytal-border p-5 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: t("campaigns.sent"), value: campaign.stats.sent, icon: Send },
                      { label: t("campaigns.opened"), value: campaign.stats.opened, icon: Eye },
                      { label: t("campaigns.clicked"), value: campaign.stats.clicked, icon: MousePointer },
                      { label: t("campaigns.converted"), value: campaign.stats.converted, icon: TrendingUp },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-vytal-bg3 p-3 text-center">
                        <stat.icon className="h-4 w-4 text-vytal-muted mx-auto mb-1" />
                        <div className="text-lg font-bold text-vytal-text">{stat.value}</div>
                        <div className="text-[10px] text-vytal-muted">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Sequence timeline */}
                  <div>
                    <h4 className="text-sm font-semibold text-vytal-text mb-3">
                      {t("campaigns.sequence")}
                    </h4>
                    <div className="relative space-y-3 pl-6">
                      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-vytal-border" />
                      {campaign.emails.map((email, idx) => (
                        <div key={idx} className="relative flex items-start gap-3">
                          <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-vytal-green/10 ring-2 ring-vytal-bg2">
                            <div className="h-2 w-2 rounded-full bg-vytal-green" />
                          </div>
                          <div className="rounded-lg border border-vytal-border bg-vytal-bg p-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-vytal-text">
                                {email.subject}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-vytal-muted">
                                <Clock className="h-3 w-3" />
                                {t("campaigns.day")} {email.delay}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-vytal-muted">{email.previewText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Campaign Form */}
      {showCreate && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-vytal-text">{t("campaigns.newCampaign")}</h3>
            <button
              onClick={() => setShowCreate(false)}
              className="text-vytal-muted hover:text-vytal-text transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">
                {t("campaigns.name")}
              </label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder={t("campaigns.namePlaceholder")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">
                {t("campaigns.trigger")}
              </label>
              <select
                value={newCampaign.trigger}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    trigger: e.target.value as Campaign["trigger"],
                  })
                }
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
              >
                <option value="new_member">{t("campaigns.triggerNewMember")}</option>
                <option value="inactive">{t("campaigns.triggerInactive")}</option>
                <option value="trial">{t("campaigns.triggerTrial")}</option>
                <option value="manual">{t("campaigns.triggerManual")}</option>
              </select>
            </div>
          </div>

          {/* Email sequence builder */}
          <div>
            <h4 className="text-sm font-semibold text-vytal-text mb-3">
              {t("campaigns.emailSequence")}
            </h4>
            <div className="space-y-3">
              {newEmails.map((email, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-bold text-vytal-green mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      value={email.subject}
                      onChange={(e) => {
                        const updated = [...newEmails];
                        updated[idx] = { ...updated[idx], subject: e.target.value };
                        setNewEmails(updated);
                      }}
                      placeholder={t("campaigns.subjectPlaceholder")}
                      className="rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30 sm:col-span-2"
                    />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-vytal-muted shrink-0" />
                      <input
                        type="number"
                        value={email.delay}
                        onChange={(e) => {
                          const updated = [...newEmails];
                          updated[idx] = { ...updated[idx], delay: parseInt(e.target.value) || 0 };
                          setNewEmails(updated);
                        }}
                        min={0}
                        className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
                      />
                      <span className="text-xs text-vytal-muted shrink-0">{t("campaigns.days")}</span>
                    </div>
                  </div>
                  {newEmails.length > 1 && (
                    <button
                      onClick={() => setNewEmails(newEmails.filter((_, i) => i !== idx))}
                      className="mt-1 text-vytal-muted hover:text-vytal-red transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addEmailToSequence}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-vytal-green hover:text-vytal-green/80 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("campaigns.addEmail")}
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-muted hover:text-vytal-text transition-colors"
            >
              {t("campaigns.cancelBtn")}
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              <Plus className="h-4 w-4" />
              {t("campaigns.createCampaign")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
