(() => {
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  let selectedMode = 'arcade';
  const modeCards = qsa('.mode-card').filter(el => !el.classList.contains('disabled'));
  modeCards.forEach(el => {
    el.addEventListener('click', () => {
      modeCards.forEach(m => m.style.outline = '');
      el.style.outline = '2px solid var(--primary)';
      selectedMode = el.dataset.mode;
      openDiff();
    });
  });

  // Nút Play -> mở modal độ khó (nếu chưa chọn card)
  qs('#btnPlay').addEventListener('click', () => openDiff());

  // Modal độ khó
  const modal = qs('#modalDiff'), bd = qs('#backdrop');
  function openDiff(){ modal.classList.remove('hidden'); bd.classList.remove('hidden'); }
  function closeDiff(){ modal.classList.add('hidden'); bd.classList.add('hidden'); }
  qs('#btnCancel').addEventListener('click', closeDiff);
  bd.addEventListener('click', closeDiff);

  qs('#btnStart').addEventListener('click', () => {
    const diff = (qs('input[name="difficulty"]:checked')?.value) || 'normal';

    // Ngôn ngữ hiện tại (từ i18n)
    const lang = (window.I18N?.get && window.I18N.get()) || 'vi';

    // Điều hướng sang game.html kèm query string
    const url = new URL(location.origin + location.pathname.replace(/index\.html?$/,'') + 'game.html');
    url.searchParams.set('mode', selectedMode);
    url.searchParams.set('diff', diff);
    url.searchParams.set('lang', lang);

    // Bỏ focus để tránh outline khi sang trang
    try { (document.activeElement instanceof HTMLElement) && document.activeElement.blur(); } catch{}

    location.href = url.toString();
  });

  // Modal How-to
  const mh = qs('#modalHow'), bdh = qs('#backdropHow');
  qs('#btnHow').addEventListener('click', ()=>{ mh.classList.remove('hidden'); bdh.classList.remove('hidden'); });
  qs('#btnHowClose').addEventListener('click', ()=>{ mh.classList.add('hidden'); bdh.classList.add('hidden'); });
  bdh.addEventListener('click', ()=>{ mh.classList.add('hidden'); bdh.classList.add('hidden'); });

  // (Tùy chọn) Load defaults từ config
  fetch('config/game.json').then(r=>r.json()).then(cfg=>{
    selectedMode = cfg.defaultMode || selectedMode;
    qs(`.mode-card[data-mode="${selectedMode}"]`)?.scrollIntoView({behavior:'smooth', block:'center'});
  }).catch(()=>{});
})();
