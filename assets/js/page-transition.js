/* ==========================================================================
   Z&S ENTERPRISES — PAGE-TO-PAGE TRANSITION CONTROLLER
   A smaller, faster echo of the entrance animation. On a qualifying
   internal link click: a brief panel sweep covers the current page,
   then a real browser navigation happens, then the same panels continue
   sweeping onward to reveal the new page. See assets/css/page-transition.css
   for the visual side and the inline bootstrap snippet in <head> (every
   page) that pre-paints the "covered" state on the incoming page so it
   never flashes blank white before this script runs.

   Included on every page. Designed to NEVER be able to block navigation:
     - default overlay CSS is inert (pointer-events: none) until a state
       class is applied
     - every animated step has a hard timer fallback that fires the real
       navigation / cleanup regardless of transitionend, layout stalls,
       or a thrown error
     - only left-clicks on plain, same-origin, same-tab, non-download,
       non-anchor internal links are intercepted — everything else (new
       tab, modifier-click, external, mailto:, tel:, #anchors, downloads)
       is left to normal browser handling, untouched
     - any runtime error anywhere in here still lets the click through /
       still navigates
     - bfcache restores always clear any leftover overlay state
   ========================================================================== */

(function () {
  "use strict";

  try {
    var STORAGE_KEY = "zsPageTransitionIncoming";

    var COVER_MS = 220;      // exit sweep duration (matches the CSS)
    var REVEAL_MS = 320;     // entry sweep duration (matches the CSS)
    var REDUCED_MS = 100;    // reduced-motion duration, each side (<=150ms target)
    var NAV_FAILSAFE_BUFFER_MS = 90;
    var REVEAL_FAILSAFE_BUFFER_MS = 160;

    var overlay = document.getElementById("zsPageTransition");

    function reduceMotion() {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }

    function resetOverlay() {
      if (!overlay) {
        return;
      }
      overlay.classList.remove("is-covering", "is-covered", "is-revealing");
    }

    // ------------------------------------------------------------------
    // ENTRY — reveal this page if it was reached via an intercepted click
    // ------------------------------------------------------------------
    function runEntryReveal() {
      var incoming = document.documentElement.classList.contains("zs-pt-incoming");

      // One-shot flag: consume it immediately so a plain refresh, a
      // manually typed URL, or a back/forward hop never inherits it.
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        /* ignore — non-critical */
      }

      if (!incoming) {
        return;
      }

      if (!overlay) {
        document.documentElement.classList.remove("zs-pt-incoming");
        return;
      }

      var reduced = reduceMotion();
      var cleaned = false;

      function cleanup() {
        if (cleaned) {
          return;
        }
        cleaned = true;
        resetOverlay();
        document.documentElement.classList.remove("zs-pt-incoming");
      }

      // The bootstrap snippet already painted the fully-covered state
      // before first paint. Confirm that state via the "is-covered"
      // class (instant, no transition), then hand off to "is-revealing"
      // on the next frame so the browser has a settled starting frame
      // to transition from.
      overlay.classList.add("is-covered");

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          overlay.classList.remove("is-covered");
          overlay.classList.add("is-revealing");
          overlay.addEventListener("transitionend", cleanup, { once: true });
          window.setTimeout(
            cleanup,
            (reduced ? REDUCED_MS : REVEAL_MS) + REVEAL_FAILSAFE_BUFFER_MS
          );
        });
      });
    }

    runEntryReveal();

    // Back/forward cache restores: never leave a stuck overlay or a
    // stale incoming flag sitting over/around the page.
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) {
        resetOverlay();
        document.documentElement.classList.remove("zs-pt-incoming");
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          /* ignore */
        }
      }
    });

    if (!overlay) {
      // No overlay on this page for some reason — internal links behave
      // exactly like normal browser navigation.
      return;
    }

    // ------------------------------------------------------------------
    // EXIT — sweep, then really navigate
    // ------------------------------------------------------------------
    function beginExit(targetHref) {
      var reduced = reduceMotion();
      var navigated = false;

      function doNavigate() {
        if (navigated) {
          return;
        }
        navigated = true;
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch (e) {
          /* ignore — worst case the next page just loads without the
             entry reveal; navigation itself is unaffected. */
        }
        window.location.href = targetHref;
      }

      // Absolute ceiling: real navigation must never wait on the
      // animation finishing, a stalled transitionend, or anything else.
      window.setTimeout(
        doNavigate,
        (reduced ? REDUCED_MS : COVER_MS) + NAV_FAILSAFE_BUFFER_MS
      );

      try {
        overlay.classList.add("is-covering");
        overlay.addEventListener("transitionend", doNavigate, { once: true });
      } catch (e) {
        doNavigate();
      }
    }

    // ------------------------------------------------------------------
    // CLICK INTERCEPTION
    // Delegated on document so it also covers links inside the navbar
    // and footer, which are fetched into the page after this script
    // runs. Only a plain left-click on a same-tab, same-origin, http(s),
    // non-download link to a different document qualifies — everything
    // else (external links, mailto:, tel:, #anchors, downloads, new-tab/
    // modifier-clicks, middle-click) is left to the browser untouched.
    // ------------------------------------------------------------------
    document.addEventListener("click", function (event) {
      try {
        if (event.defaultPrevented) {
          return;
        }
        if (event.button !== 0) {
          return;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        var link =
          event.target && event.target.closest
            ? event.target.closest("a[href]")
            : null;
        if (!link) {
          return;
        }

        if (link.target && link.target !== "" && link.target !== "_self") {
          return; // new tab / named frame
        }
        if (link.hasAttribute("download")) {
          return;
        }

        var href = link.getAttribute("href");
        if (!href || href.charAt(0) === "#") {
          return;
        }

        var colonIndex = href.indexOf(":");
        if (colonIndex > 0) {
          var scheme = href.slice(0, colonIndex).toLowerCase();
          if (scheme === "mailto" || scheme === "tel" || scheme === "javascript") {
            return;
          }
        }

        var url;
        try {
          url = new URL(href, window.location.href);
        } catch (e) {
          return;
        }

        if (url.origin !== window.location.origin) {
          return; // external site
        }
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          return;
        }

        var samePage =
          url.pathname === window.location.pathname &&
          url.search === window.location.search;
        if (samePage) {
          return; // same document (hash-only or identical) — default behavior
        }

        event.preventDefault();
        beginExit(url.href);
      } catch (e) {
        // Never strand a click: if anything above throws after this
        // point, preventDefault has not been called, so the browser's
        // own default navigation still proceeds normally.
      }
    });
  } catch (e) {
    // Fail open — every internal link keeps working via normal browser
    // navigation, exactly as if this script were never loaded.
  }
})();
