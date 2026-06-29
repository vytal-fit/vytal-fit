---
title: API Examples
category:
  uri: developer
slug: examples
parent:
  uri: developer-api
---

# API Examples

Concrete request/response shapes for common Vytal workflows.

## Book a class

```bash
curl -X POST https://api.vytal.fit/bookings \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <token>' \
  -d '{"classId":"class_123","memberId":"mem_123"}'
```

## Cancel a booking

```bash
curl -X DELETE https://api.vytal.fit/bookings/book_123 \
  -H 'authorization: Bearer <token>'
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

## Response expectations

- `GET` returns lists or single resources.
- `POST` creates records and returns the created entity.
- `PATCH` updates an existing entity.
- `DELETE` returns the cancelled or removed resource when applicable.
