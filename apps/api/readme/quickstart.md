---
title: Quickstart
category:
  uri: developer
slug: quickstart
parent:
  uri: developer-api
---

# Quickstart

The shortest path from zero to a working Vytal integration. Every request is
scoped to the caller's **active organization** (the gym).

## Authentication in 30 seconds

One sign-in, two equivalent ways to carry the session:

- **Browser apps** — sign-in sets a session **cookie**. Send it on every
  request (cross-origin: `credentials: "include"`).
- **Mobile / server** — sign-in returns a **token** in the `set-auth-token`
  response header. Send it as `Authorization: Bearer <token>`.

## 1. Sign in

```bash
# -i shows response headers (the bearer token is in `set-auth-token`);
# -c saves the session cookie for browser-style calls.
curl -i -c vytal.cookies -X POST https://api.vytal.fit/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"you@example.com","password":"your-password"}'
```

## 2. Choose the active gym

```bash
# gyms you belong to
curl -b vytal.cookies https://api.vytal.fit/organizations

# set the active one — every later request is scoped to it
curl -b vytal.cookies -X PATCH https://api.vytal.fit/me/session \
  -H 'content-type: application/json' \
  -d '{"activeOrganizationId":"org-1"}'
```

Bearer equivalent (mobile / server):

```bash
curl https://api.vytal.fit/organizations \
  -H 'authorization: Bearer YOUR_TOKEN'
```

## 3. Your first business request

```bash
# a member's bookings
curl -b vytal.cookies 'https://api.vytal.fit/bookings?memberId=m-1'

# book a member into a class (auto-waitlists if the class is full)
curl -b vytal.cookies -X POST https://api.vytal.fit/bookings \
  -H 'content-type: application/json' \
  -d '{"classId":"cl-1","memberId":"m-1"}'
```

## In JavaScript

```js
const api = "https://api.vytal.fit";

await fetch(`${api}/auth/sign-in/email`, {
  method: "POST",
  credentials: "include",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const { items } = await fetch(`${api}/organizations`, {
  credentials: "include",
}).then((r) => r.json());
```

## Next

- [Conventions](./conventions) — org scope, list shape, dates, idempotency.
- [Errors](./errors) — the single error shape and status codes.
- [Auth and Sessions](./auth-and-sessions) — cookie vs bearer in depth.
- [API Examples](./examples) — copy/paste for records and results.
- [OpenAPI spec](https://api.vytal.fit/openapi.json) — the machine-readable contract.
