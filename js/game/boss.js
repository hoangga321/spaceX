// /js/game/boss.js
export class Boss {
  constructor(img, opts = {}) {
    this.img = img;
    this.name = opts.name || 'BOSS';
    this.hpMax = Math.max(1, opts.hpMax ?? 6000);
    this.hp = this.hpMax;
    this.sizeRatioH = opts.sizeRatioH ?? 0.22;

    this.alive = false;
    this.invulnTimer = 0;
    this.hurtTimer = 0;
    this.phase = 1;
    this.telegraphT = 0;
    this.cooldown = 0;

    this.W = 0; this.H = 0;
    this.dispW = 0; this.dispH = 0;

    this.motionSet = null; // {1:fn,2:fn,3:fn}
    this.t = 0;            // thời gian sống để làm sin/cos
    this._vx = null;       // vận tốc ngang cho strafing
    this._zx = null;       // vận tốc ngang cho zigzag

    if (this.img && !this.img.complete) {
      this.img.addEventListener('load', () => this._syncSize(), { once:true });
    }
  }

  spawn(W, H, hpMax = this.hpMax, { motionSet=null, name=null } = {}) {
    this.W = W; this.H = H;
    this.hpMax = Math.max(1, hpMax);
    this.hp = this.hpMax;
    if (name) this.name = name;
    this.motionSet = motionSet;

    this._syncSize();
    this.x = Math.round(W/2);

    const halfH = Math.max(15, Math.round(this.dispH * 0.5));
    this.targetY = Math.round(H * 0.22);
    if (this.targetY < halfH) this.targetY = halfH;
    if (this.targetY > H - halfH) this.targetY = H - halfH;

    this.y = -Math.round(this.dispH*0.6);
    this.vy = 260;
    this.alive = true;
    this.phase = 1;
    this.invulnTimer = 1200;
    this.cooldown = 0;
    this.hurtTimer = 0;
    // đảm bảo luôn có cảnh báo nếu có trường hợp nhảy thẳng vào BOSS
    this.telegraphT = Math.max(this.telegraphT, 1000);
    this.t = 0;

    // clamp ngay sau spawn
    this._clampInside(true);
    this._unstickEdge();   // <— gỡ kẹt ngay lập tức

    // reset hướng cũ
    this._vx = null;
    this._zx = null;
  }

  isDead(){ return !this.alive || this.hp <= 0; }

  _syncSize(){
    if (!this.H || !this.img?.naturalHeight) return;

    let dispH = Math.max(30, Math.round(this.H * this.sizeRatioH));
    const ratio = this.img.naturalWidth / this.img.naturalHeight;
    let dispW = Math.max(30, Math.round(dispH * ratio));

    // Giới hạn để không vượt khung
    if (this.W > 0) {
      const maxW = Math.round(this.W * 0.86);
      if (dispW > maxW) {
        dispW = maxW;
        dispH = Math.max(30, Math.round(dispW / ratio));
      }
    }
    if (this.H > 0) {
      const maxH = Math.round(this.H * 0.40);
      if (dispH > maxH) {
        dispH = maxH;
        dispW = Math.max(30, Math.round(dispH * ratio));
      }
    }

    this.dispH = dispH;
    this.dispW = dispW;

    // Sau khi đổi kích thước có thể bị “dính” mép — gỡ kẹt ngay
    this._clampInside(true);
    this._unstickEdge();
  }

  _clampInside(nudgeDir = false){
    if (!this.dispW || !this.dispH) return;
    const halfW = this.dispW * 0.5;
    const halfH = this.dispH * 0.5;

    // clamp X
    if (this.x < halfW) {
      this.x = halfW;
      if (nudgeDir) {
        if (this._vx == null || this._vx < 0) this._vx = Math.abs(this._vx ?? 120);
        if (this._zx == null || this._zx < 0) this._zx = Math.abs(this._zx ?? 120);
      }
    } else if (this.x > this.W - halfW) {
      this.x = this.W - halfW;
      if (nudgeDir) {
        if (this._vx == null || this._vx > 0) this._vx = -Math.abs(this._vx ?? 120);
        if (this._zx == null || this._zx > 0) this._zx = -Math.abs(this._zx ?? 120);
      }
    }

    // clamp Y
    if (this.y < halfH) {
      this.y = halfH;
    } else if (this.y > this.H - halfH) {
      this.y = this.H - halfH;
    }
  }

  // —— GỠ KẸT Ở BIÊN: đẩy vào trong & ép hướng rời biên
  _unstickEdge() {
    if (!this.dispW) return;
    const half = this.dispW * 0.5;
    if (this.x <= half + 1) {                 // mép trái
      this.x = half + 10;
      this._vx = Math.max(120, Math.abs(this._vx ?? 140));
      this._zx = Math.max(120, Math.abs(this._zx ?? 140));
    } else if (this.x >= this.W - half - 1) { // mép phải
      this.x = this.W - half - 10;
      this._vx = -Math.max(120, Math.abs(this._vx ?? 140));
      this._zx = -Math.max(120, Math.abs(this._zx ?? 140));
    }
  }

  getHitCircle(){
    if (!this.alive || !this.dispW || !this.dispH) return null;
    const r = Math.min(this.dispW, this.dispH) * 0.56;
    return { x: this.x, y: this.y, r, ref: this };
  }

  setTelegraph(ms){ this.telegraphT = Math.max(this.telegraphT, ms|0); }
  setInvuln(ms){ this.invulnTimer = Math.max(this.invulnTimer, ms|0); }

  hit(dmg = 1){
    if (!this.alive) return;
    if (this.invulnTimer > 0) return;
    this.hp = Math.max(0, this.hp - dmg);
    this.hurtTimer = 140;
    if (this.hp <= 0) { this.alive = false; return; }

    const p = this.hp / this.hpMax;
    const prev = this.phase;
    if (p <= 0.30) this.phase = 3;
    else if (p <= 0.60) this.phase = 2;
    else this.phase = 1;
    if (this.phase !== prev) {
      this.invulnTimer = 500;
      this.cooldown = 400;
      // đổi phase thì bỏ hướng cũ để motionSet tự thiết lập
      this._vx = null;
      this._zx = null;
    }
  }

  _motionLib(){
    const W = this.W, H = this.H, self = this;

    return {
      hoverSin: (ampX=80, speed=1.2) => (dt)=>{
        self.x = Math.round(W/2 + Math.sin(self.t*speed)*ampX);
        self.y = self.targetY;
      },
      strafing: (vx=120) => (dt)=>{
        self.x += (self._vx ?? (self._vx = Math.max(60, vx))) * dt;
        if (self.x < self.dispW*0.5) { self.x = self.dispW*0.5; self._vx = Math.abs(self._vx ?? 120); }
        if (self.x > W - self.dispW*0.5) { self.x = W - self.dispW*0.5; self._vx = -Math.abs(self._vx ?? 120); }
        self.y = self.targetY;
      },
      zigZag: (vx=100, vy=35) => (dt)=>{
        self.x += (self._zx ?? (self._zx = Math.max(60, vx))) * dt;
        self.y = self.targetY + Math.sin(self.t*2.2)*vy;
        if (self.x < self.dispW*0.5) { self.x = self.dispW*0.5; self._zx = Math.abs(self._zx ?? 120); }
        if (self.x > W - self.dispW*0.5) { self.x = W - self.dispW*0.5; self._zx = -Math.abs(self._zx ?? 120); }
      },
      orbit: (r=90, w=0.9) => (dt)=>{
        const cx = W/2, cy = self.targetY;
        self.x = Math.round(cx + Math.cos(self.t*w)*r);
        self.y = Math.round(cy + Math.sin(self.t*w)*Math.max(36, r*0.45));
      },
      verticalStride: (ampY=36, w=1.6) => (dt)=>{
        self.x = self.x || Math.round(W/2);
        self.y = Math.round(self.targetY + Math.sin(self.t*w)*ampY);
      }
    };
  }

  move(dt){
    if (!this.alive) return;
    const d = dt/1000;
    this.t += d;

    // Trượt xuống vị trí mục tiêu ở phase đầu
    if (this.y < this.targetY) {
      this.y += Math.max(120, this.vy) * d;
      if (this.y > this.targetY) this.y = this.targetY;
      this._clampInside(true);
      this._unstickEdge(); // <— gỡ kẹt nếu vừa clamp
      return;
    }

    // Chạy motion hiện tại
    const lib = this._motionLib();
    const runner = this.motionSet?.[this.phase];
    if (typeof runner === 'function') {
      runner(d);
    } else {
      lib.hoverSin(70, 1.0)(d);
    }
    this._clampInside(true);
    this._unstickEdge();   // <— gỡ kẹt sau khi di chuyển
  }

  update(dt){
    if (!this.alive) return;
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    if (this.hurtTimer > 0) this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.telegraphT > 0) this.telegraphT = Math.max(0, this.telegraphT - dt);
    this.move(dt);
  }

  draw(ctx){
    if (!this.alive || !this.img?.complete) return;
    const x = Math.round(this.x - this.dispW/2);
    const y = Math.round(this.y - this.dispH/2);

    if (this.hurtTimer > 0 || this.invulnTimer > 0) {
      ctx.save();
      ctx.globalAlpha = (this.invulnTimer > 0) ? 0.8 : 0.95;
      ctx.filter = 'brightness(1.35)';
      ctx.drawImage(this.img, x, y, this.dispW, this.dispH);
      ctx.restore();
    } else {
      ctx.drawImage(this.img, x, y, this.dispW, this.dispH);
    }
  }
}
