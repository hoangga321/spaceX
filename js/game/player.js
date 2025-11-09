// /js/game/player.js
export class Player {
  constructor({img, bullets, bounds, sizeRatioH=0.14, speed=260, fireRate=6, effectImg=null}) {
    this.img = img;
    this.effectImg = effectImg; // sprite nổ khi chết
    this.bullets = bullets;
    this.W = bounds.W; this.H = bounds.H;

    this.sizeRatioH = sizeRatioH;
    this.dispH = Math.round(this.H * this.sizeRatioH);
    this.dispW = this.dispH;

    const syncRatio = () => {
      if (this.img?.naturalWidth && this.img?.naturalHeight) {
        const ratio = this.img.naturalWidth / this.img.naturalHeight;
        this.dispW = Math.round(this.dispH * ratio);
      }
    };
    if (this.img) {
      if (this.img.complete) syncRatio();
      else this.img.addEventListener('load', syncRatio, { once:true });
    }

    this.speed = speed;
    this.x = this.W/2;
    this.y = this.H - Math.max(80, this.dispH*0.9);
    this.fireRate = fireRate;
    this._fireTimer = 0;

    // Hit & invuln
    this.hurtTimer = 0;
    this.invulnTimer = 0;
    this._shakePhase = 0;

    // Death
    this.deathTimer = 0;
  }

  isInvulnerable(){ return this.invulnTimer > 0 || this.deathTimer > 0; }
  isDead(){ return this.deathTimer > 0; }

  hurt(duration = 200, invuln = 600){
    if (this.deathTimer > 0) return;
    this.hurtTimer = duration;
    this.invulnTimer = Math.max(this.invulnTimer, invuln);
  }

  die(duration = 900){
    this.deathTimer = duration;
    this.hurtTimer = 0;
    this.invulnTimer = duration;
  }

  update(dt, input) {
    const d = dt/1000;

    if (this.deathTimer > 0) {
      this.deathTimer = Math.max(0, this.deathTimer - dt);
      return; // đang chết: không điều khiển/bắn
    }

    if (this.hurtTimer > 0) this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    if (this.hurtTimer > 0) this._shakePhase += d * 40;

    // Move
    let vx = 0;
    if (input.left && !input.right) vx = -1;
    if (input.right && !input.left) vx = 1;
    this.x += vx * this.speed * d;
    const halfW = this.dispW/2;
    this.x = Math.max(halfW, Math.min(this.W - halfW, this.x));

    // Fire
    this._fireTimer += d;
    const interval = 1 / this.fireRate;
    if (input.fire && this._fireTimer >= interval) {
      this._fireTimer = 0;
      const muzzleY = this.y - this.dispH/2;
      this.bullets.spawn(this.x, muzzleY - 6, -560);
    }
  }

  draw(ctx) {
    // Chết → chỉ vẽ sprite nổ
    if (this.deathTimer > 0) {
      const scale = 1.3;
      const dw = Math.round(this.dispW*scale), dh = Math.round(this.dispH*scale);
      const x = Math.round(this.x - dw/2), y = Math.round(this.y - dh/2);
      if (this.effectImg && this.effectImg.complete) {
        ctx.drawImage(this.effectImg, x, y, dw, dh);
      } else if (this.img && this.img.complete) {
        ctx.save(); ctx.globalAlpha = 0.9; ctx.filter = 'brightness(1.8)';
        ctx.drawImage(this.img, Math.round(this.x - this.dispW/2), Math.round(this.y - this.dispH/2), this.dispW, this.dispH);
        ctx.restore();
      }
      return;
    }

    if (!this.img || !this.img.complete) return;

    const shake = (this.hurtTimer > 0) ? Math.sin(this._shakePhase) * 1.8 : 0;
    const x = Math.round(this.x - this.dispW/2 + shake);
    const y = Math.round(this.y - this.dispH/2);

    if (this.hurtTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.filter = 'brightness(1.5)';
      ctx.drawImage(this.img, x, y, this.dispW, this.dispH);
      ctx.restore();
    } else if (this.invulnTimer > 0) {
      const blink = ((this.invulnTimer/60|0) % 2) ? 0.55 : 1;
      ctx.save(); ctx.globalAlpha = blink;
      ctx.drawImage(this.img, x, y, this.dispW, this.dispH);
      ctx.restore();
    } else {
      ctx.drawImage(this.img, x, y, this.dispW, this.dispH);
    }
  }
}
