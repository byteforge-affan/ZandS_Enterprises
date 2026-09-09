/* ==========================================================================
   Z&S ANIMATION — ABOUT PAGE ("PACKAGING EXPERIENCE" REBUILD)
   Everything here is scoped to .zs-ab-* elements, so this file is a no-op
   on any page that does not contain the About page markup.
   ========================================================================== */

(function () {
  "use strict";

  var page = document.querySelector(".zs-ab-page");
  if (!page) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---- shared: single rAF-throttled scroll/resize dispatcher ---- */
  var scrollCallbacks = [];
  var ticking = false;

  function onFrame() {
    ticking = false;
    scrollCallbacks.forEach(function (fn) { fn(); });
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onFrame);
    }
  }

  function registerScroll(fn) {
    scrollCallbacks.push(fn);
    fn();
  }

  if (!reduceMotion) {
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* ---- shared: reveal children [data-reveal] once in view ---- */
  function revealChildren(root, threshold) {
    if (!root) return;
    var targets = root.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (reduceMotion || !hasIO) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: threshold || 0.2 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---- shared: observe a NodeList, add is-in once each enters, run callback ---- */
  function revealEach(list, threshold, onEnter) {
    if (!list || !list.length) return;

    if (reduceMotion || !hasIO) {
      list.forEach(function (el, i) {
        el.classList.add("is-in");
        if (onEnter) onEnter(el, i);
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          if (onEnter) onEnter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: threshold || 0.2 });

    list.forEach(function (el) { observer.observe(el); });
  }

  /* ==========================================================================
     01 — MANIFESTO HERO
     ========================================================================== */

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;

    var words = hero.querySelectorAll("[data-word]");
    var img = hero.querySelector(".zs-ab-hero-image img");

    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add("is-loaded"); }, 80);
    });

    if (reduceMotion) return;

    registerScroll(function () {
      var rect = hero.getBoundingClientRect();
      var progress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);

      /* stay hands-off while resting at the top so the CSS entrance
         (fade + rise, triggered by .is-loaded) can play uninterrupted */
      if (progress <= 0.001) return;

      words.forEach(function (word, i) {
        var dir = i % 2 === 0 ? -1 : 1;
        var spread = 26 + i * 10;
        var ty = progress * spread * dir;
        var fade = 1 - clamp(progress * 1.5, 0, 1) * 0.7;
        word.style.transform = "translateY(" + ty + "px)";
        word.style.opacity = String(clamp(fade, 0.3, 1));
      });

      if (img) {
        var scale = 1.06 - progress * 0.06;
        img.style.transform = "scale(" + scale + ")";
      }
    });
  }

  /* ==========================================================================
     02 — UNFOLDING STORY (fold-open panels)
     ========================================================================== */

  function initFold() {
    var fold = document.querySelector("[data-fold]");
    if (!fold) return;

    revealChildren(fold.closest(".zs-ab-story"), 0.15);

    var panels = fold.querySelectorAll("[data-fold-panel]");
    revealEach(panels, 0.25);
  }

  /* ==========================================================================
     03 — INSIDE THE MIND OF Z&S (kinetic typography)
     ========================================================================== */

  function initMind() {
    var section = document.querySelector(".zs-ab-mind");
    if (!section) return;

    revealChildren(section, 0.2);

    var words = section.querySelectorAll("[data-mind-word]");
    revealEach(words, 0.4);
  }

  /* ==========================================================================
     04 — THE PACKAGING MACHINE (pinned horizontal production line)
     ========================================================================== */

  function initMachine() {
    var wrapper = document.querySelector("[data-machine]");
    if (!wrapper) return;

    var pin = wrapper.querySelector("[data-machine-pin]");
    var track = wrapper.querySelector("[data-machine-track]");
    var ruler = wrapper.querySelector("[data-machine-ruler]");
    var stages = wrapper.querySelectorAll("[data-machine-stage]");

    revealChildren(pin, 0.3);

    /* fallback / small screens: reveal stages in place, no scroll-jack */
    revealEach(stages, 0.3, function (el) { el.classList.add("is-active"); });

    var isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduceMotion || isMobile || !track) return;

    registerScroll(function () {
      var isMobileNow = window.matchMedia("(max-width: 767px)").matches;
      if (isMobileNow) {
        track.style.transform = "";
        return;
      }

      var rect = wrapper.getBoundingClientRect();
      var scrollable = rect.height - window.innerHeight;
      var progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;

      var maxTranslate = Math.max(track.scrollWidth - pin.clientWidth, 0);
      track.style.transform = "translateX(-" + (progress * maxTranslate) + "px)";

      if (ruler) ruler.style.width = (progress * 100) + "%";

      var activeIndex = Math.min(stages.length - 1, Math.floor(progress * stages.length));
      stages.forEach(function (stage, i) {
        stage.classList.toggle("is-active", i === activeIndex || (progress >= 0.98 && i === stages.length - 1));
      });
    });
  }

  /* ==========================================================================
     05 — STANDARDS MATRIX (expandable rows, touch support)
     ========================================================================== */

  function initMatrix() {
    var section = document.querySelector(".zs-ab-matrix");
    if (!section) return;

    revealChildren(section, 0.15);

    var rows = section.querySelectorAll("[data-matrix-row]");
    rows.forEach(function (row) {
      row.setAttribute("aria-expanded", "false");

      function toggle() {
        var open = row.classList.toggle("is-open");
        row.setAttribute("aria-expanded", open ? "true" : "false");
      }

      row.addEventListener("click", toggle);
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ==========================================================================
     06 — PACKAGING ARCHIVE (editorial collage)
     ========================================================================== */

  function initArchive() {
    var section = document.querySelector(".zs-ab-archive");
    if (!section) return;

    revealChildren(section, 0.15);

    var items = section.querySelectorAll("[data-reveal-archive]");
    revealEach(items, 0.15);
  }

  /* ==========================================================================
     07 — WHY Z&S (typographic wall, depth parallax)
     ========================================================================== */

  function initWhy() {
    var section = document.querySelector(".zs-ab-why");
    if (!section) return;

    revealChildren(section, 0.2);

    var mark = section.querySelector("[data-why-mark]");
    var tags = section.querySelectorAll("[data-why-tag]");

    if (reduceMotion) return;

    registerScroll(function () {
      var isSmall = window.matchMedia("(max-width: 767px)").matches;
      if (isSmall) return;

      var rect = section.getBoundingClientRect();
      var center = rect.top + rect.height / 2 - window.innerHeight / 2;

      if (mark) {
        var markShift = clamp(-center * 0.05, -40, 40);
        mark.style.transform = "translate(-50%, calc(-50% + " + markShift + "px))";
      }

      tags.forEach(function (tag) {
        var speed = parseFloat(tag.style.getPropertyValue("--speed")) || 0.3;
        var shift = clamp(-center * speed * 0.06, -30, 30);
        tag.style.transform = "translateY(" + shift + "px)";
      });
    });
  }

  /* ==========================================================================
     08 — FINAL REVEAL
     ========================================================================== */

  function initFuture() {
    var section = document.querySelector(".zs-ab-future");
    if (!section) return;

    revealChildren(section, 0.2);

    if (reduceMotion || !hasIO) {
      section.classList.add("is-in");
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          section.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(section);
  }

  /* ==========================================================================
     INIT
     ========================================================================== */

  function initAboutPage() {
    initHero();
    initFold();
    initMind();
    initMachine();
    initMatrix();
    initArchive();
    initWhy();
    initFuture();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAboutPage);
  } else {
    initAboutPage();
  }
})();

/* ==========================================================================
   Z&S HOME PAGE — SECTION ANIMATIONS
   Consolidated from assets/js/home/*.js during architecture cleanup.
   Each block is a self-contained, page-scoped IIFE (no-op if its root
   element isn't present), so loading this on any page is safe.
   ========================================================================== */

/* ==========================================================================
   Z&S HOME — HERO SECTION SCRIPT
   Isolated: only touches .zs-h-hero and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initHero() {
    var hero = document.querySelector(".zs-h-hero");
    if (!hero) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Play entrance sequence.
    if (reduceMotion) {
      hero.classList.add("is-loaded");
    } else {
      requestAnimationFrame(function () {
        setTimeout(function () {
          hero.classList.add("is-loaded");
        }, 80);
      });
    }

    // Subtle floating parallax on the hero visual, tied to scroll position.
    if (!reduceMotion) {
      var stackEl = hero.querySelector(".zs-h-stack");

      if (stackEl) {
        var ticking = false;

        var updateParallax = function () {
          var rect = hero.getBoundingClientRect();
          var progress = 1 - Math.min(Math.max(rect.bottom / (window.innerHeight + rect.height), 0), 1);
          var offset = (progress - 0.5) * 22;
          stackEl.style.setProperty("--zs-h-float-y", offset.toFixed(1) + "px");
          ticking = false;
        };

        updateParallax();

        window.addEventListener("scroll", function () {
          if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
          }
        }, { passive: true });

        window.addEventListener("resize", updateParallax);
      }

      // Subtle cursor-driven tilt on the layered image stack — fine pointers only,
      // capped to a few pixels so it never reads as aggressive cursor-following.
      var visual = hero.querySelector(".zs-h-visual");
      var hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      if (stackEl && visual && hasFinePointer) {
        var tiltTicking = false;
        var pendingX = 0;

        var applyTilt = function () {
          stackEl.style.setProperty("--zs-h-tilt-x", pendingX.toFixed(1) + "px");
          tiltTicking = false;
        };

        visual.addEventListener("mousemove", function (e) {
          var rect = visual.getBoundingClientRect();
          var relX = (e.clientX - rect.left) / rect.width - 0.5;
          pendingX = relX * 14;

          if (!tiltTicking) {
            requestAnimationFrame(applyTilt);
            tiltTicking = true;
          }
        });

        visual.addEventListener("mouseleave", function () {
          pendingX = 0;
          requestAnimationFrame(applyTilt);
        });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHero);
  } else {
    initHero();
  }
})();

/* ==========================================================================
   Z&S HOME — INTRODUCTION SECTION SCRIPT
   Isolated: only touches .zs-in-intro and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initIntro() {
    var section = document.querySelector(".zs-in-intro");
    if (!section) return;

    var targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIntro);
  } else {
    initIntro();
  }
})();

/* ==========================================================================
   Z&S HOME — WHAT WE MAKE SECTION SCRIPT
   Isolated: only touches .zs-make-section and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initMake() {
    var section = document.querySelector(".zs-make-section");
    if (!section) return;

    var targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMake);
  } else {
    initMake();
  }
})();

/* ==========================================================================
   Z&S HOME — PACKAGING SOLUTIONS SECTION SCRIPT
   Isolated: only touches .zs-sol-solutions and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initSolutionsReveal(section) {
    var targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  function initSolutions() {
    var section = document.querySelector(".zs-sol-solutions");
    if (!section) return;

    initSolutionsReveal(section);

    var items = section.querySelectorAll(".zs-sol-item");
    var images = section.querySelectorAll(".zs-sol-stage-photo img");
    var captionText = section.querySelector("[data-sol-caption]");
    var dots = section.querySelectorAll(".zs-sol-dot");
    if (!items.length || !images.length) return;

    function activate(index) {
      items.forEach(function (item, i) {
        item.classList.toggle("is-active", i === index);
        item.setAttribute("aria-expanded", i === index ? "true" : "false");
      });

      images.forEach(function (img, i) {
        img.classList.toggle("is-active", i === index);
      });

      if (dots.length) {
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      if (captionText) {
        captionText.textContent = items[index].getAttribute("data-caption") || "";
      }
    }

    items.forEach(function (item, index) {
      item.addEventListener("mouseenter", function () { activate(index); });
      item.addEventListener("focus", function () { activate(index); });
      item.addEventListener("click", function () { activate(index); });
    });

    activate(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSolutions);
  } else {
    initSolutions();
  }
})();

/* ==========================================================================
   Z&S HOME — INDUSTRIES SECTION SCRIPT
   Isolated: only touches .zs-ind-industries and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initIndustriesReveal(section) {
    var targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  function initIndustries() {
    var section = document.querySelector(".zs-ind-industries");
    if (!section) return;

    initIndustriesReveal(section);

    var buttons = section.querySelectorAll(".zs-ind-tag");
    var images = section.querySelectorAll(".zs-ind-media img");
    var caption = section.querySelector("[data-ind-caption]");
    var desc = section.querySelector("[data-ind-desc]");
    var indexLabel = section.querySelector("[data-ind-index]");
    if (!buttons.length || !images.length) return;

    function activate(index) {
      buttons.forEach(function (btn, i) {
        var isActive = i === index;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      images.forEach(function (img, i) {
        img.classList.toggle("is-active", i === index);
      });

      var active = buttons[index];
      if (caption) caption.textContent = active.getAttribute("data-industry") || "";
      if (desc) desc.textContent = active.getAttribute("data-desc") || "";
      if (indexLabel) {
        indexLabel.textContent = String(index + 1).padStart(2, "0");
      }
    }

    buttons.forEach(function (btn, index) {
      btn.addEventListener("click", function () { activate(index); });
    });

    activate(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIndustries);
  } else {
    initIndustries();
  }
})();

/* ==========================================================================
   Z&S HOME — PACKAGING STRUCTURE SECTION SCRIPT
   Isolated: only touches .zs-struct-section and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initStruct() {
    var section = document.querySelector(".zs-struct-section");
    if (!section) return;

    var targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStruct);
  } else {
    initStruct();
  }
})();

/* ==========================================================================
   Z&S HOME — GALLERY PREVIEW SECTION SCRIPT
   Isolated: only touches .zs-glp-section and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initGalleryPreview() {
    var section = document.querySelector(".zs-glp-section");
    if (!section) return;

    var targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGalleryPreview);
  } else {
    initGalleryPreview();
  }
})();

/* ==========================================================================
   Z&S HOME — LUCIDE ICONS (capability labels)
   Isolated: only runs when .zs-h-hero is present (i.e. on the homepage),
   and only touches icon rendering — no layout or animation side effects.
   ========================================================================== */

(function () {
  "use strict";

  function initHomeIcons() {
    if (!document.querySelector(".zs-h-hero")) return;
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeIcons);
  } else {
    initHomeIcons();
  }
})();

/* ==========================================================================
   Z&S HOME — WHY Z&S SECTION SCRIPT
   Isolated: only touches .zs-why-section and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initWhy() {
    var section = document.querySelector(".zs-why-section");
    if (!section) return;

    var targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhy);
  } else {
    initWhy();
  }
})();

/* ==========================================================================
   Z&S HOME — PROCESS SECTION SCRIPT
   Isolated: only touches .zs-proc-process and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initProcess() {
    var section = document.querySelector(".zs-proc-process");
    if (!section) return;

    var track = section.querySelector(".zs-proc-track");
    if (!track) return;

    if (!("IntersectionObserver" in window)) {
      track.classList.add("is-in");
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          track.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(track);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProcess);
  } else {
    initProcess();
  }
})();

/* ==========================================================================
   Z&S HOME — INDUSTRIAL SHOWCASE SECTION SCRIPT
   Isolated: only touches .zs-show-showcase and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initShowcase() {
    var section = document.querySelector(".zs-show-showcase");
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-in");
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          section.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShowcase);
  } else {
    initShowcase();
  }
})();

/* ==========================================================================
   Z&S HOME — FINAL CTA SECTION SCRIPT
   Isolated: only touches .zs-cta-section and its children.
   ========================================================================== */

(function () {
  "use strict";

  function initCta() {
    var section = document.querySelector(".zs-cta-section");
    if (!section) return;

    var targets = section.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCta);
  } else {
    initCta();
  }
})();

/* ==========================================================================
   Z&S PRODUCTS PAGE 
   ========================================================================== */

(function () {
  "use strict";

  var productsRoot = document.querySelector(".zs-products");
  if (!productsRoot) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---------------- hero entrance ---------------- */

  var hero = productsRoot.querySelector(".zs-products-hero");
  if (hero) {
    if (reduceMotion) {
      hero.classList.add("is-loaded");
    } else {
      requestAnimationFrame(function () {
        setTimeout(function () { hero.classList.add("is-loaded"); }, 60);
      });
    }
  }

  /* ---------------- generic scroll reveal ([data-reveal]) ---------------- */

  var revealTargets = productsRoot.querySelectorAll("[data-reveal]");
  if (revealTargets.length) {
    if (reduceMotion || !hasIO) {
      revealTargets.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealTargets.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------------- hero 3D stage — pointer-driven layer separation ---------------- */

  var stage = productsRoot.querySelector("#zsHeroStage");
  if (stage && !reduceMotion && window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    var stage3d = stage.querySelector(".zs-stage-3d");
    stage.addEventListener("mousemove", function (e) {
      var rect = stage.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;   // 0..1
      var py = (e.clientY - rect.top) / rect.height;    // 0..1
      var rotY = (px - 0.5) * 14;
      var rotX = (0.5 - py) * 10;
      if (stage3d) {
        stage3d.style.transform = "rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
      }
      stage.classList.add("is-active");
    });
    stage.addEventListener("mouseleave", function () {
      if (stage3d) stage3d.style.transform = "";
      stage.classList.remove("is-active");
    });
  }

  /* ---------------- structure explorer ---------------- */

  var explorerItems = productsRoot.querySelectorAll(".zs-explorer-item");
  var structurePanels = productsRoot.querySelectorAll(".zs-structure-panel");

  function activateStructure(key, focusPanel) {
    explorerItems.forEach(function (btn) {
      var isMatch = btn.getAttribute("data-structure") === key;
      btn.classList.toggle("is-active", isMatch);
      btn.setAttribute("aria-selected", isMatch ? "true" : "false");
    });
    structurePanels.forEach(function (panel) {
      var isMatch = panel.getAttribute("data-panel") === key;
      if (isMatch) {
        panel.hidden = false;
        panel.classList.add("is-active");
        panel.classList.remove("is-entering");
        // restart the assembly animation
        void panel.offsetWidth;
        panel.classList.add("is-entering");
      } else {
        panel.hidden = true;
        panel.classList.remove("is-active", "is-entering");
      }
    });
    if (focusPanel) {
      var explorerSection = document.getElementById("zs-structure-explorer");
      if (explorerSection) {
        var top = explorerSection.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
  }

  explorerItems.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activateStructure(btn.getAttribute("data-structure"), false);
    });
  });

  /* ---------------- industry rail ---------------- */

  var industryButtons = productsRoot.querySelectorAll(".zs-industry-btn");
  var industryFrames = productsRoot.querySelectorAll(".zs-industry-frame");

  industryButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-industry");
      industryButtons.forEach(function (b) {
        var match = b === btn;
        b.classList.toggle("is-active", match);
        b.setAttribute("aria-selected", match ? "true" : "false");
      });
      industryFrames.forEach(function (frame) {
        frame.classList.toggle("is-active", frame.getAttribute("data-industry-panel") === key);
      });
    });
  });

  /* ---------------- print & branding "desk" ---------------- */

  var printItems = productsRoot.querySelectorAll(".zs-print-item");
  var printPanels = productsRoot.querySelectorAll("[data-print-panel]");

  printItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var key = item.getAttribute("data-print");
      printItems.forEach(function (i) { i.classList.toggle("is-active", i === item); });
      printPanels.forEach(function (p) { p.hidden = p.getAttribute("data-print-panel") !== key; });
    });
    item.addEventListener("mouseenter", function () { item.classList.add("is-active"); });
  });

  /* ---------------- customization layer stack (scroll split) ---------------- */

  var layerVisual = productsRoot.querySelector(".zs-layer-stack-visual");
  if (layerVisual) {
    if (reduceMotion || !hasIO) {
      layerVisual.classList.add("is-split");
    } else {
      var layerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          layerVisual.classList.toggle("is-split", entry.isIntersecting);
        });
      }, { threshold: 0.4 });
      layerObserver.observe(layerVisual);
    }
  }

  /* ---------------- from flat to form (scroll-stepped) ---------------- */

  var flatFormStrip = productsRoot.querySelector(".zs-flat-form-strip");
  if (flatFormStrip) {
    var formFrames = flatFormStrip.querySelectorAll(".zs-flat-form-frame");
    var formStages = ["flat", "folded", "formed", "finished"];

    if (reduceMotion || !hasIO) {
      formFrames.forEach(function (f) { f.classList.add("is-active"); });
    } else {
      var formIndex = 0;
      function setFormStage(i) {
        formFrames.forEach(function (f) {
          f.classList.toggle("is-active", f.getAttribute("data-form-stage") === formStages[i]);
        });
      }
      setFormStage(0);

      var formTimer = null;
      var formObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            formTimer = setInterval(function () {
              formIndex = (formIndex + 1) % formStages.length;
              setFormStage(formIndex);
            }, 1900);
          } else if (formTimer) {
            clearInterval(formTimer);
            formTimer = null;
          }
        });
      }, { threshold: 0.5 });
      formObserver.observe(flatFormStrip);
    }
  }

  /* ---------------- which structure fits? ---------------- */

  var fitData = {
    greyboard: {
      name: "Grey Board Boxes",
      reason: "Rigid-style presentation boxes built for perceived value as much as protection — suited to jewellery, cosmetics and premium gifting.",
      image: "/assets/img/03-zs-jewellery-packaging-box.webp",
      link: "/contact.html?packaging=Grey%20Board%20Boxes#contact-form"
    },
    printed: {
      name: "Printed Cartons",
      reason: "A folded, glued paperboard carton that ships flat and assembles fast — the everyday structure behind most retail and product packaging.",
      image: "/assets/img/04-zs-printed-cartons.webp",
      link: "/contact.html?packaging=Printed%20Cartons#contact-form"
    },
    mailer: {
      name: "Mailer Boxes",
      reason: "Self-locking construction built for e-commerce, sized to the product to cut void fill and printed for a branded unboxing.",
      image: "/assets/img/02-zs-mailer-box.webp",
      link: "/contact.html?packaging=E-Commerce%20%2F%20Shipping%20Packaging#contact-form"
    },
    corrugated: {
      name: "Corrugated Boxes",
      reason: "Fluted corrugated board graded for the weight and protection a product needs — built for shipping, bulk and industrial packaging.",
      image: "/assets/img/02-zs-sealed-corrugated-box.webp",
      link: "/contact.html?packaging=Corrugated%20Boxes#contact-form"
    },
    diecut: {
      name: "Die-Cut Boxes",
      reason: "Cut and creased in-house to an exact, non-standard shape — the structure, not just the print, is built around the product.",
      image: "/assets/img/03-zs-custom-die-cut-packaging.webp",
      link: "/contact.html?packaging=Die-Cut%20Boxes#contact-form"
    }
  };

  var fitButtons = productsRoot.querySelectorAll(".zs-fit-btn");
  var fitNameEl = productsRoot.querySelector("[data-fit-name]");
  var fitReasonEl = productsRoot.querySelector("[data-fit-reason]");
  var fitImageEl = productsRoot.querySelector("[data-fit-image]");
  var fitCtaEl = productsRoot.querySelector("[data-fit-cta]");

  fitButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-fit");
      var data = fitData[key];
      if (!data) return;

      fitButtons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });

      if (fitImageEl) {
        fitImageEl.style.opacity = 0;
        setTimeout(function () {
          fitImageEl.src = data.image;
          fitImageEl.alt = data.name;
          fitImageEl.style.opacity = 1;
        }, reduceMotion ? 0 : 180);
      }
      if (fitNameEl) fitNameEl.textContent = data.name;
      if (fitReasonEl) fitReasonEl.textContent = data.reason;
      if (fitCtaEl) fitCtaEl.setAttribute("href", data.link);
    });
  });

  /* ---------------- product directory: search + filter + link-through ---------------- */

  var dirSearch = productsRoot.querySelector("#zs-directory-search");
  var dirFilterButtons = productsRoot.querySelectorAll(".zs-directory-filter-btn");
  var dirRows = productsRoot.querySelectorAll(".zs-directory-row");
  var dirEmpty = productsRoot.querySelector(".zs-directory-empty");
  var activeDirFilter = "all";

  function applyDirectoryFilter() {
    var query = dirSearch ? dirSearch.value.trim().toLowerCase() : "";
    var visibleCount = 0;

    dirRows.forEach(function (row) {
      var cat = row.getAttribute("data-dir-cat");
      var name = row.getAttribute("data-dir-name") || "";
      var matchesFilter = activeDirFilter === "all" || cat === activeDirFilter;
      var matchesSearch = !query || name.indexOf(query) !== -1;
      var visible = matchesFilter && matchesSearch;
      row.classList.toggle("is-filtered-out", !visible);
      if (visible) visibleCount++;
    });

    if (dirEmpty) dirEmpty.hidden = visibleCount !== 0;
  }

  if (dirSearch) {
    dirSearch.addEventListener("input", applyDirectoryFilter);
  }

  dirFilterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeDirFilter = btn.getAttribute("data-dir-filter");
      dirFilterButtons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      applyDirectoryFilter();
    });
  });

  function goToDirectoryRow(row) {
    var structureTarget = row.getAttribute("data-dir-target");
    var printTarget = row.getAttribute("data-dir-panel");

    if (structureTarget) {
      activateStructure(structureTarget, true);
      return;
    }

    if (printTarget) {
      var notJustBoxes = document.getElementById("zs-not-just-boxes");
      if (notJustBoxes) {
        var top = notJustBoxes.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      }
      var matchingItem = productsRoot.querySelector('.zs-print-item[data-print="' + printTarget + '"]');
      if (matchingItem) matchingItem.click();
    }
  }

  dirRows.forEach(function (row) {
    row.addEventListener("click", function () { goToDirectoryRow(row); });
    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToDirectoryRow(row);
      }
    });
  });

  /* ---------------- final CTA — draw the outline once in view ---------------- */

  var ctaSection = productsRoot.querySelector(".zs-products-cta");
  if (ctaSection) {
    if (reduceMotion || !hasIO) {
      ctaSection.classList.add("is-in");
    } else {
      var ctaObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      ctaObserver.observe(ctaSection);
    }
  }

})();

/* ==========================================================================
   CONTACT PAGE (contact.html)
   Presentational scroll-reveal + hover/parallax effects only.
   Multi-step form logic and validation live in main.js.
   ========================================================================== */

(function () {
  "use strict";

  var contactRoot = document.querySelector(".zs-contact");
  if (!contactRoot) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealChildren(root, threshold) {
    if (!root) return;
    var targets = root.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: threshold || 0.2 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  function revealSelf(el, threshold) {
    if (!el) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: threshold || 0.25 });

    observer.observe(el);
  }

  /* ---- 01 — hero: line reveal (CSS-driven) + subtle cursor tilt on the desk visual ---- */

  function initContactHero() {
    var hero = contactRoot.querySelector(".zs-contact-hero");
    if (!hero) return;

    revealChildren(hero, 0.2);

    var desk = document.getElementById("zsContactDesk");
    if (!desk || reduceMotion || !window.matchMedia("(hover: hover)").matches) return;

    var rect = null;
    var raf = null;

    function onMove(e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        rect = desk.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        var rx = (-py * 6).toFixed(2);
        var ry = (px * 8).toFixed(2);
        desk.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
        raf = null;
      });
    }

    function onLeave() {
      desk.style.transform = "rotateX(0deg) rotateY(0deg)";
    }

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
  }

  /* ---- 02 — contact console: staggered reveal ---- */

  function initContactConsole() {
    var section = contactRoot.querySelector(".zs-contact-console");
    if (!section) return;
    revealChildren(section, 0.25);
  }

  /* ---- 03 — form panel: reveal only (interactivity handled in main.js) ---- */

  function initContactFormReveal() {
    var section = contactRoot.querySelector(".zs-contact-form-section");
    if (!section) return;
    revealChildren(section, 0.1);
  }

  /* ---- 04 — process: scroll-linked line draw + sequential step activation ---- */

  function initContactProcess() {
    var track = document.getElementById("zsContactProcessTrack");
    if (!track) return;

    var fill = track.querySelector(".zs-contact-process-line-fill");
    var steps = track.querySelectorAll(".zs-contact-process-step");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      if (fill) fill.style.width = "100%";
      steps.forEach(function (s) { s.classList.add("is-active"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (fill) fill.style.width = "100%";
        steps.forEach(function (step, i) {
          window.setTimeout(function () { step.classList.add("is-active"); }, i * 160);
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    observer.observe(track);
  }

  /* ---- 05 — direct contact lines: staggered reveal ---- */

  function initContactDirect() {
    var section = contactRoot.querySelector(".zs-contact-direct");
    if (!section) return;
    revealChildren(section, 0.2);
  }

  /* ---- 06 — map panel: mask reveal on enter ---- */

  function initContactMap() {
    var info = contactRoot.querySelector(".zs-contact-map-info");
    var panel = contactRoot.querySelector(".zs-contact-map-panel");
    if (info) revealSelf(info, 0.2);
    if (!panel) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      panel.classList.add("is-in");
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(panel);
  }

  /* ---- 07 — CTA: clip-path image reveal + gentle scroll depth ---- */

  function initContactCta() {
    var cta = contactRoot.querySelector(".zs-contact-cta");
    if (!cta) return;

    revealSelf(cta, 0.25);
    revealChildren(cta, 0.25);

    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;

    var media = cta.querySelector(".zs-contact-cta-media img");
    if (!media) return;

    var ticking = false;

    function updateParallax() {
      var rect = cta.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;

      if (rect.bottom > 0 && rect.top < vh) {
        var progress = (vh - rect.top) / (vh + rect.height);
        var shift = (progress - 0.5) * 30;
        media.style.transform = "translateY(" + shift.toFixed(1) + "px) scale(1.08)";
      }

      ticking = false;
    }

    updateParallax();

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateParallax);
    }, { passive: true });
  }

  function initContactPage() {
    initContactHero();
    initContactConsole();
    initContactFormReveal();
    initContactProcess();
    initContactDirect();
    initContactMap();
    initContactCta();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactPage);
  } else {
    initContactPage();
  }

})();

/* ==========================================================================
   FAQ PAGE (faq.html)
   Everything here is scoped to .zs-faq-* elements, so this file is a
   no-op on any page that does not contain the FAQ page markup.
   ========================================================================== */

(function () {
  "use strict";

  var faqRoot = document.querySelector(".zs-faq");
  if (!faqRoot) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealChildren(root, threshold) {
    if (!root) return;
    var targets = root.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: threshold || 0.2 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  function initFaqHero() {
    var hero = faqRoot.querySelector(".zs-faq-hero");
    if (!hero) return;
    revealChildren(hero, 0.2);

    /* floating question fragments — subtle cursor-responsive depth */
    var fragments = hero.querySelectorAll(".zs-faq-fragment");
    var canParallax = !reduceMotion && fragments.length &&
      window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canParallax) return;

    var depths = [0.5, 0.85, 0.35, 0.65, 0.55, 0.75];
    var ticking = false, lastX = 0.5, lastY = 0.5;

    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      lastX = (e.clientX - rect.left) / rect.width - 0.5;
      lastY = (e.clientY - rect.top) / rect.height - 0.5;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          fragments.forEach(function (frag, i) {
            var depth = depths[i % depths.length];
            frag.style.transform = "translate(" + (lastX * 14 * depth).toFixed(1) + "px, " + (lastY * 14 * depth).toFixed(1) + "px)";
          });
          ticking = false;
        });
      }
    });

    hero.addEventListener("mouseleave", function () {
      fragments.forEach(function (frag) { frag.style.transform = "translate(0, 0)"; });
    });
  }

  function initFaqVisual() {
    var section = faqRoot.querySelector(".zs-faq-visual");
    if (!section) return;
    revealChildren(section, 0.25);
  }

  function initFaqMap() {
    var section = faqRoot.querySelector(".zs-faq-map");
    if (!section) return;
    revealChildren(section, 0.2);
  }

  function initFaqProcess() {
    var track = faqRoot.querySelector(".zs-faq-process-track");
    if (!track) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      track.classList.add("is-in");
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(track);
  }

  function initFaqCta() {
    var cta = faqRoot.querySelector(".zs-faq-cta");
    if (!cta) return;
    revealChildren(cta, 0.25);
  }

  function initFaqPage() {
    initFaqHero();
    initFaqVisual();
    initFaqMap();
    initFaqProcess();
    initFaqCta();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFaqPage);
  } else {
    initFaqPage();
  }

})();
