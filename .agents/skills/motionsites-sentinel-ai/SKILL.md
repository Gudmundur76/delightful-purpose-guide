---
name: motionsites-sentinel-ai
description: Build a technological, secure, and imposing; an 'industrial cyberpunk' aesthetic that emphasizes structural integrity and precision hero section in the style of motionsites.ai's "Sentinel AI" template. Triggers on requests mentioning "Sentinel AI", "motionsites sentinel-ai", or the combination "hero section + sentinel ai".
---

# Sentinel AI (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Sentinel AI". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Technological, secure, and imposing; an 'industrial cyberpunk' aesthetic that emphasizes structural integrity and precision.

## Palette
`#0A0A0A` · `#1A1A1A` · `#FFFFFF` · `#333333` · `#00FF00`

```css
:root {
  --background: #0A0A0A;
  --foreground: #1A1A1A;
  --muted: #FFFFFF;
  --muted-foreground: #333333;
  --accent: #00FF00;
  --border: #FFFFFF;
}
```

## Typography
- **Display:** Montserrat, sans-serif Black (900 weight) uppercase
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, monospace light for utility text/captions

## Layout
Full-bleed immersive hero with a top-aligned navigation bar featuring a boxed CTA. The text content is left-aligned in the lower-third, utilizing a vertical stack of headline, subheadline, and dual-action buttons.

## Hero centerpiece
A high-density 3D geometric grid of matte black extruded cubes with varying heights, creating a tactile, architectural backdrop.

## Motion
Subtle parallax movement of the 3D cube background tied to mouse movement. Text elements should employ a 'staggered reveal' from bottom to top with a heavy easing function (e.g., cubic-bezier(0.16, 1, 0.3, 1)).

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid high-gloss or reflective surfaces on the 3D cubes; maintain a matte/industrial finish.
- Do not use gradients in the typography except for the core accent green.
- Avoid rounded corners on buttons; keep a 4px to 6px radius for a technical feel.
- Do not use thin or light font weights for headlines; maintain a heavy, authoritative presence.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
