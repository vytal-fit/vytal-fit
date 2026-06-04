import type { WOD } from "../types/models";
import { mockExercises } from "./exercises";

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const ex = (id: string) => mockExercises.find((e) => e.id === id)!;

export const mockWODs: WOD[] = [
  {
    id: "wod-1",
    organizationId: "org-1",
    classTypeId: "ct-1",
    date: today,
    title: "FRAN",
    description: "Classic CrossFit benchmark. Go fast, go unbroken.",
    parts: [
      {
        name: "Warm Up",
        type: "custom",
        exercises: [
          { exerciseId: "ex-41", exercise: ex("ex-41"), reps: "400m", notes: "Easy pace" },
          { exerciseId: "ex-1", exercise: ex("ex-1"), reps: "3x5", weight: "Empty bar", notes: "Build up" },
          { exerciseId: "ex-45", exercise: ex("ex-45"), reps: "50", notes: "Singles ok" },
        ],
      },
      {
        name: "Strength",
        type: "strength",
        exercises: [
          { exerciseId: "ex-1", exercise: ex("ex-1"), reps: "5-5-3-3-1-1", weight: "Build to heavy single" },
        ],
      },
      {
        name: "WOD",
        type: "for_time",
        timeCap: 10,
        exercises: [
          { exerciseId: "ex-100", exercise: ex("ex-100"), reps: "21-15-9", weight: "43/30 kg" },
          { exerciseId: "ex-21", exercise: ex("ex-21"), reps: "21-15-9" },
        ],
      },
      {
        name: "Cool Down",
        type: "custom",
        exercises: [
          { exerciseId: "ex-41", exercise: ex("ex-41"), reps: "200m", notes: "Walk" },
        ],
      },
    ],
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
    createdBy: "coach-1",
  },
  {
    id: "wod-2",
    organizationId: "org-1",
    classTypeId: "ct-3",
    date: today,
    title: "HEAVY DAY",
    description: "Strength focus. Rest 2-3 min between sets.",
    parts: [
      {
        name: "Warm Up",
        type: "custom",
        exercises: [
          { exerciseId: "ex-42", exercise: ex("ex-42"), reps: "500m" },
          { exerciseId: "ex-3", exercise: ex("ex-3"), reps: "3x5", weight: "Light", notes: "Tempo 3-1-1" },
        ],
      },
      {
        name: "Strength",
        type: "strength",
        exercises: [
          { exerciseId: "ex-3", exercise: ex("ex-3"), reps: "5-5-5-3-3", weight: "Build to 85% 1RM" },
          { exerciseId: "ex-17", exercise: ex("ex-17"), reps: "5-5-5-3-3", weight: "Build to 85% 1RM" },
        ],
      },
      {
        name: "Accessory",
        type: "emom",
        rounds: 12,
        intervalSeconds: 60,
        exercises: [
          { exerciseId: "ex-82", exercise: ex("ex-82"), reps: "15", weight: "24/16 kg", notes: "Min 1" },
          { exerciseId: "ex-28", exercise: ex("ex-28"), reps: "10", notes: "Min 2" },
          { exerciseId: "ex-81", exercise: ex("ex-81"), reps: "12", weight: "9/6 kg", notes: "Min 3" },
        ],
      },
    ],
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
    createdBy: "coach-3",
  },
  {
    id: "wod-3",
    organizationId: "org-1",
    classTypeId: "ct-1",
    date: yesterday,
    title: "CINDY",
    description: "20 min AMRAP of bodyweight movements. Pace yourself.",
    parts: [
      {
        name: "WOD",
        type: "amrap",
        timeCap: 20,
        exercises: [
          { exerciseId: "ex-21", exercise: ex("ex-21"), reps: "5" },
          { exerciseId: "ex-47", exercise: ex("ex-47"), reps: "10", notes: "Push-ups" },
          { exerciseId: "ex-1", exercise: ex("ex-1"), reps: "15", notes: "Air squats" },
        ],
      },
    ],
    publishedAt: new Date(Date.now() - 129600000).toISOString(),
    createdBy: "coach-2",
  },
];
