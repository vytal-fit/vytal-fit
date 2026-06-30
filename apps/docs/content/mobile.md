---
title: Mobile Integration
category:
  uri: Guides
slug: mobile
position: 1
---

Native apps use the same API host as the browser apps, but they carry a bearer
token from secure storage instead of a browser cookie.

> 📘 Cookie-free by design
>
> Mobile never relies on cookies. Sign in once, read the token from the
> `set-auth-token` response header, store it securely, and send it as
> `Authorization: Bearer <token>` on every later request.

## Base URL

Point the app at the production API host:

```bash
EXPO_PUBLIC_API_URL=https://api.vytal.fit
```

## Auth flow

1. **Sign in** with email and password.
2. **Read the token** from the `set-auth-token` response header.
3. **Store it** in secure storage (Keychain / Keystore), never in plain
   `AsyncStorage`.
4. **Send it** as `Authorization: Bearer <token>` on every request, including
   `GET /auth/session` on later launches to restore the session.
5. **Set the active organization** with `PATCH /me/session` when the athlete
   belongs to more than one gym.

## Example calls

```bash
# 1. sign in: the token is in the `set-auth-token` response header (-i shows it)
curl -i -X POST https://api.vytal.fit/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"jose@vytal.fit","password":"VytalDemo2026!"}'

# 2. reuse the token on every later request
curl https://api.vytal.fit/organizations \
  -H 'authorization: Bearer <token>'
```

## Rules

- Keep the token in secure storage; treat it like a password.
- Talk to `api.vytal.fit` directly; there is no mobile-only host.
- `memberId` and `activeOrganizationId` are session-scoped, never
  client-supplied.
