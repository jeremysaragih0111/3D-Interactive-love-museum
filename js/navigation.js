/* ============================================================
   NAVIGATION — shared header, active state, mobile menu
   ============================================================ */
(function () {
  "use strict";

  const PAGES = [
    { href: "index.html", label: "Home" },
    { href: "beginning.html", label: "Beginning" },
    { href: "timeline.html", label: "Timeline" },
    { href: "gallery.html", label: "Gallery" },
    { href: "letters.html", label: "Letters" },
    { href: "our-time.html", label: "Our Time" },
    { href: "surprise.html", label: "Surprise" },
    { href: "forever.html", label: "Forever" }
  ];

  function currentPage() {
    const path = window.location.pathname.split("/").pop();
    return path === "" ? "index.html" : path;
  }

  function buildHeader() {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    const cfg = window.LOVE_CONFIG || {};
    const title = (cfg.museum && cfg.museum.title) || "Love Museum";
    const active = currentPage();

    const links = PAGES.map((p) => {
      const isActive = p.href === active;
      return `<li>
        <a href="${p.href}" ${isActive ? 'aria-current="page" class="is-active"' : ""}>
          ${p.label}
        </a>
      </li>`;
    }).join("");

    mount.innerHTML = `
      <header class="site-header" role="banner">
        <a class="brand" href="index.html" aria-label="${title} — home">
          <span class="brand-heart" aria-hidden="true">♥</span>
          <span class="brand-text">
            <span class="brand-title">${title}</span>
            <span class="brand-sub">Digital Anniversary</span>
          </span>
        </a>

        <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>

        <nav id="primary-nav" class="primary-nav" aria-label="Primary">
          <ul>${links}</ul>
        </nav>

        <div class="audio-controls" role="group" aria-label="Audio controls">
          <button id="music-toggle" class="icon-btn" aria-pressed="false" aria-label="Play background music">♪</button>
          <button id="sfx-toggle" class="icon-btn" aria-pressed="true" aria-label="Toggle sound effects">✦</button>
          <span id="audio-status" class="audio-status" aria-live="polite">Audio off</span>
        </div>
      </header>
    `;

    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("primary-nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close mobile menu on navigation
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function buildFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    const cfg = window.LOVE_CONFIG || {};
    const a = (cfg.couple && cfg.couple.nameA) || "A";
    const b = (cfg.couple && cfg.couple.nameB) || "B";
    mount.innerHTML = `
      <footer class="site-footer" role="contentinfo">
        <p>Made with <span aria-hidden="true">♥</span> for ${a} &amp; ${b} — a digital love museum.</p>
        <p class="footer-fine">All memories are placeholders. Personalize via <code>js/config.js</code>.</p>
      </footer>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    buildFooter();
  });
})();