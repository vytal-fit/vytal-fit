"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone, Save } from "lucide-react";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";

type Channel = "email" | "push" | "sms";

interface NotificationRule {
  id: string;
  titleKey: string;
  descKey: string;
  enabled: boolean;
  channels: Channel[];
}

const defaultRules: NotificationRule[] = [
  { id: "new-member", titleKey: "notifRules.rule.newMember", descKey: "notifRules.rule.newMemberDesc", enabled: true, channels: ["email", "push"] },
  { id: "payment-received", titleKey: "notifRules.rule.paymentReceived", descKey: "notifRules.rule.paymentReceivedDesc", enabled: true, channels: ["email"] },
  { id: "payment-failed", titleKey: "notifRules.rule.paymentFailed", descKey: "notifRules.rule.paymentFailedDesc", enabled: true, channels: ["email", "push"] },
  { id: "class-full", titleKey: "notifRules.rule.classFull", descKey: "notifRules.rule.classFullDesc", enabled: true, channels: ["push"] },
  { id: "class-cancelled", titleKey: "notifRules.rule.classCancelled", descKey: "notifRules.rule.classCancelledDesc", enabled: true, channels: ["email", "push"] },
  { id: "no-show", titleKey: "notifRules.rule.noShow", descKey: "notifRules.rule.noShowDesc", enabled: false, channels: ["email"] },
  { id: "inactive-14", titleKey: "notifRules.rule.inactive14", descKey: "notifRules.rule.inactive14Desc", enabled: true, channels: ["email"] },
  { id: "birthday", titleKey: "notifRules.rule.birthday", descKey: "notifRules.rule.birthdayDesc", enabled: true, channels: ["push"] },
  { id: "new-lead-web", titleKey: "notifRules.rule.newLeadWeb", descKey: "notifRules.rule.newLeadWebDesc", enabled: true, channels: ["push", "email"] },
  { id: "trial-booked", titleKey: "notifRules.rule.trialBooked", descKey: "notifRules.rule.trialBookedDesc", enabled: true, channels: ["email", "push"] },
];

const allChannels: { key: Channel; icon: React.ReactNode; labelKey: string }[] = [
  { key: "email", icon: <Mail className="h-3.5 w-3.5" />, labelKey: "notifRules.channel.email" },
  { key: "push", icon: <Bell className="h-3.5 w-3.5" />, labelKey: "notifRules.channel.push" },
  { key: "sms", icon: <Smartphone className="h-3.5 w-3.5" />, labelKey: "notifRules.channel.sms" },
];

export default function NotificationRulesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [rules, setRules] = useState<NotificationRule[]>(defaultRules);

  function toggleEnabled(id: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }

  function toggleChannel(id: string, channel: Channel) {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const channels = r.channels.includes(channel)
          ? r.channels.filter((c) => c !== channel)
          : [...r.channels, channel];
        return { ...r, channels };
      })
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("settings.title"), href: "/settings" },
          { label: t("notifRules.title") },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("notifRules.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("notifRules.subtitle")}</p>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              "rounded-xl border bg-vytal-card p-5 transition-colors",
              rule.enabled ? "border-vytal-border" : "border-vytal-border/50 opacity-60"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-vytal-text">
                    {t(rule.titleKey)}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-vytal-muted">
                  {t(rule.descKey)}
                </p>

                {/* Channel selectors */}
                {rule.enabled && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted mr-1">
                      Canais:
                    </span>
                    {allChannels.map((ch) => {
                      const isActive = rule.channels.includes(ch.key);
                      return (
                        <button
                          key={ch.key}
                          onClick={() => toggleChannel(rule.id, ch.key)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                            isActive
                              ? "border border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                              : "border border-vytal-border bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
                          )}
                        >
                          {ch.icon}
                          {t(ch.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => toggleEnabled(rule.id)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                  rule.enabled ? "bg-vytal-green" : "bg-vytal-bg3"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                    rule.enabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={() => toast(t("notifRules.saved"), "success")}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("notifRules.save")}
        </button>
      </div>
    </div>
  );
}
