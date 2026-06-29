"use client";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";

export function useMemberPortalIdentity() {
  const session = authClient.useSession();
  const activeOrganizationId = session.data?.session?.activeOrganizationId ?? null;
  const membersQuery = trpc.members.list.useQuery(
    { limit: 100 },
    { enabled: Boolean(activeOrganizationId) },
  );

  const currentMember =
    membersQuery.data?.items.find((member) => member.userId === session.data?.user?.id) ??
    null;

  return {
    session,
    activeOrganizationId,
    membersQuery,
    currentMember,
  };
}
