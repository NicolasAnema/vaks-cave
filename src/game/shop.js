// ============================================================
// THE TIKOLOSH SHOP — a calm shopkeeper in a lantern-lit nook
// after every level clear. Wares sit on two wooden shelves; spend
// mano on lives, an irie stash, rat poison, ability caps, or a
// faint charm. Leave with the LEAVE SHOP button or the Esc key.
// ============================================================

import { CONFIG } from '../config.js';
import { View, panel } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText, wrapText } from '../engine/font.js';
import { draw, drawImoHead, TIKO_HEAD_RECT } from '../engine/sprites.js';
import { drawScene } from '../engine/bg.js';
import { Particles } from '../engine/particles.js';
import { AudioManager, Barks } from '../systems/audio.js';
import { Save } from '../systems/save.js';

const barkShopFirst = Barks.wire('m_shop_first', 'shop.js: first shop visit');

const FORESHADOW = [
  'THE BIG ONE UPSTAIRS? HE JUST WANTS TO VIBE.',
  'THE MIST IS JUST WEATHER, LITTLE GARDENER.',
  'WE NEVER HUNT. WE BLOW THROUGH. LIKE WIND.',
  'BUY SOMETHING OR THE WIND BUYS IT FIRST.',
];

// shelf grid layout (item icons rest ON the planks)
const COLS = 4;
const COL_X = [70, 142, 214, 286];        // column centres
const SHELF_Y = [104, 158];               // plank tops (items sit here)

export class ShopScreen {
  constructor(run, afterLevel, cb) {
    this.run = run;
    this.cb = cb; // { onDone() }
    this.t = 0;
    this.items = [
      { id: 'life', name: 'EXTRA LIFE', desc: 'ONE MORE CHANCE, BOSS', price: CONFIG.shop.prices.life, sprite: 'note_r100' },
      { id: 'irie', name: 'IRIE STASH', desc: 'START NEXT LEVEL HOLDING ONE', price: CONFIG.shop.prices.irie, sprite: 'weed' },
      { id: 'rattex', name: 'RATTEX', desc: 'RATS DIE IF THEY TOUCH VAKS', price: CONFIG.shop.prices.rattex, sprite: 'rattex' },
      { id: 'propeller', name: 'PROPELLER HAT', desc: 'MAKES HIM JUMP HIGHER', price: CONFIG.hats.propeller.price, sprite: 'hat_propeller', hat: true },
      { id: 'beanie', name: 'BEANIE', desc: 'STRONGER: RUN THROUGH SMALL RATS', price: CONFIG.hats.beanie.price, sprite: 'hat_beanie', hat: true },
      { id: 'chiefs', name: 'KAIZER CHIEFS HAT', desc: 'FASTER, LIKE A TIKOLOSH', price: CONFIG.hats.chiefs.price, sprite: 'hat_chiefs', hat: true },
    ];
    if (afterLevel >= 4) {
      this.items.push({ id: 'charm', name: 'FAINT CHARM', desc: 'GRANNY RESTS LONGER NEXT TIME', price: CONFIG.shop.prices.charm, sprite: 'lantern' });
    }

    // selectable slots: every item on the shelf grid, then LEAVE SHOP
    this.slots = this.items.map((item, i) => ({
      item, cx: COL_X[i % COLS], cy: SHELF_Y[Math.floor(i / COLS)],
    }));
    this.leaveIndex = this.items.length;
    this.slots.push({ leave: true, cx: 396, cy: 232 });

    this.sel = 0;
    this.boughtFlash = 0;
    this.denyFlash = 0;
    this.afterLevel = afterLevel;
    this.started = false;
  }

  // fires on first update so screen transitions can't clear the barks
  start() {
    AudioManager.play('shop_enter', 'after L' + this.afterLevel);
    if (!Save.data.shopVisited) {
      Save.data.shopVisited = true;
      Save.save();
      barkShopFirst({ subtitle: true, speaker: 'VAKS', force: true });
      this.keeperLine = 'A CUSTOMER! TAKE YOUR TIME. THE MIST WAITS FOR NO ONE. BUT I DO.';
      this.keeperDelay = 3.4;
    } else {
      this.keeperLine = FORESHADOW[Math.floor(Math.random() * FORESHADOW.length)];
      this.keeperDelay = 0.7;
    }
  }

  balance() { return this.run.mano; }

  owned(item) {
    if (item.hat) return !!this.run.hats[item.id];
    if (item.id === 'irie') return this.run.irieStash;
    if (item.id === 'rattex') return this.run.rattex;
    if (item.id === 'charm') return this.run.faintCharm;
    if (item.id === 'life') return this.run.lives >= CONFIG.lives.max;
    return false;
  }

  buy(item) {
    if (item.id === 'life' && this.run.lives >= CONFIG.lives.max) { this.deny('LIVES ARE FULL, BOSS'); return; }
    if (item.id === 'irie' && this.run.irieStash) { this.deny('ALREADY HOLDING, BOSS'); return; }
    if (item.id === 'rattex' && this.run.rattex) { this.deny('POISON ALREADY IN POCKET'); return; }
    if (item.id === 'charm' && this.run.faintCharm) { this.deny('CHARM ALREADY GLOWING'); return; }
    if (item.hat && this.run.hats[item.id]) { this.deny('ALREADY WEARING IT, BOSS'); return; }
    if (this.balance() < item.price) { this.deny('NOT ENOUGH MANO'); return; }
    this.run.mano -= item.price;
    if (item.id === 'life') this.run.lives++;
    if (item.id === 'irie') this.run.irieStash = true;
    if (item.id === 'rattex') this.run.rattex = true;
    if (item.id === 'charm') this.run.faintCharm = true;
    if (item.hat) this.run.hats[item.id] = true;
    AudioManager.play('shop_buy', item.id);
    this.boughtFlash = 0.6;
    this.keeperLine = item.id === 'chiefs' ? 'AMAKHOSI FOR LIFE, BOSS.' : 'GOOD CHOICE. THE WIND APPROVES.';
    this.keeperDelay = 0;
    const s = this.slots[this.sel];
    Particles.sparkle(s.cx, s.cy - 6, '#ffe49a', 8);
  }

  deny(msg) {
    this.denyFlash = 0.5;
    this.keeperLine = msg;
    this.keeperDelay = 0;
  }

  // spatial navigation: move to the nearest slot in the pressed direction
  nav(dx, dy) {
    const cur = this.slots[this.sel];
    let best = -1, bestScore = Infinity;
    for (let i = 0; i < this.slots.length; i++) {
      if (i === this.sel) continue;
      const s = this.slots[i];
      const ddx = s.cx - cur.cx, ddy = s.cy - cur.cy;
      if (dx > 0 && ddx <= 3) continue;
      if (dx < 0 && ddx >= -3) continue;
      if (dy > 0 && ddy <= 3) continue;
      if (dy < 0 && ddy >= -3) continue;
      const along = dx ? Math.abs(ddx) : Math.abs(ddy);
      const perp = dx ? Math.abs(ddy) : Math.abs(ddx);
      const score = along + perp * 4;
      if (score < bestScore) { bestScore = score; best = i; }
    }
    if (best >= 0) this.sel = best;
  }

  update(dt) {
    if (!this.started) { this.started = true; this.start(); }
    this.t += dt;
    this.boughtFlash = Math.max(0, this.boughtFlash - dt);
    this.denyFlash = Math.max(0, this.denyFlash - dt);
    if (this.keeperDelay !== undefined && this.keeperDelay > 0) this.keeperDelay -= dt;

    if (Input.wasPressed('ArrowLeft')) this.nav(-1, 0);
    if (Input.wasPressed('ArrowRight')) this.nav(1, 0);
    if (Input.wasPressed('ArrowUp')) this.nav(0, -1);
    if (Input.wasPressed('ArrowDown')) this.nav(0, 1);
    if (Input.wasPressed('Enter')) {
      if (this.sel === this.leaveIndex) { this.cb.onDone(); return; }
      this.buy(this.items[this.sel]);
    }
    if (Input.wasPressed('Escape')) { this.cb.onDone(); return; }

    if (Math.random() < 0.04) Particles.wisp(360 + Math.random() * 40, 200, 'rgba(224,168,90,0.35)');
    Particles.update(dt);
    Barks.update(dt);
  }

  // a wooden shelf plank with end brackets
  shelf(ctx, x, y, w) {
    ctx.fillStyle = '#6e5a3a'; ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = '#5a4a30'; ctx.fillRect(x, y + 1, w, 3);
    ctx.fillStyle = '#36281a'; ctx.fillRect(x, y + 4, w, 2);
    ctx.fillStyle = '#2a2114';
    ctx.fillRect(x + 6, y + 6, 3, 7); ctx.fillRect(x + w - 9, y + 6, 3, 7);
  }

  draw(ctx) {
    drawScene(ctx, 'shop_nook', this.t);

    // shopkeeper tikolosh (Vaki, as himself) + lantern, right side
    draw(ctx, 'tiko_shop', Math.floor(this.t * 2) % 2, 380, 150, { scale: 2 });
    drawImoHead(ctx, 'tiko_shop', 380 + TIKO_HEAD_RECT.x * 2, 150 + TIKO_HEAD_RECT.y * 2,
      TIKO_HEAD_RECT.w * 2, TIKO_HEAD_RECT.h * 2, false);
    draw(ctx, 'lantern', Math.floor(this.t * 4) % 2, 426, 170);

    drawText(ctx, 'THE TIKOLOSH SHOP', View.w / 2, 12, { color: '#e0a85a', scale: 2, align: 'center' });

    // keeper speech bubble, above the shopkeeper
    if (this.keeperLine && (this.keeperDelay === undefined || this.keeperDelay <= 0)) {
      const lines = wrapText(this.keeperLine, 150);
      const bh = 12 + lines.length * 9;
      panel(ctx, 300, 96 - bh, 168, bh, { bg: 'rgba(20,16,8,0.92)', border: '#6e5638' });
      drawText(ctx, 'SHOPKEEPER:', 306, 100 - bh, { color: '#e0a85a' });
      lines.forEach((ln, i) => drawText(ctx, ln, 306, 100 - bh + 9 + i * 9, { color: '#f4f0e0' }));
    }

    // ---- wares on two shelves ----
    this.shelf(ctx, 40, SHELF_Y[0] + 1, 268);
    this.shelf(ctx, 40, SHELF_Y[1] + 1, 268);

    this.slots.forEach((slot, i) => {
      if (slot.leave) return;
      const it = slot.item;
      const sel = this.sel === i;
      const owned = this.owned(it);
      const bob = sel ? Math.sin(this.t * 4) * 2 : 0;
      if (sel) panel(ctx, slot.cx - 13, slot.cy - 22, 26, 22, { bg: 'rgba(255,228,154,0.10)', border: '#ffe49a' });
      draw(ctx, it.sprite, 0, slot.cx - (it.sprite === 'mano' ? 12 : 6), slot.cy - 14 + bob, { alpha: owned ? 0.45 : 1 });
      const afford = owned || this.balance() >= it.price;
      drawText(ctx, owned ? 'OWNED' : 'R' + it.price, slot.cx, slot.cy + 8,
        { color: owned ? '#8a93b8' : (afford ? '#8ae08a' : '#ff8a8a'), align: 'center' });
    });

    // ---- LEAVE SHOP button ----
    const ls = this.slots[this.leaveIndex];
    const lsel = this.sel === this.leaveIndex;
    const bx = ls.cx - 52, by = ls.cy - 12;
    panel(ctx, bx, by, 104, 24, { bg: lsel ? 'rgba(58,42,20,0.95)' : 'rgba(20,16,8,0.85)', border: lsel ? '#ffe49a' : '#6e5638' });
    // door icon
    ctx.fillStyle = lsel ? '#8a6a3a' : '#5a4630'; ctx.fillRect(bx + 9, by + 4, 11, 16);
    ctx.fillStyle = '#1f1810'; ctx.fillRect(bx + 11, by + 6, 7, 14);
    ctx.fillStyle = lsel ? '#ffe49a' : '#8a7a5a'; ctx.fillRect(bx + 16, by + 12, 1, 2);
    drawText(ctx, 'LEAVE SHOP', bx + 62, by + 8, { color: lsel ? '#ffe49a' : '#cbb892', align: 'center' });
    if (lsel) drawText(ctx, '>', bx - 8, by + 8, { color: '#ffe49a' });

    // ---- info panel for the current selection (bottom-left) ----
    panel(ctx, 12, 210, 300, 44);
    const cur = this.slots[this.sel];
    if (cur.leave) {
      drawText(ctx, 'LEAVE SHOP', 20, 216, { color: '#ffe49a' });
      drawText(ctx, 'BACK TO THE ADVENTURE.', 20, 228, { color: '#cfd6ff' });
      drawText(ctx, 'PRESS ENTER OR ESC.', 20, 242, { color: '#8ae08a' });
    } else {
      const it = cur.item, owned = this.owned(it);
      drawText(ctx, it.name, 20, 216, { color: '#ffe49a' });
      drawText(ctx, it.desc, 20, 228, { color: '#cfd6ff' });
      drawText(ctx, owned ? 'ALREADY OWNED' : ('PRICE: R' + it.price), 20, 242,
        { color: owned ? '#8a93b8' : (this.balance() >= it.price ? '#8ae08a' : '#ff8a8a') });
    }

    // ---- balances (top-left) ----
    draw(ctx, 'r2', 0, 7, 25);
    drawText(ctx, 'R' + this.run.mano, 22, 27, { color: '#ffe49a' });
    drawText(ctx, 'LIVES: ' + this.run.lives, 8, 40, { color: '#f4f0e0' });
    let hy = 50;
    if (this.run.irieStash) { drawText(ctx, 'HOLDING: 1 GANJA', 8, hy, { color: '#6ac24a' }); hy += 10; }
    if (this.run.rattex) { drawText(ctx, 'RATTEX: IN POCKET', 8, hy, { color: '#f2c91e' }); hy += 10; }
    if (this.run.faintCharm) { drawText(ctx, 'CHARM: READY', 8, hy, { color: '#e08aff' }); hy += 10; }

    if (this.boughtFlash > 0) drawText(ctx, 'BOUGHT!', View.w / 2, 62, { color: '#8ae08a', scale: 2, align: 'center' });
    if (this.denyFlash > 0 && Math.floor(this.t * 10) % 2 === 0) drawText(ctx, 'EISH...', View.w / 2, 62, { color: '#ff8a8a', scale: 2, align: 'center' });

    Particles.draw(ctx, false);
    drawText(ctx, 'ARROWS: BROWSE   ENTER: BUY   ESC OR LEAVE SHOP: EXIT', View.w / 2, View.h - 9, { color: '#5a6280', align: 'center' });

    Barks.draw(ctx, null);
  }
}
