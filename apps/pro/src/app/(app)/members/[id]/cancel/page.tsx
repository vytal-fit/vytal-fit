"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Pause,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";
import { rowToMember } from "@/lib/member-mapper";
import { Breadcrumbs } from "@/components/breadcrumbs";

const cancellationReasons = [
  { value: "too_expensive", labelKey: "cancel.reason.tooExpensive" },
  { value: "moving_away", labelKey: "cancel.reason.movingAway" },
  { value: "no_time", labelKey: "cancel.reason.noTime" },
  { value: "injury", labelKey: "cancel.reason.injury" },
  { value: "not_satisfied", labelKey: "cancel.reason.notSatisfied" },
  { value: "other", labelKey: "cancel.reason.other" },
];

export default function CancelMembershipPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const utils = trpc.useUtils();
  const memberQuery = trpc.members.byId.useQuery({ id: memberId });
  const member = memberQuery.data ? rowToMember(memberQuery.data) : undefined;
  const updateMutation = trpc.members.update.useMutation({
    onSuccess: (row) => {
      utils.members.byId.setData({ id: memberId }, row);
      void utils.members.list.invalidate();
    },
  });

  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [whatWouldBringBack, setWhatWouldBringBack] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [showPauseOption, setShowPauseOption] = useState(false);

  if (memberQuery.isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-vytal-muted">{t("ui.loading")}</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-vytal-muted">{t("cancel.memberNotFound")}</p>
      </div>
    );
  }

  const planName = "Mensal Unlimited"; // Mock plan
  const canConfirm = confirmName.toLowerCase() === member.name.toLowerCase() && reason !== "";

  const handleCancel = () => {
    updateMutation.mutate(
      { id: memberId, data: { status: "inactive" } },
      {
        onSuccess: () => {
          toast(t("cancel.membershipCancelled"), "success");
          router.push(`/members/${memberId}`);
        },
        onError: () => toast(t("ui.error"), "error"),
      },
    );
  };

  const handlePause = () => {
    updateMutation.mutate(
      { id: memberId, data: { status: "suspended" } },
      {
        onSuccess: () => {
          toast(t("cancel.membershipPaused"), "success");
          router.push(`/members/${memberId}`);
        },
        onError: () => toast(t("ui.error"), "error"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: member.name, href: `/members/${memberId}` },
          { label: t("cancel.title") },
        ]}
      />

      {/* Warning card */}
      <div className="rounded-xl border border-vytal-amber/30 bg-vytal-amber/[0.05] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vytal-amber/10">
            <AlertTriangle className="h-5 w-5 text-vytal-amber" />
          </div>
          <div>
            <h2 className="text-base font-bold text-vytal-text">{t("cancel.warningTitle")}</h2>
            <p className="mt-1 text-sm text-vytal-muted">
              {t("cancel.warningDesc").replace("{plan}", planName).replace("{member}", member.name)}
            </p>
          </div>
        </div>
      </div>

      {/* Exit survey */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6 space-y-6">
        <h3 className="text-base font-bold text-vytal-text">{t("cancel.exitSurvey")}</h3>

        {/* Reason dropdown */}
        <div>
          <label className="block text-sm font-medium text-vytal-text mb-2">
            {t("cancel.reasonLabel")}
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
          >
            <option value="">{t("cancel.selectReason")}</option>
            {cancellationReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {t(r.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Additional feedback */}
        <div>
          <label className="block text-sm font-medium text-vytal-text mb-2">
            {t("cancel.additionalFeedback")}
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder={t("cancel.feedbackPlaceholder")}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30 resize-none"
          />
        </div>

        {/* Pause suggestion */}
        <div className="rounded-lg border border-vytal-blue/20 bg-vytal-blue/[0.05] p-4">
          <div className="flex items-start gap-3">
            <Pause className="h-5 w-5 text-vytal-blue shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-vytal-text">{t("cancel.pauseQuestion")}</p>
              <p className="mt-1 text-xs text-vytal-muted">{t("cancel.pauseDescription")}</p>
              <button
                onClick={() => setShowPauseOption(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-vytal-blue/10 px-3 py-1.5 text-xs font-semibold text-vytal-blue transition-colors hover:bg-vytal-blue/20"
              >
                <Pause className="h-3.5 w-3.5" />
                {t("cancel.pauseInstead")}
              </button>
            </div>
          </div>
        </div>

        {showPauseOption && (
          <div className="rounded-lg border border-vytal-green/20 bg-vytal-green/[0.03] p-4">
            <p className="text-sm text-vytal-muted mb-3">{t("cancel.pauseConfirmation")}</p>
            <button
              onClick={handlePause}
              className="inline-flex items-center gap-2 rounded-lg bg-vytal-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-vytal-blue/90"
            >
              <Pause className="h-4 w-4" />
              {t("cancel.confirmPause")}
            </button>
          </div>
        )}

        {/* What would bring you back */}
        <div>
          <label className="block text-sm font-medium text-vytal-text mb-2">
            {t("cancel.whatWouldBringBack")}
          </label>
          <textarea
            value={whatWouldBringBack}
            onChange={(e) => setWhatWouldBringBack(e.target.value)}
            rows={2}
            placeholder={t("cancel.bringBackPlaceholder")}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30 resize-none"
          />
        </div>
      </div>

      {/* Confirmation */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6 space-y-4">
        <h3 className="text-base font-bold text-vytal-text">{t("cancel.confirmation")}</h3>
        <p className="text-sm text-vytal-muted">
          {t("cancel.typeName").replace("{name}", member.name)}
        </p>
        <input
          type="text"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={member.name}
          className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Link
          href={`/members/${memberId}`}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <CheckCircle className="h-4 w-4" />
          {t("cancel.keepMembership")}
        </Link>
        <button
          onClick={handleCancel}
          disabled={!canConfirm}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <XCircle className="h-4 w-4" />
          {t("cancel.cancelMembership")}
        </button>
      </div>
    </div>
  );
}
