/* ==========================================================================
   Z&S Enterprises — Premium Footer behavior
   Standalone, dependency-free. Copy this whole file into your project.

   IMPORTANT: the footer markup is injected asynchronously (fetched and
   inserted into #footer-container by main.js), so this file must NOT run
   its setup immediately on script load — at that point #zsFooter and its
   children don't exist in the DOM yet. Instead it exposes window.initFooter,
   which main.js calls right after the fetched footer.html is injected
   (same pattern main.js already uses for window.initNavbar).
   ========================================================================== */
window.initFooter = function () {
  "use strict";

  var footer          = document.getElementById("zsFooter");
  var backToTop       = document.getElementById("zsBackToTop");
  var footerBottomBar = document.querySelector(".zs-footer-bottom");
  var colToggles      = document.querySelectorAll(".zs-footer-col-toggle");

  /* ----------------------------------------------------------------- */
  /* 1. Reveal-on-scroll — fades the footer's sections in with a        */
  /*    stagger (delay set per-element via the --d inline CSS var)      */
  /* ----------------------------------------------------------------- */
  if ("IntersectionObserver" in window && footer) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          footer.classList.add("is-visible");
          revealObserver.disconnect();
        }
      });
    }, { threshold: 0.12 });

    revealObserver.observe(footer);
  } else if (footer) {
    // No IntersectionObserver support — just show everything
    footer.classList.add("is-visible");
  }

  /* ----------------------------------------------------------------- */
  /* 2. Mobile accordion columns (Company / Solutions / Industries)     */
  /*    Only visually active under the 640px breakpoint — the CSS       */
  /*    forces columns open above that width regardless of this state. */
  /* ----------------------------------------------------------------- */
  function setColumnState(toggle, open) {
    var body = toggle.nextElementSibling;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");

    if (open) {
      body.classList.add("is-open");
      body.style.maxHeight = body.scrollHeight + "px";
    } else {
      body.classList.remove("is-open");
      body.style.maxHeight = "0px";
    }
  }

  colToggles.forEach(function (toggle) {
    // Only clickable below the accordion breakpoint — a no-op tap on
    // desktop/tablet does nothing since the CSS keeps content expanded.
    toggle.addEventListener("click", function () {
      if (window.innerWidth > 640) return;
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      setColumnState(toggle, !isOpen);
    });
  });

  // Recalculate open panels' heights on resize (e.g. text reflow, rotation)
  window.addEventListener("resize", function () {
    colToggles.forEach(function (toggle) {
      if (toggle.getAttribute("aria-expanded") === "true") {
        var body = toggle.nextElementSibling;
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* ----------------------------------------------------------------- */
  /* 3. Back-to-top button                                              */
  /*    Also lifts above the footer's copyright bar as it scrolls into  */
  /*    view, so the button never sits on top of the legal links.        */
  /* ----------------------------------------------------------------- */
  var SHOW_THRESHOLD = window.innerHeight * 0.8;
  var REST_GAP = 16; // gap kept above the footer bottom bar
  var BASE_OFFSET = 22; // default distance from the viewport bottom
  var ticking = false;

  function updateBackToTop() {
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > SHOW_THRESHOLD);

      if (footerBottomBar) {
        var rect = footerBottomBar.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          var lifted = (window.innerHeight - rect.top) + REST_GAP;
          backToTop.style.bottom = Math.max(lifted, BASE_OFFSET) + "px";
        } else {
          backToTop.style.bottom = BASE_OFFSET + "px";
        }
      }
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateBackToTop);
      ticking = true;
    }
  }, { passive: true });

  updateBackToTop();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

};
