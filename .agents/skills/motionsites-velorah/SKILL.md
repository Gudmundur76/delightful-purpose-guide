---
name: motionsites-velorah
description: "Build a enchanting, ethereal, and intellectual; a blend of mystical surrealism and high-end boutique agency sophistication agency in the style of motionsites.ai's \"Velorah\" template. Triggers on requests mentioning \"Velorah\", \"motionsites velorah\", or the combination \"agency + velorah\"."
---

# Velorah (motionsites-inspired)

Category: **Agency**.

## Source of inspiration
Public preview only: motionsites.ai → "Velorah". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Enchanting, ethereal, and intellectual; a blend of mystical surrealism and high-end boutique agency sophistication.

## Palette
`#022A42` · `#0F4C75` · `#FDE68A` · `#E2E8F0` · `#FFFFFF`

```css
:root {
  --background: #022A42;
  --foreground: #0F4C75;
  --muted: #FDE68A;
  --muted-foreground: #E2E8F0;
  --accent: #FFFFFF;
  --border: #FDE68A;
}
```

## Typography
- **Display:** Cormorant Garamond or Editorial New, Light/Regular weight with italic accents.
- **Body:** Inter or similar clean Geometric Sans-Serif, Regular weight, increased letter spacing.
- **Mono / caption:** Space Mono or any light-weight Monospace for navigation and small callouts.

## Layout
Centric and symmetrical composition with a floating navigation bar and a multi-level typographical hierarchy. Content is layered over a full-bleed immersive background image with significant negative space in the upper half.

## Hero centerpiece
Surrealist, high-grain cinematic photography featuring a glowing floral digital workspace under a vast starlit sky.

## Motion
Subtle parallax on the background stars; text elements should fade and rise slowly from bottom to top (3-second duration). Hover states on buttons use a soft glow expansion rather than a color snap.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use standard geometric shapes; keep edges soft and atmospheric.
- Avoid pure blacks or high-contrast white backgrounds; stick to the deep midnight blue.
- Do not use sans-serif for headlines; the elegance relies on the serif contrast.
- Avoid fast or jarring transitions; the brand is built on 'silence' and 'focus'.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
