---
name: motionsites-asme
description: Build a intellectual, mysterious, and high-end tech-noir with a touch of organic surrealism hero section in the style of motionsites.ai's "Asme" template. Triggers on requests mentioning "Asme", "motionsites asme", or the combination "hero section + asme".
---

# Asme (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Asme". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Intellectual, mysterious, and high-end tech-noir with a touch of organic surrealism.

## Palette
`#000000` · `#1A1A1A` · `#E6E6E6` · `#FFD700` · `#FFFFFF`

```css
:root {
  --background: #000000;
  --foreground: #1A1A1A;
  --muted: #E6E6E6;
  --muted-foreground: #FFD700;
  --accent: #FFFFFF;
  --border: #E6E6E6;
}
```

## Typography
- **Display:** Newsreader or Editorial New, Medium 80px+
- **Body:** Inter or Geist Sans, Regular 14px-16px
- **Mono / caption:** SF Mono or JetBrains Mono, 12px uppercase

## Layout
A vertically stacked, centrally aligned hero section with a fixed utility navigation bar. The content flows from a large serif headline into a pill-shaped input field, followed by a secondary CTA and a full-width immersive background image.

## Hero centerpiece
A cinematic, surrealist AI-generated image featuring a person at a laptop surrounded by glowing ethereal rings and yellow lilies.

## Motion
Soft parallax on the background image during scroll. Text elements should use a gentle 'blur-in' fade with a slight upward slide, while the glowing rings in the image imply a slow, continuous rotational pulse.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using standard flat illustrations or corporate Memphis; stick to cinematic realism.
- Do not use high-contrast vibrant colors; keep the palette muted and atmospheric.
- Avoid heavy box shadows; use translucent borders and subtle glows instead.
- Don't overcrowd the header; maintain wide letter spacing and high negative space.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
