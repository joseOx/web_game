import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const HINT_ENTER = '[E]  entrar a la grieta';
const HINT_EXIT  = '[E]  salir del Vacío';
const FADE_SPEED = 3.5;
const FONT       = '10px VT323, monospace';

export class HintSystem {
  constructor() {
    this._alpha   = 0;
    this._target  = 0;
    this._message = '';

    this._rifts     = null;
    this._dimension = null;
    this._vision    = null;
    this._dialogue  = null;
    this._mateo     = null;
  }

  inject({ rifts, dimension, vision, dialogue, mateo } = {}) {
    if (rifts)     this._rifts     = rifts;
    if (dimension) this._dimension = dimension;
    if (vision)    this._vision    = vision;
    if (dialogue)  this._dialogue  = dialogue;
    if (mateo)     this._mateo     = mateo;
  }

  update(dt) {
    if (this._dialogue?.isVisible()) {
      this._target = 0;
    } else {
      const nearRift    = this._rifts?.nearestUnsealedInRange(
        this._mateo.centerX(), this._mateo.centerY(), 48) ?? null;
      const inVoid      = this._dimension?.isVoid() ?? false;
      const riftVisible = inVoid || (this._vision?.active ?? false);

      if (nearRift && inVoid) {
        this._message = HINT_EXIT;
        this._target  = 1;
      } else if (nearRift && riftVisible) {
        this._message = HINT_ENTER;
        this._target  = 1;
      } else {
        this._target = 0;
      }
    }

    const dir   = this._target > this._alpha ? 1 : -1;
    this._alpha = Math.max(0, Math.min(1,
      this._alpha + dir * FADE_SPEED * (dt / 1000)));
  }

  render(ctx) {
    if (this._alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this._alpha;
    ctx.font        = FONT;

    const textW = ctx.measureText(this._message).width;
    const boxW  = textW + 12;
    const boxH  = 13;
    const bx    = (BASE_WIDTH - boxW) / 2;
    const by    = BASE_HEIGHT - 28;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(Math.round(bx), by, Math.round(boxW), boxH);

    ctx.fillStyle     = '#FFFFFF';
    ctx.shadowColor   = 'rgba(0,0,0,0.9)';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(this._message, Math.round(bx + 6), by + 10);

    ctx.restore();
  }
}
