---
description: "Build Vytal web app for production"
---

Build the Vytal web application for production deployment.

## Steps

1. Run type checking first to catch errors early:
   ```
   npm run type-check
   ```
2. Run linting:
   ```
   npm run lint
   ```
3. Build the web app:
   ```
   npm run build:web
   ```
   This builds `@vytal-fit/web` along with its dependencies (`@vytal-fit/api`, `@vytal-fit/db`, `@vytal-fit/auth`, `@vytal-fit/shared`).

4. Report any build errors clearly.

## Running tests

```
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```
