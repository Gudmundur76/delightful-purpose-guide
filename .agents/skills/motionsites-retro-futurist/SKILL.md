---
name: motionsites-retro-futurist
description: Build a a sterile yet whimsical 'lo-fi hi-tech' aesthetic that blends 1980s corporate brutalism with modern minimalist elegance hero in the style of motionsites.ai's "Retro-Futurist" template. Triggers on requests mentioning "Retro-Futurist", "motionsites retro-futurist", or the combination "hero + retro-futurist".
---

# Retro-Futurist (motionsites-inspired)

Category: **Hero**.

## Source of inspiration
Public preview only: motionsites.ai → "Retro-Futurist". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
A sterile yet whimsical 'Lo-Fi Hi-Tech' aesthetic that blends 1980s corporate brutalism with modern minimalist elegance.

## Palette
`#B8B8B0` · `#E5E5E0` · `#202020` · `#FFFFFF` · `#9A9A95`

```css
:root {
  --background: #B8B8B0;
  --foreground: #E5E5E0;
  --muted: #202020;
  --muted-foreground: #FFFFFF;
  --accent: #9A9A95;
  --border: #202020;
}
```

## Typography
- **Display:** PP Neue Montreal, Semi-Bold. High x-height, tight leading.
- **Body:** Inter or Lab Grotesque, medium weight with tight tracking.
- **Mono / caption:** JetBrains Mono or custom technical sans for small labels.

## Layout
A split vertical composition where the right side is anchored by a large-scale subject and the left contains a clustered grouping of typography and pill-shaped action buttons. The navigation is pinned to the top with wide letter-spacing.

## Hero centerpiece
A surreal, high-concept character portrait featuring a person in a grey wool blazer with a vintage computer terminal as a head.

## Motion
Subtle micro-interactions like a custom oversized cursor that reacts to screen elements. Typography should use a soft 'fade-and-slide up' reveal, while the centerpiece remains static to ground the composition.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid high-contrast black; stick to deep charcoals to maintain the 'paper' feel.
- Do not use drop shadows or heavy gradients on buttons; keep pills flat or with minimal borders.
- Avoid standard sans-serifs; use fonts with tight kerning and distinctive ink-trap qualities.
- Never use vibrant or neon colors; maintain a desaturated, archival palette.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
