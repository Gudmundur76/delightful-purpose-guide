---
name: motionsites-digital-epoch
description: "Build a pristine, futuristic, and professional with a soft-tech aesthetic driven by skeuomorphic glass textures hero section in the style of motionsites.ai's \"Digital Epoch\" template. Triggers on requests mentioning \"Digital Epoch\", \"motionsites digital-epoch\", or the combination \"hero section + digital epoch\"."
---

# Digital Epoch (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Digital Epoch". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Pristine, futuristic, and professional with a soft-tech aesthetic driven by skeuomorphic glass textures.

## Palette
`#F2F4F7` · `#FFFFFF` · `#D0D5DD` · `#0B1321` · `#2D5BFF`

```css
:root {
  --background: #F2F4F7;
  --foreground: #FFFFFF;
  --muted: #D0D5DD;
  --muted-foreground: #0B1321;
  --accent: #2D5BFF;
  --border: #D0D5DD;
}
```

## Typography
- **Display:** General Sans, sans-serif bold (low letter-spacing)
- **Body:** Inter, sans-serif regular
- **Mono / caption:** Space Mono, monospace (small caps) for utility labels

## Layout
A wide-frame hero section with a top-left-heavy typography cluster balanced by a right-aligned 3D graphic. A floating navigation pill is centered at the bottom of the hero, while a separate logo marquee sits underneath in rounded capsules.

## Hero centerpiece
A high-gloss 3D isometric blue tile floating above a grid of semi-transparent, frosted glass tiles.

## Motion
Subtle vertical floating (bobbing) on the 3D blue tile centerpiece. Soft fade-in reveal for the text block, and a low-frequency shimmer effect across the glass tile grid.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid sharp corners; every container and the main frame must use high-radius rounding.
- Do not use pure black text; stick to deep navy for high-contrast elements.
- Avoid flat color backgrounds; use subtle gradients and light-refraction effects.
- Don't overcrowd the layout; maintain significant white space around the copy block.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
