/* ============================================================
   AUDIO — Web Audio ambience + HTML Audio fallback, SFX, prefs
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "loveMuseum.audio";
  const cfg = (window.LOVE_CONFIG && window.LOVE_CONFIG.audio) || {};
  const musicPath = cfg.musicPath || "assets/music/romantic.mp3";
  const baseVolume = typeof cfg.musicVolume === "number" ? cfg.musicVolume : 0.35;

  const state = {
    musicOn: false,
    sfxOn: cfg.sfxEnabled !== false,
    volume: baseVolume,
    ready: false,
    audioEl: null,
    ctx: null,
    ambientGain: null,
    ambientOsc: null,
    ambientFilter: null,
    started: false
  };

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (typeof p.sfxOn === "boolean") state.sfxOn = p.sfxOn;
      if (typeof p.volume === "number") state.volume = Math.min(1, Math.max(0, p.volume));
      if (typeof p.musicOn === "boolean") state.musicOn = p.musicOn;
    } catch (_) { /* ignore */ }
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        musicOn: state.musicOn,
        sfxOn: state.sfxOn,
        volume: state.volume
      }));
    } catch (_) { /* ignore */ }
  }

  function ensureAudioEl() {
    if (state.audioEl) return state.audioEl;
    const el = document.createElement("audio");
    el.src = musicPath;
    el.loop = true;
    el.preload = "auto";
    el.volume = state.volume;
    el.crossOrigin = "anonymous";
    el.addEventListener("error", () => {
      // Music file not available — status shows clearly, no crash
      updateStatus("Music file missing");
    });
    state.audioEl = el;
    return el;
  }

  function ensureCtx() {
    if (state.ctx) return state.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    state.ctx = new AC();
    return state.ctx;
  }

  function startAmbience() {
    const ctx = ensureCtx();
    if (!ctx) return;
    if (state.ambientOsc) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 174.61; // F3 — warm base
    filter.type = "lowpass";
    filter.frequency.value = 480;
    gain.gain.value = 0.0;

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start();

    // Slow LFO for breathing
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();

    state.ambientOsc = osc;
    state.ambientFilter = filter;
    state.ambientGain = gain;
    state.lfo = lfo;

    // Fade in
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.04 * state.volume, t + 2.5);
  }

  function stopAmbience() {
    if (!state.ctx || !state.ambientGain) return;
    const t = state.ctx.currentTime;
    state.ambientGain.gain.cancelScheduledValues(t);
    state.ambientGain.gain.setValueAtTime(state.ambientGain.gain.value, t);
    state.ambientGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    setTimeout(() => {
      try {
        state.ambientOsc && state.ambientOsc.stop();
        state.lfo && state.lfo.stop();
      } catch (_) {}
      state.ambientOsc = null;
      state.lfo = null;
      state.ambientGain = null;
    }, 700);
  }

  function playMusic() {
    if (!state.sfxOn && !state.musicOn) { /* still allow */ }
    const el = ensureAudioEl();
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        state.musicOn = true;
        state.started = true;
        updateStatus("Music playing");
        updateToggle();
        savePrefs();
      }).catch(() => {
        // Autoplay blocked or file missing — try Web Audio ambience instead
        state.musicOn = true;
        startAmbience();
        updateStatus("Ambience on");
        updateToggle();
        savePrefs();
      });
    } else {
      state.musicOn = true;
      startAmbience();
      updateStatus("Ambience on");
      updateToggle();
      savePrefs();
    }
  }

  function pauseMusic() {
    state.musicOn = false;
    if (state.audioEl) {
      try { state.audioEl.pause(); } catch (_) {}
    }
    stopAmbience();
    updateStatus("Music off");
    updateToggle();
    savePrefs();
  }

  function toggleMusic() {
    if (state.musicOn) pauseMusic();
    else playMusic();
  }

  function updateStatus(text) {
    const el = document.getElementById("audio-status");
    if (el) el.textContent = text;
  }

  function updateToggle() {
    const btn = document.getElementById("music-toggle");
    if (!btn) return;
    btn.setAttribute("aria-pressed", state.musicOn ? "true" : "false");
    btn.setAttribute("aria-label", state.musicOn ? "Pause background music" : "Play background music");
    btn.textContent = state.musicOn ? "❚❚" : "♪";
    btn.classList.toggle("is-on", state.musicOn);
  }

  function updateSfx() {
    const btn = document.getElementById("sfx-toggle");
    if (!btn) return;
    btn.setAttribute("aria-pressed", state.sfxOn ? "true" : "false");
    btn.setAttribute("aria-label", state.sfxOn ? "Disable sound effects" : "Enable sound effects");
    btn.classList.toggle("is-on", state.sfxOn);
  }

  function setVolume(v) {
    state.volume = Math.min(1, Math.max(0, v));
    if (state.audioEl) state.audioEl.volume = state.volume;
    if (state.ambientGain && state.ctx) {
      state.ambientGain.gain.setTargetAtTime(0.04 * state.volume, state.ctx.currentTime, 0.2);
    }
    savePrefs();
    const slider = document.getElementById("volume-slider");
    if (slider) slider.value = String(Math.round(state.volume * 100));
  }

  /* ---- SFX via Web Audio (tiny synthesized blips) ---- */
  function sfx(type) {
    if (!state.sfxOn) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);

    if (type === "click") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === "open") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.start(now); osc.stop(now + 0.55);
    } else if (type === "paper") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.03, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === "surprise") {
      // little ascending arpeggio
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        const t = now + i * 0.09;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g).connect(ctx.destination);
        o.start(t); o.stop(t + 0.32);
      });
    }
  }

  function bindUI() {
    const musicBtn = document.getElementById("music-toggle");
    const sfxBtn = document.getElementById("sfx-toggle");
    if (musicBtn) musicBtn.addEventListener("click", () => { toggleMusic(); sfx("click"); });
    if (sfxBtn) sfxBtn.addEventListener("click", () => {
      state.sfxOn = !state.sfxOn;
      updateSfx();
      savePrefs();
      if (state.sfxOn) sfx("click");
    });

    const slider = document.getElementById("volume-slider");
    if (slider) {
      slider.addEventListener("input", (e) => setVolume(parseInt(e.target.value, 10) / 100));
    }

    updateToggle();
    updateSfx();

    // Do not autoplay. First interaction anywhere can start music if user had enabled it.
    const tryResume = () => {
      if (state.musicOn && !state.started) playMusic();
      window.removeEventListener("pointerdown", tryResume);
      window.removeEventListener("keydown", tryResume);
    };
    window.addEventListener("pointerdown", tryResume, { once: true });
    window.addEventListener("keydown", tryResume, { once: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadPrefs();
    bindUI();
    // Update status based on music file availability
    const el = ensureAudioEl();
    el.addEventListener("canplaythrough", () => {
      state.ready = true;
      if (!state.musicOn) updateStatus("Music ready");
    }, { once: true });
    el.addEventListener("error", () => {
      updateStatus("Music file missing");
    }, { once: true });

    // If user previously enabled music, defer autoplay until interaction (handled above)
    if (state.musicOn) {
      updateStatus("Tap to resume music");
    }
  });

  window.LoveAudio = {
    toggleMusic,
    playMusic,
    pauseMusic,
    setVolume,
    sfx
  };
})();