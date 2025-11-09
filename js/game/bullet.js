// /js/game/bullet.js
export class BulletPool {
  /**
   * @param {HTMLImageElement} img
   * @param {{ sizeRatioH?: number }} [opts]
   *   sizeRatioH: tỷ lệ chiều cao viên đạn so với chiều cao khung logic (0.03~0.05 đẹp)
   */
  constructor(img, opts = {}) {
    this.img = img;
    this.pool = [];
    this.sizeRatioH = opts.sizeRatioH ?? 0.060; // đạn cao ~3.5% H
    this._lastH = null;        // lưu chiều cao logic lần gần nhất (nhận từ update)
    this._dispW = null;        // kích thước vẽ sau khi scale
    this._dispH = null;

    // Khi ảnh load xong thì có thể tính lại tỉ lệ w/h (sẽ tính chính xác ở draw)
    if (this.img && !this.img.complete) {
      this.img.addEventListener('load', () => { /* no-op: tính ở draw */ }, { once: true });
    }
  }

  spawn(x, y, vy = -620) {
    const b = this.pool.find(o => !o.alive) || this.pool[this.pool.push({ alive: false }) - 1];
    b.alive = true; b.x = x; b.y = y; b.vy = vy;
  }

  update(dt, H) {
    // Nhận chiều cao logic mỗi frame để vẽ đúng tỉ lệ
    if (typeof H === 'number') this._lastH = H;

    const d = dt / 1000;
    for (const b of this.pool) if (b.alive) {
      b.y += b.vy * d;
      if (b.y < -20 || b.y > H + 20) b.alive = false;
    }
  }

  _ensureDispSize() {
    if (!this.img || !this.img.complete || !this._lastH) return false;
    const targetH = Math.max(2, Math.round(this._lastH * this.sizeRatioH)); // chiều cao đạn sau scale
    const ratio = this.img.naturalWidth / this.img.naturalHeight || 0.5;
    this._dispH = targetH;
    this._dispW = Math.max(1, Math.round(targetH * ratio));
    return true;
  }

  draw(ctx) {
    if (!this.img || !this.img.complete || !this._lastH) return; // KHÔNG vẽ khi chưa có đủ dữ liệu

    if (!this._dispW || !this._dispH) {
      if (!this._ensureDispSize()) return;
    }

    const w = this._dispW, h = this._dispH;
    for (const b of this.pool) if (b.alive) {
      ctx.drawImage(this.img, Math.round(b.x - w / 2), Math.round(b.y - h / 2), w, h);
    }
  }
}
