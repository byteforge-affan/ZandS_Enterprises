/* ==========================================================================
   Z&S ENTERPRISES — PACKAGING STUDIO (gallery.html)
   Vanilla JS, dependency-free. Each section owns a small init function.
   ========================================================================== */
(function () {
  "use strict";

  var page = document.querySelector(".zs-studio");
  if (!page) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* DATA — sourced from the site's own Products / Industries content    */
  /* ------------------------------------------------------------------ */

  var STRUCTURES = [
    {
      id: "corrugated", num: "01", name: "Corrugated Boxes",
      img: "/assets/img/01-zs-corrugated-box-set.webp",
      desc: "Fluted board built for strength — the structure Z&S turns to when a product needs to survive shipping and handling.",
      labels: ["Top Flap", "Side Panel", "Base", "Fluted Wall"]
    },
    {
      id: "diecut", num: "02", name: "Die-Cut Boxes",
      img: "/assets/img/03-zs-custom-die-cut-packaging.webp",
      desc: "Precision die-cut blanks for packaging that needs an exact, non-standard shape rather than a stock format.",
      labels: ["Die-Cut Edge", "Crease Line", "Fold"]
    },
    {
      id: "printed", num: "03", name: "Printed Cartons",
      img: "/assets/img/04-zs-printed-cartons.webp",
      desc: "Folding cartons, printed and glued for fast, everyday assembly — the workhorse structure for retail and food.",
      labels: ["Top Closure", "Printed Panel", "Glued Base"]
    },
    {
      id: "mailer", num: "04", name: "Mailer Boxes",
      img: "/assets/img/02-zs-mailer-box.webp",
      desc: "Self-locking, tuck-style construction built for e-commerce — opens flat, folds shut without tape or glue.",
      labels: ["Self-Lock Lid", "Interior Print", "Base Tray"]
    },
    {
      id: "greyboard", num: "05", name: "Rigid Boxes",
      img: "/assets/img/03-zs-jewellery-packaging-box.webp",
      desc: "Rigid grey board, wrapped or printed — built for perceived value as much as protection.",
      labels: ["Rigid Lid", "Wrapped Wall", "Base Tray"]
    },
    {
      id: "custom", num: "06", name: "Custom Structures",
      img: "/assets/img/01-zs-heavy-duty-packaging.webp",
      desc: "Where a stock format doesn't fit, Z&S designs a structure to spec around the product itself.",
      labels: ["Custom Closure", "To Spec", "Custom Base"]
    }
  ];

  var PURPOSES = [
    { id: "greyboard", name: "Present", sub: "Premium Feel", desc: "Rigid-style presentation boxes built for perceived value — suited to jewellery, cosmetics and premium gifting.", img: "/assets/img/03-zs-jewellery-packaging-box.webp", bg: "#2C4A3A" },
    { id: "printed", name: "Assemble", sub: "Fast, Everyday Use", desc: "Printed folding cartons that go together quickly — the everyday structure for retail and food packaging.", img: "/assets/img/04-zs-printed-cartons.webp", bg: "#1D3027" },
    { id: "mailer", name: "Ship", sub: "E-Commerce Ready", desc: "Self-locking mailer construction designed for e-commerce — protective, brandable and easy to pack.", img: "/assets/img/02-zs-mailer-box.webp", bg: "#284238" },
    { id: "corrugated", name: "Protect", sub: "Strong Protection", desc: "Fluted corrugated board for packaging that needs to survive freight, handling and stacking.", img: "/assets/img/01-zs-corrugated-box-set.webp", bg: "#14231D" },
    { id: "diecut", name: "Display", sub: "Exact Shape", desc: "Custom die-cut structures for packaging that needs a precise, non-standard form.", img: "/assets/img/03-zs-custom-die-cut-packaging.webp", bg: "#1F3328" }
  ];

  var BRANDING = ["Printing", "Labels & Stickers", "Ribbons", "Paper Bags", "Tags & Inserts"];
  var ADDITIONS = ["None", "Ribbon Finish", "Protective Insert", "Hang Tag"];

  var BENCH = [
    { id: "bags", name: "Paper Bags", img: "/assets/img/06-zs-branded-paper-bag.webp", desc: "Branded carrier bags for retail hand-out and gifting, printed to match a wider packaging system." },
    { id: "ribbons", name: "Ribbons", img: "/assets/img/02-zs-branded-ribbon-tape.webp", desc: "Ribbon and tape finishing that ties a box or bag together as a last touch, coloured to match the brand." },
    { id: "labels", name: "Labels & Stickers", glyph: "Aa", desc: "Printed labels and stickers for branding, product information or sealing — produced alongside a packaging run." },
    { id: "inserts", name: "Tags & Inserts", glyph: "+", desc: "Hang tags and structural inserts that complete a packaging system, from branding tags to protective interior fittings." },
    { id: "flyers", name: "Flyers", img: "/assets/img/03-zs-promotional-flyer.webp", desc: "Promotional flyers printed alongside packaging runs to support a launch or in-store campaign." },
    { id: "cards", name: "Visiting Cards", img: "/assets/img/01-zs-visiting-card.webp", desc: "Business and visiting cards finished to match the same brand system as the packaging itself." }
  ];

  var INDUSTRIES = [
    { id: "food", name: "Food & Beverage", img: "/assets/img/03-zs-burger-packaging.webp", chips: ["Printed Cartons", "Bakery Boxes", "Takeaway Boxes"] },
    { id: "retail", name: "Retail", img: "/assets/img/03-zs-retail-packaging-box.webp", chips: ["Folding Cartons", "Display Packaging"] },
    { id: "ecommerce", name: "E-Commerce", img: "/assets/img/02-zs-mailer-box.webp", chips: ["Mailer Boxes", "Shipping / Corrugated"] },
    { id: "pharma", name: "Pharmaceuticals", img: "/assets/img/06-zs-pharmaceutical-packaging.webp", chips: ["Printed Cartons", "Medicine Boxes"] },
    { id: "manufacturing", name: "Manufacturing & Industrial", img: "/assets/img/02-zs-strong-reliable-secure-boxes.webp", chips: ["Corrugated Boxes", "Industrial Packaging"] },
    { id: "jewellery", name: "Jewellery & Luxury", img: "/assets/img/03-zs-jewellery-packaging-box.webp", chips: ["Rigid / Premium Boxes"] },
    { id: "toys", name: "Toys & Kids", img: "/assets/img/04-zs-printed-cartons.webp", chips: ["Printed Cartons", "Display Boxes"] },
    { id: "grocery", name: "Grocery & Consumer", img: "/assets/img/03-zs-grocery-packaging.webp", chips: ["Grocery Boxes", "Consumer Packaging"] },
    { id: "gifts", name: "Gifts", img: "/assets/img/01-zs-luxury-gift-box.webp", chips: ["Gift Boxes", "Presentation Boxes"] }
  ];

  var LAYER_OFFSETS = [
    { x: -110, y: -30 }, { x: 110, y: -6 }, { x: -90, y: 66 }, { x: 100, y: 74 }
  ];

  /* ------------------------------------------------------------------ */
  /* 0 — GENERIC REVEAL ON SCROLL                                        */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    var targets = page.querySelectorAll("[data-ps-reveal]");
    if (!targets.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-in"); });
      return;
    }

    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    targets.forEach(function (t) { obs.observe(t); });
  }

  /* ------------------------------------------------------------------ */
  /* 1 — HERO: FLAT -> FOLD -> FORM (scroll-linked)                      */
  /* ------------------------------------------------------------------ */
  function initHero() {
    var hero = page.querySelector("[data-ps-hero]");
    if (!hero) return;

    var stateEl = hero.querySelector("[data-ps-fold-state]");

    if (reducedMotion) {
      hero.style.setProperty("--fold", 1);
      if (stateEl) stateEl.textContent = "Formed";
      return;
    }

    var ticking = false;

    function update() {
      var rect = hero.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var progress = (vh - rect.top) / (rect.height * 0.85);
      progress = Math.max(0, Math.min(1, progress));

      hero.style.setProperty("--fold", progress.toFixed(3));

      if (stateEl) {
        stateEl.textContent = progress < 0.15 ? "Flat" : progress < 0.75 ? "Folding" : "Formed";
      }
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* ------------------------------------------------------------------ */
  /* 2 — STRUCTURE LAB (prototype + anatomy + blueprint)                 */
  /* ------------------------------------------------------------------ */
  function initLab() {
    var lab = page.querySelector("[data-ps-lab]");
    if (!lab) return;

    var listEl = lab.querySelector("[data-ps-lab-list]");
    var stage = lab.querySelector("[data-ps-lab-stage]");
    var mediaWrap = lab.querySelector("[data-ps-lab-media]");
    var nameEl = lab.querySelector("[data-ps-lab-name]");
    var descEl = lab.querySelector("[data-ps-lab-desc]");
    var labelsEl = lab.querySelector("[data-ps-lab-labels]");
    var layersWrap = lab.querySelector("[data-ps-lab-layers]");
    var modeBtns = lab.querySelectorAll("[data-ps-mode]");
    var blueprintBtn = lab.querySelector("[data-ps-blueprint]");
    var blueprintNote = lab.querySelector("[data-ps-blueprint-note]");

    if (!listEl || !stage) return;

    // Build structure list buttons
    STRUCTURES.forEach(function (s, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zs-ps-struct-btn" + (i === 0 ? " is-active" : "");
      btn.setAttribute("data-id", s.id);
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      btn.innerHTML = '<span>' + s.name + '</span><span class="zs-ps-struct-num">' + s.num + '</span>';
      li.appendChild(btn);
      listEl.appendChild(li);
    });

    // Build stage images
    STRUCTURES.forEach(function (s, i) {
      var img = document.createElement("img");
      img.src = s.img;
      img.alt = s.name + " — Z&S packaging structure";
      img.loading = "lazy";
      img.setAttribute("data-id", s.id);
      if (i === 0) img.classList.add("is-active");
      mediaWrap.appendChild(img);
    });

    // Build anatomy layer labels (max 4, reused across structures)
    var layerEls = [];
    for (var i = 0; i < LAYER_OFFSETS.length; i++) {
      var el = document.createElement("span");
      el.className = "zs-ps-anatomy-layer";
      el.style.setProperty("--lx", LAYER_OFFSETS[i].x + "px");
      el.style.setProperty("--ly", LAYER_OFFSETS[i].y + "px");
      layersWrap.appendChild(el);
      layerEls.push(el);
    }

    function renderStructure(id) {
      var s = STRUCTURES.filter(function (x) { return x.id === id; })[0];
      if (!s) return;

      listEl.querySelectorAll(".zs-ps-struct-btn").forEach(function (b) {
        var active = b.getAttribute("data-id") === id;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });

      mediaWrap.querySelectorAll("img").forEach(function (img) {
        img.classList.toggle("is-active", img.getAttribute("data-id") === id);
      });

      nameEl.textContent = s.name;
      descEl.textContent = s.desc;

      labelsEl.innerHTML = "";
      s.labels.forEach(function (l) {
        var li = document.createElement("li");
        li.textContent = l;
        labelsEl.appendChild(li);
      });

      layerEls.forEach(function (el, i) {
        if (s.labels[i]) {
          el.textContent = s.labels[i];
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      });

      if (blueprintNote) {
        blueprintNote.textContent = "Conceptual overlay — " + s.labels.join(" · ") + ". Not a production drawing.";
      }
    }

    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".zs-ps-struct-btn");
      if (!btn) return;
      renderStructure(btn.getAttribute("data-id"));
    });

    modeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        modeBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        stage.setAttribute("data-mode", btn.getAttribute("data-ps-mode"));
      });
    });

    if (blueprintBtn) {
      blueprintBtn.addEventListener("click", function () {
        var active = stage.classList.toggle("is-blueprint");
        blueprintBtn.classList.toggle("is-active", active);
        blueprintBtn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    renderStructure(STRUCTURES[0].id);
  }

  /* ------------------------------------------------------------------ */
  /* 3 — HOW DOES IT OPEN (drag / press to open)                         */
  /* ------------------------------------------------------------------ */
  function initOpen() {
    var section = page.querySelector("[data-ps-open]");
    if (!section) return;

    var selectWrap = section.querySelector("[data-ps-open-select]");
    var mediaWrap = section.querySelector("[data-ps-open-media]");
    var stage = section.querySelector("[data-ps-open-stage]");
    var statusEl = section.querySelector("[data-ps-open-status]");
    var toggleBtn = section.querySelector("[data-ps-open-toggle]");

    if (!selectWrap || !stage) return;

    STRUCTURES.forEach(function (s, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = s.name;
      btn.setAttribute("data-id", s.id);
      if (i === 0) btn.classList.add("is-active");
      selectWrap.appendChild(btn);

      var img = document.createElement("img");
      img.src = s.img;
      img.alt = s.name + " — closed";
      img.loading = "lazy";
      img.setAttribute("data-id", s.id);
      if (i === 0) img.style.display = "";
      else img.style.display = "none";
      mediaWrap.appendChild(img);
    });

    var openValue = 0;
    var dragging = false;
    var startY = 0;
    var startOpen = 0;

    function setOpen(v) {
      openValue = Math.max(0, Math.min(1, v));
      stage.style.setProperty("--open", openValue.toFixed(3));
      if (statusEl) {
        statusEl.textContent = openValue < 0.08 ? "Closed" : openValue > 0.92 ? "Open" : "Opening";
      }
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-pressed", openValue > 0.5 ? "true" : "false");
        toggleBtn.textContent = openValue > 0.5 ? "Close Package" : "Press To Open";
      }
    }

    selectWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      selectWrap.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var id = btn.getAttribute("data-id");
      mediaWrap.querySelectorAll("img").forEach(function (img) {
        img.style.display = img.getAttribute("data-id") === id ? "" : "none";
      });
      setOpen(0);
    });

    function onPointerDown(e) {
      dragging = true;
      startY = e.clientY;
      startOpen = openValue;
      stage.setPointerCapture && e.pointerId != null && stage.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      // Moving the pointer up (smaller clientY, negative dy) should open
      // the package, matching the "Drag up to open" label, so subtract.
      setOpen(startOpen - dy / 160);
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      setOpen(openValue > 0.5 ? 1 : 0);
    }

    stage.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        setOpen(openValue > 0.5 ? 0 : 1);
      });
    }

    setOpen(0);
  }

  /* ------------------------------------------------------------------ */
  /* 4 — PURPOSE / SCENE TRANSFORMATION                                  */
  /* ------------------------------------------------------------------ */
  function initPurpose() {
    var section = page.querySelector("[data-ps-purpose]");
    if (!section) return;

    var listEl = section.querySelector("[data-ps-purpose-list]");
    var sceneWrap = section.querySelector("[data-ps-purpose-scene]");
    var copyEl = section.querySelector("[data-ps-purpose-copy]");

    if (!listEl || !sceneWrap) return;

    PURPOSES.forEach(function (p, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zs-ps-purpose-btn" + (i === 0 ? " is-active" : "");
      btn.setAttribute("data-id", p.id);
      btn.innerHTML = '<span class="zs-ps-purpose-btn-name">' + p.name + '</span><span class="zs-ps-purpose-btn-sub">' + p.sub + '</span>';
      li.appendChild(btn);
      listEl.appendChild(li);

      var img = document.createElement("img");
      img.src = p.img;
      img.alt = p.name + " — " + p.sub;
      img.loading = "lazy";
      img.setAttribute("data-id", p.id);
      if (i === 0) img.classList.add("is-active");
      sceneWrap.appendChild(img);
    });

    function render(id) {
      var p = PURPOSES.filter(function (x) { return x.id === id; })[0];
      if (!p) return;

      listEl.querySelectorAll(".zs-ps-purpose-btn").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-id") === id);
      });
      sceneWrap.querySelectorAll("img").forEach(function (img) {
        img.classList.toggle("is-active", img.getAttribute("data-id") === id);
      });
      if (copyEl) {
        copyEl.textContent = p.desc;
        copyEl.classList.remove("is-active");
        window.requestAnimationFrame(function () { copyEl.classList.add("is-active"); });
      }
      section.style.setProperty("--zs-scene-bg", p.bg);
    }

    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".zs-ps-purpose-btn");
      if (!btn) return;
      render(btn.getAttribute("data-id"));
    });

    render(PURPOSES[0].id);
  }

  /* ------------------------------------------------------------------ */
  /* 5 — BUILD YOUR PACKAGING (CONFIGURATOR)                             */
  /* ------------------------------------------------------------------ */
  function initConfig() {
    var section = page.querySelector("[data-ps-config]");
    if (!section) return;

    var groups = {
      structure: { el: section.querySelector('[data-ps-config-group="structure"]'), items: STRUCTURES.map(function (s) { return s.name; }), value: null },
      purpose: { el: section.querySelector('[data-ps-config-group="purpose"]'), items: PURPOSES.map(function (p) { return p.name + " (" + p.sub + ")"; }), value: null },
      branding: { el: section.querySelector('[data-ps-config-group="branding"]'), items: BRANDING, value: null },
      additions: { el: section.querySelector('[data-ps-config-group="additions"]'), items: ADDITIONS, value: null }
    };

    var summary = {
      structure: section.querySelector('[data-ps-summary="structure"]'),
      purpose: section.querySelector('[data-ps-summary="purpose"]'),
      branding: section.querySelector('[data-ps-summary="branding"]'),
      additions: section.querySelector('[data-ps-summary="additions"]')
    };

    var stackLayers = {
      structure: section.querySelector('[data-ps-layer="structure"]'),
      branding: section.querySelector('[data-ps-layer="branding"]'),
      additions: section.querySelector('[data-ps-layer="additions"]')
    };

    var readyEl = section.querySelector("[data-ps-config-ready]");
    var ctaEl = section.querySelector("[data-ps-config-cta]");

    Object.keys(groups).forEach(function (key) {
      var g = groups[key];
      if (!g.el) return;
      g.items.forEach(function (label, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "zs-ps-config-opt";
        btn.textContent = label;
        btn.setAttribute("data-key", key);
        btn.setAttribute("data-value", label);
        g.el.appendChild(btn);
      });
    });

    function update() {
      Object.keys(summary).forEach(function (key) {
        if (summary[key]) summary[key].textContent = groups[key].value || "—";
      });

      var layerIndex = 0;
      ["structure", "branding", "additions"].forEach(function (key) {
        var layerEl = stackLayers[key];
        if (!layerEl) return;
        var val = groups[key].value;
        if (val && val !== "None") {
          layerEl.textContent = val;
          layerEl.style.setProperty("--layer-i", layerIndex + 1);
          layerEl.classList.add("is-set");
          layerIndex++;
        } else {
          layerEl.classList.remove("is-set");
        }
      });

      var allSet = groups.structure.value && groups.purpose.value && groups.branding.value;
      if (readyEl) readyEl.style.display = allSet ? "" : "none";

      if (ctaEl) {
        var params = [];
        if (groups.structure.value) params.push("packaging=" + encodeURIComponent(groups.structure.value));
        if (groups.purpose.value) params.push("purpose=" + encodeURIComponent(groups.purpose.value));
        if (groups.branding.value) params.push("branding=" + encodeURIComponent(groups.branding.value));
        if (groups.additions.value && groups.additions.value !== "None") params.push("addition=" + encodeURIComponent(groups.additions.value));
        ctaEl.href = "/contact.html" + (params.length ? "?" + params.join("&") : "") + "#contact-form";
      }
    }

    section.addEventListener("click", function (e) {
      var btn = e.target.closest(".zs-ps-config-opt");
      if (!btn) return;
      var key = btn.getAttribute("data-key");
      var value = btn.getAttribute("data-value");
      groups[key].value = value;
      groups[key].el.querySelectorAll(".zs-ps-config-opt").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      update();
    });

    update();
  }

  /* ------------------------------------------------------------------ */
  /* 6 — THE PACKAGING WORKBENCH                                         */
  /* ------------------------------------------------------------------ */
  function initBench() {
    var section = page.querySelector("[data-ps-bench]");
    if (!section) return;

    var desk = section.querySelector("[data-ps-bench-desk]");
    var infoName = section.querySelector("[data-ps-bench-name]");
    var infoDesc = section.querySelector("[data-ps-bench-desc]");
    var infoHint = section.querySelector("[data-ps-bench-hint]");

    if (!desk) return;

    BENCH.forEach(function (obj) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zs-ps-bench-obj";
      btn.setAttribute("data-id", obj.id);
      btn.setAttribute("aria-pressed", "false");

      if (obj.img) {
        btn.innerHTML = '<img src="' + obj.img + '" alt="' + obj.name + '" loading="lazy">';
      } else {
        btn.innerHTML = '<span style="font-family:var(--font-display);font-size:34px;font-weight:700;color:var(--zs-gold);">' + obj.glyph + '</span>';
      }
      btn.innerHTML += '<span class="zs-ps-bench-obj-name">' + obj.name + '</span>';
      desk.appendChild(btn);
    });

    function focusObj(id) {
      var obj = BENCH.filter(function (o) { return o.id === id; })[0];
      desk.classList.toggle("has-focus", !!obj);
      desk.querySelectorAll(".zs-ps-bench-obj").forEach(function (b) {
        var active = b.getAttribute("data-id") === id;
        b.classList.toggle("is-focus", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (obj) {
        infoName.textContent = obj.name;
        infoDesc.textContent = obj.desc;
        if (infoHint) infoHint.textContent = "Selected — choose another object, or select it again to return to the workbench.";
      } else {
        infoName.textContent = "Select an object";
        infoDesc.textContent = "Choose anything on the workbench to inspect it up close.";
        if (infoHint) infoHint.textContent = "";
      }
    }

    var current = null;
    desk.addEventListener("click", function (e) {
      var btn = e.target.closest(".zs-ps-bench-obj");
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      current = current === id ? null : id;
      focusObj(current);
    });

    focusObj(null);
  }

  /* ------------------------------------------------------------------ */
  /* 7 — WHAT DOES YOUR PRODUCT NEED (INDUSTRY)                          */
  /* ------------------------------------------------------------------ */
  function initIndustry() {
    var section = page.querySelector("[data-ps-industry]");
    if (!section) return;

    var railEl = section.querySelector("[data-ps-industry-rail]");
    var sceneWrap = section.querySelector("[data-ps-industry-scene]");
    var chipsWrap = section.querySelector("[data-ps-industry-chips]");

    if (!railEl || !sceneWrap) return;

    INDUSTRIES.forEach(function (ind, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zs-ps-industry-rail-btn" + (i === 0 ? " is-active" : "");
      btn.setAttribute("data-id", ind.id);
      btn.textContent = ind.name;
      li.appendChild(btn);
      railEl.appendChild(li);

      var img = document.createElement("img");
      img.src = ind.img;
      img.alt = ind.name + " packaging";
      img.loading = "lazy";
      img.setAttribute("data-id", ind.id);
      if (i === 0) img.classList.add("is-active");
      sceneWrap.appendChild(img);
    });

    function render(id) {
      var ind = INDUSTRIES.filter(function (x) { return x.id === id; })[0];
      if (!ind) return;

      railEl.querySelectorAll(".zs-ps-industry-rail-btn").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-id") === id);
      });
      sceneWrap.querySelectorAll("img").forEach(function (img) {
        img.classList.toggle("is-active", img.getAttribute("data-id") === id);
      });
      if (chipsWrap) {
        chipsWrap.innerHTML = "";
        ind.chips.forEach(function (c) {
          var span = document.createElement("span");
          span.className = "zs-ps-industry-chip";
          span.textContent = c;
          chipsWrap.appendChild(span);
        });
      }
    }

    railEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".zs-ps-industry-rail-btn");
      if (!btn) return;
      render(btn.getAttribute("data-id"));
    });

    render(INDUSTRIES[0].id);
  }

  /* ------------------------------------------------------------------ */
  /* 8 — FROM MATERIAL TO PACKAGE (PROCESS)                              */
  /* ------------------------------------------------------------------ */
  function initProcess() {
    var section = page.querySelector("[data-ps-process]");
    if (!section) return;

    var steps = section.querySelectorAll(".zs-ps-process-step");
    if (!steps.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      steps.forEach(function (s) { s.classList.add("is-in"); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-in");
      });
    }, { threshold: 0.4 });

    steps.forEach(function (s) { obs.observe(s); });
  }

  /* ------------------------------------------------------------------ */
  /* 9 — FINAL CTA                                                       */
  /* ------------------------------------------------------------------ */
  function initCta() {
    var section = page.querySelector("[data-ps-cta]");
    if (!section) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      section.classList.add("is-in");
      return;
    }

    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          section.classList.add("is-in");
          o.disconnect();
        }
      });
    }, { threshold: 0.3 });

    obs.observe(section);
  }

  /* ------------------------------------------------------------------ */
  /* BOOT                                                                */
  /* ------------------------------------------------------------------ */
  function boot() {
    initReveal();
    initHero();
    initLab();
    initOpen();
    initPurpose();
    initConfig();
    initBench();
    initIndustry();
    initProcess();
    initCta();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
