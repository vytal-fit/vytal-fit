---
title: REST Principles
category:
  uri: Core Concepts
slug: rest-api-principles
position: 3
---

The Vytal API is resource-oriented on purpose. If you have used a well-behaved
REST API before, this one should feel familiar: addressable nouns, standard
verbs, and filters in the query string.

## The rules

- **Nouns, not verbs.** A path names a thing (`/bookings`), and the HTTP method
  is the action. There is no `/createBooking` or `/cancelBooking`.
- **Filters go in the query string.** Narrow a collection with parameters, never
  with a new endpoint.
- **Paths stay short and stable.** No version prefix, no app name, no deep
  nesting that breaks when a feature moves.
- **The method carries intent.** `GET` reads, `POST` creates, `PATCH` updates,
  `DELETE` removes; writes return the affected resource.
- **Missing means 404.** A resource outside your active organization is
  indistinguishable from one that never existed.

## Verbs live in the method, not the path

```bash
# ✅ REST: the noun is the path, POST is the action
curl -X POST https://api.vytal.fit/bookings \
  -d '{"classId":"class_123","memberId":"mem_123"}'

# ❌ RPC: the verb is baked into the path
curl -X POST https://api.vytal.fit/createBooking
```

## Filter, don't multiply endpoints

```bash
# ✅ one collection, narrowed by query params
curl 'https://api.vytal.fit/results?memberId=mem_123&wodId=wod_123'

# ❌ a bespoke path for every slice
curl 'https://api.vytal.fit/results/by-member-and-wod/mem_123/wod_123'
```

## The path map

| Path | Resource |
| :-- | :-- |
| `/auth/*` | Authentication |
| `/me/session` | The current session |
| `/organizations` | Organizations you belong to |
| `/bookings` | Class bookings |
| `/records` | Personal records |
| `/results` | WOD results |
| `/health` | Runtime status |

## What this buys you

A predictable surface is easier to document, easier to test, and easier to
consume from a browser, a native app, or a partner integration, and it stays
stable as the product splits across hosts.
