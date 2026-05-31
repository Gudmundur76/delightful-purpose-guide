---
name: motionsites-mindloop-landing
description: "Build a ethereal, futuristic, and intellectually curious—merging high-tech precision with organic wonder landing page in the style of motionsites.ai's \"Mindloop Landing\" template. Triggers on requests mentioning \"Mindloop Landing\", \"motionsites mindloop-landing\", or the combination \"landing page + mindloop landing\"."
---

# Mindloop Landing (motionsites-inspired)

Category: **Landing Page**.

## Source of inspiration
Public preview only: motionsites.ai → "Mindloop Landing". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Ethereal, futuristic, and intellectually curious—merging high-tech precision with organic wonder.

## Palette
`#02050A` · `#10141D` · `#FFFFFF` · `#A5B4FC` · `#FBD38D`

```css
:root {
  --background: #02050A;
  --foreground: #10141D;
  --muted: #FFFFFF;
  --muted-foreground: #A5B4FC;
  --accent: #FBD38D;
  --border: #FFFFFF;
}
```

## Typography
- **Display:** PP Neue Montreal, sans-serif medium mixed with Editorial New, serif italic for emphasis
- **Body:** Inter, sans-serif regular with tight tracking
- **Mono / caption:** JetBrains Mono, monospace for pills and micro-copy

## Layout
Centered vertical stack with a fixed narrow-width container to maximize the peripheral space aesthetic. Sections are anchored by large-scale 3D assets that bleed out of their implied containers, creating a sense of depth and suspension.

## Hero centerpiece
A floating, hyper-realistic 3D diorama of a bioluminescent terrarium island set against a deep cosmic void.

## Motion
Slow, subtle parallax on the floating 3D islands to simulate weightlessness. Text elements should use a smooth 'blur-to-clear' fade-in combined with a slight upward drift during scroll reveals.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid flat vector illustrations; stick strictly to high-fidelity 3D renders.
- Do not use harsh primary colors; keep the palette muted and atmospheric.
- Avoid standard sans-serif italics; use high-contrast serif faces for emphasis only.
- Don't overcrowd the layout; maintain generous vertical negative space between sections.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
