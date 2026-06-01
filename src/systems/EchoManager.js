// Registry and render/update driver for all Echo entities (minor + bound).
// Object-pooled EchoMinor instances to avoid GC churn across zone transitions.

import { EchoMinor } from '../entities/EchoMinor.js';

const MINOR_POOL_MAX = 60;

export class EchoManager {
  constructor() {
    this._echoes    = new Map();  // id → Echo entity
    this._minorPool = [];         // recycled EchoMinor instances
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

  // ── Pooled spawn ───────────────────────────────────────────────────────────

  // Acquire an EchoMinor from the pool (or create a new one if pool is empty).
  // Resets all mutable state so it behaves like a fresh entity.
  acquireMinor(id, x, y, opts = {}) {
    let em;
    if (this._minorPool.length > 0) {
      em = this._minorPool.pop();
      // Reset mutable state
      em.id      = id;
      em.x       = x;
      em.y       = y;
      em.prevX   = x;
      em.prevY   = y;
      em.vx      = 0;
      em.vy      = 0;
      em.active  = true;
      em.emotion = opts.emotion ?? 'grief';
      em.fleeing = false;
      em.accumulating = false;
      em._ai     = null;
      em._guard  = false;
      em._dimension = 'real';
    } else {
      em = new EchoMinor(id, x, y, opts);
    }
    return em;
  }

  // Release an EchoMinor back to the pool (called during zone unload).
  releaseMinor(echo) {
    echo.active = false;
    echo._ai    = null;
    if (this._minorPool.length < MINOR_POOL_MAX) {
      this._minorPool.push(echo);
    }
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  nearestInRange(x, y, range) {
    return this._nearest(x, y, range, () => true);
  }

  nearestMinorInRange(x, y, range) {
    return this._nearest(x, y, range, e => e.fleeing !== undefined);
  }

  // ── Batch operations ───────────────────────────────────────────────────────

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

  // Clear all echoes, releasing EchoMinor instances back to the pool.
  clear() {
    for (const echo of this._echoes.values()) {
      if (echo.fleeing !== undefined) {
        // EchoMinor: return to pool
        this.releaseMinor(echo);
      }
    }
    this._echoes.clear();
  }

  // ── Private ────────────────────────────────────────────────────────────────

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
