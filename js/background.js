/* ============================================================
   BACKGROUND — CSS parallax + canvas particles (lightweight)
   Shared across all pages. No WebGL here (that's three-scene.js).
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.LOVE_CONFIG || {};
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vis = cfg.visuals || {};
  const reduceMotion = prefersReduced || vis.reducedMotionRespect === false ? prefersReduced : prefersReduced;

  function initParallax() {
    const layers = document.querySelectorAll("[data-parallax]");
    if (!layers.length || reduceMotion) return;
    const pointer = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };

    window.addEventListener("pointermove", (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function tick() {
      smooth.x += (pointer.x - smooth.x) * 0.08;
      smooth.y += (pointer.y - smooth.y) * 0.08;
      layers.forEach((el) => {
        const depth = parseFloat(el.getAttribute("data-parallax")) || 0.3;
        el.style.transform = `translate3d(${smooth.x * depth * 20}px, ${smooth.y * depth * 20}px, 0)`;
      });
      requestAnimationFrame(tick);
    }
    if (!document.hidden) requestAnimationFrame(tick);
  }

  function initParticles() {
    const canvas = document.getElementById("bg-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    const count = reduceMotion ? Math.min(20, vis.particleCount || 60) : (vis.particleCount || 90);

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.05,
        hue: Math.random() > 0.5 ? 330 : 280,
        alpha: Math.random() * 0.5 + 0.2
      };
    }

    function seed() {
      particles = [];
      for (let i = 0; i < count; i++) particles.push(makeParticle());
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue}, 80%, 75%, ${p.alpha})`);
        g.addColorStop(1, `hsla(${p.hue}, 80%, 75%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!document.hidden) requestAnimationFrame(frame);
    }

    window.addEventListener("resize", () => { resize(); seed(); }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) requestAnimationFrame(frame);
    });

    resize();
    seed();
    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initParallax();
    initParticles();
    // Add body class for stagger animations
    document.body.classList.add("page-ready");
  });
})();