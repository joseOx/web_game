const POOL_SIZE = 200;

export class ParticleSystem {
  constructor() {
    this._pool = Array.from({ length: POOL_SIZE }, () => ({
      active: false, x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 0, r: 0, color: '#fff',
    }));
  }

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
      spawned++;
    }
  }

  update(dt) {
    const s = dt / 1000;
    for (const p of this._pool) {
      if (!p.active) continue;
      p.x   += p.vx * s;
      p.y   += p.vy * s;
      p.vy  += 60 * s; // gravity
      p.life += s;
      if (p.life >= p.maxLife) p.active = false;
    }
  }

  render(ctx) {
    for (const p of this._pool) {
      if (!p.active) continue;
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(Math.round(p.x), Math.round(p.y), p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  destroy() {}
}
