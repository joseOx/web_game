export const BASE_WIDTH  = 320;
export const BASE_HEIGHT = 180;
export const TILE_SIZE   = 16;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.lastTime    = 0;
    this.accumulator = 0;
    this.FIXED_STEP  = 1000 / 60;

    // Systems registered in order. Each must implement update(dt) and/or render(ctx, alpha).
    this._updateSystems = [];
    this._renderSystems = [];

    this._running = false;
    this._rafId   = null;
  }

  registerUpdateSystem(system) {
    this._updateSystems.push(system);
    return this;
  }

  registerRenderSystem(system) {
    this._renderSystems.push(system);
    return this;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  stop() {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _loop(timestamp) {
    if (!this._running) return;

    const delta = Math.min(timestamp - this.lastTime, 100); // cap at 100ms to avoid spiral
    this.lastTime    = timestamp;
    this.accumulator += delta;

    while (this.accumulator >= this.FIXED_STEP) {
      this._update(this.FIXED_STEP);
      this.accumulator -= this.FIXED_STEP;
    }

    const alpha = this.accumulator / this.FIXED_STEP;
    this._render(alpha);

    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  _update(dt) {
    for (const sys of this._updateSystems) {
      sys.update(dt);
    }
  }

  _render(alpha) {
    this.ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    for (const sys of this._renderSystems) {
      sys.render(this.ctx, alpha);
    }
  }

  destroy() {
    this.stop();
    this._updateSystems = [];
    this._renderSystems = [];
  }
}
