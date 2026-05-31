---
name: motionsites-haul
description: Build a industrial-modern and professional with a warm, high-contrast energetic backdrop footer section in the style of motionsites.ai's "HAUL!" template. Triggers on requests mentioning "HAUL!", "motionsites haul", or the combination "footer section + haul!".
---

# HAUL! (motionsites-inspired)

Category: **Footer Section**.

## Source of inspiration
Public preview only: motionsites.ai → "HAUL!". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Industrial-modern and professional with a warm, high-contrast energetic backdrop.

## Palette
`#FFFFFF` · `#F4F4F4` · `#6F7278` · `#212529` · `#FF6B00`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F4F4F4;
  --muted: #6F7278;
  --muted-foreground: #212529;
  --accent: #FF6B00;
  --border: #6F7278;
}
```

## Typography
- **Display:** Plus Jakarta Sans, Sans-Serif ExtraBold
- **Body:** Inter, Sans-Serif Regular
- **Mono / caption:** IBM Plex Mono, Medium (for uppercase labels)

## Layout
A two-tiered floating card with a horizontal divider. The top tier features a 4-column grid (Logo followed by 3 link columns), and the bottom tier contains legal copyright and a right-aligned social icon row.

## Hero centerpiece
Monochromatic orange industrial landscape with a semi-floating white card footer.

## Motion
Staggered fade-in for link columns. The background image should employ a subtle parallax scroll or a slow zoom-in scale effect. Social icons use a slight lift on hover.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use sharp 90-degree corners on the footer container.
- Avoid heavy drop shadows; use subtle elevation or none at all.
- Don't use color for link text; keep secondary text in neutral grays.
- Avoid crowded link columns; prioritize breathable white space.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
