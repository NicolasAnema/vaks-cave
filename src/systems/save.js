// ============================================================
// Persistence: progression, scene unlocks, settings.
// Guards localStorage so the module also loads under Node for
// the headless verifier.
// ============================================================

const KEY = 'vaks_cave_save_v1';

const DEFAULTS = () => ({
  unlockedLevel: 1,          // highest level reachable in level select
  scenes: [],                // unlocked cutscene ids (gallery)
  flowNode: -1,              // -1 = no run in progress; else continue point
  runSnapshot: null,         // { lives, score, mano, inv } at flow node
  bestScore: 0,
  shopVisited: false,
  settings: {
    master: 8, music: 8, voice: 8,
    shake: true,
    textSpeed: 'normal',     // slow | normal | fast
  },
});

export const Save = {
  data: DEFAULTS(),

  load() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      this.data = { ...DEFAULTS(), ...d, settings: { ...DEFAULTS().settings, ...(d.settings || {}) } };
    } catch (e) {
      this.data = DEFAULTS();
    }
  },

  save() {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* storage full/blocked: play on */ }
  },

  unlockLevel(n) {
    if (n > this.data.unlockedLevel) { this.data.unlockedLevel = n; this.save(); }
  },

  unlockScene(id) {
    if (!this.data.scenes.includes(id)) { this.data.scenes.push(id); this.save(); }
  },

  reset() { this.data = DEFAULTS(); this.save(); },
};
