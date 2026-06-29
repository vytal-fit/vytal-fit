import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS, type UserWithOrgs } from "@vytal-fit/shared";

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
    "/api/auth/sign-in/email",
    { body: { email, password }, includeAuth: false },
  );

  const token = setAuthToken ?? data.token ?? null;
  await persistAuthToken(token);
  return { token, user: data.user };
}

export async function signUp(name: string, email: string, password: string): Promise<{ token: string | null; user: AuthSession["user"] }> {
  const { data, setAuthToken } = await requestJson<{ token: string | null; user: AuthSession["user"] }>(
    "/api/auth/sign-up/email",
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
    const { data } = await requestJson<AuthSession>("/api/auth/get-session", {
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
  const { data } = await requestJson<AuthOrganization[]>("/api/spaces", {
    method: "GET",
  });
  return data;
}

export async function getFullOrganization(
  organizationId: string,
): Promise<AuthFullOrganization | null> {
  try {
    const { data } = await requestJson<AuthFullOrganization | null>(
      `/api/spaces/${organizationId}`,
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

export async function updateActiveSpace(spaceId: string): Promise<void> {
  await requestJson("/api/session", {
    method: "PATCH",
    body: { activeSpaceId: spaceId },
  });
}

export async function setActiveOrganization(organizationId: string): Promise<void> {
  await updateActiveSpace(organizationId);
}

export async function listMemberBookings(memberId: string): Promise<BookingRecord[]> {
  const params = new URLSearchParams({ memberId });
  const { data } = await requestJson<{ items: BookingRecord[] }>(
    `/api/bookings?${params.toString()}`,
    { method: "GET" },
  );
  return data.items;
}

export async function bookClass(classId: string, memberId: string): Promise<BookingRecord> {
  const { data } = await requestJson<BookingRecord>("/api/bookings", {
    body: { classId, memberId },
  });
  return data;
}

export async function cancelBooking(bookingId: string): Promise<BookingRecord> {
  const { data } = await requestJson<BookingRecord>(
    `/api/bookings/${bookingId}`,
    { method: "DELETE" },
  );
  return data;
}

export async function listPersonalRecords(memberId: string, exerciseId?: string): Promise<PersonalRecordItem[]> {
  const params = new URLSearchParams({ memberId });
  if (exerciseId) params.set("exerciseId", exerciseId);
  const { data } = await requestJson<{ items: PersonalRecordItem[] }>(
    `/api/records?${params.toString()}`,
    { method: "GET" },
  );
  return data.items;
}

export async function createPersonalRecord(
  input: Omit<PersonalRecordItem, "id">,
): Promise<PersonalRecordItem> {
  const { data } = await requestJson<PersonalRecordItem>(
    "/api/records",
    { body: input },
  );
  return data;
}

export async function updatePersonalRecord(
  id: string,
  input: Partial<Omit<PersonalRecordItem, "id" | "memberId" | "exerciseId">> & {
    memberId?: string;
    exerciseId?: string;
  },
): Promise<PersonalRecordItem> {
  const { data } = await requestJson<PersonalRecordItem>(
    `/api/records/${id}`,
    { method: "PATCH", body: input },
  );
  return data;
}

export async function listWodResults(memberId: string, wodId?: string): Promise<WodResultItem[]> {
  const params = new URLSearchParams({ memberId });
  if (wodId) params.set("wodId", wodId);
  const { data } = await requestJson<{ items: WodResultItem[] }>(
    `/api/results?${params.toString()}`,
    { method: "GET" },
  );
  return data.items;
}

export async function createWodResult(
  input: Omit<WodResultItem, "id">,
): Promise<WodResultItem> {
  const { data } = await requestJson<WodResultItem>(
    "/api/results",
    { body: input },
  );
  return data;
}

export async function updateWodResult(
  id: string,
  input: Partial<Omit<WodResultItem, "id" | "memberId" | "wodId">> & {
    memberId?: string;
    wodId?: string;
  },
): Promise<WodResultItem> {
  const { data } = await requestJson<WodResultItem>(
    `/api/results/${id}`,
    { method: "PATCH", body: input },
  );
  return data;
}

export async function signOut(): Promise<void> {
  try {
    await requestJson("/api/auth/sign-out", { method: "POST" });
  } catch {
    // Ignore sign-out errors. Local state is still cleared.
  } finally {
    await persistAuthToken(null);
  }
}

export function setRuntimeAuthToken(token: string | null): void {
  authToken = token;
}
