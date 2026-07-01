---
title: Quickstart
category:
  uri: Getting Started
slug: quickstart
position: 1
---

The shortest path from zero to a working Vytal integration. Every request is
scoped to your API key's **organization** (the gym).

> 👍 Prerequisites
>
> A Vytal account and the base URL `https://api.vytal.fit/v1`. No SDK required:
> these examples are plain `curl` and `fetch`.

## 1. Create an API key

In proVytal, open **Settings → API Keys**, click **Create API Key**, and copy
the `vk_live_…` secret. It is shown once. Keep it in an environment variable:

```bash
export VYTAL_API_KEY=vk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 2. Make your first call

Every request carries the key as a Bearer token. The org is implied by the key,
so there is nothing else to set up.

```bash
# your gym's members
curl https://api.vytal.fit/v1/members \
  -H "authorization: Bearer $VYTAL_API_KEY"

# today's class schedule
curl https://api.vytal.fit/v1/classes/schedule \
  -H "authorization: Bearer $VYTAL_API_KEY"
```

## 3. Write something

```bash
# book a member into a class (auto-waitlists if the class is full)
curl -X POST https://api.vytal.fit/v1/bookings/book \
  -H "authorization: Bearer $VYTAL_API_KEY" \
  -H 'content-type: application/json' \
  -d '{"classId":"cl-1","memberId":"m-1"}'
```

## In JavaScript

```js
const api = "https://api.vytal.fit/v1";
const auth = { authorization: `Bearer ${process.env.VYTAL_API_KEY}` };

const { items } = await fetch(`${api}/members`, { headers: auth }).then((r) =>
  r.json(),
);
```

## Next

- [Authentication](./auth-and-sessions): API keys in depth.
- [Conventions](./conventions): org scope, list shape, dates, idempotency.
- [Errors](./errors): the single error shape and status codes.
- [API Examples](./examples): copy/paste for bookings, records, and results.
- [OpenAPI spec](https://api.vytal.fit/openapi.json): the machine-readable contract.
