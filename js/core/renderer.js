// /js/core/renderer.js
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  clear({useFallback=false} = {}) {
    const {ctx, canvas} = this;
    // xoá trong suốt để thấy video/ảnh nền phía sau
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chỉ vẽ fallback khi KHÔNG có video đang chạy
    if (useFallback) {
      const g = ctx.createLinearGradient(0,0,0,canvas.height);
      g.addColorStop(0, '#101a33');
      g.addColorStop(1, '#0b1020');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  }
  drawBorder() {
    const {ctx, canvas} = this;
    ctx.strokeStyle = 'rgba(255,255,255,.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, canvas.width-1, canvas.height-1);
  }
  drawText(txt, x, y, opts={}) {
    const {ctx} = this;
    ctx.save();
    ctx.fillStyle = opts.color || 'rgba(255,255,255,.85)';
    ctx.font = opts.font || '16px system-ui';
    ctx.textAlign = opts.align || 'left';
    ctx.fillText(txt, x, y);
    ctx.restore();
  }
}
