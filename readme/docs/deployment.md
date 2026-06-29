---
title: Deployment
category:
  uri: developer
slug: deployment
parent:
  uri: developer-api
---

# Deployment

Vytal uses three production origins:

- `vytal.fit` for marketing and public pages
- `pro.vytal.fit` for the app
- `api.vytal.fit` for API, auth, and developer docs bridge

## Notes

- Auth and API are separate from the app origin.
- The deployment config maps each client to the correct origin.
- The docs workflow syncs to ReadMe on push to `main`.
- The API root rewrites to the developer docs bridge page.
