---
name: motionsites-email-marketing
description: "Build a celestial, aspirational, and high-tech with a premium academic undertone email marketing in the style of motionsites.ai's \"Email Marketing\" template. Triggers on requests mentioning \"Email Marketing\", \"motionsites email-marketing\", or the combination \"email marketing + email marketing\"."
---

# Email Marketing (motionsites-inspired)

Category: **Email Marketing**.

## Source of inspiration
Public preview only: motionsites.ai → "Email Marketing". Do NOT copy their prompt
text or markup. Synthesize from this brief.

## Mood
Celestial, aspirational, and high-tech with a premium academic undertone.

## Palette
`#090909Header` · `#FFFFFFTypography` · `#1A1A1ASecondaryBg` · `#D4FF00Accent` · `#D4FF00Accent`

```css
:root {
  --background: #090909Header;
  --foreground: #FFFFFFTypography;
  --muted: #1A1A1ASecondaryBg;
  --muted-foreground: #D4FF00Accent;
  --accent: #D4FF00Accent;
  --border: #1A1A1ASecondaryBg;
}
```

## Typography
- **Display:** PP Editorial New, serif medium
- **Body:** Inter, sans-serif regular
- **Mono / caption:** JetBrains Mono, monospace uppercase (wide letter spacing)

## Layout
A single-column vertical stack housed within a rounded mobile-inspired container. The composition uses a large top-heavy hero image that fades into a solid black text area, creating a seamless transition from visual metaphor to informational body copy.

## Hero centerpiece
A high-contrast cinematic photograph of a night sky with a lone figure overlooking a rocky landscape, used as an immersive background under a serif headline.

## Motion
Elements should utilize a slow 'parallax' drift on the background starscape. Text and buttons should employ a staggered fade-in from bottom to top with a subtle scaling effect on the primary CTA.

Use Motion for React (`motion/react`). Respect `prefers-reduced-motion`.

## Hard guardrails
- Do not use rounded corners on structural blocks, only on the central container and buttons.
- Avoid complex gradients; use raw blacks and photography to create depth.
- Do not use standard sans-serifs for headlines; it must be a high-contrast serif.
- Avoid using the lime accent color for text bodies; keep it strictly for primary CTAs.

## Implementation order
1. Paste the palette tokens into `src/styles.css`.
2. Wire the display + body + mono fonts via `<link>` in `__root.tsx` head.
3. Build the hero per the layout description above.
4. Add the centerpiece (with a no-JS fallback).
5. Verify against the grow-standard skill: per-route head/meta, JSON-LD,
   updated `/llms.txt`.
