import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const EFFECTS = {
  dimension_shift: { duration: 600, color: '#9B7FE8' },  // violeta — El Vacío
  fade_black:      { duration: 400, color: '#000000' },
  fade_white:      { duration: 300, color: '#ffffff' },
  scene_enter:     { duration: 300, color: '#000000' },
};

export class TransitionFX {
  constructor() {
    this._active  = false;
    this._alpha   = 0;
    this._color   = '#000000';
    this._phase   = 'idle';  // 'idle' | 'fade_in' | 'hold' | 'fade_out'
    this._resolve = null;

    this._elapsed  = 0;
    this._duration = 400;
    this._halfDur  = 200;
  }

  get active() { return this._active; }

  // Returns a Promise that resolves at the midpoint (peak opacity).
  // Use: await transitionFX.play('dimension_shift')
  // The scene/world swap happens at the promise resolution point.
  play(effectName) {
    const cfg = EFFECTS[effectName] ?? EFFECTS.fade_black;
    this._color   = cfg.color;
    this._duration = cfg.duration;
    this._halfDur  = cfg.duration / 2;
    this._active   = true;
    this._elapsed  = 0;
    this._phase    = 'fade_in';
    this._alpha    = 0;

    return new Promise(resolve => {
      this._resolve = resolve;
    });
  }

  // Play and wait for the full effect (fade in + fade out) to complete.
  playFull(effectName) {
    const cfg = EFFECTS[effectName] ?? EFFECTS.fade_black;
    this._color    = cfg.color;
    this._duration = cfg.duration;
    this._halfDur  = cfg.duration / 2;
    this._active   = true;
    this._elapsed  = 0;
    this._phase    = 'fade_in';
    this._alpha    = 0;
    this._resolve  = null;

    return new Promise(resolve => {
      this._fullResolve = resolve;
    });
  }

  // Called each fixed update step via Game
  update(dt) {
    if (!this._active) return;
    this._elapsed += dt;

    if (this._phase === 'fade_in') {
      this._alpha = Math.min(1, this._elapsed / this._halfDur);
      if (this._elapsed >= this._halfDur) {
        this._phase   = 'fade_out';
        this._elapsed = 0;
        // Resolve at midpoint so the caller can swap scene/dimension
        if (this._resolve) {
          const r = this._resolve;
          this._resolve = null;
          r();
        }
      }
    } else if (this._phase === 'fade_out') {
      this._alpha = Math.max(0, 1 - this._elapsed / this._halfDur);
      if (this._elapsed >= this._halfDur) {
        this._alpha  = 0;
        this._active = false;
        this._phase  = 'idle';
        if (this._fullResolve) {
          const r = this._fullResolve;
          this._fullResolve = null;
          r();
        }
      }
    }
  }

  // Rendered on top of everything — outside camera transform
  render(ctx, _alpha) {
    if (!this._active || this._alpha <= 0) return;
    ctx.globalAlpha = this._alpha;
    ctx.fillStyle   = this._color;
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    ctx.globalAlpha = 1;
  }

  destroy() {
    this._active  = false;
    this._resolve = null;
    this._fullResolve = null;
  }
}
