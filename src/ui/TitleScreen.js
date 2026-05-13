import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const BLINK_MS = 600;

export class TitleScreen {
  constructor() {
    this._active   = false;
    this._resolve  = null;
    this._input    = null;
    this._hasSave  = false;
    this._selected = 0;       // 0 = Nueva partida, 1 = Continuar
    this._blink    = 0;
    this._showBlink = true;
  }

  inject({ input, hasSave = false } = {}) {
    if (input) this._input = input;
    this._hasSave = hasSave;
  }

  // Returns { newGame: bool } once the player makes a choice.
  start() {
    this._active   = true;
    this._selected = 0;
    this._blink    = 0;
    this._showBlink = true;
    return new Promise(resolve => { this._resolve = resolve; });
  }

  update(dt) {
    if (!this._active) return;

    this._blink += dt;
    if (this._blink >= BLINK_MS) { this._blink -= BLINK_MS; this._showBlink = !this._showBlink; }

    if (!this._input) return;

    if (this._hasSave) {
      if (this._input.wasPressed('move_up') || this._input.wasPressed('move_down')) {
        this._selected = this._selected === 0 ? 1 : 0;
      }
    }

    if (this._input.wasPressed('interact')) {
      const newGame = !this._hasSave || this._selected === 0;
      this._finish(newGame);
    }
  }

  render(ctx) {
    if (!this._active) return;

    // Background
    ctx.fillStyle = '#060410';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Subtle grid texture
    ctx.strokeStyle = 'rgba(155, 127, 232, 0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < BASE_WIDTH; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, BASE_HEIGHT); ctx.stroke(); }
    for (let y = 0; y < BASE_HEIGHT; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BASE_WIDTH, y); ctx.stroke(); }

    const cx = BASE_WIDTH / 2;

    // Title
    ctx.save();
    ctx.font      = '36px VT323, monospace';
    ctx.fillStyle = '#C8A9FF';
    ctx.shadowColor = 'rgba(155, 127, 232, 0.8)';
    ctx.shadowBlur  = 14;
    const titleW = ctx.measureText('GRIETAS').width;
    ctx.fillText('GRIETAS', Math.round(cx - titleW / 2), BASE_HEIGHT / 2 - 28);
    ctx.restore();

    // Subtitle
    ctx.save();
    ctx.font      = '10px VT323, monospace';
    ctx.fillStyle = 'rgba(200, 169, 255, 0.55)';
    const subText = 'Entre tú y el otro lado';
    const subW = ctx.measureText(subText).width;
    ctx.fillText(subText, Math.round(cx - subW / 2), BASE_HEIGHT / 2 - 10);
    ctx.restore();

    if (this._hasSave) {
      // Two options
      const opts = ['Nueva partida', 'Continuar'];
      opts.forEach((label, i) => {
        const text   = (i === this._selected ? '▶ ' : '  ') + label;
        const isSelected = i === this._selected;
        ctx.save();
        ctx.font      = '10px VT323, monospace';
        ctx.fillStyle = isSelected ? '#C8A9FF' : 'rgba(200,169,255,0.45)';
        if (isSelected) { ctx.shadowColor = 'rgba(155,127,232,0.5)'; ctx.shadowBlur = 6; }
        const w = ctx.measureText(text).width;
        ctx.fillText(text, Math.round(cx - w / 2), BASE_HEIGHT / 2 + 16 + i * 14);
        ctx.restore();
      });
      ctx.save();
      ctx.font      = '8px VT323, monospace';
      ctx.fillStyle = 'rgba(200,169,255,0.3)';
      const hint = '[↑↓] seleccionar   [E] confirmar';
      const hw = ctx.measureText(hint).width;
      ctx.fillText(hint, Math.round(cx - hw / 2), BASE_HEIGHT - 8);
      ctx.restore();
    } else {
      // Single prompt (blinking)
      if (this._showBlink) {
        ctx.save();
        ctx.font      = '10px VT323, monospace';
        ctx.fillStyle = 'rgba(200,169,255,0.7)';
        ctx.shadowColor = 'rgba(155,127,232,0.4)';
        ctx.shadowBlur  = 4;
        const prompt = 'Presiona E para comenzar';
        const pw = ctx.measureText(prompt).width;
        ctx.fillText(prompt, Math.round(cx - pw / 2), BASE_HEIGHT / 2 + 20);
        ctx.restore();
      }
    }
  }

  _finish(newGame) {
    this._active = false;
    const r = this._resolve;
    this._resolve = null;
    r?.(newGame);
  }
}
