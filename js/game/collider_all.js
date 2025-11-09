// /js/game/collider_all.js
const hit = (a, b) => {
  const dx = a.x - b.x, dy = a.y - b.y;
  const rr = (a.r + b.r) * (a.r + b.r);
  return (dx*dx + dy*dy) <= rr;
};

export class ColliderAll {
  constructor({ bullets, enemies, enemyBullets, player }, opts = {}) {
    this.bullets = bullets;
    this.enemies = enemies;
    this.enemyBullets = enemyBullets;
    this.player = player;

    // optional boss
    this.getBoss = opts.getBoss || null;
    this.getBossBullets = opts.getBossBullets || null;

    this.playerBulletRadius = opts.playerBulletRadius ?? 6;
    this.playerHitScale = opts.playerHitScale ?? 0.38;
    this.bossHitScale = opts.bossHitScale ?? 1.0;
  }

  step() {
    let kill = 0;
    let hitPlayerByEnemy = false;
    let hitPlayerByEnemyBullet = false;
    let hitPlayerByBossBullet = false;
    const hitEnemies = [];
    const deadEnemies = [];

    // --- Player bullets (dùng bán kính cố định để không lệ thuộc sprite) ---
    const br = this.playerBulletRadius;
    const bCircles = [];
    if (this.bullets?.pool) {
      for (const b of this.bullets.pool) if (b.alive) {
        bCircles.push({ ref:b, x:b.x, y:b.y, r:br });
      }
    }

    // --- Enemy & bullets ---
    const eCircles  = this.enemies?.getHitCircles ? this.enemies.getHitCircles() : [];
    const ebCircles = this.enemyBullets?.getHitCircles ? this.enemyBullets.getHitCircles() : [];

    // --- Player as circle ---
    let pc = null;
    if (this.player?.dispW && this.player?.dispH) {
      const pr = Math.min(this.player.dispW, this.player.dispH) * this.playerHitScale;
      pc = { x:this.player.x, y:this.player.y, r:pr };
    }

    // A) Player bullets ↔ Enemy
    for (const bc of bCircles) {
      for (const ec of eCircles) {
        if (ec.ref.alive && bc.ref.alive && hit(bc, ec)) {
          ec.ref.hp -= 1;
          bc.ref.alive = false;
          hitEnemies.push(ec.ref);
          if (ec.ref.hp <= 0 && !ec.ref.dying) {
            ec.ref.hp = 0;
            ec.ref.dying = true;
            ec.ref.dieTimer = 420;
            deadEnemies.push(ec.ref);
            kill++;
          }
          break;
        }
      }
    }

    // A2) Player bullets ↔ Boss (ROBUST)
    const boss = this.getBoss ? this.getBoss() : null;
    if (boss?.alive && typeof boss.getHitCircle === 'function') {
      for (const b of bCircles) {
        if (!b.ref.alive) continue;
        const bcirc = boss.getHitCircle();
        if (!bcirc) continue;

        // nới hitbox 1 ít để tránh "trượt mép" do sprite lớn/viền tối
        bcirc.r *= (this.bossHitScale || 1.0);
        const bb = { x:b.x, y:b.y, r:b.r + 4 };

        if (hit(bb, bcirc)) {
          b.ref.alive = false;
          if (typeof boss.hit === 'function') boss.hit(1);
          else if (typeof boss.hp === 'number') boss.hp = Math.max(0, boss.hp - 1);
          // KHÔNG break: cùng frame nhiều viên vẫn tính đủ
        }
      }
    }

    // B) Enemy ↔ Player
    if (pc) {
      for (const ec of eCircles) {
        if (ec.ref.alive && hit(pc, ec)) {
          ec.ref.alive = false;
          hitPlayerByEnemy = true;
          break;
        }
      }
    }

    // C) Enemy bullets ↔ Player
    if (pc) {
      for (const ebc of ebCircles) {
        if (ebc.ref.alive && hit(pc, ebc)) {
          ebc.ref.alive = false;
          hitPlayerByEnemyBullet = true;
          break;
        }
      }
    }

    // C2) Boss bullets ↔ Player
    const bossBullets = this.getBossBullets ? this.getBossBullets() : null;
    if (pc && bossBullets?.getHitCircles) {
      const bb = bossBullets.getHitCircles();
      for (const c of bb) {
        if (c.ref.alive && hit(pc, c)) {
          c.ref.alive = false;
          hitPlayerByBossBullet = true;
          break;
        }
      }
    }

    return {
      kill, hitEnemies, deadEnemies,
      hitPlayerByEnemy, hitPlayerByEnemyBullet,
      hitPlayerByBossBullet
    };
  }
}
