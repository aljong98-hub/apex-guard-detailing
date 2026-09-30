(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ---------- Before/After swipe comparison ---------- */
  document.querySelectorAll("[data-compare]").forEach(function (compare) {
    var range = compare.querySelector(".ba-compare-range");
    if (!range) return;

    var dragging = false;

    function setPos(value) {
      value = Math.min(100, Math.max(0, value));
      range.value = value;
      compare.style.setProperty("--pos", value + "%");
    }

    function posFromClientX(clientX) {
      var rect = compare.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    compare.addEventListener("pointerdown", function (e) {
      dragging = true;
      if (compare.setPointerCapture) compare.setPointerCapture(e.pointerId);
      setPos(posFromClientX(e.clientX));
      range.focus({ preventScroll: true });
      e.preventDefault();
    });

    compare.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      setPos(posFromClientX(e.clientX));
    });

    ["pointerup", "pointercancel"].forEach(function (evt) {
      compare.addEventListener(evt, function () { dragging = false; });
    });

    // Native input event covers keyboard (arrow keys) interaction on the range.
    range.addEventListener("input", function () { setPos(Number(range.value)); });

    setPos(50);
  });

  /* ---------- Scroll reveal ---------- */
  var animatedEls = document.querySelectorAll("[data-animate]");
  if ("IntersectionObserver" in window && animatedEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    animatedEls.forEach(function (el) { observer.observe(el); });
  } else {
    animatedEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Book an appointment modal (Square Appointments embed) ---------- */
  (function () {
    var bookModal = document.getElementById("bookModal");
    var bookModalClose = document.getElementById("bookModalClose");

    if (!bookModal || !bookModalClose) return;

    var lastFocusedEl = null;

    function openBookModal() {
      lastFocusedEl = document.activeElement;
      bookModal.hidden = false;
      document.body.style.overflow = "hidden";
      bookModalClose.focus();
    }

    function closeBookModal() {
      bookModal.hidden = true;
      document.body.style.overflow = "";
      if (lastFocusedEl && typeof lastFocusedEl.focus === "function") lastFocusedEl.focus();
    }

    bookModalClose.addEventListener("click", closeBookModal);
    bookModal.querySelectorAll("[data-book-close]").forEach(function (el) {
      el.addEventListener("click", closeBookModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !bookModal.hidden) closeBookModal();
    });

    // Every "Book Now" / "Book Essential" / "Get a Quote" button opens the same
    // Square booking modal (Square has its own service + time picker built in).
    document.querySelectorAll(".book-trigger, .book-cta").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        openBookModal();
      });
    });
  })();

  /* ---------- Contact form (mailto fallback) ---------- */
  var form = document.getElementById("quoteForm");
  var formStatus = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.fullName.value.trim();
      var phone = form.phone.value.trim();
      var email = form.email.value.trim();
      var vehicle = form.vehicle.value.trim();
      var service = form.service.value;
      var preferredDate = form.preferredDate.value.trim();
      var message = form.message.value.trim();

      if (!name || !phone || !email) {
        formStatus.textContent = "Please fill in your name, phone, and email before sending.";
        formStatus.setAttribute("data-state", "error");
        return;
      }

      var bodyLines = [
        "Name: " + name,
        "Phone: " + phone,
        "Email: " + email,
        vehicle ? "Vehicle: " + vehicle : null,
        service ? "Service: " + service : null,
        preferredDate ? "Preferred Date: " + preferredDate : null,
        message ? "Message: " + message : null
      ].filter(Boolean);

      var mailto = "mailto:info@apexguarddetailing.ca" +
        "?subject=" + encodeURIComponent("Quote Request from " + name) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;
      formStatus.textContent = "Opening your email app to send this request…";
      formStatus.setAttribute("data-state", "success");
    });
  }
})();
