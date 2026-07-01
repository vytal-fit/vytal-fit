"use client";

import { useState } from "react";
import {
  Gift,
  Users,
  TrendingUp,
  DollarSign,
  Trophy,
  Copy,
  Check,
  Clock,
  Link2,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useDataStore, formatCurrency } from "@/stores/data-store";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-vytal-amber/10 text-vytal-amber",
  converted: "bg-vytal-green/10 text-vytal-green",
  expired: "bg-vytal-muted/10 text-vytal-muted",
};

export default function ReferralsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const orgSettings = useDataStore((s) => s.orgSettings);

  const referralsQuery = trpc.referrals.list.useQuery();
  const statsQuery = trpc.referrals.stats.useQuery();
  const referrals = referralsQuery.data ?? [];
  const stats = statsQuery.data;
  const topReferrers = stats?.topReferrers ?? [];

  const [copiedLink, setCopiedLink] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rewardType, setRewardType] = useState<"discount" | "free_month" | "credit">("discount");
  const [rewardValue, setRewardValue] = useState("10");
  const [rewardTarget, setRewardTarget] = useState<"referrer" | "both" | "referred">("both");
  const [autoApply, setAutoApply] = useState(true);

  const referralLink = `https://vytal.fit/${orgSettings.slug}/referral`;

  const totalReferrals = stats?.total ?? 0;
  const convertedReferrals = stats?.converted ?? 0;
  const rewardsPaid = stats?.rewardsPaid ?? 0;
  const conversionRate = stats?.conversionRate ?? 0;

  function handleCopyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast("Referral link copied to clipboard", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: "Referral Program" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">Referral Program</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Grow your gym through member referrals. Reward members for bringing friends.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <Settings className="h-4 w-4" />
          Program Settings
          <ChevronDown className={cn("h-4 w-4 transition-transform", showSettings && "rotate-180")} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Referrals", value: totalReferrals.toString(), icon: Users, color: "text-vytal-blue" },
          { label: "Converted", value: convertedReferrals.toString(), icon: TrendingUp, color: "text-vytal-green" },
          { label: "Rewards Paid", value: formatCurrency(rewardsPaid), icon: DollarSign, color: "text-vytal-amber" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: Gift, color: "text-vytal-purple" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-vytal-border bg-vytal-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("h-4 w-4", stat.color)} />
              <span className="text-xs text-vytal-muted">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-vytal-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Referral Settings</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Reward Type
              </label>
              <div className="space-y-2">
                {(["discount", "free_month", "credit"] as const).map((type) => (
                  <label
                    key={type}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                      rewardType === type
                        ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                        : "border-vytal-border bg-vytal-bg2 text-vytal-muted"
                    )}
                  >
                    <input
                      type="radio"
                      name="rewardType"
                      checked={rewardType === type}
                      onChange={() => setRewardType(type)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border-2",
                        rewardType === type
                          ? "border-vytal-green"
                          : "border-vytal-border"
                      )}
                    >
                      {rewardType === type && (
                        <div className="h-2 w-2 rounded-full bg-vytal-green" />
                      )}
                    </div>
                    {type === "discount"
                      ? "Discount"
                      : type === "free_month"
                      ? "Free Month"
                      : "Credit"}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Reward Value
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-vytal-muted">
                  {rewardType === "free_month" ? "months" : orgSettings.currency}
                </span>
                <input
                  type="number"
                  value={rewardValue}
                  onChange={(e) => setRewardValue(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Who Gets Reward
              </label>
              <div className="space-y-2">
                {(["referrer", "both", "referred"] as const).map((target) => (
                  <label
                    key={target}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                      rewardTarget === target
                        ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                        : "border-vytal-border bg-vytal-bg2 text-vytal-muted"
                    )}
                  >
                    <input
                      type="radio"
                      name="rewardTarget"
                      checked={rewardTarget === target}
                      onChange={() => setRewardTarget(target)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border-2",
                        rewardTarget === target
                          ? "border-vytal-green"
                          : "border-vytal-border"
                      )}
                    >
                      {rewardTarget === target && (
                        <div className="h-2 w-2 rounded-full bg-vytal-green" />
                      )}
                    </div>
                    {target === "referrer"
                      ? "Referrer Only"
                      : target === "both"
                      ? "Both"
                      : "Referred Only"}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Auto-Apply Rewards
              </label>
              <button
                onClick={() => setAutoApply(!autoApply)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  autoApply ? "bg-vytal-green" : "bg-vytal-bg3"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    autoApply ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
              <p className="mt-2 text-[10px] text-vytal-muted">
                {autoApply
                  ? "Rewards are applied automatically upon conversion"
                  : "Rewards must be applied manually"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Referral Link */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-vytal-green" />
          <span className="text-sm font-semibold text-vytal-text">Referral Link</span>
          <span className="text-xs text-vytal-muted">(unique per member)</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 font-mono text-sm text-vytal-text">
            {referralLink}
          </code>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            {copiedLink ? (
              <><Check className="h-4 w-4" /> Copied</>
            ) : (
              <><Copy className="h-4 w-4" /> Copy</>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Referrers Leaderboard */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-vytal-amber" />
            <h2 className="text-lg font-semibold text-vytal-text">Top Referrers</h2>
          </div>
          <div className="space-y-3">
            {topReferrers.map((referrer, idx) => (
              <div
                key={referrer.name}
                className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-bg2 p-3"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    idx === 0
                      ? "bg-vytal-amber/10 text-vytal-amber"
                      : idx === 1
                      ? "bg-vytal-muted/10 text-vytal-muted"
                      : idx === 2
                      ? "bg-vytal-orange/10 text-vytal-orange"
                      : "bg-vytal-bg3 text-vytal-muted"
                  )}
                >
                  {idx + 1}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10">
                  <span className="text-xs font-bold text-vytal-green">
                    {referrer.initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-vytal-text truncate">{referrer.name}</p>
                  <p className="text-[10px] text-vytal-muted">
                    {referrer.referrals} referrals / {referrer.converted} converted
                  </p>
                </div>
                <span className="text-sm font-semibold text-vytal-green">
                  {formatCurrency(Number(referrer.rewardEarned))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Referrals Table */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">Recent Referrals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-vytal-border">
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    Referrer
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    Referred Person
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    Status
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vytal-border">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="transition-colors hover:bg-vytal-bg3">
                    <td className="py-2.5 text-sm text-vytal-text">{ref.referrerName}</td>
                    <td className="py-2.5">
                      <div>
                        <p className="text-sm text-vytal-text">{ref.referredName}</p>
                        <p className="text-[10px] text-vytal-muted">{ref.referredEmail}</p>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          statusColors[ref.status]
                        )}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-vytal-muted" />
                        <span className="text-xs text-vytal-muted">
                          {new Date(ref.createdAt).toISOString().split("T")[0]}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
