"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { MemberStatus } from "@vytal-fit/shared";
import { Smartphone, Send, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

const genderOptions = [
  { value: "all", labelKey: "sms.all" },
  { value: "male", labelKey: "sms.male" },
  { value: "female", labelKey: "sms.female" },
];

const statusOptions: { value: "all" | MemberStatus; labelKey: string }[] = [
  { value: "all", labelKey: "sms.all" },
  { value: "active", labelKey: "sms.active" },
  { value: "inactive", labelKey: "sms.inactive" },
  { value: "trial", labelKey: "sms.trial" },
  { value: "suspended", labelKey: "sms.suspended" },
];

const recentSMS = [
  { id: 1, date: "2026-06-02", recipients: 45, message: "Lembra-te: aula de sabado alterada para as 09:00. Vemo-nos la!", status: "delivered" },
  { id: 2, date: "2026-05-30", recipients: 12, message: "Throwdown interno no sabado! Ultimas vagas. Inscreve-te ja.", status: "delivered" },
  { id: 3, date: "2026-05-28", recipients: 8, message: "Sentimos a tua falta! Volta e treina connosco esta semana.", status: "delivered" },
];

export default function SMSTargetingPage() {
  const { t } = useI18n();
  const membersQuery = trpc.members.list.useQuery({});
  const storeMembers = useMemo(() => membersQuery.data?.items ?? [], [membersQuery.data]);
  const storePlans = trpc.subscriptions.plans.list.useQuery().data ?? [];
  const storeClassTypes = trpc.classTypes.list.useQuery().data ?? [];
  const [gender, setGender] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [classTypeFilter, setClassTypeFilter] = useState("all");
  const [message, setMessage] = useState("");

  const recipientCount = useMemo(() => {
    return storeMembers.filter((m) => {
      if (gender !== "all" && m.gender !== gender) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (planFilter !== "all" && m.planId !== planFilter) return false;
      return true;
    }).length;
  }, [storeMembers, gender, statusFilter, planFilter]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("communications.title"), href: "/communications" }, { label: "SMS" }]} />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("sms.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("sms.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Filters */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-vytal-text">{t("sms.targetAudience")}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sms.gender")}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sms.status")}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | MemberStatus)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sms.plan")}</label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                <option value="all">{t("sms.allPlans")}</option>
                {storePlans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sms.classType")}</label>
              <select
                value={classTypeFilter}
                onChange={(e) => setClassTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                <option value="all">{t("sms.allClassTypes")}</option>
                {storeClassTypes.filter((ct) => ct.active).map((ct) => (
                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                ))}
              </select>
            </div>

            {/* Recipient Count */}
            <div className="rounded-lg bg-vytal-green/10 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-vytal-green" />
                <span className="text-sm font-semibold text-vytal-green">
                  {recipientCount} {t("sms.recipients")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Compose */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-vytal-green" />
              <h2 className="text-lg font-semibold text-vytal-text">{t("sms.composeSms")}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sms.message")}</label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= 160) setMessage(e.target.value);
                  }}
                  rows={4}
                  placeholder={t("sms.writePlaceholder")}
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
                <div className="mt-1 flex justify-end">
                  <span className={cn("text-xs", message.length > 140 ? "text-vytal-red" : "text-vytal-muted")}>
                    {message.length}/160
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
                  <Send className="h-4 w-4" />
                  {t("sms.send")}
                </button>
              </div>
            </div>
          </div>

          {/* Recent SMS Log */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("sms.recentSms")}</h2>
            <div className="space-y-3">
              {recentSMS.map((sms) => (
                <div
                  key={sms.id}
                  className="rounded-lg border border-vytal-border p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-vytal-muted" />
                      <span className="text-xs text-vytal-muted">{sms.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-vytal-muted" />
                      <span className="text-xs text-vytal-muted">{sms.recipients} {t("sms.recipients")}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-vytal-text">{sms.message}</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-vytal-green/10 px-2.5 py-0.5 text-[10px] font-medium text-vytal-green">
                    {sms.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
