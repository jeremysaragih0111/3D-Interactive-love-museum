/* ============================================================
   GALLERY PAGE — tilt cards + accessible lightbox
   ============================================================ */
(function () {
  "use strict";

  let items = [];
  let index = 0;
  let lastFocus = null;

  function renderCard(item, i) {
    return `
      <article class="g-card" data-index="${i}" tabindex="0" role="button"
               aria-label="Open photo: ${item.caption}">
        <img src="${item.src}" alt="${item.caption}"
             onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('afterbegin','<div class=&quot;fallback&quot; aria-hidden=&quot;true&quot;>♥</div>');" />
        <p class="g-caption">${item.caption}</p>
      </article>
    `;
  }

  function tilt(card) {
    const max = 10;
    card.addEventListener("pointermove", (e) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(6px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
    });
  }

  function openLightbox(i) {
    index = (i + items.length) % items.length;
    const lb = document.getElementById("lightbox");
    const media = document.getElementById("lb-media");
    const cap = document.getElementById("lb-caption");
    const it = items[index];
    media.innerHTML = `<img src="${it.src}" alt="${it.caption}"
      onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('afterbegin','<div class=&quot;lb-fallback&quot; aria-hidden=&quot;true&quot;>♥</div>');" />`;
    cap.textContent = it.caption;
    lb.classList.add("is-open");
    lastFocus = document.activeElement;
    document.getElementById("lb-close").focus();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    const lb = document.getElementById("lightbox");
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function bindLightbox() {
    const lb = document.getElementById("lightbox");
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLightbox();
    });
    document.getElementById("lb-close").addEventListener("click", closeLightbox);
    document.getElementById("lb-prev").addEventListener("click", () => openLightbox(index - 1));
    document.getElementById("lb-next").addEventListener("click", () => openLightbox(index + 1));

    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeLightbox(); }
      if (e.key === "ArrowLeft") { openLightbox(index - 1); }
      if (e.key === "ArrowRight") { openLightbox(index + 1); }
      if (e.key === "Tab") {
        // trap focus inside lightbox
        const focusables = lb.querySelectorAll("button");
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function init() {
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;
    items = (window.LOVE_CONFIG && window.LOVE_CONFIG.gallery) || [];
    grid.innerHTML = items.map(renderCard).join("");

    grid.querySelectorAll(".g-card").forEach((card) => {
      tilt(card);
      const i = parseInt(card.dataset.index, 10);
      card.addEventListener("click", () => { window.LoveAudio && window.LoveAudio.sfx("click"); openLightbox(i); });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
      });
    });

    bindLightbox();
  }

  document.addEventListener("DOMContentLoaded", init);
})();