---
title: Auth and Sessions
category:
  uri: developer
slug: auth-and-sessions
parent:
  uri: developer-api
---

# Auth and Sessions

Use the Better Auth endpoints on `api.vytal.fit` for all session management.
Use `/auth/session` to read the Better Auth session and `/me/session` to update
Vytal-owned session metadata such as the active organization.

## Endpoints

- `POST /auth/sign-in/email`
- `POST /auth/sign-up/email`
- `POST /auth/sign-out`
- `GET /auth/session`
- `PATCH /me/session`
- `GET /openapi.json`

## Auth model

- Email/password auth is enabled
- Google social login is enabled when the deployment is configured for it
- The active organization comes from the session, not from the client
- Browser clients send credentials cross-origin to the API host
- CORS must echo the requesting app origin when credentials are included; it
  must not use `*` for credentialed browser requests

## Common flows

### Sign in

```bash
curl -X POST https://api.vytal.fit/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"jose@vytal.fit","password":"VytalDemo2026!"}'
```

### Load the session

```bash
curl https://api.vytal.fit/auth/session \
  -H 'authorization: Bearer <token>'
```

### Switch the active organization

```bash
curl -X PATCH https://api.vytal.fit/me/session \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <token>' \
  -d '{"activeOrganizationId":"org_123"}'
```

## Client rules

- Send credentials on every browser request
- Use `/me/session` for active-organization changes
- Use `/openapi.json` for the machine-readable contract
