// Apple Liquid Glass — real refraction via Canvas displacement + specular maps
// Follows archisvaze/liquid-glass technique: Snell's law refraction through convex squircle glass,
// displacement applied near element edges (rectangular bezel), applied via per-element SVG filters.

(function () {
    'use strict';

    var SURFACE_FNS = {
        convex_squircle: function (x) { return Math.pow(1 - Math.pow(1 - Math.min(x, 1), 4), 0.25); }
    };

    function calculateRefractionProfile(glassThickness, bezelWidth, heightFn, ior, samples) {
        samples = samples || 128;
        var eta = 1 / ior;
        function refract(nx, ny) {
            var dot = ny;
            var k = 1 - eta * eta * (1 - dot * dot);
            if (k < 0) return null;
            var sq = Math.sqrt(k);
            return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
        }
        var profile = new Float64Array(samples);
        for (var i = 0; i < samples; i++) {
            var x = i / samples;
            var y = heightFn(x);
            var dx = x < 1 ? 0.0001 : -0.0001;
            var y2 = heightFn(x + dx);
            var deriv = (y2 - y) / dx;
            var mag = Math.sqrt(deriv * deriv + 1);
            var ref = refract(-deriv / mag, -1 / mag);
            if (!ref) { profile[i] = 0; continue; }
            profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1]);
        }
        return profile;
    }

    function generateDisplacementMap(w, h, borderRadius, bezelWidth, profile, maxDisp) {
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var ctx = c.getContext('2d');
        var img = ctx.createImageData(w, h);
        var d = img.data;
        for (var i = 0; i < d.length; i += 4) { d[i] = 128; d[i + 1] = 128; d[i + 2] = 0; d[i + 3] = 255; }

        var cx = w / 2, cy = h / 2;
        var bw = Math.max(bezelWidth, 1);
        var S = profile.length;

        // Rectangular bezel: apply displacement in a band near element edges
        for (var y1 = 0; y1 < h; y1++) {
            for (var x1 = 0; x1 < w; x1++) {
                var dxEdge = Math.min(x1, w - 1 - x1);
                var dyEdge = Math.min(y1, h - 1 - y1);
                var edgeDist = Math.min(dxEdge, dyEdge);

                if (edgeDist >= bw) continue;

                var fromSide = edgeDist;
                var bi = Math.min(((fromSide / bw) * S) | 0, S - 1);
                var disp = profile[bi] || 0;
                if (disp === 0) continue;

                var rx = x1 - cx, ry = y1 - cy;
                var dist = Math.sqrt(rx * rx + ry * ry);
                if (dist === 0) continue;
                var cos = rx / dist, sin = ry / dist;

                var dX = (-cos * disp) / maxDisp, dY = (-sin * disp) / maxDisp;
                var idx = (y1 * w + x1) * 4;
                d[idx]     = (128 + dX * 127 + 0.5) | 0;
                d[idx + 1] = (128 + dY * 127 + 0.5) | 0;
            }
        }
        ctx.putImageData(img, 0, 0);
        return c.toDataURL();
    }

    function generateSpecularMap(w, h, borderRadius, bezelWidth, angle) {
        if (angle == null) angle = Math.PI / 3;
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var ctx = c.getContext('2d');
        var img = ctx.createImageData(w, h);
        var d = img.data;
        for (var i = 0; i < d.length; i += 4) { d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 0; }

        var cx = w / 2, cy = h / 2;
        var bw = Math.max(bezelWidth, 1);
        var sv = [Math.cos(angle), Math.sin(angle)];

        for (var y1 = 0; y1 < h; y1++) {
            for (var x1 = 0; x1 < w; x1++) {
                var dxEdge = Math.min(x1, w - 1 - x1);
                var dyEdge = Math.min(y1, h - 1 - y1);
                var edgeDist = Math.min(dxEdge, dyEdge);

                if (edgeDist >= bw) continue;

                var rx = x1 - cx, ry = y1 - cy;
                var dist = Math.sqrt(rx * rx + ry * ry);
                if (dist === 0) continue;
                var cos = rx / dist, sin = ry / dist;
                var dot = Math.abs(cos * sv[0] + sin * sv[1]);
                var edgeFactor = 1 - edgeDist / bw;
                var coeff = dot * edgeFactor;

                if (coeff <= 0.02) continue;

                var col = (255 * coeff + 0.5) | 0;
                var alpha = (col * coeff + 0.5) | 0;
                var idx = (y1 * w + x1) * 4;
                d[idx] = col; d[idx + 1] = col; d[idx + 2] = col;
                d[idx + 3] = alpha;
            }
        }
        ctx.putImageData(img, 0, 0);
        return c.toDataURL();
    }

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var svgDefs = null;
    function getSvgDefs() {
        if (svgDefs) return svgDefs;
        svgDefs = document.querySelector('svg.svg-filters defs');
        if (!svgDefs) {
            var s = document.createElementNS(SVG_NS, 'svg');
            s.setAttribute('class', 'svg-filters-generated');
            s.setAttribute('style', 'position:absolute;width:0;height:0');
            var d = document.createElementNS(SVG_NS, 'defs');
            s.appendChild(d);
            document.head.appendChild(s);
            svgDefs = d;
        }
        return svgDefs;
    }

    function buildFilter(id, dispUrl, specUrl, w, h, scale, blurAmt, specSat, specOpacity) {
        var f = document.createElementNS(SVG_NS, 'filter');
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

    function processElement(el) {
        try {
            var w = el.offsetWidth, h = el.offsetHeight;
            if (w < 2 || h < 2) return;
            var computedR = parseFloat(getComputedStyle(el).borderRadius) || 16;
            var radius = Math.min(computedR, Math.min(w, h) / 2 - 2);
            if (radius < 2) return;

            var bezelW = Math.min(radius * 0.55, Math.min(w, h) / 2 - 1);
            if (bezelW < 1) bezelW = 1;
            var ior = 2.5;

            var profile = calculateRefractionProfile(60, bezelW, SURFACE_FNS.convex_squircle, ior, 128);
            var maxDisp = 0;
            for (var i = 0; i < profile.length; i++) { var v = Math.abs(profile[i]); if (v > maxDisp) maxDisp = v; }
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
        } catch (e) { if (window.__lgDebug) console.warn(e); }
    }

    var idC = 0;
    document.querySelectorAll('.liquid-glass, .lg-btn, .service-item, .project-card, .stat-card, .work-item, .contact-section, .skill-item')
        .forEach(function (el) { if (!el.dataset.lgId) el.dataset.lgId = ++idC; });

    var processed = {};
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
