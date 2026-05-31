---
name: motionsites-mythic-naturecore
description: Build a mystical, ethereal, and immersive, blending ancient ruins with a sense of hidden, primordial nature landing page in the style of motionsites.ai's "Mythic Naturecore" template. Triggers on requests mentioning "Mythic Naturecore", "motionsites mythic-naturecore", or the combination "landing page + mythic naturecore".
---

# Mythic Naturecore (motionsites-inspired)

Category: **landing page**.

## Source of inspiration
Public preview only: motionsites.ai → "Mythic Naturecore". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Mystical, ethereal, and immersive, blending ancient ruins with a sense of hidden, primordial nature.

## Palette
`#0C140D` · `#2D3B2E` · `#4B5D45` · `#7E8F72` · `#E8F2E1`

```css
:root {
  --background: #0C140D;
  --foreground: #2D3B2E;
  --muted: #4B5D45;
  --muted-foreground: #7E8F72;
  --accent: #E8F2E1;
  --border: #4B5D45;
}
```

## Typography
- **Display:** Cormorant Garamond, serif medium-italic
- **Body:** Inter, sans-serif light
- **Mono / caption:** JetBrains Mono, monospace regular uppercase

## Layout
The design uses a 'container-within-a-container' approach with a floating, rounded-corner viewport centered over a full-bleed background. Navigation is split-aligned at the top of the inner frame, sandwiching a central star icon to create ritualistic symmetry.

## Hero centerpiece
A hyper-realistic stone archway overgrown with ivy, framing a dense forest illuminated by dramatic god-rays.

## Motion
Slow, drifting parallax on the background forest layers to create depth. Light rays should pulse or shimmer subtly, while text elements use a soft fade-in with a 0.5s stagger.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid saturated or neon greens — keep the forest tones deep and earthy.
- Do not use heavy drop shadows on UI elements; rely on glassmorphism and light strokes.
- Avoid blocky or thick navigation bars; keep typography airy and minimal.
- Don't use aggressive, bouncy animations; keep the pace slow and cinematic.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
