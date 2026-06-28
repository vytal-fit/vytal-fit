// ─── Member ───────────────────────────────────────────────
export type MemberStatus = "active" | "inactive" | "suspended" | "trial";

export interface Member {
  id: string;
  organizationId: string;
  memberNumber: number;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  gender?: "male" | "female";
  dateOfBirth?: string;
  nif?: string;
  emergencyContact?: string;
  status: MemberStatus;
  planId?: string;
  joinedAt: string;
  lastCheckIn?: string;
  streakWeeks: number;
  totalCheckIns: number;
}

// ─── Plans & Subscriptions ────────────────────────────────
export interface SubscriptionPlan {
  id: string;
  organizationId: string;
  name: string;
  type: "monthly" | "quarterly" | "semester" | "annual" | "session_pack" | "day_pass" | "trial";
  price: number;
  currency: string;
  sessionsPerWeek?: number;
  maxSessions?: number;
  allowedClassTypes: string[];
  active: boolean;
}

export interface Subscription {
  id: string;
  memberId: string;
  planId: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate?: string;
  status: "active" | "paused" | "cancelled" | "expired";
  sessionsUsed?: number;
  nextBillingDate?: string;
}

// ─── Classes & Booking ────────────────────────────────────
export interface Location {
  id: string;
  organizationId: string;
  name: string;
  capacity?: number;
}

export interface Coach {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  photo?: string;
  role: "head_coach" | "coach" | "assistant";
}

export interface ClassType {
  id: string;
  organizationId: string;
  name: string;
  abbreviation: string;
  color: string;
  icon?: string;
  active: boolean;
}

export interface Class {
  id: string;
  organizationId: string;
  classTypeId: string;
  classType: ClassType;
  locationId: string;
  location: Location;
  coachIds: string[];
  coaches: Coach[];
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  enrolledCount: number;
  waitlistCount: number;
}

export type BookingStatus = "confirmed" | "waitlisted" | "cancelled" | "checked_in" | "no_show";

export interface Booking {
  id: string;
  memberId: string;
  classId: string;
  class: Class;
  status: BookingStatus;
  bookedAt: string;
  checkedInAt?: string;
  qrCode?: string;
}

// ─── Workouts (WODs) ─────────────────────────────────────
export type WODType = "amrap" | "emom" | "for_time" | "tabata" | "strength" | "custom";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  videoUrl?: string;
  thumbnailUrl?: string;
  gifUrl?: string;
  description?: string;
  equipment?: string[];
  muscleGroups?: string[];
  scaledVariations?: string[];
  instructions?: ExerciseInstructions;
}

export interface ExerciseInstructions {
  pt: string[];
  en: string[];
  es: string[];
}

export type ExerciseCategory =
  | "weightlifting"
  | "gymnastics"
  | "cardio"
  | "strength"
  | "mobility"
  | "other";

export interface WODPart {
  name: string;
  type: WODType;
  timeCap?: number;
  rounds?: number;
  intervalSeconds?: number;
  exercises: Array<{
    exerciseId: string;
    exercise: Exercise;
    reps?: string;
    weight?: string;
    notes?: string;
  }>;
}

export interface WOD {
  id: string;
  organizationId: string;
  classTypeId: string;
  date: string;
  title?: string;
  description?: string;
  parts: WODPart[];
  publishedAt?: string;
  createdBy: string;
}

// ─── Results & Records ───────────────────────────────────
export interface WODResult {
  id: string;
  memberId: string;
  member: Pick<Member, "id" | "name" | "photo">;
  wodId: string;
  classId: string;
  score: string;
  scoreType: "time" | "rounds_reps" | "weight" | "reps" | "distance" | "calories";
  scale: "rx" | "scaled" | "rx_plus";
  isPR: boolean;
  rpe?: number;
  notes?: string;
  createdAt: string;
}

export interface PersonalRecord {
  id: string;
  memberId: string;
  exerciseId: string;
  exercise: Exercise;
  value: string;
  unit: "kg" | "lbs" | "time" | "reps" | "meters" | "calories";
  achievedAt: string;
  previousValue?: string;
}

export interface LeaderboardEntry {
  rank: number;
  memberId: string;
  memberName: string;
  memberPhoto?: string;
  score: string;
  scale: "rx" | "scaled" | "rx_plus";
  isPR: boolean;
}

// ─── CRM ─────────────────────────────────────────────────
export type LeadStage =
  | "lead"
  | "contacted"
  | "prospect"
  | "trial_booked"
  | "subscribed"
  | "lost";

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  source?: string;
  assignedCoachId?: string;
  notes?: string;
  createdAt: string;
  lastContactAt?: string;
  trialDate?: string;
}

// ─── Notifications ───────────────────────────────────────
export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "class_reminder"
  | "wod_published"
  | "pr_achieved"
  | "payment_success"
  | "payment_failed"
  | "streak_milestone";

export interface Notification {
  id: string;
  memberId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  todayClasses: number;
  occupancyPercent: number;
  monthlyRevenue: number;
  churnRate: number;
  atRiskMembers: number;
  pendingPayments: number;
  newMembersThisMonth: number;
  checkInsToday: number;
  prsToday: number;
}
