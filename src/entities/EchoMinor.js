import { Echo } from './Echo.js';

export class EchoMinor extends Echo {
  constructor(id, x, y, { emotion = 'grief' } = {}) {
    super(id, x, y, { emotion, width: 5, height: 8, visibleInVoid: true, visibleInReal: false });

    this.spawnX  = x;
    this.spawnY  = y;
    this.fleeing = false;  // LunaAI reads this to know when the echo has fled
    this._stunned = false;
    this._stunnedTimer = 0;

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
