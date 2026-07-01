---
title: Conventions
category:
  uri: Core Concepts
slug: conventions
position: 1
---

What holds true across every endpoint.

## Base URL & format

- Production `https://api.vytal.fit/v1` · Local `http://localhost:3001/v1`.
- Requests and responses are JSON (`content-type: application/json`).

## Authentication

Every request carries an organization API key as a Bearer token
(`Authorization: Bearer vk_live_…`). See [Authentication](./auth-and-sessions).

## Organization scope

Every resource belongs to the organization behind your key. You never pass an
org id in a body: the server reads it from the key. Ids from another org resolve
to `404`.

> 🚧 Never trust a client-supplied org id
>
> The active organization comes from the API key, not the request body. This is
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

The base path is `/v1`. The contract is published at
[`/openapi.json`](https://api.vytal.fit/openapi.json). Breaking changes ship
under a new version; superseded routes are flagged `deprecated` in the spec and
kept working through a transition window.
