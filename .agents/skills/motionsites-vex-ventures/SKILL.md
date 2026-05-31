---
name: motionsites-vex-ventures
description: Build a architectural, visionary, and grounded—blending organic beauty with professional corporate ambition hero section in the style of motionsites.ai's "VEX Ventures" template. Triggers on requests mentioning "VEX Ventures", "motionsites vex-ventures", or the combination "hero section + vex ventures".
---

# VEX Ventures (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "VEX Ventures". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Architectural, visionary, and grounded—blending organic beauty with professional corporate ambition.

## Palette
`#0A0B0D` · `#FFFFFF` · `#CED4DA` · `#1A1D21` · `#F8F9FA`

```css
:root {
  --background: #0A0B0D;
  --foreground: #FFFFFF;
  --muted: #CED4DA;
  --muted-foreground: #1A1D21;
  --accent: #F8F9FA;
  --border: #CED4DA;
}
```

## Typography
- **Display:** Halyard Display, Sans-Serif Medium with tight letter-spacing
- **Body:** Inter, Sans-Serif Regular
- **Mono / caption:** JetBrains Mono, Light (for small utility labels)

## Layout
Full-bleed immersive background with an asymmetrical split: content is weighted to the bottom-left. A floating frosted-glass navigation bar sits at the top, while a bottom-right pill element anchors the page secondary information.

## Hero centerpiece
A hyper-realistic, high-contrast cityscape photograph featuring a blend of lush greenery, a reflective river, and modern skyscrapers under a dramatic afternoon sky.

## Motion
Parallax scrolling on the background image for depth. Text elements should use a clipped reveal (rising from the bottom) with a sluggish, high-friction ease. Background clouds/water should have subtle continuous looping animation.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Don't use drop shadows on text; rely on background darkness for legibility.
- Avoid saturated primary colors; keep the palette grounded in natural and metallic tones.
- Never use Serif fonts; the brand must feel architectural and tech-forward.
- Don't clutter the image with floating UI elements beyond essential navigation.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
