import type { LeaderboardEntry } from "../types/models";

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, memberId: "m-7", memberName: "Pedro Almeida", score: "2:47", scale: "rx", isPR: true },
  { rank: 2, memberId: "m-1", memberName: "Jose Fonte", score: "3:12", scale: "rx", isPR: false },
  { rank: 3, memberId: "m-3", memberName: "Miguel Costa", score: "3:28", scale: "rx", isPR: true },
  { rank: 4, memberId: "m-2", memberName: "Ana Silva", score: "3:45", scale: "rx", isPR: false },
  { rank: 5, memberId: "m-8", memberName: "Ines Ferreira", score: "4:01", scale: "rx", isPR: true },
  { rank: 6, memberId: "m-4", memberName: "Sofia Santos", score: "4:22", scale: "scaled", isPR: false },
  { rank: 7, memberId: "m-5", memberName: "Tiago Neves", score: "5:10", scale: "scaled", isPR: true },
];
