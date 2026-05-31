---
name: motionsites-modern-agency
description: "Build a futuristic, high-end, and frictionless, blending neo-brutalist layouts with glossy 3d art agency in the style of motionsites.ai's \"Modern Agency\" template. Triggers on requests mentioning \"Modern Agency\", \"motionsites modern-agency\", or the combination \"agency + modern agency\"."
---

# Modern Agency (motionsites-inspired)

Category: **Agency**.

## Source of inspiration
Public preview only: motionsites.ai → "Modern Agency". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Futuristic, high-end, and frictionless, blending neo-brutalist layouts with glossy 3D art.

## Palette
`#FFFFFF` · `#F5F5F5` · `#1A1A1A` · `#E85D33` · `#E85D33`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F5F5F5;
  --muted: #1A1A1A;
  --muted-foreground: #E85D33;
  --accent: #E85D33;
  --border: #1A1A1A;
}
```

## Typography
- **Display:** General Sans, semibold with tight letter spacing
- **Body:** Inter, sans-serif light
- **Mono / caption:** JetBrains Mono, regular (for captions and tags)

## Layout
A high-contrast vertical stack featuring a full-bleed hero with offset typography, followed by a staggered asymmetrical multi-column body grid for case studies and 'about' content. Modular sections are separated by significant white space or subtle off-grey background shifts.

## Hero centerpiece
High-gloss 3D abstract fluid ribbon with metallic and iridescent textures.

## Motion
Subtle parallax on background 3D elements against fixed typography. Text reveals should use a 'staggered slide-up and fade' rhythm on scroll, while primary capsules use a slow-pulsing scale effect.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using standard sans-serifs for headlines; it must be a tight-kerning display face.
- Do not use sharp-cornered buttons; stick to pill-shaped 'capsule' containers.
- Never use drop shadows on text or UI elements; depth should come from the 3D backgrounds.
- Avoid standard grid alignment; allow images and text blocks to stagger vertically.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
