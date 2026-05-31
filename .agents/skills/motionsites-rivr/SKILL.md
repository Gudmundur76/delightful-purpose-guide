---
name: motionsites-rivr
description: "Build a serene, high-end 'liquid luxury' aesthetic blending organic surrealism with clean fintech precision hero section in the style of motionsites.ai's \"RIVR\" template. Triggers on requests mentioning \"RIVR\", \"motionsites rivr\", or the combination \"hero section + rivr\"."
---

# RIVR (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "RIVR". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Serene, high-end 'Liquid Luxury' aesthetic blending organic surrealism with clean fintech precision.

## Palette
`#E2E8F0` · `#BCCCDC` · `#8E9AAF` · `#334155` · `#D4AF37`

```css
:root {
  --background: #E2E8F0;
  --foreground: #BCCCDC;
  --muted: #8E9AAF;
  --muted-foreground: #334155;
  --accent: #D4AF37;
  --border: #8E9AAF;
}
```

## Typography
- **Display:** Inter, SemiBold 600 with tight letter-spacing
- **Body:** Inter or Helvetica Neue, Regular 400
- **Mono / caption:** Roboto Mono or JetBrains Mono, Regular for small labels

## Layout
A centered vertical stack for the headline and sub-copy, framed by a floating navigation bar at the top and asymmetrical organic-shaped 'glass' pods in the bottom corners for secondary CTAs and stats.

## Hero centerpiece
A high-fidelity 3D surrealist landscape featuring plush bubble furniture, gold architectural rings, and a misty mountain lake setting.

## Motion
Subtle floating/levitation for 3D elements. Text should use a soft 'blur-in' reveal. Secondary pods use a gentle parallax effect against the background as the user scrolls.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid high-contrast black or vibrant neon colors.
- Do not use sharp-cornered containers or harsh borders.
- Avoid busy, textured backgrounds behind text; let the 3D depth provide the negative space.
- Do not use heavy drop shadows on typography; stick to subtle glass-morphism.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
