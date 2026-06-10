/**
 * Referential integrity of the mock dataset: every cross-reference between
 * mock collections must resolve, so screens built on the mocks never render
 * dangling ids.
 */
import { describe, expect, it } from "vitest";
import {
  mockClasses,
  mockClassTypes,
  mockCoaches,
  mockExercises,
  mockLeads,
  mockLocations,
  mockMembers,
  mockPersonalRecords,
  mockPlans,
  mockSubscriptions,
  mockWODs,
} from "../src/mock";

const exerciseIds = new Set(mockExercises.map((e) => e.id));
const memberIds = new Set(mockMembers.map((m) => m.id));
const planIds = new Set(mockPlans.map((p) => p.id));
const coachIds = new Set(mockCoaches.map((c) => c.id));
const classTypeIds = new Set(mockClassTypes.map((ct) => ct.id));
const locationIds = new Set(mockLocations.map((l) => l.id));

describe("mockWODs", () => {
  it("every exercise id exists in mockExercises", () => {
    for (const wod of mockWODs) {
      for (const part of wod.parts) {
        for (const exercise of part.exercises) {
          expect(
            exerciseIds.has(exercise.exerciseId),
            `WOD ${wod.id} references missing exercise ${exercise.exerciseId}`,
          ).toBe(true);
          expect(exercise.exercise, `WOD ${wod.id} has an unhydrated exercise`).toBeDefined();
          expect(exercise.exercise.id).toBe(exercise.exerciseId);
        }
      }
    }
  });

  it("every WOD references a valid class type", () => {
    for (const wod of mockWODs) {
      expect(
        classTypeIds.has(wod.classTypeId),
        `WOD ${wod.id} references missing class type ${wod.classTypeId}`,
      ).toBe(true);
    }
  });
});

describe("mockSubscriptions", () => {
  it("every subscription references a valid plan", () => {
    for (const sub of mockSubscriptions) {
      expect(
        planIds.has(sub.planId),
        `Subscription ${sub.id} references missing plan ${sub.planId}`,
      ).toBe(true);
      expect(sub.plan.id, `Subscription ${sub.id} hydrated plan mismatch`).toBe(sub.planId);
    }
  });

  it("every subscription references a valid member", () => {
    for (const sub of mockSubscriptions) {
      expect(
        memberIds.has(sub.memberId),
        `Subscription ${sub.id} references missing member ${sub.memberId}`,
      ).toBe(true);
    }
  });
});

describe("mockMembers", () => {
  it("every member planId (when set) references a valid plan", () => {
    for (const member of mockMembers) {
      if (member.planId) {
        expect(
          planIds.has(member.planId),
          `Member ${member.id} references missing plan ${member.planId}`,
        ).toBe(true);
      }
    }
  });
});

describe("mockClasses", () => {
  it("every class references valid coaches, class types and locations", () => {
    for (const klass of mockClasses) {
      expect(
        classTypeIds.has(klass.classTypeId),
        `Class ${klass.id} references missing class type ${klass.classTypeId}`,
      ).toBe(true);
      expect(klass.classType.id).toBe(klass.classTypeId);

      expect(
        locationIds.has(klass.locationId),
        `Class ${klass.id} references missing location ${klass.locationId}`,
      ).toBe(true);
      expect(klass.location.id).toBe(klass.locationId);

      for (const coachId of klass.coachIds) {
        expect(
          coachIds.has(coachId),
          `Class ${klass.id} references missing coach ${coachId}`,
        ).toBe(true);
      }
      expect(klass.coaches.map((c) => c.id).sort()).toEqual([...klass.coachIds].sort());
    }
  });
});

describe("mockPersonalRecords", () => {
  it("every PR references a valid member and exercise", () => {
    for (const pr of mockPersonalRecords) {
      expect(
        memberIds.has(pr.memberId),
        `PR ${pr.id} references missing member ${pr.memberId}`,
      ).toBe(true);
      expect(
        exerciseIds.has(pr.exerciseId),
        `PR ${pr.id} references missing exercise ${pr.exerciseId}`,
      ).toBe(true);
      expect(pr.exercise.id).toBe(pr.exerciseId);
    }
  });
});

describe("mockLeads", () => {
  it("every assigned coach (when set) references a valid coach", () => {
    for (const lead of mockLeads) {
      if (lead.assignedCoachId) {
        expect(
          coachIds.has(lead.assignedCoachId),
          `Lead ${lead.id} references missing coach ${lead.assignedCoachId}`,
        ).toBe(true);
      }
    }
  });
});

describe("mockPlans", () => {
  it("every allowed class type references a valid class type", () => {
    for (const plan of mockPlans) {
      for (const classTypeId of plan.allowedClassTypes) {
        expect(
          classTypeIds.has(classTypeId),
          `Plan ${plan.id} references missing class type ${classTypeId}`,
        ).toBe(true);
      }
    }
  });
});
