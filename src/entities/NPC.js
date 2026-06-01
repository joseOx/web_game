import { Entity } from './Entity.js';
import { AnimationComponent } from '../systems/AnimationSystem.js';

const NPC_W = 8;
const NPC_H = 12;

export class NPC extends Entity {
  constructor(id, x, y, { color = '#D4A96A', dialogueId = null, label = '' } = {}) {
    super(id, x, y);
    this.width      = NPC_W;
    this.height     = NPC_H;
    this.color      = color;
    this.dialogueId = dialogueId;
    this.label      = label;

    this._drawW    = 0;
    this._drawH    = 0;
    this._bobPhase = Math.random() * Math.PI * 2;
  }

  // img        : HTMLImageElement (the sprite sheet)
  // idleCols   : frames in idle row (row 0)
  // walkCols   : frames in walk row (row 1)
  // drawW/drawH: render size in px
  // idleDur    : ms per idle frame
  // walkDur    : ms per walk frame
  setSprite(img, { idleCols = 3, walkCols = 6, drawW = 20, drawH = 30,
                   idleDur = 400, walkDur = 120 } = {}) {
    const idleFW = img.naturalWidth  / idleCols;
    const walkFW = img.naturalWidth  / walkCols;
    const fh     = img.naturalHeight / 2;

    const idleFrames = [];
    for (let i = 0; i < idleCols; i++) {
      idleFrames.push({ sx: i * idleFW, sy: 0,  sw: idleFW, sh: fh });
    }
    const walkFrames = [];
    for (let i = 0; i < walkCols; i++) {
      walkFrames.push({ sx: i * walkFW, sy: fh, sw: walkFW, sh: fh });
    }

    const states = {
      idle: { spritesheet: img, frames: idleFrames, frameDuration: idleDur, loop: true },
      walk: { spritesheet: img, frames: walkFrames, frameDuration: walkDur, loop: true },
    };

    const existing = this.getComponent('animation');
    if (existing) {
      existing.states = states;
      existing.setState('idle');
    } else {
      this.addComponent('animation', new AnimationComponent(states, 'idle'));
    }

    this._drawW = drawW;
    this._drawH = drawH;
  }

  // Sprite con la misma estructura que Mateo: cuadrícula 4×4, cada fila es una dirección.
  // row0=walk_front, row1=walk_back, row2=walk_left, row3=walk_right
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
    this.getComponent('animation')?.update(dt);

    // ── Companion follow AI ──────────────────────────────────────────────────
    if (this._followTarget && this._followTarget.active) {
      this.prevX = this.x;
      this.prevY = this.y;

      const dx = this._followTarget.centerX() - this.centerX();
      const dy = this._followTarget.centerY() - this.centerY();
      const dist = Math.sqrt(dx * dx + dy * dy);

      const stopDist = this._followStopDist ?? 24;
      if (dist <= stopDist) {
        this.vx = 0;
        this.vy = 0;
        if (this._animWalkState) {
          this.getComponent('animation')?.setState(this._animIdleState);
        }
        return;
      }

      const accelDist = this._followAccelDist ?? 80;
      const minSpeed  = this._followMinSpeed  ?? 0.8;
      const maxSpeed  = this._followMaxSpeed  ?? 1.8;
      const t     = Math.min(1, (dist - stopDist) / accelDist);
      const speed = minSpeed + t * (maxSpeed - minSpeed);

      this.vx = (dx / dist) * speed;
      this.vy = (dy / dist) * speed;

      // direction-based animation state switching
      if (this._animWalkState) {
        const absVX = Math.abs(this.vx);
        const absVY = Math.abs(this.vy);
        if (absVX > absVY) {
          this.getComponent('animation')?.setState(this.vx > 0 ? 'walk_right' : 'walk_left');
        } else if (absVY > 0.1) {
          this.getComponent('animation')?.setState(this.vy > 0 ? 'walk_front' : 'walk_back');
        }
      }

      // Apply collision
      if (this._collision) {
        this.x += this.vx;
        this.y += this.vy;
        this._collision.resolve(this);
      } else {
        this.x += this.vx;
        this.y += this.vy;
      }
    }
  }

  // ── Companion follow ───────────────────────────────────────────────────────
  // target: Entity with centerX/centerY (e.g. Mateo)
  // collision: CollisionSystem instance for wall resolution
  // opts: { stopDist, accelDist, minSpeed, maxSpeed, animWalkState, animIdleState }
  setFollowTarget(target, collision, opts = {}) {
    this._followTarget    = target;
    this._collision       = collision;
    this._followStopDist  = opts.stopDist  ?? 24;
    this._followAccelDist = opts.accelDist ?? 80;
    this._followMinSpeed  = opts.minSpeed  ?? 0.8;
    this._followMaxSpeed  = opts.maxSpeed  ?? 1.8;
    this._animWalkState   = opts.animWalkState ?? 'walk_front';
    this._animIdleState   = opts.animIdleState ?? 'idle_front';
  }

  clearFollowTarget() {
    this._followTarget = null;
    this._collision    = null;
    this.vx = 0;
    this.vy = 0;
  }

  render(ctx, alpha) {
    if (!this.active) return;
    const rx   = Math.round(this.renderX(alpha));
    const ry   = Math.round(this.renderY(alpha));
    const anim = this.getComponent('animation');
    const frame = anim?.currentFrame();

    let labelCX = rx + this.width / 2;
    let labelTopY = ry;

    if (frame?.spritesheet) {
      const dx = rx + Math.round((this.width  - this._drawW) / 2);
      const dy = ry + this.height - this._drawH;
      ctx.drawImage(frame.spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
        dx, dy, this._drawW, this._drawH);
      labelCX   = dx + this._drawW / 2;
      labelTopY = dy;
    } else {
      const bob = Math.round(Math.sin(Date.now() / 1600 + this._bobPhase) * 0.5);
      ctx.fillStyle = this.color;
      ctx.fillRect(rx, ry + bob, this.width, this.height);
      labelTopY = ry + bob;
    }

    if (this.label) {
      ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
      ctx.fillStyle  = '#EEE8FF';
      ctx.font       = '8px VT323, monospace';
      ctx.textAlign  = 'center';
      ctx.fillText(this.label, labelCX, labelTopY - 3);
      ctx.textAlign  = 'left';
      ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    }
  }
}
