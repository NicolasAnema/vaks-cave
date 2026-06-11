// ============================================================
// THE TIKOLOSH SHOP — a calm shopkeeper in a lantern-lit nook
// after every level clear. Spend green crystals (and spare
// ceppies at 1 ceppy = 2 crystals) on an extra life, an irie
// stash, or a faint charm (World 2 only).
// ============================================================

import { CONFIG } from '../config.js';
import { View, panel } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText } from '../engine/font.js';
import { draw } from '../engine/sprites.js';
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

export class ShopScreen {
  constructor(run, afterLevel, cb) {
    this.run = run;
    this.cb = cb; // { onDone() }
    this.t = 0;
    this.items = [
      { id: 'life', name: 'EXTRA LIFE', desc: 'ONE MORE CHANCE, BOSS', price: CONFIG.shop.prices.life, sprite: 'ceppy' },
      { id: 'irie', name: 'IRIE STASH', desc: 'START NEXT LEVEL HOLDING ONE', price: CONFIG.shop.prices.irie, sprite: 'weed' },
    ];
    if (afterLevel >= 4) {
      this.items.push({ id: 'charm', name: 'FAINT CHARM', desc: 'GRANNY RESTS LONGER NEXT TIME', price: CONFIG.shop.prices.charm, sprite: 'crystal' });
    }
    this.sel = 0; // items..., then LEAVE
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

  balance() { return this.run.crystals + this.run.ceppies * CONFIG.shop.ceppyValue; }

  buy(item) {
    if (item.id === 'life' && this.run.lives >= CONFIG.lives.max) { this.deny('LIVES ARE FULL, BOSS'); return; }
    if (item.id === 'irie' && this.run.irieStash) { this.deny('ALREADY HOLDING, BOSS'); return; }
    if (item.id === 'charm' && this.run.faintCharm) { this.deny('CHARM ALREADY GLOWING'); return; }
    if (this.balance() < item.price) { this.deny('NOT ENOUGH SHINIES'); return; }
    let cost = item.price;
    const fromCrystals = Math.min(this.run.crystals, cost);
    this.run.crystals -= fromCrystals;
    cost -= fromCrystals;
    if (cost > 0) this.run.ceppies -= Math.ceil(cost / CONFIG.shop.ceppyValue);
    if (item.id === 'life') this.run.lives++;
    if (item.id === 'irie') this.run.irieStash = true;
    if (item.id === 'charm') this.run.faintCharm = true;
    AudioManager.play('shop_buy', item.id);
    this.boughtFlash = 0.6;
    this.keeperLine = 'GOOD CHOICE. THE WIND APPROVES.';
    this.keeperDelay = 0;
    Particles.sparkle(120 + this.sel * 90, 180, '#ffe49a', 8);
  }

  deny(msg) {
    this.denyFlash = 0.5;
    this.keeperLine = msg;
    this.keeperDelay = 0;
  }

  update(dt) {
    if (!this.started) { this.started = true; this.start(); }
    this.t += dt;
    this.boughtFlash = Math.max(0, this.boughtFlash - dt);
    this.denyFlash = Math.max(0, this.denyFlash - dt);
    if (this.keeperDelay !== undefined && this.keeperDelay > 0) this.keeperDelay -= dt;

    const total = this.items.length + 1;
    if (Input.wasPressed('ArrowLeft') || Input.wasPressed('ArrowUp')) this.sel = (this.sel + total - 1) % total;
    if (Input.wasPressed('ArrowRight') || Input.wasPressed('ArrowDown')) this.sel = (this.sel + 1) % total;
    if (Input.wasPressed('Enter')) {
      if (this.sel >= this.items.length) { this.cb.onDone(); return; }
      this.buy(this.items[this.sel]);
    }
    if (Input.wasPressed('Escape')) { this.cb.onDone(); return; }

    if (Math.random() < 0.04) Particles.wisp(360 + Math.random() * 40, 200, 'rgba(224,168,90,0.35)');
    Particles.update(dt);
    Barks.update(dt);
  }

  draw(ctx) {
    drawScene(ctx, 'shop_nook', this.t);

    // shopkeeper tikolosh + lantern
    draw(ctx, 'tiko_shop', Math.floor(this.t * 2) % 2, 350, 158, { scale: 2 });
    draw(ctx, 'lantern', Math.floor(this.t * 4) % 2, 396, 178);

    drawText(ctx, 'THE TIKOLOSH SHOP', View.w / 2, 14, { color: '#e0a85a', scale: 2, align: 'center' });

    // keeper speech
    if (this.keeperLine && (this.keeperDelay === undefined || this.keeperDelay <= 0)) {
      panel(ctx, 252, 120, 200, 30, { bg: 'rgba(20,16,8,0.9)', border: '#6e5638' });
      const lines = this.keeperLine.length > 40 ? [this.keeperLine.slice(0, 40), this.keeperLine.slice(40)] : [this.keeperLine];
      drawText(ctx, 'SHOPKEEPER:', 258, 124, { color: '#e0a85a' });
      drawText(ctx, this.keeperLine, 352, 134, { color: '#f4f0e0', align: 'center' });
    }

    // wares on pedestals
    const baseX = 66, gap = 86, py = 166;
    this.items.forEach((item, i) => {
      const x = baseX + i * gap;
      const seld = this.sel === i;
      draw(ctx, 'pedestal', 0, x - 9, py);
      const bob = Math.sin(this.t * 3 + i) * 2;
      draw(ctx, item.sprite, 0, x - 5, py - 14 + bob);
      if (seld) {
        drawText(ctx, '>', x - 18, py - 12 + bob, { color: '#ffe49a' });
        panel(ctx, 24, 196, 280, 40);
        drawText(ctx, item.name, 32, 201, { color: '#ffe49a' });
        drawText(ctx, item.desc, 32, 211, { color: '#cfd6ff' });
        drawText(ctx, 'PRICE: ' + item.price + ' CRYSTALS (CEPPIES COUNT X' + CONFIG.shop.ceppyValue + ')', 32, 222, { color: '#8ae08a' });
      }
      drawText(ctx, String(item.price), x, py + 16, { color: this.balance() >= item.price ? '#8ae08a' : '#ff8a8a', align: 'center' });
    });

    // leave door
    const lx = baseX + this.items.length * gap;
    drawText(ctx, 'LEAVE', lx, py - 4, { color: this.sel === this.items.length ? '#ffe49a' : '#8a93b8', align: 'center' });
    if (this.sel === this.items.length) drawText(ctx, '>', lx - 28, py - 4, { color: '#ffe49a' });

    // balances
    draw(ctx, 'crystal', 0, 8, 8);
    drawText(ctx, 'x' + this.run.crystals, 19, 10, { color: '#8ae08a' });
    draw(ctx, 'ceppy', 0, 8, 24);
    drawText(ctx, 'x' + this.run.ceppies, 19, 24, { color: '#ffe49a' });
    drawText(ctx, 'LIVES: ' + this.run.lives, 8, 38, { color: '#f4f0e0' });
    if (this.run.irieStash) drawText(ctx, 'HOLDING: 1 GANJA', 8, 48, { color: '#6ac24a' });
    if (this.run.faintCharm) drawText(ctx, 'CHARM: READY', 8, 58, { color: '#e08aff' });

    if (this.boughtFlash > 0) drawText(ctx, 'BOUGHT!', View.w / 2, 100, { color: '#8ae08a', scale: 2, align: 'center' });
    if (this.denyFlash > 0 && Math.floor(this.t * 10) % 2 === 0) drawText(ctx, 'EISH...', View.w / 2, 100, { color: '#ff8a8a', scale: 2, align: 'center' });

    Particles.draw(ctx, false);
    drawText(ctx, 'ARROWS: BROWSE   ENTER: BUY   ESC: LEAVE', View.w / 2, View.h - 12, { color: '#5a6280', align: 'center' });

    Barks.draw(ctx, null);
  }
}
