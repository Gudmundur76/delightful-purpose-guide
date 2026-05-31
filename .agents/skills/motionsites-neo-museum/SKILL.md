---
name: motionsites-neo-museum
description: Build a a sophisticated fusion of scientific archival clarity and high-end tech-forward minimalism website in the style of motionsites.ai's "Neo Museum" template. Triggers on requests mentioning "Neo Museum", "motionsites neo-museum", or the combination "website + neo museum".
---

# Neo Museum (motionsites-inspired)

Category: **Website**.

## Source of inspiration
Public preview only: motionsites.ai → "Neo Museum". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
A sophisticated fusion of scientific archival clarity and high-end tech-forward minimalism.

## Palette
`#FFFFFF` · `#F5F5F5` · `#252525` · `#000000` · `#A1A1A1`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F5F5F5;
  --muted: #252525;
  --muted-foreground: #000000;
  --accent: #A1A1A1;
  --border: #252525;
}
```

## Typography
- **Display:** General Sans or Robust Sans-Serif, Semi-Bold, large-scale (macro).
- **Body:** Inter or Helvetica Neue, Regular, tight tracking.
- **Mono / caption:** JetBrains Mono or SF Mono for navigational labels and bracketed numbering.

## Layout
Minimalist full-bleed sections with generous negative space. Content is centered vertically with a rhythmic use of macro-typography and small-scale functional UI elements (pills, icons).

## Hero centerpiece
High-fidelity 3D skeletal assets with realistic textures contrasted against ultra-clean white backgrounds.

## Motion
Slow-burn parallax on 3D objects that syncs with scroll depth. Buttons and UI elements utilize micro-scale springs and subtle opacity reveals to emphasize tactile quality.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid overly heavy shadows or skeuomorphic containers for UI.
- Do not use serif typefaces; stick to high-contrast grotesque sans.
- Prevent text from overlapping 3D elements unless it utilizes a clear 'layered' parallax effect.
- Ensure buttons never lose their rounded, pill-shaped geometry.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
