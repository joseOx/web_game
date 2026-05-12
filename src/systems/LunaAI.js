// Luna autonomous FSM: FOLLOW → ALERT → INVESTIGATE → PURR_SEAL / HISS_ECHO / EXPLORE

export const LUNA_STATE = {
  FOLLOW:      'FOLLOW',
  INVESTIGATE: 'INVESTIGATE',
  PURR_SEAL:   'PURR_SEAL',
  HISS_ECHO:   'HISS_ECHO',
  EXPLORE:     'EXPLORE',
  ALERT:       'ALERT',
};

const DETECT_RIFT_RANGE   = 150;
const SEAL_ENTER_RANGE    = 14;
const DETECT_ECHO_RANGE   = 80;
const SEAL_RATE           = 10;     // seal points per second
const ALERT_DURATION      = 700;    // ms — cat-like freeze before acting
const EXPLORE_CHANGE_INT  = 2500;   // ms between explore direction changes
const EXPLORE_SPEED       = 0.7;
const FORCE_FOLLOW_DIST   = 380;    // if Mateo is this far, always return
const ABANDON_SEAL_DIST   = 220;    // abandon PURR_SEAL if Mateo drifts this far
const MAX_HISS_DURATION   = 3500;   // ms — give up chasing echo after this

export class LunaAI {
  constructor() {
    this._state = LUNA_STATE.FOLLOW;

    this._luna        = null;
    this._mateo       = null;
    this._riftSystem  = null;
    this._echoManager = null;
    this._vision      = null;
    this._dimension   = null;
    this._bond        = null;
    this._audio       = null;
    this._eventBus    = null;

    this._alertTimer  = 0;
    this._alertTarget = null;

    this._exploreTimer = 0;
    this._exploreDirX  = 1;
    this._exploreDirY  = 0;

    this._targetRift = null;
    this._targetEcho = null;
    this._hissTimer  = 0;
  }

  get state() { return this._state; }

  inject({ luna, mateo, riftSystem, echoManager, visionSystem,
           dimensionManager, bondSystem, audioSystem, eventBus } = {}) {
    if (luna)             this._luna        = luna;
    if (mateo)            this._mateo       = mateo;
    if (riftSystem)       this._riftSystem  = riftSystem;
    if (echoManager)      this._echoManager = echoManager;
    if (visionSystem)     this._vision      = visionSystem;
    if (dimensionManager) this._dimension   = dimensionManager;
    if (bondSystem)       this._bond        = bondSystem;
    if (audioSystem)      this._audio       = audioSystem;
    if (eventBus) {
      this._eventBus = eventBus;
      // Q key (call_luna) forces immediate return to Mateo
      eventBus.on('luna:called', () => {
        this._targetRift = null;
        this._targetEcho = null;
        this._transition(LUNA_STATE.FOLLOW);
      });
    }
  }

  update(dt) {
    if (!this._luna || !this._mateo) return;

    const mateoDist = this._luna.distTo(this._mateo);

    // Critical bond or Mateo very far → always return
    if (this._bond?.currentLevel() === 'CRITICAL' || mateoDist > FORCE_FOLLOW_DIST) {
      if (this._state !== LUNA_STATE.FOLLOW) {
        this._targetRift = null;
        this._targetEcho = null;
        this._transition(LUNA_STATE.FOLLOW);
      }
    }

    switch (this._state) {
      case LUNA_STATE.FOLLOW:      this._updateFollow(dt, mateoDist);      break;
      case LUNA_STATE.INVESTIGATE: this._updateInvestigate(dt, mateoDist); break;
      case LUNA_STATE.PURR_SEAL:   this._updatePurrSeal(dt, mateoDist);   break;
      case LUNA_STATE.HISS_ECHO:   this._updateHissEcho(dt, mateoDist);   break;
      case LUNA_STATE.EXPLORE:     this._updateExplore(dt, mateoDist);    break;
      case LUNA_STATE.ALERT:       this._updateAlert(dt, mateoDist);      break;
    }
  }

  // ── State handlers ───────────────────────────────────────────────────────────

  _updateFollow(dt, mateoDist) {
    this._moveToward(this._mateo.centerX(), this._mateo.centerY(),
      this._followSpeed(mateoDist), 20);
    this._setAnim(mateoDist > 22 ? 'walk' : 'idle');

    // Detect rifts when feline vision is on or in the Void
    const canDetect = this._vision?.active || this._dimension?.isVoid();
    if (canDetect) {
      const rift = this._riftSystem?.nearestUnsealedInRange(
        this._luna.centerX(), this._luna.centerY(), DETECT_RIFT_RANGE);
      if (rift) { this._alertTarget = rift; this._transition(LUNA_STATE.ALERT); return; }
    }

    // Detect echo to hiss at
    const echo = this._echoManager?.nearestMinorInRange(
      this._luna.centerX(), this._luna.centerY(), DETECT_ECHO_RANGE);
    if (echo) { this._alertTarget = echo; this._transition(LUNA_STATE.ALERT); return; }

    // Settle into explore when close to Mateo in the Void
    if (mateoDist < 28 && this._dimension?.isVoid()) {
      this._transition(LUNA_STATE.EXPLORE);
    }
  }

  _updateInvestigate(dt, mateoDist) {
    if (!this._targetRift || this._targetRift.sealed || !this._targetRift.active) {
      this._targetRift = null;
      this._transition(LUNA_STATE.FOLLOW);
      return;
    }

    if (mateoDist > FORCE_FOLLOW_DIST * 0.7) {
      this._targetRift = null;
      this._transition(LUNA_STATE.FOLLOW);
      return;
    }

    const riftCX = this._targetRift.x + this._targetRift.width  / 2;
    const riftCY = this._targetRift.y + this._targetRift.height / 2;
    const dist   = Math.hypot(this._luna.centerX() - riftCX, this._luna.centerY() - riftCY);

    if (dist < SEAL_ENTER_RANGE) { this._transition(LUNA_STATE.PURR_SEAL); return; }

    this._moveToward(riftCX, riftCY, 1.5);
    this._setAnim('walk');

    // Echo in the way — hiss it off
    const echo = this._echoManager?.nearestMinorInRange(
      this._luna.centerX(), this._luna.centerY(), DETECT_ECHO_RANGE * 0.7);
    if (echo) {
      this._targetEcho = echo;
      this._hissTimer  = 0;
      this._transition(LUNA_STATE.HISS_ECHO);
    }
  }

  _updatePurrSeal(dt, mateoDist) {
    if (!this._targetRift || this._targetRift.sealed || !this._targetRift.active) {
      this._targetRift = null;
      this._transition(LUNA_STATE.FOLLOW);
      return;
    }

    if (mateoDist > ABANDON_SEAL_DIST) {
      this._targetRift = null;
      this._transition(LUNA_STATE.FOLLOW);
      return;
    }

    const riftCX = this._targetRift.x + this._targetRift.width  / 2;
    const riftCY = this._targetRift.y + this._targetRift.height / 2;
    const dist   = Math.hypot(this._luna.centerX() - riftCX, this._luna.centerY() - riftCY);

    if (dist > SEAL_ENTER_RANGE * 0.8) {
      this._moveToward(riftCX, riftCY, 0.8);
    } else {
      this._luna.vx *= 0.8;
      this._luna.vy *= 0.8;
    }

    this._setAnim('purrSeal');
    this._riftSystem?.advanceSeal(this._targetRift.id, SEAL_RATE * dt / 1000);
  }

  _updateHissEcho(dt, mateoDist) {
    this._hissTimer += dt;

    const echoGone = !this._targetEcho || !this._targetEcho.active
                     || this._targetEcho.fleeing
                     || this._hissTimer > MAX_HISS_DURATION;

    if (echoGone) {
      this._targetEcho = null;
      this._transition(this._targetRift ? LUNA_STATE.INVESTIGATE : LUNA_STATE.FOLLOW);
      return;
    }

    if (mateoDist > FORCE_FOLLOW_DIST * 0.7) {
      this._targetEcho = null;
      this._transition(LUNA_STATE.FOLLOW);
      return;
    }

    this._moveToward(this._targetEcho.centerX(), this._targetEcho.centerY(), 1.9);
    this._setAnim('walk');
  }

  _updateExplore(dt, mateoDist) {
    if (mateoDist > 65) { this._transition(LUNA_STATE.FOLLOW); return; }

    this._exploreTimer -= dt;
    if (this._exploreTimer <= 0) {
      this._exploreTimer = EXPLORE_CHANGE_INT + (Math.random() * 800 - 400);
      const angle = Math.random() * Math.PI * 2;
      this._exploreDirX = Math.cos(angle);
      this._exploreDirY = Math.sin(angle);
    }

    this._luna.vx += (this._exploreDirX * EXPLORE_SPEED - this._luna.vx) * 0.08;
    this._luna.vy += (this._exploreDirY * EXPLORE_SPEED - this._luna.vy) * 0.08;
    this._setAnim(Math.hypot(this._luna.vx, this._luna.vy) > 0.3 ? 'walk' : 'idle');

    // Spot rift while exploring
    const rift = this._riftSystem?.nearestUnsealedInRange(
      this._luna.centerX(), this._luna.centerY(), DETECT_RIFT_RANGE * 0.7);
    if (rift) { this._alertTarget = rift; this._transition(LUNA_STATE.ALERT); }
  }

  _updateAlert(dt, _mateoDist) {
    // Cat-like freeze
    this._luna.vx *= 0.7;
    this._luna.vy *= 0.7;
    this._setAnim('idle');
    this._alertTimer += dt;

    if (this._alertTimer >= ALERT_DURATION) {
      this._alertTimer = 0;
      // sealProgress only exists on Rift — use it to distinguish target type
      if (this._alertTarget?.sealProgress !== undefined) {
        this._targetRift  = this._alertTarget;
        this._alertTarget = null;
        this._transition(LUNA_STATE.INVESTIGATE);
      } else if (this._alertTarget) {
        this._targetEcho  = this._alertTarget;
        this._alertTarget = null;
        this._hissTimer   = 0;
        this._transition(LUNA_STATE.HISS_ECHO);
      } else {
        this._transition(LUNA_STATE.FOLLOW);
      }
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _transition(newState) {
    if (this._state === newState) return;
    const prev = this._state;
    this._state = newState;
    this._alertTimer = 0;
    if (newState === LUNA_STATE.EXPLORE) this._exploreTimer = 0;
    this._eventBus?.emit('luna:state_changed', { from: prev, to: newState });
  }

  _moveToward(tx, ty, speed, stopDist = 0) {
    const dx   = tx - this._luna.centerX();
    const dy   = ty - this._luna.centerY();
    const dist = Math.hypot(dx, dy);
    if (dist <= stopDist) { this._luna.vx *= 0.85; this._luna.vy *= 0.85; return; }
    this._luna.vx = (dx / dist) * speed;
    this._luna.vy = (dy / dist) * speed;
    if (dx !== 0) this._luna.facing = dx > 0 ? 1 : -1;
  }

  _followSpeed(dist) {
    if (dist <= 20) return 0;
    const t = Math.min(1, (dist - 20) / 80);
    return 1.0 + t * (2.2 - 1.0);
  }

  _setAnim(name) {
    this._luna.getComponent('animation')?.setState(name);
  }
}
