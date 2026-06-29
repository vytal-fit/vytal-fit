/**
 * Better Auth catch-all route exposed at /auth/*.
 */
import { buildAuthHandler } from "@/lib/auth-route";

export const { GET, POST, PATCH, PUT, DELETE } = buildAuthHandler();
