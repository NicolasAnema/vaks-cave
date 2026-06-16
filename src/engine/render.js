// ============================================================
// Renderer: fixed 480x270 internal buffer scaled to fill the
// window (F toggles browser fullscreen). At integer scales the
// blit is pure nearest-neighbor; at fractional scales it goes
// through a nearest-neighbor integer upscale first, then one
// smooth downscale, so pixels stay even instead of shimmering.
// Plus small shared draw helpers.
// ============================================================

import { CONFIG } from '../config.js';

export const View = { w: CONFIG.view.w, h: CONFIG.view.h };

let buffer = null, bctx = null, display = null, dctx = null;
let mid = null, mctx = null;

export function initRender() {
  display = document.getElementById('game');
  dctx = display.getContext('2d');
  buffer = document.createElement('canvas');
  buffer.width = View.w; buffer.height = View.h;
  bctx = buffer.getContext('2d');
  bctx.imageSmoothingEnabled = false;
  mid = document.createElement('canvas');
  mctx = mid.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', resize);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyF' && !e.repeat) toggleFullscreen();
  });
  return bctx;
}

export function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const fit = Math.max(1, Math.min(window.innerWidth / View.w, window.innerHeight / View.h));
  display.style.width = Math.round(View.w * fit) + 'px';
  display.style.height = Math.round(View.h * fit) + 'px';
  display.width = Math.round(View.w * fit * dpr);
  display.height = Math.round(View.h * fit * dpr);
  const int = Math.max(1, Math.ceil(fit * dpr));
  mid.width = View.w * int;
  mid.height = View.h * int;
  mctx.imageSmoothingEnabled = false;
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
  // main buffer blit: crisp single blit at exact integer scale, otherwise a
  // nearest-neighbor integer upscale followed by one smooth downscale so the
  // pixels stay even at fractional (fullscreen) sizes instead of shimmering.
  if (display.width === mid.width && display.height === mid.height) {
    dctx.imageSmoothingEnabled = false;
    dctx.drawImage(buffer, 0, 0, View.w, View.h, 0, 0, display.width, display.height);
  } else {
    mctx.imageSmoothingEnabled = false;
    mctx.drawImage(buffer, 0, 0, View.w, View.h, 0, 0, mid.width, mid.height);
    dctx.imageSmoothingEnabled = true;
    dctx.drawImage(mid, 0, 0, mid.width, mid.height, 0, 0, display.width, display.height);
  }
  // HD photo heads: rendered AFTER the upscale, straight onto the display with
  // smoothing, so they stay photographic instead of inheriting the pixel scale.
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
