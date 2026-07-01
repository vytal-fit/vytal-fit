"use client";

import { useState } from "react";
import {
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  Send,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname;
    return path.length > 15 ? `${u.hostname}${path.slice(0, 12)}...` : `${u.hostname}${path}`;
  } catch {
    return url.slice(0, 30) + "...";
  }
}

function fmtTime(d: string | Date | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}

export default function WebhooksPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const webhooksQuery = trpc.webhooks.list.useQuery();
  const eventsQuery = trpc.webhooks.events.useQuery();
  const deliveriesQuery = trpc.webhooks.deliveries.useQuery();
  const webhooks = webhooksQuery.data ?? [];
  const availableEvents = eventsQuery.data ?? [];
  const deliveries = deliveriesQuery.data ?? [];

  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

  const onError = (e: { data?: { code?: string } | null }) =>
    toast(e.data?.code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"), "error");

  const createWebhook = trpc.webhooks.create.useMutation({
    onSuccess: (res) => {
      setCreatedSecret(res.secret);
      setShowCreate(false);
      setNewName("");
      setNewUrl("");
      setSelectedEvents([]);
      void utils.webhooks.list.invalidate();
      toast(t("webhooks.toastCreated"), "success");
    },
    onError,
  });
  const setActive = trpc.webhooks.setActive.useMutation({
    onSuccess: () => {
      void utils.webhooks.list.invalidate();
      toast(t("webhooks.toastStatusUpdated"), "success");
    },
    onError,
  });
  const deleteWebhook = trpc.webhooks.delete.useMutation({
    onSuccess: () => {
      void utils.webhooks.list.invalidate();
      toast(t("webhooks.toastDeleted"), "success");
    },
    onError,
  });
  const testWebhook = trpc.webhooks.test.useMutation({
    onSuccess: (res) => {
      void utils.webhooks.list.invalidate();
      void utils.webhooks.deliveries.invalidate();
      toast(res.ok ? t("webhooks.testOk") : t("webhooks.testFail"), res.ok ? "success" : "error");
    },
    onError,
  });

  function toggleEvent(ev: string) {
    setSelectedEvents((prev) => (prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]));
  }

  function handleCreate() {
    if (!newUrl || !newName || selectedEvents.length === 0) {
      toast(t("webhooks.toastFillFields"), "error");
      return;
    }
    createWebhook.mutate({ name: newName, url: newUrl, events: selectedEvents as never });
  }

  function copySecret() {
    if (!createdSecret) return;
    void navigator.clipboard.writeText(createdSecret);
    setCopiedSecret(true);
    toast(t("webhooks.toastSecretCopied"), "success");
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("nav.settings"), href: "/settings" }, { label: t("webhooks.title") }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("webhooks.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("webhooks.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("webhooks.createBtn")}
        </button>
      </div>

      {/* Signing secret shown once */}
      {createdSecret && (
        <div className="space-y-3 rounded-xl border-2 border-vytal-amber/30 bg-vytal-amber/5 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-vytal-amber" />
            <h3 className="font-semibold text-vytal-amber">{t("webhooks.secretOnce")}</h3>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg border border-vytal-amber/20 bg-vytal-bg2 px-4 py-3 font-mono text-sm text-vytal-text">
              {createdSecret}
            </code>
            <button
              onClick={copySecret}
              className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            >
              {copiedSecret ? (
                <><Check className="h-4 w-4" /> {t("webhooks.copied")}</>
              ) : (
                <><Copy className="h-4 w-4" /> {t("webhooks.copy")}</>
              )}
            </button>
          </div>
          <button onClick={() => setCreatedSecret(null)} className="text-xs text-vytal-muted hover:text-vytal-text">
            {t("apiKeys.dismiss")}
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="space-y-5 rounded-xl border border-vytal-green/30 bg-vytal-card p-6">
          <div className="mb-2 flex items-center gap-2">
            <Webhook className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">{t("webhooks.createFormTitle")}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("webhooks.nameLabel")}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("webhooks.namePlaceholder")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("webhooks.urlLabel")}
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={t("webhooks.urlPlaceholder")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("webhooks.eventsLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {availableEvents.map((event) => (
                <label
                  key={event}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                    selectedEvents.includes(event)
                      ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                      : "border-vytal-border bg-vytal-bg2 text-vytal-muted hover:border-vytal-green/20",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      selectedEvents.includes(event) ? "border-vytal-green bg-vytal-green" : "border-vytal-border",
                    )}
                  >
                    {selectedEvents.includes(event) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="font-mono">{event}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createWebhook.isPending}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {t("action.create")}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-vytal-border px-4 py-2.5 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              {t("action.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Webhook list */}
      {webhooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-vytal-border bg-vytal-card p-10 text-center text-sm text-vytal-muted">
          {t("webhooks.empty")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("webhooks.colWebhook")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("webhooks.colUrl")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("webhooks.colEvents")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("webhooks.colStatus")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("webhooks.colLastTriggered")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("webhooks.colSuccessRate")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("webhooks.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {webhooks.map((wh) => (
                <tr key={wh.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Webhook className="h-4 w-4 text-vytal-green" />
                      <span className="text-sm font-medium text-vytal-text">{wh.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-vytal-bg3 px-2 py-0.5 font-mono text-xs text-vytal-muted">{maskUrl(wh.url)}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev) => (
                        <span key={ev} className="rounded-full bg-vytal-bg3 px-2 py-0.5 font-mono text-[10px] text-vytal-muted">{ev}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        wh.active ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-amber/10 text-vytal-amber",
                      )}
                    >
                      {wh.active ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      {wh.active ? t("webhooks.statusActive") : t("webhooks.statusPaused")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-vytal-muted" />
                      <span className="text-xs text-vytal-muted">{fmtTime(wh.lastTriggeredAt) ?? t("webhooks.never")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        wh.successRate >= 95 ? "text-vytal-green" : wh.successRate >= 80 ? "text-vytal-amber" : "text-vytal-red",
                      )}
                    >
                      {wh.successRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setActive.mutate({ id: wh.id, active: !wh.active })}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                          wh.active ? "text-vytal-amber hover:bg-vytal-amber/10" : "text-vytal-green hover:bg-vytal-green/10",
                        )}
                        title={wh.active ? t("webhooks.titlePause") : t("webhooks.titleResume")}
                      >
                        {wh.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => testWebhook.mutate({ id: wh.id })}
                        disabled={testWebhook.isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-blue transition-colors hover:bg-vytal-blue/10 disabled:opacity-50"
                        title={t("webhooks.titleTest")}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteWebhook.mutate({ id: wh.id })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-red transition-colors hover:bg-vytal-red/10"
                        title={t("webhooks.titleDelete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent deliveries */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-vytal-green" />
          <h2 className="text-lg font-semibold text-vytal-text">{t("webhooks.recentDeliveries")}</h2>
        </div>
        {deliveries.length === 0 ? (
          <p className="text-sm text-vytal-muted">{t("webhooks.noDeliveries")}</p>
        ) : (
          <div className="space-y-2">
            {deliveries.map((dl) => (
              <div key={dl.id} className="rounded-lg border border-vytal-border bg-vytal-bg2">
                <button
                  onClick={() => setExpandedDelivery(expandedDelivery === dl.id ? null : dl.id)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left"
                >
                  <span
                    className={cn(
                      "flex h-7 w-14 items-center justify-center rounded-md text-xs font-bold",
                      dl.ok ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-red/10 text-vytal-red",
                    )}
                  >
                    {dl.statusCode ?? "ERR"}
                  </span>
                  <span className="flex-1 text-sm text-vytal-text">{dl.webhookName}</span>
                  <span className="rounded-full bg-vytal-bg3 px-2 py-0.5 font-mono text-[10px] text-vytal-muted">{dl.event}</span>
                  <span className="text-xs text-vytal-muted">{dl.responseMs}ms</span>
                  <span className="font-mono text-xs text-vytal-muted">{fmtTime(dl.createdAt)}</span>
                  {expandedDelivery === dl.id ? <EyeOff className="h-3.5 w-3.5 text-vytal-muted" /> : <Eye className="h-3.5 w-3.5 text-vytal-muted" />}
                </button>
                {expandedDelivery === dl.id && (
                  <div className="border-t border-vytal-border px-4 py-3">
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("webhooks.payload")}</label>
                    <code className="block whitespace-pre-wrap break-all rounded-lg bg-vytal-bg3 p-3 font-mono text-xs text-vytal-text">
                      {dl.payload}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
