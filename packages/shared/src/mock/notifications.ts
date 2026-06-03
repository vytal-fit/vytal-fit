import type { Notification } from "../types/models";

export const mockNotifications: Notification[] = [
  { id: "n-1", memberId: "m-1", type: "pr_achieved", title: "Novo PR!", body: "Muscle-Up: 5 reps (+2)", read: false, createdAt: "2026-06-02T18:30:00Z" },
  { id: "n-2", memberId: "m-1", type: "wod_published", title: "WOD Publicado", body: "FRAN - For Time: Thrusters & Pull-Ups", read: false, createdAt: "2026-06-02T20:00:00Z" },
  { id: "n-3", memberId: "m-1", type: "booking_confirmed", title: "Reserva Confirmada", body: "WOD amanha as 09:00 - Main Box", read: true, createdAt: "2026-06-02T15:00:00Z" },
  { id: "n-4", memberId: "m-1", type: "streak_milestone", title: "Streak! 12 semanas", body: "12 semanas consecutivas com pelo menos 1 check-in", read: true, createdAt: "2026-06-01T08:00:00Z" },
  { id: "n-5", memberId: "m-1", type: "class_reminder", title: "Lembrete", body: "WOD daqui a 1 hora - 09:00 Main Box", read: true, createdAt: "2026-06-01T08:00:00Z" },
  { id: "n-6", memberId: "m-1", type: "payment_success", title: "Pagamento Confirmado", body: "Mensalidade Livre - 75.00 EUR", read: true, createdAt: "2026-06-01T00:00:00Z" },
];
