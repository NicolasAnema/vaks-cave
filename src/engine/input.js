// ============================================================
// Keyboard input. Locked gameplay controls (CLAUDE.md):
// arrows, Space (jump), M (meow), Enter (confirm/skip), Esc
// (pause), plus debug keys 1-6, B, C, I, T.
// ============================================================

const PREVENT = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space',
]);

export const Input = {
  down: new Set(),
  pressed: new Set(),

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
  endFrame() { this.pressed.clear(); },
};
