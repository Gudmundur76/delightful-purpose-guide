---
name: motionsites-luminex
description: "Build a a futuristic and ethereal 'electric nocturne' aesthetic that feels high-tech yet organic hero section in the style of motionsites.ai's \"Luminex\" template. Triggers on requests mentioning \"Luminex\", \"motionsites luminex\", or the combination \"hero section + luminex\"."
---

# Luminex (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Luminex". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
A futuristic and ethereal 'Electric Nocturne' aesthetic that feels high-tech yet organic.

## Palette
`#020408` · `#124469` · `#E08432` · `#FFFFFF` · `#FFFFFF`

```css
:root {
  --background: #020408;
  --foreground: #124469;
  --muted: #E08432;
  --muted-foreground: #FFFFFF;
  --accent: #FFFFFF;
  --border: #E08432;
}
```

## Typography
- **Display:** SF Pro Display Bold, sans-serif with -2% letter spacing and no paragraph breaks between sentences.
- **Body:** Inter Regular, sans-serif with tight tracking and high line-height for readability.
- **Mono / caption:** SF Mono, uppercase for small labels or tertiary navigation elements.

## Layout
Full-bleed immersive hero with a floating frosted glass navigation bar. Content is left-aligned in the bottom-left quadrant to balance the diagonal motion of the background graphics.

## Hero centerpiece
Dynamic, flowing abstract light ribbons in deep teal and vibrant amber, creating a sense of energy and motion.

## Motion
Slow-moving, continuous wave-like undulations of the light ribbons. Subtle parallax effect where the background moves slower than the text horizontally on scroll.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid sharp or geometric shapes that interrupt the fluid light paths.
- Do not use transparent buttons; maintain solid white for primary CTAs to ensure hero legibility.
- Avoid heavy drop shadows on text; rely on the dark background for contrast.
- Do not use multi-color gradients for typography.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
