---
name: motionsites-prosthetics-hero
description: Build a clinical, futuristic, and empathetic minimalism that emphasizes precision and human resilience hero in the style of motionsites.ai's "Prosthetics Hero" template. Triggers on requests mentioning "Prosthetics Hero", "motionsites prosthetics-hero", or the combination "hero + prosthetics hero".
---

# Prosthetics Hero (motionsites-inspired)

Category: **Hero**.

## Source of inspiration
Public preview only: motionsites.ai → "Prosthetics Hero". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Clinical, futuristic, and empathetic minimalism that emphasizes precision and human resilience.

## Palette
`#FFFFFF` · `#F2F2F2` · `#2B5EA7` · `#1A1A1A` · `#1A1A1A`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F2F2F2;
  --muted: #2B5EA7;
  --muted-foreground: #1A1A1A;
  --accent: #1A1A1A;
  --border: #2B5EA7;
}
```

## Typography
- **Display:** Inter or SF Pro Display, Semi-Bold 600
- **Body:** Inter or Helvetica Neue, Regular 400
- **Mono / caption:** JetBrains Mono or SF Mono, Medium 500 (for captions and tags)

## Layout
Asymmetrical hero with a top-centered floating pill navigation. The primary copy is bottom-left aligned using a tight typographic stack, balanced by a large-scale 3D object occupying the right two-thirds of the canvas.

## Hero centerpiece
High-contrast, 3D anatomical render (bionic hand) with soft contact shadows and a subtle reflective ground plane.

## Motion
Subtle floating inertia on the 3D centerpiece. Text elements should use a staggered 'blur-in' reveal from the bottom, while the navigation pill enters with a soft expansion from the center.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid harsh solid backgrounds; use subtle gradients to imply depth.
- Do not use serif fonts; stick to humanist or geometric sans-serifs for a clinical-tech feel.
- Avoid bright, distracting background colors that compete with the 3D asset shadows.
- Don't let the navigation pill exceed 50% of the viewport width.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
