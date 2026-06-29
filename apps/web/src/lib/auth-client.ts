/**
 * Better Auth client for the web app.
 *
 * Talks to the catch-all route at /api/auth/* on the configured API origin.
 * The organization plugin configuration mirrors the
 * server instance in packages/auth/src/index.ts — the access-control
 * statements and roles are rebuilt here from the same client-safe
 * better-auth building blocks instead of importing `@vytal-fit/auth`,
 * which would pull the Drizzle adapter and DB schema into the browser
 * bundle.
 */
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";
import { getAuthUrl } from "@/lib/api-url";

// Mirrors `accessControl` / `roles` in packages/auth/src/index.ts —
// owner > admin > coach > pt > athlete.
const accessControl = createAccessControl(defaultStatements);

const roles = {
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

export const authClient = createAuthClient({
  baseURL: getAuthUrl(""),
  plugins: [
    organizationClient({
      ac: accessControl,
      roles,
    }),
  ],
});

export type AuthClient = typeof authClient;
export type ClientSession = AuthClient["$Infer"]["Session"];
