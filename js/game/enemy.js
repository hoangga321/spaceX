// /js/game/enemy.js
export class EnemyPool {
  constructor(img, opts = {}) {
    this.img = img;
    this.effectImg = opts.effectImg || null; // sprite hiệu ứng khi chết
    this.pool = [];
    this.sizeRatioH = opts.sizeRatioH ?? 0.12;
    this.baseSpeed  = opts.speed ?? 120;
    this.baseHp     = opts.hp ?? 1;

    this._lastH = null;
    this._dispW = null;
    this._dispH = null;

    if (this.img && !this.img.complete) this.img.addEventListener('load', () => {}, { once:true });
    if (this.effectImg && !this.effectImg.complete) this.effectImg.addEventListener('load', () => {}, { once:true });
  }

  setTheme(t) {
    // t: { img?:string, sizeRatioH?:number, speed?:number, hp?:number }
    if (t?.sizeRatioH != null) this.sizeRatioH = t.sizeRatioH;
    if (t?.speed     != null) this.baseSpeed  = t.speed;
    if (t?.hp        != null) this.baseHp     = t.hp;
    if (t?.img) {
      const im = new Image();
      im.src = t.img;
      im.onload = ()=> {
        this.img = im;
        // reset cached draw size để tính lại theo ảnh mới
        this._dispW = null; this._dispH = null;
      };
    }
  }

  spawn(x, H, speedMul = 1, hp = this.baseHp) {
    const e = this.pool.find(o => !o.alive) || this.pool[this.pool.push({ alive:false })-1];
    e.alive = true;
    e.x = x; e.y = -30;
    e.hp = hp;
    e.vy = this.baseSpeed * speedMul;

    // hit thường
    e.hitTimer = 0;
    e.slowTimer = 0;
    e.shakePhase = Math.random()*Math.PI*2;
    e.currentSpeed = e.vy;
    e.shakeAmp = 1.5;

    // chết
    e.dying = false;
    e.dieTimer = 0;
  }

  update(dt, H) {
    if (typeof H === 'number') this._lastH = H;
    const d = dt/1000;

    for (const e of this.pool) if (e.alive) {
      if (e.dying) {
        e.dieTimer -= dt;
        if (e.dieTimer <= 0) e.alive = false;
        continue;
      }

      if (e.hitTimer > 0)  e.hitTimer  = Math.max(0, e.hitTimer - dt);
      if (e.slowTimer > 0) e.slowTimer = Math.max(0, e.slowTimer - dt);

      const slowMul = (e.slowTimer > 0) ? 0.55 : 1.0;
      e.currentSpeed = e.vy * slowMul;
      e.y += e.currentSpeed * d;

      e.shakePhase += d * 12;
      e.shakeAmp = (e.slowTimer > 0) ? 3.0 : 1.5;

      if (e.y > H + 40) e.alive = false;
    }
  }

  _ensureDispSize() {
    if (!this.img || !this.img.complete || !this._lastH) return false;
    const targetH = Math.max(12, Math.round(this._lastH * this.sizeRatioH));
    const ratio = this.img.naturalWidth / this.img.naturalHeight || 1;
    this._dispH = targetH;
    this._dispW = Math.max(12, Math.round(targetH * ratio));
    return true;
  }

  draw(ctx) {
    if (!this.img || !this.img.complete || !this._lastH) return;
    if (!this._dispW || !this._dispH) { if (!this._ensureDispSize()) return; }
    const w = this._dispW, h = this._dispH;

    for (const e of this.pool) if (e.alive) {
      const ox = Math.round(Math.sin(e.shakePhase) * e.shakeAmp);

      if (e.dying) {
        if (this.effectImg && this.effectImg.complete) {
          const scale = 1.2;
          const dw = Math.round(w*scale), dh = Math.round(h*scale);
          ctx.drawImage(this.effectImg, Math.round(e.x - dw/2 + ox), Math.round(e.y - dh/2), dw, dh);
        } else {
          ctx.save(); ctx.globalAlpha = 0.9; ctx.filter = 'brightness(1.8)';
          ctx.drawImage(this.img, Math.round(e.x - w/2 + ox), Math.round(e.y - h/2), w, h);
          ctx.restore();
        }
        continue;
      }

      if (e.hitTimer > 0) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.filter = 'brightness(1.5) saturate(1.2)';
        ctx.drawImage(this.img, Math.round(e.x - w/2 + ox), Math.round(e.y - h/2), w, h);
        ctx.restore();
      } else {
        ctx.drawImage(this.img, Math.round(e.x - w/2 + ox), Math.round(e.y - h/2), w, h);
      }
    }
  }

  getHitCircles() {
    if (!this._dispW || !this._dispH) return [];
    const r = Math.min(this._dispW, this._dispH) * 0.38;
    const out = [];
    for (const e of this.pool) if (e.alive) {
      if (e.dying) continue; // đang chết: không va chạm nữa
      out.push({ ref: e, x: e.x, y: e.y, r });
    }
    return out;
  }
}
