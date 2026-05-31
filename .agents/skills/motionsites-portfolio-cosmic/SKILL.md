---
name: motionsites-portfolio-cosmic
description: "Build a ethereal, cinematic, and sophisticated, channeling a 'scholar-in-space' aesthetic portfolio in the style of motionsites.ai's \"Portfolio Cosmic\" template. Triggers on requests mentioning \"Portfolio Cosmic\", \"motionsites portfolio-cosmic\", or the combination \"portfolio + portfolio cosmic\"."
---

# Portfolio Cosmic (motionsites-inspired)

Category: **Portfolio**.

## Source of inspiration
Public preview only: motionsites.ai → "Portfolio Cosmic". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Ethereal, cinematic, and sophisticated, channeling a 'scholar-in-space' aesthetic.

## Palette
`#000000` · `#0A121E` · `#2B4C7E` · `#A4C3D2` · `#FFFFFF`

```css
:root {
  --background: #000000;
  --foreground: #0A121E;
  --muted: #2B4C7E;
  --muted-foreground: #A4C3D2;
  --accent: #FFFFFF;
  --border: #2B4C7E;
}
```

## Typography
- **Display:** Cormorant Garamond or Editorial New, Italic for the hero name.
- **Body:** Inter or Helvetica Neue, Regular, 14px tracking for readability.
- **Mono / caption:** Space Mono or JetBrains Mono for small uppercase tags like 'COLLECTION' and 'SCROLL'.

## Layout
A vertically centered, symmetrical stack within a container rounded off the screen's edges. The layout utilizes a 'floating' top navigation bar and a bottom scroll indicator to anchor the vast central void.

## Hero centerpiece
A massive, high-contrast celestial vortex or cosmic eye graphic that frames the top of the content area.

## Motion
Continuous slow-rotation or shifting on the cosmic background elements. Typography should use subtle fade-in and upward slide reveals; the 'See Works' button should have a magnetic hover effect.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid vibrant colors like red or green; stick to the cool galactic spectrum.
- Do not use standard sans-serif weights for the main title; it must be serif and italicized.
- Avoid harsh corners; use high border-radius on all UI elements like the navigation bar and primary buttons.
- Do not crowd the center; keep the typography vertically stacked with generous negative space.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
