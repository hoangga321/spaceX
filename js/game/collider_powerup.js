// /js/game/collider_powerup.js
const hit = (a,b)=>{ const dx=a.x-b.x, dy=a.y-b.y; const rr=(a.r+b.r)*(a.r+b.r); return dx*dx+dy*dy<=rr; };

export class PowerupCollider {
  constructor({ powerups, player }, opts = {}) {
    this.powerups = powerups;
    this.player = player;
    this.playerHitScale = opts.playerHitScale ?? 0.38;
  }

  step(){
    const got = { shield:false, heal:0, score:0 }; // trả kết quả để main xử lý
    if (!this.player?.dispW || !this.player?.dispH) return got;

    const pr = Math.min(this.player.dispW, this.player.dispH)*this.playerHitScale;
    const pc = { x:this.player.x, y:this.player.y, r:pr };

    for (const c of this.powerups.getHitCircles()){
      if (c.ref.alive && hit(pc, c)) {
        c.ref.alive = false;
        if (c.type==='shield') got.shield = true;
        else if (c.type==='heal') got.heal += 1;
        else if (c.type==='score') got.score += 100;
      }
    }
    return got;
  }
}
