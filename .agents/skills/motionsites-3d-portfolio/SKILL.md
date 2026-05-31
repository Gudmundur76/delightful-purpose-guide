---
name: motionsites-3d-portfolio
description: "Build a dark, cinematic 3D portfolio landing page in the style of motionsites.ai's \"3D Portfolio\" template. Triggers on requests like \"3D portfolio\", \"cinematic portfolio landing\", \"WebGL hero portfolio\", \"motionsites-style portfolio\", or \"dark 3D personal site\". Use when the user wants a hero-dominant designer/developer portfolio with a 3D or pseudo-3D centerpiece, heavy typography, and slow ambient motion."
---

# 3D Portfolio (motionsites-inspired)

A design brief for a one-page portfolio with a 3D hero centerpiece, dark
ambient palette, oversized display type, and restrained motion.

## Source of inspiration
Public preview only: motionsites.ai → "3D Portfolio" (category: Portfolio).
Do NOT copy their prompt text or markup. Synthesize from this brief.

## When to apply
- "Build me a portfolio with a 3D hero"
- "Designer/developer personal site, dark and cinematic"
- "Motionsites-style 3D portfolio"
- Any request pairing "portfolio" + "3D / WebGL / cinematic / dark"

## Palette (oklch — paste into `src/styles.css`)

```css
:root {
  --background: oklch(0.14 0.01 270);   /* near-black, cool */
  --foreground: oklch(0.97 0.005 270);  /* off-white */
  --muted: oklch(0.22 0.01 270);
  --muted-foreground: oklch(0.65 0.01 270);
  --accent: oklch(0.78 0.18 75);        /* warm amber spotlight */
  --accent-foreground: oklch(0.14 0.01 270);
  --border: oklch(0.22 0.01 270);
  --primary: oklch(0.97 0.005 270);
  --primary-foreground: oklch(0.14 0.01 270);
  --radius: 0.5rem;
}
```

Rule: 92% near-black surfaces, 6% off-white type, 2% amber accent.
Never introduce a second accent.

## Typography

- **Display:** "Instrument Serif" or "Editorial New" — italic for the
  name/headline. Tracking -0.04em, line-height 0.92, weight 400.
- **Body:** "Inter" or "Geist" — weight 400, tracking -0.01em.
- **Mono caption:** "JetBrains Mono" — uppercase, 11px, tracking 0.2em,
  used for section eyebrows and metadata only.

Pair: one serif italic display + one neutral sans + one mono. No more.

## Layout

```text
┌──────────────────────────────────────────────┐
│ logo · nav (right-aligned, mono caps, 11px)  │
├──────────────────────────────────────────────┤
│                                              │
│   ROLE / LOCATION (mono eyebrow)             │
│                                              │
│   Name in italic serif, 160px+               │
│   ────────────────────                       │
│   one-line tagline, sans, 18px               │
│                                              │
│         [ 3D centerpiece, right 40% ]        │
│                                              │
├──────────────────────────────────────────────┤
│ Selected Work · grid 2-col, asymmetric       │
│ Each tile: still image → GIF on hover        │
└──────────────────────────────────────────────┘
```

Hero takes 100vh. 3D object floats right, name overlaps left.
No card chrome — work tiles bleed to background, separated by 1px borders only.

## 3D centerpiece

Three implementations, pick by available time:
1. **Three.js / React Three Fiber** — a single rotating object (torus knot,
   abstract mesh, or low-poly head). Slow rotation: 0.002 rad/frame.
   Single warm directional light from upper-right matching `--accent`.
2. **Spline embed** — if user has a scene URL, embed via
   `@splinetool/react-spline`.
3. **Fallback (no WebGL)** — animated CSS conic-gradient sphere with a
   slow 40s rotation. Always ship this as the no-JS fallback.

## Motion

- Hero name: split into characters, stagger fade-up on mount,
  duration 800ms, ease `cubic-bezier(0.22, 1, 0.36, 1)`, stagger 30ms.
- 3D object: continuous slow rotation, never user-controlled on first paint.
- Work tiles: scale 1 → 1.02 on hover, 400ms ease-out; still → GIF swap.
- Scroll: no parallax. No scroll-jacking. Sections cross-fade only if needed.

Use Motion for React (`motion/react`) — `motion.h1`, `motion.div`, `whileInView`.
Energy: cinematic and quiet, not flashy. One slow continuous motion + one
discrete reveal per section. Never both at once.

## Hard guardrails

- Never light mode. This skill is dark-only by design.
- Never more than one accent color.
- Never use Inter for the display headline — the serif italic IS the brand.
- Never autoplay sound.
- Work tile images must be optimized — hero GIF max 800KB, lazy-load below the fold.

## Implementation order

1. Drop the palette into `src/styles.css`.
2. Add the three font families via `<link>` in `__root.tsx` head.
3. Build the hero route (`src/routes/index.tsx`) with the layout above.
4. Add the 3D centerpiece (start with the CSS fallback, then upgrade).
5. Build the work grid.
6. Verify against grow-standard: per-route head/meta, JSON-LD `Person` +
   `CreativeWork[]`, llms.txt updated.

## Reference

See `references/brief.md` for the long-form design rationale.
