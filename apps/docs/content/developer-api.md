---
title: Developer API
category:
  uri: Getting Started
slug: developer-api
position: 2
---

The Vytal API is a single REST surface on `api.vytal.fit`. The pro app, the
athlete portal, the mobile clients, and partner integrations all read and write
through it, and every call runs in the context of one active organization.

> 📘 New here? Start with the [Quickstart](./quickstart): sign in, pick a gym,
> make your first call in three requests.

## Hosts

| Host | Serves |
| :-- | :-- |
| `api.vytal.fit` | The REST API and the OpenAPI contract |
| `pro.vytal.fit` | proVytal, the staff backoffice |
| `my.vytal.fit` | myVytal, the athlete portal |
| `vytal.fit` | The public marketing site |

## What you can do

- **Authenticate** with email/password or Google, by cookie or bearer token.
- **Switch the active organization** so every later call is scoped to one gym.
- **Manage bookings**: book a member, cancel, or read a class roster; full
  classes auto-waitlist.
- **Track performance**: log personal records and WOD results.
- **Check runtime health** for monitoring and deploys.

## Endpoints at a glance

| Resource | Method · Path | Purpose |
| :-- | :-- | :-- |
| Auth | `POST /auth/sign-in/email` | Sign in (cookie + bearer token) |
| Auth | `POST /auth/sign-up/email` | Create an account and sign in |
| Auth | `POST /auth/sign-out` | End the session |
| Session | `GET /auth/session` | Read the current session |
| Session | `PATCH /me/session` | Switch the active organization |
| Organizations | `GET /organizations` | List gyms you belong to |
| Bookings | `GET · POST /bookings` | Read or create bookings |
| Records | `GET · POST /records` | Personal records |
| Results | `GET · POST /results` | WOD results |
| Health | `GET /health` | Runtime and database status |
| Spec | `GET /openapi.json` | The machine-readable contract |

## The contract

- **Root-level REST paths**, no version prefix in the URL.
- **One [error shape](./errors)** with predictable status codes.
- **Consistent [conventions](./conventions)** for list responses, dates, and
  idempotency.
- The full, machine-readable spec is the
  [OpenAPI document](https://api.vytal.fit/openapi.json).

## Keep reading

- **[Auth and Sessions](./auth-and-sessions)**: cookie vs bearer in depth.
- **[API Examples](./examples)**: copy/paste for records and results.
- **[Mobile Integration](./mobile)**: the bearer-token flow for native apps.
- **[Deployment](./deployment)**: hosts, origins, and environment variables.
