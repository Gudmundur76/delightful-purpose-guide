---
name: motionsites-visual-hero
description: "Build a hyper-tactile organic futurism: a blend of high-end editorial sophistication and raw natural textures hero in the style of motionsites.ai's \"Visual Hero\" template. Triggers on requests mentioning \"Visual Hero\", \"motionsites visual-hero\", or the combination \"hero + visual hero\"."
---

# Visual Hero (motionsites-inspired)

Category: **Hero**.

## Source of inspiration
Public preview only: motionsites.ai → "Visual Hero". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Hyper-tactile organic futurism: a blend of high-end editorial sophistication and raw natural textures.

## Palette
`#000000` · `#1A1A1A` · `#7C8D5F` · `#E9D8D2` · `#FFFFFF`

```css
:root {
  --background: #000000;
  --foreground: #1A1A1A;
  --muted: #7C8D5F;
  --muted-foreground: #E9D8D2;
  --accent: #FFFFFF;
  --border: #7C8D5F;
}
```

## Typography
- **Display:** Editorial New, serif italic light
- **Body:** Inter, sans-serif regular
- **Mono / caption:** IBM Plex Mono, regular (for captions)

## Layout
A centered 'floating' composition where a glass-morphic island navigation bar sits at the top. The headline is large and centered, partially obscured by the centerpiece which anchors the bottom two-thirds of the viewport, flanked by small secondary copy blocks.

## Hero centerpiece
A high-fidelity, photorealistic 3D render of organic matter (moss and crystals) that physically interacts with and overlaps the headline type.

## Motion
Subtle parallax on the centerpiece to create depth relative to the background. Headline text should have a soft blur-to-focus reveal on entry. Button hover states use a slow expansion of 'pill' width.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using hard-edged geometric shapes; keep the UI rounded and soft.
- Do not hide the centerpiece behind the text; the text must weave 'under' parts of the image.
- Don't use standard sans-serif for the headline; it must be a high-contrast serif.
- Avoid bright, distracting background colors; the backdrop must remain a deep, dark void.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
