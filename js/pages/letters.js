/* ============================================================
   LETTERS PAGE — envelope open + typewriter with skip
   ============================================================ */
(function () {
  "use strict";

  const typeState = new WeakMap();

  function typeText(el, text, speed = 22) {
    if (typeState.has(el)) {
      cancelAnimationFrame(typeState.get(el).raf);
    }
    el.textContent = "";
    el.classList.add("typewriter");
    let i = 0;
    const state = { raf: null, done: false };
    typeState.set(el, state);

    function step() {
      if (i >= text.length) {
        el.classList.remove("typewriter");
        state.done = true;
        return;
      }
      // batch a few chars per frame for smoothness
      el.textContent += text.slice(i, i + 2);
      i += 2;
      state.raf = requestAnimationFrame(step);
    }
    state.raf = requestAnimationFrame(step);
  }

  function skip(el, fullText) {
    const state = typeState.get(el);
    if (state && state.raf) cancelAnimationFrame(state.raf);
    el.textContent = fullText;
    el.classList.remove("typewriter");
    if (state) state.done = true;
  }

  function renderLetter(letter, i) {
    return `
      <article class="glass letter-card" id="letter-${i}">
        <div class="letter-envelope">
          <div class="letter-head">
            <div>
              <h2 class="letter-title">${letter.title}</h2>
              <p class="letter-teaser">Sealed with love — press to open.</p>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn" data-action="open" data-i="${i}">Open Letter</button>
              <button class="btn btn-ghost" data-action="skip" data-i="${i}" hidden>Skip Animation</button>
            </div>
          </div>
        </div>
        <div class="letter-body" aria-live="polite">
          <div class="letter-body-inner" data-body="${i}"></div>
        </div>
      </article>
    `;
  }

  function init() {
    const grid = document.getElementById("letters-grid");
    if (!grid) return;
    const letters = (window.LOVE_CONFIG && window.LOVE_CONFIG.letters) || [];
    grid.innerHTML = letters.map(renderLetter).join("");

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const i = parseInt(btn.dataset.i, 10);
      const card = document.getElementById(`letter-${i}`);
      if (!card) return;
      const body = card.querySelector(`[data-body="${i}"]`);
      const skipBtn = card.querySelector('button[data-action="skip"]');
      const fullText = letters[i].body;

      if (btn.dataset.action === "open") {
        card.classList.add("is-open");
        window.LoveAudio && window.LoveAudio.sfx("paper");
        btn.textContent = "Letter Opened";
        btn.disabled = true;
        skipBtn.hidden = false;
        // Delay slightly so the envelope animation reads first
        setTimeout(() => typeText(body, fullText), 380);
      } else if (btn.dataset.action === "skip") {
        skip(body, fullText);
        skipBtn.hidden = true;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();