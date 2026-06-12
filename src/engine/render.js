// ============================================================
// Renderer: fixed 480x270 internal buffer, integer-scaled to the
// window, crisp pixels. Plus small shared draw helpers.
// ============================================================

import { CONFIG } from '../config.js';

export const View = { w: CONFIG.view.w, h: CONFIG.view.h };

let buffer = null, bctx = null, display = null, dctx = null;

export function initRender() {
  display = document.getElementById('game');
  dctx = display.getContext('2d');
  buffer = document.createElement('canvas');
  buffer.width = View.w; buffer.height = View.h;
  bctx = buffer.getContext('2d');
  bctx.imageSmoothingEnabled = false;
  resize();
  window.addEventListener('resize', resize);
  return bctx;
}

function resize() {
  const scale = Math.max(1, Math.floor(Math.min(
    window.innerWidth / View.w, window.innerHeight / View.h)));
  display.width = View.w * scale;
  display.height = View.h * scale;
  dctx.imageSmoothingEnabled = false;
}

export function getCtx() { return bctx; }

// ---- HD overlay layer ----
// Photo heads are queued in buffer coordinates during scene draws and
// rendered AFTER the integer upscale, straight onto the display canvas
// with smoothing — so they stay photographic instead of inheriting the
// chunky pixel scale of the 480x270 buffer.
const hdQueue = [];

export function queueHD(img, x, y, w, h, opts = {}) {
  hdQueue.push({ img, x, y, w, h, flip: !!opts.flip, alpha: opts.alpha === undefined ? 1 : opts.alpha });
}

export function present() {
  dctx.imageSmoothingEnabled = false;
  dctx.drawImage(buffer, 0, 0, View.w, View.h, 0, 0, display.width, display.height);
  if (hdQueue.length) {
    const s = display.width / View.w;
    dctx.imageSmoothingEnabled = true;
    dctx.imageSmoothingQuality = 'high';
    for (const q of hdQueue) {
      dctx.globalAlpha = q.alpha;
      if (q.flip) {
        dctx.save();
        dctx.translate((q.x + q.w) * s, q.y * s);
        dctx.scale(-1, 1);
        dctx.drawImage(q.img, 0, 0, q.w * s, q.h * s);
        dctx.restore();
      } else {
        dctx.drawImage(q.img, q.x * s, q.y * s, q.w * s, q.h * s);
      }
    }
    dctx.globalAlpha = 1;
    dctx.imageSmoothingEnabled = false;
    hdQueue.length = 0;
  }
}

// ---- shared draw helpers ----

export function vGradient(ctx, x, y, w, h, stops) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  for (const [p, c] of stops) g.addColorStop(p, c);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

export function roundedRect(ctx, x, y, w, h, color) {
  // pixel-art rounded rect: corners notched by 1px
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y, w - 2, h);
  ctx.fillRect(x, y + 1, w, h - 2);
}

export function panel(ctx, x, y, w, h, opts = {}) {
  const bg = opts.bg || 'rgba(10,12,24,0.92)';
  const border = opts.border || '#4a5a8a';
  roundedRect(ctx, x - 1, y - 1, w + 2, h + 2, border);
  roundedRect(ctx, x, y, w, h, bg);
}

// Pixel-block wipe used for scene transitions. t in [0,1]:
// 0 = clear, 1 = fully covered.
export function drawWipe(ctx, t, color = '#07070d') {
  const s = 12;
  const cols = Math.ceil(View.w / s), rows = Math.ceil(View.h / s);
  ctx.fillStyle = color;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      // diagonal stagger so the wipe sweeps from top-left
      const delay = (cx + cy) / (cols + rows) * 0.5;
      const local = Math.max(0, Math.min(1, (t - delay) / 0.5));
      if (local <= 0) continue;
      const sz = Math.ceil(s * local);
      ctx.fillRect(cx * s + ((s - sz) >> 1), cy * s + ((s - sz) >> 1), sz, sz);
    }
  }
}

export function dimScreen(ctx, alpha) {
  ctx.fillStyle = `rgba(4,5,10,${alpha})`;
  ctx.fillRect(0, 0, View.w, View.h);
}
