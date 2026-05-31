---
name: motionsites-aurora-onboard
description: Build a sophisticated, high-tech minimalism with a celestial, premium 'pro-tool' atmosphere signup in the style of motionsites.ai's "Aurora Onboard" template. Triggers on requests mentioning "Aurora Onboard", "motionsites aurora-onboard", or the combination "signup + aurora onboard".
---

# Aurora Onboard (motionsites-inspired)

Category: **Signup**.

## Source of inspiration
Public preview only: motionsites.ai → "Aurora Onboard". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Sophisticated, high-tech minimalism with a celestial, premium 'pro-tool' atmosphere.

## Palette
`#000000` · `#1A1A1A` · `#5E42A6` · `#A392D6` · `#FFFFFF`

```css
:root {
  --background: #000000;
  --foreground: #1A1A1A;
  --muted: #5E42A6;
  --muted-foreground: #A392D6;
  --accent: #FFFFFF;
  --border: #5E42A6;
}
```

## Typography
- **Display:** Inter SemiBold/Medium with tight tracking
- **Body:** Inter, system-ui Sanserif Thin/Medium
- **Mono / caption:** JetBrains Mono or SF Pro Mono for small captions and labels

## Layout
A dual-column landing split: the left 45% is a decorative hero panel with rounded corners and high-contrast branding, while the right 55% is a minimalist, dark-themed functional form centered vertically. Social auth buttons sit in a two-column grid above the main stacked form fields.

## Hero centerpiece
Left-hand glassmorphic 'Roadmap' card featuring an organic, grainy violet-to-black radial gradient and a numbered vertical step indicator.

## Motion
Subtle parallax on the grain texture of the gradient. Numbers in the left panel should pulse or glow when active, while form fields use a gentle fade-in on focus.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Avoid sharp 90-degree corners on the left panel; maintain the high-radius 'squircle' felt.
- Do not use pure white for input field text; use low-opacity grays for a 'ghosted' effect.
- Ensure the noise/grain texture on the gradient is subtle and monochromatic, not multicolored digital noise.
- Do not use borders on the primary CTA button; it should be a solid light fill.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
