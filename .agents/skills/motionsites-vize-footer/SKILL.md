---
name: motionsites-vize-footer
description: "Build a soft, corporate-minimalist with a premium, airy aesthetic achieved through depth and subtle skeuomorphism footer section in the style of motionsites.ai's \"Vize Footer\" template. Triggers on requests mentioning \"Vize Footer\", \"motionsites vize-footer\", or the combination \"footer section + vize footer\"."
---

# Vize Footer (motionsites-inspired)

Category: **Footer Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Vize Footer". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Soft, corporate-minimalist with a premium, airy aesthetic achieved through depth and subtle skeuomorphism.

## Palette
`#F0F2F5` · `#FFFFFF` · `#718096` · `#1A202C` · `#3182CE`

```css
:root {
  --background: #F0F2F5;
  --foreground: #FFFFFF;
  --muted: #718096;
  --muted-foreground: #1A202C;
  --accent: #3182CE;
  --border: #718096;
}
```

## Typography
- **Display:** Plus Jakarta Sans, sans-serif bold
- **Body:** Inter, sans-serif regular
- **Mono / caption:** Roboto Mono, monospace medium (labels)

## Layout
A split-level card layout featuring a large rounded primary container for the brand bio and link columns, sitting atop a secondary full-width muted 'basement' for legal credits. The upper section uses a four-column grid distribution for links and brand identity.

## Hero centerpiece
Oversized, 3D soft-embossed branded watermark anchored at the bottom of the viewport.

## Motion
Staggered fade-in for link columns with a slow, parallax vertical drift for the large background watermark. Interactive elements like social icons use a gentle lift shadow on hover.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use high-contrast borders; keep shadow transitions extremely soft.
- Avoid sharp corners on the footer container; maintain a high border-radius (40px+).
- Don't use pure black for text; stick to deep slate and muted greys for a premium feel.
- Do not overcrowd the bottom legal row; keep utility links sparse and right-aligned.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
