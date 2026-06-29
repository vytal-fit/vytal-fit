/**
 * Cross-origin URL helpers for the marketing site.
 *
 * In production the marketing pages live on the apex (`vytal.fit`) while the
 * admin app is served from the `pro.` subdomain. In development there are no
 * subdomains — the middleware treats `localhost` as the app itself — so any
 * link into the app must stay same-origin or the user is bounced to production
 * (where their local session/cookies don't exist and sign-in appears broken).
 *
 * `NEXT_PUBLIC_APP_URL` points production sign-in at `https://pro.vytal.fit`
 * while dev and preview fall back to the same-origin `/login` route. The old
 * `NEXT_PUBLIC_ADMIN_URL` name still works as a fallback for compatibility.
 * The value is inlined at build time, so this returns the same string on
 * server and client (no hydration mismatch).
 */
export function getSignInUrl(): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (appUrl) {
    // Strip any trailing slash so we don't emit `https://host//login`.
    return `${appUrl.replace(/\/+$/, "")}/login`;
  }
  return "/login";
}
