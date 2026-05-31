---
name: motionsites-creative-studio
description: Build a futuristic, high-end technical minimalism with a focused 'liquid chrome' aesthetic agency in the style of motionsites.ai's "Creative Studio" template. Triggers on requests mentioning "Creative Studio", "motionsites creative-studio", or the combination "agency + creative studio".
---

# Creative Studio (motionsites-inspired)

Category: **Agency**.

## Source of inspiration
Public preview only: motionsites.ai → "Creative Studio". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Futuristic, high-end technical minimalism with a focused 'Liquid Chrome' aesthetic.

## Palette
`#F6F6F6` · `#000000` · `#808080` · `#5222D8` · `#5222D8`

```css
:root {
  --background: #F6F6F6;
  --foreground: #000000;
  --muted: #808080;
  --muted-foreground: #5222D8;
  --accent: #5222D8;
  --border: #808080;
}
```

## Typography
- **Display:** Inter Tight or similar geometric sans-serif, Extra Bold, 110px, 0.9 line-height, Uppercase
- **Body:** Inter or Helvetica Neue, Regular, 12px, 1.4 line-height, Uppercase for UI elements
- **Mono / caption:** JetBrains Mono or similar geometric monotype for 'plus' symbols and technical captions.

## Layout
An asymmetric 12-column grid featuring a massive hero asset anchored to the left, with tiered typography and data points clustered in a right-aligned vertical stack. The navigation is distributed evenly across the top axis with a dedicated burger menu tucked in the far right corner.

## Hero centerpiece
Iridescent, chrome-textured 3D interlocking rings (armillary sphere style) with high-contrast anisotropic reflections and spectral highlights.

## Motion
Continuous slow-rotation or orbital floating for the 3D centerpiece. Text elements use staggered vertical reveals (slide up) with a high-tension cubic-bezier easing. Interactive hover states on 'WORK WITH US' should trigger a color shift or subtle scaling.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using soft pastel gradients; use high-contrast iridescent 'oil-slick' textures on 3D elements.
- Do not use serif or decorative fonts; stick to geometric, heavy-weight sans-serifs for headlines.
- Avoid cluttered backgrounds; maintain a pristine off-white field to let the 3D chrome work pop.
- Don't center-align the main headline; it must be bottom-right justified to balance the left-heavy visual asset.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
