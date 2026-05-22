import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const BLINK_MS      = 600;
const SUBTITLE_FULL = 'Entre tú y el otro lado';
const TAGLINE_TEXT  = 'Ella siempre estuvo ahí.';

// Resolves with: 'new_game' | 'continue' | 'luna_mode'
export class TitleScreen {
  constructor() {
    this._active    = false;
    this._resolve   = null;
    this._input     = null;
    this._hasSave   = false;
    this._selected  = 0;
    this._blink     = 0;
    this._showBlink = true;

    // Background animation
    this._elapsed    = 0;
    this._particles  = [];
    this._riftBase   = [];
    this._riftMain   = [];
    this._riftVel    = [];
    this._riftBranches = [];
    this._lunaX      = -14;
    this._lunaFrame  = 0;
    this._lunaTimer  = 0;

    // Intro sequence
    this._subtitleChars = 0;
    this._subtitleDelay = 400;
    this._subtitleTimer = 0;
    this._taglinePhase  = 'wait'; // wait | fadein | hold | fadeout | done
    this._taglineTimer  = 0;
    this._taglineAlpha  = 0;
    this._menuReady     = false;

    this._initParticles();
    this._initRift();
  }

  inject({ input, hasSave = false, saveSystem = null } = {}) {
    if (input) this._input = input;
    this._hasSave = hasSave;
    this._saveSystem = saveSystem;
  }

  // Returns a promise that resolves with 'new_game' | 'continue' | 'luna_mode'
  start() {
    this._active    = true;
    this._selected  = 0;
    this._blink     = 0;
    this._showBlink = true;

    this._elapsed       = 0;
    this._lunaX         = -14;
    this._lunaFrame     = 0;
    this._lunaTimer     = 0;
    this._subtitleChars = 0;
    this._subtitleDelay = 400;
    this._subtitleTimer = 0;
    this._taglinePhase  = 'wait';
    this._taglineTimer  = 0;
    this._taglineAlpha  = 0;
    this._menuReady     = false;

    return new Promise(resolve => { this._resolve = resolve; });
  }

  // ── Init helpers ─────────────────────────────────────────────────────────────

  _initParticles() {
    this._particles = [];
    for (let i = 0; i < 25; i++) this._particles.push(this._makeParticle(true));
  }

  _makeParticle(scatter = false) {
    const colors = ['155,100,255', '100,130,255', '200,169,255', '120,80,220'];
    return {
      x:     Math.random() * BASE_WIDTH,
      y:     scatter ? Math.random() * BASE_HEIGHT : BASE_HEIGHT + 4,
      dy:    0.1 + Math.random() * 0.25,
      r:     0.5 + Math.random() * 1.0,
      alpha: 0.2 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  _initRift() {
    const cx   = BASE_WIDTH / 2;
    const yTop = Math.round(BASE_HEIGHT * 0.14);
    const yBot = Math.round(BASE_HEIGHT * 0.86);
    const segs = 10;
    const segH = (yBot - yTop) / segs;

    this._riftBase = [{ x: cx, y: yTop }];
    let curX = cx;
    for (let i = 1; i <= segs; i++) {
      curX += (Math.random() - 0.5) * 16;
      curX  = Math.max(cx - 20, Math.min(cx + 20, curX));
      this._riftBase.push({ x: curX, y: yTop + segH * i });
    }

    this._riftMain = this._riftBase.map(p => ({ ...p }));
    this._riftVel  = this._riftBase.map(() => 0);

    this._riftBranches = [];
    for (const idx of [2, 5, 8]) {
      const o   = this._riftBase[idx];
      const dir = Math.random() > 0.5 ? 1 : -1;
      const a1  = dir * (0.55 + Math.random() * 0.45);
      const a2  = dir * (0.28 + Math.random() * 0.28);
      const l1  = 13 + Math.random() * 15;
      const l2  = l1 * (0.4 + Math.random() * 0.25);
      this._riftBranches.push({
        ox: o.x, oy: o.y,
        x1: o.x + Math.cos(a1) * l1, y1: o.y + Math.sin(a1) * l1,
        x2: o.x + Math.cos(a2) * l2, y2: o.y + Math.sin(a2) * l2,
      });
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────────

  update(dt) {
    if (!this._active) return;

    this._elapsed += dt;
    this._updateParticles(dt);
    this._updateLuna(dt);
    this._updateTypewriter(dt);
    this._updateTagline(dt);

    this._blink += dt;
    if (this._blink >= BLINK_MS) { this._blink -= BLINK_MS; this._showBlink = !this._showBlink; }

    if (!this._input) return;

    // E / Space: skip intro or confirm selection
    if (this._input.wasPressed('interact')) {
      if (!this._menuReady) {
        this._menuReady     = true;
        this._subtitleChars = SUBTITLE_FULL.length;
        this._taglinePhase  = 'done';
        this._taglineAlpha  = 0;
        return;
      }
      this._confirm();
    }

    if (this._menuReady) {
      const opts = this._options();
      if (this._input.wasPressed('move_up')) {
        this._selected = (this._selected - 1 + opts.length) % opts.length;
      }
      if (this._input.wasPressed('move_down')) {
        this._selected = (this._selected + 1) % opts.length;
      }
    }
  }

  // Returns the list of menu options based on save state
  _options() {
    const opts = this._hasSave
      ? ['Nueva partida', 'Continuar', 'Modo Luna']
      : ['Nueva partida', 'Modo Luna'];
    // Add Capítulo 0 post-ending if unlocked
    if (this._saveSystem?.getFlag('chapter_umbral_unlocked', false)) {
      opts.push('Capítulo 0 — El Eco Inicial');
    }
    return opts;
  }

  _confirm() {
    const opts  = this._options();
    const label = opts[this._selected];
    if (label === 'Continuar')    { this._finish('continue');  return; }
    if (label === 'Modo Luna')    { this._finish('luna_mode'); return; }
    if (label === 'Capítulo 0 — El Eco Inicial') { this._finish('chapter0'); return; }
    this._finish('new_game');
  }

  _updateParticles(dt) {
    const step = dt / 16.67;
    for (const p of this._particles) {
      p.y -= p.dy * step;
      if (p.y < -4) Object.assign(p, this._makeParticle(false));
    }
    const cx = BASE_WIDTH / 2;
    for (let i = 1; i < this._riftMain.length - 1; i++) {
      this._riftVel[i] += (Math.random() - 0.5) * 0.09;
      this._riftVel[i] *= 0.87;
      this._riftMain[i].x = this._riftBase[i].x + this._riftVel[i] * 5;
      this._riftMain[i].x = Math.max(cx - 24, Math.min(cx + 24, this._riftMain[i].x));
    }
  }

  _updateLuna(dt) {
    this._lunaX += 0.3 * (dt / 16.67);
    if (this._lunaX > BASE_WIDTH + 14) this._lunaX = -14;
    this._lunaTimer += dt;
    if (this._lunaTimer >= 2500) { this._lunaTimer -= 2500; this._lunaFrame ^= 1; }
  }

  _updateTypewriter(dt) {
    if (this._subtitleChars >= SUBTITLE_FULL.length) return;
    if (this._subtitleDelay > 0) { this._subtitleDelay -= dt; return; }
    this._subtitleTimer += dt;
    this._subtitleChars = Math.min(Math.floor(this._subtitleTimer / 80), SUBTITLE_FULL.length);
  }

  _updateTagline(dt) {
    if (this._subtitleChars < SUBTITLE_FULL.length) return;
    switch (this._taglinePhase) {
      case 'wait':
        this._taglineTimer += dt;
        if (this._taglineTimer >= 300) { this._taglineTimer = 0; this._taglinePhase = 'fadein'; }
        break;
      case 'fadein':
        this._taglineTimer += dt;
        this._taglineAlpha = Math.min(1, this._taglineTimer / 300);
        if (this._taglineTimer >= 300) { this._taglineTimer = 0; this._taglinePhase = 'hold'; }
        break;
      case 'hold':
        this._taglineTimer += dt;
        if (this._taglineTimer >= 2200) { this._taglineTimer = 0; this._taglinePhase = 'fadeout'; }
        break;
      case 'fadeout':
        this._taglineTimer += dt;
        this._taglineAlpha = Math.max(0, 1 - this._taglineTimer / 300);
        if (this._taglineTimer >= 300) {
          this._taglinePhase = 'done';
          this._taglineAlpha = 0;
          this._menuReady    = true;
        }
        break;
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  render(ctx) {
    if (!this._active) return;

    ctx.fillStyle = '#060410';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    ctx.strokeStyle = 'rgba(155, 127, 232, 0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < BASE_WIDTH; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, BASE_HEIGHT); ctx.stroke(); }
    for (let y = 0; y < BASE_HEIGHT; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BASE_WIDTH, y); ctx.stroke(); }

    this._renderBg(ctx);

    const cx = BASE_WIDTH / 2;

    // Title
    ctx.save();
    ctx.font        = '36px VT323, monospace';
    ctx.fillStyle   = '#C8A9FF';
    ctx.shadowColor = 'rgba(155, 127, 232, 0.8)';
    ctx.shadowBlur  = 14;
    const titleW = ctx.measureText('GRIETAS').width;
    ctx.fillText('GRIETAS', Math.round(cx - titleW / 2), BASE_HEIGHT / 2 - 28);
    ctx.restore();

    // Subtitle (typewriter)
    const subText = SUBTITLE_FULL.slice(0, this._subtitleChars);
    if (subText.length > 0) {
      ctx.save();
      ctx.font      = '10px VT323, monospace';
      ctx.fillStyle = 'rgba(200, 169, 255, 0.55)';
      const subW = ctx.measureText(subText).width;
      ctx.fillText(subText, Math.round(cx - subW / 2), BASE_HEIGHT / 2 - 10);
      ctx.restore();
    }

    // Tagline (ephemeral)
    if (this._taglineAlpha > 0) {
      ctx.save();
      ctx.font        = '9px VT323, monospace';
      ctx.fillStyle   = `rgba(200, 169, 255, ${(this._taglineAlpha * 0.65).toFixed(3)})`;
      ctx.shadowColor = 'rgba(155, 127, 232, 0.3)';
      ctx.shadowBlur  = 3;
      const tw = ctx.measureText(TAGLINE_TEXT).width;
      ctx.fillText(TAGLINE_TEXT, Math.round(cx - tw / 2), BASE_HEIGHT / 2 + 6);
      ctx.restore();
    }

    if (!this._menuReady) return;

    // Menu options
    const opts = this._options();
    opts.forEach((label, i) => {
      const text       = (i === this._selected ? '▶ ' : '  ') + label;
      const isSelected = i === this._selected;
      const isLuna     = label === 'Modo Luna';
      const isCh0      = label === 'Capítulo 0 — El Eco Inicial';
      ctx.save();
      ctx.font = '10px VT323, monospace';
      if (isSelected) {
        ctx.fillStyle   = isLuna ? '#C8F5FF' : isCh0 ? '#FFD97D' : '#C8A9FF';
        ctx.shadowColor = isLuna ? 'rgba(100,200,255,0.5)' : isCh0 ? 'rgba(255,217,125,0.5)' : 'rgba(155,127,232,0.5)';
        ctx.shadowBlur  = 6;
      } else {
        ctx.fillStyle = isCh0 ? 'rgba(255,217,125,0.5)' : 'rgba(200,169,255,0.42)';
      }
      const w = ctx.measureText(text).width;
      const baseY = BASE_HEIGHT / 2 + 14;
      ctx.fillText(text, Math.round(cx - w / 2), baseY + i * 14);
      ctx.restore();
    });

    // Controls hint
    ctx.save();
    ctx.font      = '8px VT323, monospace';
    ctx.fillStyle = 'rgba(200,169,255,0.3)';
    const hint = '[↑↓] seleccionar   [E] confirmar';
    const hw   = ctx.measureText(hint).width;
    ctx.fillText(hint, Math.round(cx - hw / 2), BASE_HEIGHT - 8);
    ctx.restore();
  }

  _renderBg(ctx) {
    // Particles
    for (const p of this._particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = `rgb(${p.color})`;
      ctx.beginPath();
      ctx.arc(Math.round(p.x), Math.round(p.y), p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Rift fracture — jagged with branches and triple glow
    const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this._elapsed / 700));

    const strokePath = (pts, lineW, alpha) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = `rgba(200, 169, 255, ${(alpha * pulse).toFixed(3)})`;
      ctx.lineWidth   = lineW;
      ctx.stroke();
    };

    ctx.save();
    ctx.lineJoin    = 'miter';
    ctx.shadowColor = 'rgba(200, 169, 255, 0.95)';
    ctx.shadowBlur  = 10 + 9 * pulse;
    strokePath(this._riftMain, 5.5, 0.07);
    strokePath(this._riftMain, 2.5, 0.25);
    strokePath(this._riftMain, 0.8, 0.90);
    for (const b of this._riftBranches) {
      const tip1 = [{ x: b.ox, y: b.oy }, { x: b.x1, y: b.y1 }];
      const tip2 = [{ x: b.ox, y: b.oy }, { x: b.x2, y: b.y2 }];
      strokePath(tip1, 2.5, 0.10);
      strokePath(tip1, 0.8, 0.60);
      strokePath(tip2, 0.6, 0.38);
    }
    ctx.restore();

    // Luna silhouette walking along bottom
    const lx = Math.round(this._lunaX);
    const ly = Math.round(BASE_HEIGHT - 20 - (this._lunaFrame === 1 ? 1 : 0));
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle   = '#C8A9FF';
    ctx.fillRect(lx,      ly + 2, 10, 5);
    ctx.fillRect(lx + 1,  ly,      2, 2);
    ctx.fillRect(lx + 7,  ly,      2, 2);
    ctx.fillRect(lx + 10, ly + 4,  2, 1);
    ctx.restore();
  }

  _finish(mode) {
    this._active = false;
    const r = this._resolve;
    this._resolve = null;
    r?.(mode);
  }
}
