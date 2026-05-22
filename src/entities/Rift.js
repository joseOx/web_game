import { Entity } from './Entity.js';

export const EMOTION_COLORS = {
  grief:   '#3B5EA6',
  guilt:   '#4A7C59',
  fear:    '#D4B483',
  anger:   '#9E3A3A',
  longing: '#7B5EA7',
};

// Pixel dimensions per rift size at 16px/tile resolution
const SIZE_DIMS = {
  micro:    { w: 4,  h: 4  },
  minor:    { w: 8,  h: 12 },
  major:    { w: 12, h: 20 },
  critical: { w: 24, h: 40 },
};

// Pulse speed (radians per ms) — larger rifts pulse slower
const PULSE_SPEED = {
  micro:    0.006,
  minor:    0.004,
  major:    0.003,
  critical: 0.002,
};

export class Rift extends Entity {
  constructor({ id, x, y, size = 'minor', emotion = 'grief', anchorId = null, visible, forceHiddenInReal }) {
    const dims = SIZE_DIMS[size] ?? SIZE_DIMS.minor;
    super(id, x, y);
    this.width  = dims.w;
    this.height = dims.h;

    this.size         = size;
    this.emotion      = emotion;
    this.anchorId     = anchorId;
    this.pulseColor   = EMOTION_COLORS[emotion] ?? '#9B7FE8';

    this.sealed       = false;
    this.sealProgress = 0;    // 0–100

    this._pulseTime   = Math.random() * Math.PI * 2; // randomize phase
    this._pulseSpeed  = PULSE_SPEED[size] ?? 0.004;

    // Visibility — controlled by RiftSystem depending on dimension / feline vision
    this.visibleInReal      = false;  // only visible with feline vision in real world
    this.visibleInVoid      = true;   // always visible in the Void
    // forceHiddenInReal: true = never visible in real even with feline vision.
    // Explicit forceHiddenInReal prop takes precedence; fall back to visible===false.
    this._forceHiddenInReal = forceHiddenInReal !== undefined ? !!forceHiddenInReal : (visible === false);
    this._currentlyVisible  = false;
  }

  // Returns pulse intensity 0.0–1.0
  pulseIntensity() {
    return 0.55 + 0.45 * Math.sin(this._pulseTime);
  }

  update(dt) {
    if (!this.active || this.sealed) return;
    this._pulseTime += this._pulseSpeed * dt;
  }

  render(ctx, alpha) {
    if (!this.active || this.sealed || !this._currentlyVisible) return;

    const rx = this.renderX(alpha);
    const ry = this.renderY(alpha);
    const intensity = this.pulseIntensity();

    // Outer glow
    const glowR = this.width * 1.8;
    const cx    = rx + this.width  / 2;
    const cy    = ry + this.height / 2;
    const grad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    const col   = this.pulseColor;
    grad.addColorStop(0,   col + 'CC');
    grad.addColorStop(0.5, col + '55');
    grad.addColorStop(1,   col + '00');

    ctx.globalAlpha = intensity;
    ctx.fillStyle   = grad;
    ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

    // Core crack shape
    ctx.globalAlpha = 0.8 * intensity;
    ctx.fillStyle   = col;
    ctx.fillRect(Math.round(rx), Math.round(ry), this.width, this.height);

    // Seal progress bar (above the rift)
    if (this.sealProgress > 0) {
      const barW = this.width + 4;
      const barX = rx - 2;
      const barY = ry - 5;
      ctx.globalAlpha = 1;
      ctx.fillStyle   = '#000000AA';
      ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = '#9B7FE8';
      ctx.fillRect(barX, barY, Math.round(barW * this.sealProgress / 100), 3);
    }

    ctx.globalAlpha = 1;
  }

  destroy() {
    super.destroy();
  }
}
