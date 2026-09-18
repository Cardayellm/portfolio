/* Photo gallery lightbox: open, prev/next, keyboard, swipe, focus trap. */
(function () {
  "use strict";

  var gallery = document.getElementById("gallery");
  var lightbox = document.getElementById("lightbox");
  if (!gallery || !lightbox) return;

  /* Shuffle the photos into a new random order on every load. Reorder the
     DOM itself (not just a data array) so the lightbox's prev/next order
     and the visual grid order always match. */
  (function shuffleGallery() {
    var items = Array.prototype.slice.call(gallery.children);
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = items[i]; items[i] = items[j]; items[j] = t;
    }
    items.forEach(function (li) { gallery.appendChild(li); });

    /* Always start scrolled to the far left, regardless of the shuffle
       above or the browser's own scroll-position restoration on reload. */
    gallery.scrollLeft = 0;
    requestAnimationFrame(function () { gallery.scrollLeft = 0; });
  })();

  var img = lightbox.querySelector(".lightbox__img");
  var count = lightbox.querySelector(".lightbox__count");
  var btnClose = lightbox.querySelector(".lightbox__close");
  var btnPrev = lightbox.querySelector(".lightbox__nav--prev");
  var btnNext = lightbox.querySelector(".lightbox__nav--next");

  var triggers = Array.prototype.slice.call(
    gallery.querySelectorAll(".gallery__item")
  );
  var sources = triggers.map(function (btn) {
    return {
      full: btn.getAttribute("data-full"),
      alt: (btn.querySelector("img") || {}).alt || "Photograph"
    };
  });

  var current = 0;
  var lastFocused = null;

  function render() {
    var item = sources[current];
    img.src = item.full;
    img.alt = item.alt;
    count.textContent = current + 1 + " / " + sources.length;
  }

  function open(index) {
    current = index;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    render();
    btnClose.focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    img.src = "";
    document.removeEventListener("keydown", onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(delta) {
    current = (current + delta + sources.length) % sources.length;
    render();
  }

  function onKey(e) {
    switch (e.key) {
      case "Escape": close(); break;
      case "ArrowLeft": step(-1); break;
      case "ArrowRight": step(1); break;
      case "Tab": {
        var focusable = [btnPrev, btnNext, btnClose];
        var i = focusable.indexOf(document.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? i - 1 : i + 1;
        focusable[(next + focusable.length) % focusable.length].focus();
        break;
      }
    }
  }

  triggers.forEach(function (btn, i) {
    btn.addEventListener("click", function () { open(i); });
  });
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", function () { step(-1); });
  btnNext.addEventListener("click", function () { step(1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.classList.contains("lightbox__dialog")) close();
  });

  /* Touch swipe */
  var startX = 0;
  lightbox.addEventListener("touchstart", function (e) {
    startX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* --- Carousel side buttons ------------------------------------------- */
  var wrap = gallery.closest(".gallery-wrap");
  if (wrap) {
    var navPrev = wrap.querySelector(".gallery-nav--prev");
    var navNext = wrap.querySelector(".gallery-nav--next");

    var scrollByPage = function (dir) {
      gallery.scrollBy({ left: dir * gallery.clientWidth * 0.9, behavior: "smooth" });
    };

    if (navPrev) navPrev.addEventListener("click", function () { scrollByPage(-1); });
    if (navNext) navNext.addEventListener("click", function () { scrollByPage(1); });

    var updateNavState = function () {
      var max = gallery.scrollWidth - gallery.clientWidth;
      var atStart = gallery.scrollLeft <= 1;
      var atEnd = gallery.scrollLeft >= max - 1;
      if (navPrev) navPrev.hidden = atStart;
      if (navNext) navNext.hidden = max <= 1 || atEnd;
    };

    gallery.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", updateNavState);
    updateNavState();
  }
})();
