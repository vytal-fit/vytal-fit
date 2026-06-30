---
title: Conventions
category:
  uri: Core Concepts
slug: conventions
position: 1
---

What holds true across every endpoint.

## Base URL & format

- Production `https://api.vytal.fit` · Local `http://localhost:3001`.
- Requests and responses are JSON (`content-type: application/json`).

## Authentication

Two equivalent modes from one sign-in (see [Auth and Sessions](./auth-and-sessions)):
a session **cookie** (browser) or `Authorization: Bearer <token>` (mobile/server).

## Organization scope

Every resource belongs to your **active organization**. You never pass an org id
in a body: the server reads it from the session. Change it with
`PATCH /me/session`. Ids from another org resolve to `404`.

> 🚧 Never trust a client-supplied org id
>
> The active organization comes from the session, not the request body. This is
> what makes cross-tenant access impossible: an id from another gym is a `404`,
> not a leak.

## Lists

List endpoints return a wrapper:

```json
{ "items": [ /* ... */ ] }
```

Where present, a `nextCursor` carries cursor-based pagination: pass it back as
`?cursor=` to fetch the next page.

## Writes

`POST` returns the created entity (`201`); `PATCH` returns the updated entity
(`200`); `DELETE` returns the affected entity (`200`).

## Dates

Timestamps are ISO-8601 UTC (`2026-06-30T10:30:00.000Z`); calendar dates are
`YYYY-MM-DD`.

## Idempotency

Reads and `PATCH`/`DELETE` are safe to retry. Creates are **not yet** idempotent
(no idempotency key): after a network timeout, `GET` to check before retrying
so you don't create duplicates. Idempotency keys are on the roadmap.

## Versioning

The contract is published at [`/openapi.json`](https://api.vytal.fit/openapi.json).
Breaking changes ship under a new version; superseded routes are flagged
`deprecated` in the spec and kept working through a transition window.
