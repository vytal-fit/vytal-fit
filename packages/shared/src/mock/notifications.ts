import type { Notification } from "../types/models";

export const mockNotifications: Notification[] = [
  { id: "n-1", memberId: "m-1", type: "pr_achieved", title: "Novo PR!", body: "Muscle-Up: 5 reps (+2)", read: false, createdAt: "2026-06-02T18:30:00Z" },
  { id: "n-2", memberId: "m-1", type: "wod_published", title: "WOD Publicado", body: "FRAN - For Time: Thrusters & Pull-Ups", read: false, createdAt: "2026-06-02T20:00:00Z" },
  { id: "n-3", memberId: "m-1", type: "booking_confirmed", title: "Reserva Confirmada", body: "WOD amanha as 09:00 - Main Box", read: false, createdAt: "2026-06-02T15:00:00Z" },
  { id: "n-4", memberId: "m-1", type: "streak_milestone", title: "Streak! 12 semanas", body: "12 semanas consecutivas com pelo menos 1 check-in", read: true, createdAt: "2026-06-01T08:00:00Z" },
  { id: "n-5", memberId: "m-1", type: "class_reminder", title: "Lembrete", body: "WOD daqui a 1 hora - 09:00 Main Box", read: true, createdAt: "2026-06-01T08:00:00Z" },
  { id: "n-6", memberId: "m-1", type: "payment_success", title: "Pagamento Confirmado", body: "Mensalidade Livre - 75.00 EUR", read: true, createdAt: "2026-06-01T00:00:00Z" },
  { id: "n-7", memberId: "m-1", type: "booking_cancelled", title: "Reserva Cancelada", body: "Open Box sabado 10:00 foi cancelada pelo coach", read: false, createdAt: "2026-05-31T14:00:00Z" },
  { id: "n-8", memberId: "m-1", type: "wod_published", title: "WOD Publicado", body: "HEAVY DAY - Deadlift & Bench Press", read: true, createdAt: "2026-05-31T06:00:00Z" },
  { id: "n-9", memberId: "m-1", type: "pr_achieved", title: "Novo PR!", body: "Back Squat: 140kg (+5kg)", read: true, createdAt: "2026-05-28T17:45:00Z" },
  { id: "n-10", memberId: "m-1", type: "class_reminder", title: "Lembrete", body: "Strength amanha as 12:00 - Main Box", read: true, createdAt: "2026-05-27T20:00:00Z" },
  { id: "n-11", memberId: "m-1", type: "payment_failed", title: "Pagamento Falhado", body: "Tentativa de cobranca de 75.00 EUR falhou. Verifique o metodo de pagamento.", read: false, createdAt: "2026-05-25T09:00:00Z" },
  { id: "n-12", memberId: "m-1", type: "streak_milestone", title: "Streak! 10 semanas", body: "10 semanas consecutivas - continue assim!", read: true, createdAt: "2026-05-18T08:00:00Z" },
  { id: "n-13", memberId: "m-1", type: "booking_confirmed", title: "Reserva Confirmada", body: "Endurance segunda as 07:00 - Outdoor Zone", read: true, createdAt: "2026-05-16T22:00:00Z" },
  { id: "n-14", memberId: "m-1", type: "wod_published", title: "WOD Publicado", body: "CINDY - 20 min AMRAP: Pull-Ups, Push-Ups, Squats", read: true, createdAt: "2026-05-15T06:00:00Z" },
  { id: "n-15", memberId: "m-1", type: "pr_achieved", title: "Novo PR!", body: "Deadlift: 180kg (+5kg)", read: true, createdAt: "2026-05-15T18:00:00Z" },
];
