/* ============================================================
   Ilutegu – scroll & load reveal animations
   Reusable, dependency-free. Pairs with the reveal system in style.css.

   Markup:
     [data-reveal]              -> element fades + slides up on reveal
     [data-reveal="scale"]      -> gentle fade + scale (images)
     [data-reveal="btn"]        -> fade + slight scale (buttons, appear last)
     [data-reveal-group="90"]   -> staggers its direct [data-reveal] children
                                    by N ms (add data-reveal-base for a head start)
     [data-reveal-now]          -> descendants reveal on load (e.g. the hero)
                                    instead of waiting for scroll

   Only opacity + transform animate; each element animates once.
   Honors prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Apply staggered delays to the direct children of every reveal group.
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-reveal-group]"),
    function (group) {
      var step = parseInt(group.getAttribute("data-reveal-group"), 10);
      if (isNaN(step)) step = 90;
      var base = parseInt(group.getAttribute("data-reveal-base"), 10) || 0;
      var i = 0;
      Array.prototype.forEach.call(group.children, function (child) {
        if (child.hasAttribute("data-reveal")) {
          child.style.setProperty("--reveal-delay", (base + i * step) + "ms");
          i++;
        }
      });
    }
  );

  var items = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  // When the entrance animation finishes, mark it done so component
  // hover transforms are no longer overridden by the filled animation.
  function markDone(e) {
    if (e.target === this) this.classList.add("reveal-done");
  }
  function reveal(el) {
    el.classList.add("is-visible");
    el.addEventListener("animationend", markDone);
  }

  if (reduce) {
    items.forEach(function (el) {
      el.classList.add("is-visible", "reveal-done");
    });
    return;
  }

  var onLoad = [];
  var onScroll = [];
  items.forEach(function (el) {
    (el.closest("[data-reveal-now]") ? onLoad : onScroll).push(el);
  });

  // Above-the-fold content (hero) reveals right after first paint.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      onLoad.forEach(reveal);
    });
  });

  // Everything else reveals as it scrolls into view.
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    onScroll.forEach(function (el) { io.observe(el); });
  } else {
    onScroll.forEach(reveal);
  }
})();
