import type { SubscriptionPlan, Subscription } from "../types/models";

export const mockPlans: SubscriptionPlan[] = [
  { id: "plan-1", organizationId: "org-1", name: "Livre", type: "monthly", price: 75, currency: "EUR", allowedClassTypes: ["ct-1", "ct-2", "ct-3", "ct-4", "ct-5", "ct-6"], active: true },
  { id: "plan-2", organizationId: "org-1", name: "13 Treinos/Mes", type: "monthly", price: 60, currency: "EUR", maxSessions: 13, allowedClassTypes: ["ct-1", "ct-2", "ct-3"], active: true },
  { id: "plan-3", organizationId: "org-1", name: "9 Treinos/Mes", type: "monthly", price: 50, currency: "EUR", maxSessions: 9, allowedClassTypes: ["ct-1", "ct-2"], active: true },
  { id: "plan-4", organizationId: "org-1", name: "Semestral Livre", type: "semester", price: 390, currency: "EUR", allowedClassTypes: ["ct-1", "ct-2", "ct-3", "ct-4", "ct-5", "ct-6"], active: true },
  { id: "plan-5", organizationId: "org-1", name: "Pack 10 Vouchers", type: "session_pack", price: 100, currency: "EUR", maxSessions: 10, allowedClassTypes: ["ct-1", "ct-2"], active: true },
  { id: "plan-6", organizationId: "org-1", name: "Trial 30 Dias", type: "trial", price: 29.90, currency: "EUR", allowedClassTypes: ["ct-1", "ct-2"], active: true },
  { id: "plan-7", organizationId: "org-1", name: "CF Teens", type: "monthly", price: 40, currency: "EUR", allowedClassTypes: ["ct-7"], active: true },
  { id: "plan-8", organizationId: "org-1", name: "Day Pass", type: "day_pass", price: 15, currency: "EUR", allowedClassTypes: ["ct-1", "ct-2"], active: true },
];

export const mockSubscriptions: Subscription[] = [
  { id: "sub-1", memberId: "m-1", planId: "plan-1", plan: mockPlans[0], startDate: "2024-01-15", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-2", memberId: "m-2", planId: "plan-1", plan: mockPlans[0], startDate: "2024-03-01", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-3", memberId: "m-3", planId: "plan-2", plan: mockPlans[1], startDate: "2024-06-10", status: "active", sessionsUsed: 8, nextBillingDate: "2026-07-01" },
  { id: "sub-4", memberId: "m-4", planId: "plan-3", plan: mockPlans[2], startDate: "2025-01-20", status: "active", sessionsUsed: 6, nextBillingDate: "2026-07-01" },
  { id: "sub-5", memberId: "m-5", planId: "plan-6", plan: mockPlans[5], startDate: "2026-05-15", endDate: "2026-06-14", status: "active", sessionsUsed: 6 },
  { id: "sub-6", memberId: "m-7", planId: "plan-4", plan: mockPlans[3], startDate: "2025-07-01", endDate: "2026-01-01", status: "active" },
  { id: "sub-7", memberId: "m-8", planId: "plan-2", plan: mockPlans[1], startDate: "2025-04-12", status: "active", sessionsUsed: 5, nextBillingDate: "2026-07-01" },
];
