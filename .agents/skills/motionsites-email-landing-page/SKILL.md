---
name: motionsites-email-landing-page
description: Build a high-end cosmic minimalism that feels both technologically advanced and calm landing page in the style of motionsites.ai's "Email Landing Page" template. Triggers on requests mentioning "Email Landing Page", "motionsites email-landing-page", or the combination "landing page + email landing page".
---

# Email Landing Page (motionsites-inspired)

Category: **Landing page**.

## Source of inspiration
Public preview only: motionsites.ai → "Email Landing Page". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
High-end cosmic minimalism that feels both technologically advanced and calm.

## Palette
`#000000` · `#0A0A0A` · `#1E3A8A` · `#60A5FA` · `#FFFFFF`

```css
:root {
  --background: #000000;
  --foreground: #0A0A0A;
  --muted: #1E3A8A;
  --muted-foreground: #60A5FA;
  --accent: #FFFFFF;
  --border: #1E3A8A;
}
```

## Typography
- **Display:** Inter, sans-serif bold with tight tracking
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, monospace light for utility labels

## Layout
A centered, vertical stack for the hero section with the headline occupying the upper-third, followed by a wide-format product interface reveal in the bottom half. Navigation is split between a top-center utility menu and a high-contrast top-right CTA.

## Hero centerpiece
A large, ethereal 3D silk or smoke-like plume with a vibrant blue-to-black gradient that weaves behind and through the typography.

## Motion
Slow, rhythmic undulating motion for the 3D plume to create a sense of 'breathing' life. Text elements should use a staggered fade-in with a slight vertical slide upward from zero opacity.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using standard 'neon' glows; prioritize smooth, organic gradients.
- Do not use flat white backgrounds—the deep obsidian base is essential for the depth effect.
- Avoid heavy borders or high-contrast box shadows; let the material textures define the hierarchy.
- Don't overuse the accent blue; keep it restricted to the 3D form and subtle text highlights.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
