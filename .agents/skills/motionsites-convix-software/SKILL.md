---
name: motionsites-convix-software
description: Build a optimistic, airy, and sophisticated, blending professional saas functionality with a dreamlike, natural aesthetic saas in the style of motionsites.ai's "Convix Software" template. Triggers on requests mentioning "Convix Software", "motionsites convix-software", or the combination "saas + convix software".
---

# Convix Software (motionsites-inspired)

Category: **SaaS**.

## Source of inspiration
Public preview only: motionsites.ai → "Convix Software". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Optimistic, airy, and sophisticated, blending professional SaaS functionality with a dreamlike, natural aesthetic.

## Palette
`#F7F3F0` · `#0D1117` · `#FF4F18` · `#8E9AAF` · `#FF4F18`

```css
:root {
  --background: #F7F3F0;
  --foreground: #0D1117;
  --muted: #FF4F18;
  --muted-foreground: #8E9AAF;
  --accent: #FF4F18;
  --border: #FF4F18;
}
```

## Typography
- **Display:** Plus Jakarta Sans, sans-serif bold 700 with Editorial New, serif light italic for emphasis
- **Body:** Inter, sans-serif regular 400
- **Mono / caption:** JetBrains Mono, monospace 400 for data points and small captions

## Layout
A focused center-aligned hero section with a floating navigation bar at the top and a three-column 'App Preview' dashboard anchored at the bottom edge. Elements use extreme 'pill' rounding and generous white space to create a light, air-filled composition.

## Hero centerpiece
High-contrast headline with mixed typography overlaid on a photorealistic sky background featuring butterflies, leading into a floating 3-column dashboard UI.

## Motion
Parallax scrolling on background sky elements and butterflies to create depth. Components should use 'spring' easing for hover states (especially buttons), and the dashboard should slide up with a staggered fade-in of individual cards.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid heavy shadows; use subtle inner borders or glassmorphism instead.
- Do not use standard sans-serif for emphasis words; always use the serif italic variant.
- Precision in spacing: ensure buttons have large pill-shaped corner radii (100px) rather than standard 8px corners.
- Never use a solid white background for text blocks; use a slightly warm off-white tinted by the primary brand color.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
