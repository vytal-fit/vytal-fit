import type { Lead } from "../types/models";

export const mockLeads: Lead[] = [
  { id: "lead-1", organizationId: "org-1", name: "Carlos Mendes", email: "carlos.m@email.com", phone: "912111222", stage: "lead", source: "Instagram", createdAt: "2026-06-01T10:00:00Z" },
  { id: "lead-2", organizationId: "org-1", name: "Rita Sousa", email: "rita.s@email.com", phone: "913222333", stage: "lead", source: "Website", createdAt: "2026-06-02T14:30:00Z" },
  { id: "lead-3", organizationId: "org-1", name: "Bruno Pereira", email: "bruno.p@email.com", phone: "914333444", stage: "contacted", source: "Referral", assignedCoachId: "coach-1", createdAt: "2026-05-28T09:00:00Z", lastContactAt: "2026-05-30T11:00:00Z" },
  { id: "lead-4", organizationId: "org-1", name: "Mariana Lopes", email: "mariana.l@email.com", phone: "915444555", stage: "contacted", source: "Facebook", assignedCoachId: "coach-2", createdAt: "2026-05-25T16:00:00Z", lastContactAt: "2026-05-29T10:00:00Z" },
  { id: "lead-5", organizationId: "org-1", name: "Diogo Martins", email: "diogo.m@email.com", phone: "916555666", stage: "prospect", source: "Walk-in", assignedCoachId: "coach-1", createdAt: "2026-05-20T11:00:00Z", lastContactAt: "2026-06-01T15:00:00Z", trialDate: "2026-06-05" },
  { id: "lead-6", organizationId: "org-1", name: "Catarina Reis", email: "catarina.r@email.com", phone: "917666777", stage: "prospect", source: "Instagram", assignedCoachId: "coach-3", createdAt: "2026-05-18T13:00:00Z", lastContactAt: "2026-06-02T09:00:00Z", trialDate: "2026-06-04" },
  { id: "lead-7", organizationId: "org-1", name: "Joao Barbosa", email: "joao.b@email.com", phone: "918777888", stage: "trial_booked", source: "Website", assignedCoachId: "coach-2", createdAt: "2026-05-15T10:00:00Z", lastContactAt: "2026-06-01T14:00:00Z", trialDate: "2026-06-03" },
  { id: "lead-8", organizationId: "org-1", name: "Francisca Nunes", email: "francisca.n@email.com", phone: "919888999", stage: "trial_booked", source: "Referral", assignedCoachId: "coach-1", createdAt: "2026-05-10T08:00:00Z", lastContactAt: "2026-05-31T16:00:00Z", trialDate: "2026-06-03" },
  { id: "lead-9", organizationId: "org-1", name: "Andre Tavares", email: "andre.t@email.com", phone: "911999000", stage: "subscribed", source: "Walk-in", assignedCoachId: "coach-1", createdAt: "2026-04-20T12:00:00Z", lastContactAt: "2026-05-25T10:00:00Z" },
  { id: "lead-10", organizationId: "org-1", name: "Beatriz Correia", email: "beatriz.c@email.com", phone: "912000111", stage: "lost", source: "Facebook", notes: "Too expensive", createdAt: "2026-04-15T11:00:00Z", lastContactAt: "2026-05-20T09:00:00Z" },
  { id: "lead-11", organizationId: "org-1", name: "Rui Goncalves", email: "rui.g@email.com", phone: "913111222", stage: "lost", source: "Instagram", notes: "Moved to another city", createdAt: "2026-04-10T14:00:00Z", lastContactAt: "2026-05-15T11:00:00Z" },
  { id: "lead-12", organizationId: "org-1", name: "Helena Cardoso", email: "helena.c@email.com", phone: "914222333", stage: "lead", source: "Flyers", createdAt: "2026-06-03T08:00:00Z" },
];
