import { Echo } from './Echo.js';
import { AnimationComponent } from '../systems/AnimationSystem.js';

export class EchoBound extends Echo {
  constructor(id, x, y, { emotion = 'grief', dialogueId = null, visibleInReal = false } = {}) {
    super(id, x, y, { emotion, width: 8, height: 12, visibleInVoid: true, visibleInReal });

    this.dialogueId = dialogueId;
    this.spawnX     = x;
    this.spawnY     = y;

    this._ai    = null;
    this._drawW = 0;
    this._drawH = 0;
  }

  setAI(ai) { this._ai = ai; }

  // Mismo formato que Mateo: cuadrícula 4×4 de frames
  setMateoSprite(img, { drawW = 28, drawH = 28 } = {}) {
    const fw = img.naturalWidth  / 4;
    const fh = img.naturalHeight / 4;
    const f  = (col, row) => ({ sx: col * fw, sy: row * fh, sw: fw, sh: fh });
    const st = (frames, dur = 120) => ({ spritesheet: img, frames, frameDuration: dur, loop: true });

    const states = {
      idle_front: st([f(0,0)], 500),
      idle_back:  st([f(0,1)], 500),
      idle_left:  st([f(0,2)], 500),
      idle_right: st([f(3,2)], 500),
      walk_front: st([f(0,0), f(1,0), f(2,0), f(3,0)]),
      walk_back:  st([f(0,1), f(1,1), f(2,1), f(3,1)]),
      walk_left:  st([f(0,2), f(1,2), f(2,2)]),
      walk_right: st([f(3,2), f(0,3), f(1,3)]),
    };

    const existing = this.getComponent('animation');
    if (existing) {
      existing.states = states;
      existing.setState('idle_front');
    } else {
      this.addComponent('animation', new AnimationComponent(states, 'idle_front'));
    }

    this._drawW = drawW;
    this._drawH = drawH;
  }

  update(dt) {
    if (!this.active) return;
    this.prevX = this.x;
    this.prevY = this.y;

    this._ai?.update(dt);
    this.getComponent('animation')?.update(dt);

    this.x += this.vx;
    this.y += this.vy;
  }

  render(ctx, alpha) {
    if (!this.active || !this._visible) return;

    const rx    = this.renderX(alpha);
    const ry    = this.renderY(alpha);
    const frame = this.getComponent('animation')?.currentFrame();

    ctx.globalAlpha = 0.75;

    if (frame?.spritesheet) {
      const dx = rx + (this.width  - this._drawW) / 2;
      const dy = ry + this.height  - this._drawH;
      ctx.drawImage(frame.spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
        Math.round(dx), Math.round(dy), this._drawW, this._drawH);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(Math.round(rx), Math.round(ry), this.width, this.height);
    }

    ctx.globalAlpha = 1;
  }
}
