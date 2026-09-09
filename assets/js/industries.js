/* ==========================================================================
   Z&S ENTERPRISES — INDUSTRIES PAGE (SCOPED)
   Self-contained, no-op on every other page. Everything queries inside
   .zs-ind-page so this file cannot touch markup on other pages.
   ========================================================================== */

(function () {
  "use strict";

  var page = document.querySelector(".zs-ind-page");
  if (!page) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---------------------------------------------------------------------
     Generic [data-reveal] observer (shared CSS lives in style.css)
     --------------------------------------------------------------------- */
  (function initReveal() {
    var targets = page.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!hasIO || reduceMotion) {
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
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });

    targets.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     Generic .is-in trigger for whole sections (statement, spotlights,
     why-section, final CTA) driven by [data-observe-section]
     --------------------------------------------------------------------- */
  (function initSectionTriggers() {
    var sections = page.querySelectorAll("[data-observe-section]");
    if (!sections.length) return;

    if (!hasIO || reduceMotion) {
      sections.forEach(function (el) { el.classList.add("is-in"); });
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

    sections.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     HERO — constellation entrance
     --------------------------------------------------------------------- */
  (function initHero() {
    var hero = page.querySelector(".zs-ind-hero");
    if (!hero) return;
    // Slight delay so the page paints first, then the network animates in.
    requestAnimationFrame(function () {
      setTimeout(function () { page.classList.add("is-loaded"); }, 60);
    });
  })();

  /* ---------------------------------------------------------------------
     NAVIGATOR — search + filter + scroll-to
     --------------------------------------------------------------------- */
  (function initNavigator() {
    var nav = page.querySelector(".zs-ind-navigator");
    if (!nav) return;

    var search = nav.querySelector(".zs-ind-search");
    var filterBtns = nav.querySelectorAll(".zs-ind-filter-btn");
    var rows = nav.querySelectorAll(".zs-ind-nav-row");
    var empty = nav.querySelector(".zs-ind-navigator-empty");
    var activeFilter = "all";

    function applyFilters() {
      var term = (search && search.value ? search.value : "").trim().toLowerCase();
      var visibleCount = 0;

      rows.forEach(function (row) {
        var group = row.getAttribute("data-group") || "";
        var name = (row.getAttribute("data-name") || "").toLowerCase();
        var matchesFilter = activeFilter === "all" || group === activeFilter;
        var matchesSearch = !term || name.indexOf(term) !== -1;
        var visible = matchesFilter && matchesSearch;
        row.classList.toggle("is-hidden", !visible);
        if (visible) visibleCount++;
      });

      if (empty) empty.classList.toggle("is-visible", visibleCount === 0);
    }

    if (search) search.addEventListener("input", applyFilters);

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        activeFilter = btn.getAttribute("data-filter") || "all";
        applyFilters();
      });
    });

    rows.forEach(function (row) {
      row.addEventListener("click", function () {
        var targetSel = row.getAttribute("data-target");
        if (!targetSel) return;
        var targetEl = document.querySelector(targetSel);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          targetEl.classList.add("is-jump-target");
          setTimeout(function () { targetEl.classList.remove("is-jump-target"); }, 1400);
        }
      });
    });
  })();

  /* ---------------------------------------------------------------------
     CAPABILITY MATRIX — hover/focus swaps preview image
     --------------------------------------------------------------------- */
  (function initCapMatrix() {
    var matrix = page.querySelector(".zs-ind-capmatrix");
    if (!matrix) return;

    var rows = matrix.querySelectorAll(".zs-ind-capmatrix-row");
    var previewImgs = matrix.querySelectorAll(".zs-ind-capmatrix-preview img");
    var previewLabel = matrix.querySelector(".zs-ind-capmatrix-preview-label");

    function activate(row) {
      rows.forEach(function (r) { r.classList.remove("is-active"); });
      row.classList.add("is-active");
      var key = row.getAttribute("data-img");
      previewImgs.forEach(function (img) {
        img.classList.toggle("is-visible", img.getAttribute("data-key") === key);
      });
      if (previewLabel) previewLabel.textContent = row.getAttribute("data-name") || "";
    }

    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () { activate(row); });
      row.addEventListener("focus", function () { activate(row); });
      // Touch devices don't fire mouseenter, so tapping a row needs its
      // own handler or the preview image never switches away from the
      // first row while scrolling through the table on mobile/tablet.
      row.addEventListener("click", function () { activate(row); });
    });

    if (rows.length) activate(rows[0]);
  })();

  /* ---------------------------------------------------------------------
     BRANDS TICKER — pause control + click-to-highlight
     --------------------------------------------------------------------- */
  (function initBrands() {
    var section = page.querySelector(".zs-ind-brands");
    if (!section) return;

    var track = section.querySelector(".zs-ind-brands-track");
    var pauseBtn = section.querySelector(".zs-ind-brands-pause");
    var names = section.querySelectorAll(".zs-ind-brand-name");
    var paused = reduceMotion;

    if (track && paused) track.classList.add("is-paused");

    if (pauseBtn && track) {
      pauseBtn.addEventListener("click", function () {
        paused = !paused;
        track.classList.toggle("is-paused", paused);
        pauseBtn.textContent = paused ? "Play" : "Pause";
        pauseBtn.setAttribute("aria-pressed", String(paused));
      });
    }

    names.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var already = btn.classList.contains("is-active");
        names.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        if (!already) {
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");
        }
      });
    });
  })();

  /* ---------------------------------------------------------------------
     TICKER — "and the list goes on" pause on hover/focus
     --------------------------------------------------------------------- */
  (function initTicker() {
    var wrap = page.querySelector(".zs-ind-ticker-wrap");
    if (!wrap) return;
    var track = wrap.querySelector(".zs-ind-ticker");
    if (!track) return;

    if (reduceMotion) track.classList.add("is-paused");

    ["mouseenter", "focusin"].forEach(function (evt) {
      wrap.addEventListener(evt, function () { track.classList.add("is-paused"); });
    });
    ["mouseleave", "focusout"].forEach(function (evt) {
      wrap.addEventListener(evt, function () {
        if (!reduceMotion) track.classList.remove("is-paused");
      });
    });

    track.querySelectorAll(".zs-ind-ticker-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetSel = btn.getAttribute("data-target");
        if (!targetSel) return;
        var targetEl = document.querySelector(targetSel);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }
      });
    });
  })();

  /* ---------------------------------------------------------------------
     JOURNEY — sequential stage activation on scroll
     --------------------------------------------------------------------- */
  (function initJourney() {
    var section = page.querySelector(".zs-ind-journey");
    if (!section) return;

    var steps = section.querySelectorAll(".zs-ind-journey-step");
    var bar = section.querySelector(".zs-ind-journey-bar");
    if (!steps.length) return;

    if (!hasIO || reduceMotion) {
      steps.forEach(function (s) { s.classList.add("is-active"); });
      if (bar) bar.style.width = "100%";
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        steps.forEach(function (step, i) {
          setTimeout(function () {
            step.classList.add("is-active");
            if (bar) bar.style.width = (((i + 1) / steps.length) * 100) + "%";
          }, i * 160);
        });
        obs.disconnect();
      });
    }, { threshold: 0.4 });

    observer.observe(section);
  })();

  /* ---------------------------------------------------------------------
     ARCHIVE — catalogued reveal for each tile
     --------------------------------------------------------------------- */
  (function initArchive() {
    var grid = page.querySelector(".zs-ind-archive-grid");
    if (!grid) return;

    var tiles = grid.querySelectorAll(".zs-ind-archive-tile");

    if (!hasIO || reduceMotion) {
      tiles.forEach(function (t) { t.classList.add("is-in"); });
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

    tiles.forEach(function (t) { observer.observe(t); });
  })();

})();
