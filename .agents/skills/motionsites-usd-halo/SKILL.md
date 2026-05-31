---
name: motionsites-usd-halo
description: "Build a futuristic, authoritative, and cinematic with a high-tech corporate infrastructure aesthetic landing page in the style of motionsites.ai's \"USD Halo\" template. Triggers on requests mentioning \"USD Halo\", \"motionsites usd-halo\", or the combination \"landing page + usd halo\"."
---

# USD Halo (motionsites-inspired)

Category: **Landing Page**.

## Source of inspiration
Public preview only: motionsites.ai → "USD Halo". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Futuristic, authoritative, and cinematic with a high-tech corporate infrastructure aesthetic.

## Palette
`#05050C` · `#1A1B3A` · `#2563EB` · `#A78BFA` · `#FFFFFF`

```css
:root {
  --background: #05050C;
  --foreground: #1A1B3A;
  --muted: #2563EB;
  --muted-foreground: #A78BFA;
  --accent: #FFFFFF;
  --border: #2563EB;
}
```

## Typography
- **Display:** Plus Jakarta Sans, Bold 64px with tight tracking (-0.02em).
- **Body:** Inter or similar high-legibility neo-grotesque, Regular 16px/1.6.
- **Mono / caption:** JetBrains Mono for auxiliary labels and eyebrow text.

## Layout
Centered vertical stack with a floating 'island' navigation bar at the top. The typographic content is anchored to the middle of the frame, layered over a deep-perspective 3D background.

## Hero centerpiece
An abstract, architectural 3D 'ribbed' structure behaving like a halo/portal with radial light dispersion.

## Motion
Slow, rhythmic atmospheric pulsing of the radial light. Text elements should use a staggered 'blur-to-clear' fade in on scroll. Navigation bar should have a subtle frosted-glass expansion effect.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid sharp, angular geometric containers for text; keep it floating.
- Do not use flat solid colors for the background; must be a deep indigo gradient.
- Avoid generic sans-serif fonts; use a typeface with high x-height and circular bowls.
- Never use harsh white; opt for slightly blue-tinted grays for body text to maintain depth.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
