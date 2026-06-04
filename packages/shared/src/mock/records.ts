import type { PersonalRecord } from "../types/models";
import { mockExercises } from "./exercises";

const ex = (id: string) => mockExercises.find((e) => e.id === id)!;

export const mockPersonalRecords: PersonalRecord[] = [
  { id: "pr-1", memberId: "m-1", exerciseId: "ex-1", exercise: ex("ex-1"), value: "140", unit: "kg", achievedAt: "2026-05-28", previousValue: "135" },
  { id: "pr-2", memberId: "m-1", exerciseId: "ex-3", exercise: ex("ex-3"), value: "180", unit: "kg", achievedAt: "2026-05-15", previousValue: "175" },
  { id: "pr-3", memberId: "m-1", exerciseId: "ex-4", exercise: ex("ex-4"), value: "105", unit: "kg", achievedAt: "2026-06-01", previousValue: "100" },
  { id: "pr-4", memberId: "m-1", exerciseId: "ex-5", exercise: ex("ex-5"), value: "80", unit: "kg", achievedAt: "2026-04-20", previousValue: "77.5" },
  { id: "pr-5", memberId: "m-1", exerciseId: "ex-17", exercise: ex("ex-17"), value: "110", unit: "kg", achievedAt: "2026-05-10" },
  { id: "pr-6", memberId: "m-1", exerciseId: "ex-10", exercise: ex("ex-10"), value: "72.5", unit: "kg", achievedAt: "2026-05-22", previousValue: "70" },
  { id: "pr-7", memberId: "m-1", exerciseId: "ex-100", exercise: ex("ex-100"), value: "85", unit: "kg", achievedAt: "2026-04-10" },
  { id: "pr-8", memberId: "m-1", exerciseId: "ex-21", exercise: ex("ex-21"), value: "32", unit: "reps", achievedAt: "2026-05-30", previousValue: "28" },
  { id: "pr-9", memberId: "m-1", exerciseId: "ex-24", exercise: ex("ex-24"), value: "5", unit: "reps", achievedAt: "2026-06-02", previousValue: "3" },
  { id: "pr-10", memberId: "m-1", exerciseId: "ex-45", exercise: ex("ex-45"), value: "127", unit: "reps", achievedAt: "2026-05-05", previousValue: "110" },
];
