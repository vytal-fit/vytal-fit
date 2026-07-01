"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  Users,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Breadcrumbs } from "@/components/breadcrumbs";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= rating ? "fill-vytal-amber text-vytal-amber" : "text-vytal-muted/30"
          )}
        />
      ))}
    </div>
  );
}

export default function ClassFeedbackPage() {
  const { t } = useI18n();
  const params = useParams();
  const classId = params.id as string;

  const classQuery = trpc.classes.byId.useQuery({ id: classId });
  const classTypesQuery = trpc.classTypes.list.useQuery();
  const classTypeName = classQuery.data
    ? classTypesQuery.data?.find((ct) => ct.id === classQuery.data!.classTypeId)?.name
    : undefined;
  const cls = classQuery.data
    ? { ...classQuery.data, classType: { name: classTypeName } }
    : undefined;

  const feedbackQuery = trpc.classes.feedback.useQuery({ classId });
  const fb = feedbackQuery.data;
  const avgRating = fb?.average ?? 0;
  const totalResponses = fb?.count ?? 0;
  const responseRate = fb?.responseRate ?? 0;
  const ratingDistribution = fb?.distribution ?? [];
  const feedbackItems = fb?.items ?? [];
  const maxCount = Math.max(1, ...ratingDistribution.map((r) => r.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: t("nav.classes"), href: "/classes" },
              { label: cls?.classType?.name ?? t("feedback.classDetail"), href: `/classes/${classId}` },
              { label: t("feedback.title") },
            ]}
          />
          <p className="mt-1 text-sm text-vytal-muted">{t("feedback.subtitle")}</p>
        </div>
        <Link
          href={`/classes/${classId}`}
          className="flex items-center gap-2 rounded-lg border border-vytal-border px-3 py-2 text-sm font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("feedback.backToClass")}
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Star className="h-4.5 w-4.5 text-vytal-amber" />
            </div>
            <span className="text-sm text-vytal-muted">{t("feedback.avgRating")}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-vytal-text">{avgRating}</span>
            <span className="mb-1 text-sm text-vytal-muted">/ 5</span>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <MessageSquare className="h-4.5 w-4.5 text-vytal-green" />
            </div>
            <span className="text-sm text-vytal-muted">{t("feedback.responses")}</span>
          </div>
          <span className="text-3xl font-bold text-vytal-text">{totalResponses}</span>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-blue/10">
              <Users className="h-4.5 w-4.5 text-vytal-blue" />
            </div>
            <span className="text-sm text-vytal-muted">{t("feedback.responseRate")}</span>
          </div>
          <span className="text-3xl font-bold text-vytal-text">{responseRate}%</span>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <h3 className="text-base font-bold text-vytal-text mb-4">{t("feedback.distribution")}</h3>
        <div className="space-y-2">
          {ratingDistribution.map((r) => (
            <div key={r.stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-vytal-text">{r.stars}</span>
                <Star className="h-3.5 w-3.5 fill-vytal-amber text-vytal-amber" />
              </div>
              <div className="flex-1 h-6 rounded-full bg-vytal-bg3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-vytal-amber/80 transition-all"
                  style={{ width: maxCount > 0 ? `${(r.count / maxCount) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-8 text-right text-sm text-vytal-muted">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/[0.03] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vytal-green/10">
            <Sparkles className="h-4.5 w-4.5 text-vytal-green" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-vytal-text">{t("feedback.aiInsights")}</h3>
            <p className="mt-1 text-sm text-vytal-muted">{t("feedback.insightText")}</p>
          </div>
        </div>
      </div>

      {/* Individual responses */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <h3 className="text-base font-bold text-vytal-text mb-4">
          {t("feedback.individualResponses")}
        </h3>
        <div className="space-y-4">
          {feedbackItems.length === 0 && (
            <p className="text-sm text-vytal-muted">{t("feedback.empty")}</p>
          )}
          {feedbackItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-vytal-border p-4 transition-colors hover:bg-vytal-bg3/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-bg3 text-xs font-bold text-vytal-muted">
                    {item.memberName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-sm font-semibold text-vytal-text">{item.memberName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating rating={item.rating} />
                  <span className="text-xs text-vytal-muted">
                    {new Date(item.createdAt).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
              {item.comment && <p className="text-sm text-vytal-muted pl-11">{item.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
