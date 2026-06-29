---
title: Auth and Sessions
category:
  uri: developer
slug: auth-and-sessions
parent:
  uri: developer-api
---

# Auth and Sessions

Use the Better Auth endpoints on `api.vytal.fit` for all session management.

## Endpoints

- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-up/email`
- `GET /api/auth/get-session`
- `PATCH /api/session`

## Auth model

- Email/password auth is enabled
- Google social login is enabled when the deployment is configured for it
- The active organization comes from the session, not from the client

## Client rules

- Send credentials on every browser request
- Use the session wrapper for active-space changes
