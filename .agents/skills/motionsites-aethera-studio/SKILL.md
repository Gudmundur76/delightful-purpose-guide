---
name: motionsites-aethera-studio
description: "Build a serene, sophisticated, and timeless, blending classical editorial elegance with dreamlike digital art hero section in the style of motionsites.ai's \"Aethera Studio\" template. Triggers on requests mentioning \"Aethera Studio\", \"motionsites aethera-studio\", or the combination \"hero section + aethera studio\"."
---

# Aethera Studio (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Aethera Studio". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Serene, sophisticated, and timeless, blending classical editorial elegance with dreamlike digital art.

## Palette
`#FFFFFF` · `#F8F9FA` · `#6B7280` · `#000000` · `#1A1A1A`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F8F9FA;
  --muted: #6B7280;
  --muted-foreground: #000000;
  --accent: #1A1A1A;
  --border: #6B7280;
}
```

## Typography
- **Display:** Editorial New or Times New Roman, Light, 84px, -0.02em letter spacing
- **Body:** Inter or Helvetica Neue, Regular, 16px, 1.6 line-height
- **Mono / caption:** IBM Plex Mono, Medium, 12px uppercase for utility links

## Layout
Center-aligned vertical stack with a floating navigation bar. The headline dominates the top third, followed by a narrow paragraph and a pill-shaped CTA, with the image serving as a grounding floor for the composition.

## Hero centerpiece
A high-detail, ethereal pastoral landscape illustration featuring rolling green hills, a winding river, and distant blue mountains, positioned in the lower half of the frame.

## Motion
Soft parallax on the landscape layers during scroll. Text elements should use a gentle 'blur-to-clear' fade-in reveal. The CTA buttons utilize a subtle scaling transition on hover.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use hard shadows or high-contrast color blocks on text.
- Avoid heavy geometric shapes; keep the interface secondary to the serif typography and organic imagery.
- Do not crowd the landscape illustration with UI elements.
- Avoid using vibrant or neon colors outside of the nature illustration.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
