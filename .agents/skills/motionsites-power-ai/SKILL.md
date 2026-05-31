---
name: motionsites-power-ai
description: "Build a futuristic, high-end techno-mysticism with a dark, immersive atmospheric quality hero section in the style of motionsites.ai's \"Power AI\" template. Triggers on requests mentioning \"Power AI\", \"motionsites power-ai\", or the combination \"hero section + power ai\"."
---

# Power AI (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Power AI". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Futuristic, high-end techno-mysticism with a dark, immersive atmospheric quality.

## Palette
`#020205` · `#1B1333` · `#4C358E` · `#8A76FF` · `#E0AAFF`

```css
:root {
  --background: #020205;
  --foreground: #1B1333;
  --muted: #4C358E;
  --muted-foreground: #8A76FF;
  --accent: #E0AAFF;
  --border: #4C358E;
}
```

## Typography
- **Display:** Inter, medium sans-serif with tight tracking and a linear gradient mask on the 'AI' suffix.
- **Body:** Inter, light sans-serif 16px/1.5
- **Mono / caption:** SF Mono, uppercase 12px for navigation and labels.

## Layout
A centered hero composition with a top-aligned utility navigation. The content follows a strict vertical axis: large display headline, medium sub-headline, and an outlined pill-shaped CTA, with a logo marquee anchored at the very bottom.

## Hero centerpiece
A hyper-realistic 3D abstract of interlocking, tubular purple and blue glass-like coils that weave behind and around the central typography.

## Motion
Subtle parallax on the 3D coils that reacts to mouse movement. The 'AI' gradient in the headline should have a slow, shimmering horizontal pulse. The background elements should feel like they are slowly drifting in deep space.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using solid neon colors; stick to deep gradients and translucencies.
- Do not use heavy font weights for body text; keep it light to maintain the ethereal feel.
- Avoid harsh box shadows; use glows and internal lighting effects instead.
- Do not clutter the background; the 3D 'noodles' should have enough negative space to breathe.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
