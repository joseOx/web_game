// AI for EchoBound entities: bob in place, trigger dialogue when Mateo gets close.
// EVADE mode: echo drifts away from Mateo (shame/avoidance). Luna corners it to allow dialogue.
// separateByLuna: Luna hissing for 2s causes echo:separated instead of dialogue.

const STATE = {
  IDLE:      'IDLE',
  TRIGGERED: 'TRIGGERED',
  DISMISSED: 'DISMISSED',
  EVADE:     'EVADE',
};

const TRIGGER_RANGE       = 24;
const BOB_SPEED           = 0.002;   // radians per ms
const BOB_AMPLITUDE       = 1.5;     // pixels
const EVADE_TRIGGER_RANGE = 80;
const EVADE_SPEED         = 0.7;
const EVADE_MAX_RANGE     = 160;     // flee only while Mateo is within this distance
const LUNA_TRAP_RANGE     = 60;      // Luna this close while evading → cornered → back to IDLE
const LUNA_HISS_RANGE     = 65;
const LUNA_HISS_TIMER_MAX = 2000;    // ms of continuous hissing to separate

export class EchoBoundAI {
  constructor() {
    this._state = STATE.IDLE;

    this._echo           = null;
    this._mateo          = null;
    this._luna           = null;
    this._dialogue       = null;
    this._dimension      = null;
    this._eventBus       = null;

    this._separateByLuna  = false;
    this._evadeOnApproach = false;
    this._lunaHissTimer   = 0;

    this._bobTimer = Math.random() * Math.PI * 2;
    this._baseY    = 0;
  }

  inject({ echo, mateo, luna, dialogueSystem, dimensionManager, eventBus } = {}) {
    if (echo)             { this._echo = echo; this._baseY = echo.y; }
    if (mateo)            this._mateo     = mateo;
    if (luna)             this._luna      = luna;
    if (dialogueSystem)   this._dialogue  = dialogueSystem;
    if (dimensionManager) this._dimension = dimensionManager;
    if (eventBus)         this._eventBus  = eventBus;
  }

  configure({ separateByLuna = false, evadeOnApproach = false } = {}) {
    this._separateByLuna  = separateByLuna;
    this._evadeOnApproach = evadeOnApproach;
    // Expose fleeing property so LunaAI.nearestMinorInRange() detects this echo for hissing
    if (separateByLuna && this._echo) {
      this._echo.fleeing = false;
    }
  }

  get state() { return this._state; }

  update(dt) {
    if (!this._echo || this._state === STATE.DISMISSED) return;

    if (this._state === STATE.EVADE) {
      this._bobTimer += BOB_SPEED * dt;
      this._updateEvade(dt);
      return;
    }

    // Bob vertically in IDLE / TRIGGERED states
    this._bobTimer += BOB_SPEED * dt;
    this._echo.y  = this._baseY + Math.sin(this._bobTimer) * BOB_AMPLITUDE;
    this._echo.vx = 0;
    this._echo.vy = 0;

    if (this._state === STATE.IDLE) {
      this._checkProximity();
      if (this._separateByLuna) this._checkLunaSeparation(dt);
    }
  }

  dismiss() {
    this._state = STATE.DISMISSED;
    this._echo.active = false;
  }

  // ── Private ───────────────────────────────────────────────────────────────────

  _checkProximity() {
    if (!this._mateo) return;
    if (!this._dimension?.isVoid() && !this._echo._visibleInReal) return;
    if (this._dialogue?.isVisible()) return;

    const dx   = this._mateo.centerX() - this._echo.centerX();
    const dy   = this._mateo.centerY() - this._echo.centerY();
    const dist = Math.hypot(dx, dy);

    // Evade — drift away from Mateo instead of triggering dialogue
    if (this._evadeOnApproach && this._echo.dialogueId && dist < EVADE_TRIGGER_RANGE) {
      this._baseY = this._echo.y;
      this._state = STATE.EVADE;
      return;
    }

    if (!this._echo.dialogueId) return;
    if (dist < TRIGGER_RANGE) {
      this._state = STATE.TRIGGERED;
      this._dialogue?.start(this._echo.dialogueId, () => {
        this._state       = STATE.DISMISSED;
        this._echo.active = false;
        this._eventBus?.emit('echo:dismissed', { echoId: this._echo.id });
      });
    }
  }

  _updateEvade(_dt) {
    if (!this._mateo) { this._state = STATE.IDLE; return; }

    // Cornered by Luna → back to IDLE so dialogue can start
    if (this._luna) {
      const dxL = this._echo.centerX() - this._luna.centerX();
      const dyL = this._echo.centerY() - this._luna.centerY();
      if (Math.hypot(dxL, dyL) < LUNA_TRAP_RANGE) {
        this._baseY = this._echo.y;
        this._state = STATE.IDLE;
        return;
      }
    }

    const dx   = this._echo.centerX() - this._mateo.centerX();
    const dy   = this._echo.centerY() - this._mateo.centerY();
    const dist = Math.hypot(dx, dy);

    if (dist > 0 && dist < EVADE_MAX_RANGE) {
      this._echo.vx = (dx / dist) * EVADE_SPEED;
      this._echo.vy = (dy / dist) * EVADE_SPEED;
    } else {
      this._echo.vx *= 0.9;
      this._echo.vy *= 0.9;
    }
  }

  _checkLunaSeparation(dt) {
    if (!this._luna) return;
    const dx   = this._echo.centerX() - this._luna.centerX();
    const dy   = this._echo.centerY() - this._luna.centerY();
    const dist = Math.hypot(dx, dy);
    const lunaHissing = this._luna._ai?.state === 'HISS_ECHO';

    if (lunaHissing && dist < LUNA_HISS_RANGE) {
      this._lunaHissTimer += dt;
      if (this._lunaHissTimer >= LUNA_HISS_TIMER_MAX) {
        this._state       = STATE.DISMISSED;
        this._echo.active = false;
        this._eventBus?.emit('echo:separated', { echoId: this._echo.id });
      }
    } else {
      // Decay slowly when Luna stops hissing
      this._lunaHissTimer = Math.max(0, this._lunaHissTimer - dt * 0.5);
    }
  }
}
