---
name: motionsites-kresna-footer
description: Build a sophisticated and futuristic, blending high-tech ai aesthetics with approachable, humanistic handwritten accents footer section in the style of motionsites.ai's "Kresna Footer" template. Triggers on requests mentioning "Kresna Footer", "motionsites kresna-footer", or the combination "footer section + kresna footer".
---

# Kresna Footer (motionsites-inspired)

Category: **Footer Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Kresna Footer". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Sophisticated and futuristic, blending high-tech AI aesthetics with approachable, humanistic handwritten accents.

## Palette
`#F2F2F2` · `#0A1128` · `#8E9AAF` · `#FFFFFF` · `#2B59FF`

```css
:root {
  --background: #F2F2F2;
  --foreground: #0A1128;
  --muted: #8E9AAF;
  --muted-foreground: #FFFFFF;
  --accent: #2B59FF;
  --border: #8E9AAF;
}
```

## Typography
- **Display:** Plus Jakarta Sans, semi-bold for micro-headlines.
- **Body:** Inter or sans-serif bold for primary links and labels.
- **Mono / caption:** Custom Brush Script or 'Dancing Script' for expressive accent callouts.

## Layout
A side-by-side modular grid where the left card acts as a brand mission statement and the right card serves as the functional directory. Elements are anchored to the corners, with a floating 3D brand badge breaking the top-right boundary.

## Hero centerpiece
A dual-pane bento-style footer with a high-contrast generative blue cosmic gradient card paired with a clean off-white navigational container.

## Motion
Subtle parallax on the background gradient waves. The 3D 'K' badge should have a floating, slow-bobbing hover effect, while the social icons utilize a gentle scale-up on interaction.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use sharp 90-degree corners; maintain a minimum 40px radius on container cards.
- Avoid standard sans-serif italics; use the handwritten script font exclusively for 'accent' text.
- Do not use solid black backgrounds for the gradient card; use deep navy-to-blue transitions.
- Don't overcrowd the white-space; the layout relies on generous padding for a premium feel.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
