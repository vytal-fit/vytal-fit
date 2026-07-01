---
title: Server & Integrations
category:
  uri: Guides
slug: mobile
position: 1
---

Server-to-server callers, background jobs, and partner integrations all talk to
the same `https://api.vytal.fit/v1` surface with an organization API key.

> 📘 Key handling by design
>
> The API key is a long-lived secret. Store it in your platform's secret manager
> or an environment variable, send it as `Authorization: Bearer vk_live_…`, and
> never ship it in client-side or mobile code where it can be extracted.

## Base URL

```bash
VYTAL_API_URL=https://api.vytal.fit/v1
VYTAL_API_KEY=vk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Making calls

```bash
# read: your gym's members
curl "$VYTAL_API_URL/members" \
  -H "authorization: Bearer $VYTAL_API_KEY"

# write: record a check-in
curl -X POST "$VYTAL_API_URL/check-ins" \
  -H "authorization: Bearer $VYTAL_API_KEY" \
  -H 'content-type: application/json' \
  -d '{"memberId":"mem_123"}'
```

## Rules

- Keep the key server-side; treat it like a password.
- Use one key per integration, so you can revoke a single one cleanly.
- `memberId` and the organization are resolved from the key and the request,
  never client-supplied org ids.
- Retry `429` and `503` with backoff; don't retry `4xx` without changing the
  request. See [Errors](./errors).

## Vytal's own mobile app

The Vytal iOS/Android app is first-party: it signs in with Better Auth and uses
a session token against an internal surface, not a `vk_live_` key. Third-party
apps and services use API keys as shown above.
