// Apple Liquid Glass — real refraction via Canvas displacement + specular maps (Snell's law through curved glass)
// Generates displacement + specular maps for the ENTIRE glass surface, applies via per-element SVG filters

(function () {
    'use strict';

    const SURFACE_FNS = {
        convex_squircle: (x) => Math.pow(1 - Math.pow(1 - Math.min(x, 1), 4), 0.25),
    };

    function calculateRefractionProfile(glassThickness, bezelWidth, heightFn, ior, samples) {
        samples = samples || 128;
        const eta = 1 / ior;
        function refract(nx, ny) {
            const dot = ny;
            const k = 1 - eta * eta * (1 - dot * dot);
            if (k < 0) return null;
            const sq = Math.sqrt(k);
            return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
        }
        const profile = new Float64Array(samples);
        for (let i = 0; i < samples; i++) {
            const x = i / (samples - 1);
            const y = heightFn(x);
            const dx = x < 1 ? 0.0001 : -0.0001;
            const y2 = heightFn(x + dx);
            const deriv = (y2 - y) / dx;
            const mag = Math.sqrt(deriv * deriv + 1);
            const ref = refract(-deriv / mag, -1 / mag);
            if (!ref) { profile[i] = 0; continue; }
            profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1]);
        }
        return profile;
    }

    function generateDisplacementMap(w, h, radius, profile) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        const img = ctx.createImageData(w, h);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) { d[i] = 128; d[i+1] = 128; d[i+2] = 0; d[i+3] = 255; }
        const r = radius;
        const r1Sq = (r + 1) * (r + 1);
        const S = profile.length;
        const maxDisp = Math.max.apply(Math, profile);
        for (let y1 = 0; y1 < h; y1++) {
            for (let x1 = 0; x1 < w; x1++) {
                const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - (w - r * 2) : 0;
                const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - (h - r * 2) : 0;
                const dSq = x * x + y * y;
                if (dSq > r1Sq) continue; // outside glass — no displacement
                const dist = Math.sqrt(dSq);
                const norm = dist / r; // 0=center, 1=edge
                let cos, sin;
                if (dist < 0.5) { cos = 1; sin = 0; }
                else { cos = x / dist; sin = y / dist; }
                const bi = Math.min((norm * (S - 1)) | 0, S - 1);
                const disp = profile[bi] || 0;
                // Normalize to [0,1] and encode as pixel offset from 128
                const normDisp = maxDisp > 0 ? disp / maxDisp : 0;
                const rVal = 128 + normDisp * 127 * cos;
                const gVal = 128 + normDisp * 127 * sin;
                const idx = (y1 * w + x1) * 4;
                d[idx] = Math.max(1, Math.min(254, rVal));
                d[idx+1] = Math.max(1, Math.min(254, gVal));
            }
        }
        ctx.putImageData(img, 0, 0);
        return c.toDataURL();
    }

    function generateSpecularMap(w, h, radius, lightAngle) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        const img = ctx.createImageData(w, h);
        const d = img.data;
        d.fill(0);
        const r = radius;
        const r1Sq = (r + 1) * (r + 1);
        const lr = lightAngle || Math.PI / 3;
        const lx = Math.cos(lr), ly = Math.sin(lr);
        for (let y1 = 0; y1 < h; y1++) {
            for (let x1 = 0; x1 < w; x1++) {
                const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - (w - r * 2) : 0;
                const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - (h - r * 2) : 0;
                const dSq = x * x + y * y;
                if (dSq > r1Sq) continue;
                const dist = Math.sqrt(dSq);
                const norm = dist / r;
                let cos, sin;
                if (dist < 0.5) { cos = 1; sin = 0; }
                else { cos = x / dist; sin = y / dist; }
                // Surface slope from convex_squircle, capped
                const xn = Math.min(norm, 0.999);
                const inner = 1 - Math.pow(1 - xn, 4);
                const slope = xn > 0 && inner > 0 ? (4 * Math.pow(inner, 0.75) * Math.pow(1 - xn, 3)) / Math.sqrt(1 - Math.pow(inner, 0.5)) : 0;
                const cappedSlope = Math.min(slope, 12);
                const mag = Math.sqrt(cappedSlope * cappedSlope + 1);
                const nx = -cappedSlope / mag, ny = 1 / mag;
                const dot = nx * lx + ny * ly;
                const spec = Math.max(0, dot);
                const edge = 0.25 + 0.75 * (1 - norm); // brighter at edges
                const intensity = spec * edge;
                const idx = (y1 * w + x1) * 4;
                const val = intensity * 255;
                d[idx] = val; d[idx+1] = val; d[idx+2] = val;
                d[idx+3] = intensity * 190;
            }
        }
        ctx.putImageData(img, 0, 0);
        return c.toDataURL();
    }

    const SVG_NS = 'http://www.w3.org/2000/svg';
    let svgDefs = null;
    function getSvgDefs() {
        if (svgDefs) return svgDefs;
        svgDefs = document.querySelector('svg.svg-filters defs') ||
            (function () {
                const s = document.createElementNS(SVG_NS, 'svg');
                s.setAttribute('class', 'svg-filters');
                s.setAttribute('style', 'position:absolute;width:0;height:0');
                const d = document.createElementNS(SVG_NS, 'defs');
                s.appendChild(d); document.head.appendChild(s);
                return d;
            })();
        return svgDefs;
    }

    function buildFilter(id, dispUrl, specUrl) {
        const f = document.createElementNS(SVG_NS, 'filter');
        f.setAttribute('id', id);
        f.setAttribute('x', '-10%'); f.setAttribute('y', '-10%');
        f.setAttribute('width', '120%'); f.setAttribute('height', '120%');
        f.innerHTML =
            '<feGaussianBlur in="SourceGraphic" stdDeviation="0.7" result="blur"/>' +
            '<feImage href="' + dispUrl + '" x="0" y="0" width="100%" height="100%" result="dmap"/>' +
            '<feDisplacementMap in="blur" in2="dmap" scale="80" xChannelSelector="R" yChannelSelector="G" result="disp"/>' +
            '<feColorMatrix in="disp" type="saturate" values="1.5" result="sat"/>' +
            '<feImage href="' + specUrl + '" x="0" y="0" width="100%" height="100%" result="spec"/>' +
            '<feComposite in="sat" in2="spec" operator="in" result="specMask"/>' +
            '<feComponentTransfer in="spec" result="specFade"><feFuncA type="linear" slope="0.65"/></feComponentTransfer>' +
            '<feBlend in="specMask" in2="disp" mode="screen" result="withSpec"/>' +
            '<feBlend in="withSpec" in2="sat" mode="normal"/>';
        getSvgDefs().appendChild(f);
    }

    function processElement(el) {
        try {
            const w = el.offsetWidth, h = el.offsetHeight;
            if (w < 2 || h < 2) return;
            const computedR = parseFloat(getComputedStyle(el).borderRadius) || 20;
            const radius = Math.min(computedR, Math.min(w, h) / 2 - 2);
            if (radius < 2) return;
            const glassThick = 60, bezelW = Math.min(radius * 0.55, 50), ior = 2.5;
            const profile = calculateRefractionProfile(glassThick, bezelW, SURFACE_FNS.convex_squircle, ior, 128);
            const dispUrl = generateDisplacementMap(w, h, radius, profile);
            const specUrl = generateSpecularMap(w, h, radius, Math.PI / 3);
            const id = 'lg-filter-' + el.dataset.lgId;
            const old = getSvgDefs().querySelector('#' + id);
            if (old) old.remove();
            buildFilter(id, dispUrl, specUrl);
            el.style.backdropFilter = 'url(#' + id + ') blur(1.5px) saturate(140%)';
            el.style.webkitBackdropFilter = 'url(#' + id + ') blur(1.5px) saturate(140%)';
        } catch (e) { if (window.__lgDebug) console.warn(e); }
    }

    let idC = 0;
    document.querySelectorAll('.liquid-glass, .lg-btn, .service-item, .project-card, .stat-card, .work-item, .contact-section, .skill-item')
        .forEach(function (el) { if (!el.dataset.lgId) el.dataset.lgId = ++idC; });

    let processed = {};
    function processAll() {
        var els = document.querySelectorAll('.liquid-glass, .lg-btn, .service-item, .project-card, .stat-card, .work-item, .contact-section, .skill-item');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (!el.dataset.lgId) el.dataset.lgId = ++idC;
            var key = el.dataset.lgId;
            var cur = el.offsetWidth * el.offsetHeight;
            var prev = el.dataset.lgSize ? parseInt(el.dataset.lgSize, 10) : 0;
            el.dataset.lgSize = cur;
            if (prev > 0 && prev === cur && el.offsetWidth > 0) continue;
            processed[key] = true;
            processElement(el);
        }
    }

    if (document.readyState === 'complete') setTimeout(processAll, 50);
    else window.addEventListener('load', function () { setTimeout(processAll, 50); });

    var rT;
    window.addEventListener('resize', function () {
        clearTimeout(rT);
        rT = setTimeout(function () { processed = {}; processAll(); }, 300);
    });
})();
