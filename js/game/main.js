// /js/game/main.js
// Core
import { StateMachine } from '../core/state.js';
import { Renderer } from '../core/renderer.js';
import { World } from './world.js';
import { Input } from '../core/input.js';

// Player & bullets
import { BulletPool } from './bullet.js';
import { Player } from './player.js';

// Enemies (mob)
import { EnemyPool } from './enemy.js';
import { Spawner } from './spawner.js';
import { EnemyBulletPool } from './enemy_bullet.js';
import { EnemyShooter } from './enemy_shooter.js';

// Collisions
import { ColliderAll } from './collider_all.js';

// HUD
import { HUD } from './hud.js';

// Power-ups
import { PowerupPool } from './powerup.js';
import { PowerupDropper } from './powerup_dropper.js';
import { PowerupCollider } from './collider_powerup.js';

// Boss
import { Boss } from './boss.js';
import { BossBulletPool } from './boss_bullet.js';
import * as BP from './boss_patterns.js';
import { drawBossBar, drawWarning } from './boss_ui.js';
import { BossFlow } from './boss_flow.js';

// =============================
const LOGICAL_W = 620, LOGICAL_H = 650;

// =============================
const params = new URLSearchParams(location.search);
const rawMode = (params.get('mode') || 'arcade').toLowerCase();
const mode = (rawMode === 'boss' || rawMode === 'bossrush' || rawMode === 'boss_rush' || rawMode === 'br')
  ? 'boss' : 'arcade';
const diff = (params.get('diff') || 'normal').toLowerCase();
const GOD  = params.get('god') === '1';

// =============================
const canvas = document.getElementById('game');
canvas.width = LOGICAL_W; canvas.height = LOGICAL_H;
try { canvas.setAttribute('tabindex','0'); } catch {}

const renderer = new Renderer(canvas);
const world = new World({ canvas });
const input = new Input();
const hud = new HUD();

// =============================
// Assets
const imgPlayer = new Image(); imgPlayer.src      = 'assets/img/player/player1.jpg';
const imgBullet = new Image(); imgBullet.src      = 'assets/img/bullet/bullet1.jpg';

const imgEnemy  = new Image(); imgEnemy.src       = 'assets/img/enemy/enemy1.jpg';
const imgEnemyBullet = new Image(); imgEnemyBullet.src = 'assets/img/bullet/e_bullet1.jpg';

const imgEnemyDie  = new Image(); imgEnemyDie.src = 'assets/img/effect/eHit.jpg';
const imgPlayerDie = new Image(); imgPlayerDie.src = 'assets/img/effect/pHit.jpg';

const imgPU_Shield = new Image(); imgPU_Shield.src = 'assets/img/powerup/shield.jpg';
const imgPU_Heal   = new Image(); imgPU_Heal.src   = 'assets/img/powerup/heal.jpg';
const imgPU_Score  = new Image(); imgPU_Score.src  = 'assets/img/powerup/score.jpg';

const imgBoss = new Image(); imgBoss.src               = 'assets/img/boss/boss1.jpg';
const imgBossBullet = new Image(); imgBossBullet.src   = 'assets/img/bullet/b_bullet.jpg';
const imgBossWarn = new Image(); imgBossWarn.src       = 'assets/img/ui/boss_warn.jpg';

// =============================
// Audio manager (BGM + SFX) với ensure()
const audio = (() => {
  const LS_BGM_MUTE = 'gd_bgm_muted';
  const LS_SFX_MUTE = 'gd_sfx_muted';
  const LS_BGM_VOL  = 'gd_bgm_vol';
  const LS_SFX_VOL  = 'gd_sfx_vol';

  const make = (src, { loop=false, vol=1 }={}) => { const a = new Audio(src); a.loop=loop; a.volume=vol; a.preload='auto'; return a; };
  const bgmMain = make('assets/audio/bgm_main.mp3', { loop:true, vol:0.55 });
  const bgmBoss = make('assets/audio/boss_theme.mp3', { loop:true, vol:0.65 });

  const sfxSrc = {
    shoot:       'assets/audio/shoot.mp3',
    enemyShoot:  'assets/audio/shoot.mp3',
    bossShoot:   'assets/audio/boss_skill.mp3',
    hitPlayer:   'assets/audio/hit_player.mp3',
    hitEnemy:    'assets/audio/hit_player.mp3',
    enemyDie:    'assets/audio/enemy_die.mp3',
    shieldOn:    'assets/audio/shield_on.mp3',
    shieldBreak: 'assets/audio/shield_break.mp3',
    heal:        'assets/audio/heal.mp3',
    score:       'assets/audio/score.mp3',
    bossIntro:   'assets/audio/boss_intro.mp3',
    bossClear:   'assets/audio/boss_clear.mp3'
  };

  let _bgmMuted=false, _sfxMuted=false;
  let _bgmVol = 70, _sfxVol = 80;  // %
  try {
    _bgmMuted = (localStorage.getItem(LS_BGM_MUTE)==='1');
    _sfxMuted = (localStorage.getItem(LS_SFX_MUTE)==='1');
    const bv = parseInt(localStorage.getItem(LS_BGM_VOL)||'70',10); if (!Number.isNaN(bv)) _bgmVol = Math.max(0, Math.min(100, bv));
    const sv = parseInt(localStorage.getItem(LS_SFX_VOL)||'80',10); if (!Number.isNaN(sv)) _sfxVol = Math.max(0, Math.min(100, sv));
  }catch{}

  const commitMute = () => {
    try { localStorage.setItem(LS_BGM_MUTE, _bgmMuted ? '1':'0'); }catch{}
    try { localStorage.setItem(LS_SFX_MUTE, _sfxMuted ? '1':'0'); }catch{}
  };
  const commitVol  = () => {
    try { localStorage.setItem(LS_BGM_VOL, String(_bgmVol)); }catch{}
    try { localStorage.setItem(LS_SFX_VOL, String(_sfxVol)); }catch{}
  };

  const stop = (a)=>{ try{ a.pause(); a.currentTime=0; }catch(_){} };
  const pause = (a)=>{ try{ a.pause(); }catch(_){} };
  const playSafe = (a)=> a.play().catch((err)=>{ console.warn('[BGM] play fail:', a.src, err?.message||err); });

  const BGM_GAIN = () => Math.max(0, Math.min(1, _bgmVol/100));
  const SFX_GAIN = () => Math.max(0, Math.min(1, _sfxVol/100));
  const applyBgmGain = () => {
    const v = BGM_GAIN();
    try { bgmMain.volume = v; } catch {}
    try { bgmBoss.volume = Math.min(1, v*1.1); } catch {}
  };

  let _want = 'none'; // 'none' | 'main' | 'boss'
  const isPlaying = (a)=>{ try{ return !a.paused && a.currentTime>0 && !a.ended; }catch{ return false; } };

  const api = {
    bgm: {
      main(){ _want='main'; if (_bgmMuted){ pause(bgmMain); pause(bgmBoss); return; } stop(bgmBoss); applyBgmGain(); playSafe(bgmMain); },
      boss(){ _want='boss'; if (_bgmMuted){ pause(bgmMain); pause(bgmBoss); return; } stop(bgmMain); applyBgmGain(); playSafe(bgmBoss); },
      stopAll(){ _want='none'; stop(bgmMain); stop(bgmBoss); }
    },
    ensure(which){
      if (_bgmMuted) return;
      if (which==='main'){
        if (!isPlaying(bgmMain)) { stop(bgmBoss); applyBgmGain(); playSafe(bgmMain); _want='main'; }
      } else if (which==='boss'){
        if (!isPlaying(bgmBoss)) { stop(bgmMain); applyBgmGain(); playSafe(bgmBoss); _want='boss'; }
      }
    },
    sfx: {
      _fire(key, baseVol=0.3){
        if (_sfxMuted) return;
        const a = new Audio(sfxSrc[key]);
        a.volume = Math.max(0, Math.min(1, baseVol * SFX_GAIN()));
        a.preload='auto';
        a.play().catch(()=>{});
        a.addEventListener('ended',()=>{a.remove();},{once:true});
      },
      shoot(){ api.sfx._fire('shoot',0.28); },
      enemyShoot(){ api.sfx._fire('enemyShoot',0.24); },
      bossShoot(){ api.sfx._fire('bossShoot',0.30); },
      hitPlayer(){ api.sfx._fire('hitPlayer',0.30); },
      hitEnemy(){ api.sfx._fire('hitEnemy',0.24); },
      enemyDie(){ api.sfx._fire('enemyDie',0.30); },
      shieldOn(){ api.sfx._fire('shieldOn',0.38); },
      shieldBreak(){ api.sfx._fire('shieldBreak',0.42); },
      heal(){ api.sfx._fire('heal',0.28); },
      score(){ api.sfx._fire('score',0.22); },
      bossIntro(){ api.sfx._fire('bossIntro',0.55); },
      bossClear(){ api.sfx._fire('bossClear',0.55); }
    },

    setBgmMuted(v){ _bgmMuted = !!v; commitMute(); if (_bgmMuted){ pause(bgmMain); pause(bgmBoss); } else { if (_want==='main') api.bgm.main(); if (_want==='boss') api.bgm.boss(); } },
    setSfxMuted(v){ _sfxMuted = !!v; commitMute(); },
    isBgmMuted(){ return !!(_bgmMuted); },
    isSfxMuted(){ return !!(_sfxMuted); },

    setBgmVolume(p){ _bgmVol = Math.max(0, Math.min(100, p|0)); commitVol(); applyBgmGain(); },
    setSfxVolume(p){ _sfxVol = Math.max(0, Math.min(100, p|0)); commitVol(); },
    getBgmVolume(){ return _bgmVol|0; },
    getSfxVolume(){ return _sfxVol|0; }
  };

  // Unlock autoplay
  let unlocked = false;
  const unlock = () => {
    if (unlocked) return; unlocked = true;
    [bgmMain, bgmBoss].forEach(b=>{
      try{ b.muted=true; b.play().then(()=>{ b.pause(); b.currentTime=0; b.muted=false; }).catch(()=>{}); }catch(_){}
    });
    try {
      if (sm && sm.current && sm.current()==='PLAY' && !api.isBgmMuted()) {
        api.bgm.main(); api.ensure('main');
      }
    } catch {}
  };
  ['pointerdown','keydown','touchstart','click'].forEach(ev => window.addEventListener(ev, unlock, { once:true }));

  applyBgmGain();
  try { window.GD_Audio = api; window.dispatchEvent(new Event('gd-audio-ready')); } catch{}
  return api;
})();

// =============================
// Game objects
const bullets = new BulletPool(imgBullet, { sizeRatioH: 0.060 });
const player  = new Player({
  img: imgPlayer, effectImg: imgPlayerDie, bullets,
  bounds: { W: LOGICAL_W, H: LOGICAL_H }, sizeRatioH: 0.12
});

const enemies = new EnemyPool(imgEnemy, { sizeRatioH: 0.15, speed: 60, hp: 1, effectImg: imgEnemyDie });
const spawner = new Spawner(enemies, { width: LOGICAL_W, height: LOGICAL_H });

const enemyBullets = new EnemyBulletPool(imgEnemyBullet, { sizeRatioH: 0.060 });
const enemyShooter = new EnemyShooter({ rateMin: 1.4, rateMax: 2.6, speed: 260, spread: 10 });

let bossRef = null, bossBulletsRef = null;
const colliderAll = new ColliderAll(
  { bullets, enemies, enemyBullets, player },
  {
    playerBulletRadius: 12,
    playerHitScale: 0.38,
    bossHitScale: 1.20,
    getBoss: () => bossRef,
    getBossBullets: () => bossBulletsRef
  }
);

// Powerups
const powerups = new PowerupPool(
  { shield: imgPU_Shield, heal: imgPU_Heal, score: imgPU_Score },
  { sizeRatioH: 0.07, speed: 120 }
);
const dropper  = new PowerupDropper(powerups, { pShield: 0.10, pHeal: 0.08, pScore: 0.18 });
const puColl   = new PowerupCollider({ powerups, player }, { playerHitScale: 0.38 });
let shieldTimer = 0;

// Boss (❗không ép hpMax ở đây, để boss_flow quyết định)
const boss = new Boss(imgBoss, { sizeRatioH: 0.22 });
const bossBullets = new BossBulletPool(imgBossBullet, { sizeRatioH: 0.05 });

// Flow: Arcade có waves trước boss; BossRush vào boss ngay
const bossFlow = new BossFlow({ wavesBeforeBoss: (diff==='hard'?3:4) });

// =============================
// Enemy themes
const ENEMY_THEMES = {
  basic:    { enemy:{ img:'assets/img/enemy/enemy1.jpg', sizeRatioH:0.15, speed:60, hp:1 },
              bullet:{ img:'assets/img/bullet/e_bullet1.jpg', sizeRatioH:0.060 },
              shooter:{ rateMin:1.4, rateMax:2.6, speed:260, spread:10 } },
  wasp:     { enemy:{ img:'assets/img/enemy/enemy2.jpg', sizeRatioH:0.14, speed:80, hp:1 },
              bullet:{ img:'assets/img/bullet/e_bullet2.jpg', sizeRatioH:0.055 },
              shooter:{ rateMin:1.2, rateMax:2.2, speed:280, spread:22 } },
  sentinel: { enemy:{ img:'assets/img/enemy/enemy3.jpg', sizeRatioH:0.16, speed:55, hp:2 },
              bullet:{ img:'assets/img/bullet/e_bullet3.jpg', sizeRatioH:0.060 },
              shooter:{ rateMin:1.6, rateMax:2.8, speed:250, spread:8 } },
  weaver:   { enemy:{ img:'assets/img/enemy/enemy4.jpg', sizeRatioH:0.15, speed:70, hp:1 },
              bullet:{ img:'assets/img/bullet/e_bullet4.jpg', sizeRatioH:0.055 },
              shooter:{ rateMin:1.3, rateMax:2.3, speed:270, spread:16 } },
  strider:  { enemy:{ img:'assets/img/enemy/enemy5.jpg', sizeRatioH:0.16, speed:65, hp:2 },
              bullet:{ img:'assets/img/bullet/e_bullet5.jpg', sizeRatioH:0.060 },
              shooter:{ rateMin:1.5, rateMax:2.5, speed:265, spread:12 } },
};
let currentThemeKey = 'basic';
function applyEnemyTheme(themeKey){
  currentThemeKey = ENEMY_THEMES[themeKey] ? themeKey : 'basic';
  const t = ENEMY_THEMES[currentThemeKey];
  enemies.setTheme(t.enemy);
  enemyBullets.setTheme(t.bullet);
  enemyShooter.setTheme(t.shooter);
  spawner.setTheme(currentThemeKey);
}

// =============================
// Boss Rush order (không lặp liên tiếp)
const BOSS_ORDER = ['dreadnought','phantom_wasp','aegis_sentinel','nova_weaver','titan_strider'];
let bossCycleIdx = 0;
let lastBossId = null;
let bossRushLoop = 0; // đếm vòng BossRush (mỗi khi clear đủ 5 boss, tăng 1)
function resetBossRushPointers(){ bossCycleIdx=0; lastBossId=null; bossRushLoop=0; }

function nextBossId() {
  if (lastBossId == null) {
    lastBossId = BOSS_ORDER[bossCycleIdx % BOSS_ORDER.length];
    bossCycleIdx = (bossCycleIdx + 1) % BOSS_ORDER.length;
    return lastBossId;
  }
  let tries = 0;
  while (tries < BOSS_ORDER.length) {
    const candidate = BOSS_ORDER[bossCycleIdx % BOSS_ORDER.length];
    bossCycleIdx = (bossCycleIdx + 1) % BOSS_ORDER.length;
    if (candidate !== lastBossId) {
      lastBossId = candidate;
      return candidate;
    }
    tries++;
  }
  return lastBossId;
}

// =============================
// Game state vars
let score = 0, hp = 4, wave = 1;
hud.setScore(score); hud.setHp(hp); hud.setWave(wave);
let killsThisWave = 0;
const WAVE_KILL_GOAL = (diff==='hard') ? 28 : (diff==='easy') ? 15 : 22;

let lastEnemyBulletAlive = 0, lastBossBulletAlive = 0;
window.addEventListener('keydown', (e) => { if (e.code === 'Space') audio.sfx.shoot(); });

let gameOverTimer = -1;

function clearPools(){
  bullets.pool.forEach(b=>b.alive=false);
  enemyBullets.pool.forEach(b=>b.alive=false);
  bossBullets.pool.forEach(b=>b.alive=false);
  enemies.pool.forEach(e=>{ e.alive=false; e.dying=false; });
  powerups.pool.forEach(p=>p.alive=false);
}
function resetGameVars(){
  score = 0; hp = 4; wave = 1; killsThisWave = 0; gameOverTimer = -1; shieldTimer = 0;
  hud.setScore(score); hud.setHp(hp); hud.setWave(wave);
  lastEnemyBulletAlive = lastBossBulletAlive = 0;
  applyEnemyTheme('basic');
}

// helper đếm số phần tử alive trong pool
function countAlive(poolArr){
  let n = 0; for (const it of poolArr) if (it.alive) n++; return n;
}

// =============================
// Boss motion set
function getMotionSetFor(id, bossInst){
  const lib = bossInst._motionLib();
  switch(id){
    case 'dreadnought': {
      const phase1 = (dt) => {
        const amp = Math.max(80, bossInst.W * 0.35);
        const w   = 1.0;
        bossInst.x = Math.round(bossInst.W/2 + Math.sin(bossInst.t * w) * amp);
        bossInst.y = bossInst.targetY;
      };
      const phase2 = (dt) => { // drift + jitter nhẹ (giữa)
        if (bossInst.__dir == null) bossInst.__dir = (Math.random() < 0.5 ? -1 : 1);
        const pxPerMs = 0.16;
        const jitterA = Math.max(6, bossInst.W * 0.015);
        const jitterW = 6.0;
        const half = bossInst.dispW ? bossInst.dispW * 0.5 : 70;
        const margin = 12;
        bossInst.x += bossInst.__dir * pxPerMs * dt
                    + Math.sin(bossInst.t * jitterW) * (jitterA * dt / 1000);
        const L = half + margin;
        const R = bossInst.W - half - margin;
        if (bossInst.x <= L)  { bossInst.x = L;  bossInst.__dir = +1; }
        if (bossInst.x >= R)  { bossInst.x = R;  bossInst.__dir = -1; }
        bossInst.y = bossInst.targetY;
      };
      const phase3 = (dt) => {
        const amp = Math.max(90, bossInst.W * 0.38);
        const w   = 1.25;
        bossInst.x = Math.round(bossInst.W/2 + Math.sin(bossInst.t * w) * amp);
        bossInst.y = bossInst.targetY;
      };
      return { 1: phase1, 2: phase2, 3: phase3 };
    }
    case 'phantom_wasp':
      return { 1: lib.zigZag(110, 28), 2: lib.strafing(180), 3: lib.zigZag(160, 36) };
    case 'aegis_sentinel':
      return { 1: lib.hoverSin(60, 0.9), 2: lib.hoverSin(85, 1.1), 3: lib.strafing(160) };
    case 'nova_weaver':
      return { 1: lib.orbit(70, 0.8), 2: lib.orbit(95, 1.0), 3: lib.orbit(110, 1.15) };
    case 'titan_strider':
      return { 1: lib.verticalStride(28, 1.4), 2: lib.verticalStride(40, 1.7), 3: (dt)=>{ lib.verticalStride(46,1.8)(dt); lib.strafing(90)(dt); } };
    default:
      return { 1: lib.hoverSin(70,1), 2: lib.hoverSin(85,1.1), 3: lib.strafing(150) };
  }
}

// =============================
// States
let IS_PAUSED = false;

const states = {
  READY: {
    enter(){
      audio.bgm.stopAll(); IS_PAUSED = false;
      resetGameVars(); clearPools();

      // === Reset BossRush khi quay về READY
      if (mode === 'boss') resetBossRushPointers();

      // reset input và vận tốc tránh drift
      if (typeof input.reset === 'function') input.reset();
      if (player) { player.vx = 0; player.vy = 0; if (typeof player.stop==='function') player.stop(); }
      try { player.x = LOGICAL_W/2; player.y = LOGICAL_H - Math.round(player.dispH||72); } catch {}
      this.t = 0;
    },
    update(dt){
      this.t += dt;
      world.update(dt);
      renderer.clear({useFallback:false});
      renderer.drawBorder();

      const g = renderer.ctx;
      g.save(); g.globalAlpha = 0.92;
      g.font = 'bold 22px sans-serif'; g.fillStyle = '#e6f3ff'; g.textAlign = 'center';
      const hint = (window.I18N?.t && I18N.t('ready.hint')) || 'Press Start to play';
      g.fillText(hint, LOGICAL_W/2, LOGICAL_H*0.50);
      g.font = '14px sans-serif'; g.fillStyle = '#bcd7ff';
      g.fillText('Enter/Space: Start    •    P: Pause    •    R: Restart', LOGICAL_W/2, LOGICAL_H*0.50 + 26);
      g.restore();
    }
  },

  PLAY: {
    enter(){ audio.bgm.main(); },
    update(dt){
      if (mode === 'boss') { sm.change('BOSS_INTRO'); return; }

      // Bảo hiểm BGM Arcade
      audio.ensure('main');

      if (IS_PAUSED) {
        world.update(dt);
        renderer.clear({ useFallback: false });
        renderer.drawBorder();
        drawPausedOverlay(renderer.ctx);
        return;
      }

      world.update(dt);
      player.update(dt, input);
      bullets.update(dt, LOGICAL_H);

      spawner.update(dt);
      enemies.update(dt, LOGICAL_H);

      enemyShooter.update(dt, enemies, enemyBullets);
      enemyBullets.update(dt, LOGICAL_H);

      const ebAlive = countAlive(enemyBullets.pool);
      if (ebAlive > lastEnemyBulletAlive) audio.sfx.enemyShoot();
      lastEnemyBulletAlive = ebAlive;

      powerups.update(dt, LOGICAL_H);

      const ev = colliderAll.step();
      if (ev.kill) {
        score += ev.kill * 10; hud.setScore(score);
        audio.sfx.hitEnemy();
        killsThisWave += ev.kill;
        if (ev.deadEnemies && ev.deadEnemies.length) audio.sfx.enemyDie();

        if (killsThisWave >= WAVE_KILL_GOAL) {
          killsThisWave = 0; wave++; hud.setWave(wave);
          enemies.pool.forEach(e => { if (e.alive && !e.dying) e.alive = false; });
          enemyBullets.pool.forEach(b => b.alive = false);
          powerups.pool.forEach(p => p.alive = false);
          if (bossFlow.shouldEnterBoss(wave)) { sm.change('BOSS_INTRO'); return; }
        }
      }

      if (ev.deadEnemies?.length) dropper.onEnemyDeaths(ev.deadEnemies);
      if (ev.hitEnemies?.length) for (const e of ev.hitEnemies) if (!e.dying){ e.hitTimer=160; e.slowTimer=320; e.shakePhase+=0.8; }

      let gotHit = (ev.hitPlayerByEnemy || ev.hitPlayerByEnemyBullet);
      if (GOD) gotHit = false;
      if (gotHit && shieldTimer > 0) { shieldTimer = 0; gotHit = false; audio.sfx.shieldBreak(); }
      if (gotHit && !player.isInvulnerable()) {
        hp = Math.max(0, hp - 1); hud.setHp(hp); audio.sfx.hitPlayer();
        if (hp <= 0) { player.die(900); if (gameOverTimer < 0) gameOverTimer = 1000; }
        else { player.hurt(220, 700); }
      }
      if (GOD) gameOverTimer = -1;

      const got = puColl.step();
      if (got.shield) { shieldTimer = 8000; audio.sfx.shieldOn(); }
      if (got.heal)   { hp = Math.min(9, hp + got.heal); hud.setHp(hp); audio.sfx.heal(); }
      if (got.score)  { score += got.score; hud.setScore(score); audio.sfx.score(); }
      if (shieldTimer > 0) shieldTimer = Math.max(0, shieldTimer - dt);

      if (gameOverTimer >= 0) {
        gameOverTimer -= dt;
        if (gameOverTimer <= 0) { audio.bgm.stopAll(); sm.change('GAME_OVER'); return; }
      }

      renderer.clear({ useFallback: false });
      enemies.draw(renderer.ctx);
      enemyBullets.draw(renderer.ctx);
      bullets.draw(renderer.ctx);
      player.draw(renderer.ctx);
      powerups.draw(renderer.ctx);
      if (shieldTimer > 0) {
        const r = Math.min(player.dispW, player.dispH) * 0.62;
        const x = Math.round(player.x), y = Math.round(player.y);
        const a = Math.max(0.25, shieldTimer/8000);
        const g = renderer.ctx;
        g.save(); g.globalAlpha = 0.35*a;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI*2);
        g.strokeStyle = '#66ccff'; g.lineWidth = 3; g.stroke(); g.restore();
      }
      renderer.drawBorder();
    }
  },

  BOSS_INTRO: {
    enter(){
      enemyBullets.pool.forEach(b=>b.alive=false);
      bullets.pool.forEach(b=>b.alive=false);
      powerups.pool.forEach(p=>p.alive=false);

      let meta, bossId, hpMax;

      if (mode === 'boss') {
        // ===== BossRush: chọn boss kế và lấy hp từ boss_flow
        bossId = nextBossId();
        const base = bossFlow.TABLE?.[bossId]?.hpBase ?? 100;
        hpMax = bossFlow._hpFor(diff, base, bossRushLoop);
        meta = {
          id: bossId,
          name: bossFlow.TABLE?.[bossId]?.name || bossId.toUpperCase().replace(/_/g,' '),
          imgSrc: bossFlow.TABLE?.[bossId]?.img,
          hpMax
        };
      } else {
        // ===== Arcade: dùng meta từ boss_flow (đã kèm hpMax)
        meta = bossFlow.getBossForWave(wave, diff) || {};
        bossId = (meta.id || 'dreadnought').toLowerCase();
        hpMax = meta.hpMax; // do boss_flow quyết định
      }

      if (meta.imgSrc) {
        const img = new Image(); img.src = meta.imgSrc;
        img.onload = ()=>{ boss.img = img; if (typeof boss._syncSize==='function') boss._syncSize(); };
      }
      boss.name = meta.name || 'BOSS';

      const motionSet = getMotionSetFor(bossId, boss);
      // spawn với hpMax lấy từ boss_flow; nếu null/undefined thì boss giữ mặc định nội bộ
      boss.spawn(LOGICAL_W, LOGICAL_H, hpMax, { motionSet, name: boss.name });
      boss.targetY = Math.round(LOGICAL_H * 0.22);

      if (boss.dispW) {
        const half = boss.dispW * 0.5;
        if (boss.x <= half + 2) { boss.x = half + 10; }
        if (boss.x >= LOGICAL_W - half - 2) { boss.x = LOGICAL_W - half - 10; }
      }

      bossRef = boss; bossBulletsRef = bossBullets;

      audio.bgm.boss(); audio.sfx.bossIntro();
      this.t = 0;
    },
    update(dt){
      // Bảo hiểm BGM Boss
      audio.ensure('boss');

      if (IS_PAUSED) {
        world.update(dt);
        renderer.clear({ useFallback: false });
        boss.draw(renderer.ctx);
        drawBossBar(renderer.ctx, boss, { w: LOGICAL_W - 80, h: 12 });
        drawPausedOverlay(renderer.ctx);
        return;
      }

      this.t += dt; world.update(dt); boss.update(dt);

      renderer.clear({ useFallback: false });
      boss.draw(renderer.ctx);
      drawBossBar(renderer.ctx, boss, { w: LOGICAL_W - 80, h: 12 });

      const g = renderer.ctx;
      g.save(); g.globalAlpha = 0.85;
      g.font = 'bold 22px sans-serif'; g.fillStyle = '#ffcc00'; g.textAlign = 'center';
      g.fillText('WARNING — BOSS APPROACHING', LOGICAL_W/2, LOGICAL_H*0.42);
      g.restore();

      if (this.t > 1500 || boss.invulnTimer <= 200) sm.change('BOSS');
    }
  },

  BOSS: {
    enter(){},
    update(dt){
      // Bảo hiểm BGM Boss
      audio.ensure('boss');

      if (IS_PAUSED) {
        world.update(dt);
        renderer.clear({ useFallback: false });
        boss.draw(renderer.ctx);
        drawBossBar(renderer.ctx, boss, { w: LOGICAL_W - 80, h: 12 });
        drawPausedOverlay(renderer.ctx);
        return;
      }

      const meta = (mode==='boss')
        ? { id: lastBossId }
        : bossFlow.getBossForWave(wave, diff);
      const bossId = (meta?.id || '').toLowerCase();

      world.update(dt);
      player.update(dt, input);
      bullets.update(dt, LOGICAL_H);

      boss.update(dt);
      bossBullets.update(dt, LOGICAL_H);

      const bbAlive = countAlive(bossBullets.pool);
      if (bbAlive > lastBossBulletAlive) audio.sfx.bossShoot();
      lastBossBulletAlive = bbAlive;

      if (boss.cooldown <= 0 && boss.alive) {
        switch(bossId){
          default:
            BP.patternFan(boss.x, boss.y+20, bossBullets, {count:8, spreadDeg:80, speed:230});
            boss.cooldown = 1500 + (Math.random()*300|0);
            break;
        }
        if (boss.cooldown < 420) boss.cooldown = 420;
      }

      powerups.update(dt, LOGICAL_H);

      // ====== VA CHẠM & TRỪ MÁU BOSS ======
      const ev = colliderAll.step();

      // Boss bị trúng đạn người chơi — hỗ trợ nhiều schema kết quả
      let bossHits = 0;
      if (ev) {
        if (typeof ev.hitBossCount === 'number') bossHits = ev.hitBossCount;
        else if (Array.isArray(ev.hitBossBullets)) bossHits = ev.hitBossBullets.length;
        else if (typeof ev.bossHits === 'number') bossHits = ev.bossHits;
        else if (ev.hitBoss === true) bossHits = 1;
        else if (Array.isArray(ev.hitBoss)) bossHits = ev.hitBoss.length;
      }
      if (bossHits > 0 && boss.alive) {
        const diffMul = (diff==='hard') ? 1.15 : (diff==='easy') ? 0.85 : 1.0;
        const dmg = Math.max(1, Math.round(bossHits * 10 * diffMul));
        if (typeof boss.applyDamage === 'function') boss.applyDamage(dmg);
        else { boss.hp = Math.max(0, boss.hp - dmg); }
        audio.sfx.hitEnemy();
      }

      // Người chơi bị boss bullet
      let gotHit = ev && ev.hitPlayerByBossBullet;
      if (GOD) gotHit = false;
      if (gotHit && shieldTimer > 0) { shieldTimer = 0; gotHit = false; audio.sfx.shieldBreak(); }
      if (gotHit && !player.isInvulnerable()) {
        hp = Math.max(0, hp - 1); hud.setHp(hp); audio.sfx.hitPlayer();
        if (hp <= 0) { player.die(900); if (gameOverTimer < 0) gameOverTimer = 1000; }
        else { player.hurt(220, 700); }
      }
      if (GOD) gameOverTimer = -1;

      const got = puColl.step();
      if (got.shield) { shieldTimer = 8000; audio.sfx.shieldOn(); }
      if (got.heal)   { hp = Math.min(9, hp + got.heal); hud.setHp(hp); audio.sfx.heal(); }
      if (got.score)  { score += got.score; hud.setScore(score); audio.sfx.score(); }
      if (shieldTimer > 0) shieldTimer = Math.max(0, shieldTimer - dt);

      if (gameOverTimer >= 0) {
        gameOverTimer -= dt;
        if (gameOverTimer <= 0) { audio.bgm.stopAll(); sm.change('GAME_OVER'); return; }
      }

      if (boss.isDead()) {
        sm.change('BOSS_CLEAR');
        // tăng vòng BossRush mỗi khi hoàn tất đủ 5 boss
        if (mode === 'boss' && lastBossId != null && (bossCycleIdx % BOSS_ORDER.length) === 0) bossRushLoop++;
        return;
      }

      renderer.clear({ useFallback: false });
      bossBullets.draw(renderer.ctx);
      bullets.draw(renderer.ctx);
      player.draw(renderer.ctx);
      boss.draw(renderer.ctx);
      powerups.draw(renderer.ctx);
      drawBossBar(renderer.ctx, boss, { w: LOGICAL_W - 80, h: 12 });
      if (boss.telegraphT > 0)
        drawWarning(renderer.ctx, imgBossWarn, boss.x, boss.y + Math.round(boss.dispH*0.55), boss.telegraphT);

      if (shieldTimer > 0) {
        const r = Math.min(player.dispW, player.dispH) * 0.62;
        const x = Math.round(player.x), y = Math.round(player.y);
        const a = Math.max(0.25, shieldTimer/8000);
        const g = renderer.ctx;
        g.save(); g.globalAlpha = 0.35*a;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI*2);
        g.strokeStyle = '#66ccff'; g.lineWidth = 3; g.stroke(); g.restore();
      }
    }
  },

  BOSS_CLEAR: {
    enter(){
      audio.sfx.bossClear();
      audio.bgm.stopAll();

      bossBullets.pool.forEach(b=>b.alive=false);
      enemyBullets.pool.forEach(b=>b.alive=false);
      bullets.pool.forEach(b=>b.alive=false);
      powerups.pool.forEach(p=>p.alive=false);

      if (mode !== 'boss') {
        // đổi theme enemy sau boss (Arcade)
        const order = ['basic','wasp','sentinel','weaver','strider'];
        const idx = Math.max(0, order.indexOf(currentThemeKey));
        applyEnemyTheme(order[(idx+1)%order.length]);
      }
      this.t = 0;
    },
    update(dt){
      this.t += dt; world.update(dt);
      renderer.clear({ useFallback:false });
      renderer.drawBorder();
      const g = renderer.ctx;
      g.save(); g.globalAlpha=.9; g.font='bold 22px sans-serif'; g.fillStyle='#c8ffd2'; g.textAlign='center';
      g.fillText('BOSS CLEAR!', LOGICAL_W/2, LOGICAL_H*0.45);
      g.restore();

      if (this.t > 1000) {
        if (mode === 'boss') {
          sm.change('BOSS_INTRO'); // BossRush: vào boss tiếp
        } else {
          sm.change('PLAY');       // Arcade: quay lại PLAY
          setTimeout(()=>{ try{ if (!audio.isBgmMuted()) { audio.bgm.main(); audio.ensure('main'); } }catch{} }, 0);
        }
      }
    }
  },

  GAME_OVER: {
    enter(){
      try{
        const arr = window.GD_Storage.loadLB();
        const name = window.GD_Storage.askNameIfTop(arr, score, wave);
        if (name) window.GD_Storage.addAndSave(arr, { name, score, wave });
      }catch{}
      this.t = 0;
    },
    update(dt){
      this.t += dt; world.update(dt);
      renderer.clear({ useFallback:false });
      renderer.drawBorder();
      const g = renderer.ctx;
      g.save(); g.globalAlpha=.9; g.font='bold 24px sans-serif'; g.fillStyle='#ffd6d6'; g.textAlign='center';
      g.fillText('GAME OVER', LOGICAL_W/2, LOGICAL_H/2 - 4);
      g.font='14px sans-serif'; g.fillStyle='#fff';
      g.fillText('Press R to Restart', LOGICAL_W/2, LOGICAL_H/2 + 24);
      g.restore();
    }
  }
};

// =============================
// State machine + inputs
const sm = new StateMachine('READY',states);

// Start: Arcade → PLAY, BossRush → BOSS_INTRO
window.addEventListener('gd-start', ()=>{
  if (sm.current() === 'READY') {
    if (mode === 'boss') {
      resetBossRushPointers();                 // NEW: luôn reset trước khi vào boss
      sm.change('BOSS_INTRO');
    } else {
      sm.change('PLAY');
      setTimeout(()=>{ try{ if (!GD_Audio.isBgmMuted()) { GD_Audio.bgm.main(); GD_Audio.ensure('main'); } }catch{} }, 0);
    }
  }
});
window.addEventListener('keydown', (e)=>{
  if (e.code==='Enter' || e.code==='Space'){
    if (sm.current() === 'READY') {
      if (mode === 'boss') { resetBossRushPointers(); sm.change('BOSS_INTRO'); }
      else {
        sm.change('PLAY');
        setTimeout(()=>{ try{ if (!GD_Audio.isBgmMuted()) { GD_Audio.bgm.main(); GD_Audio.ensure('main'); } }catch{} }, 0);
      }
    }
  }
  if (e.code==='KeyP'){
    if (sm.current() === 'PLAY' || sm.current() === 'BOSS' || sm.current()==='BOSS_INTRO'){
      IS_PAUSED = !IS_PAUSED;
    }
  }
  if (e.code==='KeyR'){
    if (mode === 'boss') resetBossRushPointers();   // NEW
    sm.change('READY');
  }
});

// ===== Main loop
let last = performance.now();
function tick(now){
  const dt = Math.min(48, now - last); last = now;
  sm.update(dt);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ===== Helper overlay Pause
function drawPausedOverlay(ctx){
  ctx.save(); ctx.globalAlpha = .75;
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign='center';
  ctx.fillText('PAUSED', LOGICAL_W/2, LOGICAL_H/2);
  ctx.restore();
}
