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

## Endpoints

- `POST /auth/sign-in/email`
- `POST /auth/sign-up/email`
- `POST /auth/sign-out`
- `GET /auth/get-session`
- `PATCH /session`

## Auth model

- Email/password auth is enabled
- Google social login is enabled when the deployment is configured for it
- The active organization comes from the session, not from the client
- Browser clients send credentials cross-origin to the API host

## Common flows

### Sign in

```bash
curl -X POST https://api.vytal.fit/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"jose@vytal.fit","password":"VytalDemo2026!"}'
```

### Load the session

```bash
curl https://api.vytal.fit/auth/get-session \
  -H 'authorization: Bearer <token>'
```

### Switch the active space

```bash
curl -X PATCH https://api.vytal.fit/session \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <token>' \
  -d '{"activeSpaceId":"org_123"}'
```

## Client rules

- Send credentials on every browser request
- Use the session wrapper for active-space changes
