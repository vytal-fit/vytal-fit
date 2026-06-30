---
title: Auth and Sessions
category:
  uri: developer
slug: auth-and-sessions
parent:
  uri: developer-api
---

# Auth and Sessions

Auth runs on `api.vytal.fit` (Better Auth). One sign-in, two ways to carry the
session — both resolve to the same session, and the **active organization always
comes from the session, never from the client**.

## Two auth modes

| | Browser apps | Mobile / server |
| --- | --- | --- |
| Carrier | Session **cookie** | **Bearer token** |
| Where it comes from | Set automatically on sign-in | `set-auth-token` response header on sign-in |
| How you send it | `credentials: "include"` | `Authorization: Bearer <token>` |

## Endpoints

- `POST /auth/sign-in/email` — sign in (sets the cookie **and** returns `set-auth-token`)
- `POST /auth/sign-up/email` — create an account and sign in
- `POST /auth/sign-out` — end the session
- `GET /auth/session` — read the current session, or `null` when signed out
- `PATCH /me/session` — switch the active organization
- `GET /openapi.json` — the machine-readable contract

## Sign in — browser

```bash
curl -i -c vytal.cookies -X POST https://api.vytal.fit/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"you@example.com","password":"your-password"}'
```

## Sign in — mobile / server

```bash
# the token is in the `set-auth-token` response header
curl -i -X POST https://api.vytal.fit/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"you@example.com","password":"your-password"}'

# reuse it on later requests
curl https://api.vytal.fit/auth/session \
  -H 'authorization: Bearer YOUR_TOKEN'
```

## Switch the active organization

```bash
curl -b vytal.cookies -X PATCH https://api.vytal.fit/me/session \
  -H 'content-type: application/json' \
  -d '{"activeOrganizationId":"org-1"}'
```

## Rules

- Google social login is enabled when the deployment is configured for it.
- For credentialed browser requests, CORS echoes the requesting app origin —
  never `*`.
- Use `/me/session` for active-organization changes; treat `memberId` and
  `activeOrganizationId` as session-scoped, not client-supplied.
