# Real Apple Liquid Glass — Technique B (Archisvaze-style Canvas Displacement Maps)

When the user asks for "real" liquid glass and references `archisvaze/liquid-glass` or `dpawlikowski/liquid-glass`, the CSS-only feTurbulence approach (Technique A in web-portfolio-build) produces noise-driven wobbly displacement — the user will reject this as "not real liquid glass." Technique B generates actual Snell's-law refraction through curved glass via Canvas displacement maps applied through per-element SVG filters.

## Technique A vs Technique B decision

- **Technique A (CSS-only feTurbulence):** `feTurbulence` generates fractal noise; `feDisplacementMap` uses that noise to warp pixels. Works without JS. The displacement is noise-driven — smooth-ish but not physically accurate. Good fallback. User may accept this for subtle effects.
- **Technique B (Canvas displacement maps):** JS generates a displacement map canvas where each pixel's R/G channels encode the displacement vector at that point. The map is generated from a refraction profile calculated via Snell's law through a convex squircle surface (IOR ~2.5, glass thickness ~60px). `feImage` references the canvas data URL at explicit pixel dimensions. `feDisplacementMap` uses the map to warp the backdrop. This is real optical refraction. **This is what the user means by "real apple liquid glass."**

**Decision rule:** If the user says "it's not liquid glass" or "real apple liquid glass" or references archisvaze, use Technique B. If the user just wants "iOS 26 style glass" without the "real" qualifier, Technique A may suffice.

## Technique B implementation

### Displacement map generation

```javascript
function generateDisplacementMap(w, h, borderRadius, bezelWidth, profile, maxDisp) {
  var canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(w, h);
  var d = img.data;
  // R channel = horizontal displacement (128 = neutral)
  // G channel = vertical displacement (128 = neutral)
  for (var i = 0; i < d.length; i += 4) {
    d[i] = 128; d[i+1] = 128; d[i+2] = 0; d[i+3] = 255;
  }

  var cx = w / 2, cy = h / 2;
  var bw = Math.max(bezelWidth, 1);
  var S = profile.length;

  // Rectangular bezel: displacement in a band near element edges
  for (var y1 = 0; y1 < h; y1++) {
    for (var x1 = 0; x1 < w; x1++) {
      var dxEdge = Math.min(x1, w - 1 - x1);
      var dyEdge = Math.min(y1, h - 1 - y1);
      var edgeDist = Math.min(dxEdge, dyEdge);
      if (edgeDist >= bw) continue; // outside bezel band

      var fromSide = edgeDist; // 0 at edge, bw at inner boundary
      var bi = Math.min(((fromSide / bw) * S) | 0, S - 1);
      var disp = profile[bi] || 0;
      if (disp === 0) continue;

      // Radial direction from element center
      var rx = x1 - cx, ry = y1 - cy;
      var dist = Math.sqrt(rx*rx + ry*ry);
      if (dist === 0) continue;
      var cos = rx / dist, sin = ry / dist;

      // Displacement vector: push backdrop inward
      var dX = (-cos * disp) / maxDisp;
      var dY = (-sin * disp) / maxDisp;
      d[(y1*w + x1)*4]     = (128 + dX*127 + 0.5) | 0;
      d[(y1*w + x1)*4 + 1] = (128 + dY*127 + 0.5) | 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}
```

**Key details:**
- **Rectangular bezel (not circular):** Displacement is applied in a band of width `bezelWidth` near ALL element edges. For each pixel, compute `edgeDist = min(x1, w-1-x1, y1, h-1-y1)`. If `edgeDist >= bezelWidth`, the pixel is too far from any edge — skip it.
- **Edge-relative indexing:** `bi = ((fromSide / bezelWidth) * S) | 0` where `fromSide = edgeDist` (0 at the very edge, bezelWidth at the inner boundary). Profile[0] is the value at the glass surface edge; profile[S-1] is the value at the inner boundary.
- **Profile calculation:** Snell's law through a convex squircle surface. `heightFn(x) = (1 - (1-x)^4)^0.25`. For each sample point x, compute surface normal from derivative, refract through IOR ~2.5, compute displacement as `ref[0] * ((y*bezelWidth + glassThickness) / ref[1])`.
- **Displacement direction:** Radial from element center, pushing the backdrop INWARD (`-cos, -sin`). This creates the convex lens effect.
- **Pixel encoding:** R channel = horizontal displacement, G channel = vertical displacement. 128 = no displacement. 128 + dX*127 = full positive displacement. 128 - dX*127 = full negative displacement.
- **maxDisp:** Maximum absolute displacement value across the profile. Used to normalize the displacement vector to the [0, 255] pixel range.

### Specular map generation

```javascript
function generateSpecularMap(w, h, borderRadius, bezelWidth, angle) {
  // Creates a canvas with specular highlights near edges
  // angle = light direction in radians (default PI/3)
  // Highlight intensity = dot(lightDir, surfaceNormal) * edgeFactor
  // edgeFactor = 1 - edgeDist/bezelWidth (stronger at edges)
}
```

### SVG filter construction

```javascript
function buildFilter(id, dispUrl, specUrl, w, h, scale, blurAmt, specSat, specOpacity) {
  var f = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  f.setAttribute('id', id);
  f.setAttribute('x', '0%'); f.setAttribute('y', '0%');
  f.setAttribute('width', '100%'); f.setAttribute('height', '100%');
  f.setAttribute('color-interpolation-filters', 'sRGB');
  f.innerHTML =
    '<feGaussianBlur in="SourceGraphic" stdDeviation="' + blurAmt + '" result="blurred_source" />' +
    '<feImage href="' + dispUrl + '" x="0" y="0" width="' + w + '" height="' + h + '" result="disp_map" />' +
    '<feDisplacementMap in="blurred_source" in2="disp_map" scale="' + scale + '" xChannelSelector="R" yChannelSelector="G" result="displaced" />' +
    '<feColorMatrix in="displaced" type="saturate" values="' + specSat + '" result="displaced_sat" />' +
    '<feImage href="' + specUrl + '" x="0" y="0" width="' + w + '" height="' + h + '" result="spec_layer" />' +
    '<feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />' +
    '<feComponentTransfer in="spec_layer" result="spec_faded"><feFuncA type="linear" slope="' + specOpacity + '" /></feComponentTransfer>' +
    '<feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />' +
    '<feBlend in="spec_faded" in2="with_sat" mode="normal" />';
  getSvgDefs().appendChild(f);
}
```

**Critical `feImage` requirement:** Must use `x="0" y="0" width="${w}" height="${h}"` — explicit pixel dimensions matching the element's offsetWidth/offsetHeight. NOT `width="100%"`. The canvas data URL is from a canvas sized to the element's dimensions.

### Applying the filter

```javascript
function processElement(el) {
  var w = el.offsetWidth, h = el.offsetHeight;
  if (w < 2 || h < 2) return;
  var computedR = parseFloat(getComputedStyle(el).borderRadius) || 16;
  var radius = Math.min(computedR, Math.min(w, h) / 2 - 2);
  if (radius < 2) return;

  var bezelW = Math.min(radius * 0.55, Math.min(w, h) / 2 - 1);
  if (bezelW < 1) bezelW = 1;

  var profile = calculateRefractionProfile(60, bezelW, SURFACE_FNS.convex_squircle, 2.5, 128);
  var maxDisp = 0;
  for (var i = 0; i < profile.length; i++) {
    var v = Math.abs(profile[i]); if (v > maxDisp) maxDisp = v;
  }
  if (maxDisp < 1) maxDisp = 1;

  var dispUrl = generateDisplacementMap(w, h, radius, bezelW, profile, maxDisp);
  var specUrl = generateSpecularMap(w, h, radius, bezelW * 2.5);
  var scale = maxDisp * 0.4;
  var blurAmt = 0.8;
  var specSat = 1.6;
  var specOpacity = 0.4;

  var id = 'lg-filter-' + el.dataset.lgId;
  var old = getSvgDefs().querySelector('#' + id);
  if (old) old.remove();
  buildFilter(id, dispUrl, specUrl, w, h, scale, blurAmt, specSat, specOpacity);

  el.style.backdropFilter = 'url(#' + id + ')';
  el.style.webkitBackdropFilter = 'url(#' + id + ')';
}
```

**Key application detail:** Use `el.style.backdropFilter` (camelCase) — this sets the CSS `backdrop-filter` property. The filter references the SVG filter ID. The `backdrop-filter` applies to the background BEHIND the element, warping it through the displacement map.

## Parameters

| Parameter | Typical value | Notes |
|-----------|--------------|-------|
| IOR | 2.5 | Index of refraction for glass |
| Glass thickness | 60px | Controls refraction magnitude |
| Bezel width | radius * 0.55 | Width of the displacement band at edges |
| Profile samples | 128 | Resolution of the refraction profile |
| Scale (feDisplacementMap) | maxDisp * 0.4 | Controls displacement intensity |
| Blur amount | 0.8 | Pre-blur before displacement (smooths noise) |
| Specular saturation | 1.6 | Saturation boost for specular highlights |
| Specular opacity | 0.4 | Opacity of specular highlight layer |

## Pitfalls

- **Coordinate transform bug:** A common error is `x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0` which sets x=0 for ALL interior pixels (any pixel where r <= x1 < w-r). This produces zero displacement everywhere. The correct transform is `x = x1 - r, y = y1 - r` for ALL pixels (the rectangular bezel approach), then skip pixels outside the bezel band.
- **Circular bezel vs rectangular bezel:** The original archisvaze approach uses a circular bezel centered at (r,r). For elements with small border-radius (like portfolio cards with 20px radius), the circular bezel only covers a tiny area near the top-left corner. Use a rectangular bezel (distance to nearest edge) instead — this covers all edges of the element.
- **feImage with width="100%":** If `feImage` uses `width="100%"` instead of explicit pixel dimensions, the displacement map won't align correctly with the element. Always use `width="${w}" height="${h}"` at `x="0" y="0"`.
- **Missing `color-interpolation-filters="sRGB":** Without this on the filter element, colors may shift in some browsers.
- **backdrop-filter vs filter:** `backdrop-filter: url(#id)` applies to the background BEHIND the element. `filter: url(#id)` applies to the element's own pixels. For liquid glass that warps the background, use `backdrop-filter`. Browser support: Chrome/Edge support `backdrop-filter: url()` fully (this is what archisvaze/liquid-glass uses); Safari supports `backdrop-filter` (blur) but `url()` references have limited support; Firefox has partial support. Always include a CSS `backdrop-filter: blur()` fallback.
- **Filter region too small:** If the filter region is too small (e.g., `-10% 120%`), the displacement map may be clipped. Use `x="0%" y="0%" width="100%" height="100%"` for per-element filters.
- **Old filters not removed:** When re-processing an element (e.g., on resize), remove the old filter element before creating the new one, or you'll have duplicate filter definitions.
- **Static CSS filters vs JS filters:** If the CSS has a static `backdrop-filter: url(#liquid-glass-filter)` on elements AND the JS sets per-element `backdrop-filter: url(#lg-filter-{id})`, the JS inline style overrides the CSS for processed elements. But elements not yet processed by JS will use the static CSS filter. Make sure the static filter (if any) is a valid fallback.
