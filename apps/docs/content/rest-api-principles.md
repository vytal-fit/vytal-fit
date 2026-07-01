---
title: REST Principles
category:
  uri: Core Concepts
slug: rest-api-principles
position: 3
---

The Vytal API is resource-oriented on purpose. If you have used a well-behaved
REST API before, this one should feel familiar: addressable nouns under a
versioned base path, standard verbs, and filters in the query string.

## The rules

- **Base path is `/v1`.** Every resource lives beneath `https://api.vytal.fit/v1`.
- **Nouns, not verbs.** A path names a thing (`/v1/members`), and the HTTP
  method is the action.
- **Filters go in the query string.** Narrow a collection with parameters, never
  with a new endpoint.
- **The method carries intent.** `GET` reads, `POST` creates, `PATCH` updates,
  `DELETE` removes; writes return the affected resource.
- **Missing means 404.** A resource outside your key's organization is
  indistinguishable from one that never existed.

## Verbs live in the method, not the path

```bash
# ✅ REST: the noun is the path, POST is the action
curl -X POST https://api.vytal.fit/v1/members \
  -H "authorization: Bearer $VYTAL_API_KEY" \
  -d '{"name":"Ana Silva","email":"ana@example.com"}'
```

A handful of domain actions that aren't plain CRUD (booking a spot, publishing a
WOD) are sub-resources of their noun, e.g. `POST /v1/bookings/book` and
`POST /v1/wods/publish`. The tRPC procedure paths behind them are never exposed.

## Filter, don't multiply endpoints

```bash
# ✅ one collection, narrowed by query params
curl 'https://api.vytal.fit/v1/payments/by-member?memberId=mem_123' \
  -H "authorization: Bearer $VYTAL_API_KEY"
```

## The path map

| Prefix | Resource |
| :-- | :-- |
| `/v1/members` | Members and profiles |
| `/v1/subscriptions` | Memberships and plans |
| `/v1/classes` · `/v1/class-types` | Scheduling |
| `/v1/bookings` · `/v1/check-ins` | Attendance |
| `/v1/wods` · `/v1/wod-results` | Workouts and scores |
| `/v1/personal-records` | Personal records |
| `/v1/payments` · `/v1/expenses` | Money in and out |
| `/v1/shop` | Products, sales, orders, suppliers |
| `/v1/leads` | CRM pipeline |
| `/v1/dashboard` | Stats, charts, analytics |

The exhaustive, always-current map is the
[OpenAPI document](https://api.vytal.fit/openapi.json).

## What this buys you

A predictable surface is easier to document, easier to test, and easier to
consume from a server or a partner integration, and it stays stable as the
product grows.
