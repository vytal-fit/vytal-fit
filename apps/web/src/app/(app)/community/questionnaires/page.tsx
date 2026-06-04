"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  ClipboardList,
  Plus,
  Trash2,
  GripVertical,
  X,
  Star,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QuestionType = "rating" | "multiple_choice" | "text" | "yes_no" | "scale";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface MockResponse {
  respondentName: string;
  date: string;
  answers: Record<string, string | number>;
}

interface Questionnaire {
  id: string;
  title: string;
  questions: Question[];
  responses: number;
  lastSent: string;
  active: boolean;
  avgRating: number;
  completionRate: number;
  mockResponses: MockResponse[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const questionTypeLabels: Record<QuestionType, string> = {
  rating: "Rating (1-5)",
  multiple_choice: "Multiple Choice",
  text: "Text",
  yes_no: "Yes/No",
  scale: "Scale (1-10)",
};

const questionTypeColors: Record<QuestionType, string> = {
  rating: "bg-vytal-amber/10 text-vytal-amber",
  multiple_choice: "bg-vytal-blue/10 text-vytal-blue",
  text: "bg-vytal-purple/10 text-vytal-purple",
  yes_no: "bg-vytal-green/10 text-vytal-green",
  scale: "bg-vytal-red/10 text-vytal-red",
};

const initialQuestionnaires: Questionnaire[] = [
  {
    id: "q-1",
    title: "Trial Class Feedback",
    questions: [
      { id: "q1-1", text: "How would you rate the overall experience?", type: "rating" },
      { id: "q1-2", text: "What did you enjoy most?", type: "multiple_choice", options: ["Coaching", "Atmosphere", "Workout", "Community"] },
      { id: "q1-3", text: "Would you recommend us to a friend?", type: "yes_no" },
      { id: "q1-4", text: "Any suggestions for improvement?", type: "text" },
    ],
    responses: 42,
    lastSent: "2026-06-01",
    active: true,
    avgRating: 4.6,
    completionRate: 87,
    mockResponses: [
      { respondentName: "Ana Silva", date: "2026-06-01", answers: { "q1-1": 5, "q1-2": "Coaching", "q1-3": "Yes", "q1-4": "Great energy!" } },
      { respondentName: "Pedro Almeida", date: "2026-05-30", answers: { "q1-1": 4, "q1-2": "Workout", "q1-3": "Yes", "q1-4": "More warm-up time" } },
      { respondentName: "Miguel Costa", date: "2026-05-28", answers: { "q1-1": 5, "q1-2": "Community", "q1-3": "Yes", "q1-4": "" } },
      { respondentName: "Sofia Santos", date: "2026-05-25", answers: { "q1-1": 4, "q1-2": "Atmosphere", "q1-3": "Yes", "q1-4": "Loved the music" } },
      { respondentName: "Tiago Neves", date: "2026-05-23", answers: { "q1-1": 3, "q1-2": "Coaching", "q1-3": "No", "q1-4": "Felt a bit lost" } },
    ],
  },
  {
    id: "q-2",
    title: "Monthly Satisfaction",
    questions: [
      { id: "q2-1", text: "Rate your satisfaction this month", type: "scale" },
      { id: "q2-2", text: "Are you meeting your fitness goals?", type: "yes_no" },
      { id: "q2-3", text: "How would you rate coach quality?", type: "rating" },
    ],
    responses: 78,
    lastSent: "2026-05-31",
    active: true,
    avgRating: 4.2,
    completionRate: 72,
    mockResponses: [
      { respondentName: "Jose Fonte", date: "2026-05-31", answers: { "q2-1": 8, "q2-2": "Yes", "q2-3": 5 } },
      { respondentName: "Ines Ferreira", date: "2026-05-31", answers: { "q2-1": 7, "q2-2": "Yes", "q2-3": 4 } },
      { respondentName: "Maria Oliveira", date: "2026-05-30", answers: { "q2-1": 9, "q2-2": "No", "q2-3": 4 } },
      { respondentName: "Ana Silva", date: "2026-05-30", answers: { "q2-1": 6, "q2-2": "Yes", "q2-3": 3 } },
      { respondentName: "Pedro Almeida", date: "2026-05-29", answers: { "q2-1": 8, "q2-2": "Yes", "q2-3": 5 } },
    ],
  },
  {
    id: "q-3",
    title: "Health & Habits",
    questions: [
      { id: "q3-1", text: "How many hours of sleep per night?", type: "scale" },
      { id: "q3-2", text: "Do you follow a nutrition plan?", type: "yes_no" },
      { id: "q3-3", text: "Rate your energy levels", type: "rating" },
      { id: "q3-4", text: "What are your biggest challenges?", type: "text" },
    ],
    responses: 31,
    lastSent: "2026-05-15",
    active: false,
    avgRating: 3.8,
    completionRate: 65,
    mockResponses: [
      { respondentName: "Miguel Costa", date: "2026-05-15", answers: { "q3-1": 7, "q3-2": "Yes", "q3-3": 4, "q3-4": "Time management" } },
      { respondentName: "Sofia Santos", date: "2026-05-14", answers: { "q3-1": 6, "q3-2": "No", "q3-3": 3, "q3-4": "Nutrition consistency" } },
      { respondentName: "Tiago Neves", date: "2026-05-14", answers: { "q3-1": 8, "q3-2": "Yes", "q3-3": 5, "q3-4": "Recovery" } },
      { respondentName: "Jose Fonte", date: "2026-05-13", answers: { "q3-1": 5, "q3-2": "No", "q3-3": 3, "q3-4": "Motivation" } },
      { respondentName: "Ines Ferreira", date: "2026-05-13", answers: { "q3-1": 7, "q3-2": "Yes", "q3-3": 4, "q3-4": "Flexibility" } },
    ],
  },
  {
    id: "q-4",
    title: "Coach Evaluation",
    questions: [
      { id: "q4-1", text: "Rate the coach's knowledge", type: "rating" },
      { id: "q4-2", text: "Rate the coach's communication", type: "rating" },
      { id: "q4-3", text: "Would you attend this coach's class again?", type: "yes_no" },
    ],
    responses: 56,
    lastSent: "2026-05-28",
    active: true,
    avgRating: 4.4,
    completionRate: 91,
    mockResponses: [
      { respondentName: "Ana Silva", date: "2026-05-28", answers: { "q4-1": 5, "q4-2": 4, "q4-3": "Yes" } },
      { respondentName: "Pedro Almeida", date: "2026-05-27", answers: { "q4-1": 4, "q4-2": 5, "q4-3": "Yes" } },
      { respondentName: "Maria Oliveira", date: "2026-05-27", answers: { "q4-1": 5, "q4-2": 5, "q4-3": "Yes" } },
      { respondentName: "Miguel Costa", date: "2026-05-26", answers: { "q4-1": 3, "q4-2": 4, "q4-3": "Yes" } },
      { respondentName: "Sofia Santos", date: "2026-05-25", answers: { "q4-1": 4, "q4-2": 4, "q4-3": "No" } },
    ],
  },
];

let qIdCounter = 10;

export default function QuestionnairesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(initialQuestionnaires);
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewResponsesId, setViewResponsesId] = useState<string | null>(null);
  const [builderTitle, setBuilderTitle] = useState("");
  const [builderQuestions, setBuilderQuestions] = useState<Question[]>([
    { id: `bq-1`, text: "How would you rate the experience?", type: "rating" },
    { id: `bq-2`, text: "What could we improve?", type: "text" },
    { id: `bq-3`, text: "Would you recommend us?", type: "yes_no" },
  ]);

  const toggleActive = useCallback(
    (id: string) => {
      setQuestionnaires((prev) =>
        prev.map((q) => (q.id === id ? { ...q, active: !q.active } : q))
      );
      toast(t("questionnaires.statusUpdated"), "success");
    },
    [toast, t]
  );

  function addQuestion() {
    setBuilderQuestions((prev) => [
      ...prev,
      {
        id: `bq-${qIdCounter++}`,
        text: "",
        type: "rating",
      },
    ]);
  }

  function removeQuestion(id: string) {
    setBuilderQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setBuilderQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }

  function handleCreate() {
    if (!builderTitle.trim()) {
      toast(t("questionnaires.titleRequired"), "error");
      return;
    }
    const newQ: Questionnaire = {
      id: `q-${Date.now()}`,
      title: builderTitle.trim(),
      questions: builderQuestions.filter((q) => q.text.trim()),
      responses: 0,
      lastSent: "---",
      active: false,
      avgRating: 0,
      completionRate: 0,
      mockResponses: [],
    };
    setQuestionnaires((prev) => [newQ, ...prev]);
    setShowBuilder(false);
    setBuilderTitle("");
    setBuilderQuestions([
      { id: `bq-${qIdCounter++}`, text: "", type: "rating" },
    ]);
    toast(t("questionnaires.created"), "success");
  }

  const viewQuestionnaire = viewResponsesId
    ? questionnaires.find((q) => q.id === viewResponsesId)
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.community"), href: "/community" },
          { label: t("nav.questionnaires") },
        ]}
      />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("questionnaires.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("questionnaires.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          {showBuilder ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {showBuilder
            ? t("action.cancel")
            : t("questionnaires.createQuestionnaire")}
        </button>
      </div>

      {/* Builder */}
      {showBuilder && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-green">
            {t("questionnaires.newQuestionnaire")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("questionnaires.questionnaireTitle")}
              </label>
              <input
                type="text"
                value={builderTitle}
                onChange={(e) => setBuilderTitle(e.target.value)}
                placeholder="e.g., Post-Class Feedback"
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("questionnaires.questions")}
              </label>
              <div className="space-y-2">
                {builderQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 p-3"
                  >
                    <GripVertical className="mt-2 h-3.5 w-3.5 shrink-0 cursor-grab text-vytal-muted/50" />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(q.id, { text: e.target.value })
                        }
                        placeholder={t("questionnaires.questionPlaceholder")}
                        className="w-full rounded border border-vytal-border bg-vytal-bg px-2 py-1.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                      />
                      <select
                        value={q.type}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            type: e.target.value as QuestionType,
                          })
                        }
                        className="rounded border border-vytal-border bg-vytal-bg px-2 py-1 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none"
                      >
                        {Object.entries(questionTypeLabels).map(
                          ([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <span
                      className={cn(
                        "mt-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        questionTypeColors[q.type]
                      )}
                    >
                      {questionTypeLabels[q.type]}
                    </span>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="mt-1.5 flex h-6 w-6 items-center justify-center rounded text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addQuestion}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-vytal-border py-3 text-sm text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
              >
                <Plus className="h-4 w-4" />
                {t("questionnaires.addQuestion")}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreate}
                className="rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
              >
                {t("action.create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questionnaire Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {questionnaires.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-vytal-green" />
                <h3 className="text-sm font-semibold text-vytal-text">
                  {q.title}
                </h3>
              </div>
              {/* Active toggle */}
              <button
                onClick={() => toggleActive(q.id)}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  q.active ? "bg-vytal-green" : "bg-vytal-bg3"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                    q.active ? "left-[18px]" : "left-0.5"
                  )}
                />
              </button>
            </div>

            <div className="mb-3 flex items-center gap-4 text-xs text-vytal-muted">
              <span>
                {q.questions.length} {t("questionnaires.questionsCount")}
              </span>
              <span>
                {q.responses} {t("questionnaires.responsesCount")}
              </span>
              <span>
                {t("questionnaires.lastSent")}: {q.lastSent}
              </span>
            </div>

            {/* Results summary */}
            <div className="mb-3 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-vytal-bg2 p-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 text-vytal-amber" />
                  <span className="text-sm font-bold text-vytal-text">
                    {q.avgRating > 0 ? q.avgRating.toFixed(1) : "---"}
                  </span>
                </div>
                <p className="text-[10px] text-vytal-muted">
                  {t("questionnaires.avgRating")}
                </p>
              </div>
              <div className="rounded-lg bg-vytal-bg2 p-2 text-center">
                <span className="text-sm font-bold text-vytal-text">
                  {q.responses}
                </span>
                <p className="text-[10px] text-vytal-muted">
                  {t("questionnaires.responses")}
                </p>
              </div>
              <div className="rounded-lg bg-vytal-bg2 p-2 text-center">
                <span className="text-sm font-bold text-vytal-text">
                  {q.completionRate > 0 ? `${q.completionRate}%` : "---"}
                </span>
                <p className="text-[10px] text-vytal-muted">
                  {t("questionnaires.completion")}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setViewResponsesId(viewResponsesId === q.id ? null : q.id)
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-vytal-border py-2 text-xs font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            >
              <Eye className="h-3 w-3" />
              {t("questionnaires.viewResponses")}
              {viewResponsesId === q.id ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {/* Expanded responses */}
            {viewResponsesId === q.id && (
              <div className="mt-3 space-y-2 border-t border-vytal-border pt-3">
                {q.mockResponses.length > 0 ? (
                  q.mockResponses.map((resp, ri) => (
                    <div
                      key={ri}
                      className="rounded-lg border border-vytal-border bg-vytal-bg2 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-vytal-text">
                          {resp.respondentName}
                        </span>
                        <span className="text-[10px] text-vytal-muted">
                          {resp.date}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {q.questions.map((question) => (
                          <div
                            key={question.id}
                            className="flex items-start gap-2 text-xs"
                          >
                            <span className="shrink-0 text-vytal-muted">
                              {question.text}:
                            </span>
                            <span className="font-medium text-vytal-text">
                              {resp.answers[question.id] !== undefined
                                ? String(resp.answers[question.id])
                                : "---"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-vytal-muted">
                    {t("questionnaires.noResponses")}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
