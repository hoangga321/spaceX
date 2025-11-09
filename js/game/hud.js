export class HUD {
  constructor() {
    this.elScore = document.getElementById('hudScore');
    this.elHp    = document.getElementById('hudHp');
    this.elWave  = document.getElementById('hudWave');
  }
  setScore(v){ if (this.elScore) this.elScore.textContent = `Score: ${v}`; }
  setHp(v){ if (this.elHp) this.elHp.textContent = `HP: ${v}`; }
  setWave(v){ if (this.elWave) this.elWave.textContent = `Wave: ${v}`; }
}
