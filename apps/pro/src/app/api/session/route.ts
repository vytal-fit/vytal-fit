import { updateCurrentSession } from "@/lib/session-rest";

export const dynamic = "force-dynamic";

export function PATCH(request: Request) {
  return updateCurrentSession(request, { includeDeprecatedFields: true });
}
