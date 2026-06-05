"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Shield,
  Clock,
  Zap,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  keyMasked: string;
  keyFull: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  expiresAt: string | null;
  status: "active" | "revoked";
}

const initialKeys: ApiKey[] = [
  {
    id: "ak-1",
    name: "Production API Key",
    keyMasked: "vytal_sk_****7X2f",
    keyFull: "vytal_sk_prod_aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX2f",
    permissions: ["read_members", "write_members", "read_classes", "write_classes", "read_financials", "read_analytics"],
    createdAt: "2024-01-15",
    lastUsed: "2 hours ago",
    expiresAt: null,
    status: "active",
  },
  {
    id: "ak-2",
    name: "Development Key",
    keyMasked: "vytal_sk_****9Yz4",
    keyFull: "vytal_sk_dev_xY1zA2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2v9Yz4",
    permissions: ["read_members", "read_classes"],
    createdAt: "2026-05-01",
    lastUsed: "Never",
    expiresAt: "2026-08-01",
    status: "active",
  },
];

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "vytal_sk_";
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function ApiKeysPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const allPermissions = [
    { id: "read_members", label: t("apiKeys.permReadMembers") },
    { id: "write_members", label: t("apiKeys.permWriteMembers") },
    { id: "read_classes", label: t("apiKeys.permReadClasses") },
    { id: "write_classes", label: t("apiKeys.permWriteClasses") },
    { id: "read_financials", label: t("apiKeys.permReadFinancials") },
    { id: "read_analytics", label: t("apiKeys.permReadAnalytics") },
  ];

  const expiryOptions = [
    { label: t("apiKeys.expiryNever"), value: "never" },
    { label: t("apiKeys.expiry30"), value: "30" },
    { label: t("apiKeys.expiry90"), value: "90" },
    { label: t("apiKeys.expiry365"), value: "365" },
  ];

  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [showRevoke, setShowRevoke] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [newExpiry, setNewExpiry] = useState("never");

  function handleCreate() {
    if (!newName) {
      toast(t("apiKeys.toastNoName"), "error");
      return;
    }
    if (newPermissions.length === 0) {
      toast(t("apiKeys.toastNoPermissions"), "error");
      return;
    }

    const fullKey = generateApiKey();
    const masked = `vytal_sk_****${fullKey.slice(-4)}`;
    const now = new Date();
    let expiresAt: string | null = null;
    if (newExpiry !== "never") {
      const exp = new Date(now);
      exp.setDate(exp.getDate() + parseInt(newExpiry));
      expiresAt = exp.toISOString().split("T")[0];
    }

    const newKey: ApiKey = {
      id: `ak-${Date.now()}`,
      name: newName,
      keyMasked: masked,
      keyFull: fullKey,
      permissions: newPermissions,
      createdAt: now.toISOString().split("T")[0],
      lastUsed: "Never",
      expiresAt,
      status: "active",
    };

    setKeys((prev) => [...prev, newKey]);
    setNewlyCreatedKey(fullKey);
    setShowCreate(false);
    setNewName("");
    setNewPermissions([]);
    setNewExpiry("never");
  }

  function handleRevoke(id: string) {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
    );
    setShowRevoke(null);
    toast(t("apiKeys.toastRevoked"), "success");
  }

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast(t("apiKeys.toastCopied"), "success");
    setTimeout(() => setCopiedKey(false), 2000);
  }

  function togglePermission(perm: string) {
    setNewPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: t("apiKeys.title") },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("apiKeys.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("apiKeys.subtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(!showCreate);
            setNewlyCreatedKey(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("apiKeys.createBtn")}
        </button>
      </div>

      {/* Rate limits info */}
      <div className="flex items-center gap-6 rounded-xl border border-vytal-border bg-vytal-card p-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-vytal-amber" />
          <span className="text-sm text-vytal-muted">
            {t("apiKeys.rateLimits")} <span className="font-semibold text-vytal-text">{t("apiKeys.rateLimitsValue")}</span>
          </span>
        </div>
        <div className="h-4 w-px bg-vytal-border" />
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-vytal-blue" />
          <span className="text-sm text-vytal-muted">
            {t("apiKeys.dailyLimit")} <span className="font-semibold text-vytal-text">{t("apiKeys.dailyLimitValue")}</span>
          </span>
        </div>
      </div>

      {/* Newly created key warning */}
      {newlyCreatedKey && (
        <div className="rounded-xl border-2 border-vytal-amber/30 bg-vytal-amber/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-vytal-amber" />
            <h3 className="font-semibold text-vytal-amber">
              {t("apiKeys.newKeyWarning")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-vytal-amber/20 bg-vytal-bg2 px-4 py-3 font-mono text-sm text-vytal-text break-all">
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => handleCopyKey(newlyCreatedKey)}
              className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            >
              {copiedKey ? (
                <><Check className="h-4 w-4" /> {t("apiKeys.copied")}</>
              ) : (
                <><Copy className="h-4 w-4" /> {t("apiKeys.copy")}</>
              )}
            </button>
          </div>
          <button
            onClick={() => setNewlyCreatedKey(null)}
            className="text-xs text-vytal-muted hover:text-vytal-text"
          >
            {t("apiKeys.dismiss")}
          </button>
        </div>
      )}

      {/* Create API Key Form */}
      {showCreate && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">{t("apiKeys.createFormTitle")}</h2>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("apiKeys.nameLabel")}
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("apiKeys.namePlaceholder")}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("apiKeys.permissionsLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {allPermissions.map((perm) => (
                <label
                  key={perm.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition-colors",
                    newPermissions.includes(perm.id)
                      ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                      : "border-vytal-border bg-vytal-bg2 text-vytal-muted hover:border-vytal-green/20"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={newPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      newPermissions.includes(perm.id)
                        ? "border-vytal-green bg-vytal-green"
                        : "border-vytal-border"
                    )}
                  >
                    {newPermissions.includes(perm.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {perm.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("apiKeys.expiryLabel")}
            </label>
            <div className="flex gap-2">
              {expiryOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNewExpiry(opt.value)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                    newExpiry === opt.value
                      ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                      : "border-vytal-border bg-vytal-bg2 text-vytal-muted hover:border-vytal-green/20"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
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

      {/* Key List */}
      <div className="overflow-x-auto rounded-xl border border-vytal-border">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("apiKeys.colName")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("apiKeys.colKey")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("apiKeys.colPermissions")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("apiKeys.colCreated")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("apiKeys.colLastUsed")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("apiKeys.colStatus")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("apiKeys.colActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {keys.map((k) => (
              <tr key={k.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-vytal-green" />
                    <span className="text-sm font-medium text-vytal-text">{k.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-vytal-bg3 px-2 py-0.5 font-mono text-xs text-vytal-muted">
                    {k.keyMasked}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {k.permissions.length <= 3 ? (
                      k.permissions.map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] text-vytal-muted"
                        >
                          {p.replace("_", " ")}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] text-vytal-muted">
                          {t("apiKeys.permissionsCount").replace("{count}", String(k.permissions.length))}
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-vytal-muted">{k.createdAt}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-vytal-muted" />
                    <span className="text-xs text-vytal-muted">{k.lastUsed}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      k.status === "active"
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "bg-vytal-red/10 text-vytal-red"
                    )}
                  >
                    {k.status === "active" ? t("apiKeys.statusActive") : t("apiKeys.statusRevoked")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {k.status === "active" && (
                      <>
                        {showRevoke === k.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-vytal-red">{t("apiKeys.confirmRevoke")}</span>
                            <button
                              onClick={() => handleRevoke(k.id)}
                              className="rounded-lg bg-vytal-red px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-vytal-red/90"
                            >
                              {t("apiKeys.revokeBtn")}
                            </button>
                            <button
                              onClick={() => setShowRevoke(null)}
                              className="rounded-lg border border-vytal-border px-3 py-1.5 text-xs text-vytal-text transition-colors hover:bg-vytal-bg3"
                            >
                              {t("action.cancel")}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowRevoke(k.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-vytal-red/30 bg-vytal-red/5 px-3 py-1.5 text-xs font-semibold text-vytal-red transition-colors hover:bg-vytal-red/10"
                          >
                            <Trash2 className="h-3 w-3" />
                            {t("apiKeys.revokeBtn")}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API Documentation Link */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-blue/10">
              <ExternalLink className="h-5 w-5 text-vytal-blue" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-vytal-text">{t("apiKeys.docsTitle")}</h3>
              <p className="text-xs text-vytal-muted">
                {t("apiKeys.docsSubtitle")}
              </p>
            </div>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toast(t("apiKeys.docsToast"), "info");
            }}
            className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <ExternalLink className="h-4 w-4" />
            {t("apiKeys.docsBtn")}
          </a>
        </div>
      </div>
    </div>
  );
}
