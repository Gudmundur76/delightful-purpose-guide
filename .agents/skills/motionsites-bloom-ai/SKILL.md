---
name: motionsites-bloom-ai
description: "Build a sophisticated 'bio-digital' futurism that blends organic planetary themes with high-end glassmorphism and editorial precision hero section in the style of motionsites.ai's \"Bloom AI\" template. Triggers on requests mentioning \"Bloom AI\", \"motionsites bloom-ai\", or the combination \"hero section + bloom ai\"."
---

# Bloom AI (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Bloom AI". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Sophisticated 'Bio-Digital' futurism that blends organic planetary themes with high-end glassmorphism and editorial precision.

## Palette
`#00080B` · `#0A2A28` · `#3E7E73` · `#8DDFC5` · `#FFFFFF`

```css
:root {
  --background: #00080B;
  --foreground: #0A2A28;
  --muted: #3E7E73;
  --muted-foreground: #8DDFC5;
  --accent: #FFFFFF;
  --border: #3E7E73;
}
```

## Typography
- **Display:** PP Editorial New, serif italic blended with a clean Sans-Serif like Neue Montreal for contrast.
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, medium for small labels and tags.

## Layout
An asymmetric split-screen composition where the left third is a fixed frosted-glass vertical panel containing primary typography and CTAs, while the right two-thirds features a dynamic 3D focal point with floating glass informational tiles. The structure relies on nested rounded bento-style containers with thin luminous strokes.

## Hero centerpiece
A high-fidelity 3D hyper-realistic green terrestrial planet set against a deep cosmic bokeh background, partially obscured by a translucent frosted glass card.

## Motion
Subtle parallax on the background planet layer relative to the floating glass tiles. Gentle pulse or 'breathing' glow on the primary logo/icon centerpiece. Smooth backdrop-filter transitions on hover for the interactive bento cards.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid high-contrast pure white borders; use low-opacity strokes (10-20%) for glass effects.
- Do not use sharp 90-degree corners; maintain a consistent large border-radius (30px+) for all containers.
- Avoid flat colors; every surface should have a subtle radial or linear gradient to simulate light depth.
- Do not over-saturate the greens; keep them in the emerald and seafoams range to maintain a premium 'tech-organic' feel.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
