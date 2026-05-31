---
name: motionsites-designpro-academy
description: "Build a futuristic, premium, and sophisticated with a heavy emphasis on depth and hyper-real glass textures hero section in the style of motionsites.ai's \"DesignPro Academy\" template. Triggers on requests mentioning \"DesignPro Academy\", \"motionsites designpro-academy\", or the combination \"hero section + designpro academy\"."
---

# DesignPro Academy (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "DesignPro Academy". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Futuristic, premium, and sophisticated with a heavy emphasis on depth and hyper-real glass textures.

## Palette
`#000000` · `#1A1A2E` · `#6C5CE7` · `#74B9FF` · `#FFFFFF`

```css
:root {
  --background: #000000;
  --foreground: #1A1A2E;
  --muted: #6C5CE7;
  --muted-foreground: #74B9FF;
  --accent: #FFFFFF;
  --border: #6C5CE7;
}
```

## Typography
- **Display:** Plus Jakarta Sans, Bold 90px with tight -4% letter spacing.
- **Body:** Inter or Geist, Regular 14px with tight tracking and high line-height for readability.
- **Mono / caption:** JetBrains Mono or SF Mono for upper-case labels and auxiliary data.

## Layout
An asymmetrical split composition where the primary 3D glass object occupies the right two-thirds of the frame. Navigation and secondary brand messaging are pinned to the top corners, while the primary CTA and headline are anchored in the lower-left quadrant overlapping the visual.

## Hero centerpiece
A massive, high-gloss 3D glass abstract form with internal refractive gradients of blue, purple, and cyan.

## Motion
Continuous subtle 'breathing' animation of the 3D refraction and light caustic effects. Headlines should use a smooth masking reveal from bottom-to-top with a long cubic-bezier easing.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use generic flat gradients; the background requires depth and specular highlights.
- Avoid centered text layouts; keep the copy asymmetric and tucked into the visual negative space.
- Do not use high-contrast borders on the pill navigation; keep it subtle and semi-transparent.
- Avoid standard serif fonts; the look must be strictly high-tech sans-serif.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
