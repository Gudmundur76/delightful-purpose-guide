---
name: motionsites-transform-data
description: Build a serene, futuristic, and sophisticated, blending high-tech ai utility with an expansive, organic natural environment hero section in the style of motionsites.ai's "Transform Data" template. Triggers on requests mentioning "Transform Data", "motionsites transform-data", or the combination "hero section + transform data".
---

# Transform Data (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Transform Data". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Serene, futuristic, and sophisticated, blending high-tech AI utility with an expansive, organic natural environment.

## Palette
`#F7F8F7` · `#3D4D36` · `#61BF4F` · `#111111` · `#FFFFFF`

```css
:root {
  --background: #F7F8F7;
  --foreground: #3D4D36;
  --muted: #61BF4F;
  --muted-foreground: #111111;
  --accent: #FFFFFF;
  --border: #61BF4F;
}
```

## Typography
- **Display:** Plus Jakarta Sans, Sans-serif Bold with tight letter-spacing
- **Body:** Inter, Sans-serif Regular
- **Mono / caption:** JetBrains Mono, Monospace Medium for status badges and counts

## Layout
A centered vertical stack with a pill-shaped badge at the top, followed by a tight typographic heading. The focal point is a medium-width interactive card centered over a high-resolution landscape background.

## Hero centerpiece
A glassmorphic, floating AI input module with integrated action buttons, positioned over a cinematic aerial landscape.

## Motion
Subtle parallax on the background landscape during scroll. UI elements utilize a gentle 'fade-in and slide-up' reveal with a long cubic-bezier easing for a premium feel.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid using harsh, opaque borders on the input card; keep it translucent.
- Do not use high-saturation accent colors; stick to nature-inspired or neutral tones.
- Don't crowd the top navigation; keep the links airy and centered.
- Avoid standard 'Search' labels; use contextual AI-driven microcopy like 'Ask anything...'.
- Do not use sharp corners; all UI containers must have a high border-radius (16px+).

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
