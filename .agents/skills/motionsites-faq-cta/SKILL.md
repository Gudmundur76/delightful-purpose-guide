---
name: motionsites-faq-cta
description: Build a techno-optimistic and accessible, blending soft organic gradients with clean, corporate-modern utility cta in the style of motionsites.ai's "FAQ CTA" template. Triggers on requests mentioning "FAQ CTA", "motionsites faq-cta", or the combination "cta + faq cta".
---

# FAQ CTA (motionsites-inspired)

Category: **CTA**.

## Source of inspiration
Public preview only: motionsites.ai → "FAQ CTA". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Techno-optimistic and accessible, blending soft organic gradients with clean, corporate-modern utility.

## Palette
`#FFFFFF` · `#F8F9FA` · `#FF8A65` · `#FFD54F` · `#111111`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F8F9FA;
  --muted: #FF8A65;
  --muted-foreground: #FFD54F;
  --accent: #111111;
  --border: #FF8A65;
}
```

## Typography
- **Display:** Inter or Satoshi, Semi-Bold 48px-56px with tight tracking (-2%)
- **Body:** Inter or Helvetica Neue, Regular 14px-16px
- **Mono / caption:** SF Mono or JetBrains Mono, 12px for small metadata tags

## Layout
Two-column asymmetrical grid: a large 60/40 split where a vibrant CTA card sits on the left, balanced by a stacked accordion list on the right. The footer follows a classic four-column distribution with left-aligned brand info and right-aligned newsletter capture.

## Hero centerpiece
Large-scale mesh gradient card with centered typography and a high-contrast floating button.

## Motion
Smooth height expansion for FAQ accordions using easing curves like cubic-bezier(0.4, 0, 0.2, 1). Elements should have subtle lift-on-hover effects using soft drop shadows. The mesh gradient should feature a slow, barely perceptible rotation/pulse.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid thin, high-contrast borders; use soft shadows and background colors for separation instead.
- Do not use sharp 90-degree corners; everything must have a radius between 8px and 24px.
- Avoid cluttered footers; use generous vertical white space and simple text lists.
- Don't use flat colors for primary CTA backgrounds; use multi-stop gradients or glows.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
