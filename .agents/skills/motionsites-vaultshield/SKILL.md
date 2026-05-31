---
name: motionsites-vaultshield
description: "Build a playful yet secure; a high-fidelity 'claymorphism' aesthetic that feels soft, futuristic, and premium hero in the style of motionsites.ai's \"VaultShield\" template. Triggers on requests mentioning \"VaultShield\", \"motionsites vaultshield\", or the combination \"hero + vaultshield\"."
---

# VaultShield (motionsites-inspired)

Category: **Hero**.

## Source of inspiration
Public preview only: motionsites.ai → "VaultShield". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Playful yet secure; a high-fidelity 'Claymorphism' aesthetic that feels soft, futuristic, and premium.

## Palette
`#E7E4E1` · `#FFFFFF` · `#1A2533` · `#634EE3` · `#634EE3`

```css
:root {
  --background: #E7E4E1;
  --foreground: #FFFFFF;
  --muted: #1A2533;
  --muted-foreground: #634EE3;
  --accent: #634EE3;
  --border: #1A2533;
}
```

## Typography
- **Display:** Plus Jakarta Sans, sans-serif bold
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, monospace medium (for inline icons/labels)

## Layout
A two-column split with a left-aligned typography stack (headline, body, CTA) and a right-aligned 3D centerpiece that bleeds off the bottom right and top edges. The navigation bar spans the top with a central flex links and right-aligned pill buttons.

## Hero centerpiece
A 3D abstract claymorphism factory machine with glass tubes, iridescent token-like coins flowing through a track, and a glowing purple core.

## Motion
Continuous slow-scrolling 3D tokens moving along the track. Smooth hover-state transitions on buttons that slightly increase saturation and scale. Subtle parallax on the headline as the user scrolls.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid high-contrast black backgrounds; stick to warm grays.
- Do not use sharp-cornered buttons or input fields.
- Avoid flat 2D icons; everything should feel tactile, rounded, and shaded.
- Don't let the text overlap the 3D assets on smaller viewports.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
