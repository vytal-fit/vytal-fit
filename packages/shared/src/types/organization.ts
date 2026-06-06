/**
 * Organization types and vertical-specific configuration.
 *
 * Vytal adapts its terminology, features, and UI based on the
 * organization type selected during onboarding.
 */

export type OrganizationType =
  | "crossfit_box"
  | "functional_training"
  | "gym"
  | "yoga_studio"
  | "pilates_studio"
  | "martial_arts"
  | "personal_training"
  | "swimming"
  | "dance_studio"
  | "health_club"
  | "sports_club"
  | "climbing_gym"
  | "cycling_studio"
  | "running_club"
  | "gymnastics_academy"
  | "rehabilitation"
  | "weightlifting_club"
  | "bootcamp"
  | "surf_water_sports"
  | "other";

export interface OrganizationTypeConfig {
  type: OrganizationType;
  label: string;
  icon: string;
  description: string;
  terminology: OrganizationTerminology;
  features: OrganizationFeatures;
  defaultClassTypes: string[];
  accentColor?: string;
}

/** Terminology adapts per vertical */
export interface OrganizationTerminology {
  organization: string;       // "Box" | "Studio" | "Gym" | "Academy" | "Club"
  organizationPlural: string; // "Boxes" | "Studios" | "Gyms"
  member: string;             // "Athlete" | "Student" | "Member" | "Practitioner"
  memberPlural: string;
  instructor: string;         // "Coach" | "Instructor" | "Trainer" | "Sensei" | "Teacher"
  instructorPlural: string;
  session: string;            // "WOD" | "Class" | "Session" | "Training" | "Lesson"
  sessionPlural: string;
  workout: string;            // "WOD" | "Workout" | "Routine" | "Flow" | "Kata"
  workoutPlural: string;
  result: string;             // "Score" | "Result" | "Performance"
  record: string;             // "PR" | "Personal Best" | "Record"
  checkin: string;            // "Check-in" | "Attendance" | "Presence"
  booking: string;            // "Booking" | "Reservation" | "Sign-up"
}

/** Feature flags per vertical */
export interface OrganizationFeatures {
  // Training & Programming
  wods: boolean;              // WOD builder, daily workouts
  leaderboard: boolean;       // Competition rankings
  personalRecords: boolean;   // PR tracking
  rxScaled: boolean;          // Rx/Scaled scoring
  timers: boolean;            // Workout timers (AMRAP, EMOM, etc.)
  rmCalculator: boolean;      // RM percentage calculator
  movementLibrary: boolean;   // Exercise video library
  groupClasses: boolean;      // Group class booking
  openGym: boolean;           // Open gym / free practice slots
  personalTraining: boolean;  // PT scheduling
  // Community & Engagement
  gamification: boolean;      // Streaks, medals, points
  fistbumps: boolean;         // Social reactions
  dropins: boolean;           // Cross-gym visits
  beltSystem: boolean;        // Graduations / belt ranks
  // Health & Wellness
  nutritionTracking: boolean; // Nutrition plans
  bodyComposition: boolean;   // Physical assessments
  // Operations & Management
  financials: boolean;        // Invoices, payments, revenue tracking
  payroll: boolean;           // Staff salaries & payroll
  crm: boolean;               // Lead management pipeline
  reports: boolean;           // Analytics & reports
  store: boolean;             // In-app store / POS
  communications: boolean;    // Email, SMS, push notifications
  automations: boolean;       // Automated workflows & campaigns
  tvDisplay: boolean;         // Gym screen/coachboard
  tasks: boolean;             // Task management
  support: boolean;           // Support tickets
  marketing: boolean;         // Social media scheduling
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  logo?: string;
  slogan?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country: string;
  timezone: string;
  currency: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}
