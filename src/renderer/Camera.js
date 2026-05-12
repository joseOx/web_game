import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

export class Camera {
  constructor() {
    this.x      = 0;
    this.y      = 0;
    this.width  = BASE_WIDTH;
    this.height = BASE_HEIGHT;

    this.target = null;
    this.lerp   = 0.08;
    this.bounds = null;  // { width, height } in pixels — set from active tilemap
  }

  follow(entity) {
    this.target = entity;
  }

  setBounds(widthPx, heightPx) {
    this.bounds = { width: widthPx, height: heightPx };
  }

  clearBounds() {
    this.bounds = null;
  }

  update(_dt) {
    if (!this.target) return;

    const targetX = this.target.x - this.width  / 2;
    const targetY = this.target.y - this.height / 2;

    this.x += (targetX - this.x) * this.lerp;
    this.y += (targetY - this.y) * this.lerp;

    this._clamp();
  }

  _clamp() {
    if (!this.bounds) return;
    this.x = Math.max(0, Math.min(this.x, this.bounds.width  - this.width));
    this.y = Math.max(0, Math.min(this.y, this.bounds.height - this.height));
  }

  // Call at the start of each render pass that should be affected by the camera
  apply(ctx) {
    ctx.save();
    ctx.translate(-Math.floor(this.x), -Math.floor(this.y));
  }

  // Call at the end of the render pass
  restore(ctx) {
    ctx.restore();
  }

  // Snap instantly to target (use on scene load to avoid lerp slide-in)
  snapToTarget() {
    if (!this.target) return;
    this.x = this.target.x - this.width  / 2;
    this.y = this.target.y - this.height / 2;
    this._clamp();
  }

  // Convert world coordinates to screen coordinates
  toScreen(worldX, worldY) {
    return {
      x: worldX - Math.floor(this.x),
      y: worldY - Math.floor(this.y),
    };
  }

  // Convert screen coordinates to world coordinates
  toWorld(screenX, screenY) {
    return {
      x: screenX + Math.floor(this.x),
      y: screenY + Math.floor(this.y),
    };
  }

  // Returns true if the rect (world coords) is within or touching the viewport
  isVisible(wx, wy, w, h) {
    return (
      wx + w > this.x &&
      wy + h > this.y &&
      wx     < this.x + this.width &&
      wy     < this.y + this.height
    );
  }

  destroy() {
    this.target = null;
    this.bounds = null;
  }
}
