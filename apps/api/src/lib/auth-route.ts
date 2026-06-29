import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

export function buildAuthHandler() {
  return toNextJsHandler(async (request: Request): Promise<Response> => {
    if (!isBackendConfigured()) {
      return Response.json(
        {
          error: "SERVICE_UNAVAILABLE",
          message:
            "Auth backend is not configured. Set DATABASE_URL and BETTER_AUTH_SECRET.",
        },
        { status: 503 },
      );
    }
    return getAuth().handler(request);
  });
}

export async function getAuthSessionResponse(
  request: Request,
): Promise<Response> {
  if (!isBackendConfigured()) {
    return Response.json(
      {
        error: "SERVICE_UNAVAILABLE",
        message:
          "Auth backend is not configured. Set DATABASE_URL and BETTER_AUTH_SECRET.",
      },
      { status: 503 },
    );
  }

  const session = await getAuth().api.getSession({
    headers: request.headers,
  });
  return Response.json(session);
}
