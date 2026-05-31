---
name: motionsites-securify-data-security
description: Build a high-energy, cinematic, and disruptive, blending extreme lifestyle imagery with a technical, data-centric overlay saas in the style of motionsites.ai's "Securify Data Security" template. Triggers on requests mentioning "Securify Data Security", "motionsites securify-data-security", or the combination "saas + securify data security".
---

# Securify Data Security (motionsites-inspired)

Category: **SaaS**.

## Source of inspiration
Public preview only: motionsites.ai → "Securify Data Security". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
High-energy, cinematic, and disruptive, blending extreme lifestyle imagery with a technical, data-centric overlay.

## Palette
`#0A0B0D` · `#161719` · `#F2F2F2` · `#A1A1A1` · `#FFFFFF`

```css
:root {
  --background: #0A0B0D;
  --foreground: #161719;
  --muted: #F2F2F2;
  --muted-foreground: #A1A1A1;
  --accent: #FFFFFF;
  --border: #F2F2F2;
}
```

## Typography
- **Display:** Plus Jakarta Sans, bold sans-serif with tight tracking
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono for numerical data and captions

## Layout
Asymmetrical hero composition where ultra-large display type occupies the foreground, middle-ground, and background layers of a full-screen image. The navigation is split into floating island components (logo, menu, CTA) at the top of the viewport.

## Hero centerpiece
Full-bleed dynamic action photography (snowboarding/extreme sport) integrated with massive, overlapping sans-serif typography.

## Motion
Parallax layering where text moves at different speeds relative to the background person. Subtle pulse animations on the 'hairline' connectors for the data stats. Smooth expansion on the pill-shaped navigation items upon hover.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use drop shadows on the large typography; maintain a crisp bleed against the image.
- Avoid standard grid alignment for stats; scatter them with thin hair-line pointers to feel like HUD elements.
- Don't use highly saturated accent colors that compete with the photography.
- Avoid boxy navigation containers; keep the floating pill-shape aesthetic for the header.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
