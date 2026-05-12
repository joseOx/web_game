import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const MAX_ENERGY       = 100;
const DRAIN_RATE       = 8;    // energy units per second while active
const RECHARGE_RATE    = 15;   // energy units per second while inactive
const MIN_ENERGY_TO_ON = 10;   // minimum energy needed to activate

export class VisionSystem {
  constructor(camera) {
    this.camera  = camera;
    this.active  = false;
    this.energy  = MAX_ENERGY;

    this._input     = null;
    this._riftSystem = null;
    this._eventBus  = null;

    // For void overlay (BondSystem WARNING level)
    this._voidOverlayIntensity = 0;

    // Luna's paw trail — last N positions
    this._lunaTrail = [];
    this._luna      = null;
  }

  inject({ input, riftSystem, eventBus, luna } = {}) {
    if (input)      this._input      = input;
    if (riftSystem) this._riftSystem = riftSystem;
    if (eventBus)   this._eventBus   = eventBus;
    if (luna)       this._luna       = luna;
  }

  setVoidOverlayIntensity(v) {
    this._voidOverlayIntensity = Math.max(0, Math.min(1, v));
  }

  // Called by LightingSystem / bond system
  activate()   { this.active = true; }
  deactivate() { this.active = false; }

  update(dt) {
    const wantsActive = this._input?.isAction('feline_vision') ?? false;

    if (wantsActive && this.energy >= MIN_ENERGY_TO_ON) {
      if (!this.active) {
        this.active = true;
        this._eventBus?.emit('vision:activated');
        this._riftSystem?.setFelineVision(true);
      }
    } else if (!wantsActive && this.active) {
      this.active = false;
      this._eventBus?.emit('vision:deactivated');
      this._riftSystem?.setFelineVision(false);
    }

    // Energy management
    if (this.active) {
      this.energy = Math.max(0, this.energy - DRAIN_RATE * (dt / 1000));
      if (this.energy === 0) {
        this.active = false;
        this._riftSystem?.setFelineVision(false);
      }
    } else {
      this.energy = Math.min(MAX_ENERGY, this.energy + RECHARGE_RATE * (dt / 1000));
    }

    // Record Luna's trail for paw prints (up to 8 positions, sampled every ~200ms)
    this._updateLunaTrail(dt);
  }

  _trailTimer = 0;

  _updateLunaTrail(dt) {
    if (!this._luna || !this.active) {
      this._lunaTrail = [];
      return;
    }
    this._trailTimer += dt;
    if (this._trailTimer >= 200) {
      this._trailTimer = 0;
      this._lunaTrail.push({ x: this._luna.x, y: this._luna.y });
      if (this._lunaTrail.length > 8) this._lunaTrail.shift();
    }
  }

  // render(ctx, alpha) — runs after entity/rift render, before TransitionFX
  render(ctx, _alpha) {
    if (this._voidOverlayIntensity > 0) {
      this._drawVoidOverlay(ctx);
    }

    if (!this.active) return;

    this._drawFelineOverlay(ctx);
    this._drawLunaTrail(ctx);
    this._drawEnergyBar(ctx);
  }

  _drawVoidOverlay(ctx) {
    ctx.globalAlpha = this._voidOverlayIntensity * 0.35;
    ctx.fillStyle   = '#2A2240';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    ctx.globalAlpha = 1;
  }

  _drawFelineOverlay(ctx) {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle   = '#6B48C8';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    ctx.globalAlpha = 1;
  }

  _drawLunaTrail(ctx) {
    if (!this.camera) return;
    for (let i = 0; i < this._lunaTrail.length; i++) {
      const pos    = this._lunaTrail[i];
      const fading = i / this._lunaTrail.length;
      const sx     = pos.x - Math.floor(this.camera.x);
      const sy     = pos.y - Math.floor(this.camera.y);

      ctx.globalAlpha = fading * 0.6;
      ctx.fillStyle   = '#C8A9FF';
      // Simple paw shape: small circle
      ctx.beginPath();
      ctx.arc(sx + 3, sy + 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawEnergyBar(ctx) {
    const BAR_W = 40;
    const BAR_H = 3;
    const BAR_X = BASE_WIDTH / 2 - BAR_W / 2;
    const BAR_Y = BASE_HEIGHT - 10;
    const fill  = (this.energy / MAX_ENERGY) * BAR_W;

    ctx.fillStyle   = 'rgba(0,0,0,0.5)';
    ctx.fillRect(BAR_X - 1, BAR_Y - 1, BAR_W + 2, BAR_H + 2);

    ctx.fillStyle = '#C8A9FF';
    ctx.fillRect(BAR_X, BAR_Y, Math.round(fill), BAR_H);
  }

  destroy() {
    this._lunaTrail = [];
  }
}
