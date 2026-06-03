import type { Member } from "../types/models";

export const mockMembers: Member[] = [
  { id: "m-1", organizationId: "org-1", memberNumber: 1, name: "Jose Fonte", email: "jose@example.com", phone: "912345678", status: "active", gender: "male", joinedAt: "2024-01-15", lastCheckIn: "2026-06-02", streakWeeks: 12, totalCheckIns: 342 },
  { id: "m-2", organizationId: "org-1", memberNumber: 2, name: "Ana Silva", email: "ana@example.com", phone: "913456789", status: "active", gender: "female", joinedAt: "2024-03-01", lastCheckIn: "2026-06-03", streakWeeks: 8, totalCheckIns: 215 },
  { id: "m-3", organizationId: "org-1", memberNumber: 3, name: "Miguel Costa", email: "miguel@example.com", phone: "914567890", status: "active", gender: "male", joinedAt: "2024-06-10", lastCheckIn: "2026-06-01", streakWeeks: 5, totalCheckIns: 178 },
  { id: "m-4", organizationId: "org-1", memberNumber: 4, name: "Sofia Santos", email: "sofia@example.com", phone: "915678901", status: "active", gender: "female", joinedAt: "2025-01-20", lastCheckIn: "2026-05-30", streakWeeks: 3, totalCheckIns: 89 },
  { id: "m-5", organizationId: "org-1", memberNumber: 5, name: "Tiago Neves", email: "tiago@example.com", phone: "916789012", status: "trial", gender: "male", joinedAt: "2026-05-15", lastCheckIn: "2026-06-02", streakWeeks: 2, totalCheckIns: 6 },
  { id: "m-6", organizationId: "org-1", memberNumber: 6, name: "Maria Oliveira", email: "maria@example.com", phone: "917890123", status: "inactive", gender: "female", joinedAt: "2023-09-01", lastCheckIn: "2026-04-10", streakWeeks: 0, totalCheckIns: 450 },
  { id: "m-7", organizationId: "org-1", memberNumber: 7, name: "Pedro Almeida", email: "pedro@example.com", phone: "918901234", status: "active", gender: "male", joinedAt: "2024-11-05", lastCheckIn: "2026-06-03", streakWeeks: 15, totalCheckIns: 260 },
  { id: "m-8", organizationId: "org-1", memberNumber: 8, name: "Ines Ferreira", email: "ines@example.com", phone: "919012345", status: "active", gender: "female", joinedAt: "2025-04-12", lastCheckIn: "2026-06-02", streakWeeks: 6, totalCheckIns: 95 },
];
