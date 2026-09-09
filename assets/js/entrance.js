/* ==========================================================================
   Z&S ENTERPRISES — ENTRANCE ANIMATION CONTROLLER
   Concept: PACKAGE → REVEAL → Z&S → WEBSITE.

   Isolated from the rest of the site. Runs once per browser session, on
   the homepage only. Designed to NEVER be able to permanently block the
   website:
     - default overlay CSS is invisible/inert until this script opts it in
     - the whole sequence is driven by plain timers over CSS transitions —
       nothing waits on network, media decoding, or anything that can stall
     - a hard failsafe force-removes the overlay no matter what happens
     - any runtime error anywhere in here discards the overlay immediately
     - bfcache restores always clear any leftover overlay state
   ========================================================================== */

(function () {
  "use strict";

  try {
    var SESSION_KEY = "zsEntranceShown";

    var HARD_FAILSAFE_MS = 4000;   // absolute ceiling, no matter what
    var OPEN_AT_MS = 300;          // flaps begin folding open
    var BRAND_AT_MS = 1000;        // brand mark begins revealing
    var EXIT_AT_MS = 2000;         // overlay begins dissolving into the homepage
    var DONE_AT_MS = 2550;         // overlay fully discarded
    var REDUCED_BRAND_MS = 60;     // reduced-motion: brand appears almost immediately
    var REDUCED_EXIT_MS = 600;     // reduced-motion: begin exit
    var REDUCED_DONE_MS = 900;     // reduced-motion: fully discarded (<= 1s target)

    var overlay = document.getElementById("zsEntrance");
    if (!overlay) {
      return;
    }

    function hasSeenEntrance() {
      try {
        return sessionStorage.getItem(SESSION_KEY) === "1";
      } catch (e) {
        // sessionStorage unavailable (privacy mode, etc.) — fail open and
        // just show the entrance; it's a one-time cosmetic layer, not a gate.
        return false;
      }
    }

    function markEntranceSeen() {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch (e) {
        /* ignore — non-critical */
      }
    }

    function discardOverlay() {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      document.body.classList.remove("zs-entrance-lock");
    }

    // Repeat visit within the same session: skip instantly, no flash.
    if (hasSeenEntrance()) {
      discardOverlay();
      return;
    }

    var timers = [];

    function schedule(ms, fn) {
      var id = window.setTimeout(function () {
        try {
          fn();
        } catch (e) {
          // Never let a mid-sequence error leave the overlay stuck.
          discardOverlay();
        }
      }, ms);
      timers.push(id);
      return id;
    }

    function clearSchedule() {
      for (var i = 0; i < timers.length; i++) {
        window.clearTimeout(timers[i]);
      }
      timers = [];
    }

    var finished = false;

    function finish() {
      if (finished) {
        return;
      }
      finished = true;
      clearSchedule();
      window.clearTimeout(hardFailsafe);
      markEntranceSeen();
      discardOverlay();
    }

    // Absolute ceiling: whatever else happens, the overlay is gone by here.
    var hardFailsafe = window.setTimeout(finish, HARD_FAILSAFE_MS);

    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.body.classList.add("zs-entrance-lock");
    overlay.classList.add("is-visible");

    if (reduceMotion) {
      overlay.classList.add("zs-entrance--reduced");
      schedule(REDUCED_BRAND_MS, function () {
        overlay.classList.add("phase-brand");
      });
      schedule(REDUCED_EXIT_MS, function () {
        overlay.classList.add("phase-exit");
        document.body.classList.remove("zs-entrance-lock");
      });
      schedule(REDUCED_DONE_MS, finish);
    } else {
      schedule(OPEN_AT_MS, function () {
        overlay.classList.add("phase-open");
      });
      schedule(BRAND_AT_MS, function () {
        overlay.classList.add("phase-brand");
      });
      schedule(EXIT_AT_MS, function () {
        overlay.classList.add("phase-exit");
        document.body.classList.remove("zs-entrance-lock");
      });
      schedule(DONE_AT_MS, finish);
    }

    // Back/forward cache: if the page is restored from bfcache, never leave
    // a stuck or half-animated overlay sitting over the site.
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) {
        finish();
      }
    });
  } catch (e) {
    // Fail open, no matter what went wrong: the homepage must never be
    // blocked by the entrance.
    var fallback = document.getElementById("zsEntrance");
    if (fallback && fallback.parentNode) {
      fallback.parentNode.removeChild(fallback);
    }
    if (document.body) {
      document.body.classList.remove("zs-entrance-lock");
    }
  }
})();
