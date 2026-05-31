---
name: motionsites-codenest-coding-platform
description: Build a cyber-noir and technical; a high-contrast 'hacker' aesthetic that feels precisely engineered and clandestine landing page in the style of motionsites.ai's "CodeNest Coding Platform" template. Triggers on requests mentioning "CodeNest Coding Platform", "motionsites codenest-coding-platform", or the combination "landing page + codenest coding platform".
---

# CodeNest Coding Platform (motionsites-inspired)

Category: **Landing Page**.

## Source of inspiration
Public preview only: motionsites.ai → "CodeNest Coding Platform". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Cyber-noir and technical; a high-contrast 'hacker' aesthetic that feels precisely engineered and clandestine.

## Palette
`#000000` · `#121212` · `#BDFFD0` · `#2D3436` · `#A3FFB4`

```css
:root {
  --background: #000000;
  --foreground: #121212;
  --muted: #BDFFD0;
  --muted-foreground: #2D3436;
  --accent: #A3FFB4;
  --border: #BDFFD0;
}
```

## Typography
- **Display:** Monument Extended, Ultra-Bold - All Caps with optical kerning
- **Body:** Inter or Helvetica Neue, Regular - tracking 0.02em
- **Mono / caption:** IBM Plex Mono, Regular - enclosed in brackets [ ] for UI elements

## Layout
The layout follows a modular grid with a strict 4-column vertical split separated by faint divider lines. Content is anchored to the far-left and far-right margins, with a secondary glassmorphism card floating in the upper-left quadrant.

## Hero centerpiece
A full-bleed digital glitch texture featuring vertical neon green and blue scanlines over a deep black background.

## Motion
Micro-interactions should mimic CRT flicker or signal interference. Components should reveal via vertical shutter wipes or rapid sequence offsets along the grid lines.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using vibrant gradients; stick to sharp, glitchy transitions.
- Do not use rounded corners on structural elements except for subtle floating cards.
- Avoid heavy shadows; use glow and 'light-leak' effects for depth instead.
- Don't use standard sans-serifs for headers; they must be high-impact and geometric.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
