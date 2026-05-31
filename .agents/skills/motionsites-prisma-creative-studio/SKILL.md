---
name: motionsites-prisma-creative-studio
description: "Build a cinematic, mysterious, and high-end creative, blending brutalist typography with dreamlike surrealist art landing page in the style of motionsites.ai's \"Prisma Creative Studio\" template. Triggers on requests mentioning \"Prisma Creative Studio\", \"motionsites prisma-creative-studio\", or the combination \"landing page + prisma creative studio\"."
---

# Prisma Creative Studio (motionsites-inspired)

Category: **Landing Page**.

## Source of inspiration
Public preview only: motionsites.ai → "Prisma Creative Studio". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Cinematic, mysterious, and high-end creative, blending brutalist typography with dreamlike surrealist art.

## Palette
`#0A0A0A` · `#1C1C1C` · `#D1D1C1` · `#6B6B5F` · `#FFFFFF`

```css
:root {
  --background: #0A0A0A;
  --foreground: #1C1C1C;
  --muted: #D1D1C1;
  --muted-foreground: #6B6B5F;
  --accent: #FFFFFF;
  --border: #D1D1C1;
}
```

## Typography
- **Display:** Calyx, serif italic mixed with Neue Haas Grotesk Bold
- **Body:** Inter, sans-serif regular with tight tracking
- **Mono / caption:** JetBrains Mono, small caps for navigational elements and labels

## Layout
The design uses a heavy-top composition with an oversized hero image followed by a centered typographic section and a structured feature grid. Content is grouped in dark, low-contrast modules with generous vertical spacing and centered alignments.

## Hero centerpiece
Large-scale cinematic imagery featuring surreal, high-fidelity 3D environments with a 'floating' perspective.

## Motion
Slow parallax on background images and subtle fade-ins for text. Typography should use a 'letter-by-letter' reveal or a slow vertical slide to enhance the cinematic feeling.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Don't use vibrant or neon colors; keep the palette grounded in deep earth tones and shadows.
- Avoid standard sans-serif weights for headlines; use ultra-heavy weights or expressive serifs.
- Don't use harsh borders; use soft gradients and subtle translucency for containment.
- Avoid fast or bouncy animations; maintain a slow, cinematic pace.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
