"use client";

import { useState, useCallback } from "react";
import { useDataStore } from "@/stores/data-store";
import type { LeadStage } from "@vytal-fit/shared";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Clock,
  UserPlus,
  XCircle,
  X,
  Send,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

const stageConfig: Record<
  LeadStage,
  { label: string; className: string }
> = {
  lead: { label: "Lead", className: "bg-vytal-muted/10 text-vytal-muted" },
  contacted: { label: "Contacted", className: "bg-vytal-amber/10 text-vytal-amber" },
  prospect: { label: "Prospect", className: "bg-vytal-blue/10 text-vytal-blue" },
  trial_booked: { label: "Trial Booked", className: "bg-vytal-blue/10 text-vytal-blue" },
  subscribed: { label: "Subscribed", className: "bg-vytal-green/10 text-vytal-green" },
  lost: { label: "Lost", className: "bg-vytal-red/10 text-vytal-red" },
};

const CLASS_TYPES = ["WOD", "Open Box", "Endurance", "Gymnastics", "Olympic Lifting"];
const TIME_SLOTS = ["07:00", "09:00", "10:00", "12:00", "17:30", "18:30", "19:30"];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Trial Booking Modal ─────────────────────────────────

function TrialBookingModal({
  leadName,
  onClose,
  onConfirm,
}: {
  leadName: string;
  onClose: () => void;
  onConfirm: (date: string, classType: string, time: string) => void;
}) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [classType, setClassType] = useState(CLASS_TYPES[0]);
  const [time, setTime] = useState(TIME_SLOTS[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-vytal-border bg-vytal-bg2 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-vytal-text">Book Trial for {leadName}</h3>
          <button onClick={onClose} className="text-vytal-muted hover:text-vytal-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Class Type</label>
            <select
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            >
              {CLASS_TYPES.map((ct) => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Time Slot</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    time === slot
                      ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                      : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-vytal-border px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(date, classType, time)}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm Trial
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const leads = useDataStore((s) => s.leads);
  const coaches = useDataStore((s) => s.coaches);
  const updateLead = useDataStore((s) => s.updateLead);
  const moveLead = useDataStore((s) => s.moveLead);
  const lead = leads.find((l) => l.id === id);

  const [showTrialModal, setShowTrialModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [trialInfo, setTrialInfo] = useState<{ date: string; classType: string; time: string } | null>(null);
  const [communicationHistory, setCommunicationHistory] = useState([
    { id: 1, type: "email" as const, title: "Welcome email sent", date: "2026-06-01", details: "Sent intro email with box information and trial class details." },
    { id: 2, type: "call" as const, title: "Phone call logged", date: "2026-06-02", details: "Discussed schedule preferences. Interested in morning WODs." },
    { id: 3, type: "booking" as const, title: "Trial class booked", date: "2026-06-03", details: "Booked for WOD class on June 5 at 07:00." },
  ]);

  if (!lead) {
    notFound();
  }

  const coach = lead.assignedCoachId
    ? coaches.find((c) => c.id === lead.assignedCoachId)
    : null;

  const stage = stageConfig[lead.stage];
  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const handleStageChange = useCallback(
    (newStage: string) => {
      moveLead(lead.id, newStage as LeadStage);
      toast(`Stage changed to ${stageConfig[newStage as LeadStage].label}`, "success");
    },
    [lead.id, moveLead, toast]
  );

  const handleAssignCoach = useCallback(() => {
    if (coaches.length > 0) {
      const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];
      updateLead(lead.id, { assignedCoachId: randomCoach.id });
      toast(`Assigned coach: ${randomCoach.name}`, "success");
    }
  }, [lead.id, coaches, updateLead, toast]);

  const handleBookTrial = useCallback(
    (date: string, classType: string, time: string) => {
      setTrialInfo({ date, classType, time });
      moveLead(lead.id, "trial_booked");
      updateLead(lead.id, { trialDate: date });
      setCommunicationHistory((prev) => [
        {
          id: Date.now(),
          type: "booking" as const,
          title: `Trial booked: ${classType} at ${time}`,
          date,
          details: `Trial class booked for ${classType} on ${date} at ${time}.`,
        },
        ...prev,
      ]);
      setShowTrialModal(false);
      toast(`Trial booked for ${lead.name}: ${classType} on ${date} at ${time}`, "success");
    },
    [lead.id, lead.name, moveLead, updateLead, toast]
  );

  const handleConvertToMember = useCallback(() => {
    moveLead(lead.id, "subscribed");
    toast(`${lead.name} converted to member!`, "success");
  }, [lead.id, lead.name, moveLead, toast]);

  const handleMarkAsLost = useCallback(() => {
    moveLead(lead.id, "lost");
    toast(`${lead.name} marked as lost`, "info");
  }, [lead.id, lead.name, moveLead, toast]);

  const handleAddNote = useCallback(() => {
    if (!noteText.trim()) return;
    updateLead(lead.id, { notes: noteText.trim() });
    setCommunicationHistory((prev) => [
      {
        id: Date.now(),
        type: "email" as const,
        title: "Note added",
        date: new Date().toISOString().split("T")[0],
        details: noteText.trim(),
      },
      ...prev,
    ]);
    toast("Note added", "success");
    setNoteText("");
  }, [lead.id, noteText, updateLead, toast]);

  const handleSendConfirmation = useCallback(() => {
    setCommunicationHistory((prev) => [
      {
        id: Date.now(),
        type: "email" as const,
        title: "Confirmation email sent",
        date: new Date().toISOString().split("T")[0],
        details: `Sent trial confirmation email to ${lead.email ?? lead.name}.`,
      },
      ...prev,
    ]);
    toast("Confirmation email sent!", "success");
  }, [lead.email, lead.name, toast]);

  // Determine if trial is already booked
  const hasTrialBooked = lead.stage === "trial_booked" || trialInfo !== null || !!lead.trialDate;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("crm.title"), href: "/crm" }, { label: t("ui.details") }]} />

      <Link
        href="/crm"
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("crmDetail.backToCrm")}
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vytal-green/10 text-xl font-bold text-vytal-green">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-vytal-text">{lead.name}</h1>
              <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", stage.className)}>
                {stage.label}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-vytal-muted">
              {lead.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {lead.email}
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {lead.phone}
                </div>
              )}
              {lead.source && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {lead.source}
                </div>
              )}
              {coach && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {coach.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trial Info Banner */}
      {hasTrialBooked && (
        <div className="rounded-xl border border-vytal-blue/20 bg-vytal-blue/5 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
                <Calendar className="h-5 w-5 text-vytal-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-vytal-text">Trial Booked</p>
                <p className="mt-0.5 text-xs text-vytal-muted">
                  {trialInfo ? (
                    <>{trialInfo.classType} on {trialInfo.date} at {trialInfo.time}</>
                  ) : lead.trialDate ? (
                    <>Scheduled for {lead.trialDate}</>
                  ) : (
                    <>Trial has been booked</>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleSendConfirmation}
              className="flex items-center gap-2 rounded-lg border border-vytal-blue/30 bg-vytal-blue/10 px-3 py-1.5 text-xs font-medium text-vytal-blue transition-colors hover:bg-vytal-blue/20"
            >
              <Send className="h-3 w-3" />
              Send Confirmation Email
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Actions */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("crmDetail.actions")}</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("crmDetail.changeStage")}
              </label>
              <select
                value={lead.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {Object.entries(stageConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAssignCoach}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <User className="h-4 w-4" />
              {t("crmDetail.assignCoach")}
            </button>
            <button
              onClick={() => setShowTrialModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Calendar className="h-4 w-4" />
              {t("crmDetail.bookTrial")}
            </button>
            <button
              onClick={handleConvertToMember}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              <UserPlus className="h-4 w-4" />
              {t("crmDetail.convertToMember")}
            </button>
            <button
              onClick={handleMarkAsLost}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-vytal-red/30 bg-vytal-red/10 px-4 py-2.5 text-sm font-medium text-vytal-red transition-colors hover:bg-vytal-red/20"
            >
              <XCircle className="h-4 w-4" />
              {t("crmDetail.markAsLost")}
            </button>
          </div>
        </div>

        {/* Communication Timeline */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("crmDetail.communicationHistory")}</h2>
          <div className="space-y-4">
            {communicationHistory.map((item) => (
              <div
                key={item.id}
                className="relative border-l-2 border-vytal-green/20 pl-4"
              >
                <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-vytal-green" />
                <div className="flex items-center gap-2">
                  {item.type === "email" && <Mail className="h-3.5 w-3.5 text-vytal-blue" />}
                  {item.type === "call" && <Phone className="h-3.5 w-3.5 text-vytal-amber" />}
                  {item.type === "booking" && <Calendar className="h-3.5 w-3.5 text-vytal-green" />}
                  <span className="text-sm font-semibold text-vytal-text">{item.title}</span>
                </div>
                <p className="mt-1 text-sm text-vytal-muted">{item.details}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-vytal-muted">
                  <Clock className="h-3 w-3" />
                  {formatDate(item.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("crmDetail.notes")}</h2>
        {lead.notes && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-vytal-bg2 p-3">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 text-vytal-muted" />
            <p className="text-sm text-vytal-muted">{lead.notes}</p>
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder={t("crmDetail.addNotePlaceholder")}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddNote(); }}
            className="flex-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          />
          <button
            onClick={handleAddNote}
            className="rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            {t("crmDetail.addNote")}
          </button>
        </div>
      </div>

      {/* Trial Booking Modal */}
      {showTrialModal && (
        <TrialBookingModal
          leadName={lead.name}
          onClose={() => setShowTrialModal(false)}
          onConfirm={handleBookTrial}
        />
      )}
    </div>
  );
}
