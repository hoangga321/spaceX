// js/core/i18n.js
(function(){
  const KEY = 'gd_lang';

  const dict = {
    vi:{
      "panel.quick.title":"Nhanh","panel.quick.pause":"Tạm dừng","panel.quick.restart":"Chơi lại",
      "panel.quick.how":"Hướng dẫn","panel.quick.leaderboard":"Bảng xếp hạng",
      "panel.lang.title":"Ngôn ngữ",
      "panel.skill.title":"Kỹ năng","panel.skill.desc":"Nhấn F để kích hoạt FEVER khi đầy.",
      "panel.settings.title":"Cài đặt","panel.settings.bgm":"BGM","panel.settings.sfx":"SFX",
      "panel.settings.flash":"Giảm chớp","panel.settings.hud":"HUD",
      "panel.guide.title":"Mẹo nhanh",
      "guide.move":"Di chuyển: A/D hoặc ←/→",
      "guide.shoot":"Bắn: Space (giữ = nhanh nhưng nóng)",
      "guide.pause":"P: Tạm dừng / R: Chơi lại",

      "hud.score":"Score: {v}","hud.wave":"Wave: {v}","hud.hp":"HP: {v}","hud.hint":"Mode: -, Diff: -",

      "landing.headline":"Chọn chế độ & bắt đầu chơi","landing.sub":"Di chuyển trái/phải – Bắn – Né – Nạp FEVER. Chỉ với HTML/CSS/JS.",
      "landing.play":"Chơi ngay","landing.how":"Hướng dẫn","landing.start":"Bắt đầu",
      "landing.arcade.title":"Arcade","landing.arcade.badge":"Loop vô hạn","landing.arcade.desc":"Waves tăng dần, coin & shop, mini-boss/boss định kỳ.",
      "landing.boss.title":"Boss Rush","landing.boss.badge":"5 Boss liên tiếp","landing.boss.desc":"Đua thời gian, nâng cấp tạm sau mỗi boss.",

      /* NEW: Time Attack */
      "landing.time.title":"Time Attack",
      "landing.time.badge":"3 phút",
      "landing.time.desc":"Nhịp nhanh, mini-boss cuối trận. (sắp có)",

      "diff.title":"Chọn độ khó","diff.hint":"Normal được khuyến nghị cho người mới.",
      "diff.easy":"Dễ","diff.normal":"Thường","diff.hard":"Khó","diff.insane":"Rất khó",
      "common.cancel":"Huỷ",
      "common.backHome":"Về trang chủ",
      "game.startBtn":"Bắt đầu",
      "ready.hint":"Nhấn Bắt đầu để chơi",
      "how.short":"Di chuyển trái/phải, bắn Space",

      "lb.title":"Bảng xếp hạng","lb.empty":"Chưa có dữ liệu",
      "lb.rank":"#","lb.name":"Tên","lb.score":"Điểm","lb.wave":"Wave",
      "lb.close":"Đóng"
    },
    ko:{
      "panel.quick.title":"빠른 메뉴","panel.quick.pause":"일시정지","panel.quick.restart":"재시작",
      "panel.quick.how":"방법","panel.quick.leaderboard":"리더보드",
      "panel.lang.title":"언어",
      "panel.skill.title":"스킬","panel.skill.desc":"가득 차면 F 키로 FEVER 발동.",
      "panel.settings.title":"설정","panel.settings.bgm":"BGM","panel.settings.sfx":"SFX",
      "panel.settings.flash":"플래시 감소","panel.settings.hud":"HUD",
      "panel.guide.title":"가이드",
      "guide.move":"이동: A/D 또는 ←/→",
      "guide.shoot":"발사: Space (길게 = 빠름, 열 상승)",
      "guide.pause":"P: 일시정지 / R: 재시작",

      "hud.score":"점수: {v}","hud.wave":"웨이브: {v}","hud.hp":"HP: {v}","hud.hint":"모드: -, 난이도: -",

      "landing.headline":"모드를 선택하고 시작하세요","landing.sub":"좌/우 이동 – 발사 – 회피 – FEVER 충전. HTML/CSS/JS만으로 구현.",
      "landing.play":"플레이","landing.how":"방법","landing.start":"시작",
      "landing.arcade.title":"아케이드","landing.arcade.badge":"무한 루프","landing.arcade.desc":"웨이브가 점점 어려워지고, 코인/상점, 미니보스/보스 등장.",
      "landing.boss.title":"보스 러시","landing.boss.badge":"보스 5연전","landing.boss.desc":"타임어택, 각 보스 후 임시 강화.",

      /* NEW: Time Attack */
      "landing.time.title":"타임 어택",
      "landing.time.badge":"3분",
      "landing.time.desc":"빠른 템포, 끝부분에 미니 보스. (준비 중)",

      "diff.title":"난이도 선택","diff.hint":"처음엔 Normal을 권장합니다.",
      "diff.easy":"쉬움","diff.normal":"보통","diff.hard":"어려움","diff.insane":"매우 어려움",
      "common.cancel":"취소",
      "common.backHome":"홈으로",
      "game.startBtn":"시작",
      "ready.hint":"시작 버튼을 누르세요",
      "how.short":"좌/우 이동, Space 발사.",

      "lb.title":"리더보드","lb.empty":"기록이 없습니다",
      "lb.rank":"#","lb.name":"이름","lb.score":"점수","lb.wave":"웨이브",
      "lb.close":"닫기"
    },
    en:{
      "panel.quick.title":"Quick","panel.quick.pause":"Pause","panel.quick.restart":"Restart",
      "panel.quick.how":"How-to","panel.quick.leaderboard":"Leaderboard",
      "panel.lang.title":"Language",
      "panel.skill.title":"Skill","panel.skill.desc":"Press F to trigger FEVER when full.",
      "panel.settings.title":"Settings","panel.settings.sfx":"SFX","panel.settings.bgm":"BGM",
      "panel.settings.flash":"Reduce Flash","panel.settings.hud":"HUD",
      "panel.guide.title":"Guide",
      "guide.move":"Move: A/D or ←/→",
      "guide.shoot":"Shoot: Space (hold = faster, heats up)",
      "guide.pause":"P: Pause / R: Restart",

      "hud.score":"Score: {v}","hud.wave":"Wave: {v}","hud.hp":"HP: {v}","hud.hint":"Mode: -, Diff: -",

      "landing.headline":"Choose a mode & start","landing.sub":"Move – Shoot – Dodge – Charge FEVER. Built with HTML/CSS/JS.",
      "landing.play":"Play","landing.how":"How to Play","landing.start":"Start Game",
      "landing.arcade.title":"Arcade","landing.arcade.badge":"Endless loop","landing.arcade.desc":"Ramping waves, coins & shop, periodic mini-boss/boss.",
      "landing.boss.title":"Boss Rush","landing.boss.badge":"5 bosses","landing.boss.desc":"Race the clock; temporary upgrades after each boss.",

      /* NEW: Time Attack */
      "landing.time.title":"Time Attack",
      "landing.time.badge":"3 minutes",
      "landing.time.desc":"Fast-paced, mini-boss near the end. (coming soon)",

      "diff.title":"Select difficulty","diff.hint":"Normal is recommended for beginners.",
      "diff.easy":"Easy","diff.normal":"Normal","diff.hard":"Hard","diff.insane":"Insane",
      "common.cancel":"Cancel",
      "common.backHome":"Back Home",
      "game.startBtn":"Start",
      "ready.hint":"Press Start to play",
      "how.short":"Move left/right, shoot with Space.",

      "lb.title":"Leaderboard","lb.empty":"No records yet",
      "lb.rank":"#","lb.name":"Name","lb.score":"Score","lb.wave":"Wave",
      "lb.close":"Close"
    }
  };

  function fmt(s,args){ return s.replace(/\{(\w+)\}/g,(_,k)=> (args&&k in args)?args[k]:`{${k}}`); }
  function t(key, args){ const lang = get() || 'vi'; const raw = (dict[lang] && dict[lang][key]) || ''; return args ? fmt(raw, args) : raw; }
  function apply(root=document){
    const lang = get() || 'vi';
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      const raw = (dict[lang] && dict[lang][k]) || el.textContent || '';
      const args = el.getAttribute('data-i18n-args'); let parsed=null;
      if (args) try{ parsed = JSON.parse(args); }catch{}
      el.textContent = parsed ? fmt(raw, parsed) : raw;
    });
  }
  function get(){ try{ return localStorage.getItem(KEY) || null; }catch{ return null; } }
  function set(lang){ try{ localStorage.setItem(KEY, lang); }catch{}; apply(document); }

  window.I18N = { t, apply, get, set };
  document.addEventListener('DOMContentLoaded', ()=>apply(document));
})();
