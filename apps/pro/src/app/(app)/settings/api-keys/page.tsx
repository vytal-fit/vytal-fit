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
import { useOrgFormat } from "@/lib/org-format";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const DOCS_URL = "https://docs.vytal.fit";

export default function ApiKeysPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { dateTime } = useOrgFormat();

  const utils = trpc.useUtils();
  const keysQuery = trpc.apiKeys.list.useQuery();

  const [showCreate, setShowCreate] = useState(false);
  const [showRevoke, setShowRevoke] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [newName, setNewName] = useState("");

  const createKey = trpc.apiKeys.create.useMutation({
    onSuccess: (created) => {
      setNewlyCreatedKey(created.key);
      setShowCreate(false);
      setNewName("");
      void utils.apiKeys.list.invalidate();
    },
    onError: (error) =>
      toast(
        error.data?.code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"),
        "error",
      ),
  });

  const revokeKey = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      void utils.apiKeys.list.invalidate();
      toast(t("apiKeys.toastRevoked"), "success");
    },
    onError: (error) =>
      toast(
        error.data?.code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"),
        "error",
      ),
    onSettled: () => setShowRevoke(null),
  });

  const keys = keysQuery.data ?? [];

  function handleCreate() {
    if (!newName.trim()) {
      toast(t("apiKeys.toastNoName"), "error");
      return;
    }
    createKey.mutate({ name: newName.trim() });
  }

  function handleCopyKey(key: string) {
    void navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast(t("apiKeys.toastCopied"), "success");
    setTimeout(() => setCopiedKey(false), 2000);
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
          <p className="mt-1 text-sm text-vytal-muted">{t("apiKeys.subtitle")}</p>
        </div>
        <button
          onClick={() => {
            setShowCreate((v) => !v);
            setNewlyCreatedKey(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("apiKeys.createBtn")}
        </button>
      </div>

      {/* Auth model + rate limits info */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-vytal-border bg-vytal-card p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-vytal-blue" />
          <span className="text-sm text-vytal-muted">
            {t("apiKeys.authScheme")}{" "}
            <code className="rounded bg-vytal-bg3 px-1.5 py-0.5 font-mono text-xs text-vytal-text">
              Authorization: Bearer vk_live_…
            </code>
          </span>
        </div>
        <div className="hidden h-4 w-px bg-vytal-border sm:block" />
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-vytal-amber" />
          <span className="text-sm text-vytal-muted">
            {t("apiKeys.rateLimits")}{" "}
            <span className="font-semibold text-vytal-text">{t("apiKeys.rateLimitsValue")}</span>
          </span>
        </div>
      </div>

      {/* Newly created key: shown once */}
      {newlyCreatedKey && (
        <div className="space-y-3 rounded-xl border-2 border-vytal-amber/30 bg-vytal-amber/5 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-vytal-amber" />
            <h3 className="font-semibold text-vytal-amber">{t("apiKeys.newKeyWarning")}</h3>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg border border-vytal-amber/20 bg-vytal-bg2 px-4 py-3 font-mono text-sm text-vytal-text">
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => handleCopyKey(newlyCreatedKey)}
              className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            >
              {copiedKey ? (
                <>
                  <Check className="h-4 w-4" /> {t("apiKeys.copied")}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> {t("apiKeys.copy")}
                </>
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

      {/* Create form */}
      {showCreate && (
        <div className="space-y-5 rounded-xl border border-vytal-green/30 bg-vytal-card p-6">
          <div className="mb-2 flex items-center gap-2">
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
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createKey.isPending}
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

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-vytal-border bg-vytal-card px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-green/10">
            <Key className="h-6 w-6 text-vytal-green" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-vytal-text">{t("apiKeys.emptyTitle")}</h3>
            <p className="mt-1 text-sm text-vytal-muted">{t("apiKeys.emptySubtitle")}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("apiKeys.colName")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("apiKeys.colKey")}
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
              {keys.map((k) => {
                const revoked = Boolean(k.revokedAt);
                return (
                  <tr key={k.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-vytal-green" />
                        <span className="text-sm font-medium text-vytal-text">{k.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-vytal-bg3 px-2 py-0.5 font-mono text-xs text-vytal-muted">
                        {k.masked}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-vytal-muted">{dateTime(k.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-vytal-muted" />
                        <span className="text-xs text-vytal-muted">
                          {k.lastUsedAt ? dateTime(k.lastUsedAt) : t("apiKeys.neverUsed")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          revoked
                            ? "bg-vytal-red/10 text-vytal-red"
                            : "bg-vytal-green/10 text-vytal-green",
                        )}
                      >
                        {revoked ? t("apiKeys.statusRevoked") : t("apiKeys.statusActive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {!revoked &&
                          (showRevoke === k.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-vytal-red">{t("apiKeys.confirmRevoke")}</span>
                              <button
                                onClick={() => revokeKey.mutate({ id: k.id })}
                                disabled={revokeKey.isPending}
                                className="rounded-lg bg-vytal-red px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-vytal-red/90 disabled:opacity-60"
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
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* API documentation link */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-blue/10">
              <ExternalLink className="h-5 w-5 text-vytal-blue" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-vytal-text">{t("apiKeys.docsTitle")}</h3>
              <p className="text-xs text-vytal-muted">{t("apiKeys.docsSubtitle")}</p>
            </div>
          </div>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
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
