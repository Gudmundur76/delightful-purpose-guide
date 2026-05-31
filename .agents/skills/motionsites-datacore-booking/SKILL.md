---
name: motionsites-datacore-booking
description: Build a sophisticated and atmospheric 'cyber-chic'—blending high-end luxury editorial vibes with dark-mode saas functionality saas in the style of motionsites.ai's "Datacore Booking" template. Triggers on requests mentioning "Datacore Booking", "motionsites datacore-booking", or the combination "saas + datacore booking".
---

# Datacore Booking (motionsites-inspired)

Category: **SaaS**.

## Source of inspiration
Public preview only: motionsites.ai → "Datacore Booking". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Sophisticated and atmospheric 'Cyber-Chic'—blending high-end luxury editorial vibes with dark-mode SaaS functionality.

## Palette
`#08040A` · `#1A1424` · `#4F3B78` · `#9D72FF` · `#7C3AED`

```css
:root {
  --background: #08040A;
  --foreground: #1A1424;
  --muted: #4F3B78;
  --muted-foreground: #9D72FF;
  --accent: #7C3AED;
  --border: #4F3B78;
}
```

## Typography
- **Display:** Editorial New or Gazpacho, Serif with high-italic 'and' for rhythmic emphasis.
- **Body:** Inter or Geist Sans, light weight for high readability.
- **Mono / caption:** JetBrains Mono or SF Mono for small badges and labels.

## Layout
A centered, top-heavy 'Hero-to-UI' transition. Elements flow from a centered navigation and headline down into a wide-angle, semi-transparent dashboard cutout that breaks the lower fold.

## Hero centerpiece
A mix of high-contrast serif typography and a glassmorphic product dashboard preview anchored at the bottom.

## Motion
Subtle parallax on the glow background. Elements should fade in with a slight upward drift (Y-axis translate), while the primary CTA uses a soft scale-up on hover.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid flat, solid backgrounds; use textured gradients or film grain noise.
- Do not use purely modern sans-serif for headlines; the distinct serif italic is crucial for the 'luxury tech' feel.
- Prevent sharp corners on UI elements; use a minimum of 12px radius for containers and buttons.
- Don't use high-saturation reds or greens; keep the palette limited to purples and deep charcoal.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
