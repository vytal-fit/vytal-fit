---
title: Quickstart
category:
  uri: developer
slug: quickstart
parent:
  uri: developer-api
---

# Quickstart

This guide shows the shortest path from no context to a working Vytal API
integration.

## 1. Read the contract

Start with the [Developer API](./developer-api) hub and the
[OpenAPI spec](https://api.vytal.fit/openapi.json).

## 2. Sign in

```bash
curl -X POST https://api.vytal.fit/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"jose@vytal.fit","password":"VytalDemo2026!"}'
```

## 3. Fetch the session

```bash
curl https://api.vytal.fit/auth/session \
  -H 'authorization: Bearer <token>'
```

## 4. Load organizations

```bash
curl https://api.vytal.fit/organizations \
  -H 'authorization: Bearer <token>'
```

## 5. Switch the active organization

```bash
curl -X PATCH https://api.vytal.fit/me/session \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <token>' \
  -d '{"activeOrganizationId":"org_123"}'
```

## 6. Make a business request

Once the session is active, the same token can be used for bookings, records,
and results.

```bash
curl -X GET 'https://api.vytal.fit/bookings?memberId=mem_123' \
  -H 'authorization: Bearer <token>'
```

## What to expect

- Responses use JSON.
- Filters use query parameters.
- Writes return the created or updated entity.
- Missing org context should fail clearly instead of leaking data.
