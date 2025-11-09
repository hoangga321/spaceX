// /js/game/enemy_bullet.js
// Đạn của quái: bay xuống, scale theo % chiều cao khung
export class EnemyBulletPool {
  /**
   * @param {HTMLImageElement} img
   * @param {{ sizeRatioH?: number }} [opts]
   */
  constructor(img, opts = {}) {
    this.img = img;
    this.pool = [];
    this.sizeRatioH = opts.sizeRatioH ?? 0.035; // ~3.5% H logic (vừa mắt)
    this._lastH = 0;   // chiều cao logic mới nhất (0 = chưa nhận)
    this._dispW = null;
    this._dispH = null;
    if (this.img && !this.img.complete) {
      this.img.addEventListener('load', () => {}, { once:true });
    }
  }

  setTheme(t){
    // t: { img?:string, sizeRatioH?:number }
    if (t?.sizeRatioH != null) this.sizeRatioH = t.sizeRatioH;
    if (t?.img) {
      const im = new Image();
      im.src = t.img;
      im.onload = ()=> {
        this.img = im;
        this._dispW = null; this._dispH = null; // tính lại kích thước vẽ
      };
    }
  }

  spawn(x, y, vy = 220) { // vy dương: rơi xuống
    const b = this.pool.find(o => !o.alive) || this.pool[this.pool.push({ alive:false })-1];
    b.alive = true;
    b.x = x; b.y = y;
    b.vy = (typeof vy === 'number' && vy > 0) ? vy : 220; // luôn dương
  }

  update(dt, H) {
    // Nhận H nếu có, nếu không giữ nguyên giá trị cũ; fallback 650 nếu vẫn chưa có
    if (typeof H === 'number' && H > 0) this._lastH = H;
    const effH = this._lastH > 0 ? this._lastH : 650;

    const d = dt / 1000;
    for (const b of this.pool) if (b.alive) {
      // luôn rơi xuống theo vy
      const vy = (typeof b.vy === 'number' && b.vy > 0) ? b.vy : 220;
      b.y += vy * d;

      // offscreen → tái sử dụng
      if (b.y < -40 || b.y > effH + 40) b.alive = false;
    }
  }

  _ensureDispSize() {
    const effH = this._lastH > 0 ? this._lastH : 650; // fallback chiều cao để scale
    if (!this.img || !this.img.complete) return false;
    const targetH = Math.max(2, Math.round(effH * this.sizeRatioH));
    const ratio = (this.img.naturalWidth && this.img.naturalHeight)
      ? (this.img.naturalWidth / this.img.naturalHeight) : 0.5;
    this._dispH = targetH;
    this._dispW = Math.max(1, Math.round(targetH * ratio));
    return true;
  }

  draw(ctx) {
    if (!this.img || !this.img.complete) return;
    if (!this._dispW || !this._dispH) { if (!this._ensureDispSize()) return; }
    const w = this._dispW, h = this._dispH;
    for (const b of this.pool) if (b.alive) {
      ctx.drawImage(this.img, Math.round(b.x - w/2), Math.round(b.y - h/2), w, h);
    }
  }

  // vòng tròn va chạm nhỏ cho collider
  getHitCircles() {
    if (!this._dispW || !this._dispH) {
      if (!this._ensureDispSize()) return [];
    }
    const r = Math.min(this._dispW, this._dispH) * 0.35;
    const out = [];
    for (const b of this.pool) if (b.alive) {
      out.push({ ref:b, x:b.x, y:b.y, r });
    }
    return out;
  }
}
