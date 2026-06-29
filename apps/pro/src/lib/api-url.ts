/**
 * Shared API origin helpers for the web app.
 *
 * The browser should talk to the API origin explicitly when production splits
 * the API onto api.vytal.fit. In local dev we fall back to same-origin so the
 * single web process keeps working.
 */
function normalizeOrigin(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return normalizeOrigin(configured);

  if (typeof window !== "undefined") return window.location.origin;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? 3001}`;
}

export function getApiUrl(path: string): string {
  const origin = getApiOrigin();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}

export function getAuthUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return getApiUrl(
    normalizedPath ? `/auth/${normalizedPath}` : "/auth",
  );
}
