---
title: Mobile Integration
category:
  uri: developer
slug: mobile
parent:
  uri: developer-api
---

# Mobile Integration

The mobile app uses the same public API host as the web app, but it reads a
token from secure storage and never depends on browser cookies.

## Base URL

Set the mobile API origin to the production API host.

```bash
EXPO_PUBLIC_API_URL=https://api.vytal.fit
```

## Auth flow

1. Sign in with email and password.
2. Store the returned token in secure storage.
3. Fetch the session with the token on later app launches.
4. Load spaces and set the active space as needed.

## Example calls

```bash
curl -X POST https://api.vytal.fit/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"jose@vytal.fit","password":"VytalDemo2026!"}'
```

```bash
curl https://api.vytal.fit/spaces \
  -H 'authorization: Bearer <token>'
```

## Mobile rules

- Keep the token in secure storage.
- Reuse the API host directly.
- Treat `memberId` and `activeSpaceId` as session-scoped, not client-scoped.
