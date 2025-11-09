// /js/game/boss_bullet.js
export class BossBulletPool {
  /**
   * @param {HTMLImageElement} img
   * @param {{ sizeRatioH?:number }} [opts]
   */
  constructor(img, opts = {}) {
    this.img = img;
    this.pool = [];
    this.sizeRatioH = opts.sizeRatioH ?? 0.05; // nếu vẫn thấy to, có thể truyền 0.045 từ main
    this._lastH = 0;
    this._dispW = null;
    this._dispH = null;
    if (this.img && !this.img.complete) {
      this.img.addEventListener('load', () => {}, { once:true });
    }
  }

  spawn(x, y, speed = 260, angRad = Math.PI/2, va = 0){
    const b = this.pool.find(o => !o.alive) || this.pool[this.pool.push({alive:false})-1];
    b.alive = true;
    b.x = x; b.y = y;
    b.v = speed; // px/s
    b.ang = angRad; // rad
    b.va = va; // rad/s (spiral)
  }

 update(dt, W, H) {
  if (W > 0) this._lastW = W;
  if (H > 0) this._lastH = H;

  const effW = this._lastW || 360;
  const effH = this._lastH || 650;
  const d = dt / 1000;

  for (const b of this.pool) if (b.alive) {
    b.ang += b.va * d;
    b.x += Math.cos(b.ang) * b.v * d;
    b.y += Math.sin(b.ang) * b.v * d;

    // out-of-bounds đúng theo W/H (kèm đệm 50px)
    if (b.x < -50 || b.x > effW + 50 || b.y < -50 || b.y > effH + 50) {
      b.alive = false;
    }
  }
}


  _ensureDispSize(){
    const effH = this._lastH || 650;
    if (!this.img || !this.img.complete) return false;
    const h = Math.max(6, Math.round(effH * this.sizeRatioH));
    const ratio = (this.img.naturalWidth && this.img.naturalHeight) ? (this.img.naturalWidth/this.img.naturalHeight) : 1;
    this._dispH = h; this._dispW = Math.max(6, Math.round(h*ratio));
    return true;
  }

  draw(ctx){
    if (!this.img || !this.img.complete) return;
    if (!this._dispW || !this._dispH) { if (!this._ensureDispSize()) return; }
    for (const b of this.pool) if (b.alive){
      ctx.drawImage(this.img, Math.round(b.x - this._dispW/2), Math.round(b.y - this._dispH/2), this._dispW, this._dispH);
    }
  }

  getHitCircles(){
    if (!this._dispW || !this._dispH) { if (!this._ensureDispSize()) return []; }
    const r = Math.min(this._dispW, this._dispH) * 0.42;
    const out = [];
    for (const b of this.pool) if (b.alive) out.push({ ref:b, x:b.x, y:b.y, r });
    return out;
  }
}
