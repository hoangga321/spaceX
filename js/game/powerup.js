// /js/game/powerup.js
export class PowerupPool {
  /**
   * @param {{ shield?:HTMLImageElement, heal?:HTMLImageElement, score?:HTMLImageElement }} imgs
   * @param {{ sizeRatioH?:number, speed?:number }} [opts]
   */
  constructor(imgs, opts = {}) {
    this.imgs = imgs || {};
    this.pool = [];
    this.sizeRatioH = opts.sizeRatioH ?? 0.08; // ~8% chiều cao khung
    this.speed = opts.speed ?? 120;            // rơi xuống
    this._lastH = 0;
    this._disp = {}; // {type:{w,h}}
  }

  _ensureSize(type){
    const H = this._lastH || 650;
    const img = this.imgs[type];
    if (!img || !img.complete) return false;
    const h = Math.max(14, Math.round(H * this.sizeRatioH));
    const ratio = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth/img.naturalHeight) : 1;
    this._disp[type] = { w: Math.round(h*ratio), h };
    return true;
  }

  spawn(type, x, y){
    const it = this.pool.find(o=>!o.alive) || this.pool[this.pool.push({alive:false})-1];
    it.alive = true; it.type = type; it.x = x; it.y = y; it.vy = this.speed;
  }

  update(dt, H){
    if (H>0) this._lastH = H;
    const d = dt/1000, lim = (this._lastH||650) + 50;
    for (const it of this.pool) if (it.alive){
      it.y += it.vy * d;
      if (it.y > lim) it.alive = false;
    }
  }

  draw(ctx){
    for (const it of this.pool) if (it.alive){
      const img = this.imgs[it.type];
      const disp = this._disp[it.type] || (this._ensureSize(it.type) && this._disp[it.type]);
      if (!img || !img.complete || !disp) continue;
      ctx.drawImage(img, Math.round(it.x - disp.w/2), Math.round(it.y - disp.h/2), disp.w, disp.h);
    }
  }

  // hình tròn va chạm
  getHitCircles(){
    const out = [];
    for (const it of this.pool) if (it.alive){
      const disp = this._disp[it.type]; // có thể chưa sẵn → lười xét cũng ok
      const r = disp ? Math.min(disp.w, disp.h)*0.42 : 20;
      out.push({ ref: it, x: it.x, y: it.y, r, type: it.type });
    }
    return out;
  }
}
