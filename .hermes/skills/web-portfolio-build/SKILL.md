---
name: web-portfolio-build
description: "Portfolio websites with Next.js, Framer Motion, Lenis."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
---

# Web Portfolio Build

Use when the user wants to build or scaffold a personal/professional portfolio website — developer portfolio, designer folio, creative site, or any personal site meant to showcase work with polish beyond a plain resume page.

## Stack (default, works first try)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15/16 (App Router) + TypeScript | SSR, static export, ecosystem |
| Styling | Tailwind CSS v4 | Utility-first, dark mode trivial |
| Smooth scroll | Lenis (@studio-freight/lenis) | Buttery scroll — every premium portfolio uses it |
| Motion | Framer Motion | Scroll reveals, entrance animations, page transitions |
| Components | Custom (cursor, marquee, glow cards, typewriter) | Full control; drop-in libs like Aceternity UI / Magic UI as shortcut |

**Shortcut libs** (drop-in animated components, skip building from scratch):
- Aceternity UI — animated components (marquee, glow cards, parallax text)
- Magic UI — 21k+ stars, similar scope

Install: `npm install framer-motion @studio-freight/lenis gsap @gsap/react`

**Default font:** Inter (Google Fonts) — the typeface used by Brittany Chiang and most top-tier developer portfolios. Load via `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">`. Set on body with `font-feature-settings: 'liga' 1, 'calt' 1`. Fallback: `system-ui, -apple-system, sans-serif`.

**Design language options (pick one per project):**

| Option | When | Key techniques |
|---|---|---|
| Dark + glow (default in this skill) | Creative/dev portfolios wanting depth | `bg-black text-white`, gradient text, glow cards, backdrop blur |
| Liquid Glass / iOS 26 style | Clean, premium, product-feel portfolios | Real optical refraction via Canvas displacement maps (archisvaze technique) — see `references/liquid-glass-real.md`. CSS `backdrop-filter: blur()` alone reads as frosted glass, not liquid glass. |
| Light + minimal | Corporate/consulting portfolios | `#fafafa` or `#fff` background, `#1a1a1a` text, subtle borders, generous whitespace |

### Liquid Glass (two levels)

**Level 1 — CSS-only frosted glass** (good enough for most portfolios):
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
Reference: rdev/liquid-glass-react (React wrapper around the same CSS technique).

**Level 2 — Real liquid glass with SVG displacement** (actual pixel refraction, Apple iOS 26 style):
When the user explicitly asks for "real" liquid glass or references CYLTabBarController / iOS liquid glass, CSS `backdrop-filter` is not enough — it only blurs, it does not bend pixels. Use SVG `feTurbulence` + `feDisplacementMap` filters to achieve actual refraction:

```html
<!-- Place once in <head> or before </body> -->
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

Apply to elements via CSS:
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
```
The SVG displacement filter wraps the backdrop (what's behind the element), producing the classic "liquid glass bending what's behind it" look. Using `filter: url(#id)` instead bends the element's own pixels — that's a different effect and not what the user means by liquid glass.

Three predefined filter strengths: `liquid-glass` (scale=8, subtle), `liquid-glass-heavy` (scale=14, pronounced — good for hero cards), `liquid-glass-light` (scale=5, delicate — good for small UI elements). The `baseFrequency` and `scale` values control the refraction intensity; tune per element size.

**Pitfalls:**
- SVG filters apply to the element's rendered output, not its backdrop — the displacement effect bends the element's own pixels, not what's behind it. For the classic "liquid glass bending the background" look, the element's background must be semi-transparent so the backdrop shows through, and the displacement filter operates on the composite.
- `filter: url(#id)` is not supported in all browsers equally — test in target browsers. Chrome/Edge support it well; Safari has partial support; Firefox has partial support.
- Animated `seed` values create the subtle shimmer/movement characteristic of real liquid glass — without animation it looks like static distortion.
- Don't stack multiple SVG filters on the same element — pick one filter ID per element.
- The `display:none` on the SVG wrapper is critical — the SVG must exist in the DOM for the filter references to resolve, but must not render visually.
- **Don't clobber real content when adding liquid glass to an existing portfolio.** Re-skin the CSS/HTML element-by-element — preserve the original text, project names, contact info, and section structure. A full file rewrite tends to overwrite real work with template defaults, and the user has explicitly rejected full rewrites in favor of applying only the effect. See `references/refraction-architecture.md` for the full layer model, filter chain, and verification checklist.

**Commit to ONE approach, not two.** When the user provides reference repos (e.g. `dpawlikowski/liquid-glass` for pure-CSS feTurbulence, `archisvaze/liquid-glass` for JS Canvas displacement maps), pick one and execute it fully. Oscillating between a CSS-only approach and a JS-enhanced approach — applying half-measures from each — produces a broken hybrid that satisfies neither. The reference repos are complete, working systems; replicate one end-to-end rather than splicing pieces together.

**The background scene must be visually rich.** Apple-style liquid glass bends what's behind it. If the backdrop is flat `#000` or `#0a0a0a`, there is nothing to refract and the glass reads as frosted blur. The bg-scene needs colored shapes at z-index below the glass — gradient orbs, colored blobs, patterns, or image layers. A working pattern: 3–4 large `radial-gradient` blobs positioned off-canvas with `drift` keyframe animations, plus a subtle `repeating-linear-gradient` micro-grid overlay. See the bg-orb pattern in the session notes.

**The `feImage` pixel-dimension bug.** When building per-element SVG filters from Canvas displacement maps (archisvaze-style), `feImage` must use explicit pixel dimensions: `width="${w}" height="${h}"` at `x="0" y="0"`. Using `width="100%"` produces a misaligned filter that either does nothing or displaces by the wrong amount. The canvas data URL is from a canvas sized to the element's `offsetWidth × offsetHeight` — the `feImage` must match those exact dimensions.

**The coordinate transform bug (recurring).** In displacement map generation, a common loop body `x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0; y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0` sets `x=0, y=0` for ALL interior pixels (any pixel where `r <= x1 < w-r` and `r <= y1 < h-r`). This produces a displacement map of all neutral 128 values — zero displacement everywhere, invisible effect. The correct transform is `x = x1 - r, y = y1 - r` for every pixel, then skip pixels outside the bezel band with `if (dSq > r1Sq || dSq < rBSq) continue`. See `references/liquid-glass-real.md` for the full corrected implementation.

**Skill section icons:** Use inline SVG icons (stroke-based, consistent stroke width) instead of emoji. Emoji renders inconsistently across OSes and looks unprofessional on a portfolio. Each icon in a square/tinted container.

### Design Research (do before styling)

Before writing any CSS, check 3–5 top portfolio sites for current design trends. This session's research targets:

- **Brittany Chiang** (`brittanychiang.com`) — Inter font, clean nav, minimal layout, the baseline for modern dev portfolios
- **Adam Hartwig** (`adamhartwig.co.uk`) — colorful, animated, playful
- **Lars Olson** (`lars-olson.com`) — retro 90s future vibes
- **Brice Clain** (`briceclain.com`) — animated, personal walkthrough
- **Apple iOS 26 / CYLTabBarController** (`github.com/ChenYilong/CYLTabBarController`) — the canonical "real" liquid glass reference (iOS tab bar with actual refraction, not just blur)
- **rdev/liquid-glass-react** — React component wrapper around CSS liquid glass technique

Extract: font choice, color palette, card treatment, nav style, motion posture. Do NOT copy proprietary layouts or branded surfaces — extract general principles (density, accent strategy, type hierarchy) and transform them into an original design.

### Procedure

### 1. Scaffold

```bash
npx create-next-app@latest <name> --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd <name>
npm install framer-motion @studio-freight/lenis gsap @gsap/react
```

### 2. Lenis provider (MUST be a Client Component)

Create `src/components/LenisProvider.tsx`:

```tsx
"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import Lenis from "@studio-freight/lenis"

const LenisContext = createContext<Lenis | null>(null)
export function useLenisContext() {
  return useContext(LenisContext)
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => { lenis.destroy() }
  }, [])

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  )
}
```

**Lenis v1 API notes:**
- `new Lenis({ ... })` — default import (`import Lenis from ...`)
- `lenis.raf(time)` — NOT `scrollRaf` (that's v2)
- `lenis.on("scroll", fn)` / `lenis.off("scroll", fn)` — event listeners
- `lenis.destroy()` — cleanup
- The React hooks (`useLenis`, `useScroll`) are ONLY in v2's `@studio-freight/lenis/react` subpackage — v1 has no React integration

### 3. Root layout wraps with LenisProvider

```tsx
// src/app/layout.tsx — can be Server Component
import { LenisProvider } from "@/components/LenisProvider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="...">
      <body className="bg-black text-white">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
```

### 4. Pages are Client Components if they use hooks

Pages that call `useLenisContext()` or Framer Motion hooks need `"use client"` at the top. Pages that only render static JSX can stay Server Components.

### 5. Component inventory (build or drop in)

| Component | Purpose | Build vs drop |
|---|---|---|
| Custom cursor | SVG ring + dot following mouse, hides on interactive elements | Build — ~60 lines |
| Magnetic cursor | Wrapper that magnetically offsets a child element toward the cursor position — apply to buttons/CTAs for snap effect | Build — ~50 lines |
| Marquee | Scrolling text strip (skills, tags) | Build — CSS animation, ~30 lines |
| GlowCard | Card with mouse-position radial glow on hover | Build — Framer Motion + CSS, ~50 lines |
| Typewriter | Blinking cursor, type/deletes cycled words | Build — useEffect timer, ~45 lines |
| ScrollReveal | Fade/slide on viewport entry | Use Framer Motion `whileInView` inline — no separate component needed |
| Scroll progress bar | Thin gradient bar at top that fills as user scrolls | Build — ~30 lines |
| Command palette | Cmd+K modal to search/navigate sections | Build — Framer Motion AnimatePresence, ~150 lines |
| Hero shader | Canvas background effect behind hero text (scanlines, static, glitch) | Build — canvas 2D loop, ~80 lines |
| SplitTextReveal | Text that reveals character-by-character on mount | Build — useEffect character sequencer, ~40 lines |
| Device tier hook | Returns low/mid/high based on deviceMemory, hardwareConcurrency, touch, dpr, width | Build — ~35 lines |

See `references/component-recipes.md` for full code of all custom components.

### 6. Dark theme default

Set `bg-black text-white` on body, use `text-white/50` for secondary text, `bg-gradient-to-r from-X to-Y bg-clip-text text-transparent` for gradient headlines.

### 7. Deploy to GitHub Pages (repo-root artifact pattern)

Some GitHub Pages setups serve from the repo root (`/`), not from a `docs/` folder or `gh-pages` branch. The deploy workflow uploads `path: '.'` as the artifact — meaning the **repo root's `index.html` is what serves**. When your portfolio lives in a subdirectory (e.g. `thewebsite/`) and you build a static export there, you must copy the build output to the repo root before pushing, or Pages serves the wrong site.

Workflow:
```bash
cd thewebsite
npm run build                          # produces out/ with static export
cd ..
cp thewebsite/out/index.html .         # copy to repo root
cp -r thewebsite/out/_next .           # copy JS/CSS chunks
cp thewebsite/out/*.html .             # 404.html etc.
cp thewebsite/out/favicon.ico .        # assets
# clean up build artifacts not meant for commit
rm -rf thewebsite/out .next
git add index.html _next/ 404.html favicon.ico
git commit -m "Update portfolio build"
git push origin main                   # Pages rebuilds from root
```

Verify after push:
- Wait for the Pages deployment to complete (check Actions tab or `gh api repos/<owner>/<repo>/actions/runs`)
- `curl https://<username>.github.io/<repo>/` and check the `<title>` and hero text match the intended portfolio — not the template's default
- If content is wrong, the build output was copied from the wrong place or the old content lived outside the build scope — restore from git and re-copy correctly

### 8. Verify

- `npm run build` — must compile clean
- Start dev server, open browser, verify: H1 renders, nav links work, marquee scrolls, cursor follows mouse, cards glow on hover, scroll is smooth, command palette opens with ⌘K, scroll progress bar fills
- Screenshot via browser tool and vision-check the design

### 9. Scroll architecture (single source of truth)

```ts
// src/lib/scroll-state.ts
export const scrollState = {
  progress: 0,
  currentSection: "",
  setProgress: (v: number) => { scrollState.progress = v },
  setCurrentSection: (v: string) => { scrollState.currentSection = v },
}
```

Register sections via ref callback, read `scrollState.currentSection` for nav highlighting, read `scrollState.progress` for the progress bar. This is the pattern from imfemambocus/portfolio and Creative-Folio — multiple independent scroll listeners drift apart and break scroll-driven animations.

### 9. Device-aware rendering

For portfolios with heavy WebGL/canvas effects, add a device tier hook that detects capability and lets components adjust render cost without removing effects:

```ts
// src/lib/animations.ts  (or similar)
export function useDeviceTier() {
  const [tier, setTier] = useState<"low" | "mid" | "high">("high")
  useEffect(() => {
    if (typeof window === "undefined") return
    const mem = (navigator as any).deviceMemory ?? 8
    const cores = navigator.hardwareConcurrency ?? 8
    const touch = "ontouchstart" in window
    const dpr = window.devicePixelRatio ?? 1
    if (touch || mem <= 4 || cores <= 4 || dpr <= 1 || window.innerWidth < 768) setTier("low")
    else if (mem <= 8 || cores <= 8 || dpr <= 1.5) setTier("mid")
  }, [])
  return tier
}
```

Components check `tier` before deciding render cost: high = uncapped, mid = reduced FPS, low = disable heavy WebGL, use CSS fallback. This is from Creative-Folio's deviceTier.ts + frameGate.ts — it's why immersive sites work on phones without removing a single effect.

## Pitfalls

**Lenis version mismatch is the #1 time sink.** The npm package `@studio-freight/lenis` v1 is the core library only — no React hooks. v2 added `@studio-freight/lenis/react` with `useLenis`/`useScroll`. If you install v1 and try to import from `@studio-freight/lenis/react`, you get module-not-found. If you import `Lenis` as a named import from v1, TypeScript complains. Always: default-import `Lenis` from `@studio-freight/lenis`, create your own provider, and share via context. Do NOT call React hooks (useLenis, etc.) at module scope — they must be inside a function body.

**Do not call `useLenis()` or any hook at module scope.** Hooks only work inside component function bodies. A file that does `const lenis = useLenis()` at the top level (outside a function) is a server-component file that will fail or behave incorrectly.

**Desktop cursor SVG must be pointer-events-none and z-50.** Without `pointer-events-none`, the cursor layer intercepts mouse events and breaks interaction. Without high z-index, it renders under page content.

**Mobile: disable custom cursor.** Use `window.matchMedia("(max-width: 768px)").matches` to detect and return null from the cursor component. Track this state with `useEffect` + `useState`, not at module scope.

**GlowCard mouse tracking:** attach `mousemove` listener to the DOM element via `ref.current`, not to `window`. Reading `e.clientX - rect.left` gives position relative to the card.

## Pitfalls (content & deployment)

**When replacing a live portfolio's root `index.html` with a build output, verify the output contains the actual portfolio content before pushing.** A static export build may render the new site's default/template content (placeholder name, generic bio, sample projects) instead of the real portfolio work. Compare the build output's `<title>`, hero text, project names, and contact info against what the live site currently shows — if they differ, the build picked up the wrong entry point or the old content lived outside the build scope. Push only after the build output matches the intended content. This cost a real rollback in Sep 2026: the root `index.html` was overwritten with a generic template's output and the user's actual portfolio content was replaced on live until restored from git history.

**Porting a new design/animations system onto an existing static HTML portfolio: keep the original HTML content structure, rewrite the CSS/JS to the new design language — do not build a fresh Next.js site from the template and expect it to carry the old content.** The workflow: read the existing `index.html` in full (all sections, all project cards, all text), build/identify the new design system's CSS variables and animation helpers, then re-skin the existing HTML element-by-element (nav, hero, cards, sections) rather than replacing the file wholesale. This preserves real work (project descriptions, client names, contact info) that a template's default content would overwrite.

## User preferences (always-on)

- Build working code first, explain later. No theoretical preamble.
- Components should be copy-pasteable — full file content, not snippets that need assembly.
- Prefer building custom components over adding heavy UI libraries unless the user explicitly wants a shortcut.
- Verify with a real browser screenshot + vision check, not just a successful build.
- When a build fails, fix the actual error — don't add workarounds that hide it.

## References

- `references/component-recipes.md` — full code for all custom components (cursor, magnetic cursor, marquee, glow card, typewriter, scroll progress bar, command palette, hero shader, split text reveal, device tier hook)
