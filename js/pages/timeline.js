/* ============================================================
   TIMELINE PAGE — render milestones + scroll reveal
   ============================================================ */
(function () {
  "use strict";

  function init() {
    const mount = document.getElementById("timeline-list");
    if (!mount) return;
    const items = (window.LOVE_CONFIG && window.LOVE_CONFIG.timeline) || [];

    mount.innerHTML = items.map((it, i) => `
      <div class="tl-item reveal-on-scroll" data-index="${i}">
        <div class="tl-dot" aria-hidden="true"></div>
        <article class="glass tl-card">
          <div class="tl-photo">
            <img src="${it.photo}" alt="${it.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span>Photo placeholder</span>';" />
          </div>
          <div>
            <p class="tl-date">${it.date}</p>
            <h2 class="tl-title">${it.title}</h2>
            <p class="tl-story">${it.story}</p>
          </div>
        </article>
      </div>
    `).join("");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    mount.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", init);
})();