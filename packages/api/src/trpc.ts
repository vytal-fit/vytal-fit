/**
 * tRPC initialization for the Vytal API.
 *
 * Procedure bases:
 *  - `publicProcedure`    — no auth. Almost nothing should use this.
 *  - `protectedProcedure` — requires a session (UNAUTHORIZED otherwise).
 *  - `orgProcedure`       — requires a session AND an active organization
 *                           (FORBIDDEN otherwise). Default for every
 *                           app-domain resource; narrows
 *                           `ctx.activeOrganizationId` to `string`.
 *  - `minRole(role)`      — orgProcedure + role gate against the caller's
 *                           role in the ACTIVE org (shared ROLE_HIERARCHY).
 *  - `staffProcedure`     — minRole("coach"): operational writes.
 *  - `adminProcedure`     — minRole("admin"): destructive/management writes.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import superjson from "superjson";
import { member, type Database } from "@vytal-fit/db";
import {
  hasMinRole,
  ROLE_HIERARCHY,
  ROLE_LABELS,
  type UserRole,
} from "@vytal-fit/shared";

export interface SessionContext {
  user: {
    id: string;
    email: string;
    name: string;
    /** Unverified sessions are rejected by `protectedProcedure`. */
    emailVerified: boolean;
  };
  activeOrganizationId: string | null;
  /**
   * The caller's role in the ACTIVE organization, resolved server-side from
   * the Better Auth `member` table (never client-supplied). `null` when the
   * caller has no active org or no membership row in it.
   */
  role: UserRole | null;
}

export interface Context {
  db: Database;
  session: SessionContext | null;
}

/**
 * Parse a Better Auth role string into the highest-ranked known role.
 *
 * Better Auth stores multi-role memberships as a comma-separated string
 * (e.g. "admin,coach"). Unknown tokens are ignored.
 */
export function parseHighestRole(
  roleString: string | null | undefined,
): UserRole | null {
  if (!roleString) return null;
  let best: UserRole | null = null;
  for (const raw of roleString.split(",")) {
    const candidate = raw.trim();
    if (
      candidate in ROLE_HIERARCHY &&
      (best === null ||
        ROLE_HIERARCHY[candidate as UserRole] > ROLE_HIERARCHY[best])
    ) {
      best = candidate as UserRole;
    }
  }
  return best;
}

/**
 * Resolve the caller's role in an organization from the Better Auth `member`
 * table (server-side — never trust a client-supplied role). One indexed
 * select on (userId, organizationId). Returns `null` when no membership row
 * exists.
 */
export async function resolveOrgRole(
  db: Database,
  userId: string,
  organizationId: string,
): Promise<UserRole | null> {
  const [row] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
    )
    .limit(1);
  return parseHighestRole(row?.role);
}

/** Build a tRPC context from a database client and an (optional) session. */
export function createContext(opts: {
  db: Database;
  session: SessionContext | null;
}): Context {
  return { db: opts.db, session: opts.session };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Verify/resend and org creation run through Better Auth endpoints, not tRPC,
  // so blocking unverified sessions here costs nothing legitimate. The message
  // is a stable code so the client can tell this apart from a generic 403.
  if (!ctx.session.user.emailVerified) {
    throw new TRPCError({ code: "FORBIDDEN", message: "EMAIL_NOT_VERIFIED" });
  }
  return next({
    ctx: { ...ctx, session: ctx.session },
  });
});

export const orgProcedure = protectedProcedure.use(({ ctx, next }) => {
  const activeOrganizationId = ctx.session.activeOrganizationId;
  if (!activeOrganizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No active organization selected.",
    });
  }
  return next({
    ctx: { ...ctx, activeOrganizationId },
  });
});

/**
 * Procedure factory layering a role gate on top of `orgProcedure`.
 *
 * The caller's role comes from `ctx.session.role` (resolved server-side at
 * context creation from the Better Auth `member` table for the active org).
 * A missing role means the membership could not be verified — denied.
 */
export function minRole(required: UserRole) {
  return orgProcedure.use(({ ctx, next }) => {
    const role = ctx.session.role;
    if (!role || !hasMinRole(role, required)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This action requires the ${ROLE_LABELS[required]} role or above in the active organization.`,
      });
    }
    return next({
      ctx: { ...ctx, role },
    });
  });
}

/** Operational writes (classes, WODs, leads, bookings, results): coach+. */
export const staffProcedure = minRole("coach");

/** Destructive / management writes (CRUD on org resources): admin+ (owner/admin). */
export const adminProcedure = minRole("admin");
