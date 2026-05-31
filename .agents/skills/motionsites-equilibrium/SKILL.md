---
name: motionsites-equilibrium
description: "Build a a cinematic, mystical, and aspirational 'dark mode' aesthetic that feels both futuristic and humanistic hero in the style of motionsites.ai's \"Equilibrium\" template. Triggers on requests mentioning \"Equilibrium\", \"motionsites equilibrium\", or the combination \"hero + equilibrium\"."
---

# Equilibrium (motionsites-inspired)

Category: **Hero**.

## Source of inspiration
Public preview only: motionsites.ai → "Equilibrium". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
A cinematic, mystical, and aspirational 'dark mode' aesthetic that feels both futuristic and humanistic.

## Palette
`#0B0D13` · `#232832` · `#4A78A0` · `#D98341` · `#FFFFFF`

```css
:root {
  --background: #0B0D13;
  --foreground: #232832;
  --muted: #4A78A0;
  --muted-foreground: #D98341;
  --accent: #FFFFFF;
  --border: #4A78A0;
}
```

## Typography
- **Display:** Inter, sans-serif bold with tight leading and optical kerning
- **Body:** Inter, sans-serif regular with generous tracking
- **Mono / caption:** IBM Plex Mono, or similar geometric sans for small utility labels/captions

## Layout
A high-impact immersive canvas with a floating pill-shaped navigation bar centered at the top. The left-aligned typography creates a weighted balance against the right-aligned human hand and central glowing orb.

## Hero centerpiece
A hyper-realistic 3D glass orb refracting cosmic light, suspended above a detailed human hand to symbolize personal agency and universal connection.

## Motion
Slow, drifting ambient motion for the orb and cosmic dust layers. Subtle hover-triggered glass morphism shifts on the navigation bar and primary buttons using ease-in-out transitions.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use harsh geometric shadows; stick to soft light diffusion.
- Avoid high-contrast primary colors; use desaturated nebula tones.
- Don't use thin, spidery fonts; keep the typography bold and grounded.
- Avoid cluttered backgrounds; maintain a deep, dark atmospheric void.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
