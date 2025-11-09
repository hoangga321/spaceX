// js/game/game_panel.js
// UI panel & modal logic

(function () {
  const byId = (id) => document.getElementById(id);
  const canvas = byId("game");

  function blurAll() {
    try { (document.activeElement instanceof HTMLElement) && document.activeElement.blur(); } catch {}
    document.querySelectorAll("button,select,input[type=range]").forEach((el) => { try { el.blur(); } catch {} });
    try { canvas?.focus(); } catch {}
  }

  // ===== Buttons
  const btnStart = byId("btnStartInGame");
  const btnBack  = byId("btnBackHome");
  const btnPause = byId("btnPause");
  const btnRestart = byId("btnRestart");
  const btnHow   = byId("btnHowInGame");
  const btnLB    = byId("btnLB");

  btnStart && (btnStart.onclick = () => {
    // 1) Unlock audio bằng 1 SFX rất nhỏ (đảm bảo là user-gesture thật)
    try { window.GD_Audio && window.GD_Audio.sfx && window.GD_Audio.sfx.score(); } catch {}
    // 2) (giữ nguyên) bắn Enter để tương thích logic phím
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter" }));
    // 3) Phát `gd-start` để main.js chuyển state và (sau đó) gọi bù BGM
    window.dispatchEvent(new CustomEvent("gd-start"));
    blurAll();
  });

  btnBack && (btnBack.onclick = () => {
    blurAll();
    const base = location.pathname.replace(/game\.html?$/, "") || (location.pathname.endsWith("/") ? location.pathname : location.pathname + "/");
    location.href = base + "index.html";
  });

  btnPause && (btnPause.onclick = () => { window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP" })); blurAll(); });
  btnRestart && (btnRestart.onclick = () => { window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyR" })); blurAll(); });
  btnHow && (btnHow.onclick = () => alert(I18N.t("how.short")));

  // ===== Leaderboard Modal =====
  const lbModal = byId("lbModal");
  const lbBody = byId("lbBody");
  const lbBackdrop = byId("lbBackdrop");
  const lbClose = byId("lbClose");

  function renderLB(rows) {
    const c = (k) => I18N.t(k);
    const thead = `
      <thead>
        <tr>
          <th style="width:48px;text-align:right">${c("lb.rank")}</th>
          <th>${c("lb.name")}</th>
          <th style="width:96px;text-align:right">${c("lb.score")}</th>
          <th style="width:80px;text-align:right">${c("lb.wave")}</th>
        </tr>
      </thead>`;
    const tbody = rows.map(r => `
        <tr>
          <td style="text-align:right">${r.rank}</td>
          <td>${r.name}</td>
          <td style="text-align:right">${r.score}</td>
          <td style="text-align:right">W${r.wave}</td>
        </tr>`).join("");
    return `<div class="table-wrap"><table class="table">${thead}<tbody>${tbody}</tbody></table></div>`;
  }

  function refreshLeaderboard() {
    const rows = window.GD_Storage?.toRows?.() || [];
    lbBody.innerHTML = rows.length
      ? renderLB(rows)
      : `<div class="small" data-i18n="lb.empty">${I18N.t("lb.empty")}</div>`;
    I18N.apply(lbModal);
  }

  function openLB() {
    refreshLeaderboard();
    lbModal.classList.remove("hidden");
    lbBackdrop.classList.remove("hidden");
  }
  function closeLB() {
    lbModal.classList.add("hidden");
    lbBackdrop.classList.add("hidden");
    blurAll();
  }

  btnLB && (btnLB.onclick = () => { openLB(); blurAll(); });
  lbClose && (lbClose.onclick = closeLB);
  lbBackdrop && (lbBackdrop.onclick = closeLB);
  window.addEventListener("keydown", (e) => {
    if (!lbModal.classList.contains("hidden") && e.key === "Escape") closeLB();
  });

  // ===== Language select (áp dụng tức thời & refresh popup nếu đang mở)
  const langSelectGame = byId("langSelectGame");
  if (langSelectGame) {
    langSelectGame.value = I18N.get() || new URLSearchParams(location.search).get("lang") || "vi";
    langSelectGame.onchange = (e) => {
      I18N.set(e.target.value);
      I18N.apply(document);
      // báo cho main cập nhật lại chip "Mode/Diff"
      window.dispatchEvent(new Event('gd-lang-changed'));
      if (!lbModal.classList.contains("hidden")) refreshLeaderboard();
      blurAll();
    };
  }

  // ===== Volume sliders (BGM / SFX)
  const bgmVol = byId("bgmVol");
  const sfxVol = byId("sfxVol");
  const bgmVolVal = byId("bgmVolVal");
  const sfxVolVal = byId("sfxVolVal");

  function syncVolUI() {
    const a = window.GD_Audio;
    if (!a) return;
    const bv = a.getBgmVolume ? a.getBgmVolume() : 70;
    const sv = a.getSfxVolume ? a.getSfxVolume() : 80;
    if (bgmVol) bgmVol.value = String(bv);
    if (sfxVol) sfxVol.value = String(sv);
    if (bgmVolVal) bgmVolVal.textContent = `${bv}%`;
    if (sfxVolVal) sfxVolVal.textContent = `${sv}%`;
  }
  function wireVolHandlers() {
    const a = window.GD_Audio;
    if (!a) return;
    if (bgmVol) {
      bgmVol.addEventListener('input', (e)=> {
        const v = Number(e.target.value|0);
        a.setBgmVolume && a.setBgmVolume(v);
        bgmVolVal && (bgmVolVal.textContent = `${v}%`);
      });
    }
    if (sfxVol) {
      sfxVol.addEventListener('input', (e)=> {
        const v = Number(e.target.value|0);
        a.setSfxVolume && a.setSfxVolume(v);
        sfxVolVal && (sfxVolVal.textContent = `${v}%`);
      });
    }
  }
  window.addEventListener('gd-audio-ready', ()=>{ syncVolUI(); wireVolHandlers(); });
  if (window.GD_Audio) { syncVolUI(); wireVolHandlers(); }

  // ===== Reduce Flash & HUD toggle
  const btnReduceFlash = byId('btnReduceFlash');
  const btnHudSize     = byId('btnHudSize');
  const FLAGS = (window.GD_FLAGS = window.GD_FLAGS || { reduceFlash:false, hudCompact:false });

  function applyReduceFlash() {
    document.body.classList.toggle('reduce-flash', !!FLAGS.reduceFlash);
    window.dispatchEvent(new Event('gd-flags-changed'));
  }
  function applyHudCompact() {
    const hud = document.querySelector('.hud');
    if (!hud) return;
    hud.classList.toggle('hud-compact', !!FLAGS.hudCompact);
  }

  btnReduceFlash && (btnReduceFlash.onclick = () => {
    FLAGS.reduceFlash = !FLAGS.reduceFlash;
    applyReduceFlash();
    blurAll();
  });
  btnHudSize && (btnHudSize.onclick = () => {
    FLAGS.hudCompact = !FLAGS.hudCompact;
    applyHudCompact();
    blurAll();
  });

  // khởi động
  applyReduceFlash();
  applyHudCompact();
})();
