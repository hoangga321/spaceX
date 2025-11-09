// state.js - M1: state machine tối giản (change/push/pop)
export class StateMachine {
  constructor(initial=null, states={}) {
    this.stack = [];
    this.states = states; // {name: {enter, exit, update}}
    if (initial) this.change(initial);
  }
  current() { return this.stack[this.stack.length-1]; }
  change(name, data) {
    if (this.stack.length) this._call(this.current(), 'exit');
    this.stack = [name];
    this._call(name, 'enter', data);
  }
  push(name, data) {
    if (this.stack.length) this._call(this.current(), 'pause');
    this.stack.push(name);
    this._call(name, 'enter', data);
  }
  pop() {
    if (!this.stack.length) return;
    this._call(this.stack.pop(), 'exit');
    if (this.stack.length) this._call(this.current(), 'resume');
  }
  update(dt, ctx) {
    const name = this.current();
    if (!name) return;
    this._call(name, 'update', dt, ctx);
  }
  _call(name, fn, ...args) {
    const s = this.states[name];
    if (s && typeof s[fn] === 'function') s[fn](...args);
  }
}
