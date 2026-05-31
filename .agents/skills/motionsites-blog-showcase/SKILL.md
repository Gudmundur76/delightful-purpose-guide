---
name: motionsites-blog-showcase
description: "Build a polished, editorial, and technical, evoking a professional studio or high-end photography gear aesthetic blog in the style of motionsites.ai's \"Blog Showcase\" template. Triggers on requests mentioning \"Blog Showcase\", \"motionsites blog-showcase\", or the combination \"blog + blog showcase\"."
---

# Blog Showcase (motionsites-inspired)

Category: **Blog**.

## Source of inspiration
Public preview only: motionsites.ai → "Blog Showcase". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Polished, editorial, and technical, evoking a professional studio or high-end photography gear aesthetic.

## Palette
`#F8F8F8` · `#000000` · `#717171` · `#FFF0F5` · `#7A1B43`

```css
:root {
  --background: #F8F8F8;
  --foreground: #000000;
  --muted: #717171;
  --muted-foreground: #FFF0F5;
  --accent: #7A1B43;
  --border: #717171;
}
```

## Typography
- **Display:** Lexend or Montserrat, Bold 42px with tight tracking (1.1 line height)
- **Body:** Inter or Helvetica Neue, Regular 16px
- **Mono / caption:** JetBrains Mono, 12px for meta data and credits

## Layout
A split-screen hero section featuring a 50/50 image-to-text ratio, followed by a symmetrical 3-column grid for secondary articles. Content is housed in soft-rounded white containers on a light grey background to create a floating card effect.

## Hero centerpiece
High-contrast abstract macro photography in landscape orientation with camera-viewfinder corner brackets.

## Motion
Subtle hover scaling on card images and a reveal animation where viewfinder brackets expand from the center on page load. Button pills change opacity or shift hue slightly on hover.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use sharp 90-degree corners on the main container cards.
- Do not include standard underline links; use pill-shaped tags only.
- Avoid thin or serif fonts for headings—stick to geometric sans-serif for a technical feel.
- Never use more than three lines for secondary body descriptions in the hero section.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
