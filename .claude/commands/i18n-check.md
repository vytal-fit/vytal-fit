---
description: "Find hardcoded strings that need i18n translation in Vytal"
---

# Vytal i18n Audit

Search the Vytal codebase for hardcoded user-facing strings that should be internationalized.

## Steps

1. Search `apps/web/src/` for hardcoded English or Portuguese strings in TSX files (look for text content in JSX, placeholder attributes, title attributes, aria-labels with text)
2. Cross-reference against existing translation keys
3. Report strings that are missing translations
4. All strings must exist in PT, EN, and ES

## Rules

- Only flag genuinely user-facing strings (not internal identifiers, CSS classes, or technical values)
- Group findings by file for easy fixing
- Suggest translation keys following existing naming conventions
