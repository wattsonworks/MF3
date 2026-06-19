/* MICHAL FITNESS — ATELIER redesign · interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var nav = document.querySelector(".nav");
  var hero = document.querySelector(".hero");

  /* ---- nav state: over-hero / solid / hide-on-scroll ---- */
  var lastY = 0;
  function heroBottom() { return hero ? hero.offsetHeight - 90 : 200; }
  function onScroll() {
    var y = window.scrollY;
    if (nav) {
      var overHero = y < heroBottom();
      nav.classList.toggle("nav--onhero", overHero);
      nav.classList.toggle("solid", !overHero);
      // hide when scrolling down past hero, show on scroll up
      if (!document.body.classList.contains("menu-open")) {
        nav.classList.toggle("hide", y > heroBottom() + 60 && y > lastY);
      }
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- full-screen menu ---- */
  var burger = document.querySelector(".burger");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) nav.classList.remove("hide");
  }
  if (burger) burger.addEventListener("click", function () {
    setMenu(!document.body.classList.contains("menu-open"));
  });
  document.querySelectorAll(".menu a, .menu__list a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  /* ---- scroll reveal ---- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---- class hover preview (desktop pointer) ---- */
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var list = document.querySelector(".cl-list");
  var preview = document.querySelector(".cl-preview");
  if (fine && list && preview) {
    var pimg = preview.querySelector("img");
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2, cx = tx, cy = ty, raf = null;
    function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      preview.style.left = cx + "px"; preview.style.top = cy + "px";
      preview.style.transform = "translate(-50%,-50%) scale(" + (preview.classList.contains("show") ? 1 : 0.85) + ")";
      raf = requestAnimationFrame(loop);
    }
    list.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    list.addEventListener("mouseenter", function () { if (!raf) loop(); });
    list.querySelectorAll(".cl-row").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        var src = row.getAttribute("data-img");
        if (src) { pimg.src = src; preview.classList.add("show"); }
      });
    });
    list.addEventListener("mouseleave", function () {
      preview.classList.remove("show");
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }
  /* rows are anchors to #pricing/wa anyway; ensure tap works on mobile (no-op) */

  /* ---- count-up stats ---- */
  var counters = document.querySelectorAll("[data-count]");
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, end = parseFloat(el.getAttribute("data-count")), t0 = null, dur = 1400;
      if (reduce) { el.textContent = end; return; }
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  counters.forEach(function (c) { cio.observe(c); });

  /* ---- parallax (subtle) ---- */
  if (!reduce) {
    var pEras = [].map.call(document.querySelectorAll("[data-parallax]"), function (el) {
      return { el: el, speed: parseFloat(el.getAttribute("data-parallax")) || 0.12 };
    });
    var heroImg = document.querySelector(".hero__bg img,.hero__bg video");
    var pTick = false;
    function parallax() {
      pTick = false;
      var y = window.scrollY;
      if (heroImg && y < window.innerHeight) heroImg.style.transform = "scale(1.12) translateY(" + (y * 0.1) + "px)";
      pEras.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var off = (r.top + r.height / 2 - window.innerHeight / 2) * -p.speed;
          p.el.style.transform = "translateY(" + off + "px)";
        }
      });
    }
    window.addEventListener("scroll", function () { if (!pTick) { pTick = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }

  /* ---- hero video: muted autoplay + click-to-unmute (sound prompt) ---- */
  (function () {
    var v = document.getElementById("heroVid");
    if (!v) return;
    var btn = document.getElementById("heroSound");
    v.muted = true; v.loop = true; v.setAttribute("playsinline", "");
    function showBtn(s) { if (btn) btn.hidden = !s; }
    function unmute() { v.muted = false; showBtn(false); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    var pp = v.play(); if (pp && pp.catch) pp.catch(function () {});
    showBtn(true); /* surface the 🔊 prompt — browsers block audio without a gesture */
    if (btn) btn.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); unmute(); });
    v.addEventListener("click", function () { if (v.muted) unmute(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } else { v.pause(); } });
      }, { threshold: 0.15 }).observe(v);
    }
  })();

  /* ---- lightbox ---- */
  var lb = document.querySelector(".lb"), lbImg = lb ? lb.querySelector("img") : null;
  function closeLb() { if (lb) lb.classList.remove("open"); }
  document.querySelectorAll("[data-lb]").forEach(function (el) {
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (lb) { lbImg.src = el.getAttribute("href") || el.getAttribute("data-lb"); lb.classList.add("open"); }
    });
  });
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb__x")) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeLb(); setMenu(false); } });

  /* ---- preloader dismiss (CSS auto-lifts too; this is the failsafe) ---- */
  window.addEventListener("load", function () { document.body.classList.add("loaded"); });
  setTimeout(function () { document.body.classList.add("loaded"); }, 2800);

  /* ---- scroll progress bar ---- */
  (function () {
    var bar = document.getElementById("progress");
    if (!bar) return;
    function upd() {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
    }
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd); upd();
  })();

  /* ---- hero color-wash fade on scroll ---- */
  (function () {
    var wash = document.getElementById("heroWash");
    if (!wash) return;
    function f() { wash.style.opacity = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.8)); }
    window.addEventListener("scroll", f, { passive: true }); f();
  })();

  /* ---- gallery drag-to-scroll ---- */
  (function () {
    var g = document.querySelector(".gal");
    if (!g) return;
    var down = false, sx = 0, sl = 0;
    g.addEventListener("mousedown", function (e) { down = true; g.classList.add("drag"); sx = e.pageX; sl = g.scrollLeft; });
    window.addEventListener("mouseup", function () { down = false; g.classList.remove("drag"); });
    g.addEventListener("mouseleave", function () { down = false; g.classList.remove("drag"); });
    g.addEventListener("mousemove", function (e) { if (!down) return; e.preventDefault(); g.scrollLeft = sl - (e.pageX - sx) * 1.4; });
  })();

  /* ---- custom cursor + magnetic buttons + hero tilt (desktop, fine pointer, motion-ok) ---- */
  if (fine && !reduce) {
    var cur = document.getElementById("cursor");
    if (cur) {
      var cgx = window.innerWidth / 2, cgy = window.innerHeight / 2, cdx = cgx, cdy = cgy;
      (function cloop() { cdx += (cgx - cdx) * 0.2; cdy += (cgy - cdy) * 0.2; cur.style.left = cdx + "px"; cur.style.top = cdy + "px"; requestAnimationFrame(cloop); })();
      window.addEventListener("mousemove", function (e) { cgx = e.clientX; cgy = e.clientY; cur.classList.add("on"); });
      document.addEventListener("mouseleave", function () { cur.classList.remove("on"); });
      document.querySelectorAll("a,button,.cl-row,.gal a").forEach(function (el) {
        el.addEventListener("mouseenter", function () { cur.classList.add("grow"); });
        el.addEventListener("mouseleave", function () { cur.classList.remove("grow"); });
      });
    }
    document.querySelectorAll(".btn,.nav__cta").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.25 + "px," + (e.clientY - r.top - r.height / 2) * 0.3 + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    var heroEl = document.querySelector(".hero"), heroBg = document.querySelector(".hero__bg");
    if (heroEl && heroBg) {
      heroEl.addEventListener("mousemove", function (e) {
        var r = heroEl.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        heroBg.style.transform = "scale(1.06) translate(" + (px * -14) + "px," + (py * -14) + "px)";
      });
      heroEl.addEventListener("mouseleave", function () { heroBg.style.transform = ""; });
    }
  }

  /* ---- preloader: tap or scroll to skip ---- */
  (function () {
    function skip() { document.body.classList.add("loaded"); }
    var pl = document.getElementById("preloader");
    if (pl) pl.addEventListener("click", skip);
    window.addEventListener("scroll", skip, { once: true, passive: true });
  })();

  /* ---- marquee reacts to scroll velocity ---- */
  if (!reduce) {
    var mq = document.querySelector(".marquee");
    if (mq) {
      var mly = window.scrollY, mv = 0;
      (function mtick() {
        var y = window.scrollY; mv += ((y - mly) - mv) * 0.15; mly = y; mv *= 0.9;
        var sk = Math.max(-5, Math.min(5, mv * 0.3));
        mq.style.transform = "skewX(" + sk.toFixed(2) + "deg)";
        requestAnimationFrame(mtick);
      })();
    }
  }

  /* ---- contextual cursor labels ---- */
  if (fine && !reduce) {
    var curEl = document.getElementById("cursor");
    if (curEl) {
      var lbl = document.createElement("span"); lbl.className = "cursor__label"; curEl.appendChild(lbl);
      document.addEventListener("mouseover", function (e) {
        var t = e.target.closest ? e.target.closest(".cl-row,.gal") : null;
        if (t && t.classList.contains("cl-row")) { curEl.classList.add("labeled"); lbl.textContent = "צפי ↗"; }
        else if (t) { curEl.classList.add("labeled"); lbl.textContent = "גררי"; }
        else { curEl.classList.remove("labeled"); }
      });
    }
  }

  /* ---- footer year ---- */
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
