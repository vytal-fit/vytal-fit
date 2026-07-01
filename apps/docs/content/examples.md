---
title: API Examples
category:
  uri: Guides
slug: examples
position: 0
---

Concrete request and response shapes for the most common Vytal workflows.

> 📘 Every call needs an API key
>
> The examples below send `Authorization: Bearer $VYTAL_API_KEY`. Create a key
> in **Settings → API Keys** (see [Authentication](./auth-and-sessions)). The
> base URL is `https://api.vytal.fit/v1`.

## Book a class

A full class auto-waitlists instead of failing.

```bash
curl -X POST https://api.vytal.fit/v1/bookings/book \
  -H "authorization: Bearer $VYTAL_API_KEY" \
  -H 'content-type: application/json' \
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
curl -X POST https://api.vytal.fit/v1/bookings/cancel \
  -H "authorization: Bearer $VYTAL_API_KEY" \
  -H 'content-type: application/json' \
  -d '{"bookingId":"book_123"}'
```

## Add a personal record

```bash
curl -X POST https://api.vytal.fit/v1/personal-records \
  -H "authorization: Bearer $VYTAL_API_KEY" \
  -H 'content-type: application/json' \
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
curl -X POST https://api.vytal.fit/v1/wod-results \
  -H "authorization: Bearer $VYTAL_API_KEY" \
  -H 'content-type: application/json' \
  -d '{
    "wodId":"wod_123",
    "memberId":"mem_123",
    "score":"7:52",
    "scoreType":"time",
    "scale":"rx",
    "isPR":true
  }'
```

## List with filters

```bash
curl 'https://api.vytal.fit/v1/wod-results?memberId=mem_123&wodId=wod_123' \
  -H "authorization: Bearer $VYTAL_API_KEY"
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
