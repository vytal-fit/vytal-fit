---
description: "Plan and implement a new feature for Vytal following project conventions"
argument_name: feature_description
---

# Add Feature to Vytal

Implement the requested feature: $ARGUMENTS

## Pre-flight Checklist

Before writing any code:

1. **Scope check:** This feature must be for the Vytal product only. Do not introduce patterns, dependencies, or integrations from other organizations.

2. **Read existing code:** Understand the current patterns in the relevant area before making changes. Check:
   - `packages/shared/src/` for existing types and constants
   - `packages/api/src/routers/` for existing API patterns
   - `packages/db/src/schema.ts` for the database schema
   - Existing pages/components in `apps/web/`

3. **PRD check:** Cross-reference with `docs/PRD.md` for the relevant user stories and acceptance criteria.

4. **i18n:** All user-facing strings must be added in PT, EN, and ES.

5. **Theming:** All UI must work in both light and dark mode.

6. **Shared types:** If the feature involves data types, define them in `packages/shared/`.

## Implementation Order

1. Schema changes (if needed) → `packages/db/`
2. Shared types/constants → `packages/shared/`
3. API routes → `packages/api/src/routers/`
4. UI implementation → `apps/web/`
5. Translations → i18n files
6. Verify build: `npm run type-check`
