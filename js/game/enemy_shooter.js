// /js/game/enemy_shooter.js
// Bắn theo mỗi enemy mà không sửa enemy.js: dùng WeakMap làm timer riêng
export class EnemyShooter {
  /**
   * @param {{ rateMin?:number, rateMax?:number, speed?:number, spread?:number }} [opts]
   *  - rateMin, rateMax: khoảng thời gian giữa 2 phát (giây)
   *  - speed: tốc độ viên đạn (px/s, dương = bay xuống)
   *  - spread: độ lệch ngang khi bắn (px), 0 = thẳng xuống
   */
  constructor(opts = {}) {
    this.rateMin = opts.rateMin ?? 1.5;
    this.rateMax = opts.rateMax ?? 2.8;
    this.speed   = (opts.speed ?? 220) > 0 ? (opts.speed ?? 220) : 220; // fallback an toàn
    this.spread  = opts.spread  ?? 0;
    this.timers = new WeakMap(); // enemyRef -> nextFireTs (ms)
    this._now = 0;
  }

  setTheme(theme) {
    // theme: { rateMin?, rateMax?, speed?, spread? }
    if (!theme) return;
    if (theme.rateMin != null) this.rateMin = theme.rateMin;
    if (theme.rateMax != null) this.rateMax = theme.rateMax;
    if (theme.speed   != null) this.speed   = theme.speed > 0 ? theme.speed : this.speed;
    if (theme.spread  != null) this.spread  = theme.spread;
    // Reset timer bắn để tránh bắn dồn ngay sau khi đổi theme
    this.timers = new WeakMap();
  }

  _nextIntervalMs() {
    const s = this.rateMin + Math.random() * Math.max(0, this.rateMax - this.rateMin);
    return Math.round(s * 1000);
  }

  update(dt, enemies, enemyBullets) {
    this._now += dt;
    if (!enemies || !enemies.pool || !enemyBullets) return;

    for (const e of enemies.pool) {
      if (!e || !e.alive) continue;
      if (e.dying) continue; // đừng bắn khi đang chạy hiệu ứng chết

      let next = this.timers.get(e);
      if (next == null) {
        next = this._now + this._nextIntervalMs();
        this.timers.set(e, next);
      }
      if (this._now >= next) {
        // bắn 1 viên (có thể mở rộng pattern sau)
        const sx = (this.spread > 0) ? (Math.random() * this.spread * 2 - this.spread) : 0;
        const vy = (this.speed && this.speed > 0) ? this.speed : 220; // đảm bảo dương
        enemyBullets.spawn(e.x + sx, e.y + 18, vy);
        this.timers.set(e, this._now + this._nextIntervalMs());
      }
    }
  }
}
