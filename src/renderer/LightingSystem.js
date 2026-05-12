import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';
import { DIM } from '../world/Dimension.js';

// Darkness alpha per mode (0 = fully lit, 1 = pitch black)
const DARK_ALPHA = {
  real_day:   0,     // no darkness
  real_night: 0.82,
  void:       0.90,
};

export class LightingSystem {
  constructor(camera) {
    this.camera    = camera;
    this.dimension = DIM.REAL;
    this.timeOfDay = 'day';   // 'day' | 'dusk' | 'night'

    // Light sources registered per frame: [ {x, y, radius, color, intensity} ]
    this._lights = [];

    // Offscreen canvas for the darkness + light mask
    this._maskCanvas = document.createElement('canvas');
    this._maskCanvas.width  = BASE_WIDTH;
    this._maskCanvas.height = BASE_HEIGHT;
    this._maskCtx   = this._maskCanvas.getContext('2d');

    // Void tint color
    this._voidTintColor = 'rgba(26, 20, 40, 0.45)';
  }

  setDimension(dim) {
    this.dimension = dim;
  }

  setTimeOfDay(tod) {
    this.timeOfDay = tod;
  }

  // Add a light source this frame. Called by entities/rifts before render.
  addLight(worldX, worldY, radius, color = '#ffffff', intensity = 1.0) {
    this._lights.push({ worldX, worldY, radius, color, intensity });
  }

  // render(ctx, alpha) — registered as a render system; runs after entity render
  render(ctx, _alpha) {
    this._lights = []; // reset per frame — callers add before this runs (use update hook)

    const mode = this._mode();
    if (mode === 'real_day') return; // nothing to draw

    if (mode === 'void') {
      this._drawVoidTint(ctx);
    }

    if (mode !== 'real_day') {
      this._drawDarkness(ctx, DARK_ALPHA[mode] ?? 0);
    }
  }

  // Separate render pass for darkness (called explicitly after lights are registered)
  renderDarkness(ctx) {
    const mode = this._mode();
    if (mode === 'real_day') return;
    this._drawDarkness(ctx, DARK_ALPHA[mode] ?? 0);
  }

  _mode() {
    if (this.dimension === DIM.VOID)  return 'void';
    if (this.timeOfDay === 'night')   return 'real_night';
    if (this.timeOfDay === 'dusk')    return 'real_night'; // same treatment, slightly less dark
    return 'real_day';
  }

  _drawVoidTint(ctx) {
    ctx.fillStyle = this._voidTintColor;
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
  }

  _drawDarkness(ctx, darkAlpha) {
    if (darkAlpha <= 0 || this._lights.length === 0 && darkAlpha < 0.1) return;

    const mCtx = this._maskCtx;
    mCtx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Fill mask with darkness
    mCtx.globalCompositeOperation = 'source-over';
    mCtx.fillStyle = `rgba(0,0,0,${darkAlpha})`;
    mCtx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Punch light holes using destination-out
    mCtx.globalCompositeOperation = 'destination-out';
    for (const light of this._lights) {
      const sx = light.worldX - Math.floor(this.camera.x);
      const sy = light.worldY - Math.floor(this.camera.y);
      const r  = light.radius;

      const grad = mCtx.createRadialGradient(sx, sy, 0, sx, sy, r);
      grad.addColorStop(0,   `rgba(0,0,0,${light.intensity})`);
      grad.addColorStop(0.5, `rgba(0,0,0,${light.intensity * 0.6})`);
      grad.addColorStop(1,   'rgba(0,0,0,0)');

      mCtx.fillStyle = grad;
      mCtx.beginPath();
      mCtx.arc(sx, sy, r, 0, Math.PI * 2);
      mCtx.fill();
    }

    mCtx.globalCompositeOperation = 'source-over';

    // Composite darkness mask onto main canvas
    ctx.drawImage(this._maskCanvas, 0, 0);
  }

  destroy() {
    this._lights = [];
  }
}
