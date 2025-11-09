// /js/game/storage.js
// Leaderboard utilities (localStorage) — i18n-aware prompt, safe fallbacks
(function () {
  const KEY = "gd_lb_v1";
  const MAX = 10;

  // -------- helpers
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const safeJSON = {
    parse(s, d = []) {
      try {
        const x = JSON.parse(s);
        return Array.isArray(x) ? x : d;
      } catch {
        return d;
      }
    },
    stringify(x) {
      try { return JSON.stringify(x); } catch { return "[]"; }
    },
  };

  function loadLB() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = safeJSON.parse(raw, []);
      return arr.filter(
        (x) =>
          x &&
          typeof x.score === "number" &&
          typeof x.wave === "number" &&
          typeof x.name === "string"
      );
    } catch {
      return [];
    }
  }

  function saveLB(arr) {
    try {
      localStorage.setItem(KEY, safeJSON.stringify(arr.slice(0, MAX)));
    } catch {}
  }

  // Ranking: score desc → wave desc → earlier time first
  function rank(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    if (b.wave !== a.wave) return b.wave - a.wave;
    return (a.time || 0) - (b.time || 0);
  }

  function qualifies(arr, score, wave) {
    if (!Array.isArray(arr)) arr = [];
    if (arr.length < MAX) return true;
    const sorted = arr.slice().sort(rank);
    const worst = sorted[sorted.length - 1];
    if (!worst) return true;
    if (score > worst.score) return true;
    if (score < worst.score) return false;
    if (wave > worst.wave) return true;
    if (wave < worst.wave) return false;
    // nếu score=wave giống nhau: cho phép ghi đè theo thời gian
    return true;
  }

  function sanitizeName(name) {
    let s = (name || "").toString().trim();
    if (!s) s = "PLAYER";
    // bỏ kí tự xuống dòng/tab; giới hạn 16 ký tự
    s = s.replace(/[\r\n\t]/g, " ").slice(0, 16);
    return s;
  }

  function addAndSave(arr, { name, score, wave }) {
    const item = {
      name: sanitizeName(name),
      score: +score || 0,
      wave: +wave || 0,
      time: Date.now(),
    };
    const next = arr.concat([item]).sort(rank).slice(0, MAX);
    saveLB(next);
    return next;
  }

  // --- NEW: i18n-aware prompt text
  function _t(key, fallback) {
    try {
      if (window.I18N && typeof I18N.t === "function") return I18N.t(key);
    } catch {}
    return fallback;
  }

  /**
   * Ask for player's name if score qualifies.
   * - If a custom modal is available (window.GD_NameModal.ask -> Promise<string|null>),
   *   it will be used; otherwise falls back to window.prompt (i18n text).
   */
  async function askNameIfTopAsync(arr, score, wave) {
    if (!qualifies(arr, score, wave)) return null;

    // path 1: custom modal (non-blocking) — optional
    try {
      if (window.GD_NameModal && typeof GD_NameModal.ask === "function") {
        const name = await GD_NameModal.ask({
          title: _t("lb.prompt.title", "Top 10!"),
          message: _t(
            "lb.prompt.msg",
            "Congrats! You made the Top 10 — Enter your name:"
          ),
          score,
          wave,
        });
        return name != null ? sanitizeName(name) : null;
      }
    } catch {
      // ignore and fall back to prompt
    }

    // path 2: blocking prompt (fallback, keeps old behavior)
    const msg =
      _t("lb.prompt.msg", "Congrats! You made the Top 10 — Enter your name:") +
      ` (Score: ${score}, W${wave})`;
    let name = prompt(msg, "");
    if (name == null) return null;
    return sanitizeName(name);
  }

  // Backward-compatible wrapper used by existing code
  function askNameIfTop(arr, score, wave) {
    // if caller expects sync behavior, we still can block using prompt:
    // (keep old signature)
    if (!qualifies(arr, score, wave)) return null;
    const msg =
      _t("lb.prompt.msg", "Congrats! You made the Top 10 — Enter your name:") +
      ` (Score: ${score}, W${wave})`;
    let name = prompt(msg, "");
    if (name == null) return null;
    return sanitizeName(name);
  }

  // helper: convert to display rows (used by popup)
  function toRows() {
    const data = loadLB().slice().sort(rank);
    return data.map((x, i) => ({
      rank: i + 1,
      name: x.name,
      score: x.score,
      wave: x.wave,
    }));
  }

  // --- optional utilities (không phá API cũ)
  function clearLB() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }
  function capSize(n) {
    n = clamp(n | 0, 1, 100);
    try {
      const arr = loadLB().slice(0, n);
      saveLB(arr);
    } catch {}
  }

  window.GD_Storage = {
    loadLB,
    saveLB,
    addAndSave,
    askNameIfTop,
    askNameIfTopAsync, // NEW (Promise-based, dùng nếu bạn thêm modal tùy chỉnh)
    toRows,
    clearLB, // NEW
    capSize, // NEW
  };
})();
