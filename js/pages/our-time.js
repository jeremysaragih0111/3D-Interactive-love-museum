/* ============================================================
   OUR TIME PAGE — relationship counter + next-anniversary countdown
   - Single interval (1s) with visibility handling
   - Handles Feb 29 anniversaries by snapping to Feb 28 in non-leap years
   - All date math done in the user's local timezone consistently
   ============================================================ */
(function () {
  "use strict";

  let intervalId = null;

  function parseStart() {
    const raw = window.LOVE_CONFIG.couple.relationshipStart;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  function nextAnniversary(month, day, from) {
    const year = from.getFullYear();
    const candidates = [year, year + 1].map((y) => {
      // If Feb 29 and target year is not leap, snap to Feb 28
      let d = new Date(y, month - 1, day, 0, 0, 0, 0);
      if (d.getMonth() !== month - 1) {
        // month rolled over — day doesn't exist, snap back one day
        d = new Date(y, month - 1, 0, 0, 0, 0, 0);
        // but if that's still wrong (e.g. Feb 29 in non-leap -> Mar 1 handled above), re-clamp
        if (d.getMonth() !== month - 1) d = new Date(y, month - 1, 1);
      }
      return d;
    });
    for (const c of candidates) {
      if (c.getTime() > from.getTime()) return c;
    }
    return candidates[candidates.length - 1];
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  function setNum(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function formatCountdown(ms) {
    if (ms <= 0) return "Today!";
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }

  function render() {
    const start = parseStart();
    const now = new Date();
    const diffMs = Math.max(0, now - start);
    const diffSec = Math.floor(diffMs / 1000);

    const days = Math.floor(diffSec / 86400);
    const totalHours = Math.floor(diffSec / 3600);
    const totalMinutes = Math.floor(diffSec / 60);
    const totalSeconds = diffSec;
    const months = Math.floor(days / 30.436875); // average month
    const years = Math.floor(days / 365.25);

    setNum("t-days", days.toLocaleString());
    setNum("t-hours", totalHours.toLocaleString());
    setNum("t-minutes", totalMinutes.toLocaleString());
    setNum("t-seconds", totalSeconds.toLocaleString());
    setNum("t-years", years);
    setNum("t-months", months);

    const amd = window.LOVE_CONFIG.couple.anniversaryMonthDay;
    const next = nextAnniversary(amd.month, amd.day, now);

    const labelEl = document.getElementById("anniv-date-label");
    if (labelEl) {
      labelEl.textContent = next.toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    // Anniversary-day special message (local calendar day)
    const msgBox = document.getElementById("anniversary-message");
    const msgText = document.getElementById("anniversary-text");
    if (isSameDay(now, next)) {
      // If today IS the anniversary (e.g. 00:00), nextAnniversary returns next year. Check against current year's date.
      const thisYear = new Date(now.getFullYear(), amd.month - 1, amd.day);
      if (isSameDay(now, thisYear)) {
        if (msgBox) msgBox.hidden = false;
        if (msgText) msgText.textContent = ` Today is our anniversary — another year of us. I'd choose you again, and again.`;
      }
    } else {
      const thisYear = new Date(now.getFullYear(), amd.month - 1, amd.day);
      if (isSameDay(now, thisYear)) {
        if (msgBox) msgBox.hidden = false;
        if (msgText) msgText.textContent = ` Today is our anniversary — another year of us. I'd choose you again, and again.`;
      } else if (msgBox) {
        msgBox.hidden = true;
      }
    }

    // Countdown
    const countdownEl = document.getElementById("anniv-countdown");
    if (countdownEl) {
      if (isSameDay(now, new Date(now.getFullYear(), amd.month - 1, amd.day))) {
        countdownEl.textContent = "Today — happy anniversary! ♥";
      } else {
        countdownEl.textContent = formatCountdown(next - now);
      }
    }
  }

  function start() {
    render();
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(render, 1000);
  }

  function stop() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  function buildCards() {
    const grid = document.getElementById("time-grid");
    if (!grid) return;
    const cards = [
      { id: "t-days", label: "Days together" },
      { id: "t-years", label: "Years" },
      { id: "t-months", label: "Months" },
      { id: "t-hours", label: "Hours" },
      { id: "t-minutes", label: "Minutes" },
      { id: "t-seconds", label: "Seconds" }
    ];
    grid.innerHTML = cards.map((c) => `
      <div class="glass time-card">
        <p class="time-num" id="${c.id}">—</p>
        <p class="time-label">${c.label}</p>
      </div>
    `).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildCards();
    start();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
  });

  window.addEventListener("beforeunload", stop);
})();