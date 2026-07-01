import { describe, expect, it } from "vitest";
import { ORGANIZATION_CONFIGS, ORGANIZATION_TYPE_LIST } from "../src/types/verticals";
import type { OrganizationType } from "../src/types/organization";

const ALL_TYPES: OrganizationType[] = [
  "crossfit_box",
  "functional_training",
  "gym",
  "yoga_studio",
  "pilates_studio",
  "martial_arts",
  "personal_training",
  "swimming",
  "dance_studio",
  "health_club",
  "sports_club",
  "climbing_gym",
  "cycling_studio",
  "running_club",
  "gymnastics_academy",
  "rehabilitation",
  "weightlifting_club",
  "bootcamp",
  "surf_water_sports",
  "other",
];

const TERMINOLOGY_KEYS = [
  "organization",
  "organizationPlural",
  "member",
  "memberPlural",
  "instructor",
  "instructorPlural",
  "session",
  "sessionPlural",
  "workout",
  "workoutPlural",
  "result",
  "record",
  "checkin",
  "booking",
] as const;

const FEATURE_KEYS = [
  "wods",
  "leaderboard",
  "personalRecords",
  "rxScaled",
  "timers",
  "rmCalculator",
  "movementLibrary",
  "groupClasses",
  "openGym",
  "personalTraining",
  "community",
  "gamification",
  "fistbumps",
  "dropins",
  "beltSystem",
  "nutritionTracking",
  "bodyComposition",
  "financials",
  "payroll",
  "crm",
  "reports",
  "store",
  "communications",
  "automations",
  "tvDisplay",
  "tasks",
  "support",
  "marketing",
] as const;

describe("ORGANIZATION_CONFIGS", () => {
  it("covers all 20 OrganizationType values", () => {
    expect(ALL_TYPES).toHaveLength(20);
    expect(Object.keys(ORGANIZATION_CONFIGS).sort()).toEqual([...ALL_TYPES].sort());
  });

  it.each(ALL_TYPES)("%s config is self-consistent", (type) => {
    const config = ORGANIZATION_CONFIGS[type];
    expect(config).toBeDefined();
    expect(config!.type).toBe(type);
    expect(config!.label).toBeTruthy();
    expect(config!.icon).toBeTruthy();
    expect(config!.description).toBeTruthy();
    expect(config!.defaultClassTypes.length).toBeGreaterThan(0);
  });

  it.each(ALL_TYPES)("%s has complete, non-empty terminology", (type) => {
    const terminology = ORGANIZATION_CONFIGS[type]!.terminology;
    for (const key of TERMINOLOGY_KEYS) {
      expect(terminology[key], `${type}.terminology.${key}`).toBeTruthy();
      expect(typeof terminology[key]).toBe("string");
    }
  });

  it.each(ALL_TYPES)("%s defines every feature flag as a boolean", (type) => {
    const features = ORGANIZATION_CONFIGS[type]!.features;
    for (const key of FEATURE_KEYS) {
      expect(typeof features[key], `${type}.features.${key}`).toBe("boolean");
    }
  });
});

describe("ORGANIZATION_TYPE_LIST", () => {
  it("lists every config exactly once", () => {
    expect(ORGANIZATION_TYPE_LIST).toHaveLength(20);
    expect(ORGANIZATION_TYPE_LIST.map((c) => c.type).sort()).toEqual(
      [...ALL_TYPES].sort(),
    );
  });
});
