---
name: motionsites-nexora-automation
description: Build a sophisticated and serene 'old world' meets 'modern ai'—specifically blending classical aesthetics with high-tech automation saas in the style of motionsites.ai's "Nexora Automation" template. Triggers on requests mentioning "Nexora Automation", "motionsites nexora-automation", or the combination "saas + nexora automation".
---

# Nexora Automation (motionsites-inspired)

Category: **SaaS**.

## Source of inspiration
Public preview only: motionsites.ai → "Nexora Automation". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Sophisticated and serene 'Old World' meets 'Modern AI'—specifically blending classical aesthetics with high-tech automation.

## Palette
`#FBFAF9` · `#737373` · `#E5E7EB` · `#5B62F0` · `#1A1A1A`

```css
:root {
  --background: #FBFAF9;
  --foreground: #737373;
  --muted: #E5E7EB;
  --muted-foreground: #5B62F0;
  --accent: #1A1A1A;
  --border: #E5E7EB;
}
```

## Typography
- **Display:** Editorial New, serif light with selective italicization for emphasis
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, monospace for badge labels and UI data

## Layout
A centered vertical stack starting with a pill-shaped badge, followed by a large typographic headline, subheadline, and dual CTA buttons. The bottom half is dominated by a floating glass-card dashboard that overlaps a detailed environmental illustration.

## Hero centerpiece
High-fidelity dashboard UI overlaying a painterly, textured oil-paint style landscape background.

## Motion
Subtle parallax on the background landscape during scroll. The dashboard UI should use a smooth spring-reveal from the bottom. Headline text utilizes staggered line-by-line fading.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid flat, solid color backgrounds; must use organic, painterly textures.
- Do not use standard sans-serif for headlines; it must be a high-contrast serif with italics.
- Avoid sharp 90-degree corners on the UI mockup; use large, glassmorphic radiuses.
- Don't use overly saturated primary colors for buttons; stick to deep carbon and soft neutrals.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
