import { Entity } from './Entity.js';
import { AnimationComponent, buildAnimState } from '../systems/AnimationSystem.js';

const SPEED    = 1.5;   // px per fixed step (≈ 90 px/s at 60 Hz)
const WIDTH    = 10;
const HEIGHT   = 14;

// Placeholder animation states — frames reference a single-color placeholder
// until real spritesheets are loaded via AssetLoader.
const PLACEHOLDER_STATES = {
  idle: buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 0, count: 1, frameDuration: 500 }),
  walk: buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 1, count: 4, frameDuration: 120 }),
  fear: buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 2, count: 2, frameDuration: 200, loop: false }),
};

export class Mateo extends Entity {
  constructor(x, y) {
    super('mateo', x, y);
    this.width  = WIDTH;
    this.height = HEIGHT;

    this.facing  = 1;   // 1 = right, -1 = left
    this._input  = null; // set by scene after construction
    this._collision = null;

    this.addComponent('animation', new AnimationComponent(PLACEHOLDER_STATES, 'idle'));
  }

  // Inject singletons after construction to avoid circular imports at module load time.
  setInput(inputSystem)     { this._input     = inputSystem; }
  setCollision(collSystem)  { this._collision  = collSystem; }

  // Load real spritesheet states. Called by AssetLoader after sprites are ready.
  setSpritesheets(states) {
    const anim = this.getComponent('animation');
    Object.assign(anim.states, states);
  }

  update(dt) {
    if (!this.active) return;
    this.prevX = this.x;
    this.prevY = this.y;

    this._handleInput();
    this._applyMovement();
    this.getComponent('animation')?.update(dt);
  }

  _handleInput() {
    if (!this._input) return;

    const left  = this._input.isAction('move_left');
    const right = this._input.isAction('move_right');
    const up    = this._input.isAction('move_up');
    const down  = this._input.isAction('move_down');

    this.vx = 0;
    this.vy = 0;

    if (left)  this.vx -= SPEED;
    if (right) this.vx += SPEED;
    if (up)    this.vy -= SPEED;
    if (down)  this.vy += SPEED;

    // Normalize diagonal movement
    if (this.vx !== 0 && this.vy !== 0) {
      const INV_SQRT2 = 0.7071;
      this.vx *= INV_SQRT2;
      this.vy *= INV_SQRT2;
    }

    if (this.vx > 0) this.facing = 1;
    if (this.vx < 0) this.facing = -1;

    this._updateAnimState(this.vx, this.vy);
  }

  _updateAnimState(vx, vy) {
    const anim    = this.getComponent('animation');
    const moving  = vx !== 0 || vy !== 0;
    const current = anim.getState();

    if (current === 'fear') return; // let fear finish before transitioning

    anim.setState(moving ? 'walk' : 'idle');
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

    const rx = this.renderX(alpha);
    const ry = this.renderY(alpha);
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
      // Placeholder: blue rect for Mateo
      ctx.fillStyle = '#4A90D9';
      ctx.fillRect(Math.round(rx), Math.round(ry), this.width, this.height);
    }
  }
}
