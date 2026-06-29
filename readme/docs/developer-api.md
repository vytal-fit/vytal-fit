---
title: Developer API
category:
  uri: developer
slug: developer-api
---

# Vytal Developer API

Vytal’s public API lives on `api.vytal.fit`. The pro app lives on
`pro.vytal.fit`, the athlete portal on `my.vytal.fit`, and the public site on
`vytal.fit`.

This hub is the top-level map for the public contract used by the web app,
mobile clients, and partner integrations.

## Get Started

- [Quickstart](./quickstart)
- [Auth and Sessions](./auth-and-sessions)
- [API Examples](./examples)
- [Deployment](./deployment)

## What’s included

- Better Auth sign-in, sign-up, and session helpers
- Organization and active-space switching
- Bookings, personal records, and WOD results
- Runtime health and deployment checks
- Root-level REST paths on `api.vytal.fit`

## Core links

- OpenAPI spec: `https://api.vytal.fit/openapi`
- Health endpoint: `https://api.vytal.fit/health`
- API bridge: `https://api.vytal.fit/developer`
- Web app: `https://pro.vytal.fit`

## Highlights

- The public API uses nouns and query params, not RPC-style verbs.
- Browser clients send credentials cross-origin to `api.vytal.fit`.
- Org-scoped mutations require an active space on the session.
- Mobile clients talk to the API host directly.

## Route map

- `/auth/sign-in/email`
- `/auth/sign-up/email`
- `/auth/get-session`
- `/session`
- `/spaces`
- `/bookings`
- `/records`
- `/results`
- `/health`

## Deployment contract

- `BETTER_AUTH_URL` points at the API host
- `NEXT_PUBLIC_API_URL` points at the API host
- `NEXT_PUBLIC_APP_URL` points at the web host
- `EXPO_PUBLIC_API_URL` points at the API host for mobile
