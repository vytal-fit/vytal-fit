/**
 * Lazy PostgreSQL client.
 *
 * No connection is created at import time — modules stay importable without
 * DATABASE_URL set (type-check and tests run anywhere). Use `createDb(url)`
 * to build a client explicitly, or `getDb()` for the env-driven default.
 */
import { sql } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Driver-agnostic database type (postgres-js in production, PGlite in tests).
 * Everything downstream (tRPC context, routers) is typed against this.
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

/** Create a Drizzle client for the given PostgreSQL connection URL. */
export function createDb(url: string): PostgresJsDatabase<typeof schema> {
  const client = postgres(url, { prepare: false });
  return drizzle(client, { schema });
}

/**
 * Cheap connectivity check (`SELECT 1`). Throws when the database is
 * unreachable — callers decide how to surface that (e.g. /api/health).
 */
export async function pingDb(db: Database): Promise<void> {
  await db.execute(sql`select 1`);
}

let defaultDb: Database | null = null;

/**
 * Lazy default client driven by DATABASE_URL. Throws a clear error only when
 * actually used without the env var — never at import time.
 */
export function getDb(): Database {
  if (!defaultDb) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "[@vytal-fit/db] DATABASE_URL is not set. " +
          "Set the environment variable or create a client explicitly with createDb(url).",
      );
    }
    defaultDb = createDb(url);
  }
  return defaultDb;
}
