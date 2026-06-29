---
title: Developer API
category:
  uri: developer
slug: developer-api
---

# Vytal Developer API

The Vytal API is served from `api.vytal.fit`. The web app lives on
`pro.vytal.fit`, while the landing site stays on `vytal.fit`.

This ReadMe space documents the public contract used by the web and mobile
clients:

- Better Auth sign-in, sign-up, and session helpers
- Organization and active-space switching
- Bookings, personal records, and WOD results
- Runtime health

## Core links

- OpenAPI spec: `https://api.vytal.fit/openapi`
- Health endpoint: `https://api.vytal.fit/api/health`
- Web app: `https://pro.vytal.fit`

## Deployment contract

- `BETTER_AUTH_URL` points at the API host
- `NEXT_PUBLIC_API_URL` points at the API host
- `NEXT_PUBLIC_APP_URL` points at the web host
- Mobile uses `EXPO_PUBLIC_API_URL`

## Notes

- Auth sessions are cookie-based and require credentials on cross-origin
  requests.
- Organization-scoped mutations require an active space on the session.
- The API stays separate from the web app by design.
