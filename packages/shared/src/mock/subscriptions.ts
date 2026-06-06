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
  // Active Unlimited (plan-1)
  { id: "sub-1", memberId: "m-1", planId: "plan-1", plan: mockPlans[0], startDate: "2024-01-15", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-2", memberId: "m-2", planId: "plan-1", plan: mockPlans[0], startDate: "2024-03-01", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-6", memberId: "m-7", planId: "plan-1", plan: mockPlans[0], startDate: "2024-11-05", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-8", memberId: "m-9", planId: "plan-1", plan: mockPlans[0], startDate: "2024-02-10", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-9", memberId: "m-10", planId: "plan-1", plan: mockPlans[0], startDate: "2024-08-15", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-12", memberId: "m-12", planId: "plan-1", plan: mockPlans[0], startDate: "2024-05-20", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-13", memberId: "m-13", planId: "plan-1", plan: mockPlans[0], startDate: "2024-09-10", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-15", memberId: "m-15", planId: "plan-1", plan: mockPlans[0], startDate: "2024-04-01", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-17", memberId: "m-17", planId: "plan-1", plan: mockPlans[0], startDate: "2024-07-20", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-24", memberId: "m-24", planId: "plan-1", plan: mockPlans[0], startDate: "2024-03-20", status: "active", nextBillingDate: "2026-07-01" },

  // 13 Sessions (plan-2)
  { id: "sub-3", memberId: "m-3", planId: "plan-2", plan: mockPlans[1], startDate: "2024-06-10", status: "active", sessionsUsed: 8, nextBillingDate: "2026-07-01" },
  { id: "sub-7", memberId: "m-8", planId: "plan-2", plan: mockPlans[1], startDate: "2025-04-12", status: "active", sessionsUsed: 5, nextBillingDate: "2026-07-01" },
  { id: "sub-10", memberId: "m-11", planId: "plan-2", plan: mockPlans[1], startDate: "2025-02-01", status: "active", sessionsUsed: 10, nextBillingDate: "2026-07-01" },
  { id: "sub-16", memberId: "m-16", planId: "plan-2", plan: mockPlans[1], startDate: "2025-01-05", status: "active", sessionsUsed: 7, nextBillingDate: "2026-07-01" },
  { id: "sub-18", memberId: "m-18", planId: "plan-2", plan: mockPlans[1], startDate: "2025-05-10", status: "active", sessionsUsed: 3, nextBillingDate: "2026-07-01" },
  { id: "sub-25", memberId: "m-25", planId: "plan-2", plan: mockPlans[1], startDate: "2025-08-15", status: "active", sessionsUsed: 9, nextBillingDate: "2026-07-01" },

  // 9 Sessions (plan-3)
  { id: "sub-4", memberId: "m-4", planId: "plan-3", plan: mockPlans[2], startDate: "2025-01-20", status: "active", sessionsUsed: 6, nextBillingDate: "2026-07-01" },
  { id: "sub-14", memberId: "m-14", planId: "plan-3", plan: mockPlans[2], startDate: "2025-03-15", status: "active", sessionsUsed: 4, nextBillingDate: "2026-07-01" },
  { id: "sub-23", memberId: "m-23", planId: "plan-3", plan: mockPlans[2], startDate: "2025-06-01", status: "active", sessionsUsed: 2, nextBillingDate: "2026-07-01" },

  // Trial
  { id: "sub-5", memberId: "m-5", planId: "plan-6", plan: mockPlans[5], startDate: "2026-05-15", endDate: "2026-06-14", status: "active", sessionsUsed: 6 },
  { id: "sub-19", memberId: "m-19", planId: "plan-6", plan: mockPlans[5], startDate: "2026-06-01", endDate: "2026-06-30", status: "active", sessionsUsed: 3 },
  { id: "sub-20", memberId: "m-20", planId: "plan-6", plan: mockPlans[5], startDate: "2026-06-03", endDate: "2026-07-02", status: "active", sessionsUsed: 2 },

  // Cancelled/Expired
  { id: "sub-21", memberId: "m-21", planId: "plan-2", plan: mockPlans[1], startDate: "2024-10-15", endDate: "2026-03-15", status: "cancelled" },
  { id: "sub-22", memberId: "m-22", planId: "plan-1", plan: mockPlans[0], startDate: "2024-12-01", status: "paused", nextBillingDate: "2026-06-01" },

  // Semester
  { id: "sub-26", memberId: "m-6", planId: "plan-4", plan: mockPlans[3], startDate: "2023-09-01", endDate: "2026-03-01", status: "expired" },
];
