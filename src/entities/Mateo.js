import { Entity } from './Entity.js';
import { AnimationComponent, buildAnimState } from '../systems/AnimationSystem.js';

const SPEED   = 1.5;
const WIDTH   = 10;   // collision box
const HEIGHT  = 14;   // collision box
const DRAW_W  = 28;   // visual size (frame is square 125×125)
const DRAW_H  = 28;

// Placeholder states (no spritesheet)
const PLACEHOLDER_STATES = {
  idle_front: buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 0, count: 1 }),
  idle_back:  buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 0, count: 1 }),
  idle_left:  buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 0, count: 1 }),
  idle_right: buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 0, count: 1 }),
  walk_front: buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 1, count: 4, frameDuration: 120 }),
  walk_back:  buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 1, count: 4, frameDuration: 120 }),
  walk_left:  buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 1, count: 4, frameDuration: 120 }),
  walk_right: buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 1, count: 4, frameDuration: 120 }),
  fear:       buildAnimState({ tileW: WIDTH, tileH: HEIGHT, row: 2, count: 2, frameDuration: 200, loop: false }),
};

// prota.png: 500×500, 4×4 grid → each frame 125×125
const FW = 125;
const FH = 125;

function buildMateoStates(sheet) {
  const frame = (col, row) => ({ sx: col * FW, sy: row * FH, sw: FW, sh: FH });
  const state = (frames, dur = 120) => ({ spritesheet: sheet, frames, frameDuration: dur, loop: true });

  const walkFront = [frame(0,0), frame(1,0), frame(2,0), frame(3,0)];
  const walkBack  = [frame(0,1), frame(1,1), frame(2,1), frame(3,1)];
  const walkLeft  = [frame(0,2), frame(1,2), frame(2,2)];
  const walkRight = [frame(3,2), frame(0,3), frame(1,3)];

  return {
    idle_front: state([frame(0,0)], 500),
    idle_back:  state([frame(0,1)], 500),
    idle_left:  state([frame(0,2)], 500),
    idle_right: state([frame(3,2)], 500),
    walk_front: state(walkFront),
    walk_back:  state(walkBack),
    walk_left:  state(walkLeft),
    walk_right: state(walkRight),
    fear:       { spritesheet: sheet, frames: [frame(0,0)], frameDuration: 200, loop: false },
  };
}

export class Mateo extends Entity {
  constructor(x, y) {
    super('mateo', x, y);
    this.width  = WIDTH;
    this.height = HEIGHT;

    this.facing   = 1;       // 1 = right, -1 = left (kept for compatibility)
    this._lastDir = 'front'; // last movement direction
    this._input     = null;
    this._collision = null;

    this.addComponent('animation', new AnimationComponent(PLACEHOLDER_STATES, 'idle_front'));
  }

  setInput(inputSystem)    { this._input     = inputSystem; }
  setCollision(collSystem) { this._collision = collSystem; }

  setSprite(img) {
    const anim = this.getComponent('animation');
    anim.states = buildMateoStates(img);
    anim.setState('idle_front');
  }

  // Legacy support for any external caller passing a states object
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

    if (this.vx !== 0 && this.vy !== 0) {
      const INV_SQRT2 = 0.7071;
      this.vx *= INV_SQRT2;
      this.vy *= INV_SQRT2;
    }

    // Direction priority: horizontal beats vertical
    if (left)       { this.facing = -1; this._lastDir = 'left'; }
    else if (right) { this.facing =  1; this._lastDir = 'right'; }
    else if (up)    { this._lastDir = 'back'; }
    else if (down)  { this._lastDir = 'front'; }

    this._updateAnimState(this.vx, this.vy);
  }

  _updateAnimState(vx, vy) {
    const anim    = this.getComponent('animation');
    const current = anim.getState();

    if (current === 'fear') return;

    const moving = vx !== 0 || vy !== 0;
    anim.setState(moving ? `walk_${this._lastDir}` : `idle_${this._lastDir}`);
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

    const rx    = this.renderX(alpha);
    const ry    = this.renderY(alpha);
    const anim  = this.getComponent('animation');
    const frame = anim?.currentFrame();

    if (frame?.spritesheet) {
      // Center the visual horizontally; align bottom with collision box bottom
      const dx = rx + (WIDTH - DRAW_W) / 2;
      const dy = ry + HEIGHT - DRAW_H;
      ctx.drawImage(frame.spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
        dx, dy, DRAW_W, DRAW_H);
    } else {
      ctx.fillStyle = '#4A90D9';
      ctx.fillRect(Math.round(rx), Math.round(ry), this.width, this.height);
    }
  }
}
