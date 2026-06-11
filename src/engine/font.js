// ============================================================
// Bitmap pixel font (5x6 max, variable width). No font assets:
// every glyph is authored here as pixel strings. Uppercase only;
// drawText uppercases input. Atlases are cached per color.
// ============================================================

const G = {
  'A': ['.##.', '#..#', '#..#', '####', '#..#', '#..#'],
  'B': ['###.', '#..#', '###.', '#..#', '#..#', '###.'],
  'C': ['.###', '#...', '#...', '#...', '#...', '.###'],
  'D': ['###.', '#..#', '#..#', '#..#', '#..#', '###.'],
  'E': ['####', '#...', '###.', '#...', '#...', '####'],
  'F': ['####', '#...', '###.', '#...', '#...', '#...'],
  'G': ['.###', '#...', '#.##', '#..#', '#..#', '.##.'],
  'H': ['#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  'I': ['###', '.#.', '.#.', '.#.', '.#.', '###'],
  'J': ['..##', '...#', '...#', '...#', '#..#', '.##.'],
  'K': ['#..#', '#.#.', '##..', '##..', '#.#.', '#..#'],
  'L': ['#...', '#...', '#...', '#...', '#...', '####'],
  'M': ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#'],
  'N': ['#..#', '##.#', '##.#', '#.##', '#.##', '#..#'],
  'O': ['.##.', '#..#', '#..#', '#..#', '#..#', '.##.'],
  'P': ['###.', '#..#', '#..#', '###.', '#...', '#...'],
  'Q': ['.##.', '#..#', '#..#', '#..#', '#.#.', '.#.#'],
  'R': ['###.', '#..#', '#..#', '###.', '#.#.', '#..#'],
  'S': ['.###', '#...', '.##.', '...#', '...#', '###.'],
  'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..'],
  'U': ['#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  'V': ['#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  'W': ['#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  'X': ['#..#', '#..#', '.##.', '.##.', '#..#', '#..#'],
  'Y': ['#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  'Z': ['####', '...#', '..#.', '.#..', '#...', '####'],
  '0': ['.##.', '#..#', '#.##', '##.#', '#..#', '.##.'],
  '1': ['.#.', '##.', '.#.', '.#.', '.#.', '###'],
  '2': ['###.', '...#', '..#.', '.#..', '#...', '####'],
  '3': ['###.', '...#', '.##.', '...#', '...#', '###.'],
  '4': ['#..#', '#..#', '####', '...#', '...#', '...#'],
  '5': ['####', '#...', '###.', '...#', '...#', '###.'],
  '6': ['.###', '#...', '###.', '#..#', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '..#.', '.#..', '.#..'],
  '8': ['.##.', '#..#', '.##.', '#..#', '#..#', '.##.'],
  '9': ['.##.', '#..#', '#..#', '.###', '...#', '##..'],
  '.': ['.', '.', '.', '.', '.', '#'],
  ',': ['..', '..', '..', '..', '.#', '#.'],
  '!': ['#', '#', '#', '#', '.', '#'],
  '?': ['###.', '...#', '..#.', '.#..', '....', '.#..'],
  "'": ['#', '#', '.', '.', '.', '.'],
  '"': ['#.#', '#.#', '...', '...', '...', '...'],
  ':': ['.', '#', '.', '.', '#', '.'],
  ';': ['.#', '.#', '..', '.#', '.#', '#.'],
  '-': ['...', '...', '###', '...', '...', '...'],
  '_': ['...', '...', '...', '...', '...', '###'],
  '+': ['...', '.#.', '###', '.#.', '...', '...'],
  '(': ['.#', '#.', '#.', '#.', '#.', '.#'],
  ')': ['#.', '.#', '.#', '.#', '.#', '#.'],
  '/': ['...#', '..#.', '..#.', '.#..', '.#..', '#...'],
  '=': ['...', '###', '...', '###', '...', '...'],
  '<': ['..#', '.#.', '#..', '.#.', '..#', '...'],
  '>': ['#..', '.#.', '..#', '.#.', '#..', '...'],
  '*': ['..#..', '#.#.#', '.###.', '#.#.#', '..#..', '.....'],
  '^': ['.#.', '#.#', '...', '...', '...', '...'],
  '%': ['#..#', '...#', '..#.', '.#..', '#...', '#..#'],
  '&': ['.#..', '#.#.', '.#..', '#.#.', '#..#', '.##.'],
  ' ': ['..', '..', '..', '..', '..', '..'],
};

export const FONT_H = 6;
export const LINE_H = 8;

const atlases = new Map(); // color -> { canvas, pos: Map(char -> {x,w}) }
let order = null;

function buildAtlas(color) {
  if (!order) order = Object.keys(G);
  let w = 0;
  for (const ch of order) w += G[ch][0].length + 1;
  const c = document.createElement('canvas');
  c.width = w; c.height = FONT_H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  const pos = new Map();
  let x = 0;
  for (const ch of order) {
    const rows = G[ch], gw = rows[0].length;
    pos.set(ch, { x, w: gw });
    for (let r = 0; r < rows.length; r++)
      for (let i = 0; i < rows[r].length; i++)
        if (rows[r][i] === '#') ctx.fillRect(x + i, r, 1, 1);
    x += gw + 1;
  }
  const atlas = { canvas: c, pos };
  atlases.set(color, atlas);
  return atlas;
}

export function textWidth(str, scale = 1) {
  let w = 0;
  for (const ch of String(str).toUpperCase()) {
    const g = G[ch] || G['?'];
    w += (g[0].length + 1) * scale;
  }
  return Math.max(0, w - scale);
}

// opts: { color, scale, align: 'left'|'center'|'right', alpha }
export function drawText(ctx, str, x, y, opts = {}) {
  const color = opts.color || '#ffffff';
  const scale = opts.scale || 1;
  const s = String(str).toUpperCase();
  const atlas = atlases.get(color) || buildAtlas(color);
  let dx = Math.round(x);
  if (opts.align === 'center') dx -= Math.round(textWidth(s, scale) / 2);
  else if (opts.align === 'right') dx -= textWidth(s, scale);
  const dy = Math.round(y);
  const oldAlpha = ctx.globalAlpha;
  if (opts.alpha !== undefined) ctx.globalAlpha = oldAlpha * opts.alpha;
  for (const ch of s) {
    const p = atlas.pos.get(G[ch] ? ch : '?');
    ctx.drawImage(atlas.canvas, p.x, 0, p.w, FONT_H, dx, dy, p.w * scale, FONT_H * scale);
    dx += (p.w + 1) * scale;
  }
  ctx.globalAlpha = oldAlpha;
}

// Word-wraps to maxW pixels at the given scale; returns array of lines.
export function wrapText(str, maxW, scale = 1) {
  const words = String(str).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (textWidth(test, scale) <= maxW || !cur) cur = test;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
