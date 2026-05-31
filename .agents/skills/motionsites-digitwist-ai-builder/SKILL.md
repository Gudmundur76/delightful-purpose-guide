---
name: motionsites-digitwist-ai-builder
description: Build a a premium, high-tech, and futuristic aesthetic that feels both mysterious and highly efficient saas in the style of motionsites.ai's "Digitwist AI Builder" template. Triggers on requests mentioning "Digitwist AI Builder", "motionsites digitwist-ai-builder", or the combination "saas + digitwist ai builder".
---

# Digitwist AI Builder (motionsites-inspired)

Category: **SaaS**.

## Source of inspiration
Public preview only: motionsites.ai → "Digitwist AI Builder". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
A premium, high-tech, and futuristic aesthetic that feels both mysterious and highly efficient.

## Palette
`#000000` · `#001CBB` · `#FFFFFF` · `#2E5BFF` · `#2E5BFF`

```css
:root {
  --background: #000000;
  --foreground: #001CBB;
  --muted: #FFFFFF;
  --muted-foreground: #2E5BFF;
  --accent: #2E5BFF;
  --border: #FFFFFF;
}
```

## Typography
- **Display:** Instrument Serif, serif for emphasis and Inter, sans-serif bold for the main headline
- **Body:** Inter, sans-serif light-weight
- **Mono / caption:** JetBrains Mono or similar clean monospace for small labels (if applicable)

## Layout
A centered hero composition with a top-aligned navigation bar. Typography is stacked vertically in the center, utilizing a heavy contrast in scale between headline and sub-headline, followed by twin CTA buttons.

## Hero centerpiece
A dynamic vertical fin/slit background with a deep blue gradient that creates a sense of rhythmic depth and motion.

## Motion
Subtle parallax or horizontal shifting on the vertical fins to imply depth as the user moves their cursor. Text should utilize a clean, upward fade-in stagger animation upon page load.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using flat, solid colored backgrounds; depth is essential.
- Do not use harsh, square-cornered buttons; stick to high-pill radius rounded corners.
- Avoid busy or textured overlays that might distract from the clean readability of the white typography.
- Never use multiple bright accent colors; stick strictly to the blue/white/black palette.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
