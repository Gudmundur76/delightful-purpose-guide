---
name: motionsites-ai-image-generator-ui
description: Build a optimistic, airy, and high-tech minimalist with a 'soft-ui' or 'neo-skeuomorphic' softness ai in the style of motionsites.ai's "AI Image Generator UI" template. Triggers on requests mentioning "AI Image Generator UI", "motionsites ai-image-generator-ui", or the combination "ai + ai image generator ui".
---

# AI Image Generator UI (motionsites-inspired)

Category: **AI**.

## Source of inspiration
Public preview only: motionsites.ai → "AI Image Generator UI". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Optimistic, airy, and high-tech minimalist with a 'soft-UI' or 'neo-skeuomorphic' softness.

## Palette
`#F8FAFC` · `#5A6B87` · `#FEF9C31A` · `#F472B633` · `#0F172A`

```css
:root {
  --background: #F8FAFC;
  --foreground: #5A6B87;
  --muted: #FEF9C31A;
  --muted-foreground: #F472B633;
  --accent: #0F172A;
  --border: #FEF9C31A;
}
```

## Typography
- **Display:** Inter, sans-serif bold (tight letter-spacing)
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, monospace medium (for labels)

## Layout
A centered vertical stack beginning with a small, all-caps eyebrow tag, followed by a bold primary headline and a descriptive subheader. Below, a three-column card grid uses generous whitespace and large corner radii (approx 24-32px) to house feature illustrations and bold bottom-aligned labels.

## Hero centerpiece
A three-column grid of soft-shadowed cards featuring metaphorical UI abstracts (prompt bubbles, logic trees, and stylized folders) against candy-colored mesh gradients.

## Motion
Elements should use gentle floating breath-like vertical loops. Cards should utilize a subtle scale-up on hover with a diffused shadow expansion, while internal gradient elements (mesh circles) should have slow, rotational color shifts.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid harsh, high-contrast borders or dark shadows; keep depth feeling like diffused 'glow' rather than physical weight.
- Do not use solid flat backgrounds for the inner illustrations; always utilize mesh gradients or grid patterns.
- Avoid heavy weighting on body text; keep supporting copy airy and centered.
- Never use saturated primary colors; stick to the pastel, desaturated 'sorbet' palette.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
