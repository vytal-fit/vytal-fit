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
