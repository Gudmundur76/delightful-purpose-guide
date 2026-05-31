---
name: motionsites-taskly
description: "Build a futuristic, pristine, and high-tech with a focus on fluid productivity and premium soft-ui aesthetics hero section in the style of motionsites.ai's \"Taskly\" template. Triggers on requests mentioning \"Taskly\", \"motionsites taskly\", or the combination \"hero section + taskly\"."
---

# Taskly (motionsites-inspired)

Category: **Hero Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Taskly". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Futuristic, pristine, and high-tech with a focus on fluid productivity and premium soft-UI aesthetics.

## Palette
`#FFFFFF` · `#F0F8FF` · `#000000` · `#FF914D` · `#5296EE`

```css
:root {
  --background: #FFFFFF;
  --foreground: #F0F8FF;
  --muted: #000000;
  --muted-foreground: #FF914D;
  --accent: #5296EE;
  --border: #000000;
}
```

## Typography
- **Display:** General Sans or Satoshi, Semibold, 80px / 0.9 line-height with -2% letter spacing
- **Body:** Inter or Helvetica Neue, Regular, 18px / 1.5 line-height
- **Mono / caption:** JetBrains Mono, Medium, 12px for micro-copy and ratings

## Layout
An asymmetrical two-column composition with a floating glassmorphic navigation bar centered at the top. The left column holds tight-aligned copy and a call-to-action, while the right features a oversized 3D organic form that overlaps the white background and soft blue glows.

## Hero centerpiece
A large, organic 3D cerulean sphere with fluid, undulating indentations and a glossy, liquid-metal finish.

## Motion
The 3D sphere should feature a slow 'liquid' displacement animation. Typography and buttons should use a soft 'blur-in' reveal, while the navigation bar remains fixed with a subtle backdrop-filter blur.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use sharp-cornered containers or buttons.
- Avoid high-contrast black backgrounds; stick to the soft blue luminosity.
- Don't clutter the right side of the layout; let the 3D object breathe.
- Avoid standard sans-serifs for the headline; use a font with high stroke contrast and tight tracking.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
