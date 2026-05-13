import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const CARDS = [
  { text: 'Miraloma.',                                          hold: 2000 },
  { text: '3 de la mañana.',                                   hold: 1800 },
  { text: 'Tu gata lleva seis años contigo.',                   hold: 2400 },
  { text: 'Esta noche desapareció durante la tormenta.',        hold: 3000 },
];

const FADE_MS = 700;
const FONT    = '10px VT323, monospace';

export class PrologueScreen {
  constructor() {
    this._active    = false;
    this._cardIndex = 0;
    this._phase     = 'idle';
    this._elapsed   = 0;
    this._alpha     = 0;
    this._resolve   = null;
    this._input     = null;
  }

  inject({ input } = {}) {
    if (input) this._input = input;
  }

  // Returns a Promise that resolves when all cards finish.
  start() {
    this._active    = true;
    this._cardIndex = 0;
    this._phase     = 'fade_in';
    this._elapsed   = 0;
    this._alpha     = 0;
    return new Promise(resolve => { this._resolve = resolve; });
  }

  update(dt) {
    if (!this._active) return;

    const skip = this._input?.wasPressed('interact') ?? false;
    this._elapsed += dt;

    if (this._phase === 'fade_in') {
      this._alpha = Math.min(1, this._elapsed / FADE_MS);
      if (this._elapsed >= FADE_MS || skip) {
        this._alpha   = 1;
        this._phase   = 'hold';
        this._elapsed = 0;
      }
    } else if (this._phase === 'hold') {
      if (this._elapsed >= CARDS[this._cardIndex].hold || skip) {
        this._phase   = 'fade_out';
        this._elapsed = 0;
      }
    } else if (this._phase === 'fade_out') {
      this._alpha = Math.max(0, 1 - this._elapsed / FADE_MS);
      if (this._elapsed >= FADE_MS) {
        this._cardIndex++;
        if (this._cardIndex >= CARDS.length) {
          this._finish();
        } else {
          this._phase   = 'fade_in';
          this._elapsed = 0;
          this._alpha   = 0;
        }
      }
    }
  }

  render(ctx) {
    if (!this._active) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    const card = CARDS[this._cardIndex];
    if (!card || this._alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this._alpha;
    ctx.font        = FONT;
    ctx.fillStyle   = '#C8A9FF';
    ctx.shadowColor = 'rgba(155, 127, 232, 0.5)';
    ctx.shadowBlur  = 8;
    const w = ctx.measureText(card.text).width;
    ctx.fillText(card.text,
      Math.round((BASE_WIDTH - w) / 2),
      Math.round(BASE_HEIGHT / 2) + 4);
    ctx.restore();
  }

  _finish() {
    this._active = false;
    const r = this._resolve;
    this._resolve = null;
    r?.();
  }
}
