// Registry and render/update driver for all Echo entities (minor + bound).

export class EchoManager {
  constructor() {
    this._echoes = new Map();  // id → Echo entity
  }

  register(echo) {
    this._echoes.set(echo.id, echo);
    return this;
  }

  unregister(id) {
    this._echoes.delete(id);
  }

  get(id)   { return this._echoes.get(id) ?? null; }
  getAll()  { return [...this._echoes.values()]; }

  // Nearest active echo of any type within range
  nearestInRange(x, y, range) {
    return this._nearest(x, y, range, () => true);
  }

  // Nearest EchoMinor (has .fleeing property) — used by LunaAI to find things to hiss at
  nearestMinorInRange(x, y, range) {
    return this._nearest(x, y, range, e => e.fleeing !== undefined);
  }

  // Propagate dimension change to all echoes
  setDimension(dim) {
    for (const echo of this._echoes.values()) {
      echo.setDimension?.(dim);
    }
  }

  update(dt) {
    for (const echo of this._echoes.values()) {
      if (echo.active) echo.update(dt);
    }
  }

  render(ctx, alpha) {
    for (const echo of this._echoes.values()) {
      echo.render(ctx, alpha);
    }
  }

  clear() { this._echoes.clear(); }

  // ── Private ───────────────────────────────────────────────────────────────────

  _nearest(x, y, range, predicate) {
    let nearest  = null;
    let nearestD = Infinity;
    for (const echo of this._echoes.values()) {
      if (!echo.active || !predicate(echo)) continue;
      const dx = echo.centerX() - x;
      const dy = echo.centerY() - y;
      const d  = Math.hypot(dx, dy);
      if (d <= range && d < nearestD) { nearest = echo; nearestD = d; }
    }
    return nearest;
  }
}
