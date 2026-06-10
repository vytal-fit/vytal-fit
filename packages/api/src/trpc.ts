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
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Database } from "@vytal-fit/db";

export interface SessionContext {
  user: {
    id: string;
    email: string;
    name: string;
  };
  activeOrganizationId: string | null;
}

export interface Context {
  db: Database;
  session: SessionContext | null;
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
