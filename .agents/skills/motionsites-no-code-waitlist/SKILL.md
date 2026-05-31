---
name: motionsites-no-code-waitlist
description: "Build a high-end, futuristic, and ethereal, blending 'tech-noir' vibes with academic elegance waitlist in the style of motionsites.ai's \"No-Code Waitlist\" template. Triggers on requests mentioning \"No-Code Waitlist\", \"motionsites no-code-waitlist\", or the combination \"waitlist + no-code waitlist\"."
---

# No-Code Waitlist (motionsites-inspired)

Category: **Waitlist**.

## Source of inspiration
Public preview only: motionsites.ai → "No-Code Waitlist". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
High-end, futuristic, and ethereal, blending 'Tech-Noir' vibes with academic elegance.

## Palette
`#000000` · `#1A1A2E` · `#5E5CE6` · `#A29BFE` · `#FFFFFF`

```css
:root {
  --background: #000000;
  --foreground: #1A1A2E;
  --muted: #5E5CE6;
  --muted-foreground: #A29BFE;
  --accent: #FFFFFF;
  --border: #5E5CE6;
}
```

## Typography
- **Display:** Instrument Serif, serif regular
- **Body:** Inter, sans-serif medium
- **Mono / caption:** JetBrains Mono, monospace uppercase

## Layout
Centric and immersive hero section with a floating 'pill-shaped' navigation bar. Elements are vertically stacked in the center with significant breathing room to emphasize the background art.

## Hero centerpiece
High-fidelity 3D abstract fluid sculpture with iridescent glass and chrome textures.

## Motion
Floating slow-parallax on the 3D background. UI elements should fade in with a slight upward stagger, while the cursor interaction on the input field triggers a subtle glow expansion.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid generic sans-serif fonts for headings; the serif is vital for the premium feel.
- Do not use solid white backgrounds or flat colors; depth is created through the dark, textured backdrop.
- Avoid heavy borders; use thin, low-opacity glass-morphism effects for UI elements.
- Don't crowd the centerpiece; allow the 3D art to bleed behind the text.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
