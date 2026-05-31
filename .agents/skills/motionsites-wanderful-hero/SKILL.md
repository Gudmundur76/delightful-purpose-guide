---
name: motionsites-wanderful-hero
description: "Build a atmospheric, transcendental, and sophisticated, evoking a sense of calm exploration and premium serenity travel in the style of motionsites.ai's \"Wanderful Hero\" template. Triggers on requests mentioning \"Wanderful Hero\", \"motionsites wanderful-hero\", or the combination \"travel + wanderful hero\"."
---

# Wanderful Hero (motionsites-inspired)

Category: **Travel**.

## Source of inspiration
Public preview only: motionsites.ai → "Wanderful Hero". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Atmospheric, transcendental, and sophisticated, evoking a sense of calm exploration and premium serenity.

## Palette
`#0A0D10` · `#1E3A4C` · `#C28E46` · `#FFFFFF` · `#E0F2F1`

```css
:root {
  --background: #0A0D10;
  --foreground: #1E3A4C;
  --muted: #C28E46;
  --muted-foreground: #FFFFFF;
  --accent: #E0F2F1;
  --border: #C28E46;
}
```

## Typography
- **Display:** Ginto Nord or Helvetica Neue Medium with relaxed letter-spacing.
- **Body:** Inter or SF Pro Display, regular with tight leading.
- **Mono / caption:** IBM Plex Mono Bold, uppercase with wide tracking for legal/utility links.

## Layout
A balanced architectural stack centered vertically and horizontally. Navigation is housed in a pill-shaped glass container at the top, while the bottom section transitions into a dark vignette to ground the primary Call to Action.

## Hero centerpiece
Cinematic full-bleed photography featuring a lone explorer in a misty, ethereal golden-hour landscape.

## Motion
Parallax depth on the background image during scroll. Text elements should use a slow, staggered 'blur-to-clear' fade-in. Navigation pills should have a subtle liquid expansion on hover.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid sharp, high-contrast imagery; the focus is on soft, atmospheric diffusion.
- Do not use heavy, opaque navigation bars; stick to glassmorphism or invisible containers.
- Avoid standard sans-serifs with high x-heights; look for fonts with elegance and wider tracking.
- Do not clutter the image with secondary icons or small graphics that break the immersion.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
