// ============================================================
// Keyboard input. Locked gameplay controls (CLAUDE.md):
// arrows, Space (jump), M (meow), Enter (confirm/skip), Esc
// (pause), plus debug keys 1-6, B, C, I, T.
// ============================================================

import { View } from './render.js';

const PREVENT = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space',
]);

export const Input = {
  down: new Set(),
  pressed: new Set(),
  // mouse is tracked in buffer (480x270) coordinates so UI hit-tests in
  // the same space everything is drawn in. clicked is a one-frame pulse.
  mouse: { x: -1, y: -1, inside: false },
  clicked: false,
  _el: null,

  init() {
    window.addEventListener('keydown', (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      if (!e.repeat) {
        this.down.add(e.code);
        this.pressed.add(e.code);
      }
    });
    window.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
    });
    window.addEventListener('blur', () => {
      this.down.clear();
    });

    this._el = document.getElementById('game');
    const toView = (e) => {
      const el = this._el || (this._el = document.getElementById('game'));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return {
        x: (e.clientX - r.left) / r.width * View.w,
        y: (e.clientY - r.top) / r.height * View.h,
      };
    };
    window.addEventListener('mousemove', (e) => {
      const p = toView(e); if (!p) return;
      this.mouse.x = p.x; this.mouse.y = p.y;
      this.mouse.inside = p.x >= 0 && p.x < View.w && p.y >= 0 && p.y < View.h;
    });
    window.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const p = toView(e); if (!p) return;
      this.mouse.x = p.x; this.mouse.y = p.y;
      if (p.x >= 0 && p.x < View.w && p.y >= 0 && p.y < View.h) this.clicked = true;
    });
  },

  isDown(code) { return this.down.has(code); },
  wasPressed(code) { return this.pressed.has(code); },

  dirX() {
    return (this.isDown('ArrowRight') ? 1 : 0) - (this.isDown('ArrowLeft') ? 1 : 0);
  },
  dirY() {
    return (this.isDown('ArrowDown') ? 1 : 0) - (this.isDown('ArrowUp') ? 1 : 0);
  },

  // call at end of frame
  endFrame() { this.pressed.clear(); this.clicked = false; },
};
