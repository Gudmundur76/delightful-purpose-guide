---
name: motionsites-nexto-404
description: "Build a playful tech-optimism with a clean, airy, and high-end futuristic aesthetic 404 in the style of motionsites.ai's \"Nexto 404\" template. Triggers on requests mentioning \"Nexto 404\", \"motionsites nexto-404\", or the combination \"404 + nexto 404\"."
---

# Nexto 404 (motionsites-inspired)

Category: **404**.

## Source of inspiration
Public preview only: motionsites.ai → "Nexto 404". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Playful tech-optimism with a clean, airy, and high-end futuristic aesthetic.

## Palette
`#F9F9F9` · `#EBF0F5` · `#111111` · `#C499FF` · `#6D28D9`

```css
:root {
  --background: #F9F9F9;
  --foreground: #EBF0F5;
  --muted: #111111;
  --muted-foreground: #C499FF;
  --accent: #6D28D9;
  --border: #111111;
}
```

## Typography
- **Display:** Plus Jakarta Sans, bold, tight kerning, with lowercase 'y' and 'g' descenders interlocking with text below.
- **Body:** Inter or Hanken Grotesk, medium weight, 16px with tight letter spacing.
- **Mono / caption:** SF Mono or JetBrains Mono, used sparingly for inline tags.

## Layout
A centered radial composition anchored by concentric orbital lines. Content is stacked vertically, transitioning from typographic headlines to a central visual centerpiece, concluding with a stack of rounded navigation cards.

## Hero centerpiece
A high-fidelity 3D metallic UFO floating in a central radial glow with whimsical 3D accent icons like clouds and hearts.

## Motion
Subtle floating 'bob' for 3D elements (continuous). Orbital lines should rotate slowly at different speeds. Hover states on cards use a gentle lift and shadow expansion.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use sharp corners on cards or buttons; everything must be hyper-rounded.
- Avoid high-contrast borders; use subtle hairlines or soft shadows instead.
- Don't use generic stock 3D; ensure assets have a consistent metallic and pearlescent texture.
- Avoid heavy solid backgrounds; keep the canvas light and airy with depth.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
