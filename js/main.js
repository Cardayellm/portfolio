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

  /* --- Skills: fade groups in row by row ------------------------------
     The grid uses auto-fit, so how many groups share a row depends on
     viewport width (5 rows on mobile, 2 on desktop, etc). Rather than
     guess column counts per breakpoint, read each group's actual
     offsetTop once the section scrolls into view and bucket groups that
     land on the same line, then stagger a fade-in by row. */
  var skillsSection = document.getElementById("skills");
  var skillGroups = Array.prototype.slice.call(
    document.querySelectorAll(".skills__group")
  );
  var reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (skillsSection && skillGroups.length && !reducedMotion) {
    var revealByRow = function () {
      var rowTops = [];
      skillGroups.forEach(function (group) {
        var top = group.offsetTop;
        var known = rowTops.some(function (t) {
          return Math.abs(t - top) < 4;
        });
        if (!known) rowTops.push(top);
      });
      rowTops.sort(function (a, b) {
        return a - b;
      });

      skillGroups.forEach(function (group) {
        var rowIndex = rowTops.findIndex(function (t) {
          return Math.abs(t - group.offsetTop) < 4;
        });
        group.style.transitionDelay = rowIndex * 0.15 + "s";
      });

      /* Double rAF: a single rAF isn't a reliable guarantee the browser
         has painted the opacity:0 state yet, so the transition can get
         coalesced away and the rows just snap straight to visible. The
         nested rAF forces one full painted frame of the hidden state
         first. */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          skillGroups.forEach(function (group) {
            group.classList.add("is-visible");
          });
        });
      });
    };

    /* A single IntersectionObserver handles both cases: if the section
       already satisfies the threshold/rootMargin at observe()-time (tall
       viewport), it fires right away; otherwise it waits for a real
       scroll to carry the section past that line. */
    if ("IntersectionObserver" in window) {
      var skillsObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealByRow();
              skillsObserver.disconnect();
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40% 0px" }
      );
      skillsObserver.observe(skillsSection);
    } else {
      revealByRow();
    }
  } else {
    skillGroups.forEach(function (group) {
      group.classList.add("is-visible");
    });
  }

  /* --- Work Experience / Education: fade each entry in independently as
     it scrolls into view (each entry gets its own observer entry/
     unobserve, so the whole section doesn't reveal at once when just the
     first entry shows). */
  var initEntryFade = function (selector) {
    var entries = Array.prototype.slice.call(
      document.querySelectorAll(selector)
    );
    if (!entries.length) return;

    var revealEntry = function (entry) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          entry.classList.add("is-visible");
        });
      });
    };

    if (reducedMotion) {
      entries.forEach(function (entry) {
        entry.classList.add("is-visible");
      });
      return;
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (observed) {
          observed.forEach(function (item) {
            if (item.isIntersecting) {
              revealEntry(item.target);
              observer.unobserve(item.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -15% 0px" }
      );
      entries.forEach(function (entry) {
        observer.observe(entry);
      });
    } else {
      entries.forEach(revealEntry);
    }
  };

  initEntryFade("#experience .entry");
  initEntryFade("#education .entry");
  initEntryFade("#projects .project");
  initEntryFade(
    "#personal-life .personal-life__summary, " +
      "#personal-life .personal-life__photography, " +
      "#personal-life .project__split"
  );
})();
