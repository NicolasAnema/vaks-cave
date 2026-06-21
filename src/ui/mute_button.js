// ============================================================
// Persistent mute button — a cartoon speaker pinned to the top
// right of the 480x270 buffer. main.js updates + draws it AFTER
// the active screen every frame, so it stays constant across the
// whole game (title, menus, levels, cutscenes, shop, pause...).
// Click toggles Save.data.settings.muted, which AudioManager.vol()
// honors live for music, voice and SFX.
// ============================================================

import { View } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { Save } from '../systems/save.js';
import { AudioManager } from '../systems/audio.js';

const BOX = { w: 26, h: 22, pad: 6 };

export const MuteButton = {
  hover: 0,   // 0..1 eased hover amount (cartoon pop)
  pop: 0,     // click squash impulse, decays
  wave: 0,    // sound-wave pulse phase (unmuted only)

  rect() {
    return { x: View.w - BOX.w - BOX.pad, y: BOX.pad, w: BOX.w, h: BOX.h };
  },

  hit(px, py) {
    const r = this.rect();
    return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
  },

  toggle() {
    const s = Save.data.settings;
    s.muted = !s.muted;
    AudioManager.applyVolumes(); // re-apply music + voice gains live
    Save.save();
    this.pop = 1;
  },

  update(dt) {
    const over = Input.mouse.inside && this.hit(Input.mouse.x, Input.mouse.y);
    this.hover += ((over ? 1 : 0) - this.hover) * Math.min(1, dt * 14);
    this.pop = Math.max(0, this.pop - dt * 4);
    if (!Save.data.settings.muted) this.wave += dt * 4;

    const el = Input._el;
    if (over) {
      if (el) el.style.cursor = 'pointer';
      if (Input.clicked) { this.toggle(); Input.clicked = false; }
    } else if (el && el.style.cursor === 'pointer') {
      el.style.cursor = ''; // only clear the cursor we set
    }
  },

  draw(ctx) {
    const r = this.rect();
    const muted = Save.data.settings.muted;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;

    // no background chip — just the speaker. The dark outline + cream fill
    // keeps it readable on both light and dark screens.

    // hover pop + click squash
    const sc = 1 + this.hover * 0.12 - this.pop * 0.18;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sc, sc);

    // speaker silhouette (faces right) with a chunky dark outline
    const body = new Path2D();
    body.moveTo(-7, -2);
    body.lineTo(-3, -2);
    body.lineTo(1, -6);
    body.lineTo(1, 6);
    body.lineTo(-3, 2);
    body.lineTo(-7, 2);
    body.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2a2438';
    ctx.stroke(body);
    ctx.fillStyle = muted ? '#caa2a2' : '#fdf6e0';
    ctx.fill(body);

    if (muted) {
      // bold red slash = off
      ctx.strokeStyle = '#e0463c';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(3, -6);
      ctx.lineTo(9, 6);
      ctx.stroke();
    } else {
      // two pulsing sound-wave arcs
      const p = (Math.sin(this.wave) + 1) * 0.5;
      ctx.strokeStyle = '#ffe49a';
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(2, 0, 4, -0.7, 0.7); ctx.stroke();
      ctx.globalAlpha = 0.5 + p * 0.5;
      ctx.beginPath(); ctx.arc(2, 0, 7, -0.8, 0.8); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
};
