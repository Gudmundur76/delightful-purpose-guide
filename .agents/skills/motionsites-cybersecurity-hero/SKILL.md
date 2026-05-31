---
name: motionsites-cybersecurity-hero
description: Build a techno-futuristic and secure, blending 'dark mode' sophistication with high-end saas precision hero in the style of motionsites.ai's "Cybersecurity Hero" template. Triggers on requests mentioning "Cybersecurity Hero", "motionsites cybersecurity-hero", or the combination "hero + cybersecurity hero".
---

# Cybersecurity Hero (motionsites-inspired)

Category: **Hero**.

## Source of inspiration
Public preview only: motionsites.ai → "Cybersecurity Hero". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Techno-futuristic and secure, blending 'dark mode' sophistication with high-end SaaS precision.

## Palette
`#0A0A0C` · `#14141A` · `#2D2D3A` · `#A389D4` · `#FFFFFF`

```css
:root {
  --background: #0A0A0C;
  --foreground: #14141A;
  --muted: #2D2D3A;
  --muted-foreground: #A389D4;
  --accent: #FFFFFF;
  --border: #2D2D3A;
}
```

## Typography
- **Display:** Geist Sans or Semi-Bold Grotesk, 80px, tracking -0.04em, tight leading
- **Body:** Inter Sans, medium weight, 16px, tracking -0.01em
- **Mono / caption:** JetBrains Mono, 12px, uppercase, wide letter spacing

## Layout
A vertically stacked composition featuring a minimal top navigation, a centered interactive diagram, and a wide-span headline anchored by a perspective grid 'floor'. Elements are arranged with generous negative space to emphasize depth and atmosphere.

## Hero centerpiece
A horizontal node-and-connector network diagram featuring glowing circular icons linked by a vibrant laser-thin data line.

## Motion
Subtle pulsing glows on the nodes and a 'flowing' light effect through the connector lines. The headline and background grid utilize a slow parallax upward scroll to create a sense of three-dimensional space.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use bright or saturated secondary colors; keep it monochrome and violet.
- Avoid heavy borders or solid boxes; use depth and glow to define shapes.
- Don't use standard system fonts; stick to geometric grotesques with tight tracking.
- Avoid sharp, high-contrast grid lines; keep the floor grid nearly transparent.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
