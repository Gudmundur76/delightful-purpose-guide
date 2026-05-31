---
name: motionsites-portal
description: "Build a epic, cinematic, and adventurous with a sense of mysterious grand-scale exploration hero section in the style of motionsites.ai's \"Portal\" template. Triggers on requests mentioning \"Portal\", \"motionsites portal\", or the combination \"hero section + portal\"."
---

# Portal (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Portal". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Epic, cinematic, and adventurous with a sense of mysterious grand-scale exploration.

## Palette
`#0A0A0A` · `#1A1A1A` · `#FFFFFF` · `#E2E8F0` · `#FF6B35`

```css
:root {
  --background: #0A0A0A;
  --foreground: #1A1A1A;
  --muted: #FFFFFF;
  --muted-foreground: #E2E8F0;
  --accent: #FF6B35;
  --border: #FFFFFF;
}
```

## Typography
- **Display:** Inter, sans-serif medium (tight tracking)
- **Body:** Inter, sans-serif regular
- **Mono / caption:** Roboto Mono, monospace (for metadata/dates)

## Layout
Full-screen immersive hero with a top-aligned glassmorphic navigation bar and bottom-weighted content stack. Text and CTA elements are anchored to the bottom third to maximize the visual impact of the landscape.

## Hero centerpiece
Cinematic landscape photography with a central monolithic 'portal' structure and high atmospheric fog/mist.

## Motion
Subtle parallax on the background image during scroll. Main headline uses a 'fade-in and slide-up' entrance, while the background mist should have a slow, rolling loop animation.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Don't use drop shadows on text; rely on the image's natural dark gradients for legibility.
- Avoid harsh corners; all buttons and pills must use high-degree border-radius (stadium shape).
- Don't crowd the center; maintain the vertical 'light path' created by the portal.
- Avoid saturated primary colors; keep the UI elements monochrome to let the imagery dominate.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
