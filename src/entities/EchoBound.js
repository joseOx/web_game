import { Echo } from './Echo.js';

export class EchoBound extends Echo {
  constructor(id, x, y, { emotion = 'grief', dialogueId = null, visibleInReal = false } = {}) {
    super(id, x, y, { emotion, width: 8, height: 12, visibleInVoid: true, visibleInReal });

    this.dialogueId = dialogueId;
    this.spawnX     = x;
    this.spawnY     = y;

    this._ai = null;
  }

  setAI(ai) { this._ai = ai; }

  update(dt) {
    if (!this.active) return;
    this.prevX = this.x;
    this.prevY = this.y;

    this._ai?.update(dt);

    this.x += this.vx;
    this.y += this.vy;
  }
}
