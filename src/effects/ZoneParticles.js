import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

// Ambient screen-space particles per zone type.
// Rendered after camera.restore — coordinates are screen pixels.

const CONFIGS = {
  R_BEACH:      { n:10, color:'#DCF0FF', aMin:.06, aMax:.14, vyMin:-14, vyMax: -6, vxMin:-4,  vxMax: 4,  w:2, h:3 },
  V_BEACH:      { n:7,  color:'#4A5880', aMin:.05, aMax:.10, vyMin:-10, vyMax: -5, vxMin:-3,  vxMax: 3,  w:2, h:3 },
  R_CEMETERY:   { n:8,  color:'#8A9878', aMin:.08, aMax:.16, vyMin: 14, vyMax: 26, vxMin: 6,  vxMax:16,  w:3, h:2 },
  V_CEMETERY:   { n:6,  color:'#506850', aMin:.06, aMax:.12, vyMin: 12, vyMax: 22, vxMin: 5,  vxMax:14,  w:3, h:2 },
  R_LIGHTHOUSE: { n:12, color:'#C0CCD8', aMin:.05, aMax:.10, vyMin: -3, vyMax:  3, vxMin:25,  vxMax:55,  w:6, h:1 },
  V_LIGHTHOUSE: { n:8,  color:'#303870', aMin:.04, aMax:.09, vyMin: -2, vyMax:  2, vxMin:18,  vxMax:40,  w:6, h:1 },
};

function rnd(a, b) { return a + Math.random() * (b - a); }

function spawnParticle(cfg) {
  return {
    x:     rnd(0, BASE_WIDTH),
    y:     rnd(0, BASE_HEIGHT),
    vx:    rnd(cfg.vxMin, cfg.vxMax),
    vy:    rnd(cfg.vyMin, cfg.vyMax),
    alpha: rnd(cfg.aMin, cfg.aMax),
    w:     cfg.w,
    h:     cfg.h,
  };
}

export class ZoneParticles {
  constructor() {
    this._cfg  = null;
    this._pool = [];
  }

  setZone(zoneId) {
    this._cfg  = CONFIGS[zoneId] ?? null;
    this._pool = [];
    if (this._cfg) {
      for (let i = 0; i < this._cfg.n; i++) {
        this._pool.push(spawnParticle(this._cfg));
      }
    }
  }

  update(dt) {
    if (!this._cfg) return;
    const s = dt / 1000;
    for (const p of this._pool) {
      p.x += p.vx * s;
      p.y += p.vy * s;
      if (p.x >  BASE_WIDTH  + 12) p.x = -12;
      if (p.x < -12)               p.x = BASE_WIDTH + 12;
      if (p.y >  BASE_HEIGHT + 12) p.y = -12;
      if (p.y < -12)               p.y = BASE_HEIGHT + 12;
    }
  }

  render(ctx) {
    if (!this._cfg || this._pool.length === 0) return;
    const { color } = this._cfg;
    for (const p of this._pool) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.w, p.h);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this._cfg  = null;
    this._pool = [];
  }
}
