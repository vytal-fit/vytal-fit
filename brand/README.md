# Vytal · Brand

The Vytal visual identity, in one place. A vital sign for fitness businesses:
one pulse across the brand and its products.

## What's in this folder

| File | What it is |
| :-- | :-- |
| `vytal-brand.html` | The full brand study (open in a browser). Self-contained, light/dark friendly. |
| `vytal-brand.pdf` | Print/share version of the study (A4). |
| `vytal-mark.svg` · `.png` · `vytal-mark-256.png` | The symbol (favicon, app icon, avatar). |
| `vytal-logo.svg` · `.png` | Horizontal lockup for **light** backgrounds. |
| `vytal-logo-dark.svg` · `.png` | Horizontal lockup for **dark** backgrounds. |
| `myvytal-logo.svg` · `-dark.svg` (+ `.png`) | **myVytal** lockup (athlete portal), light + dark. |
| `provytal-logo.svg` · `-dark.svg` (+ `.png`) | **proVytal** lockup (staff backoffice), light + dark. |

A live, interactive version (with PT/EN/ES and a light/dark toggle) ships at
**`/brand`** on the landing site. Master vector assets are mirrored from
`packages/shared/brand/`; the per-app favicon is served via `src/app/icon.svg`.

## The mark

A vital-sign **pulse** (Vytal = vital + fitness/health) drawn in ink on a
rounded green tile, paired with the lowercase `vytal.` wordmark. The pulse is
the constant: never recolour the tile or the stroke, never add gradients.

## Colour

| Token | Hex | Use |
| :-- | :-- | :-- |
| Green (brand) | `#22c55e` | Mark tile, accent, the `.` |
| Background | `#080c0a` | App ground (green-tinted black, chosen over pure #000) |
| Surface | `#0f1610` | Panels, cards |
| Text | `#dceee0` | Foreground on dark |
| Ink | `#08120c` | Pulse stroke on the green tile |
| Wordmark on light | `#0f1610` | `vytal` on light backgrounds |

**Signal colours** (`#00d4ff` cyan · `#ffb300` amber · `#ff4757` red · `#c084fc`
violet) are for **data and status only**, never the brand.

## Type

- **Display / body:** Inter. The wordmark is Inter 800, tight tracking.
- **Code / data:** JetBrains Mono.

## Sub-brands · pro & my

The product name leads, as one word, with the green prefix carrying the brand
colour and "Vytal" in full:

- **myVytal** : the athlete's own space (member portal, `my.vytal.fit`).
- **proVytal** : for the people who run the box (backoffice, `pro.vytal.fit`).

The pulse tile never changes, and the app icon is always the single Vytal mark.
"my" leads naturally as a prefix; "Pro" can still be spoken as a suffix in prose
("Vytal Pro"), but the lockup is one word.

## Theming docs.vytal.fit (ReadMe)

`docs.vytal.fit` is hosted by ReadMe, themed in the dashboard (the API does not
write appearance). Make it on-brand under **Configuration → Appearance**:

1. **Theme:** Dark (default). **Primary colour:** `#22c55e` (already set).
2. **Background (dark):** `#080c0a`. **Border (dark):** `#1e2a22`.
3. **Logo:** upload `myvytal`-style master `vytal-logo-dark.png` (dark theme) and
   `vytal-logo.png` (light). **Favicon:** `vytal-mark-256.png`.
4. **Custom CSS:** paste `readme-theme.css` from this folder (typographic + code
   polish; may require a paid plan).

## Usage

**Do**
- Pick the lockup that fits the background: light vs dark.
- Keep clear space around the logo ≈ the tile's corner radius.
- Let the pulse breathe; the green tile is the constant.

**Don't**
- Recolour the tile or the pulse, or add gradients.
- Stretch, rotate, or outline the lockup.
- Use the signal colours (cyan/amber/red) as the brand.
