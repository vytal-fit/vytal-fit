---
title: Getting Started
category:
  uri: developer
slug: getting-started
---

Vytal is the operating system for fitness businesses. One API powers four
surfaces: the public marketing site, the staff backoffice, the athlete portal,
and the integrations that read and write bookings, memberships, results, and
billing.

> 📘 The one rule worth knowing up front
>
> Every request runs in the context of one **active organization** (a gym).
> Authenticate once, choose the active org, and every later call is scoped to
> it. Cross-tenant access is impossible by design.

## The surfaces

| Surface | Where | For |
| :-- | :-- | :-- |
| Public site | `vytal.fit` | Marketing, schedules, sign-up |
| proVytal | `pro.vytal.fit` | Staff and backoffice |
| myVytal | `my.vytal.fit` | The athlete portal |
| API | `api.vytal.fit` | Integrations and these docs |

## Start here

- **[Quickstart](./quickstart)**: zero to a working call in three requests.
- **[Auth and Sessions](./auth-and-sessions)**: cookie vs bearer, in depth.
- **[Conventions](./conventions)**: org scope, list shape, dates, idempotency.
- **[Errors](./errors)**: one error shape, predictable status codes.
- **[API Examples](./examples)**: copy/paste for records and results.
- **[Mobile Integration](./mobile)**: the bearer-token flow for native apps.

## A typical first integration

1. **Sign in** and capture the session (cookie for browsers, bearer for
   servers and mobile).
2. **Pick the active gym** so every call is scoped correctly.
3. **Read something real**: a member's bookings or today's classes.
4. **Write something**: book a member into a class; full classes auto-waitlist.

When you are ready for the machine-readable contract, point your tooling at the
[OpenAPI spec](https://api.vytal.fit/openapi.json).

## What to expect

- Root-level REST paths, no version prefix in the URL.
- Cross-origin browser auth with `credentials: "include"`.
- Org-scoped data with strict tenant isolation.
- PT, EN, and ES across every product surface.
