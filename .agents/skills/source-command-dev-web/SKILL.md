---
name: "source-command-dev-web"
description: "Start Vytal web development server"
---

# source-command-dev-web

Use this skill when the user asks to run the migrated source command `dev-web`.

## Command Template

Start the Vytal web app development server.

## Steps

1. Check that dependencies are installed — if `node_modules` looks stale or missing, run `npm install` first.
2. Verify `apps/web/.env.local` exists. If not, create it from the example:
   ```
   cp apps/web/.env.example apps/web/.env.local
   ```
   Generate `BETTER_AUTH_SECRET` with:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Start the dev server:
   ```
   npm run dev:web
   ```
   This starts Next.js at http://localhost:3000 via Turborepo, watching all `@vytal-fit/*` packages.

## Troubleshooting

- **Port 3000 in use** — kill the process or set a different port: `PORT=3001 npm run dev:web`
- **DB errors** — check DATABASE_URL in `.env.local`
- **Missing env vars** — compare `.env.local` against `.env.example`
