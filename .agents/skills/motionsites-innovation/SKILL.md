---
name: motionsites-innovation
description: "Build a mystical, visionary, and intellectually sophisticated, blending cosmic wonder with high-end editorial tech landing page in the style of motionsites.ai's \"Innovation\" template. Triggers on requests mentioning \"Innovation\", \"motionsites innovation\", or the combination \"landing page + innovation\"."
---

# Innovation (motionsites-inspired)

Category: **Landing Page**.

## Source of inspiration
Public preview only: motionsites.ai → "Innovation". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Mystical, visionary, and intellectually sophisticated, blending cosmic wonder with high-end editorial tech.

## Palette
`#000000` · `#0A0A0B` · `#1A1A1C` · `#E5E5E5` · `#F3E5AB`

```css
:root {
  --background: #000000;
  --foreground: #0A0A0B;
  --muted: #1A1A1C;
  --muted-foreground: #E5E5E5;
  --accent: #F3E5AB;
  --border: #1A1A1C;
}
```

## Typography
- **Display:** Editorial New, serif italic blended with Helvetica Now, sans-serif bold
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, monospace light for captions and labels

## Layout
A vertical scroller defined by high-contrast 'Dark Mode' sections with generous breathing room. Uses an asymmetrical grid where text blocks are often offset or justified against expansive, full-bleed cinematic imagery.

## Hero centerpiece
Cinematic AI-generated surrealist photography blending human figures with cosmic and organic nebulae.

## Motion
Parallax scrolling on background starfields to create depth. Smooth fade-in reveals for typography and glass-morphic cards. Subtle pulse or glow animations on CTA inputs.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid flat vector illustrations or stock corporate photography.
- Do not use bright or high-contrast accent colors (stay within the dark cosmic spectrum).
- Avoid heavy drop shadows; use glassmorphism and soft glows for depth instead.
- Never use standard sans-serif weights for primary headlines; must use the serif italic contrast.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
