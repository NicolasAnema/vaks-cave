// ============================================================
// AudioManager (stub) + Bark system + manifest wiring registry.
//
// Every sound is a named event routed through AudioManager. In
// v1 nothing plays; events log in debug and drive barks. Voice
// rows come from the manifest; when real audio lands, the row's
// `file` plays and barks remain as subtitles — zero code changes.
//
// WIRING: call sites obtain their fire function from
// Barks.wire(rowId, where) at module init, so the registry is
// built from real, executed code. Rows referenced from pure data
// (cutscene scripts, level data) are registered by the data
// scanner in main.js. The boot coverage report lists any
// manifest row nobody wired.
// ============================================================

import { CONFIG } from '../config.js';
import { MANIFEST, EVENTS, MUSIC_SLOTS } from '../data/manifest.js';
import { drawText, wrapText, textWidth, LINE_H } from '../engine/font.js';
import { Save } from './save.js';
import { View, roundedRect } from '../engine/render.js';

const rowById = new Map(MANIFEST.map((r) => [r.id, r]));

export const AudioManager = {
  lastEvent: '-',
  music: null,
  knownEvents: new Set(EVENTS),

  // The stub: registers the moment, logs it, plays nothing.
  play(event, detail = '') {
    this.lastEvent = event + (detail ? ':' + detail : '');
    // future: new Audio(file) routed through Save.data.settings volumes
  },

  playMusic(slotId) {
    this.music = slotId;
    this.lastEvent = 'music:' + slotId;
    // future: loop MUSIC_SLOTS[slotId].file at music volume
  },

  musicName(slotId) {
    const s = MUSIC_SLOTS.find((m) => m.id === slotId);
    return s ? s.name : '';
  },
};

// ---------------- bark system ----------------

const wired = new Map();      // rowId -> where (call site description)
const firedRows = new Set();  // rowIds actually fired this session
const cooldowns = new Map();  // key -> time remaining
const lastLine = new Map();   // rowId -> last variant index

export const Barks = {
  bubbles: [],   // { text, shown, anchor, t, hold, done }
  subtitle: null, // { text, shown, t, hold, speaker }

  wire(rowId, where) {
    if (!rowById.has(rowId)) throw new Error('Unknown manifest row: ' + rowId);
    if (!wired.has(rowId)) wired.set(rowId, where);
    return (opts) => this.fire(rowId, opts);
  },

  wireData(rowId, where) {
    if (!rowById.has(rowId)) throw new Error('Unknown manifest row: ' + rowId);
    if (!wired.has(rowId)) wired.set(rowId, where);
  },

  pickLine(row, idx) {
    if (idx !== undefined) { lastLine.set(row.id, idx); return row.lines[idx]; }
    if (row.lines.length === 1) return row.lines[0];
    let i = Math.floor(Math.random() * row.lines.length);
    if (i === lastLine.get(row.id)) i = (i + 1) % row.lines.length;
    lastLine.set(row.id, i);
    return row.lines[i];
  },

  // opts: { anchor, line, event, force, subtitle, speaker }
  fire(rowId, opts = {}) {
    const row = rowById.get(rowId);
    const event = opts.event || row.event;
    if (!opts.force) {
      const cd = cooldowns.get(rowId) || 0;
      const ecd = cooldowns.get('ev:' + event) || 0;
      if (cd > 0 || ecd > 0) return false;
    }
    const rowCd = CONFIG.barks.cooldown[event] !== undefined
      ? CONFIG.barks.cooldown[event] : CONFIG.barks.defaultCooldown;
    cooldowns.set(rowId, rowCd);
    cooldowns.set('ev:' + event, Math.min(rowCd, 2.5));
    firedRows.add(rowId);
    AudioManager.play(event, rowId);
    const text = this.pickLine(row, opts.line);
    if (opts.anchor && !opts.subtitle) {
      // one bubble per anchor: replace
      this.bubbles = this.bubbles.filter((b) => b.anchor !== opts.anchor);
      this.bubbles.push({ text, anchor: opts.anchor, t: 0, shown: 0 });
    } else {
      this.subtitle = { text, t: 0, shown: 0, speaker: opts.speaker || '' };
    }
    return true;
  },

  // Instructional / narrator text (not a voice line): subtitle only.
  note(text, speaker = '') {
    this.subtitle = { text, t: 0, shown: 0, speaker };
  },

  // Cutscene dialogue: fires the row's event + returns the text,
  // rendering is the cutscene player's typewriter box.
  quote(rowId, idx) {
    const row = rowById.get(rowId);
    firedRows.add(rowId);
    AudioManager.play(row.event, rowId);
    return this.pickLine(row, idx);
  },

  cps() { return CONFIG.barks.charsPerSec[Save.data.settings.textSpeed] || 26; },

  holdFor(text) { return CONFIG.barks.holdBase + text.length * CONFIG.barks.holdPerChar; },

  update(dt) {
    for (const [k, v] of cooldowns) {
      if (v > 0) cooldowns.set(k, v - dt);
    }
    const cps = this.cps();
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.t += dt;
      b.shown = Math.min(b.text.length, b.shown + cps * dt);
      if (b.shown >= b.text.length && b.t > b.text.length / cps + this.holdFor(b.text)) {
        this.bubbles.splice(i, 1);
      }
    }
    if (this.subtitle) {
      const s = this.subtitle;
      s.t += dt;
      s.shown = Math.min(s.text.length, s.shown + cps * dt);
      if (s.shown >= s.text.length && s.t > s.text.length / cps + this.holdFor(s.text)) {
        this.subtitle = null;
      }
    }
  },

  clear() { this.bubbles = []; this.subtitle = null; },

  // Bubbles: screen space, anchored to world entities via camera.
  draw(ctx, cam) {
    for (const b of this.bubbles) {
      const a = b.anchor;
      const ax = cam ? a.x - cam.ox() : a.x;
      const ay = cam ? (a.y - (a.bubbleH || 26)) - cam.oy() : a.y - (a.bubbleH || 26);
      if (ax < -40 || ax > View.w + 40 || ay < -60 || ay > View.h + 40) continue;
      this.drawBubble(ctx, b, ax, ay);
    }
    if (this.subtitle) this.drawSubtitle(ctx, this.subtitle);
  },

  drawBubble(ctx, b, ax, ay) {
    const text = b.text.slice(0, Math.ceil(b.shown));
    const lines = wrapText(b.text, CONFIG.barks.bubbleMaxW);
    let w = 0;
    for (const l of lines) w = Math.max(w, textWidth(l));
    w += 8;
    const h = lines.length * LINE_H + 5;
    let x = Math.round(ax - w / 2);
    x = Math.max(2, Math.min(View.w - w - 2, x));
    let y = Math.round(ay - h - 6);
    y = Math.max(2, y);
    roundedRect(ctx, x - 1, y - 1, w + 2, h + 2, '#2a2438');
    roundedRect(ctx, x, y, w, h, '#fdf6e0');
    // tail
    const tx = Math.max(x + 3, Math.min(x + w - 6, Math.round(ax) - 2));
    ctx.fillStyle = '#fdf6e0';
    ctx.fillRect(tx, y + h, 4, 2);
    ctx.fillRect(tx + 1, y + h + 2, 2, 2);
    let used = 0;
    for (let i = 0; i < lines.length; i++) {
      const remain = text.length - used;
      if (remain <= 0) break;
      const part = lines[i].slice(0, remain);
      drawText(ctx, part, x + 4, y + 3 + i * LINE_H, { color: '#2a2438' });
      used += lines[i].length + 1;
    }
  },

  drawSubtitle(ctx, s) {
    const text = s.text.slice(0, Math.ceil(s.shown));
    const full = (s.speaker ? s.speaker + ': ' : '') + s.text;
    const lines = wrapText(full, View.w - 60);
    const h = lines.length * LINE_H + 8;
    const y = View.h - h - 8;
    ctx.fillStyle = 'rgba(8,8,16,0.82)';
    ctx.fillRect(0, y, View.w, h);
    ctx.fillStyle = '#8ae08a';
    ctx.fillRect(0, y, View.w, 1);
    const shownFull = (s.speaker ? s.speaker + ': ' : '') + text;
    let used = 0;
    for (let i = 0; i < lines.length; i++) {
      const remain = shownFull.length - used;
      if (remain <= 0) break;
      drawText(ctx, lines[i].slice(0, remain), View.w / 2, y + 5 + i * LINE_H,
        { color: '#f4f0e0', align: 'center' });
      used += lines[i].length + 1;
    }
  },
};

// ---------------- coverage report ----------------

export function coverageReport() {
  const unwired = [];
  for (const row of MANIFEST) {
    if (!wired.has(row.id)) unwired.push(row.id);
  }
  const lines = [];
  lines.push(`[VAK'S CAVE] MANIFEST COVERAGE: ${MANIFEST.length - unwired.length}/${MANIFEST.length} rows wired, ${unwired.length} unwired.`);
  if (unwired.length) {
    for (const id of unwired) lines.push(`  UNWIRED: ${id} ("${rowById.get(id).trigger}")`);
  }
  return { lines, unwired, wired };
}

export function wiringTable() {
  const out = [];
  for (const row of MANIFEST) {
    out.push(`  ${row.id.padEnd(18)} -> ${(wired.get(row.id) || 'UNWIRED').padEnd(34)} | ${row.trigger}`);
  }
  return out;
}

export function firedReport() { return firedRows; }
