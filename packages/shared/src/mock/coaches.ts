import type { Coach } from "../types/models";

export const mockCoaches: Coach[] = [
  { id: "coach-1", organizationId: "org-1", name: "Andre Loureiro", email: "andre@vytal.fit", photo: undefined, role: "head_coach" },
  { id: "coach-2", organizationId: "org-1", name: "Marine Robba", email: "marine@vytal.fit", photo: undefined, role: "coach" },
  { id: "coach-3", organizationId: "org-1", name: "Ricardo Ribeiro", email: "ricardo@vytal.fit", photo: undefined, role: "coach" },
  { id: "coach-4", organizationId: "org-1", name: "Silvina Resende", email: "silvina@vytal.fit", photo: undefined, role: "assistant" },
];
