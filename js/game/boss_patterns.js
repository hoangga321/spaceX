// /js/game/boss_patterns.js
export function rad(deg){ return deg*Math.PI/180; }

// Giữ nguyên các pattern cũ:
export function patternFan(cx, cy, pool, {count=6, spreadDeg=48, speed=230} = {}){
  const base = Math.PI/2; // xuống
  const step = (count>1) ? rad(spreadDeg)/(count-1) : 0;
  for (let i=0;i<count;i++){
    const ang = base - rad(spreadDeg/2) + i*step;
    pool.spawn(cx, cy, speed, ang, 0);
  }
}
export function patternAimed(cx, cy, pool, player, {count=3, jitter=rad(5), speed=240} = {}){
  if (!player) return;
  const base = Math.atan2(player.y - cy, player.x - cx);
  const half = (count-1)/2;
  for (let i=0;i<count;i++){
    const offset = (i-half) * jitter;
    pool.spawn(cx, cy, speed, base + offset, 0);
  }
}
export function patternSpiral(cx, cy, pool, {rings=10, stepDeg=22, baseSpeed=230, va=1.0} = {}){
  // xoáy bằng gia tốc góc (va). Gọi lặp nhiều frame trong main.
  const ang = rad(stepDeg) * (Math.random()*10|0);
  pool.spawn(cx, cy, baseSpeed, Math.PI/2 + ang, va);
}
export function patternBurst(cx, cy, pool, {rings=2, perRing=8, baseSpeed=210, grow=35} = {}){
  const base = Math.PI/2;
  const step = (Math.PI*2)/perRing;
  for (let r=0;r<rings;r++){
    const v = baseSpeed + r*grow;
    const seed = Math.random()*Math.PI*2;
    for (let i=0;i<perRing;i++){
      const ang = seed + i*step;
      pool.spawn(cx, cy, v, ang, 0);
    }
  }
}

// ===== Pattern bổ sung để phase sau khó hơn nhưng còn khe né =====

// “Mưa đạn” rơi thẳng theo dải x
export function patternRain(pool, { lanes=6, speed=260, W=620, top=0 } = {}){
  const gap = W / (lanes+1);
  for (let i=1;i<=lanes;i++){
    const x = Math.round(gap*i);
    pool.spawn(x, top, speed, Math.PI/2, 0);
  }
}

// Fan + scatter sau “dash” (dùng như 1 cú xả rộng nhưng speed thấp)
export function patternDashScatter(cx, cy, pool, { count=10, spreadDeg=120, speed=200 } = {}){
  const base = Math.PI/2;
  const step = (count>1) ? rad(spreadDeg)/(count-1) : 0;
  for (let i=0;i<count;i++){
    const ang = base - rad(spreadDeg/2) + i*step;
    pool.spawn(cx, cy, speed, ang, 0);
  }
}

// Vòng “web ring”: nổ 1 vòng đều + có khe ngẫu nhiên
export function patternWebRing(cx, cy, pool, { perRing=10, speed=220 } = {}){
  const step = (Math.PI*2)/perRing;
  const hole = (Math.random()*perRing)|0; // tạo 1 khe
  const seed = Math.random()*Math.PI*2;
  for (let i=0;i<perRing;i++){
    if (i === hole) continue;
    const ang = seed + i*step;
    pool.spawn(cx, cy, speed, ang, 0);
  }
}

// Spiral “weave”: xoáy + đổi hướng nhẹ để dệt lưới
export function patternWeaveSpiral(cx, cy, pool, { baseSpeed=230, stepDeg=18, va=0.9 } = {}){
  patternSpiral(cx, cy, pool, { rings:1, stepDeg, baseSpeed, va });
}
