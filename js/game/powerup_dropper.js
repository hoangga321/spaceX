// /js/game/powerup_dropper.js
export class PowerupDropper {
  /**
   * @param {PowerupPool} pool
   * @param {{ pShield?:number, pHeal?:number, pScore?:number, guaranteeEvery?:number }} [chance]
   */
  constructor(pool, chance = {}) {
    this.pool = pool;
    this.pShield = chance.pShield ?? 0.10;
    this.pHeal   = chance.pHeal   ?? 0.08;
    this.pScore  = chance.pScore  ?? 0.18;

    // Nếu x kill liền không rơi gì → kill kế tiếp đảm bảo rơi 1 món (0 = tắt)
    this.guaranteeEvery = Math.max(0, chance.guaranteeEvery ?? 0);
    this._sinceLastDrop = 0;
  }

  onEnemyDeaths(enemies){
    if (!enemies || !enemies.length) return;

    for (const e of enemies) {
      let dropped = false;

      // Mỗi loại kiểm tra độc lập (Bernoulli)
      if (Math.random() < this.pShield) { this.pool.spawn('shield', e.x, e.y); dropped = true; }
      if (Math.random() < this.pHeal)   { this.pool.spawn('heal',   e.x, e.y); dropped = true; }
      if (Math.random() < this.pScore)  { this.pool.spawn('score',  e.x, e.y); dropped = true; }

      // Bảo hiểm: nếu chưa rơi gì và bật guarantee
      if (!dropped && this.guaranteeEvery > 0) {
        this._sinceLastDrop++;
        if (this._sinceLastDrop >= this.guaranteeEvery) {
          this.pool.spawn('score', e.x, e.y); // default dễ thấy
          this._sinceLastDrop = 0;
        }
      } else if (dropped) {
        this._sinceLastDrop = 0;
      }
    }
  }
}
