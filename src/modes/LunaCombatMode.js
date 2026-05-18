import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const ARENA_PAD  = 22;
const LUNA_SPEED = 2.2;
const HISS_RANGE = 42;
const HISS_CD    = 750;   // ms cooldown between hisses
const BOND_MAX   = 100;
const DMG_HIT    = 20;    // bond damage when enemy reaches center

const EMOTION_COLORS = {
  grief:   '#3B5EA6',
  guilt:   '#4A7C59',
  fear:    '#D4B483',
  anger:   '#9E3A3A',
  longing: '#7B5EA7',
};

// 3 waves: normal → harder → mini-boss
const WAVES = [
  [
    { emotion: 'grief',   hp: 1, spd: 0.55, r: 5 },
    { emotion: 'fear',    hp: 1, spd: 0.65, r: 5 },
    { emotion: 'anger',   hp: 1, spd: 0.70, r: 4 },
    { emotion: 'guilt',   hp: 1, spd: 0.60, r: 5 },
  ],
  [
    { emotion: 'anger',   hp: 2, spd: 0.85, r: 6 },
    { emotion: 'longing', hp: 1, spd: 0.70, r: 5 },
    { emotion: 'fear',    hp: 2, spd: 0.80, r: 4 },
    { emotion: 'grief',   hp: 1, spd: 0.95, r: 5 },
    { emotion: 'guilt',   hp: 2, spd: 0.65, r: 5 },
    { emotion: 'anger',   hp: 1, spd: 0.90, r: 4 },
  ],
  [
    { emotion: 'longing', hp: 5, spd: 0.45, r: 14, boss: true },
  ],
];

function _spawnEdge() {
  const pad  = ARENA_PAD + 6;
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: return { x: pad + Math.random() * (BASE_WIDTH  - pad * 2), y: pad };
    case 1: return { x: BASE_WIDTH  - pad, y: pad + Math.random() * (BASE_HEIGHT - pad * 2) };
    case 2: return { x: pad + Math.random() * (BASE_WIDTH  - pad * 2), y: BASE_HEIGHT - pad };
    default: return { x: pad, y: pad + Math.random() * (BASE_HEIGHT - pad * 2) };
  }
}

// ── LunaCombatMode ────────────────────────────────────────────────────────────

export class LunaCombatMode {
  constructor() {
    this.active   = false;
    this._resolve = null;

    this._input     = null;
    this._particles = null;
    this._audio     = null;

    // Luna state
    this._lx      = 0;
    this._ly      = 0;
    this._facing  = 1;
    this._hissCD  = 0;
    this._hissVis = 0;  // hiss ring visibility timer

    // Game state
    this._bond      = BOND_MAX;
    this._waveIdx   = 0;
    this._enemies   = [];
    this._phase     = 'intro';   // intro | wave | between | win | lose
    this._phaseT    = 0;
    this._waveDefs  = WAVES;     // active wave configuration (swappable per encounter)
    this._titleText    = 'Protege a Mateo';
    this._subtitleText = 'Los Ecos se acercan…';

    // Screen shake
    this._shakeX = 0;
    this._shakeY = 0;
    this._shakeT = 0;
  }

  inject({ input, particles, audio } = {}) {
    if (input)     this._input     = input;
    if (particles) this._particles = particles;
    if (audio)     this._audio     = audio;
  }

  // Start with default waves and labels (used by title screen Modo Luna)
  start() {
    return this.startEncounter({});
  }

  // Start a narrative encounter with custom waves and flavour text
  startEncounter({ title, subtitle, wavesDef } = {}) {
    this._titleText    = title    ?? 'Protege a Mateo';
    this._subtitleText = subtitle ?? 'Los Ecos se acercan…';
    this._waveDefs     = wavesDef ?? WAVES;

    this.active   = true;
    this._bond    = BOND_MAX;
    this._waveIdx = 0;
    this._lx      = BASE_WIDTH  / 2;
    this._ly      = BASE_HEIGHT / 2;
    this._facing  = 1;
    this._hissCD  = 0;
    this._hissVis = 0;
    this._enemies = [];
    this._phase   = 'intro';
    this._phaseT  = 0;
    this._shakeX  = 0;
    this._shakeY  = 0;
    this._shakeT  = 0;
    return new Promise(r => { this._resolve = r; });
  }

  // ── Update ────────────────────────────────────────────────────────────────────

  update(dt) {
    if (!this.active) return;

    this._phaseT  += dt;
    this._hissCD   = Math.max(0, this._hissCD  - dt);
    this._hissVis  = Math.max(0, this._hissVis - dt);
    this._updateShake(dt);

    switch (this._phase) {
      case 'intro':
        if (this._phaseT >= 1800) this._beginWave(0);
        break;
      case 'wave':
        this._tickWave(dt);
        break;
      case 'between':
        if (this._phaseT >= 1300) this._beginWave(this._waveIdx);
        break;
      case 'win':
        if (this._phaseT >= 2800) this._done('win');
        break;
      case 'lose':
        if (this._phaseT >= 2800) this._done('lose');
        break;
    }
  }

  _beginWave(idx) {
    this._waveIdx = idx;
    this._phase   = 'wave';
    this._phaseT  = 0;
    this._enemies = this._waveDefs[idx].map(def => {
      const pos = _spawnEdge();
      return {
        x: pos.x, y: pos.y,
        hp: def.hp, maxHp: def.hp,
        spd: def.spd,
        r:   def.r,
        color: EMOTION_COLORS[def.emotion],
        boss: !!def.boss,
        flash: 0,
        dead: false,
      };
    });
  }

  _tickWave(dt) {
    if (!this._input) return;

    // Luna movement
    const ml = this._input.isAction('move_left');
    const mr = this._input.isAction('move_right');
    const mu = this._input.isAction('move_up');
    const md = this._input.isAction('move_down');
    let vx = 0, vy = 0;
    if (ml) vx -= LUNA_SPEED;
    if (mr) vx += LUNA_SPEED;
    if (mu) vy -= LUNA_SPEED;
    if (md) vy += LUNA_SPEED;
    if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }

    this._lx = Math.max(ARENA_PAD + 6, Math.min(BASE_WIDTH  - ARENA_PAD - 6, this._lx + vx));
    this._ly = Math.max(ARENA_PAD + 6, Math.min(BASE_HEIGHT - ARENA_PAD - 6, this._ly + vy));
    if (vx !== 0) this._facing = vx > 0 ? 1 : -1;

    // Hiss attack (E / Space)
    if (this._input.wasPressed('interact') && this._hissCD <= 0) {
      this._hissCD  = HISS_CD;
      this._hissVis = 320;
      this._audio?.playTone(440, 0.25, 'sine', 0.10);

      for (const e of this._enemies) {
        if (e.dead) continue;
        if (Math.hypot(e.x - this._lx, e.y - this._ly) <= HISS_RANGE + e.r) {
          e.hp    -= 1;
          e.flash  = 180;
          if (e.hp <= 0) {
            e.dead = true;
            this._particles?.emit(e.x, e.y, e.color, e.boss ? 24 : 10);
            this._audio?.playTone(660, 0.3, 'sine', 0.12);
            this._shake(e.boss ? 5 : 2);
          }
        }
      }
    }

    // Move enemies toward center
    const cx = BASE_WIDTH / 2, cy = BASE_HEIGHT / 2;
    for (const e of this._enemies) {
      if (e.dead) continue;
      e.flash = Math.max(0, e.flash - dt);

      const dx   = cx - e.x;
      const dy   = cy - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        e.x += (dx / dist) * e.spd;
        e.y += (dy / dist) * e.spd;
      }

      // Enemy reaches center → bond damage
      if (dist < 8 + e.r) {
        e.dead      = true;
        this._bond  = Math.max(0, this._bond - DMG_HIT);
        this._shake(4);
        this._audio?.playTone(220, 0.4, 'sawtooth', 0.08);
        if (this._bond <= 0) {
          this._phase  = 'lose';
          this._phaseT = 0;
          return;
        }
      }
    }

    // Check wave cleared
    if (this._enemies.every(e => e.dead)) {
      const next = this._waveIdx + 1;
      if (next < this._waveDefs.length) {
        this._phase   = 'between';
        this._phaseT  = 0;
        this._waveIdx = next;
      } else {
        this._phase  = 'win';
        this._phaseT = 0;
        this._audio?.playTone(880, 1.0, 'sine', 0.10);
      }
    }
  }

  _shake(intensity) {
    this._shakeT = 180;
    this._shakeX = (Math.random() - 0.5) * intensity * 2;
    this._shakeY = (Math.random() - 0.5) * intensity * 2;
  }

  _updateShake(dt) {
    if (this._shakeT <= 0) { this._shakeX = 0; this._shakeY = 0; return; }
    this._shakeT -= dt;
    this._shakeX  = (Math.random() - 0.5) * 3;
    this._shakeY  = (Math.random() - 0.5) * 3;
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(Math.round(this._shakeX), Math.round(this._shakeY));

    this._drawArena(ctx);
    this._drawEnemies(ctx);
    this._particles?.render(ctx);
    this._drawLuna(ctx);
    this._drawHUD(ctx);
    this._drawPhaseText(ctx);

    ctx.restore();
  }

  _drawArena(ctx) {
    // Background
    ctx.fillStyle = '#050312';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Grid lines
    ctx.strokeStyle = 'rgba(100,70,180,0.10)';
    ctx.lineWidth = 0.5;
    for (let x = ARENA_PAD; x <= BASE_WIDTH  - ARENA_PAD; x += 12) {
      ctx.beginPath(); ctx.moveTo(x, ARENA_PAD); ctx.lineTo(x, BASE_HEIGHT - ARENA_PAD); ctx.stroke();
    }
    for (let y = ARENA_PAD; y <= BASE_HEIGHT - ARENA_PAD; y += 12) {
      ctx.beginPath(); ctx.moveTo(ARENA_PAD, y); ctx.lineTo(BASE_WIDTH - ARENA_PAD, y); ctx.stroke();
    }

    // Arena border
    ctx.strokeStyle = 'rgba(150,100,255,0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ARENA_PAD, ARENA_PAD, BASE_WIDTH - ARENA_PAD * 2, BASE_HEIGHT - ARENA_PAD * 2);

    // Center — Mateo's essence (pulsing ring)
    const cx = BASE_WIDTH / 2, cy = BASE_HEIGHT / 2;
    const p  = 0.28 + 0.18 * Math.sin(performance.now() / 420);
    ctx.strokeStyle = `rgba(74,144,217,${p})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = `rgba(74,144,217,${p * 0.35})`;
    ctx.beginPath(); ctx.arc(cx, cy,  6, 0, Math.PI * 2); ctx.fill();
  }

  _drawEnemies(ctx) {
    for (const e of this._enemies) {
      if (e.dead) continue;

      ctx.save();
      ctx.fillStyle   = e.flash > 0 ? '#ffffff' : e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur  = e.boss ? 14 : 7;
      ctx.beginPath();
      ctx.arc(Math.round(e.x), Math.round(e.y), e.r, 0, Math.PI * 2);
      ctx.fill();

      if (e.boss) {
        ctx.strokeStyle = 'rgba(200,169,255,0.70)';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.arc(Math.round(e.x), Math.round(e.y), e.r + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // HP bar for multi-hit enemies
      if (e.maxHp > 1) {
        const bw = e.r * 2 + 4;
        const bx = e.x - bw / 2;
        const by = e.y - e.r - 5;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(Math.round(bx), Math.round(by), bw, 2);
        ctx.fillStyle = e.color;
        ctx.fillRect(Math.round(bx), Math.round(by), Math.round(bw * e.hp / e.maxHp), 2);
      }
    }
  }

  _drawLuna(ctx) {
    const lx = Math.round(this._lx);
    const ly = Math.round(this._ly);

    // Hiss range ring
    if (this._hissVis > 0) {
      const a = this._hissVis / 320;
      ctx.save();
      ctx.globalAlpha = a * 0.42;
      ctx.strokeStyle = '#C8A9FF';
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = '#C8A9FF';
      ctx.shadowBlur  = 9;
      ctx.beginPath();
      ctx.arc(lx, ly, HISS_RANGE, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Cat pixel art (flip horizontally when facing left)
    ctx.save();
    if (this._facing < 0) { ctx.translate(lx * 2, 0); ctx.scale(-1, 1); }
    ctx.fillStyle   = '#C8A9FF';
    ctx.shadowColor = 'rgba(200,169,255,0.9)';
    ctx.shadowBlur  = 9;
    ctx.fillRect(lx - 6, ly - 2, 12,  7);  // body
    ctx.fillRect(lx - 5, ly - 6,  3,  3);  // left ear
    ctx.fillRect(lx + 2,  ly - 6, 3,  3);  // right ear
    ctx.fillRect(lx + 6,  ly + 3, 3,  2);  // tail base
    ctx.fillRect(lx + 8,  ly + 1, 2,  2);  // tail tip
    ctx.fillStyle = '#060410';
    ctx.fillRect(lx - 3, ly,      2,  2);  // left eye
    ctx.fillRect(lx + 1, ly,      2,  2);  // right eye
    ctx.restore();

    // Hiss cooldown arc
    if (this._hissCD > 0) {
      const frac = 1 - this._hissCD / HISS_CD;
      ctx.save();
      ctx.strokeStyle = 'rgba(200,169,255,0.35)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(lx, ly, 10, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawHUD(ctx) {
    // Wave label (top-left)
    ctx.save();
    ctx.font      = '8px VT323, monospace';
    ctx.fillStyle = 'rgba(200,169,255,0.65)';
    ctx.fillText(`Ola ${this._waveIdx + 1} / ${this._waveDefs.length}`, ARENA_PAD + 4, ARENA_PAD + 10);
    ctx.restore();

    // Bond (HP) bar (top-right)
    const bw = 60, bx = BASE_WIDTH - ARENA_PAD - bw - 2, by = ARENA_PAD + 4;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, by, bw, 4);
    const frac = this._bond / BOND_MAX;
    ctx.fillStyle = frac > 0.5 ? '#5DBB63' : frac > 0.25 ? '#E8B94F' : '#9E3A3A';
    ctx.fillRect(bx, by, Math.round(bw * frac), 4);
    ctx.save();
    ctx.font = '7px VT323, monospace'; ctx.fillStyle = 'rgba(200,169,255,0.55)';
    ctx.fillText('vínculo', bx, by - 1);
    ctx.restore();

    // Controls hint (bottom center)
    ctx.save();
    ctx.font      = '7px VT323, monospace';
    ctx.fillStyle = 'rgba(200,169,255,0.28)';
    const hint = '[Flechas] mover   [E] sisear';
    const hw   = ctx.measureText(hint).width;
    ctx.fillText(hint, Math.round(BASE_WIDTH / 2 - hw / 2), BASE_HEIGHT - ARENA_PAD - 2);
    ctx.restore();
  }

  _drawPhaseText(ctx) {
    const cx = BASE_WIDTH / 2, cy = BASE_HEIGHT / 2;
    const fadeIn = ms => Math.min(1, this._phaseT / ms);

    if (this._phase === 'intro') {
      const a = fadeIn(500);
      ctx.save();
      ctx.font = '14px VT323, monospace'; ctx.fillStyle = `rgba(200,169,255,${a})`;
      ctx.shadowColor = 'rgba(200,169,255,0.8)'; ctx.shadowBlur = 10;
      const t = this._titleText;
      ctx.fillText(t, Math.round(cx - ctx.measureText(t).width / 2), cy - 8);
      ctx.font = '8px VT323, monospace'; ctx.fillStyle = `rgba(200,169,255,${a * 0.5})`;
      const s = this._subtitleText;
      ctx.fillText(s, Math.round(cx - ctx.measureText(s).width / 2), cy + 6);
      ctx.restore();
    }

    // Wave announcement banner
    if (this._phase === 'wave' && this._phaseT < 1100) {
      const a = Math.max(0, 1 - this._phaseT / 1100);
      ctx.save();
      ctx.font = '12px VT323, monospace'; ctx.fillStyle = `rgba(200,169,255,${a})`;
      ctx.shadowColor = 'rgba(200,169,255,0.8)'; ctx.shadowBlur = 8;
      const label = this._waveIdx === this._waveDefs.length - 1 ? '¡JEFE ECO!' : `Ola ${this._waveIdx + 1}`;
      ctx.fillText(label, Math.round(cx - ctx.measureText(label).width / 2), ARENA_PAD + 22);
      ctx.restore();
    }

    if (this._phase === 'between') {
      const a = Math.abs(Math.sin(this._phaseT / 1300 * Math.PI));
      ctx.save();
      ctx.font = '10px VT323, monospace'; ctx.fillStyle = `rgba(200,169,255,${a * 0.7})`;
      const t = `Ola ${this._waveIdx} completada`;
      ctx.fillText(t, Math.round(cx - ctx.measureText(t).width / 2), cy);
      ctx.restore();
    }

    if (this._phase === 'win') {
      const a = fadeIn(500);
      ctx.save();
      ctx.font = '14px VT323, monospace'; ctx.fillStyle = `rgba(93,187,99,${a})`;
      ctx.shadowColor = 'rgba(93,187,99,0.8)'; ctx.shadowBlur = 12;
      const t = '¡Vínculo protegido!';
      ctx.fillText(t, Math.round(cx - ctx.measureText(t).width / 2), cy - 4);
      ctx.font = '8px VT323, monospace'; ctx.fillStyle = `rgba(200,169,255,${a * 0.5})`;
      const s = 'Volviendo al inicio…';
      ctx.fillText(s, Math.round(cx - ctx.measureText(s).width / 2), cy + 10);
      ctx.restore();
    }

    if (this._phase === 'lose') {
      const a = fadeIn(500);
      ctx.save();
      ctx.font = '14px VT323, monospace'; ctx.fillStyle = `rgba(158,58,58,${a})`;
      ctx.shadowColor = 'rgba(158,58,58,0.8)'; ctx.shadowBlur = 12;
      const t = 'El vínculo se rompió';
      ctx.fillText(t, Math.round(cx - ctx.measureText(t).width / 2), cy - 4);
      ctx.font = '8px VT323, monospace'; ctx.fillStyle = `rgba(200,169,255,${a * 0.5})`;
      const s = 'Volviendo al inicio…';
      ctx.fillText(s, Math.round(cx - ctx.measureText(s).width / 2), cy + 10);
      ctx.restore();
    }
  }

  _done(result) {
    this.active = false;
    const r = this._resolve;
    this._resolve = null;
    r?.(result);
  }
}
