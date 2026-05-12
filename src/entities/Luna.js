import { Entity } from './Entity.js';
import { AnimationComponent, buildAnimState } from '../systems/AnimationSystem.js';

// Real-world form
const WIDTH_REAL  = 10;
const HEIGHT_REAL = 8;

// Void form (larger, true form)
const WIDTH_VOID  = 16;
const HEIGHT_VOID = 14;

const FOLLOW_STOP_DIST = 20;    // px — distance at which Luna stops following
const FOLLOW_SPEED_MIN = 1.0;   // px/step — minimum follow speed
const FOLLOW_SPEED_MAX = 2.2;   // px/step — maximum follow speed when far away
const FOLLOW_ACCEL_DIST = 80;   // px — distance where max speed kicks in

const PLACEHOLDER_STATES_REAL = {
  idle:    buildAnimState({ tileW: WIDTH_REAL, tileH: HEIGHT_REAL, row: 0, count: 1 }),
  walk:    buildAnimState({ tileW: WIDTH_REAL, tileH: HEIGHT_REAL, row: 1, count: 4, frameDuration: 100 }),
  purrSeal:buildAnimState({ tileW: WIDTH_REAL, tileH: HEIGHT_REAL, row: 2, count: 2, frameDuration: 300 }),
};

const PLACEHOLDER_STATES_VOID = {
  idle:    buildAnimState({ tileW: WIDTH_VOID, tileH: HEIGHT_VOID, row: 0, count: 1 }),
  walk:    buildAnimState({ tileW: WIDTH_VOID, tileH: HEIGHT_VOID, row: 1, count: 4, frameDuration: 100 }),
  purrSeal:buildAnimState({ tileW: WIDTH_VOID, tileH: HEIGHT_VOID, row: 2, count: 2, frameDuration: 300 }),
};

export class Luna extends Entity {
  constructor(x, y) {
    super('luna', x, y);

    this.dimension = 'real';   // 'real' | 'void'
    this._applyDimension();

    this._target    = null;    // reference to Mateo
    this._collision = null;
    this._ai        = null;    // optional LunaAI FSM (replaces _runFollowAI)

    this.facing = 1;

    this.addComponent('animation', new AnimationComponent(PLACEHOLDER_STATES_REAL, 'idle'));
  }

  setTarget(mateo)          { this._target    = mateo; }
  setCollision(collSystem)  { this._collision = collSystem; }
  setAI(ai)                 { this._ai        = ai; }

  setDimension(dim) {
    if (dim === this.dimension) return;
    this.dimension = dim;
    this._applyDimension();
    const anim = this.getComponent('animation');
    anim.states = dim === 'void' ? { ...PLACEHOLDER_STATES_VOID } : { ...PLACEHOLDER_STATES_REAL };
    anim.setState('idle');
  }

  _applyDimension() {
    if (this.dimension === 'void') {
      this.width  = WIDTH_VOID;
      this.height = HEIGHT_VOID;
    } else {
      this.width  = WIDTH_REAL;
      this.height = HEIGHT_REAL;
    }
  }

  update(dt) {
    if (!this.active) return;
    this.prevX = this.x;
    this.prevY = this.y;

    if (this._ai) { this._ai.update(dt); } else { this._runFollowAI(); }
    this._applyMovement();
    this.getComponent('animation')?.update(dt);
  }

  _runFollowAI() {
    if (!this._target) return;

    const dx   = this._target.centerX() - this.centerX();
    const dy   = this._target.centerY() - this.centerY();
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= FOLLOW_STOP_DIST) {
      this.vx = 0;
      this.vy = 0;
      this.getComponent('animation')?.setState('idle');
      return;
    }

    // Scale speed with distance, clamped to [min, max]
    const t     = Math.min(1, (dist - FOLLOW_STOP_DIST) / FOLLOW_ACCEL_DIST);
    const speed = FOLLOW_SPEED_MIN + t * (FOLLOW_SPEED_MAX - FOLLOW_SPEED_MIN);

    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;

    if (this.vx > 0) this.facing = 1;
    if (this.vx < 0) this.facing = -1;

    this.getComponent('animation')?.setState('walk');
  }

  _applyMovement() {
    if (this._collision) {
      this._collision.resolve(this);
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }
  }

  render(ctx, alpha) {
    if (!this.active) return;

    const rx   = this.renderX(alpha);
    const ry   = this.renderY(alpha);
    const anim = this.getComponent('animation');
    const frame = anim?.currentFrame();

    if (frame?.spritesheet) {
      ctx.save();
      if (this.facing === -1) {
        ctx.translate(rx + this.width / 2, ry);
        ctx.scale(-1, 1);
        ctx.drawImage(frame.spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
          -this.width / 2, 0, this.width, this.height);
      } else {
        ctx.drawImage(frame.spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
          rx, ry, this.width, this.height);
      }
      ctx.restore();
    } else {
      // Placeholder: warm grey for real form, bright violet for void form
      ctx.fillStyle = this.dimension === 'void' ? '#9B7FE8' : '#AAAAAA';
      ctx.fillRect(Math.round(rx), Math.round(ry), this.width, this.height);
    }
  }
}
