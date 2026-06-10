/**
 * Better Auth instance for Vytal.
 *
 * Exposed as a `createAuth(options)` factory so modules stay importable
 * without env vars (BETTER_AUTH_SECRET, DATABASE_URL) — nothing connects or
 * reads the environment at import time.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";
import { schema, type Database } from "@vytal-fit/db";

// ─────────────────────────────────────────────────────────────────────────────
// Access control — roles mirror the shared `UserRole` union:
// owner > admin > coach > pt > athlete
// ─────────────────────────────────────────────────────────────────────────────

export const accessControl = createAccessControl(defaultStatements);

export const roles = {
  owner: accessControl.newRole({ ...ownerAc.statements }),
  admin: accessControl.newRole({ ...adminAc.statements }),
  coach: accessControl.newRole({
    member: ["create", "update"],
    invitation: ["create"],
  }),
  pt: accessControl.newRole({
    member: ["update"],
  }),
  athlete: accessControl.newRole({ ...memberAc.statements }),
} as const;

export interface CreateAuthOptions {
  /** Drizzle database (postgres-js in production, PGlite in tests). */
  db: Database;
  /** Secret for hashing/signing. Defaults to BETTER_AUTH_SECRET when set. */
  secret?: string;
  /** Base URL of the auth server. Defaults to BETTER_AUTH_URL when set. */
  baseURL?: string;
}

/** Build the Vytal Better Auth instance bound to the given database. */
export function createAuth(options: CreateAuthOptions) {
  return betterAuth({
    appName: "Vytal",
    secret: options.secret ?? process.env.BETTER_AUTH_SECRET,
    baseURL: options.baseURL ?? process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(options.db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      organization({
        ac: accessControl,
        roles,
        creatorRole: "owner",
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
export type AuthUser = Auth["$Infer"]["Session"]["user"];
