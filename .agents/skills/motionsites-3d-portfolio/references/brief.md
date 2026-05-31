# 3D Portfolio — Long-form Brief

## Sensory metaphor
A single sculpture on a black plinth, lit from one corner of the room.
The visitor walks around it slowly. The label on the wall is the only text.

## Why these choices

**Near-black background, not pure black.** Pure `#000` clips on OLED and
flattens the 3D centerpiece. `oklch(0.14 ...)` keeps depth in the shadows.

**Amber accent, not blue or green.** Most 3D portfolios reach for cool
cyan ("tech"). Warm amber reads as gallery lighting, not a UI primary.
It also pairs with the serif italic — same century, same mood.

**Serif italic display.** Sans-serif portfolios are saturated. Italic
serif at 160px+ signals craft and confidence without needing animation
to do the work.

**One slow continuous motion + one discrete reveal per section.**
More motion = portfolio looks like a demo reel. Less motion = looks dead.
The 3D object's rotation is the heartbeat; everything else holds still.

## Anti-patterns (do not ship)

- Gradient text on the headline
- Glassmorphism cards over the 3D scene
- Particle backgrounds
- Cursor-tracking lights that follow the mouse aggressively
- Auto-playing video as background
- Multiple accent colors ("amber + cyan + pink")
- Scroll-jacking / horizontal scroll for sections

## Section rhythm

1. Hero (100vh) — name, role, 3D object
2. Selected Work (auto height, 2-col asymmetric grid, ~4 tiles)
3. About (max-width 60ch, single column, serif body)
4. Contact (1 sentence + 1 email link, no form)

Total page weight target: <250KB without the 3D scene, <800KB with it.
