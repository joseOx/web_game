import { Entity } from './Entity.js';
import { EMOTION_COLORS } from './Rift.js';

export class Echo extends Entity {
  constructor(id, x, y, { emotion = 'grief', width = 6, height = 10, visibleInVoid = true, visibleInReal = false } = {}) {
    super(id, x, y);
    this.emotion  = emotion;
    this.width    = width;
    this.height   = height;
    this.color    = EMOTION_COLORS[emotion] ?? '#888888';

    this._visibleInVoid = visibleInVoid;
    this._visibleInReal = visibleInReal;
    this._visible       = false;
    this._dimension     = 'real';
  }

  setDimension(dim) {
    this._dimension = dim;
    this._visible   = dim === 'void' ? this._visibleInVoid : this._visibleInReal;
  }

  render(ctx, alpha) {
    if (!this.active || !this._visible) return;
    const rx = this.renderX(alpha);
    const ry = this.renderY(alpha);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle   = this.color;
    ctx.fillRect(Math.round(rx), Math.round(ry), this.width, this.height);
    ctx.globalAlpha = 1;
  }
}
