---
name: motionsites-skyelite-private-jets
description: "Build a high-altitude luxury—sophisticated, exclusive, and technologically advanced with a calming, airy atmosphere landing page in the style of motionsites.ai's \"SkyElite Private Jets\" template. Triggers on requests mentioning \"SkyElite Private Jets\", \"motionsites skyelite-private-jets\", or the combination \"landing page + skyelite private jets\"."
---

# SkyElite Private Jets (motionsites-inspired)

Category: **Landing Page**.

## Source of inspiration
Public preview only: motionsites.ai → "SkyElite Private Jets". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
High-altitude luxury—sophisticated, exclusive, and technologically advanced with a calming, airy atmosphere.

## Palette
`#F2F4F7` · `#667085` · `#1D2939` · `#FFFFFF` · `#FF8C00`

```css
:root {
  --background: #F2F4F7;
  --foreground: #667085;
  --muted: #1D2939;
  --muted-foreground: #FFFFFF;
  --accent: #FF8C00;
  --border: #1D2939;
}
```

## Typography
- **Display:** Plus Jakarta Sans, semi-bold with tight leading
- **Body:** Inter, sans-serif regular
- **Mono / caption:** Roboto Mono, uppercase 0.1em tracking

## Layout
The section uses a centered vertical stack for the headline and CTA, overlaid on a full-bleed cinematic background. The navigation is spread horizontally across the top with a logo anchored top-left and menu items top-right.

## Hero centerpiece
A high-fidelity 3D render of a private jet engine in mid-flight, featuring glowing orange internal turbines contrasted against a matte charcoal fuselage.

## Motion
Subtle parallax on the background image during scroll to simulate flight depth. The engine's orange glow should have a slow, pulsing bloom effect, while text elements fade in with a slight upward slide.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use bright primary colors; keep the palette muted and corporate.
- Avoid sharp corners on buttons; use high-pill rounding for a 'premium' feel.
- Don't use overly thin font weights for body copy; ensure readability against photography.
- Avoid cluttered navigation; use ample letter spacing and generous margins.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
