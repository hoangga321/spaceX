// /js/game/boss_ui.js
export function drawBossBar(ctx, boss, { w, h, x=40, y=16 } = {}){
  if (!boss?.alive || boss.hp <= 0) return;
  const p = Math.max(0, Math.min(1, boss.hp / boss.hpMax));
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x-2, y-2, w+4, h+22);
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, w, h);
  // HP fill
  ctx.fillStyle = '#8b0000';
  ctx.fillRect(x, y, Math.round(w*p), h);
  // ticks 60%/30%
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  const t60 = x + Math.round(w * 0.60);
  const t30 = x + Math.round(w * 0.30);
  ctx.fillRect(t60, y, 2, h);
  ctx.fillRect(t30, y, 2, h);
  // label
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#fff';
  const nm = boss.name || 'BOSS';
  ctx.fillText(`${nm} — Phase ${boss.phase}`, x + 6, y + h + 14);
  ctx.restore();
}

export function drawWarning(ctx, imgWarn, x, y, t){
  if (t <= 0) return;
  const a = Math.min(1, t/800);
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.75*a;
  if (imgWarn?.complete) {
    const s = 36 + Math.round(10 * a);
    ctx.drawImage(imgWarn, Math.round(x - s/2), Math.round(y - s/2), s, s);
  } else {
    ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), 24, 0, Math.PI*2);
    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.restore();
}
