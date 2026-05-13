import { Entity } from './Entity.js';
import { AnimationComponent, buildAnimState } from '../systems/AnimationSystem.js';

// Collision boxes (kept small for tight gameplay feel)
const WIDTH_REAL  = 14;
const HEIGHT_REAL = 10;
const WIDTH_VOID  = 14;
const HEIGHT_VOID = 12;

// Visual draw sizes (larger than collision so sprites have more detail)
const DRAW_W_REAL = 24;
const DRAW_H_REAL = 20;
const DRAW_W_VOID = 30;
const DRAW_H_VOID = 26;

const FOLLOW_STOP_DIST = 20;    // px — distance at which Luna stops following
const FOLLOW_SPEED_MIN = 1.0;   // px/step — minimum follow speed
const FOLLOW_SPEED_MAX = 2.2;   // px/step — maximum follow speed when far away
const FOLLOW_ACCEL_DIST = 80;   // px — distance where max speed kicks in

// 2-col × 2-row sprite sheet: col 0 = idle, col 1 = walk (2 frames each)
function buildCatStates(sheet, fw, fh, idleDur = 500, walkDur = 180) {
  return {
    idle: {
      spritesheet: sheet,
      frames: [
        { sx: 0,  sy: 0,  sw: fw, sh: fh },
        { sx: 0,  sy: fh, sw: fw, sh: fh },
      ],
      frameDuration: idleDur,
      loop: true,
    },
    walk: {
      spritesheet: sheet,
      frames: [
        { sx: fw, sy: 0,  sw: fw, sh: fh },
        { sx: fw, sy: fh, sw: fw, sh: fh },
      ],
      frameDuration: walkDur,
      loop: true,
    },
    purrSeal: {
      spritesheet: sheet,
      frames: [
        { sx: 0,  sy: 0,  sw: fw, sh: fh },
        { sx: 0,  sy: fh, sw: fw, sh: fh },
      ],
      frameDuration: 300,
      loop: true,
    },
  };
}

// Real sprite: 2 cols × 2 rows, each frame 85×68 px
const CAT_FW = 85;
const CAT_FH = 68;

function buildCatRealStates(sheet) {
  return buildCatStates(sheet, CAT_FW, CAT_FH);
}

function buildCatVoidStates(sheet) {
  const fw = sheet.naturalWidth  / 2;
  const fh = sheet.naturalHeight / 2;
  return buildCatStates(sheet, fw, fh, 600, 200);
}

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

  setRealSprite(img) {
    this._catRealStates = buildCatRealStates(img);
    if (this.dimension === 'real') {
      const anim = this.getComponent('animation');
      anim.states = this._catRealStates;
      anim.setState('idle');
    }
  }

  setVoidSprite(img) {
    this._catVoidStates = buildCatVoidStates(img);
    if (this.dimension === 'void') {
      const anim = this.getComponent('animation');
      anim.states = this._catVoidStates;
      anim.setState('idle');
    }
  }

  setDimension(dim) {
    if (dim === this.dimension) return;
    this.dimension = dim;
    this._applyDimension();
    const anim = this.getComponent('animation');
    if (dim === 'void') {
      anim.states = this._catVoidStates ?? { ...PLACEHOLDER_STATES_VOID };
    } else {
      anim.states = this._catRealStates ?? { ...PLACEHOLDER_STATES_REAL };
    }
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

    const rx  = this.renderX(alpha);
    const ry  = this.renderY(alpha);
    const isVoid = this.dimension === 'void';
    const dw  = isVoid ? DRAW_W_VOID : DRAW_W_REAL;
    const dh  = isVoid ? DRAW_H_VOID : DRAW_H_REAL;

    // Bottom-center the visual on the collision box
    const dx = Math.round(rx + (this.width - dw) / 2);
    const dy = Math.round(ry + this.height - dh);

    const anim  = this.getComponent('animation');
    const frame = anim?.currentFrame();

    if (frame?.spritesheet) {
      ctx.save();
      if (this.facing === 1) {
        ctx.translate(dx + dw / 2, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(frame.spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
          -dw / 2, 0, dw, dh);
      } else {
        ctx.drawImage(frame.spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
          dx, dy, dw, dh);
      }
      ctx.restore();
    } else {
      // Placeholder
      if (isVoid) {
        // Glowing void silhouette
        ctx.save();
        ctx.shadowColor = '#9B7FE8';
        ctx.shadowBlur  = 6;
        ctx.fillStyle   = '#7A5FCC';
        ctx.beginPath();
        ctx.ellipse(dx + dw / 2, dy + dh * 0.6, dw * 0.38, dh * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        // ears
        ctx.beginPath();
        ctx.moveTo(dx + dw * 0.25, dy + dh * 0.25);
        ctx.lineTo(dx + dw * 0.15, dy + dh * 0.05);
        ctx.lineTo(dx + dw * 0.38, dy + dh * 0.22);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(dx + dw * 0.62, dy + dh * 0.22);
        ctx.lineTo(dx + dw * 0.85, dy + dh * 0.05);
        ctx.lineTo(dx + dw * 0.75, dy + dh * 0.25);
        ctx.fill();
        // eyes
        ctx.shadowBlur  = 4;
        ctx.shadowColor = '#E0D0FF';
        ctx.fillStyle   = '#D8C8FF';
        ctx.beginPath();
        ctx.ellipse(dx + dw * 0.38, dy + dh * 0.48, 2, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(dx + dw * 0.62, dy + dh * 0.48, 2, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(Math.round(rx), Math.round(ry), this.width, this.height);
      }
    }
  }
}
