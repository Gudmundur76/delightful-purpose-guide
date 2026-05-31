---
name: motionsites-dot
description: Build a nostalgic, serene, and minimalist 'digital detox' aesthetic combining y2k era technology with organic nature hero section in the style of motionsites.ai's "Dot" template. Triggers on requests mentioning "Dot", "motionsites dot", or the combination "hero section + dot".
---

# Dot (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Dot". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Nostalgic, serene, and minimalist 'digital detox' aesthetic combining Y2K era technology with organic nature.

## Palette
`#FFFFFF` · `#F8F9FA` · `#606060` · `#2196F3` · `#007AFF`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F8F9FA;
  --muted: #606060;
  --muted-foreground: #2196F3;
  --accent: #007AFF;
  --border: #606060;
}
```

## Typography
- **Display:** Instrument Serif or Editorial New, Regular 80px
- **Body:** Inter or Helvetica Neue, Regular 16px
- **Mono / caption:** IBM Plex Mono or similar for the 'dot.' logo and UI details

## Layout
A centered vertical stack beginning with a floating pill-shaped navigation bar. The content follows a classic inverted pyramid: large serif headline, medium sans-serif subhead, and a massive realistic object as the visual anchor.

## Hero centerpiece
A high-fidelity 3D rendering of a vintage white mobile phone (Nokia 3310 style) emerging from beach sand against a serene ocean backdrop.

## Motion
Continuous gentle parallax on the background beach image vs. the stationary phone. The headline should employ a soft 'fade-in and slide-up' reveal to mimic a calming breath.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid modern flat UI elements; use skeumorphic gradients for buttons.
- Do not use sans-serif fonts for the main headline.
- Avoid harsh, high-contrast black; use deep charcoal for text.
- Don't crowd the top navigation; maintain a 100% width pill-shaped container.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
