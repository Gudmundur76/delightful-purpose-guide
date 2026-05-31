---
name: motionsites-duolingo-styleguide
description: Build a playful, upbeat, and accessible educational gamification hero section in the style of motionsites.ai's "Duolingo Styleguide" template. Triggers on requests mentioning "Duolingo Styleguide", "motionsites duolingo-styleguide", or the combination "hero section + duolingo styleguide".
---

# Duolingo Styleguide (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Duolingo Styleguide". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Playful, upbeat, and accessible educational gamification.

## Palette
`#FFFFFF` · `#58CC02` · `#4B4B4B` · `#1CB0F6` · `#FFC800`

```css
:root {
  --background: #FFFFFF;
  --foreground: #58CC02;
  --muted: #4B4B4B;
  --muted-foreground: #1CB0F6;
  --accent: #FFC800;
  --border: #4B4B4B;
}
```

## Typography
- **Display:** Feather Bold, rounded geometric sans-serif
- **Body:** DIN Next Rounded, sans-serif medium
- **Mono / caption:** DIN Next Rounded, uppercase-bold for labels and metadata

## Layout
Two-column split hero layout with a high-density illustrative cluster on the left and center-aligned call-to-action stack on the right. A thin light gray hairline divider separates the hero from a structured grid of UI components below.

## Hero centerpiece
Dynamic character-driven illustration group featuring 'Duo' the owl and various human avatars with rounded, geometric vector art styles.

## Motion
Springy and bouncy transitions using elastic easings. Characters should have subtle floating idle animations while buttons utilize a 'press-down' effect that flattens the bottom shadow on click.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid sharp corners; all containers and buttons must have a minimum 12px border radius.
- Do not use thin or elegant serif fonts; the brand is exclusively chunky and friendly.
- Avoid flat buttons; use the 'thick bottom' 3D shadow effect (2-4px inset) to signify interactivity.
- Do not use gradients; stick to flat, high-contrast primitive colors for a game-like feel.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
