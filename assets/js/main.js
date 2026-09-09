document.addEventListener("DOMContentLoaded", function () {
  // ============== NAVBAR ===================== //

  const navbarContainer = document.getElementById("navbar-container");

  if (navbarContainer) {

    fetch("components/navbar.html")
      .then(response => {

        if (!response.ok) {
          throw new Error(
            "Navbar file not found: " + response.status
          );
        }

        return response.text();
      })

      .then(data => {

        navbarContainer.innerHTML = data;

        // Navbar HTML is now available
        if (typeof window.initNavbar === "function") {

          window.initNavbar();

        } else {

          console.error(
            "ERROR: navbar.js is not loaded."
          );
        }

      })

      .catch(error => {

        console.error(
          "Navbar loading error:",
          error
        );

      });

  } else {

    console.error(
      "ERROR: #navbar-container not found."
    );
  }

  //==================== FOOTER =======================//

  const footerContainer =
    document.getElementById("footer-container");

  if (footerContainer) {

    fetch("components/footer.html")

      .then(response => {

        if (!response.ok) {
          throw new Error(
            "Footer file not found: " + response.status
          );
        }

        return response.text();
      })

      .then(data => {

        footerContainer.innerHTML = data;

        const footer =
          footerContainer.querySelector(".zs-footer");

        if (!footer) {
          return;
        }

        // Footer HTML is now available — bind its accordion toggles and
        // back-to-top button (footer.js can't run this itself on load,
        // since it executes before this fetch resolves and the footer
        // doesn't exist in the DOM yet).
        if (typeof window.initFooter === "function") {

          window.initFooter();

        } else {

          console.error(
            "ERROR: footer.js is not loaded."
          );
        }

        // Footer reveal animation
        if ("IntersectionObserver" in window) {

          const footerObserver =
            new IntersectionObserver(
              (entries, observer) => {

                entries.forEach(entry => {

                  if (entry.isIntersecting) {

                    footer.classList.add(
                      "is-visible"
                    );

                    observer.unobserve(
                      footer
                    );
                  }

                });

              },
              {
                threshold: 0.12
              }
            );

          footerObserver.observe(footer);

        } else {

          footer.classList.add("is-visible");

        }

      })

      .catch(error => {

        console.error(
          "Footer loading error:",
          error
        );

      });

  } else {

    console.error(
      "ERROR: #footer-container not found."
    );
  }

});

//==================== CONTACT FORM — PROJECT CONFIGURATOR =======================//


document.addEventListener("DOMContentLoaded", function () {

  var contactForm = document.getElementById("zsContactForm");
  if (!contactForm) return;

  var CONTACT_EMAIL = "zandsenterprises.pk@gmail.com";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---- Form submission endpoint (single source of truth) ----
  // The real Formspree endpoint is not yet configured for this project.
  // To go live: replace the "action" attribute on <form id="zsContactForm">
  // in contact.html with the real Formspree URL (https://formspree.io/f/xxxxxxxx).
  // That single attribute is the only place the endpoint needs to be set —
  // everything below reads it from here, so nothing else needs to change.
  var CONTACT_FORM_ENDPOINT = contactForm.getAttribute("action") || "";
  var CONTACT_FORM_IS_CONFIGURED = !!CONTACT_FORM_ENDPOINT && CONTACT_FORM_ENDPOINT.indexOf("YOUR_FORM_ID") === -1;

  var panel = document.querySelector(".zs-cf-panel");
  var stepEls = Array.prototype.slice.call(contactForm.querySelectorAll(".zs-cf-step"));
  var stepNavItems = Array.prototype.slice.call(document.querySelectorAll("#zsCfStepsNav li"));
  var progressText = document.getElementById("zsCfProgressText");
  var progressFill = document.getElementById("zsCfProgressFill");

  var backBtn = document.getElementById("zsCfBack");
  var continueBtn = document.getElementById("zsCfContinue");
  var submitBtn = document.getElementById("zsCfSubmit");
  var submitText = submitBtn ? submitBtn.querySelector(".zs-cf-nav-submit-text") : null;

  var formError = document.getElementById("zsCfFormError");
  var formErrorTitle = document.getElementById("zsCfFormErrorTitle");
  var formErrorDesc = document.getElementById("zsCfFormErrorDesc");
  var retryBtn = document.getElementById("zsCfRetry");
  var successEl = document.getElementById("zsCfSuccess");
  var newRequestBtn = document.getElementById("zsCfNewRequest");

  var TOTAL_STEPS = stepEls.length;
  var currentStep = 1;
  var isSubmitting = false;
  var lastDirection = "forward";

  /* ------------------------------------------------------------------
     Helpers — inline field errors
     ------------------------------------------------------------------ */

  function setFieldError(input, message) {
    if (!input) return;
    var field = input.closest(".zs-contact-field");
    var errorEl = field ? field.querySelector(".zs-contact-field-error") : null;
    if (field) field.classList.toggle("has-error", !!message);
    if (errorEl) errorEl.textContent = message || "";
    if (input.setAttribute) {
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }
  }

  function clearStepErrors(stepEl) {
    stepEl.querySelectorAll(".zs-contact-field-error").forEach(function (el) { el.textContent = ""; });
    stepEl.querySelectorAll(".has-error").forEach(function (el) {
      el.classList.remove("has-error");
      var control = el.querySelector("input, select, textarea");
      if (control) control.setAttribute("aria-invalid", "false");
    });
    var tiles = document.getElementById("zsCfCategoryTiles");
    if (tiles) tiles.classList.remove("has-error");
  }

  /* ------------------------------------------------------------------
     Step 2 — service category tiles (multi-select)
     ------------------------------------------------------------------ */

  var categoryTiles = Array.prototype.slice.call(document.querySelectorAll(".zs-cf-tile"));
  var categoriesHidden = document.getElementById("cf-categories");
  var categoriesError = document.getElementById("cf-categories-error");
  var tilesGroup = document.getElementById("zsCfCategoryTiles");

  function syncCategories() {
    var selected = categoryTiles.filter(function (t) { return t.classList.contains("is-selected"); })
      .map(function (t) { return t.getAttribute("data-value"); });
    if (categoriesHidden) categoriesHidden.value = selected.join(", ");

    var otherSelected = categoryTiles.some(function (t) {
      return t.classList.contains("is-selected") && t.getAttribute("data-value") === "Other";
    });
    toggleConditional("cf-packaging-other-wrap", otherSelected);

    if (selected.length && tilesGroup) tilesGroup.classList.remove("has-error");
    if (selected.length && categoriesError) categoriesError.textContent = "";
  }

  categoryTiles.forEach(function (tile) {
    tile.setAttribute("aria-pressed", "false");
    tile.addEventListener("click", function () {
      var nowSelected = !tile.classList.contains("is-selected");
      tile.classList.toggle("is-selected", nowSelected);
      tile.setAttribute("aria-pressed", nowSelected ? "true" : "false");
      syncCategories();
    });
  });

  /* ------------------------------------------------------------------
     Step 3 — structure selector (single-select)
     ------------------------------------------------------------------ */

  var structureItems = Array.prototype.slice.call(document.querySelectorAll(".zs-cf-structure-item"));
  var boxTypeHidden = document.getElementById("cf-box-type-value");

  structureItems.forEach(function (item) {
    item.setAttribute("aria-pressed", "false");
    item.addEventListener("click", function () {
      var alreadySelected = item.classList.contains("is-selected");
      structureItems.forEach(function (i) {
        i.classList.remove("is-selected");
        i.setAttribute("aria-pressed", "false");
      });

      if (!alreadySelected) {
        item.classList.add("is-selected");
        item.setAttribute("aria-pressed", "true");
        var value = item.getAttribute("data-value");
        if (boxTypeHidden) boxTypeHidden.value = value;
        toggleConditional("cf-box-other-wrap", value === "Custom Box");
      } else {
        if (boxTypeHidden) boxTypeHidden.value = "";
        toggleConditional("cf-box-other-wrap", false);
      }
    });
  });

  /* ------------------------------------------------------------------
     Conditional "other" fields (progressive disclosure)
     ------------------------------------------------------------------ */

  function toggleConditional(wrapId, shouldShow) {
    var wrap = document.getElementById(wrapId);
    if (!wrap) return;
    wrap.hidden = !shouldShow;
    if (!shouldShow) {
      var control = wrap.querySelector("input, textarea");
      if (control) control.value = "";
    }
  }

  var materialSelect = document.getElementById("cf-material");
  if (materialSelect) {
    materialSelect.addEventListener("change", function () {
      toggleConditional("cf-material-other-wrap", materialSelect.value === "Other");
    });
  }

  var printingSelect = document.getElementById("cf-printing");
  if (printingSelect) {
    printingSelect.addEventListener("change", function () {
      toggleConditional("cf-printing-other-wrap", printingSelect.value === "Custom Printing");
    });
  }

  var quantitySelect = document.getElementById("cf-quantity");
  if (quantitySelect) {
    quantitySelect.addEventListener("change", function () {
      toggleConditional("cf-quantity-other-wrap", quantitySelect.value === "Custom Quantity");
      setFieldError(quantitySelect, "");
    });
  }

  /* ---- "I don't know the dimensions" — swap L/W/H/unit for a description field ---- */
  var dimsUnknown = document.getElementById("cf-dims-unknown");
  var dimsRow = contactForm.querySelector(".zs-contact-dims-row");
  var dimsDescribeWrap = document.getElementById("cf-dims-describe-wrap");

  if (dimsUnknown && dimsRow && dimsDescribeWrap) {
    dimsUnknown.addEventListener("change", function () {
      var unknown = dimsUnknown.checked;
      dimsRow.hidden = unknown;
      dimsDescribeWrap.hidden = !unknown;

      if (unknown) {
        ["cf-length", "cf-width", "cf-height"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = "";
        });
      } else {
        var describe = document.getElementById("cf-dims-describe");
        if (describe) describe.value = "";
      }
    });
  }

  /* ---- delivery date: don't let customers pick an already-past date ---- */
  var deliveryDate = document.getElementById("cf-date");
  if (deliveryDate) {
    var today0 = new Date();
    var yyyy = today0.getFullYear();
    var mm = String(today0.getMonth() + 1).padStart(2, "0");
    var dd = String(today0.getDate()).padStart(2, "0");
    deliveryDate.min = yyyy + "-" + mm + "-" + dd;
  }

  /* ---- auto-grow textareas ---- */
  contactForm.querySelectorAll("textarea").forEach(function (textarea) {
    if (textarea.id === "cf-message") return; // fixed-height editorial box, has its own scroll
    var resize = function () {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    };
    textarea.addEventListener("input", resize);
    resize();
  });

  /* ---- message character counter ---- */
  var messageField = document.getElementById("cf-message");
  var messageCount = document.getElementById("zsCfMessageCount");
  if (messageField && messageCount) {
    var updateCount = function () { messageCount.textContent = String(messageField.value.length); };
    messageField.addEventListener("input", updateCount);
    updateCount();
  }

  /* ------------------------------------------------------------------
     Product/Industry → Contact integration
     Reads ?packaging=... (used by product.html "Request This Style"
     CTAs and industries.html "Request A Quote" CTAs) and pre-selects
     the matching Step 2 category tile or Step 3 structure item.

     The keys below are the exact packaging values currently used by
     those CTA links across the site; the values are the *actual*
     data-value strings already defined on the tiles/structure items
     above — nothing here is invented. An unrecognized value falls
     back to the "Other" category tile with the original label kept in
     its free-text field, so context from the click is never lost. No
     parameter (a direct visit to contact.html) leaves the form exactly
     as it is today.
     ------------------------------------------------------------------ */

  var PACKAGING_PARAM_MAP = {
    // product.html — structure-specific "Request This Style" CTAs
    "corrugated boxes": { type: "structure", value: "Regular Slotted Carton (RSC)" },
    "die-cut boxes": { type: "structure", value: "Die-Cut Box" },
    "printed cartons": { type: "structure", value: "Printed Carton" },
    "grey board boxes": { type: "structure", value: "Grey Board Box" },
    "gift boxes": { type: "structure", value: "Gift Box" },
    "custom boxes": { type: "structure", value: "Custom Box" },

    // gallery.html (Studio) — "Get A Quote" CTA uses its own structure
    // names, which differ from product.html's labels for the same
    // physical structures. Aliased to the same structure tiles above so
    // Studio's selection is preserved on arrival, not lost to "Other".
    "mailer boxes": { type: "structure", value: "Mailer Box" },
    "rigid boxes": { type: "structure", value: "Grey Board Box" },
    "custom structures": { type: "structure", value: "Custom Box" },

    // product.html + industries.html — category-level CTAs
    "e-commerce / shipping packaging": { type: "category", value: "E-Commerce Packaging" },
    "food packaging": { type: "category", value: "Food & Bakery Packaging" },
    "retail packaging": { type: "category", value: "Retail & Shopping Boxes" },
    "pharmaceutical packaging": { type: "category", value: "Pharmaceutical Packaging" },
    "grocery & consumer packaging": { type: "category", value: "Grocery & Consumer Packaging" },
    "jewellery & luxury packaging": { type: "category", value: "Jewellery & Luxury Packaging" },
    "other": { type: "category", value: "Other" }
  };

  function selectCategoryTileByValue(value) {
    var tile = categoryTiles.filter(function (t) { return t.getAttribute("data-value") === value; })[0];
    if (tile && !tile.classList.contains("is-selected")) tile.click();
    return !!tile;
  }

  function selectStructureItemByValue(value) {
    var item = structureItems.filter(function (i) { return i.getAttribute("data-value") === value; })[0];
    if (item && !item.classList.contains("is-selected")) item.click();
    return !!item;
  }

  function applyPackagingParam() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return; // Unsupported browser — leave the default state untouched.
    }

    var raw = params.get("packaging");
    if (!raw) return; // No parameter present — current default behavior.

    var trimmed = raw.trim();
    if (!trimmed) return;

    var match = PACKAGING_PARAM_MAP[trimmed.toLowerCase()];

    if (match && match.type === "category") {
      selectCategoryTileByValue(match.value);
    } else if (match && match.type === "structure") {
      selectStructureItemByValue(match.value);
    } else {
      // Unrecognized value — don't break the form; select "Other" and
      // preserve the original label instead of discarding it.
      selectCategoryTileByValue("Other");
      var otherInput = document.getElementById("cf-packaging-other");
      if (otherInput) otherInput.value = trimmed;
    }
  }

  applyPackagingParam();

  /* ------------------------------------------------------------------
     Step 5 — artwork upload (type + size)
     Mirrors the existing accept=".pdf,.ai,.psd,.cdr,.png,.jpg,.jpeg,.zip"
     on the input — that attribute only filters the OS file picker, it
     does not stop a user from choosing "All Files" and picking anything
     else, so the same list is enforced here in JS.
     ------------------------------------------------------------------ */

  var ARTWORK_ALLOWED_EXT = ["pdf", "ai", "psd", "cdr", "png", "jpg", "jpeg", "zip"];
  var ARTWORK_MAX_BYTES = 10 * 1024 * 1024;

  function checkArtworkFile(input) {
    if (!input.files || !input.files[0]) return "";
    var file = input.files[0];

    var nameParts = file.name.split(".");
    var ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : "";
    if (ARTWORK_ALLOWED_EXT.indexOf(ext) === -1) {
      return "That file type isn't supported — please use PDF, AI, PSD, CDR, PNG, JPG or ZIP.";
    }

    if (file.size > ARTWORK_MAX_BYTES) {
      return "That file is over 10MB — please email it to us directly instead.";
    }

    return "";
  }

  var artworkInput = document.getElementById("cf-artwork");
  if (artworkInput) {
    artworkInput.addEventListener("change", function () {
      setFieldError(artworkInput, checkArtworkFile(artworkInput));
    });
  }

  /* ------------------------------------------------------------------
     Step-level validation
     ------------------------------------------------------------------ */

  function validateStep(stepNumber) {
    var stepEl = stepEls[stepNumber - 1];
    if (!stepEl) return true;

    clearStepErrors(stepEl);
    var firstInvalid = null;

    if (stepNumber === 1) {
      var name = contactForm.name;
      if (!name.value.trim()) {
        setFieldError(name, "Please enter your name.");
        firstInvalid = firstInvalid || name;
      }

      var email = contactForm.email;
      if (!email.value.trim()) {
        setFieldError(email, "Please enter your email address.");
        firstInvalid = firstInvalid || email;
      } else if (!EMAIL_RE.test(email.value.trim())) {
        setFieldError(email, "Please enter a valid email address.");
        firstInvalid = firstInvalid || email;
      }

      var phone = contactForm.phone;
      var phoneDigits = phone.value.replace(/[^0-9]/g, "");
      if (!phone.value.trim()) {
        setFieldError(phone, "Please enter a phone or WhatsApp number.");
        firstInvalid = firstInvalid || phone;
      } else if (phoneDigits.length < 7) {
        setFieldError(phone, "Please enter a valid phone number.");
        firstInvalid = firstInvalid || phone;
      }
    }

    if (stepNumber === 2) {
      var anySelected = categoryTiles.some(function (t) { return t.classList.contains("is-selected"); });
      if (!anySelected) {
        if (tilesGroup) tilesGroup.classList.add("has-error");
        if (categoriesError) categoriesError.textContent = "Please select at least one option.";
        firstInvalid = firstInvalid || categoryTiles[0];
      } else {
        var otherTile = categoryTiles.find(function (t) {
          return t.classList.contains("is-selected") && t.getAttribute("data-value") === "Other";
        });
        if (otherTile) {
          var otherInput = document.getElementById("cf-packaging-other");
          if (otherInput && !otherInput.value.trim()) {
            setFieldError(otherInput, "Please tell us what you need.");
            firstInvalid = firstInvalid || otherInput;
          }
        }
      }
    }

    if (stepNumber === 3) {
      // Structure is optional — nothing required.
    }

    if (stepNumber === 4) {
      var quantity = document.getElementById("cf-quantity");
      if (quantity && !quantity.value) {
        setFieldError(quantity, "Please select a required quantity.");
        firstInvalid = firstInvalid || quantity;
      } else if (quantity && quantity.value === "Custom Quantity") {
        var quantityOther = document.getElementById("cf-quantity-other");
        if (quantityOther && (!quantityOther.value || Number(quantityOther.value) <= 0)) {
          setFieldError(quantityOther, "Please enter the quantity you need.");
          firstInvalid = firstInvalid || quantityOther;
        }
      }

      if (deliveryDate && deliveryDate.value) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var picked = new Date(deliveryDate.value);
        if (picked < today) {
          setFieldError(deliveryDate, "Please choose a date that isn't in the past.");
          firstInvalid = firstInvalid || deliveryDate;
        }
      }
    }

    if (stepNumber === 5) {
      var artwork = document.getElementById("cf-artwork");
      var artworkMessage = artwork ? checkArtworkFile(artwork) : "";
      if (artworkMessage) {
        setFieldError(artwork, artworkMessage);
        firstInvalid = firstInvalid || artwork;
      }
    }

    if (firstInvalid) {
      if (typeof firstInvalid.focus === "function") firstInvalid.focus();
      return false;
    }
    return true;
  }

  /* ------------------------------------------------------------------
     Step navigation / transitions
     ------------------------------------------------------------------ */

  function updateProgress() {
    if (progressText) progressText.textContent = "Step " + currentStep + " of " + TOTAL_STEPS;
    if (progressFill) progressFill.style.width = Math.round((currentStep / TOTAL_STEPS) * 100) + "%";

    stepNavItems.forEach(function (item, i) {
      var n = i + 1;
      item.classList.toggle("is-active", n === currentStep);
      item.classList.toggle("is-done", n < currentStep);
    });

    if (backBtn) backBtn.disabled = currentStep === 1;

    var isLast = currentStep === TOTAL_STEPS;
    if (continueBtn) continueBtn.hidden = isLast;
    if (submitBtn) submitBtn.hidden = !isLast;
  }

  function goToStep(nextStep, direction) {
    var current = stepEls[currentStep - 1];
    var next = stepEls[nextStep - 1];
    if (!next || next === current) return;

    current.classList.remove("is-active");
    next.classList.remove("is-leaving-back");
    if (direction === "back") next.classList.add("is-leaving-back");
    next.classList.add("is-active");

    currentStep = nextStep;
    lastDirection = direction;
    updateProgress();

    var firstField = next.querySelector("input:not([type=hidden]), select, textarea, button.zs-cf-tile, button.zs-cf-structure-item");
    if (firstField && typeof firstField.focus === "function" && direction !== "initial") {
      window.setTimeout(function () { firstField.focus({ preventScroll: true }); }, 60);
    }

    if (panel && direction !== "initial") {
      var top = panel.getBoundingClientRect().top + window.pageYOffset - 110;
      if (panel.getBoundingClientRect().top < 0) {
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    }
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      if (!validateStep(currentStep)) return;
      if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1, "forward");
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (currentStep > 1) goToStep(currentStep - 1, "back");
    });
  }

  updateProgress();

  /* ------------------------------------------------------------------
     Submission — real Formspree request, honest states, no fake success
     ------------------------------------------------------------------ */

  function setSubmittingState(submitting) {
    isSubmitting = submitting;
    if (submitBtn) {
      submitBtn.disabled = submitting;
      submitBtn.classList.toggle("is-submitting", submitting);
    }
    if (continueBtn) continueBtn.disabled = submitting;
    if (backBtn) backBtn.disabled = submitting || currentStep === 1;
    if (submitText) submitText.textContent = submitting ? "Sending…" : "Send Project Request";
  }

  function showFormError(title, desc) {
    if (formErrorTitle) formErrorTitle.textContent = title;
    if (formErrorDesc) formErrorDesc.textContent = desc;
    if (formError) formError.hidden = false;
    if (panel) panel.querySelector(".zs-cf-form").hidden = true;
    if (formError && typeof formError.focus === "function") {
      formError.setAttribute("tabindex", "-1");
      formError.focus();
    }
  }

  function hideFormError() {
    if (formError) formError.hidden = true;
    if (panel) {
      var formShell = panel.querySelector(".zs-cf-form");
      if (formShell) formShell.hidden = false;
    }
  }

  function showSuccess() {
    if (panel) {
      var formShell = panel.querySelector(".zs-cf-form");
      if (formShell) formShell.hidden = true;
      var progress = panel.querySelector(".zs-cf-progress");
      if (progress) progress.hidden = true;
    }
    if (formError) formError.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.setAttribute("tabindex", "-1");
      successEl.focus();
    }
  }

  function resetForNewRequest() {
    contactForm.reset();
    categoryTiles.forEach(function (t) { t.classList.remove("is-selected"); t.setAttribute("aria-pressed", "false"); });
    structureItems.forEach(function (t) { t.classList.remove("is-selected"); t.setAttribute("aria-pressed", "false"); });
    if (categoriesHidden) categoriesHidden.value = "";
    if (boxTypeHidden) boxTypeHidden.value = "";
    contactForm.querySelectorAll(".zs-contact-field--conditional").forEach(function (el) { el.hidden = true; });
    if (dimsRow) dimsRow.hidden = false;
    if (dimsDescribeWrap) dimsDescribeWrap.hidden = true;
    if (messageCount) messageCount.textContent = "0";

    stepEls.forEach(function (s) { s.classList.remove("is-active", "is-leaving-back"); });
    currentStep = 1;
    stepEls[0].classList.add("is-active");
    updateProgress();

    if (successEl) successEl.hidden = true;
    if (formError) formError.hidden = true;
    if (panel) {
      var formShell = panel.querySelector(".zs-cf-form");
      if (formShell) formShell.hidden = false;
      var progress = panel.querySelector(".zs-cf-progress");
      if (progress) progress.hidden = false;
    }
  }

  function parseErrorMessage(response, bodyText) {
    try {
      var data = bodyText ? JSON.parse(bodyText) : null;
      if (data && data.errors && data.errors.length) {
        return data.errors.map(function (e) { return e.message; }).join(" ");
      }
    } catch (e) {
      // Not JSON — fall through to a generic message.
    }
    return null;
  }

  function submitForm() {
    // Honeypot — if this hidden field has a value, silently drop the submission
    // (bots tend to fill every field; a real visitor never sees or fills this).
    var honeypot = contactForm.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    if (!CONTACT_FORM_IS_CONFIGURED) {
      // Formspree endpoint has not been configured yet — tell the truth,
      // don't pretend the request went anywhere.
      showFormError(
        "This Form Isn't Connected Yet.",
        "We haven't set up the email endpoint for this form yet. Please reach us directly at " + CONTACT_EMAIL + " in the meantime."
      );
      return;
    }

    setSubmittingState(true);
    hideFormError();

    var formData = new FormData(contactForm);

    fetch(CONTACT_FORM_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    })
      .then(function (response) {
        return response.text().then(function (bodyText) {
          return { ok: response.ok, status: response.status, bodyText: bodyText };
        });
      })
      .then(function (result) {
        if (result.ok) {
          showSuccess();
          return;
        }

        var message = parseErrorMessage(null, result.bodyText);
        if (result.status >= 500) {
          showFormError("We Couldn't Send That Yet.", "Something went wrong on our end. Please try again in a moment, or email us directly at " + CONTACT_EMAIL + ".");
        } else if (result.status === 429) {
          showFormError("Too Many Attempts.", "Please wait a moment and try again.");
        } else {
          showFormError("We Couldn't Send That.", message || ("Please check your details and try again, or email us directly at " + CONTACT_EMAIL + "."));
        }
      })
      .catch(function () {
        showFormError("We Couldn't Connect.", "Please check your connection and try again. Your information is still here.");
      })
      .finally(function () {
        setSubmittingState(false);
      });
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateStep(TOTAL_STEPS)) return;
    submitForm();
  });

  if (retryBtn) {
    retryBtn.addEventListener("click", function () {
      hideFormError();
      submitForm();
    });
  }

  if (newRequestBtn) {
    newRequestBtn.addEventListener("click", resetForNewRequest);
  }

  /* ---- warn before leaving an unfinished, partially-filled form ---- */
  window.addEventListener("beforeunload", function (event) {
    if (isSubmitting) return;
    if (successEl && !successEl.hidden) return;
    var name = contactForm.name ? contactForm.name.value.trim() : "";
    var email = contactForm.email ? contactForm.email.value.trim() : "";
    var hasProgress = currentStep > 1 || name || email;
    if (!hasProgress) return;
    event.preventDefault();
    event.returnValue = "";
  });

});
//==================== FAQ PAGE =======================//
// Category navigation + accordion. Scoped to .zs-faq, so this
// block is a no-op on every other page.

document.addEventListener("DOMContentLoaded", function () {

  var faqRoot = document.querySelector(".zs-faq");
  if (!faqRoot) return;

  var navList = faqRoot.querySelector("#zsFaqNavList");
  var navButtons = faqRoot.querySelectorAll(".zs-faq-nav-btn");
  var indicator = faqRoot.querySelector("#zsFaqIndicator");
  var panelLabel = faqRoot.querySelector("#zsFaqPanelLabel");
  var groups = faqRoot.querySelectorAll(".zs-faq-group");
  var faqList = faqRoot.querySelector("#zsFaqList");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- category label lookup (num + name) ---------------- */

  function buttonLabel(btn) {
    var num = btn.querySelector(".zs-faq-nav-num");
    var label = btn.querySelector(".zs-faq-nav-label");
    return (num ? num.textContent : "") + " — " + (label ? label.textContent : "");
  }

  /* ---------------- sliding indicator ---------------- */

  function positionIndicator(activeBtn) {
    if (!indicator || !navList || !activeBtn) return;

    var listRect = navList.getBoundingClientRect();
    var btnRect = activeBtn.getBoundingClientRect();

    indicator.style.setProperty("--ind-y", (btnRect.top - listRect.top) + "px");
    indicator.style.setProperty("--ind-h", btnRect.height + "px");
    indicator.style.setProperty("--ind-x", (btnRect.left - listRect.left) + "px");
    indicator.style.setProperty("--ind-w", btnRect.width + "px");
  }

  /* ---------------- category switching ---------------- */

  function activateCategory(category, updateIndicator) {
    var isAll = category === "all";

    navButtons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-category") === category;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");

      if (isActive) {
        if (panelLabel) { panelLabel.textContent = buttonLabel(btn); }
        if (updateIndicator !== false) { positionIndicator(btn); }
      }
    });

    if (faqList) { faqList.classList.toggle("is-all-mode", isAll); }

    groups.forEach(function (group) {
      var matches = isAll || group.getAttribute("data-category") === category;

      if (matches) {
        group.hidden = false;
        group.classList.add("is-active");

        if (!reduceMotion) {
          group.classList.remove("is-entering");
          // eslint-disable-next-line no-unused-expressions
          void group.offsetWidth; // restart animation
          group.classList.add("is-entering");
        }
      } else {
        group.hidden = true;
        group.classList.remove("is-active", "is-entering");
      }
    });
  }

  navButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      activateCategory(btn.getAttribute("data-category"));
    });
  });

  /* keep the indicator aligned on resize (desktop vertical <-> mobile horizontal) */
  window.addEventListener("resize", function () {
    var activeBtn = faqRoot.querySelector(".zs-faq-nav-btn.is-active");
    positionIndicator(activeBtn);
  });

  /* initial indicator placement once layout has settled */
  window.requestAnimationFrame(function () {
    var activeBtn = faqRoot.querySelector(".zs-faq-nav-btn.is-active");
    positionIndicator(activeBtn);
  });

  /* ---------------- jump to a category from the hero labels or knowledge map ---------------- */

  function goToCategory(category) {
    activateCategory(category);
    window.setTimeout(function () {
      var mainSection = faqRoot.querySelector(".zs-faq-main");
      if (mainSection) {
        mainSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
      updateFloatIndex();
    }, reduceMotion ? 0 : 60);
  }

  faqRoot.querySelectorAll(".zs-faq-map-leaf[data-category], .zs-faq-fragment[data-category]").forEach(function (el) {
    el.addEventListener("click", function () { goToCategory(el.getAttribute("data-category")); });
  });

  /* ---------------- accordion (single-open per category) ---------------- */

  groups.forEach(function (group) {
    var items = group.querySelectorAll(".zs-faq-item");

    items.forEach(function (item) {
      var question = item.querySelector(".zs-faq-q");
      if (!question) return;

      question.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");

        items.forEach(function (other) {
          other.classList.remove("is-open");
          var q = other.querySelector(".zs-faq-q");
          if (q) { q.setAttribute("aria-expanded", "false"); }
        });

        if (!isOpen) {
          item.classList.add("is-open");
          question.setAttribute("aria-expanded", "true");
          group.classList.add("has-open");
        } else {
          group.classList.remove("has-open");
        }
      });
    });
  });

  /* ---------------- "question to question" — sequential journey ---------------- */

  groups.forEach(function (group) {
    var items = Array.prototype.slice.call(group.querySelectorAll(".zs-faq-item"));
    if (items.length < 2) return;

    items.forEach(function (item, i) {
      var nextItem = items[(i + 1) % items.length];
      var nextQuestion = nextItem.querySelector(".zs-faq-q-text");
      var answerInner = item.querySelector(".zs-faq-a-inner");
      if (!nextQuestion || !answerInner) return;

      var wrap = document.createElement("div");
      wrap.className = "zs-faq-next";
      wrap.innerHTML =
        '<span class="zs-faq-next-label">Still have a question?</span>' +
        '<button type="button" class="zs-faq-next-btn">' +
          '<span>' + nextQuestion.textContent + '</span><span aria-hidden="true">→</span>' +
        '</button>';

      wrap.querySelector(".zs-faq-next-btn").addEventListener("click", function () {
        var nextBtn = nextItem.querySelector(".zs-faq-q");
        if (nextBtn) nextBtn.click();
        nextItem.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      });

      answerInner.appendChild(wrap);
    });
  });

  /* ---------------- jump-to-question (Start Here cards + process source link) ---------------- */

  document.querySelectorAll(".zs-faq [data-jump-to]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var targetId = trigger.getAttribute("data-jump-to");
      var questionBtn = document.getElementById(targetId);
      if (!questionBtn) return;

      var targetItem = questionBtn.closest(".zs-faq-item");
      var targetGroup = questionBtn.closest(".zs-faq-group");
      if (!targetItem || !targetGroup) return;

      var category = targetGroup.getAttribute("data-category");
      if (category) activateCategory(category);

      window.setTimeout(function () {
        if (!questionBtn.getAttribute("aria-expanded") || questionBtn.getAttribute("aria-expanded") === "false") {
          questionBtn.click();
        }
        targetItem.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        targetItem.classList.remove("is-jumped");
        void targetItem.offsetWidth;
        targetItem.classList.add("is-jumped");
      }, reduceMotion ? 0 : 80);
    });
  });

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  /* ---------------- floating index — museum-catalogue style indicator ---------------- */

  var floatIndex = document.getElementById("zsFaqFloatIndex");
  var floatCat = document.getElementById("zsFaqFloatCat");
  var floatCount = document.getElementById("zsFaqFloatCount");
  var mainSection = faqRoot.querySelector(".zs-faq-main");

  function updateFloatIndex() {
    if (!floatIndex || !floatCat || !floatCount) return;

    /* in "All Topics" mode several groups are visible at once, so prefer
       whichever group actually contains the open question */
    var openItem = faqRoot.querySelector(".zs-faq-item.is-open");
    var activeGroup = openItem ? openItem.closest(".zs-faq-group") : faqRoot.querySelector(".zs-faq-group.is-active");
    if (!activeGroup) return;

    var groupCategory = activeGroup.getAttribute("data-category");
    var groupBtn = faqRoot.querySelector('.zs-faq-nav-btn[data-category="' + groupCategory + '"]');
    var label = groupBtn ? groupBtn.querySelector(".zs-faq-nav-label") : null;
    floatCat.textContent = label ? label.textContent : "";

    var items = Array.prototype.slice.call(activeGroup.querySelectorAll(".zs-faq-item"));
    var openIndex = items.findIndex(function (item) { return item.classList.contains("is-open"); });
    var pad2 = function (n) { return n < 10 ? "0" + n : String(n); };
    floatCount.textContent = pad2(openIndex === -1 ? 1 : openIndex + 1) + " / " + pad2(items.length);
  }

  if (floatIndex && mainSection && "IntersectionObserver" in window) {
    var floatObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatIndex.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.05 });
    floatObserver.observe(mainSection);
  }

  navButtons.forEach(function (btn) { btn.addEventListener("click", updateFloatIndex); });
  faqRoot.addEventListener("click", function (e) {
    if (e.target.closest(".zs-faq-q")) window.setTimeout(updateFloatIndex, 10);
  });
  updateFloatIndex();

});
