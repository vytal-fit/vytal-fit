import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { TRPCClientError } from "@trpc/client";
import {
  STORAGE_KEYS,
  type OrganizationFeatures,
  type UserWithOrgs,
} from "@vytal-fit/shared";
import { api } from "./trpc";

/** True when a tRPC error carries the given server error code (e.g. NOT_FOUND). */
function isTRPCCode(error: unknown, code: string): boolean {
  return error instanceof TRPCClientError && error.data?.code === code;
}

const AUTH_TOKEN_KEY = STORAGE_KEYS.authToken;
const AUTH_SNAPSHOT_KEY = STORAGE_KEYS.authSnapshot;

type RequestBody = Record<string, unknown>;

export class AuthRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    emailVerified?: boolean;
    createdAt: string | Date;
  };
  session: {
    activeOrganizationId?: string | null;
  };
}

export interface AuthOrganization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: unknown;
}

export interface AuthFullOrganization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: unknown;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    createdAt: string | Date;
  } | null | undefined>;
}

export type AuthUserSnapshot = UserWithOrgs;

export interface BookingRecord {
  id: string;
  classId: string;
  memberId: string;
  status: string;
  bookedAt?: string;
  checkedInAt?: string | null;
  class?: {
    id: string;
    classTypeId: string;
    classType: {
      id: string;
      name: string;
      abbreviation: string;
      color: string;
    } | null;
    locationId: string;
    location: {
      id: string;
      name: string;
    } | null;
    coaches: Array<{
      id: string;
      name: string;
    } | null | undefined>;
    date: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    cancelledAt?: string | Date | null;
    enrolledCount: number;
    waitlistCount: number;
  } | null;
}

export interface PersonalRecordItem {
  id: string;
  memberId: string;
  exerciseId: string;
  value: string;
  unit: string;
  achievedAt?: string | Date;
  previousValue?: string | null;
  notes?: string | null;
  exercise?: {
    id: string;
    name: string;
    category: string;
  } | null;
}

export interface WodResultItem {
  id: string;
  wodId: string;
  memberId: string;
  classId?: string | null;
  score: string;
  scoreType: string;
  scale: string;
  isPR: boolean;
  rpe?: number | null;
  notes?: string | null;
  wod?: {
    id: string;
    title: string;
    date: string;
    type: string;
    classTypeId: string;
  } | null;
}

export interface ClassScheduleItem {
  id: string;
  classTypeId: string | null;
  locationId: string | null;
  coachIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  cancelledAt?: string | Date | null;
  classType: {
    id: string;
    name: string;
    abbreviation: string;
    color: string;
  } | null;
  location: {
    id: string;
    name: string;
  } | null;
  coaches: Array<{
    id: string;
    name: string;
  }>;
  enrolledCount: number;
  waitlistCount: number;
}

export interface WodPartExercise {
  exerciseId: string;
  reps?: string;
  weight?: string;
  notes?: string;
}

export interface WodPart {
  name: string;
  type: "amrap" | "emom" | "for_time" | "tabata" | "strength" | "custom" | string;
  timeCap?: number;
  rounds?: number;
  intervalSeconds?: number;
  exercises: WodPartExercise[];
}

export interface WodItem {
  id: string;
  organizationId: string;
  classTypeId: string;
  date: string;
  title?: string | null;
  description?: string | null;
  parts: WodPart[];
  publishedAt?: string | Date | null;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  gifUrl?: string;
  description?: string;
  equipment?: string[];
  muscleGroups?: string[];
  scaledVariations?: string[];
}

export interface WellnessCheckinItem {
  id: string;
  organizationId: string;
  memberId: string;
  date: string;
  sleep?: number | null;
  fatigue?: number | null;
  stress?: number | null;
  mood?: number | null;
  notes?: string | null;
}

export interface MemberItem {
  id: string;
  organizationId: string | null;
  userId?: string | null;
  memberNumber: number;
  name: string;
  email: string;
  phone?: string | null;
  photo?: string | null;
  status: string;
  planId?: string | null;
  joinedAt?: string | Date | null;
  lastCheckIn?: string | Date | null;
  streakWeeks: number;
  totalCheckIns: number;
}

export interface SubscriptionItem {
  id: string;
  organizationId: string;
  memberId: string;
  planId: string;
  status: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  nextBillingDate?: string | Date | null;
}

export interface SubscriptionPlanItem {
  id: string;
  organizationId: string;
  name: string;
  price: number | string;
  active: boolean;
}

export interface CommunityFeedItem {
  id: string;
  authorName: string;
  authorType: string;
  kind: string;
  content: string;
  pinned: boolean;
  createdAt: string | Date;
  fistbumps: number;
  hasReacted: boolean;
  commentCount: number;
}

export interface CommunityStats {
  checkInsThisWeek: number;
  prsThisWeek: number;
  activeToday: number;
  leaderboard: Array<{ name: string; initials: string; checkIns: number }>;
  athleteOfMonth: {
    name: string;
    initials: string;
    checkIns: number;
    streak: number;
  } | null;
}

export interface CoachItem {
  id: string;
  name: string;
  role: string;
  email?: string;
  photo?: string | null;
}

export interface ClassRosterEntry {
  id: string;
  memberId: string;
  classId: string;
  status: string;
  bookedAt?: string | Date | null;
  checkedInAt?: string | Date | null;
  memberName: string;
  memberNumber: number;
  memberEmail: string;
}

export interface CommunityCommentItem {
  id: string;
  authorName: string;
  authorType: string;
  content: string;
  createdAt: string | Date;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  memberId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string | Date;
}

export interface MediaAssetItem {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  folder: string;
  url?: string | null;
  sizeBytes: number;
  uploadedBy?: string | null;
  createdAt: string | Date;
}

let authToken: string | null = null;

function getBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  return Platform.select({
    android: "http://10.0.2.2:3000",
    ios: "http://127.0.0.1:3000",
    default: "http://127.0.0.1:3000",
  })!;
}

function joinPath(path: string): string {
  return `${getBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function readStorage(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function writeStorage(key: string, value: string | null): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (!globalThis.localStorage) return;
      if (value === null) globalThis.localStorage.removeItem(key);
      else globalThis.localStorage.setItem(key, value);
    } catch {
      // ignore storage failures on web/private mode
    }
    return;
  }

  if (value === null) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function loadAuthToken(): Promise<string | null> {
  return readStorage(AUTH_TOKEN_KEY);
}

export async function persistAuthToken(token: string | null): Promise<void> {
  authToken = token;
  await writeStorage(AUTH_TOKEN_KEY, token);
}

export async function loadAuthSnapshot(): Promise<AuthUserSnapshot | null> {
  const raw = await readStorage(AUTH_SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUserSnapshot;
  } catch {
    return null;
  }
}

export async function persistAuthSnapshot(snapshot: AuthUserSnapshot | null): Promise<void> {
  await writeStorage(AUTH_SNAPSHOT_KEY, snapshot ? JSON.stringify(snapshot) : null);
}

function buildHeaders(includeJson = true, includeAuth = true): Headers {
  const headers = new Headers();
  if (includeJson) headers.set("Content-Type", "application/json");
  if (includeAuth && authToken) headers.set("Authorization", `Bearer ${authToken}`);
  return headers;
}

async function requestJson<T>(
  path: string,
  init: { method?: string; body?: RequestBody | null; includeAuth?: boolean } = {},
): Promise<{ data: T; setAuthToken: string | null }> {
  const response = await fetch(joinPath(path), {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: buildHeaders(Boolean(init.body), init.includeAuth ?? true),
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  const text = await response.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : (null as T);
  } catch {
    throw new AuthRequestError(`Invalid JSON response from ${path}`, response.status);
  }
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? String((data as { message: string }).message)
        : `Request failed (${response.status})`;
    throw new AuthRequestError(message, response.status);
  }

  return {
    data,
    setAuthToken: response.headers.get("set-auth-token"),
  };
}

export async function signIn(email: string, password: string): Promise<{ token: string | null; user: AuthSession["user"] }> {
  const { data, setAuthToken } = await requestJson<{ token: string; user: AuthSession["user"] }>(
    "/auth/sign-in/email",
    { body: { email, password }, includeAuth: false },
  );

  const token = setAuthToken ?? data.token ?? null;
  await persistAuthToken(token);
  return { token, user: data.user };
}

export async function signUp(name: string, email: string, password: string): Promise<{ token: string | null; user: AuthSession["user"] }> {
  const { data, setAuthToken } = await requestJson<{ token: string | null; user: AuthSession["user"] }>(
    "/auth/sign-up/email",
    { body: { name, email, password }, includeAuth: false },
  );

  const token = setAuthToken ?? data.token ?? null;
  await persistAuthToken(token);
  return { token, user: data.user };
}

export async function fetchSession(): Promise<AuthSession | null> {
  if (!authToken) {
    authToken = await loadAuthToken();
  }
  if (!authToken) return null;

  try {
    const { data } = await requestJson<AuthSession>("/auth/session", {
      method: "GET",
    });
    return data;
  } catch (error) {
    if (error instanceof AuthRequestError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

export async function listOrganizations(): Promise<AuthOrganization[]> {
  const { data } = await requestJson<AuthOrganization[]>("/organizations", {
    method: "GET",
  });
  return data;
}

export async function getFullOrganization(
  organizationId: string,
): Promise<AuthFullOrganization | null> {
  try {
    const { data } = await requestJson<AuthFullOrganization | null>(
      `/organizations/${organizationId}`,
      { method: "GET" },
    );
    return data;
  } catch (error) {
    if (error instanceof AuthRequestError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export interface OrgSettingsResponse {
  features: OrganizationFeatures;
  [key: string]: unknown;
}

export async function getOrgSettings(orgId: string): Promise<OrgSettingsResponse> {
  const { data } = await requestJson<OrgSettingsResponse>(
    `/org-settings/${orgId}`,
    { method: "GET" },
  );
  return data;
}

export async function updateActiveSpace(spaceId: string): Promise<void> {
  await requestJson("/me/session", {
    method: "PATCH",
    body: { activeOrganizationId: spaceId },
  });
}

export async function setActiveOrganization(organizationId: string): Promise<void> {
  await updateActiveSpace(organizationId);
}

export async function listMemberBookings(memberId: string): Promise<BookingRecord[]> {
  return (await api.bookings.listByMember.query({ memberId })) as unknown as BookingRecord[];
}

export async function bookClass(classId: string, memberId: string): Promise<BookingRecord> {
  return (await api.bookings.book.mutate({ classId, memberId })) as unknown as BookingRecord;
}

export async function cancelBooking(bookingId: string): Promise<BookingRecord> {
  // Router input key is `id` (not `bookingId`).
  return (await api.bookings.cancel.mutate({ id: bookingId })) as unknown as BookingRecord;
}

export async function listPersonalRecords(memberId: string, exerciseId?: string): Promise<PersonalRecordItem[]> {
  const res = await api.personalRecords.list.query({ memberId, exerciseId });
  return res.items as unknown as PersonalRecordItem[];
}

export async function createPersonalRecord(
  input: Omit<PersonalRecordItem, "id">,
): Promise<PersonalRecordItem> {
  return (await api.personalRecords.create.mutate(
    input as unknown as Parameters<typeof api.personalRecords.create.mutate>[0],
  )) as unknown as PersonalRecordItem;
}

export async function updatePersonalRecord(
  id: string,
  input: Partial<Omit<PersonalRecordItem, "id" | "memberId" | "exerciseId">> & {
    memberId?: string;
    exerciseId?: string;
  },
): Promise<PersonalRecordItem> {
  // Router shape: { id, data: {...} }.
  return (await api.personalRecords.update.mutate({
    id,
    data: input as unknown as Parameters<typeof api.personalRecords.update.mutate>[0]["data"],
  })) as unknown as PersonalRecordItem;
}

export async function listWodResults(memberId: string, wodId?: string): Promise<WodResultItem[]> {
  const res = await api.wodResults.list.query({ memberId, wodId });
  return res.items as unknown as WodResultItem[];
}

export async function createWodResult(
  input: Omit<WodResultItem, "id">,
): Promise<WodResultItem> {
  return (await api.wodResults.create.mutate(
    input as unknown as Parameters<typeof api.wodResults.create.mutate>[0],
  )) as unknown as WodResultItem;
}

export async function updateWodResult(
  id: string,
  input: Partial<Omit<WodResultItem, "id" | "memberId" | "wodId">> & {
    memberId?: string;
    wodId?: string;
  },
): Promise<WodResultItem> {
  // Router shape: { id, data: {...} }.
  return (await api.wodResults.update.mutate({
    id,
    data: input as unknown as Parameters<typeof api.wodResults.update.mutate>[0]["data"],
  })) as unknown as WodResultItem;
}

export async function listClassSchedule(from: string, to: string): Promise<ClassScheduleItem[]> {
  return (await api.classes.schedule.query({ from, to })) as unknown as ClassScheduleItem[];
}

export async function listWods(from?: string, to?: string): Promise<WodItem[]> {
  return (await api.wods.list.query({ from, to })) as unknown as WodItem[];
}

export async function getWod(id: string): Promise<WodItem | null> {
  try {
    return (await api.wods.byId.query({ id })) as unknown as WodItem;
  } catch (error) {
    if (isTRPCCode(error, "NOT_FOUND")) return null;
    throw error;
  }
}

export async function listExercises(category?: string): Promise<ExerciseItem[]> {
  const input = { category } as unknown as Parameters<typeof api.exercises.list.query>[0];
  return (await api.exercises.list.query(input)) as unknown as ExerciseItem[];
}

export async function listWellnessCheckins(memberId: string, limit = 50): Promise<WellnessCheckinItem[]> {
  const res = await api.wellnessCheckins.list.query({ memberId, limit });
  return res.items as unknown as WellnessCheckinItem[];
}

export async function upsertWellnessCheckin(
  input: {
    memberId: string;
    date?: string;
    sleep?: number;
    fatigue?: number;
    stress?: number;
    mood?: number;
    notes?: string;
  },
): Promise<WellnessCheckinItem> {
  return (await api.wellnessCheckins.upsert.mutate(input)) as unknown as WellnessCheckinItem;
}

export async function getMyMember(): Promise<MemberItem | null> {
  return (await api.members.me.query()) as unknown as MemberItem | null;
}

export async function listMemberSubscriptions(memberId: string): Promise<SubscriptionItem[]> {
  return (await api.subscriptions.byMember.query({ memberId })) as unknown as SubscriptionItem[];
}

export async function listSubscriptionPlans(activeOnly = false): Promise<SubscriptionPlanItem[]> {
  return (await api.subscriptions.plans.list.query({ activeOnly })) as unknown as SubscriptionPlanItem[];
}

export async function getCommunityFeed(limit = 60): Promise<CommunityFeedItem[]> {
  return (await api.community.feed.query({ limit })) as unknown as CommunityFeedItem[];
}

export async function getCommunityStats(): Promise<CommunityStats> {
  return (await api.community.stats.query()) as unknown as CommunityStats;
}

export async function listCoaches(): Promise<CoachItem[]> {
  return (await api.coaches.list.query()) as unknown as CoachItem[];
}

export async function getCoach(id: string): Promise<CoachItem | null> {
  try {
    return (await api.coaches.byId.query({ id })) as unknown as CoachItem;
  } catch (error) {
    if (isTRPCCode(error, "NOT_FOUND")) return null;
    throw error;
  }
}

export async function getClass(id: string): Promise<ClassScheduleItem | null> {
  try {
    return (await api.classes.byId.query({ id })) as unknown as ClassScheduleItem;
  } catch (error) {
    if (isTRPCCode(error, "NOT_FOUND")) return null;
    throw error;
  }
}

export async function listBookingsByClass(classId: string): Promise<ClassRosterEntry[]> {
  return (await api.bookings.listByClass.query({ classId })) as unknown as ClassRosterEntry[];
}

export async function getCommunityComments(postId: string): Promise<CommunityCommentItem[]> {
  return (await api.community.comments.query({ postId })) as unknown as CommunityCommentItem[];
}

export async function addCommunityComment(
  postId: string,
  content: string,
): Promise<CommunityCommentItem> {
  return (await api.community.comment.mutate({ postId, content })) as unknown as CommunityCommentItem;
}

export async function reactToPost(postId: string): Promise<{ reacted: boolean }> {
  return api.community.react.mutate({ postId });
}

export async function createCommunityPost(
  content: string,
  kind: "post" | "announcement" = "post",
): Promise<CommunityFeedItem> {
  // The router returns the raw post row (no derived engagement counts); a
  // freshly created post has none, so map them to their zero values to keep
  // the CommunityFeedItem shape the screens consume.
  const created = await api.community.post.mutate({ content, kind });
  return {
    ...(created as unknown as Omit<
      CommunityFeedItem,
      "fistbumps" | "hasReacted" | "commentCount"
    >),
    fistbumps: 0,
    hasReacted: false,
    commentCount: 0,
  };
}

export async function listNotifications(
  opts: { read?: boolean; memberId?: string; limit?: number } = {},
): Promise<NotificationItem[]> {
  const res = await api.notifications.list.query({
    read: opts.read,
    memberId: opts.memberId,
    limit: opts.limit ?? 50,
  });
  return res.items as unknown as NotificationItem[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.notifications.markRead.mutate({ id });
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.notifications.markAllRead.mutate({});
}

export async function listMedia(): Promise<MediaAssetItem[]> {
  return (await api.media.list.query()) as unknown as MediaAssetItem[];
}

export async function submitClassFeedback(
  classId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  await api.classes.submitFeedback.mutate({
    classId,
    rating,
    ...(comment ? { comment } : {}),
  });
}

export async function signOut(): Promise<void> {
  try {
    await requestJson("/auth/sign-out", { method: "POST" });
  } catch {
    // Ignore sign-out errors. Local state is still cleared.
  } finally {
    await persistAuthToken(null);
  }
}

export function setRuntimeAuthToken(token: string | null): void {
  authToken = token;
}

/** Base API origin — exported for the tRPC client. */
export function getApiBaseUrl(): string {
  return getBaseUrl();
}

/** Current in-memory bearer token — exported for the tRPC client's auth header. */
export function getAuthToken(): string | null {
  return authToken;
}
