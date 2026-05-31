---
name: motionsites-neuralyn
description: Build a sophisticated, organic tech: a blend of high-end editorial typography and futuristic glass textures set against a haunting natural backdrop saas in the style of motionsites.ai's "Neuralyn" template. Triggers on requests mentioning "Neuralyn", "motionsites neuralyn", or the combination "saas + neuralyn".
---

# Neuralyn (motionsites-inspired)

Category: **SaaS**.

## Source of inspiration
Public preview only: motionsites.ai → "Neuralyn". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Sophisticated, organic tech: a blend of high-end editorial typography and futuristic glass textures set against a haunting natural backdrop.

## Palette
`#000000` · `#1A1A1A` · `#A8A8A8` · `#D1D5DB` · `#F8CDD4`

```css
:root {
  --background: #000000;
  --foreground: #1A1A1A;
  --muted: #A8A8A8;
  --muted-foreground: #D1D5DB;
  --accent: #F8CDD4;
  --border: #A8A8A8;
}
```

## Typography
- **Display:** Plus Jakarta Sans bold for main stems with Editorial New italic for emphasized keywords.
- **Body:** Inter, sans-serif medium weight for readability.
- **Mono / caption:** SF Mono or JetBrains Mono for system labels and data timestamps.

## Layout
A centered vertical hierarchy featuring a floating navigation bar, a high-impact typographic hero section, and a recessed glass container for the product preview. All elements are anchored against a full-width atmospheric background layer.

## Hero centerpiece
A glassmorphic SaaS dashboard floating in front of a dark, moody botanical macro photograph with deep bokeh.

## Motion
Reveal-heavy motion with soft parallax on the botanical background. Headlines should use a 'blur-in' and upward slide effect, while glass containers use a subtle shimmering hover state to emphasize transparency.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid harsh primary colors; stick to the muted botanical-inspired palette.
- Don't use solid backgrounds for containers; maintain a glassmorphic opacity of 20-30%.
- Do not use standard sans-serif italics for emphasis; only apply the high-contrast serif italic for specific keywords.
- Avoid sharp corners; all UI elements should have a radius between 8px and 24px.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
