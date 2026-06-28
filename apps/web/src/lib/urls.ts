/**
 * Cross-origin URL helpers for the marketing site.
 *
 * In production the marketing pages live on the apex (`vytal.fit`) while the
 * admin app is served from the `pro.` subdomain. In development there are no
 * subdomains — the middleware treats `localhost` as the app itself — so any
 * link into the app must stay same-origin or the user is bounced to production
 * (where their local session/cookies don't exist and sign-in appears broken).
 *
 * `NEXT_PUBLIC_ADMIN_URL` lets production point sign-in at `https://pro.vytal.fit`
 * while dev and preview fall back to the same-origin `/login` route. The value
 * is inlined at build time, so this returns the same string on server and
 * client (no hydration mismatch).
 */
export function getSignInUrl(): string {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (adminUrl) {
    // Strip any trailing slash so we don't emit `https://host//login`.
    return `${adminUrl.replace(/\/+$/, "")}/login`;
  }
  return "/login";
}
