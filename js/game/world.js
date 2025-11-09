// /js/game/world.js
export class World {
  constructor({canvas}) {
    this.canvas = canvas;
    this.bgVideo = document.getElementById('bgVideo');
    this.videoReady = false;
    this._setupVideo();
    window.addEventListener('resize', () => this._resizeCanvas(), {passive:true});
    this._resizeCanvas();
  }
  _setupVideo() {
    const v = this.bgVideo;
    if (!v) return;

    const markReady = (label) => {
      if (!this.videoReady) {
        console.debug('[Video]', label, '-> ready');
        v.classList.add('playing');         // <— hiện video (opacity:1)
        this.videoReady = true;
      }
    };

    v.addEventListener('loadedmetadata', () => markReady('loadedmetadata'));
    v.addEventListener('canplay',        () => markReady('canplay'));
    v.addEventListener('playing',        () => markReady('playing'));
    v.addEventListener('loadeddata',     () => markReady('loadeddata'));

    v.addEventListener('error', (e) => {
      console.error('[Video] error:', e, v?.error);
      v.classList.remove('playing');
      this.videoReady = false;
    });

    const tryPlay = () => v.play().catch(err => {
      console.warn('[Video] play() blocked:', err?.name || err);
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tryPlay();
    });
    tryPlay();
    setTimeout(tryPlay, 300); // thử lại sau 300ms đề phòng load chậm
  }
  _resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  update(dt) {}
}
