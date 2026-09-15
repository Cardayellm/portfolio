/* Site behaviour: sticky-header shadow, mobile menu, scrollspy. */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".site-nav__link[href^='#']")
  );

  /* --- Sticky-header shadow ------------------------------------------- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile menu --------------------------------------------------- */
  function closeMenu() {
    if (!header) return;
    header.classList.remove("is-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  }

  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1060) closeMenu();
  });

  /* --- Scrollspy -------------------------------------------------------
     The active link is whichever section's top has most recently passed
     the line just below the sticky header. Recomputed on scroll/resize. */
  var sections = links
    .map(function (link) {
      var target = document.querySelector(link.getAttribute("href"));
      return target ? { link: link, el: target } : null;
    })
    .filter(Boolean);

  if (sections.length) {
    var setActive = function () {
      /* Matches css `scroll-padding-top: header-h + 1rem`, plus a hair more
         so a section that just settled at the scroll target still counts. */
      var line = (header ? header.offsetHeight : 0) + 18;
      /* No default section: above the first tracked section (still in the
         hero), nothing should read as active. */
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.getBoundingClientRect().top <= line) {
          current = sections[i];
        }
      }
      var atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = sections[sections.length - 1];

      sections.forEach(function (s) {
        s.link.classList.toggle("is-active", s === current);
      });
    };

    var ticking = false;
    var onSpyScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        setActive();
        ticking = false;
      });
    };

    setActive();
    window.addEventListener("scroll", onSpyScroll, { passive: true });
    window.addEventListener("resize", onSpyScroll);
  }

  /* --- Name pronunciation --------------------------------------------- */
  var pronounceBtn = document.querySelector(".pronounce");
  var pronounceAudio = document.querySelector(".pronounce__audio");

  if (pronounceBtn && pronounceAudio) {
    pronounceBtn.addEventListener("click", function () {
      if (!pronounceAudio.paused) {
        pronounceAudio.pause();
        pronounceAudio.currentTime = 0;
        return;
      }
      pronounceAudio.currentTime = 0;
      pronounceAudio.play().catch(function () {
        /* Autoplay/decoding restrictions: fail silently. */
      });
    });

    pronounceAudio.addEventListener("play", function () {
      pronounceBtn.classList.add("is-playing");
      pronounceBtn.setAttribute("aria-pressed", "true");
    });

    ["pause", "ended"].forEach(function (evt) {
      pronounceAudio.addEventListener(evt, function () {
        pronounceBtn.classList.remove("is-playing");
        pronounceBtn.setAttribute("aria-pressed", "false");
      });
    });
  }
})();
