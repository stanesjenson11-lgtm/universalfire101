# Design — Universal Fire

## Theme: "Night shift"
A calm room at dusk; a fire; foam. The site starts on **soot** (a deep logo-blue, never black) and, once the extinguisher has done its work on the home page, lives on **foam**. Dark only exists where fire does: the hero room, the fire scene, inner-page headers, the footer.

## Colour (tokens in `app/globals.css` `@theme`)
| Token | Value | Use |
|---|---|---|
| `soot` | oklch(0.219 0.045 261) #0E1A2F | hero room, fire scene, page headers, footer |
| `soot-raised` | oklch(0.261 0.049 261) | surfaces on soot |
| `foam` | oklch(0.976 0.003 264) #F6F7F9 | page ground |
| `foam-deep` | oklch(0.942 0.007 261) | quiet bands on foam |
| `ink` | oklch(0.216 0.027 258) #121A26 | text on foam (16.3:1) |
| `muted-foam` | oklch(0.468 0.033 258) | secondary text on foam only (6.4:1) |
| `muted-soot` | oklch(0.749 0.031 262) | secondary text on soot only (7.8:1) |
| `flame` | oklch(0.501 0.178 29) #B3261E | the extinguisher, primary CTAs. ≤10% of any screen |
| `tag` | oklch(0.834 0.158 89) #F2C230 | text-highlighter marks only (ink on tag 10.4:1) |
| `gauge` | oklch(0.5 0.11 155) | "approved / BIS" marks only |

Never: gradient text, a second accent, flame as a background wash.

## Type
- **Big Shoulders Display** (variable wght 100–900) — display. Civic-signage condensed. Sentence case. The variable-font components animate its `wght`.
- **Public Sans** (variable wght) — body, UI, specs (`tabular-nums`).
- No monospace. No tracked all-caps labels.
- Scale: display clamp(2.75rem, 9vw, 6rem) / h1 clamp(2.5rem, 6vw, 4.75rem) / h2 clamp(1.875rem, 4vw, 3.25rem) / h3 clamp(1.25rem, 2.2vw, 1.75rem) / body clamp(1rem, 1.1vw, 1.125rem), line-height 1.6 (1.7 on soot).

## Motif: the foam line
One organic edge, three uses: section seams (soot → foam), the link underline (a soft wave that fills in), the image reveal mask. Nothing else is ornamental.

## Layout
Full-bleed sections, `px-gutter`. Hairline rules instead of cards except where the fancy stacking-cards are the content. Prose measure ≤ 68ch. Spec tables align on tabular figures and scroll horizontally on phones, never wrap mid-value.

## Motion
- Lenis + GSAP ScrollTrigger (copied from Kickstart: `lib/motion.ts` `useGsap`, `SmoothScroll`).
- Ease-out-expo for reveals, `ease: none` for scrubs. No bounce, no elastic (the magnetic button's release is the one spring).
- The home page's **ExtinguisherShot** is the single orchestrated moment: a scrubbed timeline over plain numbers, fully reversible.
- Fancy components (fancycomponents.dev) provide type motion: letter-swap (hero), variable-font hover (page titles), cursor proximity (one statement per page + footer wordmark), number ticker (specs, 24/7), text highlighter (key words), stacking cards, marquee along a hose path, media between text.
- Reduced motion → finished states, crossfades only. Content is visible in CSS before any script runs.

## Z-index
base 0 · media 1 · content 2 · sticky 10 · stage 15 · nav 20 · overlay 30 · menu 40 · loader 50.
