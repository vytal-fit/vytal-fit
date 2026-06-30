# Vytal — Brand

Master brand assets. Source of truth; the apps consume copies (favicon
`src/app/icon.svg`, public logos).

## Logo

- **Concept:** a vital-sign pulse — *Vytal = vital* + fitness/health — on a
  rounded green tile, paired with the lowercase `vytal.` wordmark.
- `vytal-mark.svg` — the symbol (favicon, app icon, avatar).
- `vytal-logo.svg` — horizontal lockup for **light** backgrounds.
- `vytal-logo-dark.svg` — horizontal lockup for **dark** backgrounds.
- `*.png` — rasterized exports (transparent).

## Colors

| Token | Hex | Use |
| :-- | :-- | :-- |
| Green (brand) | `#22c55e` | mark tile, accent, the `.` |
| Ink | `#08120c` | pulse stroke on the green tile |
| Wordmark (light bg) | `#0f1610` | `vytal` on light |
| Wordmark (dark bg) | `#dceee0` | `vytal` on dark |
| Dark bg | `#080c0a` | app background |

## Type

Wordmark: geometric sans (Inter / system), weight 700, tight tracking.
Body: Inter · code: JetBrains Mono.

## Usage

- Pick the lockup that matches the background (light vs dark).
- Don't recolor the tile or stretch the lockup; keep clear space ≈ the tile's
  corner radius around it.
- Favicon: each app serves `vytal-mark.svg` via `src/app/icon.svg`.
