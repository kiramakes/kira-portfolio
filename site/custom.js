// -----------------------------------------
// ALEJANDRO HA CUSTOM CODE
// -----------------------------------------

gsap.registerPlugin(DrawSVGPlugin,CustomEase,ScrollTrigger,SplitText);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;
let logoScrollMM = null;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
rmMQ.addListener?.(e => (reducedMotion = e.matches)); 

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });

CustomEase.create('button-007-ease', '0.78, 0.18, 0.18, 1');
CustomEase.create('footerReveal','M0,0 C0.65,0 0.15,1 1,1');


// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;
  
  initCalEmbed();
  // Runs once on first load
  // if (has('[data-something]')) initSomething();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
  
  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
  if (has('[data-logo-scroll]')) initLogoScroll("prepare");
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;
  
  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();
  if (has('[data-theme-section]')) initCheckSectionThemeScroll();
  if (has('[data-button-007]')) initButton007();
  if (has('[data-logo-scroll]')) initLogoScroll();
  if (has("[data-anchor-target]")) initScrollToAnchor();
  if (has('[data-parallax]')) initGlobalParallax();
  if (has('[data-scroll-draw-transition]')) initScrollDrawTransition();
  if (has('[data-services]')) initServicesScroll();
  if (has('[data-portfolio-orbit-init]')) initPortfolioOrbit();
  if (has('[data-bracket-heading]')) initBracketHeading();
  if (has('[data-split-lines]')) initSplitLines();
  if (has('[data-split-rolling]')) initSplitRolling();
  if (has('[data-split-random]')) initSplitRandom();
  if (has('[data-contact]')) initContactSection();
  if (has('[data-footer]')) initFooterParallax();
  if (has('[data-current-year]')) initDynamicCurrentYear();
  if (has('[data-image-trail]')) initImageTrail();
  
  
  
  if(hasLenis){
    lenis.resize();
  }
  
  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}



// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionShape = transitionWrap?.querySelector(".transition__shape");
  const transitionSVGPaths = transitionShape?.querySelectorAll("svg path");
  const signature = transitionWrap?.querySelector("[data-transition-signature]");
  const signaturePaths = signature?.querySelectorAll("svg path");
  const heroElements = next.querySelectorAll("[data-transition-reveal]");
  const tl = gsap.timeline();

  if (
    !transitionWrap ||
    !transitionSVGPaths?.length ||
    !signature ||
    !signaturePaths?.length
  ) {
    tl.call(resetPage, [next]);
    return tl;
  }

  if (reducedMotion) {
    tl.set(next, { autoAlpha: 1 });
    tl.set(signature, { autoAlpha: 0 });
    tl.set(transitionSVGPaths, {
      drawSVG: "100% 100%",
      strokeWidth: "5%",
    });
    tl.call(resetPage, [next]);
    return tl;
  }

  tl.set(next, { autoAlpha: 1 });

  tl.set(transitionSVGPaths, {
    drawSVG: "0% 100%",
    strokeWidth: "80%",
  });

  tl.set(signaturePaths, {
    drawSVG: "0% 0%",
  });

  tl.set(signature, {
    autoAlpha: 1,
  });

  const signaturePathsArray = [...signaturePaths];
  const pathLengths = signaturePathsArray.map((path) => path.getTotalLength());
  const longestPath = Math.max(...pathLengths);

  signaturePathsArray.forEach((path, index) => {
    const pathLength = pathLengths[index];

    const duration = gsap.utils.mapRange(
      0,
      longestPath,
      0.25,
      0.5,
      pathLength
    );

    tl.to(path, {
      drawSVG: "0% 100%",
      duration,
      ease: "none",
    });
  });

  tl.to({}, { duration: 0.35 });

  tl.to(signaturePaths, {
    drawSVG: "100% 100%",
    duration: 0.8,
    stagger: 0.03,
    ease: "power2.inOut",
  });

  tl.to(
    transitionSVGPaths,
    {
      drawSVG: "100% 100%",
      strokeWidth: "5%",
      duration: 1.25,
      ease: "power1.inOut",
    },
    "< 0.35"
  );

  tl.set(signature, {
    autoAlpha: 0,
  });

  tl.fromTo(
    heroElements,
    {
      yPercent: 25,
      autoAlpha: 0,
    },
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 1,
      stagger: 0.15,
      ease: "expo.out",
    },
    "< 0.15"
  );

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return tl;
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionShape = transitionWrap?.querySelector(".transition__shape");
  const transitionSVGPaths = transitionShape?.querySelectorAll("svg path");
  const signature = transitionWrap?.querySelector("[data-transition-signature]");

  const tl = gsap.timeline({
    onComplete: () => current.remove(),
  });

  if (reducedMotion) {
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.set(next, { autoAlpha: 0 }, 0);
  tl.set(signature, { autoAlpha: 0 }, 0);
  tl.set(transitionSVGPaths, {
    strokeWidth: "5%",
    drawSVG: "0% 0%",
  });

  tl.to(transitionSVGPaths, {
    drawSVG: "0% 85%",
    duration: 1,
    ease: "power1.inOut",
  });

  tl.to(
    transitionSVGPaths,
    {
      strokeWidth: "80%",
      duration: 0.75,
      ease: "power1.inOut",
    },
    "< 0.25"
  );

  return tl;
}

function runPageEnterAnimation(next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionShape = transitionWrap?.querySelector(".transition__shape");
  const transitionSVGPaths = transitionShape?.querySelectorAll("svg path");
  const signature = transitionWrap?.querySelector("[data-transition-signature]");
  const heroElements = next.querySelectorAll("[data-transition-reveal]");
  const tl = gsap.timeline();

  if (reducedMotion) {
    tl.set(next, { autoAlpha: 1 });
    tl.set(signature, { autoAlpha: 0 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");

    return new Promise((resolve) => {
      tl.call(resolve, null, "pageReady");
    });
  }

  tl.add("startEnter", 1);
  tl.set(next, { autoAlpha: 1 }, "startEnter");
  tl.set(signature, { autoAlpha: 0 }, "startEnter");
  tl.set(
    transitionSVGPaths,
    {
      drawSVG: "0% 100%",
      strokeWidth: "80%",
    },
    "startEnter"
  );

  tl.to(
    transitionSVGPaths,
    {
      drawSVG: "100% 100%",
      strokeWidth: "5%",
      duration: 1.25,
      ease: "power1.inOut",
    },
    "startEnter"
  );

  tl.fromTo(
    heroElements,
    {
      yPercent: 25,
      autoAlpha: 0,
    },
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 1.5,
      stagger: 0.15,
      ease: "expo.out",
    },
    "< 0.75"
  );

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise((resolve) => {
    tl.call(resolve, null, "pageReady");
  });
}


// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
  // Position new container on top
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
  });
  
  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }
  
  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if (logoScrollMM) {
    logoScrollMM.revert();
    logoScrollMM = null;
  }

  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
});

barba.hooks.enter(data => {
  initBarbaNavUpdate(data);
})

barba.hooks.afterEnter(data => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);
  
  // Settle
  if(hasLenis){
    lenis.resize();
    lenis.start();    
  }
  
  if(hasScrollTrigger){
    ScrollTrigger.refresh(); 
  }
});

barba.init({
  debug: false, // Set to 'false' in production
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: "self",
      sync: true,
      
      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      }
    },
    {
      name: "default",
      sync: true,
      
      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      }
    }
  ],
});



// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: "dark",
    transition: "light"
  },
  dark: {
    nav: "light",
    transition: "dark"
  }
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = themeConfig[pageTheme] || themeConfig.light;
  
  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector('[data-theme-nav]');
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    lerp: 0.165,
    wheelMultiplier: 1.25,
  });

  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container){
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });
  
  if(hasLenis){
    lenis.resize();
    lenis.start();    
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    // Class list sync
    var newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}



// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

function initCheckSectionThemeScroll() {
  let ticking = false;
  let currentTheme = null;

  // Get detection offset, in this case the navbar
  const navBarHeight = document.querySelector('[data-nav-bar-height]');
  const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

  const themeSections = document.querySelectorAll('[data-theme-section]');
  const themeNavElements = document.querySelectorAll('[data-theme-nav]');

  function updateElements(elements, attribute, value) {
    elements.forEach((el) => {
      el.setAttribute(attribute, value);
    });
  }

  function checkThemeSection() {
    for (const themeSection of themeSections) {
      const rect = themeSection.getBoundingClientRect();
      const themeSectionTop = rect.top;
      const themeSectionBottom = rect.bottom;

      // If the offset is between the top & bottom of the current section
      if (themeSectionTop <= themeObserverOffset && themeSectionBottom >= themeObserverOffset) {
        const themeSectionActive = themeSection.getAttribute('data-theme-section');

        if (themeSectionActive !== currentTheme) {
          updateElements(themeNavElements, 'data-theme-nav', themeSectionActive);
          currentTheme = themeSectionActive;
        }

        break;
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(checkThemeSection);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(checkThemeSection);
    }
  });
  
  checkThemeSection();

}

function initButton007() {
  const buttons = document.querySelectorAll('[data-button-007]');
  if (buttons.length === 0) return;
  
  let mm = gsap.matchMedia();
  
  mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    buttons.forEach((element, index) => {
      const svgs = element.querySelectorAll('[data-button-007-svg]');
      const paths = element.querySelectorAll('[data-button-007-svg] path');
      const mask = element.querySelector('[data-button-007-mask]');
      const maskObject = element.querySelector('[data-button-007-mask-object]');
      if (svgs.length === 0 || paths.length === 0 || !mask || !maskObject) return;
      
      const hoverRoot = element.closest('[data-hover]') || element;
      const tl = gsap.timeline({
        paused: true,
      });
      
      const id = `button-007-mask-${index}`;
      
      let hoverLocked = false;
      let pendingEnter = false;
      
      const getStrokeWidth = (el) => {
        const value = getComputedStyle(el).getPropertyValue('--button-007-stroke-width').trim();
        return parseFloat(value) || 0;
      };
      const strokeWidth = getStrokeWidth(element);
      
      mask.id = id;
      maskObject.setAttribute('mask', `url(#${id})`);
      tl.set(paths, {
        drawSVG: '0% 0%',
        strokeWidth: 0,
      });
      
      function syncForeignObjectSize() {
        const parentSvg = svgs[0].parentNode.parentNode;
        const height = parentSvg.getBoundingClientRect().height;
        if (!height) return;
        maskObject.setAttribute('height', height);
      }
      
      syncForeignObjectSize();
      
      const onWindowResize = () => {
        syncForeignObjectSize();
      };
      
      window.addEventListener('resize', onWindowResize);
      
      let activeTween = null;
      const onEnter = () => {
        if (hoverLocked) {
          pendingEnter = true;
          return;
        }
        hoverLocked = true;
        
        if (activeTween) activeTween.kill();
        
        gsap.set(paths, {
          drawSVG: '0% 0%',
          strokeWidth: 0,
        });
        
        activeTween = gsap.to(paths, {
          strokeWidth: strokeWidth,
          drawSVG: '100% 0%',
          duration: 0.8,
          ease: 'button-007-ease',
          overwrite: true,
        });
      };
      const onLeave = () => {
        if (activeTween) activeTween.kill();
        pendingEnter = false;
        
        activeTween = gsap.timeline({
          overwrite: true,
        });
        
        activeTween.to(
          paths,
          {
            strokeWidth: 4,
            duration: 0.8,
            ease: 'button-007-ease',
          },
          0,
        );
        activeTween.to(
          paths,
          {
            drawSVG: '100% 100%',
            duration: 0.8,
            ease: 'button-007-ease',
          },
          0,
        );
        activeTween.call(
          () => {
            hoverLocked = false;
            if (pendingEnter) {
              pendingEnter = false;
              onEnter();
            }
          },
          null,
          '-=0.2',
        );
      };
      const onFocusIn = () => {
        if (hoverRoot.matches(':focus-visible')) onEnter();
      };
      const onFocusOut = () => {
        onLeave();
      };
      
      hoverRoot.addEventListener('pointerenter', onEnter);
      hoverRoot.addEventListener('pointerleave', onLeave);
      hoverRoot.addEventListener('focusin', onFocusIn);
      hoverRoot.addEventListener('focusout', onFocusOut);
      
      return () => {
        hoverRoot.removeEventListener('pointerenter', onEnter);
        hoverRoot.removeEventListener('pointerleave', onLeave);
        hoverRoot.removeEventListener('focusin', onFocusIn);
        hoverRoot.removeEventListener('focusout', onFocusOut);
        window.removeEventListener('resize', onWindowResize);
        ro.disconnect();
        if (activeTween) activeTween.kill();
        tl.kill();
      };
    });
  });
}

function initCalEmbed() {
  if (window.CalLoaded) return;
  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal;
      let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () {
          p(api, arguments);
        };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else {
          p(cal, ar);
        }
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");

  Cal.config = Cal.config || {};
  Cal.config.forwardQueryParams = true;

  // Namespace en español
  Cal("init", "reunion-pagina-web", { origin: "https://app.cal.com" });
  Cal.ns["reunion-pagina-web"]("ui", {
    hideEventTypeDetails: false,
    layout: "month_view"
  });

  // Namespace en inglés
  Cal("init", "web-development-meeting", { origin: "https://app.cal.com" });
  Cal.ns["web-development-meeting"]("ui", {
    hideEventTypeDetails: false,
    layout: "month_view"
  });

  window.CalLoaded = true;
}

function initLogoScroll(stage = "init") {
  const logo = nextPage.querySelector("[data-logo-scroll]");
  const trigger = nextPage.querySelector("[data-logo-scroll-trigger]");

  if (!logo || !trigger) return;

  if (reducedMotion) {
    gsap.set(logo, {
      clearProps: "width,transform",
    });

    return;
  }

  const breakpoints = {
    desktop: {
      query: "(min-width: 1025px)",
      y: "90%",
    },
    tablet: {
      query: "(min-width: 768px) and (max-width: 1024px)",
      y: "120%",
    },
    mobile: {
      query: "(max-width: 767px)",
      y: "120%",
    },
  };

  const getInitialY = () => {
    const breakpoint = Object.values(breakpoints).find(({ query }) =>
      window.matchMedia(query).matches
    );

    return breakpoint?.y || "90%";
  };

  if (stage === "prepare") {
    logo.dataset.logoScrollFinalWidth =
      getComputedStyle(logo).width;

    gsap.set(logo, {
      width: "100%",
      y: getInitialY(),
    });

    return;
  }

  if (logoScrollMM) {
    logoScrollMM.revert();
  }

  logoScrollMM = gsap.matchMedia();

  const finalWidth =
    logo.dataset.logoScrollFinalWidth ||
    getComputedStyle(logo).width;

  let backToTopEnabled = false;

  const enableBackToTop = () => {
    backToTopEnabled = true;

    logo.setAttribute("data-back-to-top-active", "");
    logo.setAttribute("aria-label", "Volver al inicio");
  };

  const disableBackToTop = () => {
    backToTopEnabled = false;

    logo.removeAttribute("data-back-to-top-active");
    logo.removeAttribute("aria-label");
  };

  const handleBackToTop = (event) => {
    event.preventDefault();

    if (!backToTopEnabled || !lenis) return;

    lenis.scrollTo(0, {
      duration: 1.2,
      easing: (x) =>
        x < 0.5
          ? 8 * x * x * x * x
          : 1 - Math.pow(-2 * x + 2, 4) / 2,
    });
  };

  disableBackToTop();
  logo.addEventListener("click", handleBackToTop);

  Object.values(breakpoints).forEach(({ query, y }) => {
    logoScrollMM.add(query, () => {
      gsap.set(logo, {
        width: "100%",
        y,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,

          onLeave: enableBackToTop,
          onEnterBack: disableBackToTop,
        },
      });

      timeline.to(logo, {
        width: finalWidth,
        y: 0,
        ease: "none",
      });

      return () => {
        disableBackToTop();

        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    });
  });

  logoScrollMM.add("all", () => {
    return () => {
      logo.removeEventListener("click", handleBackToTop);
      disableBackToTop();
    };
  });
}

function initScrollToAnchor() {
  const anchors = nextPage.querySelectorAll("[data-anchor-target]");

  if (!anchors.length || !lenis) return;

  anchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      event.preventDefault();

      const target = anchor.getAttribute("data-anchor-target");

      if (!target) return;

      lenis.scrollTo(target, {
        duration: 1.2,
        offset: 0,
        easing: (x) =>
          x < 0.5
            ? 8 * x * x * x * x
            : 1 - Math.pow(-2 * x + 2, 4) / 2,
      });
    });
  });
}

function initGlobalParallax() {

  const mm = gsap.matchMedia()

  mm.add(
    {
      isMobile: "(max-width:479px)",
      isMobileLandscape: "(max-width:767px)",
      isTablet: "(max-width:991px)",
      isDesktop: "(min-width:992px)"
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions

      const ctx = gsap.context(() => {
        document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
            // Check if this trigger has to be disabled on smaller breakpoints
            const disable = trigger.getAttribute("data-parallax-disable")
            if (
              (disable === "mobile" && isMobile) ||
              (disable === "mobileLandscape" && isMobileLandscape) ||
              (disable === "tablet" && isTablet)
            ) {
              return
            }
            
            // Optional: you can target an element inside a trigger if necessary 
            const target = trigger.querySelector('[data-parallax="target"]') || trigger

            // Get the direction value to decide between xPercent or yPercent tween
            const direction = trigger.getAttribute("data-parallax-direction") || "vertical"
            const prop = direction === "horizontal" ? "xPercent" : "yPercent"
            
            // Get the scrub value, our default is 'true' because that feels nice with Lenis
            const scrubAttr = trigger.getAttribute("data-parallax-scrub")
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true
            
            // Get the start position in % 
            const startAttr = trigger.getAttribute("data-parallax-start")
            const startVal = startAttr !== null ? parseFloat(startAttr) : 20
            
            // Get the end position in %
            const endAttr = trigger.getAttribute("data-parallax-end")
            const endVal = endAttr !== null ? parseFloat(endAttr) : -20
            
            // Get the start value of the ScrollTrigger
            const scrollStartRaw = trigger.getAttribute("data-parallax-scroll-start") || "top bottom"
            const scrollStart = `clamp(${scrollStartRaw})`
            
           // Get the end value of the ScrollTrigger  
            const scrollEndRaw = trigger.getAttribute("data-parallax-scroll-end") || "bottom top"
            const scrollEnd = `clamp(${scrollEndRaw})`

            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub,
                },
              }
            )
          })
      })

      return () => ctx.revert()
    }
  )
}

function initScrollDrawTransition() {
  const wrappers = document.querySelectorAll(
    '[data-scroll-draw-transition]'
  );

  if (!wrappers.length || reducedMotion) return;

  wrappers.forEach((wrapper) => {
    const section = wrapper.querySelector(
      '[data-scroll-draw-section]'
    );

    const overlay = wrapper.querySelector(
      '[data-scroll-draw-overlay]'
    );

    const paths = overlay?.querySelectorAll('svg path');

    if (!section || !overlay || !paths?.length) return;

    const setWrapperHeight = () => {
      gsap.set(wrapper, {
        height: Math.max(
          section.scrollHeight,
          window.innerHeight
        ),
      });
    };

    setWrapperHeight();

    gsap.context(() => {
      gsap.set(section, {
        position: 'relative',
        zIndex: 0,
      });

      gsap.set(overlay, {
        zIndex: 1,
        pointerEvents: 'none',
      });

      gsap.set(paths, {
        strokeWidth: '5%',
        drawSVG: '0% 0%',
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: '+=200%',
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: setWrapperHeight,
        },
      })
        .to(
          paths,
          {
            drawSVG: '0% 85%',
            duration: 1,
            ease: 'none',
          },
          0
        )
        .to(
          paths,
          {
            strokeWidth: '80%',
            duration: 0.75,
            ease: 'none',
          },
          0.25
        );
    }, wrapper);
  });
}

function initServicesScroll() {
  const sections = nextPage.querySelectorAll('[data-services]');

  if (!sections.length) return;

  const mm = gsap.matchMedia();

  sections.forEach((section) => {
    const servicesList = section.querySelector(
      '[data-services-list]'
    );

    const serviceItems = gsap.utils.toArray(
      section.querySelectorAll('[data-services-item]')
    );

    if (!servicesList || !serviceItems.length) return;

    const services = serviceItems.map((item) => ({
      item,
      row: item.querySelector('[data-services-row]'),
      visual: item.querySelector('[data-services-visual]'),
      description: item.querySelector(
        '.service-description'
      ),
      imageWrap: item.querySelector(
        '[data-services-image-wrap]'
      ),
    }));

    const hasMissingElements = services.some(
      ({ row, visual, description, imageWrap }) =>
        !row ||
        !visual ||
        !description ||
        !imageWrap
    );

    if (hasMissingElements) return;

    const allServiceElements = [
      section,
      servicesList,
      ...services.map(({ item }) => item),
      ...services.map(({ visual }) => visual),
      ...services.map(({ imageWrap }) => imageWrap),
      ...services.map(({ description }) => description),
    ];

    const resetServiceStyles = () => {
      gsap.set(allServiceElements, {
        clearProps:
          'transform,height,width,left,top,zIndex,overflow,clipPath,webkitClipPath,opacity,visibility',
      });
    };

    // -----------------------------------------
    // DESKTOP — 992px AND UP
    // -----------------------------------------

    mm.add('(min-width: 992px)', () => {
      if (reducedMotion) {
        resetServiceStyles();
        return;
      }

      const setLayout = () => {
        services.forEach(({ row, visual }, index) => {
          const previousRowHeight =
            index > 0
              ? services[index - 1].row.offsetHeight
              : 0;

          const availableHeight =
            window.innerHeight -
            row.offsetHeight -
            previousRowHeight;

          gsap.set(visual, {
            height: Math.max(availableHeight, 0),
          });
        });
      };

      const getHiddenRowsOffset = (activeIndex) => {
        if (activeIndex < 2) return 0;

        let offset = 0;

        for (
          let index = 0;
          index <= activeIndex - 2;
          index += 1
        ) {
          offset += services[index].row.offsetHeight;
        }

        return -offset;
      };

      setLayout();

      const context = gsap.context(() => {
        gsap.set(servicesList, {
          y: 0,
        });

        services.forEach(
          ({ visual, imageWrap }, index) => {
            gsap.set(visual, {
              overflow: 'hidden',
            });

            gsap.set(imageWrap, {
              left: '29%',
              width: index === 0 ? '71%' : '0%',
            });
          }
        );

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () =>
              `+=${window.innerHeight * services.length}`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: setLayout,
          },
        });

        services
          .slice(0, -1)
          .forEach((service, index) => {
            const nextIndex = index + 1;
            const nextService = services[nextIndex];

            timeline
              .to(
                service.visual,
                {
                  height: 0,
                  duration: 1,
                  ease: 'none',
                },
                index
              )
              .to(
                service.imageWrap,
                {
                  left: '100%',
                  width: '0%',
                  duration: 1,
                  ease: 'none',
                },
                index
              )
              .to(
                nextService.imageWrap,
                {
                  left: '29%',
                  width: '71%',
                  duration: 1,
                  ease: 'none',
                },
                index
              )
              .to(
                servicesList,
                {
                  y: () =>
                    getHiddenRowsOffset(nextIndex),
                  duration: 1,
                  ease: 'none',
                },
                index
              );
          });
      }, section);

      return () => {
        context.revert();
        resetServiceStyles();
      };
    });

    // -----------------------------------------
    // TABLET — 768px TO 991px
    // -----------------------------------------

    mm.add(
      '(min-width: 768px) and (max-width: 991px)',
      () => {
        if (reducedMotion) {
          resetServiceStyles();
          return;
        }

        let visualHeights = [];

        const measureLayout = () => {
          visualHeights = services.map(
            ({ visual }) => visual.scrollHeight
          );
        };

        const setInitialState = () => {
          gsap.set(servicesList, {
            y: 0,
          });

          services.forEach(
            (
              {
                item,
                visual,
                imageWrap,
                description,
              },
              index
            ) => {
              gsap.set(item, {
                clearProps: 'transform,zIndex',
              });

              gsap.set(visual, {
                height:
                  index === 0
                    ? visualHeights[index]
                    : 0,
                overflow: 'hidden',
              });

              gsap.set(imageWrap, {
                clearProps:
                  'transform,width,left,top,clipPath,webkitClipPath,opacity,visibility',
              });

              gsap.set(description, {
                clearProps:
                  'transform,opacity,visibility',
              });
            }
          );
        };

        measureLayout();

        const context = gsap.context(() => {
          setInitialState();

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () =>
                `+=${window.innerHeight * (services.length - 1)}`,
              scrub: true,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,

              onRefreshInit: () => {
                measureLayout();
                setInitialState();
              },
            },
          });

          services
            .slice(0, -1)
            .forEach((service, index) => {
              const nextIndex = index + 1;
              const nextService = services[nextIndex];

              timeline
                .to(
                  service.visual,
                  {
                    height: 0,
                    duration: 1,
                    ease: 'none',
                  },
                  index
                )
                .to(
                  nextService.visual,
                  {
                    height: () =>
                      visualHeights[nextIndex],
                    duration: 1,
                    ease: 'none',
                  },
                  index
                );
            });
        }, section);

        return () => {
          context.revert();
          resetServiceStyles();
        };
      }
    );

    // -----------------------------------------
    // MOBILE — 767px AND DOWN
    // -----------------------------------------

    mm.add('(max-width: 767px)', () => {
      resetServiceStyles();

      return resetServiceStyles;
    });
  });
}

function initPortfolioOrbit() {
  const components = document.querySelectorAll(
    "[data-portfolio-orbit-init]"
  );

  components.forEach((component) => {
    const list = component.querySelector(
      "[data-orbit-tiles-list]"
    );

    const tiles = gsap.utils.toArray(
      component.querySelectorAll("[data-orbit-tiles-item]")
    );

    const cards = tiles.map((tile) =>
      tile.querySelector("[data-orbit-card]")
    );
    
    const videos = tiles.map((tile) =>
      tile.querySelector("[data-orbit-video]")
    );

    const tileMasks = tiles.map((tile) =>
      tile.querySelector("[data-orbit-tiles-mask]")
    );

    const contentItems = gsap.utils.toArray(
      component.querySelectorAll("[data-portfolio-content]")
    );

    const currentCount = component.querySelector(
      '[data-portfolio-count="current"]'
    );

    const totalCount = component.querySelector(
      '[data-portfolio-count="total"]'
    );

    const totalItems = tiles.length;

    if (
      !list ||
      totalItems < 2 ||
      cards.some((card) => !card) ||
      videos.some((video) => !video) ||
      tileMasks.some((mask) => !mask)
    ) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const radiusMultiplier = 0.7;
    const blurMultiplier = 0.04;
    const minScale = 0.2;
    const orbitDuration = 24;
    const orbitMoveDuration = 0.7;
    const cardOpenDuration = 0.75;
    const cardCloseDuration = 0.55;
    const mediaCrop = 0.18;
    const mediaRadius = "0.65em";

    const orbitState = {
      step: 0
    };

    const ambientState = {
      rotation: 0
    };

    let currentStep = 0;
    let currentContentIndex = -1;
    let currentTileIndex = 0;
    let currentOrbitWidth = 0;
    let orbitInView = false;
    let contentTimeline = null;
    let cardTimeline = null;
    let orbitTween = null;
    let orbitWidthTween = null;
    let keyboardEnabled = false;

    const wrapIndex = gsap.utils.wrap(0, totalItems);
    
    function pauseAllVideos() {
      videos.forEach((video) => {
        if (!video) return;

        video.pause();
      });
    }

    function playActiveVideo() {
      if (!orbitInView) return;

      const activeVideo = videos[currentTileIndex];

      if (!activeVideo) return;

      videos.forEach((video, index) => {
        if (!video) return;

        if (index !== currentTileIndex) {
          video.pause();
        }
      });

      const playPromise = activeVideo.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
    
    videos.forEach((video) => {
      if (!video) return;

      video.muted = true;
      video.loop = true;
      video.playsInline = true;
    });

    const contentData = contentItems.map((wrapper) => {
      const revealElements = gsap.utils.toArray(
        wrapper.querySelectorAll(
          "[data-portfolio-content-reveal]"
        )
      );

      const splits = revealElements.map((element) =>
        SplitText.create(element, {
          type: "lines",
          mask: "lines",
          autoSplit: false
        })
      );

      const lines = splits.flatMap((split) => split.lines);

      return {
        wrapper,
        splits,
        lines
      };
    });

    function measureNaturalWidths() {
      cards.forEach((card) => {
        gsap.set(card, {
          clearProps: "width"
        });

        const naturalWidth =
          card.offsetWidth ||
          card.getBoundingClientRect().width;

        card.dataset.orbitNaturalWidth =
          String(naturalWidth);
      });

      currentOrbitWidth = Math.max(
        ...cards.map((card) => {
          return (
            Number(card.dataset.orbitNaturalWidth) ||
            card.offsetWidth
          );
        })
      );
    }

    function getNaturalWidth(card) {
      const storedWidth = Number(
        card.dataset.orbitNaturalWidth
      );

      if (
        Number.isFinite(storedWidth) &&
        storedWidth > 0
      ) {
        return storedWidth;
      }

      return (
        card.offsetWidth ||
        card.getBoundingClientRect().width
      );
    }

    function getActiveCardWidth() {
      const naturalWidth =
        cards[currentTileIndex].offsetWidth ||
        cards[currentTileIndex].getBoundingClientRect().width;

      return naturalWidth * 1.15;
    }

    function getCardReveal(card) {
      const value = gsap.getProperty(
        card,
        "--orbit-card-reveal"
      );

      const parsedValue =
        typeof value === "number"
          ? value
          : parseFloat(String(value));

      if (!Number.isFinite(parsedValue)) {
        return 0;
      }

      return gsap.utils.clamp(
        0,
        1,
        parsedValue
      );
    }

    function updateCardMask(card) {
      const mask = card.querySelector(
        "[data-orbit-tiles-mask]"
      );

      if (!mask) return;

      const reveal = getCardReveal(card);

      const cardHeight =
        card.offsetHeight ||
        card.getBoundingClientRect().height;

      const crop =
        cardHeight *
        mediaCrop *
        (1 - reveal);

      const inset = crop <= 0.5 ? 0 : crop;

      gsap.set(mask, {
        clipPath: `inset(${inset}px 0px ${inset}px 0px round ${mediaRadius})`,
        webkitClipPath: `inset(${inset}px 0px ${inset}px 0px round ${mediaRadius})`
      });
    }

    function updateCounter(index, animate = true) {
      if (!currentCount) return;

      const nextValue = String(index + 1).padStart(
        2,
        "0"
      );

      gsap.killTweensOf(currentCount);

      if (!animate) {
        currentCount.textContent = nextValue;

        gsap.set(currentCount, {
          autoAlpha: 1,
          yPercent: 0
        });

        return;
      }

      gsap
        .timeline()
        .to(currentCount, {
          autoAlpha: 0,
          yPercent: -100,
          duration: 0.3,
          ease: "power3.in"
        })
        .call(() => {
          currentCount.textContent = nextValue;
        })
        .set(currentCount, {
          yPercent: 100
        })
        .to(currentCount, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.4,
          ease: "power3.out"
        });
    }

    function updateContent(index, animate = true) {
      if (!contentData.length) return;
      if (index === currentContentIndex) return;

      const previousIndex = currentContentIndex;
      const previousContent =
        previousIndex >= 0
          ? contentData[previousIndex]
          : null;

      const nextContent = contentData[index];

      if (!nextContent) return;

      contentTimeline?.kill();

      currentContentIndex = index;

      if (!animate) {
        gsap.set(contentItems, {
          autoAlpha: 0
        });

        contentData.forEach((content) => {
          gsap.set(content.lines, {
            yPercent: 110
          });
        });

        gsap.set(nextContent.wrapper, {
          autoAlpha: 1
        });

        gsap.set(nextContent.lines, {
          yPercent: 0
        });

        return;
      }

      contentData.forEach((content, contentIndex) => {
        if (contentIndex !== index) {
          gsap.set(content.wrapper, {
            autoAlpha: 0
          });

          gsap.set(content.lines, {
            yPercent: 110
          });
        }
      });

      contentTimeline = gsap.timeline();

      if (previousContent) {
        contentTimeline.to(previousContent.lines, {
          yPercent: -110,
          duration: 0.35,
          stagger: 0.025,
          ease: "power3.in"
        });
      }

      contentTimeline
        .set(nextContent.wrapper, {
          autoAlpha: 1
        })
        .fromTo(
          nextContent.lines,
          {
            yPercent: 110
          },
          {
            yPercent: 0,
            duration: 0.7,
            stagger: 0.055,
            ease: "power4.out"
          },
          previousContent ? "-=0.1" : 0
        );
    }

    function updateContentStatus(index) {
      contentItems.forEach((item, itemIndex) => {
        item.setAttribute(
          "data-portfolio-content-status",
          itemIndex === index
            ? "active"
            : "not-active"
        );
      });
    }

    function updateTileStatus() {
      const activeIndex = wrapIndex(
        Math.round(orbitState.step)
      );

      tiles.forEach((tile, index) => {
        const isActive = index === activeIndex;
        const card = cards[index];

        tile.setAttribute(
          "data-orbit-tiles-item-status",
          isActive ? "active" : "not-active"
        );

        if (!card.dataset.orbitHref) {
          const href = card.getAttribute("href");

          if (href) {
            card.dataset.orbitHref = href;
          }
        }

        if (isActive) {
          const href = card.dataset.orbitHref;

          if (href) {
            card.setAttribute("href", href);
          }

          card.style.pointerEvents = "auto";
          card.style.cursor = "pointer";
          card.removeAttribute("aria-disabled");
          card.removeAttribute("tabindex");
        } else {
          card.removeAttribute("href");
          card.style.pointerEvents = "none";
          card.style.cursor = "default";
          card.setAttribute("aria-disabled", "true");
          card.setAttribute("tabindex", "-1");
        }
      });
    }

    function renderOrbit() {
      if (!currentOrbitWidth) return;

      updateTileStatus();

      const radiusX =
        currentOrbitWidth * radiusMultiplier;

      const maxBlur =
        currentOrbitWidth * blurMultiplier;

      gsap.set(list, {
        rotation: ambientState.rotation
      });

      tiles.forEach((tile, index) => {
        const angle =
          ((index - orbitState.step) /
            totalItems) *
          Math.PI *
          2;

        const rawDepth =
          (Math.cos(angle) + 1) / 2;

        const depth = Math.pow(
          rawDepth,
          1.3
        );

        const x =
          Math.sin(angle) * radiusX;

        const scale = gsap.utils.interpolate(
          minScale,
          1,
          depth
        );

        const blur = gsap.utils.interpolate(
          maxBlur,
          0,
          depth
        );

        gsap.set(tile, {
          x,
          y: 0,
          scale,
          opacity: 1,
          rotation: -ambientState.rotation,
          filter: `blur(${blur}px)`,
          zIndex: Math.round(depth * 1000)
        });
      });
    }

    function animateOrbitWidth(
      targetWidth,
      duration,
      ease
    ) {
      orbitWidthTween?.kill();

      const widthState = {
        width: currentOrbitWidth
      };

      orbitWidthTween = gsap.to(widthState, {
        width: targetWidth,
        duration,
        ease,
        overwrite: true,
        onUpdate: () => {
          currentOrbitWidth =
            widthState.width;

          renderOrbit();
        },
        onComplete: () => {
          currentOrbitWidth =
            targetWidth;

          renderOrbit();
        }
      });
    }

    function openCard(index, animate = true) {
      const card = cards[index];

      if (!card) return;

      const targetWidth =
        getActiveCardWidth();

      cardTimeline?.kill();
      orbitWidthTween?.kill();
      gsap.killTweensOf(card);

      if (!animate || reducedMotion) {
        currentOrbitWidth = targetWidth;

        gsap.set(card, {
          width: targetWidth,
          "--orbit-card-reveal": 1
        });

        updateCardMask(card);
        renderOrbit();
        return;
      }

      const startWidth =
        card.offsetWidth ||
        getNaturalWidth(card);

      const widthState = {
        width: currentOrbitWidth ||
          startWidth
      };

      gsap.set(card, {
        "--orbit-card-reveal": getCardReveal(card)
      });

      cardTimeline = gsap.timeline();

      cardTimeline.to(
        widthState,
        {
          width: targetWidth,
          duration: cardOpenDuration,
          ease: "osmo",
          onUpdate: () => {
            currentOrbitWidth =
              widthState.width;

            renderOrbit();
          }
        },
        0
      );

      cardTimeline.to(
        card,
        {
          width: targetWidth,
          "--orbit-card-reveal": 1,
          duration: cardOpenDuration,
          ease: "osmo",
          overwrite: true,
          onUpdate: () => {
            updateCardMask(card);
          },
          onComplete: () => {
            currentOrbitWidth =
              targetWidth;

            updateCardMask(card);
            renderOrbit();
          }
        },
        0
      );
    }

    function closeCard(index, animate = true) {
      const card = cards[index];

      if (!card) return;

      const naturalWidth =
        getNaturalWidth(card);

      gsap.killTweensOf(card);

      if (!animate || reducedMotion) {
        gsap.set(card, {
          width: naturalWidth,
          "--orbit-card-reveal": 0
        });

        updateCardMask(card);

        gsap.set(card, {
          clearProps: "width"
        });

        return;
      }

      gsap.to(card, {
        width: naturalWidth,
        "--orbit-card-reveal": 0,
        duration: cardCloseDuration,
        ease: "osmo",
        overwrite: true,
        onUpdate: () => {
          updateCardMask(card);
        },
        onComplete: () => {
          gsap.set(card, {
            clearProps: "width"
          });

          gsap.set(card, {
            "--orbit-card-reveal": 0
          });

          updateCardMask(card);
        }
      });
    }

    function setProject(index, animate = true) {
      const activeIndex = wrapIndex(index);

      updateCounter(activeIndex, animate);
      updateContent(activeIndex, animate);
      updateContentStatus(activeIndex);
    }

    function changeProject(direction) {
      const previousIndex =
        currentTileIndex;
        
      pauseAllVideos();

      currentStep += direction;

      const nextIndex =
        wrapIndex(currentStep);

      orbitTween?.kill();
      cardTimeline?.kill();
      orbitWidthTween?.kill();

      closeCard(previousIndex, true);

      cards.forEach((card, index) => {
        if (
          index !== previousIndex &&
          index !== nextIndex &&
          getCardReveal(card) > 0
        ) {
          closeCard(index, true);
        }
      });

      currentTileIndex = nextIndex;

      setProject(nextIndex, true);

      const nextNaturalWidth =
        getNaturalWidth(cards[nextIndex]);

      animateOrbitWidth(
        nextNaturalWidth,
        cardCloseDuration,
        "osmo"
      );

      orbitTween = gsap.to(orbitState, {
        step: currentStep,
        duration: orbitMoveDuration,
        ease: "osmo",
        overwrite: true,
        onUpdate: renderOrbit,
        onComplete: () => {
          if (
            currentTileIndex !== nextIndex
          ) {
            return;
          }

          openCard(nextIndex, true);
          playActiveVideo();
        }
      });
    }

    component.addEventListener("click", (event) => {
      const button = event.target.closest(
        "[data-portfolio-button]"
      );

      if (
        !button ||
        !component.contains(button)
      ) {
        return;
      }

      const direction = button.getAttribute(
        "data-portfolio-button"
      );

      if (
        direction !== "prev" &&
        direction !== "next"
      ) {
        return;
      }

      event.preventDefault();

      changeProject(
        direction === "next" ? 1 : -1
      );
    });

    window.addEventListener("keydown", (event) => {
      if (!keyboardEnabled) return;

      const activeElement =
        document.activeElement;

      const isTyping =
        activeElement?.matches(
          "input, textarea, select, [contenteditable='true']"
        );

      if (isTyping) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        changeProject(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeProject(-1);
      }
    });

    if (totalCount) {
      totalCount.textContent = String(
        totalItems
      ).padStart(2, "0");
    }

    gsap.set(contentItems, {
      autoAlpha: 0
    });

    contentData.forEach((content) => {
      gsap.set(content.lines, {
        yPercent: 110
      });
    });

    measureNaturalWidths();

    cards.forEach((card) => {
      const href = card.getAttribute("href");

      if (href) {
        card.dataset.orbitHref = href;
      }

      gsap.set(card, {
        "--orbit-card-reveal": 0
      });

      updateCardMask(card);
    });

    setProject(0, false);

    currentTileIndex = 0;
    currentStep = 0;
    orbitState.step = 0;

    openCard(0, false);
    renderOrbit();

    const ambientTween = gsap.to(ambientState, {
      rotation: 360,
      duration: orbitDuration,
      ease: "none",
      repeat: -1,
      paused: reducedMotion,
      onUpdate: renderOrbit
    });

    const resizeObserver = new ResizeObserver(() => {
      orbitTween?.kill();
      cardTimeline?.kill();
      orbitWidthTween?.kill();

      const activeCard =
        cards[currentTileIndex];

      cards.forEach((card, index) => {
        if (index === currentTileIndex) {
          return;
        }

        gsap.set(card, {
          clearProps: "width"
        });
      });

      measureNaturalWidths();

      if (activeCard) {
        const targetWidth =
          getActiveCardWidth();

        currentOrbitWidth =
          targetWidth;

        gsap.set(activeCard, {
          width: targetWidth,
          "--orbit-card-reveal": 1
        });

        updateCardMask(activeCard);
      }

      renderOrbit();
    });

    resizeObserver.observe(component);

    const orbitScrollTrigger = ScrollTrigger.create({
      trigger: component,
      start: "top bottom",
      end: "bottom top",
      onToggle: ({ isActive }) => {
        orbitInView = isActive;

        if (isActive) {
          if (!reducedMotion) {
            ambientTween.play();
          }

          playActiveVideo();
        } else {
          if (!reducedMotion) {
            ambientTween.pause();
          }

          pauseAllVideos();
        }
      }
    });
    
    orbitInView = orbitScrollTrigger.isActive;

    if (orbitInView) {
      playActiveVideo();
    }

    ScrollTrigger.create({
      trigger: component,
      start: "top center",
      end: "bottom center",
      onToggle: ({ isActive }) => {
        keyboardEnabled = isActive;
      }
    });
  });
}

function initBracketHeading() {
  const headings = document.querySelectorAll("[data-bracket-heading]");

  if (!headings.length) return;

  headings.forEach((heading) => {
    const leftBracket = heading.querySelector("[data-bracket-left]");
    const rightBracket = heading.querySelector("[data-bracket-right]");

    if (!leftBracket || !rightBracket) return;

    gsap.fromTo(
      leftBracket,
      {
        xPercent: -160,
      },
      {
        xPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heading,
          start: "top bottom",
          end: "top 40%",
          scrub: true,
        },
      }
    );

    gsap.fromTo(
      rightBracket,
      {
        xPercent: 160,
      },
      {
        xPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heading,
          start: "top bottom",
          end: "top 40%",
          scrub: true,
        },
      }
    );
  });
}

function initSplitLines() {
  const splitElements = document.querySelectorAll("[data-split-lines]");

  if (!splitElements.length) return;

  splitElements.forEach((element) => {
    if (element.hasAttribute("data-split-lines-initialized")) return;

    element.setAttribute("data-split-lines-initialized", "");

    SplitText.create(element, {
      type: "lines",
      autoSplit: true,
      mask: "lines",

      onSplit(splitInstance) {
        gsap.set(splitInstance.lines, {
          yPercent: 110,
        });

        return gsap.to(splitInstance.lines, {
          yPercent: 0,
          duration: 0.8,
          ease: "power4.out",
          stagger: 0.1,

          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      },
    });
  });
}

function initSplitRolling() {
  const elements = document.querySelectorAll("[data-split-rolling]");

  if (!elements.length) return;

  elements.forEach((element) => {
    if (element.hasAttribute("data-split-rolling-initialized")) return;

    element.setAttribute("data-split-rolling-initialized", "");

    SplitText.create(element, {
      type: "chars, lines",
      autoSplit: true,
      mask: "lines",

      onSplit(splitInstance) {
        const fontSize = parseFloat(
          window.getComputedStyle(element).fontSize
        );

        const depth = fontSize * 0.6;

        gsap.set(splitInstance.lines, {
          perspective: 500,
        });

        gsap.set(splitInstance.chars, {
          rotationX: -110,
          z: -depth,
          y: depth,
          opacity: 0,
          transformOrigin: `50% 50% -${depth}px`,
        });

        return gsap.to(splitInstance.chars, {
          rotationX: 0,
          z: 0,
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power4.out",
          stagger: 0.03,

          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      },
    });
  });
}

function initSplitRandom() {
  const elements = document.querySelectorAll("[data-split-random]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const fontSize = parseFloat(getComputedStyle(element).fontSize);
    const rawDistance = fontSize * 3;
    const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.2;
    const distance = Math.min(rawDistance, maxDistance);

    const split = SplitText.create(element, {
      type: "chars",
      charsClass: "split-char",
      onSplit(self) {
        gsap.set(self.chars, {
          x: () => gsap.utils.random(-distance, distance),
          y: () => gsap.utils.random(-distance, distance),
          rotation: () => gsap.utils.random(-90, 90),
          scale: () => gsap.utils.random(0.5, 1.4),
          filter: "blur(8px)",
        });
        return gsap.to(self.chars, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          filter: "blur(0px)",
          stagger: {
            each: 0.03,
            from: "random",
          },
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "top 15%",
            scrub: true,
          },
        });
      },
    });
  });
}

function initContactSection() {
  const sections = document.querySelectorAll("[data-contact]");

  if (!sections.length) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const translations = [
    "CONTACTO",
    "CONTACT",
    "CONTACTEZ",
    "CONTATTO",
    "KONTAKT",
    "CONTATO",
    "CONTACT",
    "ΕΠΙΚΟΙΝΩΝΙΑ",
    "連絡",
    "연락",
    "تواصل",
  ];

  const positions = [
    { x: -38, y: -38 },
    { x: -14, y: -40 },
    { x: 14, y: -40 },
    { x: 38, y: -38 },

    { x: -42, y: -14 },
    { x: -18, y: -18 },
    { x: 18, y: -18 },
    { x: 42, y: -14 },

    { x: -42, y: 14 },
    { x: -18, y: 18 },
    { x: 18, y: 18 },
    { x: 42, y: 14 },

    { x: -38, y: 38 },
    { x: -14, y: 40 },
    { x: 14, y: 40 },
    { x: 38, y: 38 },
  ];

  sections.forEach((section) => {
    if (section.hasAttribute("data-contact-initialized")) return;

    const content = section.querySelector("[data-contact-content]");
    const wordsContainer = section.querySelector(
      "[data-contact-words]"
    );

    if (!content || !wordsContainer) return;

    section.setAttribute("data-contact-initialized", "");

    gsap.set(content, {
      autoAlpha: 0,
      yPercent: 25,
      scale: 0.96,
      filter: "blur(0.5rem)",
    });

    const contentAnimation = gsap.to(content, {
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      filter: "blur(0rem)",
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 60%",
        end: "top 25%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    if (reducedMotion) {
      contentAnimation.progress(1);

      gsap.set(content, {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        filter: "blur(0rem)",
      });

      return;
    }

    const wordCount = 50;
    const words = [];

    wordsContainer.innerHTML = "";

    for (let index = 0; index < wordCount; index++) {
      const word = document.createElement("span");

      word.setAttribute("data-contact-word", "");
      word.textContent =
        translations[index % translations.length];

      wordsContainer.appendChild(word);
      words.push(word);
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    words.forEach((word, index) => {
      const position = positions[index % positions.length];

      const cycle = Math.floor(index / positions.length);
      const cycleOffset = cycle * 0.12;

      const startPosition =
        gsap.utils.random(0, 0.52) + cycleOffset;

      const durationIn = gsap.utils.random(0.12, 0.18);
      const durationOut = gsap.utils.random(0.12, 0.18);

      const startX = position.x * gsap.utils.random(0.08, 0.22);
      const startY = position.y * gsap.utils.random(0.08, 0.22);

      const targetX =
        position.x + gsap.utils.random(-4, 4);

      const targetY =
        position.y + gsap.utils.random(-4, 4);

      const endX =
        targetX + gsap.utils.random(-3, 3);

      const endY =
        targetY + gsap.utils.random(-3, 3);

      const scale = gsap.utils.random(0.7, 1.3);
      const opacity = gsap.utils.random(0.25, 0.62);

      gsap.set(word, {
        xPercent: -50,
        yPercent: -50,
        x: `${startX}vw`,
        y: `${startY}vh`,
        z: gsap.utils.random(-1600, -1100),
        scale: scale * 0.35,
        autoAlpha: 0,
        filter: "blur(0.65rem)",
      });

      timeline.to(
        word,
        {
          x: `${targetX}vw`,
          y: `${targetY}vh`,
          z: 0,
          scale,
          autoAlpha: opacity,
          filter: "blur(0rem)",
          duration: durationIn,
          ease: "power1.inOut",
        },
        startPosition
      );

      timeline.to(
        word,
        {
          x: `${endX}vw`,
          y: `${endY}vh`,
          z: gsap.utils.random(800, 1200),
          scale: scale * gsap.utils.random(1.3, 1.65),
          autoAlpha: 0,
          filter: "blur(0.5rem)",
          duration: durationOut,
          ease: "power1.in",
        },
        startPosition + durationIn
      );
    });
  });
}

function initFooterParallax() {
  const footer = document.querySelector('[data-footer]');
  const footerInner = document.querySelector('[data-footer-inner]');

  if (!footer || !footerInner) return;

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    gsap.from(footerInner, {
      yPercent: -100,
      ease: "linear",

      scrollTrigger: {
        trigger: footer,
        start: "clamp(top bottom)",
        end: "clamp(top top)",
        scrub: true,
      },
    });
  });
}

function initDynamicCurrentYear() {  
  const currentYear = new Date().getFullYear();
  const currentYearElements = document.querySelectorAll('[data-current-year]');
  currentYearElements.forEach(currentYearElement => {
    currentYearElement.textContent = currentYear;
  });
}

function initImageTrail() {
  const hasMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (!hasMouse) return;

  const wraps = document.querySelectorAll('[data-image-trail="wrap"]');

  wraps.forEach(wrap => {
    const collection = wrap.querySelector('[data-image-trail="collection"]');
    if (!collection) return;

    const items = Array.from(
      collection.querySelectorAll('[data-image-trail="item"]')
    );
    if (!items.length) return;

    let distance = 0;
    let lastX = 0;
    let lastY = 0;
    let index = 0;
    let hasMoved = false;

    let activeItems = 0;
    let cycleLocked = false;

    const resetDistance = window.innerWidth / 6;

    function createTrailItem(x, y, deltaX, deltaY) {
      if (cycleLocked) return;

      const original = items[index];
      const clone = original.cloneNode(true);

      clone.style.position = "absolute";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.zIndex = "5";

      wrap.appendChild(clone);

      activeItems++;

      const tl = gsap.timeline({
        onComplete: () => {
          clone.remove();
          activeItems--;

          tl.kill();

          if (cycleLocked && activeItems === 0) {
            cycleLocked = false;
            index = 0;
            distance = 0;
          }
        }
      });

      tl.fromTo(
        clone,
        {
          xPercent: -50 + (Math.random() - 0.5) * 80,
          yPercent: -50 + (Math.random() - 0.5) * 10,
          scaleX: 1.3,
          scaleY: 1.3
        },
        {
          scaleX: 1,
          scaleY: 1,
          ease: "elastic.out(2, 0.6)",
          duration: 0.6
        }
      );

      tl.fromTo(
        clone,
        {
          x,
          y,
          rotation: (Math.random() - 0.5) * 20
        },
        {
          x: "+=" + deltaX * 4,
          y: "+=" + deltaY * 4,
          rotation: (Math.random() - 0.5) * 20,
          ease: "power4.out",
          duration: 1.5
        },
        "<"
      );

      tl.to(clone, {
        duration: 0.3,
        scale: 0.5,
        delay: 0.1,
        ease: "back.in(1.5)"
      });

      index++;

      if (index >= items.length) {
        cycleLocked = true;
      }
    }

    wrap.addEventListener("mousemove", event => {
      const rect = wrap.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!hasMoved) {
        lastX = event.clientX;
        lastY = event.clientY;
        hasMoved = true;
        return;
      }

      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;

      if (!cycleLocked) {
        distance += Math.abs(deltaX) + Math.abs(deltaY);

        if (distance > resetDistance) {
          distance = 0;

          createTrailItem(
            x,
            y,
            deltaX,
            deltaY
          );
        }
      }

      lastX = event.clientX;
      lastY = event.clientY;
    });
  });
}