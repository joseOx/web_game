// AI for EchoMinor entities: wander within spawn radius, accumulate at rifts, flee from Luna.

const STATE = {
  WANDER:     'WANDER',
  FLEE:       'FLEE',
  ACCUMULATE: 'ACCUMULATE',
};

const WANDER_RADIUS      = 50;
const WANDER_SPEED       = 0.4;
const FLEE_SPEED         = 2.6;
const FLEE_DETECT_RANGE  = 65;
const FLEE_LINGER        = 2000;   // ms to keep fleeing after losing sight
const ACCUMULATE_SPEED   = 0.25;
const RIFT_DETECT_RANGE  = 200;
const ACCUMULATE_HOVER   = 8;      // px from rift center to stop

export class EchoMinorAI {
  constructor() {
    this._state = STATE.WANDER;

    this._echo       = null;
    this._luna       = null;
    this._riftSystem = null;
    this._dimension  = null;

    this._wanderTimer = 0;
    this._wanderDirX  = 1;
    this._wanderDirY  = 0;

    this._fleeTimer   = 0;
    this._targetRift  = null;
  }

  inject({ echo, luna, riftSystem, dimensionManager } = {}) {
    if (echo)             this._echo       = echo;
    if (luna)             this._luna       = luna;
    if (riftSystem)       this._riftSystem = riftSystem;
    if (dimensionManager) this._dimension  = dimensionManager;
  }

  get state() { return this._state; }

  update(dt) {
    if (!this._echo) return;

    // Echoes are passive in the real world — stand still
    if (!this._dimension?.isVoid()) {
      this._echo.vx = 0;
      this._echo.vy = 0;
      return;
    }

    // Luna proximity is highest priority
    if (this._isLunaClose() && this._state !== STATE.FLEE) {
      this._fleeTimer = FLEE_LINGER;
      this._transition(STATE.FLEE);
    }

    switch (this._state) {
      case STATE.WANDER:     this._updateWander(dt);     break;
      case STATE.FLEE:       this._updateFlee(dt);       break;
      case STATE.ACCUMULATE: this._updateAccumulate(dt); break;
    }
  }

  // ── State handlers ───────────────────────────────────────────────────────────

  _updateWander(dt) {
    this._echo.fleeing = false;
    this._wanderTimer -= dt;

    if (this._wanderTimer <= 0) {
      this._wanderTimer = 1500 + Math.random() * 2000;

      // 30 % chance to drift toward a rift instead
      const rift = this._findNearestRift(RIFT_DETECT_RANGE);
      if (rift && Math.random() < 0.3) {
        this._targetRift = rift;
        this._transition(STATE.ACCUMULATE);
        return;
      }

      const angle = Math.random() * Math.PI * 2;
      this._wanderDirX = Math.cos(angle);
      this._wanderDirY = Math.sin(angle);
    }

    // Steer back toward spawn when too far
    const dxS  = this._echo.spawnX - this._echo.x;
    const dyS  = this._echo.spawnY - this._echo.y;
    const dS   = Math.hypot(dxS, dyS);
    if (dS > WANDER_RADIUS) {
      this._wanderDirX = dxS / dS;
      this._wanderDirY = dyS / dS;
    }

    this._echo.vx += (this._wanderDirX * WANDER_SPEED - this._echo.vx) * 0.05;
    this._echo.vy += (this._wanderDirY * WANDER_SPEED - this._echo.vy) * 0.05;
  }

  _updateFlee(dt) {
    this._echo.fleeing = true;

    if (this._isLunaClose()) {
      this._fleeTimer = FLEE_LINGER;
    } else {
      this._fleeTimer -= dt;
    }

    if (this._fleeTimer <= 0) {
      this._echo.fleeing = false;
      this._transition(STATE.WANDER);
      return;
    }

    if (!this._luna) return;

    const dx   = this._echo.centerX() - this._luna.centerX();
    const dy   = this._echo.centerY() - this._luna.centerY();
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      this._echo.vx = (dx / dist) * FLEE_SPEED;
      this._echo.vy = (dy / dist) * FLEE_SPEED;
    }
  }

  _updateAccumulate(dt) {
    this._echo.fleeing = false;

    if (!this._targetRift || this._targetRift.sealed || !this._targetRift.active) {
      this._targetRift = this._findNearestRift(RIFT_DETECT_RANGE);
      if (!this._targetRift) { this._transition(STATE.WANDER); return; }
    }

    const riftCX = this._targetRift.x + this._targetRift.width  / 2;
    const riftCY = this._targetRift.y + this._targetRift.height / 2;
    const dx     = riftCX - this._echo.centerX();
    const dy     = riftCY - this._echo.centerY();
    const dist   = Math.hypot(dx, dy);

    if (dist < ACCUMULATE_HOVER) {
      this._echo.vx *= 0.9;
      this._echo.vy *= 0.9;
    } else {
      this._echo.vx += ((dx / dist) * ACCUMULATE_SPEED - this._echo.vx) * 0.08;
      this._echo.vy += ((dy / dist) * ACCUMULATE_SPEED - this._echo.vy) * 0.08;
    }

    // Occasionally drift back to wander
    if (Math.random() < 0.0008) this._transition(STATE.WANDER);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _isLunaClose() {
    if (!this._luna) return false;
    const dx = this._echo.centerX() - this._luna.centerX();
    const dy = this._echo.centerY() - this._luna.centerY();
    return Math.hypot(dx, dy) < FLEE_DETECT_RANGE;
  }

  _findNearestRift(range) {
    return this._riftSystem?.nearestUnsealedInRange(
      this._echo.centerX(), this._echo.centerY(), range) ?? null;
  }

  _transition(newState) {
    this._state = newState;
  }
}
