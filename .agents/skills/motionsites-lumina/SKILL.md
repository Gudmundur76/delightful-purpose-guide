---
name: motionsites-lumina
description: Build a ethereal, cinematic, and meditative, evoking a sense of cosmic discovery and high-end minimalism footer section in the style of motionsites.ai's "Lumina" template. Triggers on requests mentioning "Lumina", "motionsites lumina", or the combination "footer section + lumina".
---

# Lumina (motionsites-inspired)

Category: **Footer Section**.

## Source of inspiration
Public preview only: motionsites.ai → "Lumina". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Ethereal, cinematic, and meditative, evoking a sense of cosmic discovery and high-end minimalism.

## Palette
`#1A2534` · `#CBD5E0` · `#F8F9FA` · `#2D374833` · `#FFFFFF`

```css
:root {
  --background: #1A2534;
  --foreground: #CBD5E0;
  --muted: #F8F9FA;
  --muted-foreground: #2D374833;
  --accent: #FFFFFF;
  --border: #F8F9FA;
}
```

## Typography
- **Display:** Inter, sans-serif semibold with tight tracking
- **Body:** Inter, sans-serif regular
- **Mono / caption:** Space Mono, monospace for labels and tags

## Layout
A multi-layered vertical stack starting with a massive cinematic hero visual, followed by a pill-shaped CTA input field, and concluding with a frosted-glass footer container that uses a four-column grid. The footer content is anchored at the bottom of the viewport with a distinct translucent border.

## Hero centerpiece
Cinematic, wide-angle surrealist photography featuring a planet-sized orb emerging from a line of clouds and a solitary figure in a field.

## Motion
Subtle parallax scrolling on the background planet visual to create depth. Input field and footer should employ a soft 'fade and lift' reveal animation on scroll, with smooth hover transitions on navigation links.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid high-contrast solid black backgrounds; use deep navies or charcoal for depth.
- Don't use sharp corners on container elements; maintain 24px-32px border radii.
- Never use saturated primary colors for buttons; keep interactions muted and atmospheric.
- Avoid heavy drop shadows; use frosted glass (glassmorphism) for depth.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
