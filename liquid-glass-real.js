// Apple Liquid Glass — real refraction via Canvas displacement maps (Snell's law through curved glass)
// Inspired by archisvaze/liquid-glass — generates displacement + specular maps per element

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
            const x = i / samples;
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

    function generateDisplacementMap(w, h, radius, bezelWidth, profile, maxDisp) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        const img = ctx.createImageData(w, h);
        const d = img.data;
        // Initialize with neutral 128 (no displacement)
        for (let i = 0; i < d.length; i += 4) {
            d[i] = 128; d[i+1] = 128; d[i+2] = 0; d[i+3] = 255;
        }
        const r = radius, rSq = r * r, r1Sq = (r + 1) ** 2;
        const rBSq = Math.max(r - bezelWidth, 0) ** 2;
        const wB = w - r * 2, hB = h - r * 2, S = profile.length;
        for (let y1 = 0; y1 < h; y1++) {
            for (let x1 = 0; x1 < w; x1++) {
                const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
                const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
                const dSq = x * x + y * y;
                if (dSq > r1Sq || dSq < rBSq) continue;
                const dist = Math.sqrt(dSq);
                const fromSide = r - dist;
                const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
                if (op <= 0 || dist === 0) continue;
                const cos = x / dist, sin = y / dist;
                const bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1);
                const disp = profile[bi] || 0;
                const dX = (-cos * disp) / maxDisp, dY = (-sin * disp) / maxDisp;
                const idx = (y1 * w + x1) * 4;
                d[idx] = (128 + dX * 127 * op + 0.5) | 0;
                d[idx+1] = (128 + dY * 127 * op + 0.5) | 0;
            }
        }
        ctx.putImageData(img, 0, 0);
        return c.toDataURL();
    }

    function generateSpecularMap(w, h, radius, bezelWidth, angle) {
        angle = angle != null ? angle : Math.PI / 3;
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        const img = ctx.createImageData(w, h);
        const d = img.data;
        d.fill(0);
        const r = radius, rSq = r * r, r1Sq = (r + 1) ** 2;
        const rBSq = Math.max(r - bezelWidth, 0) ** 2;
        const wB = w - r * 2, hB = h - r * 2;
        const sv = [Math.cos(angle), Math.sin(angle)];
        for (let y1 = 0; y1 < h; y1++) {
            for (let x1 = 0; x1 < w; x1++) {
                const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
                const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
                const dSq = x * x + y * y;
                if (dSq > r1Sq || dSq < rBSq) continue;
                const dist = Math.sqrt(dSq);
                const fromSide = r - dist;
                const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
                if (op <= 0 || dist === 0) continue;
                const cos = x / dist, sin = -y / dist;
                const dot = Math.abs(cos * sv[0] + sin * sv[1]);
                const edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) ** 2));
                const coeff = dot * edge;
                const col = (255 * coeff) | 0;
                const alpha = (col * coeff * op) | 0;
                const idx = (y1 * w + x1) * 4;
                d[idx] = col; d[idx+1] = col; d[idx+2] = col; d[idx+3] = alpha;
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
                  (() => {
                      const svg = document.createElementNS(SVG_NS, 'svg');
                      svg.setAttribute('class', 'svg-filters');
                      svg.setAttribute('style', 'position:absolute;width:0;height:0');
                      const defs = document.createElementNS(SVG_NS, 'defs');
                      svg.appendChild(defs);
                      document.head.appendChild(svg);
                      return defs;
                  })();
        return svgDefs;
    }

    function buildFilter(id, dispUrl, specUrl, blurAmt, specSat, specOpacity, scale) {
        const filter = document.createElementNS(SVG_NS, 'filter');
        filter.setAttribute('id', id);
        filter.setAttribute('x', '0%'); filter.setAttribute('y', '0%');
        filter.setAttribute('width', '100%'); filter.setAttribute('height', '100%');
        filter.innerHTML = `
            <feGaussianBlur in="SourceGraphic" stdDeviation="${blurAmt}" result="blurred_source" />
            <feImage href="${dispUrl}" x="0" y="0" width="100%" height="100%" result="disp_map" />
            <feDisplacementMap in="blurred_source" in2="disp_map"
                scale="${scale}" xChannelSelector="R" yChannelSelector="G"
                result="displaced" />
            <feColorMatrix in="displaced" type="saturate" values="${specSat}" result="displaced_sat" />
            <feImage href="${specUrl}" x="0" y="0" width="100%" height="100%" result="spec_layer" />
            <feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />
            <feComponentTransfer in="spec_layer" result="spec_faded">
                <feFuncA type="linear" slope="${specOpacity}" />
            </feComponentTransfer>
            <feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />
            <feBlend in="spec_faded" in2="with_sat" mode="normal" />
        `;
        getSvgDefs().appendChild(filter);
    }

    function processElement(el) {
        const w = el.offsetWidth, h = el.offsetHeight;
        if (w < 2 || h < 2) return;

        const radius = parseFloat(getComputedStyle(el).borderRadius) || 20;
        const glassThick = 60;
        const bezelW = Math.min(50, radius - 1, Math.min(w, h) / 2 - 1);
        const ior = 2.5;
        const blurAmt = 0.4;
        const specOpacity = 0.6;
        const specSat = 4;

        const heightFn = SURFACE_FNS.convex_squircle;
        const profile = calculateRefractionProfile(glassThick, bezelW, heightFn, ior, 128);
        const maxDisp = Math.max(...Array.from(profile).map(Math.abs)) || 1;
        const scale = Math.min(maxDisp * 1.2, 80);

        const dispUrl = generateDisplacementMap(w, h, radius, bezelW, profile, maxDisp);
        const specUrl = generateSpecularMap(w, h, radius, bezelW * 2.5);

        const filterId = 'lg-filter-' + el.dataset.lgId;
        // Remove old filter if present
        const oldFilter = getSvgDefs().querySelector('#' + filterId);
        if (oldFilter) oldFilter.remove();
        buildFilter(filterId, dispUrl, specUrl, blurAmt, specSat, specOpacity, scale);

        el.style.backdropFilter = `url(#${filterId}) blur(2px) saturate(140%)`;
        el.style.webkitBackdropFilter = `url(#${filterId}) blur(2px) saturate(140%)`;
    }

    // Initialize
    let idCounter = 0;
    document.querySelectorAll('.liquid-glass, .lg-btn, .service-item, .project-card, .stat-card, .work-item, .contact-section, .skill-item').forEach(el => {
        if (!el.dataset.lgId) el.dataset.lgId = ++idCounter;
    });

    let processed = new Set();
    function processAll() {
        document.querySelectorAll('.liquid-glass, .lg-btn, .service-item, .project-card, .stat-card, .work-item, .contact-section, .skill-item').forEach(el => {
            if (!el.dataset.lgId) el.dataset.lgId = ++idCounter;
            const key = el.dataset.lgId;
            if (processed.has(key) && el.offsetWidth > 0) return;
            processed.add(key);
            processElement(el);
        });
    }

    // Run after layout
    if (document.readyState === 'complete') {
        setTimeout(processAll, 50);
    } else {
        window.addEventListener('load', () => setTimeout(processAll, 50));
    }
    // Re-process on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { processed.clear(); processAll(); }, 200);
    });
})();
