// /js/game/spawner.js
export class Spawner {
  /**
   * @param {EnemyPool} enemies
   * @param {{ width:number, height:number }} bounds
   */
  constructor(enemies, bounds) {
    this.enemies = enemies;
    this.W = bounds.width;
    this.H = bounds.height;

    this.timer = 0;
    this.interval = 900;     // ms – tần suất sinh
    this.speedMul = 1.0;     // tăng dần theo thời gian/wave (sau sẽ nối diff/mode)

    this.themeKey = 'basic';
    // Điều tiết spawn theo theme (nhẹ để không override quá mạnh EnemyPool)
    this.THEME_TUNING = {
      basic:   { interval: 900, inc: 0.02, minInterval: 520 },
      wasp:    { interval: 820, inc: 0.025, minInterval: 520 },
      sentinel:{ interval: 980, inc: 0.018, minInterval: 560 },
      weaver:  { interval: 860, inc: 0.022, minInterval: 520 },
      strider: { interval: 940, inc: 0.020, minInterval: 540 }
    };
  }

  setTheme(themeKey){
    this.themeKey = themeKey || 'basic';
    const t = this.THEME_TUNING[this.themeKey] || this.THEME_TUNING.basic;
    this.interval = t.interval;
    this.speedMul = 1.0;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.interval) {
      this.timer = 0;
      const x = Math.round(20 + Math.random() * (this.W - 40));
      this.enemies.spawn(x, this.H, this.speedMul, 1);
      // Tăng nhẹ độ khó theo thời gian
      const t = this.THEME_TUNING[this.themeKey] || this.THEME_TUNING.basic;
      this.speedMul = Math.min(2.0, this.speedMul + t.inc);
      this.interval = Math.max(t.minInterval, this.interval - 6);
    }
  }
}
