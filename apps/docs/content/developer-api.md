---
title: Developer API
category:
  uri: Getting Started
slug: developer-api
position: 2
---

The Vytal API is a single REST surface at `https://api.vytal.fit/v1`. Partner
integrations read and write bookings, memberships, payments, classes, results,
and more, and every call runs in the context of the organization behind your
API key.

> 📘 New here? Start with the [Quickstart](./quickstart): create a key and make
> your first call in two requests.

## Hosts

| Host | Serves |
| :-- | :-- |
| `api.vytal.fit/v1` | The REST API |
| `api.vytal.fit/openapi.json` | The OpenAPI contract |
| `pro.vytal.fit` | proVytal, the staff backoffice |
| `my.vytal.fit` | myVytal, the athlete portal |
| `vytal.fit` | The public marketing site |

## Authentication

Send your organization API key as a Bearer token on every request:

```
Authorization: Bearer vk_live_…
```

Create and revoke keys in **Settings → API Keys** (see
[Authentication](./auth-and-sessions)). The organization is implied by the key,
never passed in a body.

## What you can do

- **Members & memberships**: list, create, update, archive members; manage
  subscriptions and plans.
- **Scheduling**: read the class schedule and history; create classes; manage
  bookings and the waitlist; record attendance and check-ins.
- **Training**: log personal records and WOD results; publish WODs; collect
  workout feedback and wellness check-ins.
- **Commerce**: products, sales, orders, suppliers, payments, and expenses.
- **CRM**: leads, stages, and activity logs.
- **Insight**: dashboard stats, charts, and analytics.

## Surface at a glance

| Resource | Example |
| :-- | :-- |
| Members | `GET /v1/members` · `POST /v1/members` |
| Classes | `GET /v1/classes/schedule` · `POST /v1/classes` |
| Bookings | `POST /v1/bookings/book` · `POST /v1/bookings/cancel` |
| Subscriptions | `GET /v1/subscriptions` · `GET /v1/subscriptions/plans` |
| Payments | `GET /v1/payments` · `GET /v1/payments/stats` |
| Records | `GET · POST /v1/personal-records` |
| Results | `GET · POST /v1/wod-results` |
| Leads | `GET /v1/leads` · `POST /v1/leads/update-stage` |
| Dashboard | `GET /v1/dashboard/stats` · `GET /v1/dashboard/charts` |

The complete, always-current list is in the
[OpenAPI document](https://api.vytal.fit/openapi.json).

## The contract

- **Versioned base path** `/v1`; resources are clean nouns beneath it.
- **One [error shape](./errors)** with predictable status codes.
- **Consistent [conventions](./conventions)** for list responses, dates, and
  idempotency.
- The spec is generated directly from the live backend, so it never drifts from
  what's deployed.

## Keep reading

- **[Authentication](./auth-and-sessions)**: API keys in depth.
- **[REST Principles](./rest-api-principles)**: how paths and methods are shaped.
- **[API Examples](./examples)**: copy/paste for bookings, records, and results.
- **[Server & Integrations](./mobile)**: patterns for server-to-server callers.
- **[Deployment](./deployment)**: hosts, origins, and environment variables.
