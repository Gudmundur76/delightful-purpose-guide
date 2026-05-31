---
name: motionsites-celestia
description: Build a sophisticated, ethereal, and high-tech with a nod to classical romanticism and japanese charcoal illustration hero section in the style of motionsites.ai's "Celestia" template. Triggers on requests mentioning "Celestia", "motionsites celestia", or the combination "hero section + celestia".
---

# Celestia (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Celestia". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Sophisticated, ethereal, and high-tech with a nod to classical romanticism and Japanese charcoal illustration.

## Palette
`#0A0A0B` · `#1A1C1E` · `#4A4D52` · `#D1D5DB` · `#FFFFFF`

```css
:root {
  --background: #0A0A0B;
  --foreground: #1A1C1E;
  --muted: #4A4D52;
  --muted-foreground: #D1D5DB;
  --accent: #FFFFFF;
  --border: #4A4D52;
}
```

## Typography
- **Display:** PP Editorial New, Serif Light 80px
- **Body:** Inter or Geist Sans, Regular 14px
- **Mono / caption:** JetBrains Mono, Medium 11px uppercase with high tracking

## Layout
Full-bleed immersive background with a centered vertical stack for content. The navigation is housed in a floating pill-shaped container at the top center, mirroring the rounded decorative elements throughout.

## Hero centerpiece
Dramatic low-angle view of a stylized nocturnal sky filled with ink-wash cumulus clouds and starlight.

## Motion
Slow parallax on cloud layers to create depth. Text elements should use a gentle 'blur and fade-in' reveal as the page loads. Subtle twinkling animations on the star field.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using pure #000000; keep blacks deep but nuanced.
- Do not use standard sans-serifs for the headline; it requires high-contrast serifs.
- Prevent CTA buttons from having solid fills; keep them ephemeral and glass-like.
- Avoid grid-heavy layouts; let the clouds dictate the negative space.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
