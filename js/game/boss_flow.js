// /js/game/boss_flow.js
export class BossFlow {
  constructor({ wavesBeforeBoss = 4 } = {}){
    this.wavesBeforeBoss = wavesBeforeBoss;

    // Thứ tự boss (lặp vòng)
    this.ORDER = ['dreadnought', 'phantom_wasp', 'aegis_sentinel', 'nova_weaver', 'titan_strider'];

    // Danh bạ boss: tên hiển thị + ảnh + HP cơ sở (normal)
    this.TABLE = {
      dreadnought:   { name:'DREADNOUGHT Mk.I', img:'assets/img/boss/boss1.jpg',  hpBase: 100 },
      phantom_wasp:  { name:'PHANTOM WASP',     img:'assets/img/boss/boss2.jpg',  hpBase: 110 },
      aegis_sentinel:{ name:'AEGIS SENTINEL',   img:'assets/img/boss/boss3.jpg',  hpBase: 140 },
      nova_weaver:   { name:'NOVA WEAVER',      img:'assets/img/boss/boss4.jpg',  hpBase: 150 },
      titan_strider: { name:'TITAN STRIDER',    img:'assets/img/boss/boss5.jpg',  hpBase: 160 }
    };

    // Map boss → theme enemy cho wave kế tiếp
    // (ĐÃ đổi dreadnought → wasp để nhìn khác ngay sau boss 1)
    this.BOSS_TO_THEME = {
      dreadnought:   'wasp',
      phantom_wasp:  'sentinel',
      aegis_sentinel:'weaver',
      nova_weaver:   'strider',
      titan_strider: 'basic'
    };
  }

  shouldEnterBoss(waveCount){
    return waveCount > 0 && (waveCount % this.wavesBeforeBoss === 0);
  }

  _indexForWave(wave){
    const firstBossWave = this.wavesBeforeBoss;
    if (wave < firstBossWave) return { idx:0, loop:0 };
    const n = Math.floor((wave - firstBossWave) / this.wavesBeforeBoss); // 0..1..2..
    const idx = n % this.ORDER.length;
    const loop = Math.floor(n / this.ORDER.length);
    return { idx, loop };
  }

  _hpFor(diff, base, loop){
    const diffMul =
      diff === 'easy'   ? 0.75 :
      diff === 'hard'   ? 1.20 :
                          1.00;
    const loopMul = 1 + Math.min(0.15 * loop, 0.45);
    return Math.round(base * diffMul * loopMul);
  }

  getBossForWave(wave, diff='normal'){
    const { idx, loop } = this._indexForWave(wave);
    const id = this.ORDER[idx];
    const meta = this.TABLE[id];
    if (!meta) return null;
    return {
      id,
      name: meta.name,
      imgSrc: meta.img,
      hpMax: this._hpFor(diff, meta.hpBase, loop),
      loop
    };
  }

  // Theme enemy cho WAVE KẾ TIẾP
  getEnemyThemeForWave(nextWave){
    const { idx } = this._indexForWave(nextWave);
    if (nextWave < this.wavesBeforeBoss) return 'basic';
    const id = this.ORDER[idx];
    return this.BOSS_TO_THEME[id] || 'basic';
  }
}
