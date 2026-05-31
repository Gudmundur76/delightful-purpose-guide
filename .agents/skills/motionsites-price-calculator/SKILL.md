---
name: motionsites-price-calculator
description: Build a high-end dark mode utility: professional, precise, and authoritative with a punch of vibrant urgency saas in the style of motionsites.ai's "Price Calculator" template. Triggers on requests mentioning "Price Calculator", "motionsites price-calculator", or the combination "saas + price calculator".
---

# Price Calculator (motionsites-inspired)

Category: **SaaS**.

## Source of inspiration
Public preview only: motionsites.ai → "Price Calculator". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
High-end dark mode utility: professional, precise, and authoritative with a punch of vibrant urgency.

## Palette
`#000000` · `#111111` · `#1A1A1A` · `#FFFFFF` · `#FF5C39`

```css
:root {
  --background: #000000;
  --foreground: #111111;
  --muted: #1A1A1A;
  --muted-foreground: #FFFFFF;
  --accent: #FF5C39;
  --border: #1A1A1A;
}
```

## Typography
- **Display:** SF Pro Display, sans-serif bold
- **Body:** Inter, sans-serif medium
- **Mono / caption:** JetBrains Mono, monospace regular

## Layout
The page features a centered headline and uppercase eyebrow followed by a large, two-column rounded container. The left column handles interactive inputs (radio buttons, sliders, checkboxes), while the right column acts as a summary panel containing stacked price cards.

## Hero centerpiece
Interactive calculator card with a dual-pane layout: a dark input form on the left and dynamic pricing results on the right.

## Motion
Subtle numeric rolling effect for the price totals as the user interacts with the form. Slider handles should have a slight elastic expansion on hover. Values should transition with a crisp fade and 50ms slide-up motion.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid adding distracting background patterns or illustrations; keep it pure pitch black.
- Do not use borders around the input fields; prefer subtle dividers and whitespace.
- Ensure the gradient CTA card is the brightest element on the page; don't dilute its impact with other gradients.
- Avoid standard system fonts; stick to geometric sans-serifs for the premium tech look.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
