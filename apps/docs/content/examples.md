---
title: API Examples
category:
  uri: Guides
slug: examples
position: 0
---

Concrete request and response shapes for the most common Vytal workflows.

> 📘 Every call needs a session
>
> The examples below use a bearer token (`Authorization: Bearer <token>`).
> Browser apps send the session cookie with `credentials: "include"` instead.
> See [Auth and Sessions](./auth-and-sessions).

## Book a class

A full class auto-waitlists instead of failing.

```bash
curl -X POST https://api.vytal.fit/bookings \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <token>' \
  -d '{"classId":"class_123","memberId":"mem_123"}'
```

```json
{
  "id": "book_123",
  "classId": "class_123",
  "memberId": "mem_123",
  "status": "booked",
  "createdAt": "2026-06-30T10:30:00.000Z"
}
```

## Cancel a booking

```bash
curl -X DELETE https://api.vytal.fit/bookings/book_123 \
  -H 'authorization: Bearer <token>'
```

```json
{ "id": "book_123", "status": "cancelled" }
```

## Add a personal record

```bash
curl -X POST https://api.vytal.fit/records \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <token>' \
  -d '{
    "memberId":"mem_123",
    "exerciseId":"thruster",
    "value":"82.5",
    "unit":"kg",
    "achievedAt":"2026-06-29T10:30:00.000Z"
  }'
```

## Save a WOD result

```bash
curl -X POST https://api.vytal.fit/results \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <token>' \
  -d '{
    "wodId":"wod_123",
    "memberId":"mem_123",
    "score":"7:52",
    "scoreType":"time",
    "scale":"rx",
    "isPR":true
  }'
```

## Query with filters

```bash
curl 'https://api.vytal.fit/results?memberId=mem_123&wodId=wod_123' \
  -H 'authorization: Bearer <token>'
```

```json
{ "items": [ { "id": "res_123", "score": "7:52", "scale": "rx", "isPR": true } ] }
```

## What you get back

- `GET` returns a single resource, or `{ "items": [...] }` for a collection.
- `POST` creates and returns the new resource (`201`).
- `PATCH` updates and returns the resource (`200`).
- `DELETE` returns the affected resource (`200`).
- Errors share [one shape](./errors); list responses follow the
  [conventions](./conventions).
