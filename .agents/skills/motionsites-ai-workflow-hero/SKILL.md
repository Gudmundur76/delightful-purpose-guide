---
name: motionsites-ai-workflow-hero
description: Build a ethereal and harmonious 'solarpunk' aesthetic that blends high-tech ai concepts with organic, monumental nature hero in the style of motionsites.ai's "AI Workflow Hero" template. Triggers on requests mentioning "AI Workflow Hero", "motionsites ai-workflow-hero", or the combination "hero + ai workflow hero".
---

# AI Workflow Hero (motionsites-inspired)

Category: **Hero**.

## Source of inspiration
Public preview only: motionsites.ai → "AI Workflow Hero". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Ethereal and harmonious 'Solarpunk' aesthetic that blends high-tech AI concepts with organic, monumental nature.

## Palette
`#FDF5E6` · `#2D4F35` · `#789E7E` · `#D4AF37` · `#1A1A1A`

```css
:root {
  --background: #FDF5E6;
  --foreground: #2D4F35;
  --muted: #789E7E;
  --muted-foreground: #D4AF37;
  --accent: #1A1A1A;
  --border: #789E7E;
}
```

## Typography
- **Display:** Clash Display or Schibsted Grotesk, Medium with tight tracking
- **Body:** Geist Sans or Inter, Regular
- **Mono / caption:** JetBrains Mono, Light for interface labels

## Layout
Centrally focused atmospheric hero with a floating pill-shaped navigation bar. Typography is layered over the vertical center, with secondary copy and CTAs anchored to the bottom third of the frame.

## Hero centerpiece
Atmospheric, hyper-realistic 3D landscape featuring a mossy stone arch bridge connecting two golden-lit cliffs above a sea of clouds.

## Motion
Subtle parallax scrolling on the mountain layers combined with a persistent slow-drifting cloud mist overlay. Text elements should enter with a soft 'emerge' fade and slight upward drift.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid high-contrast black/white; keep colors organic and muted.
- Do not use harsh geometric shadows; rely on soft atmospheric glows.
- Avoid tech-bro vibrant blues or neon accents.
- Don't overcrowd the margins; maintain the airy 'over-the-clouds' breathing room.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
