const POOL_SIZE = 300;

export class ParticleSystem {
  constructor() {
    this._pool = Array.from({ length: POOL_SIZE }, () => ({
      active: false, x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 0, r: 0, color: '#fff',
      phase: 0,        // for multi-phase effects (0, 1, 2)
      ringAngle: 0,    // for ring particles
      ringRadius: 0,
    }));

    // Active seal sequence (null = none)
    this._sealSequence = null;
  }

  // ── Basic burst (backward-compatible) ─────────────────────────────────────

  emit(x, y, color, count = 20) {
    let spawned = 0;
    for (const p of this._pool) {
      if (spawned >= count) break;
      if (p.active) continue;
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;
      p.active  = true;
      p.x       = x;
      p.y       = y;
      p.vx      = Math.cos(angle) * speed;
      p.vy      = Math.sin(angle) * speed;
      p.life    = 0;
      p.maxLife = 0.4 + Math.random() * 0.4;
      p.r       = 1.5 + Math.random() * 1.5;
      p.color   = color;
      p.phase   = 0;
      spawned++;
    }
  }

  // ── Seal effect (3-phase cinematic) ───────────────────────────────────────
  // Phase 0: Ring particles form a circle (0.0–0.5s)
  // Phase 1: Implosion toward center  (0.5–0.8s)  
  // Phase 2: Bright burst outward      (0.8–1.0s)

  startSealSequence(x, y, emotionColor) {
    this._sealSequence = {
      x, y,
      color: emotionColor,
      elapsed: 0,
      phase: 0,
      ringPhasesDone: false,
      implosionSpawned: false,
      burstSpawned: false,
    };
    // Phase 0: spawn a ring of particles
    this._spawnRing(x, y, emotionColor);
  }

  _spawnRing(cx, cy, color) {
    const ringPoints = 24;
    for (let i = 0; i < ringPoints; i++) {
      const p = this._getDeadParticle();
      if (!p) break;
      const angle = (i / ringPoints) * Math.PI * 2;
      p.active    = true;
      p.x         = cx + Math.cos(angle) * 28;
      p.y         = cy + Math.sin(angle) * 28;
      p.vx        = 0;
      p.vy        = 0;
      p.life      = 0;
      p.maxLife   = 1.2;
      p.r         = 2.0;
      p.color     = color;
      p.phase     = 0;
      p.ringAngle = angle;
      p.ringRadius = 28;
    }
  }

  _spawnImplosion(cx, cy, color) {
    for (let i = 0; i < 40; i++) {
      const p = this._getDeadParticle();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const dist  = 30 + Math.random() * 50;
      p.active  = true;
      p.x       = cx + Math.cos(angle) * dist;
      p.y       = cy + Math.sin(angle) * dist;
      p.vx      = Math.cos(angle + Math.PI) * 50; // rush inward
      p.vy      = Math.sin(angle + Math.PI) * 50;
      p.life    = 0;
      p.maxLife = 0.5 + Math.random() * 0.3;
      p.r       = 2.5 + Math.random() * 2;
      p.color   = color;
      p.phase   = 1;
    }
    // Also spawn a bright center glow
    for (let i = 0; i < 8; i++) {
      const p = this._getDeadParticle();
      if (!p) break;
      p.active  = true;
      p.x       = cx + (Math.random() - 0.5) * 10;
      p.y       = cy + (Math.random() - 0.5) * 10;
      p.vx      = (Math.random() - 0.5) * 15;
      p.vy      = (Math.random() - 0.5) * 15;
      p.life    = 0;
      p.maxLife = 0.6;
      p.r       = 6 + Math.random() * 5;
      p.color   = '#FFFDE7'; // warm white flash
      p.phase   = 1;
    }
  }

  _spawnBurst(cx, cy, color) {
    for (let i = 0; i < 50; i++) {
      const p = this._getDeadParticle();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      p.active  = true;
      p.x       = cx;
      p.y       = cy;
      p.vx      = Math.cos(angle) * speed;
      p.vy      = Math.sin(angle) * speed;
      p.life    = 0;
      p.maxLife = 0.6 + Math.random() * 0.8;
      p.r       = 1.0 + Math.random() * 2.5;
      p.color   = color;
      p.phase   = 2;
    }
    // Sparkle trail particles with longer life (they float upward)
    for (let i = 0; i < 20; i++) {
      const p = this._getDeadParticle();
      if (!p) break;
      p.active  = true;
      p.x       = cx + (Math.random() - 0.5) * 20;
      p.y       = cy + (Math.random() - 0.5) * 10;
      p.vx      = (Math.random() - 0.5) * 25;
      p.vy      = -30 - Math.random() * 60; // float up
      p.life    = 0;
      p.maxLife = 1.5 + Math.random() * 1.5;
      p.r       = 0.8 + Math.random() * 1.8;
      p.color   = '#FFFFFF';
      p.phase   = 2;
    }
  }

  _getDeadParticle() {
    // Find dead particle; if all alive, recycle oldest
    for (const p of this._pool) {
      if (!p.active) return p;
    }
    // Recycle: pick the one closest to end of life
    let oldest = this._pool[0];
    for (const p of this._pool) {
      if (p.life / p.maxLife > oldest.life / oldest.maxLife) oldest = p;
    }
    oldest.active = false;
    return oldest;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(dt) {
    const s = dt / 1000;

    // Update seal sequence
    if (this._sealSequence) {
      const seq = this._sealSequence;
      seq.elapsed += s;

      if (seq.elapsed > 0.5 && !seq.implosionSpawned) {
        this._spawnImplosion(seq.x, seq.y, seq.color);
        seq.implosionSpawned = true;
      }
      if (seq.elapsed > 0.8 && !seq.burstSpawned) {
        this._spawnBurst(seq.x, seq.y, seq.color);
        seq.burstSpawned = true;
      }
      if (seq.elapsed > 2.0) {
        this._sealSequence = null; // sequence complete
      }
    }

    // Update all particles
    for (const p of this._pool) {
      if (!p.active) continue;

      if (p.phase === 0) {
        // Ring: contract inward
        p.ringRadius = Math.max(0, p.ringRadius - 35 * s);
        p.x = this._sealSequence
          ? this._sealSequence.x + Math.cos(p.ringAngle) * p.ringRadius
          : p.x;
        p.y = this._sealSequence
          ? this._sealSequence.y + Math.sin(p.ringAngle) * p.ringRadius
          : p.y;
        p.r = Math.max(0.5, 2.0 * (p.ringRadius / 28));
      } else {
        // Normal physics
        p.x  += p.vx * s;
        p.y  += p.vy * s;
        p.vy += 60 * s; // gravity

        if (p.phase === 1) {
          // Implosion: decelerate
          p.vx *= 0.96;
          p.vy *= 0.96;
        }
        if (p.phase === 2) {
          // Burst: spin effect
          p.vy -= 15 * s; // slight anti-gravity for floating effect
        }
      }

      p.life += s;
      if (p.life >= p.maxLife) p.active = false;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render(ctx) {
    for (const p of this._pool) {
      if (!p.active) continue;
      const lifeRatio = p.life / p.maxLife;

      let alpha;
      if (p.phase === 0) {
        // Ring fades at end
        alpha = lifeRatio < 0.7 ? 0.9 : 0.9 * (1 - (lifeRatio - 0.7) / 0.3);
      } else if (p.phase === 1) {
        // Implosion particles fade early
        alpha = lifeRatio < 0.3 ? 1 : 1 - (lifeRatio - 0.3) / 0.7;
      } else {
        alpha = 1 - lifeRatio;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;

      if (p.phase <= 1 && p.r > 3) {
        // Glow particles: use radial gradient-like effect with shadow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.r * 2;
      }

      ctx.beginPath();
      ctx.arc(Math.round(p.x), Math.round(p.y), Math.max(0.3, p.r), 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  // ── Active check ──────────────────────────────────────────────────────────

  isSealActive() {
    return this._sealSequence !== null;
  }

  destroy() {
    this._pool.length = 0;
    this._sealSequence = null;
  }
}
