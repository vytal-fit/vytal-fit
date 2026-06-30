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

interface FeedbackResponse {
  id: string;
  memberName: string;
  rating: number;
  comment: string;
  date: string;
}

const mockFeedback: FeedbackResponse[] = [
  { id: "fb-1", memberName: "Ana Silva", rating: 5, comment: "Excelente aula! O coach foi muito atencioso e motivador.", date: "2026-06-03" },
  { id: "fb-2", memberName: "Pedro Almeida", rating: 5, comment: "Melhor WOD que ja fiz. Intenso mas muito bem estruturado.", date: "2026-06-03" },
  { id: "fb-3", memberName: "Sofia Santos", rating: 4, comment: "Boa aula, mas o aquecimento podia ser mais longo.", date: "2026-06-03" },
  { id: "fb-4", memberName: "Tiago Neves", rating: 5, comment: "Adorei a energia do coach Andre!", date: "2026-06-02" },
  { id: "fb-5", memberName: "Catarina Reis", rating: 5, comment: "Superou as minhas expectativas. Vou voltar amanha!", date: "2026-06-02" },
  { id: "fb-6", memberName: "Diogo Martins", rating: 4, comment: "Bom treino, musica podia ser melhor.", date: "2026-06-02" },
  { id: "fb-7", memberName: "Helena Cardoso", rating: 3, comment: "Aula ok, mas estava demasiado lotada.", date: "2026-06-01" },
  { id: "fb-8", memberName: "Miguel Costa", rating: 5, comment: "Coach Andre e o melhor! Sempre a motivar.", date: "2026-06-01" },
  { id: "fb-9", memberName: "Francisca Nunes", rating: 4, comment: "Gostei muito, bom mix de exercicios.", date: "2026-06-01" },
  { id: "fb-10", memberName: "Rui Goncalves", rating: 5, comment: "Top! Senti-me muito bem depois do treino.", date: "2026-05-31" },
  { id: "fb-11", memberName: "Ines Ferreira", rating: 2, comment: "O coach chegou atrasado e a aula foi curta.", date: "2026-05-31" },
  { id: "fb-12", memberName: "Jose Fonte", rating: 5, comment: "Perfeito como sempre. Obrigado Andre!", date: "2026-05-30" },
  { id: "fb-13", memberName: "Maria Oliveira", rating: 4, comment: "Muito boa, recomendo a todos.", date: "2026-05-30" },
  { id: "fb-14", memberName: "Bruno Lopes", rating: 5, comment: "Aula fantastica, sai completamente destruido!", date: "2026-05-30" },
];

const ratingDistribution = [
  { stars: 5, count: 8 },
  { stars: 4, count: 4 },
  { stars: 3, count: 1 },
  { stars: 2, count: 1 },
  { stars: 1, count: 0 },
];

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

  const avgRating = 4.7;
  const totalResponses = 14;
  const responseRate = 78;
  const maxCount = Math.max(...ratingDistribution.map((r) => r.count));

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
          {mockFeedback.map((fb) => (
            <div
              key={fb.id}
              className="rounded-lg border border-vytal-border p-4 transition-colors hover:bg-vytal-bg3/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-bg3 text-xs font-bold text-vytal-muted">
                    {fb.memberName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-sm font-semibold text-vytal-text">{fb.memberName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating rating={fb.rating} />
                  <span className="text-xs text-vytal-muted">
                    {new Date(fb.date).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-vytal-muted pl-11">{fb.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
