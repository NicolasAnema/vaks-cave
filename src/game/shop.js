// ============================================================
// THE TIKOLOSH SHOP — a calm shopkeeper in a lantern-lit nook
// after every level clear. Wares sit on two wooden shelves; spend
// mano on lives, rat poison, ability caps, or a faint charm.
// Leave with the LEAVE SHOP button or the Esc key.
// ============================================================

import { CONFIG } from '../config.js';
import { View, panel } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText, wrapText } from '../engine/font.js';
import { draw, drawImoHead } from '../engine/sprites.js';
import { drawScene } from '../engine/bg.js';
import { Particles } from '../engine/particles.js';
import { AudioManager, Barks } from '../systems/audio.js';
import { Save } from '../systems/save.js';

const barkShopFirst = Barks.wire('m_shop_first', 'shop.js: first shop visit');
const barkShopBrowse = Barks.wire('m_shop_browse', 'shop.js: browsing the wares');
const barkShopBroke = Barks.wire('m_shop_broke', 'shop.js: cannot afford an item');

// Vaks mutters a quip as you browse. Maps item id -> its line in the
// m_shop_browse pool; keep in sync with the manifest line order. Lines
// from SHOP_GENERAL_FIRST on are item-agnostic (fired on the LEAVE slot).
const SHOP_QUIP_LINE = { life: 0, rattex: 1, propeller: 2, beanie: 3, chiefs: 4, charm: 5 };
const SHOP_GENERAL_FIRST = 6, SHOP_GENERAL_COUNT = 3;

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
    // older run snapshots predate the owned/equipped split
    if (!this.run.hatsOwned) this.run.hatsOwned = { ...this.run.hats };
    this.cb = cb; // { onDone() }
    this.t = 0;
    this.items = [
      { id: 'life', name: 'EXTRA LIFE', desc: 'ONE MORE CHANCE, BOSS', price: CONFIG.shop.prices.life, sprite: 'weed' },
      { id: 'rattex', name: 'RATTEX', desc: 'RATS DIE IF THEY TOUCH VAKS', price: CONFIG.shop.prices.rattex, sprite: 'rattex' },
      { id: 'propeller', name: 'PROPELLER HAT', desc: 'MAKES HIM JUMP HIGHER', price: CONFIG.hats.propeller.price, sprite: 'hat_propeller', hat: true },
      { id: 'beanie', name: 'BEANIE', desc: 'STRONGER: RUN THROUGH SMALL RATS', price: CONFIG.hats.beanie.price, sprite: 'hat_beanie', hat: true },
      { id: 'chiefs', name: 'KAIZER CHIEFS HAT', desc: 'FASTER, LIKE A TIKOLOSH', price: CONFIG.hats.chiefs.price, sprite: 'hat_chiefs', hat: true },
    ];
    if (afterLevel >= 4) {
      this.items.push({ id: 'charm', name: 'TIRED CHARM', desc: 'GRANNY RUNS SLOWER ALL NEXT LEVEL', price: CONFIG.shop.prices.charm, sprite: 'lantern' });
    }

    // selectable slots: every item on the shelf grid, then LEAVE SHOP
    this.slots = this.items.map((item, i) => ({
      item, cx: COL_X[i % COLS], cy: SHELF_Y[Math.floor(i / COLS)],
    }));
    this.leaveIndex = this.items.length;
    this.slots.push({ leave: true, cx: 396, cy: 216 });

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
    if (item.hat) return !!this.run.hatsOwned[item.id];
    if (item.id === 'rattex') return this.run.rattex;
    if (item.id === 'charm') return this.run.faintCharm;
    if (item.id === 'life') return this.run.lives >= CONFIG.lives.max;
    return false;
  }

  buy(item) {
    // owned caps toggle on/off for free instead of re-buying
    if (item.hat && this.run.hatsOwned[item.id]) {
      const on = !this.run.hats[item.id];
      this.run.hats[item.id] = on;
      AudioManager.play('shop_buy', (on ? 'equip:' : 'unequip:') + item.id);
      this.flashText = on ? 'EQUIPPED!' : 'TAKEN OFF';
      this.boughtFlash = 0.6;
      this.keeperLine = on
        ? (item.id === 'chiefs' ? 'AMAKHOSI FOR LIFE, BOSS.' : 'LOOKING SHARP, BOSS.')
        : 'OFF IT GOES. SAFE ON THE SHELF.';
      this.keeperDelay = 0;
      const s = this.slots[this.sel];
      if (on) Particles.sparkle(s.cx, s.cy - 6, '#ffe49a', 8);
      return;
    }
    if (item.id === 'life' && this.run.lives >= CONFIG.lives.max) { this.deny('LIVES ARE FULL, BOSS'); return; }
    if (item.id === 'rattex' && this.run.rattex) { this.deny('POISON ALREADY IN POCKET'); return; }
    if (item.id === 'charm' && this.run.faintCharm) { this.deny('CHARM ALREADY GLOWING'); return; }
    if (this.balance() < item.price) { this.deny('NOT ENOUGH MANO'); barkShopBroke({ subtitle: true, speaker: 'VAKS' }); return; }
    this.run.mano -= item.price;
    if (item.id === 'life') this.run.lives++;
    if (item.id === 'rattex') this.run.rattex = true;
    if (item.id === 'charm') this.run.faintCharm = true;
    if (item.hat) { this.run.hatsOwned[item.id] = true; this.run.hats[item.id] = true; }
    AudioManager.play('shop_buy', item.id);
    this.flashText = 'BOUGHT!';
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

  // Vaks mutters about whatever he's looking at (bark cooldown keeps it
  // from spamming as you scroll). LEAVE gets a general line.
  quip() {
    const slot = this.slots[this.sel];
    const line = slot.leave
      ? SHOP_GENERAL_FIRST + Math.floor(Math.random() * SHOP_GENERAL_COUNT)
      : SHOP_QUIP_LINE[slot.item.id];
    if (line !== undefined) barkShopBrowse({ subtitle: true, speaker: 'VAKS', line });
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

    const prevSel = this.sel;
    if (Input.wasPressed('ArrowLeft')) this.nav(-1, 0);
    if (Input.wasPressed('ArrowRight')) this.nav(1, 0);
    if (Input.wasPressed('ArrowUp')) this.nav(0, -1);
    if (Input.wasPressed('ArrowDown')) this.nav(0, 1);
    if (this.sel !== prevSel) this.quip();
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

    // shopkeeper — Vaki's face, portrait-sized on the right
    drawImoHead(ctx, 'tiko_shop', 335, 98, 104, 104, false);
    draw(ctx, 'lantern', Math.floor(this.t * 4) % 2, 441, 165);

    drawText(ctx, 'THE TIKOLOSH SHOP', View.w / 2, 10, { color: '#e0a85a', scale: 2, align: 'center' });
    drawText(ctx, 'ARROWS: BROWSE   ENTER: BUY / EQUIP   ESC: EXIT', View.w / 2, 28, { color: '#7480a0', align: 'center' });

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
      const worn = it.hat && this.run.hats[it.id];
      if (sel) panel(ctx, slot.cx - 13, slot.cy - 22, 26, 22, { bg: 'rgba(255,228,154,0.10)', border: '#ffe49a' });
      draw(ctx, it.sprite, 0, slot.cx - (it.sprite === 'mano' ? 12 : 6), slot.cy - 14 + bob, { alpha: owned && !worn ? 0.45 : 1 });
      const afford = owned || this.balance() >= it.price;
      const label = worn ? 'WEARING' : owned ? 'OWNED' : 'R' + it.price;
      drawText(ctx, label, slot.cx, slot.cy + 8,
        { color: worn ? '#ffe49a' : owned ? '#8a93b8' : (afford ? '#8ae08a' : '#ff8a8a'), align: 'center' });
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

    // ---- info panel for the current selection (lifted clear of the
    // bottom bark subtitle bar) ----
    panel(ctx, 12, 192, 300, 44);
    const cur = this.slots[this.sel];
    if (cur.leave) {
      drawText(ctx, 'LEAVE SHOP', 20, 198, { color: '#ffe49a' });
      drawText(ctx, 'BACK TO THE ADVENTURE.', 20, 210, { color: '#cfd6ff' });
      drawText(ctx, 'PRESS ENTER OR ESC.', 20, 224, { color: '#8ae08a' });
    } else {
      const it = cur.item, owned = this.owned(it);
      drawText(ctx, it.name, 20, 198, { color: '#ffe49a' });
      drawText(ctx, it.desc, 20, 210, { color: '#cfd6ff' });
      const line = it.hat && owned
        ? (this.run.hats[it.id] ? 'WEARING IT. ENTER: TAKE OFF' : 'ON THE SHELF. ENTER: PUT ON')
        : owned ? 'ALREADY OWNED' : ('PRICE: R' + it.price);
      drawText(ctx, line, 20, 224,
        { color: it.hat && owned ? '#ffe49a' : owned ? '#8a93b8' : (this.balance() >= it.price ? '#8ae08a' : '#ff8a8a') });
    }

    // ---- balances (top-left) ----
    draw(ctx, 'r2', 0, 7, 25);
    drawText(ctx, 'R' + this.run.mano, 22, 27, { color: '#ffe49a' });
    drawText(ctx, 'LIVES: ' + this.run.lives, 8, 40, { color: '#f4f0e0' });
    let hy = 50;
    if (this.run.rattex) { drawText(ctx, 'RATTEX: IN POCKET', 8, hy, { color: '#f2c91e' }); hy += 10; }
    if (this.run.faintCharm) { drawText(ctx, 'CHARM: READY', 8, hy, { color: '#e08aff' }); hy += 10; }
    const worn = this.items.filter((it) => it.hat && this.run.hats[it.id]).map((it) => it.name.replace(' HAT', ''));
    if (worn.length) { drawText(ctx, 'WEARING: ' + worn.join(' + '), 8, hy, { color: '#ffe49a' }); hy += 10; }

    if (this.boughtFlash > 0) drawText(ctx, this.flashText || 'BOUGHT!', View.w / 2, 62, { color: '#8ae08a', scale: 2, align: 'center' });
    if (this.denyFlash > 0 && Math.floor(this.t * 10) % 2 === 0) drawText(ctx, 'EISH...', View.w / 2, 62, { color: '#ff8a8a', scale: 2, align: 'center' });

    Particles.draw(ctx, false);

    Barks.draw(ctx, null);
  }
}
