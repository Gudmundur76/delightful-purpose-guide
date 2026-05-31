---
name: motionsites-aetheris-voyage
description: Build a ethereal, high-end, and cosmic, blending futuristic aerospace innovation with a dreamy, organic luxury aesthetic hero section in the style of motionsites.ai's "Aetheris Voyage" template. Triggers on requests mentioning "Aetheris Voyage", "motionsites aetheris-voyage", or the combination "hero section + aetheris voyage".
---

# Aetheris Voyage (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Aetheris Voyage". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Ethereal, high-end, and cosmic, blending futuristic aerospace innovation with a dreamy, organic luxury aesthetic.

## Palette
`#0D0D0F/deep space black` · `#2A2A2E/dark slate grey` · `#D9AF72/gold dust lux` · `#949EBF/chromatic iris blue` · `#FFFFFF/stellar white`

```css
:root {
  --background: #0D0D0F/deep space black;
  --foreground: #2A2A2E/dark slate grey;
  --muted: #D9AF72/gold dust lux;
  --muted-foreground: #949EBF/chromatic iris blue;
  --accent: #FFFFFF/stellar white;
  --border: #D9AF72/gold dust lux;
}
```

## Typography
- **Display:** PP Editorial New, serif italic light
- **Body:** Inter, sans-serif regular with wide tracking
- **Mono / caption:** JetBrains Mono, regular (used for metadata and small tags)

## Layout
Centered vertical stack with a floating navigation capsule at the top. The typography is layered over a large fluid centerpiece, followed by a secondary row of semi-transparent data cards and a bottom-aligned logo marquee.

## Hero centerpiece
An amorphous, iridescent glass-like sphere or 'bubble' containing a dark nebular interior with golden caustic reflections.

## Motion
Continuous slow rotation and deformation of the central glass sphere. Text elements should use a soft 'blur-in' reveal with a slight Y-axis drift, mimicking the floating nature of space.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid solid heavy borders; use thin 1px gradients or glows instead.
- Do not use standard sans-serif for numbers; they must be high-contrast serif.
- Don't allow the background to be pure black (#000); use a deep charcoal with noise.
- Avoid aggressive hover states; transitions should be slow and fluid like liquid.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
