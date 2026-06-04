"use client";

import { useState } from "react";
import {
  Webhook,
  Plus,
  Trash2,
  Play,
  Pause,
  Send,
  Copy,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

interface WebhookEntry {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "paused";
  lastTriggered: string;
  successRate: number;
}

interface DeliveryLog {
  id: string;
  webhookName: string;
  event: string;
  statusCode: number;
  responseTime: string;
  timestamp: string;
  payload: string;
}

const availableEvents = [
  "member.created",
  "member.updated",
  "payment.success",
  "payment.failed",
  "class.booked",
  "class.cancelled",
  "lead.created",
  "wod.published",
];

const initialWebhooks: WebhookEntry[] = [
  {
    id: "wh-1",
    name: "Zapier -- New Member",
    url: "https://hooks.zapier.com/hooks/catch/123456/abcdef",
    events: ["member.created", "member.updated"],
    status: "active",
    lastTriggered: "2 hours ago",
    successRate: 99.2,
  },
  {
    id: "wh-2",
    name: "Slack -- Payment Received",
    url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXX",
    events: ["payment.success", "payment.failed"],
    status: "active",
    lastTriggered: "30 min ago",
    successRate: 100,
  },
  {
    id: "wh-3",
    name: "Custom -- Class Full",
    url: "https://api.example.com/webhooks/vytal",
    events: ["class.booked", "class.cancelled"],
    status: "paused",
    lastTriggered: "3 days ago",
    successRate: 87.5,
  },
];

const mockDeliveries: DeliveryLog[] = [
  {
    id: "dl-1",
    webhookName: "Slack -- Payment Received",
    event: "payment.success",
    statusCode: 200,
    responseTime: "142ms",
    timestamp: "2026-06-04 10:30:22",
    payload: '{"event":"payment.success","data":{"member_id":"m-1","amount":75,"currency":"EUR"}}',
  },
  {
    id: "dl-2",
    webhookName: "Zapier -- New Member",
    event: "member.created",
    statusCode: 200,
    responseTime: "238ms",
    timestamp: "2026-06-04 09:15:10",
    payload: '{"event":"member.created","data":{"id":"m-12","name":"Carlos Mendes","email":"carlos@email.com"}}',
  },
  {
    id: "dl-3",
    webhookName: "Custom -- Class Full",
    event: "class.booked",
    statusCode: 500,
    responseTime: "5012ms",
    timestamp: "2026-06-01 14:22:05",
    payload: '{"event":"class.booked","data":{"class_id":"cl-5","spots_remaining":0}}',
  },
  {
    id: "dl-4",
    webhookName: "Zapier -- New Member",
    event: "member.updated",
    statusCode: 200,
    responseTime: "189ms",
    timestamp: "2026-06-01 11:05:33",
    payload: '{"event":"member.updated","data":{"id":"m-3","status":"active"}}',
  },
  {
    id: "dl-5",
    webhookName: "Slack -- Payment Received",
    event: "payment.failed",
    statusCode: 200,
    responseTime: "156ms",
    timestamp: "2026-05-31 16:45:12",
    payload: '{"event":"payment.failed","data":{"member_id":"m-7","amount":60,"reason":"insufficient_funds"}}',
  },
];

function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "whsec_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const path = u.pathname;
    if (path.length > 15) {
      return `${host}${path.slice(0, 12)}...`;
    }
    return `${host}${path}`;
  } catch {
    return url.slice(0, 30) + "...";
  }
}

export default function WebhooksPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [webhooks, setWebhooks] = useState<WebhookEntry[]>(initialWebhooks);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [generatedSecret] = useState(generateSecret);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

  function handleToggleStatus(id: string) {
    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === id
          ? { ...wh, status: wh.status === "active" ? "paused" : "active" }
          : wh
      )
    );
    toast("Webhook status updated", "success");
  }

  function handleTest(name: string) {
    toast(`Test payload sent to "${name}"`, "success");
  }

  function handleDelete(id: string) {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
    toast("Webhook deleted", "success");
  }

  function handleCreate() {
    if (!newUrl || !newName || selectedEvents.length === 0) {
      toast("Please fill in all fields and select at least one event", "error");
      return;
    }
    const newWebhook: WebhookEntry = {
      id: `wh-${Date.now()}`,
      name: newName,
      url: newUrl,
      events: selectedEvents,
      status: "active",
      lastTriggered: "Never",
      successRate: 100,
    };
    setWebhooks((prev) => [...prev, newWebhook]);
    setShowCreate(false);
    setNewUrl("");
    setNewName("");
    setSelectedEvents([]);
    toast("Webhook created successfully", "success");
  }

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  function handleCopySecret() {
    navigator.clipboard.writeText(generatedSecret);
    setCopiedSecret(true);
    toast("Secret copied to clipboard", "success");
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: "Webhooks" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">Webhooks</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Connect external systems via real-time event notifications.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          Create Webhook
        </button>
      </div>

      {/* Create Webhook Form */}
      {showCreate && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Webhook className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Create Webhook</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Zapier -- New Member"
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Endpoint URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              Events
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {availableEvents.map((event) => (
                <label
                  key={event}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                    selectedEvents.includes(event)
                      ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                      : "border-vytal-border bg-vytal-bg2 text-vytal-muted hover:border-vytal-green/20"
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
                      selectedEvents.includes(event)
                        ? "border-vytal-green bg-vytal-green"
                        : "border-vytal-border"
                    )}
                  >
                    {selectedEvents.includes(event) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="font-mono">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              Signing Secret (auto-generated)
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 font-mono text-xs text-vytal-text">
                {generatedSecret}
              </code>
              <button
                onClick={handleCopySecret}
                className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-xs text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
              >
                {copiedSecret ? (
                  <><Check className="h-3 w-3" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copy</>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-vytal-border px-4 py-2.5 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Webhook List */}
      <div className="overflow-x-auto rounded-xl border border-vytal-border">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Webhook
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                URL
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Events
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Last Triggered
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Success Rate
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Actions
              </th>
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
                  <code className="rounded bg-vytal-bg3 px-2 py-0.5 font-mono text-xs text-vytal-muted">
                    {maskUrl(wh.url)}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map((ev) => (
                      <span
                        key={ev}
                        className="rounded-full bg-vytal-bg3 px-2 py-0.5 font-mono text-[10px] text-vytal-muted"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      wh.status === "active"
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "bg-vytal-amber/10 text-vytal-amber"
                    )}
                  >
                    {wh.status === "active" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Pause className="h-3 w-3" />
                    )}
                    {wh.status === "active" ? "Active" : "Paused"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-vytal-muted" />
                    <span className="text-xs text-vytal-muted">{wh.lastTriggered}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      wh.successRate >= 95
                        ? "text-vytal-green"
                        : wh.successRate >= 80
                        ? "text-vytal-amber"
                        : "text-vytal-red"
                    )}
                  >
                    {wh.successRate}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggleStatus(wh.id)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        wh.status === "active"
                          ? "text-vytal-amber hover:bg-vytal-amber/10"
                          : "text-vytal-green hover:bg-vytal-green/10"
                      )}
                      title={wh.status === "active" ? "Pause" : "Resume"}
                    >
                      {wh.status === "active" ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleTest(wh.name)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-blue transition-colors hover:bg-vytal-blue/10"
                      title="Send test payload"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(wh.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-red transition-colors hover:bg-vytal-red/10"
                      title="Delete"
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

      {/* Recent Deliveries */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-vytal-green" />
          <h2 className="text-lg font-semibold text-vytal-text">Recent Deliveries</h2>
        </div>
        <div className="space-y-2">
          {mockDeliveries.map((dl) => (
            <div key={dl.id} className="rounded-lg border border-vytal-border bg-vytal-bg2">
              <button
                onClick={() =>
                  setExpandedDelivery(expandedDelivery === dl.id ? null : dl.id)
                }
                className="flex w-full items-center gap-4 px-4 py-3 text-left"
              >
                <span
                  className={cn(
                    "flex h-7 w-14 items-center justify-center rounded-md text-xs font-bold",
                    dl.statusCode < 400
                      ? "bg-vytal-green/10 text-vytal-green"
                      : "bg-vytal-red/10 text-vytal-red"
                  )}
                >
                  {dl.statusCode}
                </span>
                <span className="flex-1 text-sm text-vytal-text">{dl.webhookName}</span>
                <span className="rounded-full bg-vytal-bg3 px-2 py-0.5 font-mono text-[10px] text-vytal-muted">
                  {dl.event}
                </span>
                <span className="text-xs text-vytal-muted">{dl.responseTime}</span>
                <span className="font-mono text-xs text-vytal-muted">{dl.timestamp}</span>
                {expandedDelivery === dl.id ? (
                  <EyeOff className="h-3.5 w-3.5 text-vytal-muted" />
                ) : (
                  <Eye className="h-3.5 w-3.5 text-vytal-muted" />
                )}
              </button>
              {expandedDelivery === dl.id && (
                <div className="border-t border-vytal-border px-4 py-3">
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                    Payload
                  </label>
                  <code className="block rounded-lg bg-vytal-bg3 p-3 font-mono text-xs text-vytal-text whitespace-pre-wrap break-all">
                    {JSON.stringify(JSON.parse(dl.payload), null, 2)}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
