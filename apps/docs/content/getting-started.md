---
title: Getting Started
category:
  uri: Getting Started
slug: getting-started
position: 0
---

Vytal is the operating system for fitness businesses. One API powers four
surfaces: the public marketing site, the staff backoffice, the athlete portal,
and the integrations that read and write bookings, memberships, results, and
billing.

> 📘 The one rule worth knowing up front
>
> Every request carries an **organization API key**, and every call is scoped to
> that key's gym. Cross-tenant access is impossible by design.

## The surfaces

| Surface | Where | For |
| :-- | :-- | :-- |
| Public site | `vytal.fit` | Marketing, schedules, sign-up |
| proVytal | `pro.vytal.fit` | Staff and backoffice |
| myVytal | `my.vytal.fit` | The athlete portal |
| API | `api.vytal.fit/v1` | Integrations and the contract |

## Start here

- **[Quickstart](./quickstart)**: create a key, make a call.
- **[Authentication](./auth-and-sessions)**: API keys in depth.
- **[Conventions](./conventions)**: org scope, list shape, dates, idempotency.
- **[Errors](./errors)**: one error shape, predictable status codes.
- **[API Examples](./examples)**: copy/paste for bookings, records, results.
- **[REST Principles](./rest-api-principles)**: how the surface is shaped.

## A typical first integration

1. **Create an API key** in Settings → API Keys and store it as a secret.
2. **Read something real**: your members, or today's classes.
3. **Write something**: book a member into a class; full classes auto-waitlist.
4. **Handle errors** on the shared `{ error, message }` shape.

When you are ready for the machine-readable contract, point your tooling at the
[OpenAPI spec](https://api.vytal.fit/openapi.json).

## What to expect

- A versioned `/v1` base path with clean, resource-oriented routes.
- API-key auth on every call (`Authorization: Bearer vk_live_…`).
- Org-scoped data with strict tenant isolation.
- PT, EN, and ES across every product surface.
