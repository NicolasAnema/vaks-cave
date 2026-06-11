// ============================================================
// One camera for both worlds: the level's orientation decides
// which axis scrolls and which way the lookahead biases.
// Vertical: upward bias (the climb). Horizontal: forward bias
// (the sprint). Includes toggleable screen shake.
// ============================================================

import { CONFIG } from '../config.js';
import { View } from './render.js';
import { Save } from '../systems/save.js';

export class Camera {
  constructor(orientation, levelW, levelH) {
    this.orientation = orientation;
    this.levelW = levelW; this.levelH = levelH;
    this.x = 0; this.y = 0;
    this.shake = 0;
    this.sx = 0; this.sy = 0;
  }

  snapTo(px, py) {
    const t = this.target(px, py);
    this.x = t.x; this.y = t.y;
  }

  target(px, py) {
    let tx, ty;
    if (this.orientation === 'vertical') {
      tx = (this.levelW - View.w) / 2;
      ty = py - View.h / 2 - CONFIG.camera.lookUp;
    } else {
      tx = px - View.w * 0.40 + CONFIG.camera.lookAhead;
      ty = (this.levelH - View.h) / 2;
    }
    tx = Math.max(0, Math.min(this.levelW - View.w, tx));
    ty = Math.max(0, Math.min(this.levelH - View.h, ty));
    return { x: tx, y: ty };
  }

  follow(px, py, dt) {
    const t = this.target(px, py);
    const k = 1 - Math.exp(-CONFIG.camera.lerp * dt);
    this.x += (t.x - this.x) * k;
    this.y += (t.y - this.y) * k;
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - CONFIG.camera.shakeDecay * dt * this.shake - 0.5 * dt);
      this.sx = (Math.random() * 2 - 1) * this.shake;
      this.sy = (Math.random() * 2 - 1) * this.shake;
    } else { this.sx = 0; this.sy = 0; }
  }

  addShake(mag) {
    if (!Save.data.settings.shake) return;
    this.shake = Math.min(6, this.shake + mag);
  }

  // integer camera position (+shake) for crisp pixels
  ox() { return Math.round(this.x + this.sx); }
  oy() { return Math.round(this.y + this.sy); }

  apply(ctx) { ctx.save(); ctx.translate(-this.ox(), -this.oy()); }
  restore(ctx) { ctx.restore(); }

  sees(x, y, pad = 16) {
    return x > this.x - pad && x < this.x + View.w + pad &&
           y > this.y - pad && y < this.y + View.h + pad;
  }
}
