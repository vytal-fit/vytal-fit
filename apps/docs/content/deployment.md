---
title: Deployment
category:
  uri: developer
slug: deployment
parent:
  uri: developer-api
---

Vytal uses four production origins:

- `vytal.fit` for marketing and public pages
- `pro.vytal.fit` for the app
- `my.vytal.fit` for the athlete portal
- `api.vytal.fit` for API, auth, and the machine-readable contract

## Notes

- Auth and API are separate from the app origin.
- Each Vercel project uses the matching monorepo root directory: `apps/landing`,
  `apps/pro`, `apps/my`, or `apps/api`.
- Production Git deployments are restricted to `main`.
- `turbo-ignore` lets Vercel skip unaffected projects in the monorepo.
- Environment variables that affect production builds are listed in the root
  `turbo.json` `globalEnv` array so Turborepo and Vercel hash builds correctly.
- The docs workflow syncs `apps/api/readme` and the OpenAPI contract to ReadMe.
- The API root redirects to `/openapi.json`.

## Environment ownership

- `api`: database URLs, Better Auth secrets/origin, Google OAuth, S3, Brevo,
  email provider config, and any server-only integration keys.
- `pro` and `my`: `NEXT_PUBLIC_API_URL` pointing to `https://api.vytal.fit`.
- `mobile`: `EXPO_PUBLIC_API_URL` pointing to `https://api.vytal.fit`.
- `landing`: only public marketing/runtime variables needed by the public site.
