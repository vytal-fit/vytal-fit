/**
 * Better Auth integration tests: the instance constructs against a
 * PGlite-backed drizzle db with our schema, the organization plugin is wired
 * with the Vytal roles, and the email/password + organization flows work
 * end-to-end against the real generated migration.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { schema, type Database } from "@vytal-fit/db";
import { createAuth, roles, type Auth } from "../src/index";

const MIGRATIONS_FOLDER = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../db/migrations",
);

let db: Database;
let auth: Auth;

beforeAll(async () => {
  const client = new PGlite();
  const pgliteDb = drizzle(client, { schema });
  await migrate(pgliteDb, { migrationsFolder: MIGRATIONS_FOLDER });
  db = pgliteDb;
  auth = createAuth({
    db,
    secret: "test-secret-at-least-32-characters-long",
    baseURL: "http://localhost:3000",
  });
});

describe("createAuth", () => {
  it("constructs without env vars (options-driven)", () => {
    expect(auth).toBeDefined();
    expect(typeof auth.handler).toBe("function");
    expect(auth.api).toBeDefined();
  });

  it("exposes email/password endpoints", () => {
    expect(typeof auth.api.signUpEmail).toBe("function");
    expect(typeof auth.api.signInEmail).toBe("function");
    expect(typeof auth.api.getSession).toBe("function");
  });

  it("has the organization plugin registered", () => {
    const pluginIds = auth.options.plugins.map((p) => p.id);
    expect(pluginIds).toContain("organization");
  });

  it("trusts the canonical Vytal production origins by default", () => {
    expect(auth.options.trustedOrigins).toEqual(
      expect.arrayContaining([
        "https://vytal.fit",
        "https://pro.vytal.fit",
        "https://my.vytal.fit",
        "https://api.vytal.fit",
      ]),
    );
  });

  it("exposes organization endpoints", () => {
    expect(typeof auth.api.createOrganization).toBe("function");
    expect(typeof auth.api.listOrganizations).toBe("function");
    expect(typeof auth.api.setActiveOrganization).toBe("function");
    expect(typeof auth.api.createInvitation).toBe("function");
  });

  it("defines all five Vytal roles matching shared UserRole", () => {
    expect(Object.keys(roles).sort()).toEqual([
      "admin",
      "athlete",
      "coach",
      "owner",
      "pt",
    ]);
  });
});

describe("email/password + organization flow (PGlite end-to-end)", () => {
  const email = "founder@vytal.fit";
  const password = "super-secure-password-123";
  let cookie: string;

  it("signs up a user through the drizzle adapter", async () => {
    const { headers, response } = await auth.api.signUpEmail({
      body: { email, password, name: "Founder" },
      returnHeaders: true,
    });
    expect(response.user.email).toBe(email);

    const setCookie = headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    cookie = String(setCookie).split(";")[0] ?? "";

    // Row landed in our drizzle schema's user table.
    const users = await db.select().from(schema.user).where(eq(schema.user.email, email));
    expect(users).toHaveLength(1);
  });

  it("creates an organization and assigns the creator the owner role", async () => {
    const org = await auth.api.createOrganization({
      body: { name: "CrossFit Aveiro", slug: "crossfit-aveiro" },
      headers: new Headers({ cookie }),
    });
    expect(org?.name).toBe("CrossFit Aveiro");

    const orgRows = await db
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.slug, "crossfit-aveiro"));
    expect(orgRows).toHaveLength(1);

    const memberRows = await db
      .select()
      .from(schema.member)
      .where(eq(schema.member.organizationId, orgRows[0]!.id));
    expect(memberRows).toHaveLength(1);
    expect(memberRows[0]?.role).toBe("owner");
  });

  it("tracks the active organization on the session", async () => {
    const orgs = await auth.api.listOrganizations({
      headers: new Headers({ cookie }),
    });
    expect(orgs).toHaveLength(1);

    await auth.api.setActiveOrganization({
      body: { organizationId: orgs[0]!.id },
      headers: new Headers({ cookie }),
    });

    const session = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(session?.session.activeOrganizationId).toBe(orgs[0]!.id);
  });
});
