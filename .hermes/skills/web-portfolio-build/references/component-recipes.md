# Component Recipes — Full Code

Single-file, copy-pasteable implementations of all custom portfolio components. Each recipe is standalone — copy into your project and wire it in.

---

## Liquid Glass (CSS-only)

**File:** any `.css` file or `<style>` block — no component needed, it's pure CSS

```css
.glass {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.04);
}
```

**Pitfalls:**
- CSS-only glass does frosted blur + specular highlight — it does NOT bend pixels behind the glass
- When the user explicitly asks for "real" liquid glass or references CYLTabBarController / iOS liquid glass, use the SVG displacement filter recipe below instead
- Always include `-webkit-backdrop-filter` for Safari support
- The element needs a semi-transparent background for the backdrop blur to be visible

---

## Real Liquid Glass (SVG Displacement Filters)

**File:** inline `<svg>` in HTML + CSS `filter: url(#id)` — no component needed

Place the SVG filter definition once in the document (in `<head>` or before `</body>`):

```html
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <defs>
    <filter id="liquid-glass" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015" numOctaves="3" seed="2" result="noise">
        <animate attributeName="seed" from="2" to="8" dur="8s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred"/>
      <feColorMatrix in="blurred" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="clean"/>
      <feComposite in="clean" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="liquid-glass-heavy" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="4" seed="5" result="noise">
        <animate attributeName="seed" from="5" to="12" dur="6s" repeatCount="indefinite"/>
        <animate attributeName="baseFrequency" values="0.02 0.02;0.025 0.018;0.02 0.02" dur="10s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="0.6" result="blurred"/>
      <feColorMatrix in="blurred" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="clean"/>
      <feComposite in="clean" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="liquid-glass-light" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.025 0.025" numOctaves="2" seed="3" result="noise">
        <animate attributeName="seed" from="3" to="6" dur="5s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="B" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="0.3"/>
    </filter>
  </defs>
</svg>
```

CSS usage:

```css
.glass-real {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(18px) saturate(200%) url(#liquid-glass);
  -webkit-backdrop-filter: blur(18px) saturate(200%) url(#liquid-glass);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2),
    0 4px 24px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}
.glass-real::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.85) 80%, transparent);
  pointer-events: none;
}
.glass-real::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 60%);
  pointer-events: none;
  opacity: 0.6;
}
```

The SVG displacement filter goes on `backdrop-filter`, NOT on `filter`. `backdrop-filter: url(#id)` warps the background behind the element — that's the classic liquid glass look. `filter: url(#id)` bends the element's own pixels instead, which is not what the user means by liquid glass.

**Pitfalls:**
- SVG filter wrapper MUST have `style="display:none"` — the SVG must exist in the DOM for filter references to resolve, but the SVG itself (not the filtered elements) must not render visually. Note: the `<filter>` elements inside `<defs>` are never rendered regardless; `display:none` applies to the outer `<svg>` wrapper only.
- `backdrop-filter: url(#id)` is supported in Chrome/Edge; Safari supports `backdrop-filter` (blur) but `url()` references have limited support; Firefox has partial support. Always include a CSS `backdrop-filter: blur()` fallback for browsers that don't support the `url()` form.
- Animated `seed` values create the shimmer effect — without animation it looks like static distortion
- Don't stack multiple SVG filters on the same element — pick one filter ID per element
- `feDisplacementMap` scale values: 5=subtle, 8=medium, 14=heavy — tune per element size
- `feColorMatrix` with identity matrix + `feComposite operator="in"` keeps the displaced output inside the original element bounds

---

## Custom Cursor