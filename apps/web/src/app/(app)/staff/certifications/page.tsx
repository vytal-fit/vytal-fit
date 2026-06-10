"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  Bell,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useDataStore } from "@/stores/data-store";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface Certification {
  id: string;
  coachId: string;
  coachName: string;
  certName: string;
  issuedDate: string;
  expiryDate: string;
  status: "valid" | "expiring_soon" | "expired";
  documentUrl?: string;
}

function getCertStatus(expiryDate: string): Certification["status"] {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "expired";
  if (diffDays < 90) return "expiring_soon";
  return "valid";
}

const mockCertifications: Certification[] = [
  { id: "cert-1", coachId: "coach-1", coachName: "Andre Loureiro", certName: "CrossFit Level 3", issuedDate: "2024-03-15", expiryDate: "2027-03-15", status: "valid" },
  { id: "cert-2", coachId: "coach-1", coachName: "Andre Loureiro", certName: "First Aid & CPR", issuedDate: "2025-01-10", expiryDate: "2026-07-10", status: "expiring_soon" },
  { id: "cert-3", coachId: "coach-2", coachName: "Marine Robba", certName: "CrossFit Level 2", issuedDate: "2023-09-20", expiryDate: "2026-09-20", status: "valid" },
  { id: "cert-4", coachId: "coach-2", coachName: "Marine Robba", certName: "Nutrition Certification", issuedDate: "2024-06-01", expiryDate: "2026-06-01", status: "expiring_soon" },
  { id: "cert-5", coachId: "coach-3", coachName: "Ricardo Ribeiro", certName: "CrossFit Level 1", issuedDate: "2022-11-05", expiryDate: "2025-11-05", status: "expired" },
  { id: "cert-6", coachId: "coach-3", coachName: "Ricardo Ribeiro", certName: "Hyrox Coach", issuedDate: "2025-02-20", expiryDate: "2028-02-20", status: "valid" },
  { id: "cert-7", coachId: "coach-4", coachName: "Sofia Mendes", certName: "CrossFit Level 1", issuedDate: "2024-08-12", expiryDate: "2027-08-12", status: "valid" },
  { id: "cert-8", coachId: "coach-4", coachName: "Sofia Mendes", certName: "CPR Certification", issuedDate: "2025-03-01", expiryDate: "2026-06-15", status: "expiring_soon" },
  { id: "cert-9", coachId: "coach-1", coachName: "Andre Loureiro", certName: "Weightlifting Coach L2", issuedDate: "2024-01-20", expiryDate: "2027-01-20", status: "valid" },
  { id: "cert-10", coachId: "coach-3", coachName: "Ricardo Ribeiro", certName: "First Aid", issuedDate: "2023-05-10", expiryDate: "2025-05-10", status: "expired" },
];

const statusConfig = {
  valid: { labelKey: "certs.valid", className: "bg-vytal-green/10 text-vytal-green", icon: CheckCircle },
  expiring_soon: { labelKey: "certs.expiringSoon", className: "bg-vytal-amber/10 text-vytal-amber", icon: Clock },
  expired: { labelKey: "certs.expired", className: "bg-vytal-red/10 text-vytal-red", icon: AlertTriangle },
};

export default function CertificationsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const coaches = useDataStore((s) => s.coaches);
  const [certs, setCerts] = useState(mockCertifications);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | Certification["status"]>("all");
  const [reminders, setReminders] = useState({ days30: true, days60: true, days90: false });
  const [newCert, setNewCert] = useState({
    coachId: "",
    certName: "",
    issuedDate: "",
    expiryDate: "",
  });

  const filteredCerts =
    filterStatus === "all" ? certs : certs.filter((c) => c.status === filterStatus);

  const expiringCount = certs.filter((c) => c.status === "expiring_soon").length;
  const expiredCount = certs.filter((c) => c.status === "expired").length;

  const handleAddCert = () => {
    if (!newCert.coachId || !newCert.certName || !newCert.issuedDate || !newCert.expiryDate) {
      toast(t("certs.fillAllFields"), "error");
      return;
    }
    const coach = coaches.find((c) => c.id === newCert.coachId);
    const cert: Certification = {
      id: `cert-${Date.now()}`,
      coachId: newCert.coachId,
      coachName: coach?.name ?? "Unknown",
      certName: newCert.certName,
      issuedDate: newCert.issuedDate,
      expiryDate: newCert.expiryDate,
      status: getCertStatus(newCert.expiryDate),
    };
    setCerts([cert, ...certs]);
    setShowAdd(false);
    setNewCert({ coachId: "", certName: "", issuedDate: "", expiryDate: "" });
    toast(t("certs.added"), "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: t("nav.staff"), href: "/staff" },
              { label: t("certs.title") },
            ]}
          />
          <p className="mt-1 text-sm text-vytal-muted">{t("certs.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("certs.addCertification")}
        </button>
      </div>

      {/* Alerts */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="flex items-center gap-4">
          {expiringCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-vytal-amber/10 px-4 py-2">
              <Clock className="h-4 w-4 text-vytal-amber" />
              <span className="text-sm font-medium text-vytal-amber">
                {expiringCount} {t("certs.expiringAlert")}
              </span>
            </div>
          )}
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-vytal-red/10 px-4 py-2">
              <AlertTriangle className="h-4 w-4 text-vytal-red" />
              <span className="text-sm font-medium text-vytal-red">
                {expiredCount} {t("certs.expiredAlert")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "valid", "expiring_soon", "expired"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              filterStatus === status
                ? "bg-vytal-green/10 text-vytal-green ring-1 ring-vytal-green/30"
                : "bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
            )}
          >
            {status === "all" ? t("certs.all") : t(statusConfig[status].labelKey)}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-vytal-text">{t("certs.addCertification")}</h3>
            <button onClick={() => setShowAdd(false)} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("certs.coach")}</label>
              <select
                value={newCert.coachId}
                onChange={(e) => setNewCert({ ...newCert, coachId: e.target.value })}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
              >
                <option value="">{t("certs.selectCoach")}</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("certs.certName")}</label>
              <input
                type="text"
                value={newCert.certName}
                onChange={(e) => setNewCert({ ...newCert, certName: e.target.value })}
                placeholder="CrossFit Level 1"
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("certs.issuedDate")}</label>
              <input
                type="date"
                value={newCert.issuedDate}
                onChange={(e) => setNewCert({ ...newCert, issuedDate: e.target.value })}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("certs.expiryDate")}</label>
              <input
                type="date"
                value={newCert.expiryDate}
                onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAddCert}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              <Plus className="h-4 w-4" />
              {t("certs.save")}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg3/50 text-left">
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("certs.coach")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("certs.certification")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("certs.issued")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("certs.expiry")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("certs.status")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("certs.document")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map((cert) => {
                const config = statusConfig[cert.status];
                const StatusIcon = config.icon;
                return (
                  <tr key={cert.id} className="border-b border-vytal-border last:border-b-0 hover:bg-vytal-bg3/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-vytal-text">{cert.coachName}</td>
                    <td className="px-5 py-3 text-vytal-text">{cert.certName}</td>
                    <td className="px-5 py-3 text-vytal-muted">
                      {new Date(cert.issuedDate).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="px-5 py-3 text-vytal-muted">
                      {new Date(cert.expiryDate).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", config.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {t(config.labelKey)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toast(t("certs.downloadDoc"), "success")}
                        className="text-vytal-green hover:text-vytal-green/80 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal reminders */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-vytal-muted" />
          <h3 className="text-base font-bold text-vytal-text">{t("certs.renewalReminders")}</h3>
        </div>
        <div className="flex items-center gap-6">
          {([
            { key: "days30", label: "30 days" },
            { key: "days60", label: "60 days" },
            { key: "days90", label: "90 days" },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reminders[key]}
                onChange={() => {
                  setReminders({ ...reminders, [key]: !reminders[key] });
                  toast(t("certs.reminderUpdated"), "success");
                }}
                className="h-4 w-4 rounded border-vytal-border text-vytal-green accent-vytal-green"
              />
              <span className="text-sm text-vytal-text">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
