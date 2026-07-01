---
title: Errors
category:
  uri: Core Concepts
slug: errors
position: 2
---

Every error returns the same JSON shape, with the matching HTTP status:

```json
{ "error": "NOT_FOUND", "message": "Booking not found." }
```

- `error`: a stable, machine-readable code. Branch on this.
- `message`: a human-readable explanation. Show or log it; don't parse it.

## Status codes

| Status | `error` | When |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Missing or invalid input (e.g. `memberId is required`). |
| 401 | `UNAUTHORIZED` | Missing or invalid API key. Send `Authorization: Bearer vk_live_…`. |
| 403 | `FORBIDDEN` | Valid key, but the action isn't allowed for its organization. |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded. Back off and retry. |
| 404 | `NOT_FOUND` | The resource doesn't exist **in your active org**. |
| 409 | `CONFLICT` | State conflict (e.g. duplicate booking, cancelling twice). |
| 503 | `SERVICE_UNAVAILABLE` | Backend not configured or database unreachable. |

## Behaviour worth knowing

- **Tenant isolation is a 404.** An id that belongs to another gym looks like it
  simply doesn't exist: never rely on `403` vs `404` to probe for resources.
- Validation failures are `400`, with the `message` naming the offending field.
- Retry `503` with backoff; it's transient. Don't retry `4xx` without changing
  the request.
