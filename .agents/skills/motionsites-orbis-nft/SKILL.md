---
name: motionsites-orbis-nft
description: "Build a a whimsical yet cinematic 'space-age kawaii' aesthetic that feels high-tech, immersive, and playful landing page in the style of motionsites.ai's \"Orbis NFT\" template. Triggers on requests mentioning \"Orbis NFT\", \"motionsites orbis-nft\", or the combination \"landing page + orbis nft\"."
---

# Orbis NFT (motionsites-inspired)

Category: **Landing Page**.

## Source of inspiration
Public preview only: motionsites.ai → "Orbis NFT". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
A whimsical yet cinematic 'Space-Age Kawaii' aesthetic that feels high-tech, immersive, and playful.

## Palette
`#020617` · `#1E293B` · `#FFFFFF` · `#A3E635` · `#A3E635`

```css
:root {
  --background: #020617;
  --foreground: #1E293B;
  --muted: #FFFFFF;
  --muted-foreground: #A3E635;
  --accent: #A3E635;
  --border: #FFFFFF;
}
```

## Typography
- **Display:** League Gothic, sans-serif ultra-condensed uppercase
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, monospace regular

## Layout
The layout uses a 'theatrical frame' approach with deep navy containers featuring large corner radii. Sections are delineated by massive, left-aligned condensed typography that partially overlaps 3D imagery, creating a sense of depth.

## Hero centerpiece
High-fidelity 3D character renders of bulbous, minimalist astronauts in surreal, bioluminescent extraterrestrial landscapes.

## Motion
Continuous parallax on background star fields and floating planets. Subtle 'breathing' scale animations on the 3D character cards and smooth liquid-easing on the lime green handwriting reveals.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid standard sans-serifs for headlines; must use condensed, heavy weights.
- Do not use flat colors for large backgrounds; maintain subtle noise or deep gradients.
- Avoid sharp corners on image containers; use ultra-wide border radii.
- Never use neon green for body text; reserve it strictly for handwritten accents and highlights.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
