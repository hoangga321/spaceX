// /js/core/input.js
export class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.fire = false; // giữ Space để bắn
    this._bindKeyboard();
    this._bindTouch();
  }

  clear() {
    this.left = this.right = this.fire = false;
  }

  _bindKeyboard() {
    const down = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this.left = true;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) this.right = true;
      if (e.code === 'Space') this.fire = true;
    };
    const up = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this.left = false;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) this.right = false;
      if (e.code === 'Space') this.fire = false;
    };
    addEventListener('keydown', down);
    addEventListener('keyup', up);
  }

  _bindTouch() {
    const L = document.getElementById('touchLeft');
    const R = document.getElementById('touchRight');
    if (!L || !R) return;

    const set = (el, on) => {
      if (el === L) this.left = on;
      if (el === R) this.right = on;
    };
    const bind = (el) => {
      el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); set(el, true); });
      el.addEventListener('pointerup',   () => set(el, false));
      el.addEventListener('pointercancel', () => set(el, false));
      el.addEventListener('pointerleave',  () => set(el, false));
    };
    bind(L); bind(R);
  }
}
