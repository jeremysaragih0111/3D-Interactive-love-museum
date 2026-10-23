/* ============================================================
   SURPRISE PAGE — gift open animation + heart rain
   Reduced-motion aware, throttled particle count, rAF cleanup
   ============================================================ */
(function () {
  "use strict";

  let burstRaf = null;
  let burstParticles = [];
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function spawnHearts() {
    const layer = document.getElementById("burst-layer");
    if (!layer) return;
    if (prefersReduced) return;

    const count = 36;
    layer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "burst-heart";
      el.textContent = ["♥", "❀", "✦"][i % 3];
      el.style.left = (Math.random() * 100) + "vw";
      el.style.top = (Math.random() * 20 + 60) + "vh";
      el.style.fontSize = (14 + Math.random() * 22) + "px";
      el.style.animationDelay = (Math.random() * 0.9) + "s";
      el.style.setProperty("--r", (Math.random() * 80 - 40) + "deg");
      el.style.color = i % 2 ? "var(--gold)" : "var(--rose)";
      layer.appendChild(el);
    }
    setTimeout(() => { layer.innerHTML = ""; }, 3200);
  }

  function revealMessage() {
    const msg = document.getElementById("surprise-message");
    if (msg) msg.classList.add("is-visible");
  }

  function openGift() {
    const stage = document.getElementById("surprise-stage");
    const btn = document.getElementById("gift-btn");
    const cfg = window.LOVE_CONFIG.surprise;
    if (stage) stage.classList.add("is-opening");
    if (btn) btn.disabled = true;

    window.LoveAudio && window.LoveAudio.sfx("surprise");
    spawnHearts();

    setTimeout(() => {
      revealMessage();
      const t = document.getElementById("surprise-text");
      const s = document.getElementById("surprise-signature");
      if (t) t.textContent = cfg.message;
      if (s) s.textContent = `— ${cfg.signature}`;
    }, 600);
  }

  function replay() {
    const stage = document.getElementById("surprise-stage");
    const btn = document.getElementById("gift-btn");
    const msg = document.getElementById("surprise-message");
    if (msg) msg.classList.remove("is-visible");
    if (stage) stage.classList.remove("is-opening");
    if (btn) btn.disabled = false;
    setTimeout(openGift, 80);
  }

  function init() {
    const teaser = document.getElementById("surprise-teaser");
    if (teaser && window.LOVE_CONFIG.surprise.teaser) teaser.textContent = window.LOVE_CONFIG.surprise.teaser;

    const btn = document.getElementById("gift-btn");
    if (btn) btn.addEventListener("click", openGift);

    const replayBtn = document.getElementById("replay-btn");
    if (replayBtn) replayBtn.addEventListener("click", () => { window.LoveAudio && window.LoveAudio.sfx("click"); replay(); });
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("beforeunload", () => { if (burstRaf) cancelAnimationFrame(burstRaf); });
})();