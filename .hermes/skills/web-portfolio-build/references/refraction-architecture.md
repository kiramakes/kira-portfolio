# Liquid Glass Refraction Architecture

When to use: The user wants Apple/iOS 26-style liquid glass on a portfolio or web page — real background warping/refraction, not just frosted blur. Covers the z-order layer model, SVG filter chain, background-scene requirement, verification checklist, and the most common mistakes (wrong z-index on edges, missing keyframes, flat background killing the effect, double-displacement from CSS + JS stacking).

## Why a background scene is required

Apple-style liquid glass bends and distorts what sits behind it. On a flat `#000` or `#0a0a0a` background there is nothing to refract — the glass reads as flat frost. The bg-scene must contain visually distinct shapes (gradient orbs, colored blobs, patterns, image layers) at `z-index` below the glass so the displacement filter has content to warp. Tuning the SVG filter to maximum and staring at a flat background produces near-zero visible effect.

## Layer model (dpawlikowski / archisvaze pattern)

The correct z-order for a liquid glass element that both displaces its backdrop AND shows edge highlights:

```
 z: -2  .liquid-glass__refraction  — duplicated scene background, SVG-displaced
 z: -1  .liquid-glass::before       — white tint fill, animated sheen
 z:  0  .liquid-glass (main)        — surface gradient + border + box-shadow
 z:  3  .liquid-glass::after        — chromatic edge highlights, mix-blend: screen
```

The `::after` chromatic edges go ABOVE content (z:3) with `mix-blend-mode: screen` so they brighten without blocking. The `::before` tint goes BELOW content (z:-1). The backdrop displacement itself runs through the SVG `url(#filter)` applied to `backdrop-filter` on the main element — this is what warps the bg-scene behind the glass.

## SVG filter chain

```
feTurbulence  →  feDisplacementMap  →  feGaussianBlur  →  feColorMatrix  →  feComposite
   (noise)         (warp pixels)         (smooth)          (identity)         (clip to bounds)
```

- `feTurbulence`: generates the noise field. `type="fractalNoise"`, `numOctaves=3` minimum. Animate `seed` (and optionally `baseFrequency`) for the live shimmer.
- `feDisplacementMap`: warps pixels using the noise. `scale` controls intensity — 5 subtle, 20–45 moderate, 55+ heavy. `xChannelSelector`/`yChannelSelector` pick which noise channel drives each axis.
- `feGaussianBlur`: softens the displaced output so it reads as liquid, not jagged noise.
- `feColorMatrix`: identity matrix pass-through.
- `feComposite operator="in"`: clips displaced output to the original element's bounds so it doesn't bleed outside.
- `color-interpolation-filters="sRGB"` on the `<filter>` element — without it colors shift in some browsers.

## Three filter strengths (preset scales)

| Filter ID | scale | baseFrequency | Use |
|---|---|---|---|
| `liquid-glass` | 45 | 0.008 | Default cards, panels |
| `liquid-glass-heavy` | 55 | 0.012 | Hero/featured large panels |
| `liquid-glass-light` | 25 | 0.015 | Buttons, small UI elements |

Tune `scale` up when the element is large and the background is busy; tune down when the element is small or the background is sparse.

## The `::after` chromatic edge mistake

**Wrong:** putting chromatic edge `box-shadow` inset values on the main element at the default z-index — they will sit between the tint and the content and partially block text.

**Right:** move chromatic edges to a `::after` pseudo-element at `z-index: 3` (or higher) with `mix-blend-mode: screen`. The screen blend brightens without occluding.

## The `::before` tint opacity

The white tint layer controls how "frosted" vs "clear" the glass reads. Apple's liquid glass is relatively clear (you can see the refracted background clearly) — use `rgba(255,255,255,0.5–0.55)` as the default tint opacity. Going above 0.7 reads as milky frost, not liquid glass.

## Animated keyframes that must exist

- `@keyframes glass-sheen` — drives the `::before` tint's rotating sheen angle via a custom property (`--lg-sheen-angle`). Must be defined or the animation silently fails.
- `@keyframes glass-edge-shimmer` — drives `::after` chromatic edge opacity oscillation. Must be defined.

If either keyframe is missing, the CSS animation property references a non-existent keyframe and does nothing — no error, no warning.

## Client-side enhancement: real displacement maps

CSS `feTurbulence` produces noise-driven displacement — it looks like liquid but is not physically accurate refraction. For actual optical-quality refraction (like archisvaze's demo), generate displacement + specular maps per element via Canvas using Snell's law through a curved glass surface, then apply them through per-element SVG filters that reference the canvas data URLs as `feImage` inputs.

This is a JS enhancement, not a CSS replacement. The CSS feTurbulence approach is the fallback and works without JS.

## Verification checklist (run against the live site after push)

```bash
# 1. Style tag integrity
curl -s https://<site>/ | python3 -c "
import sys
html = sys.stdin.read()
css = html[html.find('<style>')+7:html.find('</style>')]
print(f'Style: {len(css)} chars, {len(css.strip().split(chr(125)))} rules')
print('Has @keyframes glass-sheen:', '@keyframes glass-sheen' in css)
print('Has @keyframes glass-edge-shimmer:', '@keyframes glass-edge-shimmer' in css)
print('Has @keyframes bg-orb-drift:', 'bg-orb' in css and '@keyframes' in css)
print('Has @supports backdrop-filter rule:', '@supports' in css and 'backdrop-filter' in css)
"

# 2. SVG filters present and correct
curl -s https://<site>/ | grep -c 'feTurbulence'
curl -s https://<site>/ | grep -c 'feDisplacementMap'
# Check that filters use backdrop-filter (not filter:) on the main element
curl -s https://<site>/ | grep -oE 'backdrop-filter:[^;]*url\(#[^)]*\)' | head -5
curl -s https://<site>/ | grep -oE 'filter:[^;]*url\(#[^)]*\)' | head -5  # if this returns results on main elements, it's wrong — should be backdrop-filter

# 3. Element coverage
curl -s https://<site>/ | grep -oE 'class="[^"]*liquid-glass[^"]*"' | sort | uniq -c | sort -rn

# 4. Background scene
curl -s https://<site>/ | grep -c 'bg-orb'
curl -s https://<site>/ | grep -c 'bg-scene'

# 5. JS enhancement
curl -sI https://<site>/liquid-glass-real.js | head -1
curl -s https://<site>/ | grep -c 'liquid-glass-real.js'

# 6. Content integrity (don't let the glass rewrite clobber real content)
curl -s https://<site>/ | grep -c 'faroukrabiu123@gmail.com'
curl -s https://<site>/ | grep -c '26 service'
curl -s https://<site>/ | grep -c '30\+ projects'
```

All of #1–#5 must be non-zero. #6 confirms the glass work did not clobber the real portfolio content.

## Pitfalls

- **Flat dark background = invisible refraction.** The bg-scene must have colored shapes at z-index below the glass. If the glass looks like plain frosted blur with no visible warping, the background is too plain.
- **`::after` chromatic edges at wrong z-index.** If edge highlights block text, they're at z-index below content. Move them to z:3+ with `mix-blend: screen`.
- **Missing keyframe definitions.** `@keyframes glass-sheen` and `@keyframes glass-edge-shimmer` must exist in the CSS. An animation that references a missing keyframe silently does nothing.
- **`feColorMatrix` identity matrix.** The values `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0` are an identity matrix — any deviation changes colors. If the displaced output looks washed out or shifted, check this matrix.
- **`feComposite operator="in"` clips to SourceGraphic bounds.** Without it the displacement bleeds outside the element's border-radius. With it the warped output respects the glass shape.
- **`filter: url(#id)` + `backdrop-filter: url(#id)` double-displacement.** If both the main element AND a `::after` pseudo-element apply the same SVG filter, the effect stacks and can look over-warped. The pattern: SVG filter on `backdrop-filter` for the main element, chromatic edges via `::after` box-shadow + `mix-blend: screen` (not a second filter).
- **Client-side JS displacement maps vs CSS feTurbulence.** If both apply, the effect may double-warp. The JS should set `style.backdropFilter` per element, overriding the CSS. If the JS is absent or fails, the CSS feTurbulence fallback still works.
- **Don't clobber real content.** When applying liquid glass on top of an existing portfolio, re-skin the CSS/HTML element-by-element — preserve the original text, project names, contact info, and section structure. A full file rewrite tends to overwrite real work with template defaults.
