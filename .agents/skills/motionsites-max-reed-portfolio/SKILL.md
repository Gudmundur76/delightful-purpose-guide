---
name: motionsites-max-reed-portfolio
description: Build a sophisticated, cinematic dark mode with a focus on high-end lighting, ethereal textures, and professional 'creative technologist' vibes features in the style of motionsites.ai's "Max Reed Portfolio" template. Triggers on requests mentioning "Max Reed Portfolio", "motionsites max-reed-portfolio", or the combination "features + max reed portfolio".
---

# Max Reed Portfolio (motionsites-inspired)

Category: **Features**.

## Source of inspiration
Public preview only: motionsites.ai → "Max Reed Portfolio". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Sophisticated, cinematic dark mode with a focus on high-end lighting, ethereal textures, and professional 'creative technologist' vibes.

## Palette
`#0D0D0D` · `#1A1C1E` · `#33383C` · `#8E9196` · `#FFFFFF`

```css
:root {
  --background: #0D0D0D;
  --foreground: #1A1C1E;
  --muted: #33383C;
  --muted-foreground: #8E9196;
  --accent: #FFFFFF;
  --border: #33383C;
}
```

## Typography
- **Display:** Degular or Inter, Semi-Bold with tight letter spacing for a modern, impactful header.
- **Body:** Inter or Helvetica Now, Regular for readability and clean professional tone.
- **Mono / caption:** JetBrains Mono or SF Mono for labels, timestamps, and utility metadata.

## Layout
Asymmetric bento grid with three main columns. The left column is a tall vertical image feature, the middle is split into a small testimonial top and large metric bottom, and the right features a large image-led software stack and contact CTA.

## Hero centerpiece
A dynamic bento-style grid featuring a primary vertical portrait card and a high-glow numeric data visualization metric.

## Motion
Subtle parallax on image backgrounds within cards. Cards should feature a staggered 'fade-in and slide-up' entrance, and hover states should include a gentle scale-up (1.02x) with a soft outer glow.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid heavy drop shadows; use subtle inner borders or 'glass' glows instead.
- Do not use harsh 90-degree corners; radii should be generous (24px+).
- Don't vary the gutter width; maintain a strict, consistent spacing between all grid modules.
- Avoid pure white text for body copy; use muted greys to maintain the dark-mode atmosphere.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
