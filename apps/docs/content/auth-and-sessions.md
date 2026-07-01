---
title: Authentication
category:
  uri: Core Concepts
slug: auth-and-sessions
position: 0
---

Every request to the Vytal API authenticates with an **organization API key**,
sent Stripe-style as a Bearer token:

```
Authorization: Bearer vk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The key both identifies you and scopes every call to exactly one organization
(the gym). You never pass an org id in a request: it is implied by the key.

## Getting a key

Keys are created and revoked from the Vytal app, under **Settings → API Keys**,
the same way you manage keys in Stripe. They cannot be minted through the API
itself.

1. Open **Settings → API Keys** in proVytal.
2. Click **Create API Key**, give it a name (e.g. "Zapier", "Website").
3. Copy the `vk_live_…` secret **immediately**: it is shown once and never
   stored in a recoverable form. If you lose it, revoke and create another.

A key stays valid until you revoke it. Revoking takes effect immediately.

## Using a key

```bash
curl https://api.vytal.fit/v1/members \
  -H 'authorization: Bearer vk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

```js
const res = await fetch("https://api.vytal.fit/v1/members", {
  headers: { authorization: `Bearer ${process.env.VYTAL_API_KEY}` },
});
const { items } = await res.json();
```

## Keep keys secret

- Treat a key like a password. Store it in a secret manager or an environment
  variable, never in client-side code, a public repo, or a mobile bundle.
- Use a separate key per integration so you can revoke one without disrupting
  the others.
- A missing or invalid key returns `401`; see [Errors](./errors).

## First-party vs third-party

Vytal's own web and mobile apps are first-party: they sign in with Better Auth
and talk to an internal surface directly. **Third-party integrations always use
an API key** against the public `/v1` gateway documented here: session-only
callers are rejected. That separation is deliberate, so external access is
always attributable to a key you control.
