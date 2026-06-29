"use client";

import { useState, useCallback } from "react";
import {
  Gift,
  Plus,
  Copy,
  Tag,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatCurrency } from "@/stores/data-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VoucherStatus = "active" | "redeemed" | "expired";

interface VoucherTemplate {
  id: string;
  name: string;
  type: string;
  value: number;
  description: string;
}

interface Voucher {
  id: string;
  code: string;
  templateName: string;
  type: string;
  value: number;
  buyer: string;
  recipient: string;
  status: VoucherStatus;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const templates: VoucherTemplate[] = [
  {
    id: "tmpl-1",
    name: "Trial Class Pass",
    type: "1 class",
    value: 15,
    description: "Single trial class for new members. Perfect as a gift.",
  },
  {
    id: "tmpl-2",
    name: "10 Class Pack",
    type: "10 classes",
    value: 100,
    description: "Pack of 10 classes. Valid for 3 months from activation.",
  },
  {
    id: "tmpl-3",
    name: "1 Month Gift",
    type: "1 month membership",
    value: 75,
    description: "Full membership for 1 month. Access to all classes.",
  },
  {
    id: "tmpl-4",
    name: "Custom Amount",
    type: "variable",
    value: 0,
    description: `Custom gift card with a chosen amount. Minimum ${formatCurrency(10)}.`,
  },
];

const initialVouchers: Voucher[] = [
  {
    id: "v-1",
    code: "VYTAL-A3K9X2",
    templateName: "Trial Class Pass",
    type: "1 class",
    value: 15,
    buyer: "Ines Ferreira",
    recipient: "Maria Santos",
    status: "active",
    createdAt: "2026-06-01",
  },
  {
    id: "v-2",
    code: "VYTAL-B7M2P4",
    templateName: "10 Class Pack",
    type: "10 classes",
    value: 100,
    buyer: "Pedro Almeida",
    recipient: "Ana Almeida",
    status: "redeemed",
    createdAt: "2026-05-15",
  },
  {
    id: "v-3",
    code: "VYTAL-C1N8Q6",
    templateName: "1 Month Gift",
    type: "1 month membership",
    value: 75,
    buyer: "Sofia Santos",
    recipient: "Tiago Neves",
    status: "active",
    createdAt: "2026-05-28",
  },
  {
    id: "v-4",
    code: "VYTAL-D5R3T8",
    templateName: "Custom Amount",
    type: "variable",
    value: 50,
    buyer: "Jose Fonte",
    recipient: "Carolina Dias",
    status: "redeemed",
    createdAt: "2026-04-20",
  },
  {
    id: "v-5",
    code: "VYTAL-E9W1Y3",
    templateName: "Trial Class Pass",
    type: "1 class",
    value: 15,
    buyer: "Miguel Costa",
    recipient: "Ricardo Mendes",
    status: "expired",
    createdAt: "2026-03-10",
  },
  {
    id: "v-6",
    code: "VYTAL-F4Z6U7",
    templateName: "10 Class Pack",
    type: "10 classes",
    value: 100,
    buyer: "Ana Silva",
    recipient: "Bruno Martins",
    status: "redeemed",
    createdAt: "2026-04-05",
  },
  {
    id: "v-7",
    code: "VYTAL-G2H5J9",
    templateName: "1 Month Gift",
    type: "1 month membership",
    value: 75,
    buyer: "Filipa Rodrigues",
    recipient: "Maria Oliveira",
    status: "active",
    createdAt: "2026-05-20",
  },
  {
    id: "v-8",
    code: "VYTAL-H8K4L1",
    templateName: "Custom Amount",
    type: "variable",
    value: 120,
    buyer: "Tiago Neves",
    recipient: "Pedro Santos",
    status: "redeemed",
    createdAt: "2026-05-01",
  },
];

const statusConfig: Record<VoucherStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "text-vytal-green", bg: "bg-vytal-green/10", icon: CheckCircle },
  redeemed: { label: "Redeemed", color: "text-vytal-blue", bg: "bg-vytal-blue/10", icon: Tag },
  expired: { label: "Expired", color: "text-vytal-red", bg: "bg-vytal-red/10", icon: AlertCircle },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VouchersPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  // Stats
  const totalSold = vouchers.reduce((sum, v) => sum + v.value, 0);
  const redeemed = vouchers
    .filter((v) => v.status === "redeemed")
    .reduce((sum, v) => sum + v.value, 0);
  const outstanding = totalSold - redeemed;

  const generateCode = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "VYTAL-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  const handleCreateVoucher = useCallback(() => {
    if (!selectedTemplate || !recipientEmail.trim() || !senderName.trim()) return;
    const tmpl = templates.find((t) => t.id === selectedTemplate);
    if (!tmpl) return;

    const value = tmpl.value > 0 ? tmpl.value : parseInt(customAmount) || 10;

    const newVoucher: Voucher = {
      id: `v-${Date.now()}`,
      code: generateCode(),
      templateName: tmpl.name,
      type: tmpl.type,
      value,
      buyer: senderName.trim(),
      recipient: recipientEmail.trim(),
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setVouchers((prev) => [newVoucher, ...prev]);
    setSelectedTemplate("");
    setRecipientEmail("");
    setSenderName("");
    setPersonalMessage("");
    setCustomAmount("");
    setShowCreateForm(false);
    toast(t("vouchers.voucherCreated"), "success");
  }, [selectedTemplate, recipientEmail, senderName, customAmount, generateCode, toast, t]);

  const handleCopyCode = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code);
      toast(t("vouchers.codeCopied"), "success");
    },
    [toast, t]
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.store"), href: "/store" },
          { label: t("vouchers.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-vytal-text">{t("vouchers.title")}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("vouchers.createVoucher")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4">
          <p className="text-xs text-vytal-muted">{t("vouchers.totalSold")}</p>
          <p className="mt-1 text-2xl font-bold text-vytal-text">{formatCurrency(totalSold)}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4">
          <p className="text-xs text-vytal-muted">{t("vouchers.redeemed")}</p>
          <p className="mt-1 text-2xl font-bold text-vytal-green">{formatCurrency(redeemed)}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4">
          <p className="text-xs text-vytal-muted">{t("vouchers.outstanding")}</p>
          <p className="mt-1 text-2xl font-bold text-vytal-amber">{formatCurrency(outstanding)}</p>
        </div>
      </div>

      {/* Templates */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-vytal-text">{t("vouchers.templates")}</h2>
        <div className="grid grid-cols-4 gap-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4 transition-colors hover:border-vytal-green/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
                <Gift className="h-5 w-5 text-vytal-green" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-vytal-text">{tmpl.name}</h3>
              <p className="mt-1 text-xs text-vytal-muted">{tmpl.type}</p>
              <p className="mt-2 text-lg font-bold text-vytal-text">
                {tmpl.value > 0 ? formatCurrency(tmpl.value) : t("vouchers.customMin")}
              </p>
              <p className="mt-1 text-[10px] text-vytal-muted">{tmpl.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vytal-text">{t("vouchers.createVoucher")}</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            >
              <option value="">{t("vouchers.selectTemplate")}</option>
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} {tmpl.value > 0 ? `(${formatCurrency(tmpl.value)})` : ""}
                </option>
              ))}
            </select>
            {selectedTemplate &&
              templates.find((t) => t.id === selectedTemplate)?.value === 0 && (
                <input
                  type="number"
                  placeholder={t("vouchers.customAmountPlaceholder")}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="10"
                  className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                />
              )}
            <input
              type="email"
              placeholder={t("vouchers.recipientEmail")}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <input
              type="text"
              placeholder={t("vouchers.senderName")}
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <textarea
              placeholder={t("vouchers.personalMessage")}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={2}
              className="col-span-2 rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <button
              onClick={handleCreateVoucher}
              disabled={!selectedTemplate || !recipientEmail.trim() || !senderName.trim()}
              className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
            >
              <Gift className="h-4 w-4" />
              {t("vouchers.createVoucher")}
            </button>
          </div>
        </div>
      )}

      {/* Active Vouchers Table */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2">
        <div className="border-b border-vytal-border px-5 py-3">
          <h2 className="text-sm font-semibold text-vytal-text">{t("vouchers.activeVouchers")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vytal-border text-left text-[11px] font-medium uppercase tracking-wider text-vytal-muted">
                <th className="px-5 py-3">{t("vouchers.code")}</th>
                <th className="px-5 py-3">{t("vouchers.type")}</th>
                <th className="px-5 py-3">{t("vouchers.value")}</th>
                <th className="px-5 py-3">{t("vouchers.buyer")}</th>
                <th className="px-5 py-3">{t("vouchers.recipient")}</th>
                <th className="px-5 py-3">{t("vouchers.status")}</th>
                <th className="px-5 py-3">{t("vouchers.created")}</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => {
                const sConf = statusConfig[voucher.status];
                const SIcon = sConf.icon;
                return (
                  <tr
                    key={voucher.id}
                    className="border-b border-vytal-border/50 transition-colors hover:bg-vytal-bg3/50"
                  >
                    <td className="px-5 py-3">
                      <code className="rounded bg-vytal-bg3 px-2 py-0.5 text-xs font-mono text-vytal-text">
                        {voucher.code}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-sm text-vytal-text">{voucher.templateName}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-vytal-text">
                      {formatCurrency(voucher.value)}
                    </td>
                    <td className="px-5 py-3 text-sm text-vytal-text">{voucher.buyer}</td>
                    <td className="px-5 py-3 text-sm text-vytal-text">{voucher.recipient}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          sConf.bg,
                          sConf.color
                        )}
                      >
                        <SIcon className="h-3 w-3" />
                        {sConf.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-vytal-muted">{voucher.createdAt}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="text-vytal-muted transition-colors hover:text-vytal-text"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
