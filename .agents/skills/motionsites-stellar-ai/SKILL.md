---
name: motionsites-stellar-ai
description: "Build a ethereal, high-end tech professionalism with a serene, 'zen-ai' atmospheric quality hero section in the style of motionsites.ai's \"Stellar AI\" template. Triggers on requests mentioning \"Stellar AI\", \"motionsites stellar-ai\", or the combination \"hero section + stellar ai\"."
---

# Stellar AI (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Stellar AI". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Ethereal, high-end tech professionalism with a serene, 'Zen-AI' atmospheric quality.

## Palette
`#FFFFFF` · `#F7F7F7` · `#8E8EA0` · `#8A5CF5` · `#000000`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F7F7F7;
  --muted: #8E8EA0;
  --muted-foreground: #8A5CF5;
  --accent: #000000;
  --border: #8E8EA0;
}
```

## Typography
- **Display:** Inter, sans-serif semibold with 'optical' kerning and tight letter-spacing.
- **Body:** Inter, sans-serif regular with tight tracking and 1.6 line-height.
- **Mono / caption:** JetBrains Mono, medium for small badges and technical labels.

## Layout
Centered vertical stack consisting of a pill-shaped badge, a tight sans-serif headline, a CTA button, and a segmented control bar transitioning into a large-scale featured image. The image acts as an anchor for the page, containing floated UI cards to simulate interaction.

## Hero centerpiece
Hyper-realistic 3D environmental render (Japanese garden aesthetic) with an integrated UI dashboard overlay.

## Motion
Soft fade-in for the main headline with a slight upward drift. The floating UI cards within the centerpiece should feature a subtle, slow-looping Y-axis float to imply depth. Button hover states transition background color using a 0.3s ease-out.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use harsh 90-degree corners; everything should have a high-radius border curve.
- Avoid overly saturated primary colors; stick to muted tones and grays for UI elements.
- Never use drop shadows on text; depth should be created via layer stacking and background blur only.
- Don't crowd the header; maintain generous whitespace between the logo and navigation links.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
