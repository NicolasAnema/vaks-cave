// ============================================================
// Pooled particle system. All particles are world-space unless
// spawned with screen:true (drawn after the camera restores).
// ============================================================

import { drawText } from './font.js';

const MAX = 600;

export const Particles = {
  list: [],

  clear() { this.list.length = 0; },

  spawn(p) {
    if (this.list.length >= MAX) this.list.shift();
    this.list.push({
      x: 0, y: 0, vx: 0, vy: 0, grav: 0, drag: 0,
      life: 1, maxLife: 1, size: 2, color: '#fff',
      type: 'rect', wobble: 0, phase: Math.random() * 6.28,
      screen: false, text: '', alpha: 1,
      ...p, maxLife: p.life || 1,
    });
  },

  update(dt) {
    const l = this.list;
    for (let i = l.length - 1; i >= 0; i--) {
      const p = l[i];
      p.life -= dt;
      if (p.life <= 0) { l.splice(i, 1); continue; }
      p.vy += p.grav * dt;
      if (p.drag) { p.vx -= p.vx * p.drag * dt; p.vy -= p.vy * p.drag * dt; }
      p.x += p.vx * dt + (p.wobble ? Math.sin(p.phase + p.life * 5) * p.wobble * dt * 30 : 0);
      p.y += p.vy * dt;
    }
  },

  draw(ctx, screenSpace = false) {
    for (const p of this.list) {
      if (p.screen !== screenSpace) continue;
      const t = p.life / p.maxLife;
      const a = p.alpha * (t < 0.4 ? t / 0.4 : 1);
      ctx.globalAlpha = a;
      if (p.type === 'text') {
        drawText(ctx, p.text, p.x, p.y, { color: p.color });
      } else if (p.type === 'circle') {
        ctx.fillStyle = p.color;
        const r = Math.max(1, Math.round(p.size * (0.5 + t * 0.5)));
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        const s = Math.max(1, Math.round(p.size * t + 0.5));
        ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
      }
    }
    ctx.globalAlpha = 1;
  },

  // ---- recipes ----

  dust(x, y, n = 5) {
    for (let i = 0; i < n; i++) this.spawn({
      x: x + (Math.random() * 10 - 5), y: y - 1,
      vx: (Math.random() * 2 - 1) * 28, vy: -Math.random() * 22,
      grav: 30, life: 0.35 + Math.random() * 0.2, size: 2, color: '#b9a584',
    });
  },

  shards(x, y, colors, n = 9) {
    for (let i = 0; i < n; i++) this.spawn({
      x, y, vx: (Math.random() * 2 - 1) * 90, vy: -40 - Math.random() * 80,
      grav: 380, life: 0.5 + Math.random() * 0.3, size: 2,
      color: colors[i % colors.length],
    });
  },

  wisp(x, y, color = 'rgba(140,210,140,0.5)') {
    this.spawn({
      x, y, vx: (Math.random() * 2 - 1) * 6, vy: -8 - Math.random() * 10,
      life: 1.6 + Math.random() * 1.4, size: 3 + Math.random() * 3,
      color, type: 'circle', wobble: 1.4,
    });
  },

  leaf(x, y) {
    this.spawn({
      x, y, vx: -14 - Math.random() * 12, vy: 9 + Math.random() * 8,
      life: 2.4 + Math.random() * 1.6, size: 2,
      color: Math.random() < 0.5 ? '#9ab35a' : '#c9a23a', wobble: 2.2,
    });
  },

  smoke(x, y) {
    this.spawn({
      x, y, vx: (Math.random() - 0.3) * 8, vy: -12 - Math.random() * 8,
      life: 1.8 + Math.random(), size: 3, color: 'rgba(180,180,190,0.45)',
      type: 'circle', wobble: 1,
    });
  },

  sparkle(x, y, color = '#ffe98a', n = 6) {
    for (let i = 0; i < n; i++) this.spawn({
      x: x + (Math.random() * 12 - 6), y: y + (Math.random() * 12 - 6),
      vx: (Math.random() * 2 - 1) * 16, vy: -10 - Math.random() * 24,
      life: 0.5 + Math.random() * 0.4, size: 2, color,
    });
  },

  zzz(x, y) {
    this.spawn({
      x, y, vx: 6, vy: -14, life: 1.4, type: 'text', text: 'Z',
      color: '#cfd6ff', wobble: 1.2,
    });
  },

  confetti(x, y, n = 14) {
    const cols = ['#ff6b6b', '#ffd84d', '#7ec8ff', '#8ae08a', '#e08aff'];
    for (let i = 0; i < n; i++) this.spawn({
      x, y, vx: (Math.random() * 2 - 1) * 100, vy: -60 - Math.random() * 100,
      grav: 240, drag: 1.2, life: 1 + Math.random() * 0.8, size: 2,
      color: cols[i % cols.length], wobble: 1.5,
    });
  },
};
