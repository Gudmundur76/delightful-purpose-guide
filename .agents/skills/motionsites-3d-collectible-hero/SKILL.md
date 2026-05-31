---
name: motionsites-3d-collectible-hero
description: "Build a playful, vibrant, and tactile; mimicking a high-end collectible toy gallery or digital showroom 3d website in the style of motionsites.ai's \"3D Collectible Hero\" template. Triggers on requests mentioning \"3D Collectible Hero\", \"motionsites 3d-collectible-hero\", or the combination \"3d website + 3d collectible hero\"."
---

# 3D Collectible Hero (motionsites-inspired)

Category: **3D Website**.

## Source of inspiration
Public preview only: motionsites.ai → "3D Collectible Hero". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Playful, vibrant, and tactile; mimicking a high-end collectible toy gallery or digital showroom.

## Palette
`#E078A1` · `#FDEFF4` · `#333333` · `#FFFFFF` · `#FFFFFF`

```css
:root {
  --background: #E078A1;
  --foreground: #FDEFF4;
  --muted: #333333;
  --muted-foreground: #FFFFFF;
  --accent: #FFFFFF;
  --border: #333333;
}
```

## Typography
- **Display:** Impact or Bebas Neue, Sans-serif Extra Bold
- **Body:** Inter, Sans-serif Regular
- **Mono / caption:** JetBrains Mono, Medium (for secondary labels or technical specs)

## Layout
Center-weighted hero composition using 'sandwich layering' where the 3D subject sits between a background typographic mask and foreground UI elements. Secondary figurines are distributed at 1/3 and 2/3 horizontal points to provide scale and balance.

## Hero centerpiece
High-fidelity 3D character model with tactile textures (fleece/vinyl) and 'Z-axis' depth layering behind typography.

## Motion
Floating idle animations for 3D assets with slow-rotation on the Y-axis. Parallax depth effect where small background figurines move at a slower rate than the primary centerpiece when scrolling or moving the mouse.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid thin or high-contrast serif fonts that break the 'toy box' aesthetic.
- Do not use flat colors; the background must have a subtle radial vignette for depth.
- Never place characters entirely in front of the text; use layering to sandwich them for depth.
- Avoid harsh shadows; keep lighting soft, top-down, and studio-quality.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
