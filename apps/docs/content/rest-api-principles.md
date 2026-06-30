---
title: REST Principles
category:
  uri: developer
slug: rest-api-principles
parent:
  uri: developer-api
---

The public API is intentionally resource-oriented.

## Rules

- Prefer nouns over verbs.
- Use query parameters for filters.
- Keep paths short and stable.
- Avoid prefixed public URLs.
- Return the resource being acted on when that makes sense.
- Use `404` for missing org-scoped resources.

## Path shape

- `/auth/*` for authentication
- `/me/session` for the current session resource
- `/organizations` for organization discovery
- `/bookings` for booking lifecycle
- `/records` for personal records
- `/results` for WOD results
- `/health` for runtime checks

## Examples

Good:

```bash
curl 'https://api.vytal.fit/results?memberId=mem_123&wodId=wod_123'
```

Less good:

```bash
curl 'https://api.vytal.fit/results?memberId=mem_123'
```

## Why this matters

- Easier to document
- Easier to test
- Easier to use from mobile and partner tools
- Easier to keep stable across app splits
