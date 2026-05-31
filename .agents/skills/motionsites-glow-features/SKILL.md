---
name: motionsites-glow-features
description: Build a high-tech, premium neon-minimalism with a focused 'dark mode' aesthetic features section in the style of motionsites.ai's "Glow Features" template. Triggers on requests mentioning "Glow Features", "motionsites glow-features", or the combination "features section + glow features".
---

# Glow Features (motionsites-inspired)

Category: **Features Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Glow Features". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
High-tech, premium neon-minimalism with a focused 'dark mode' aesthetic.

## Palette
`#0A0A0A` · `#FFFFFF` · `#909090` · `#FF93A3` · `#77E4FF`

```css
:root {
  --background: #0A0A0A;
  --foreground: #FFFFFF;
  --muted: #909090;
  --muted-foreground: #FF93A3;
  --accent: #77E4FF;
  --border: #909090;
}
```

## Typography
- **Display:** Inter SemiBold, 22px, tight letter spacing, #FFFFFF color
- **Body:** Inter Regular, 16px, 1.6 line-height, #909090 color
- **Mono / caption:** Inter Medium, 12px, uppercase for labels (optional)

## Layout
A horizontal three-column grid centered on a dark canvas. Each card uses a vertical stack with an icon at the top-left, a bold title in the middle-left, and descriptive body text at the bottom-left.

## Hero centerpiece
Squircle-shaped feature cards with vibrant, outer glow halos and integrated line iconography.

## Motion
Hover-state activation where the glow intensity increases or changes hue. Smooth opacity fades for the outer halos on page load. Text and icons should have a slight upward slide or 'float' transition.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use sharp 90-degree corners; maintain high-radius squircles for the cards.
- Avoid thin, harsh borders; the 'glow' must be a soft, wide-dispersion drop shadow or blur.
- Do not mix solid colored backgrounds with the glow; the canvas must remain pitch black.
- Avoid over-complicating the typography; keep it clean and Swiss-inspired.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
