import { mockExercises } from "./mock/exercises";
import type { Exercise } from "./types/models";

export const exerciseCatalog: readonly Exercise[] = mockExercises;

export function listExercises(): readonly Exercise[] {
  return exerciseCatalog;
}

export function getExerciseById(id: string): Exercise | undefined {
  return exerciseCatalog.find((exercise) => exercise.id === id);
}

export function hasExercise(id: string): boolean {
  return exerciseCatalog.some((exercise) => exercise.id === id);
}
