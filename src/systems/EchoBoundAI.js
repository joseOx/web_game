// AI for EchoBound entities: bob in place, trigger dialogue when Mateo gets close.

const STATE = {
  IDLE:      'IDLE',
  TRIGGERED: 'TRIGGERED',
  DISMISSED: 'DISMISSED',
};

const TRIGGER_RANGE = 24;
const BOB_SPEED     = 0.002;   // radians per ms
const BOB_AMPLITUDE = 1.5;     // pixels

export class EchoBoundAI {
  constructor() {
    this._state = STATE.IDLE;

    this._echo      = null;
    this._mateo     = null;
    this._dialogue  = null;
    this._dimension = null;
    this._eventBus  = null;

    this._bobTimer = Math.random() * Math.PI * 2;
    this._baseY    = 0;
  }

  inject({ echo, mateo, dialogueSystem, dimensionManager, eventBus } = {}) {
    if (echo)             { this._echo = echo; this._baseY = echo.y; }
    if (mateo)            this._mateo     = mateo;
    if (dialogueSystem)   this._dialogue  = dialogueSystem;
    if (dimensionManager) this._dimension = dimensionManager;
    if (eventBus)         this._eventBus  = eventBus;
  }

  get state() { return this._state; }

  update(dt) {
    if (!this._echo || this._state === STATE.DISMISSED) return;

    // Bob vertically — do this in all non-dismissed states
    this._bobTimer += BOB_SPEED * dt;
    this._echo.y  = this._baseY + Math.sin(this._bobTimer) * BOB_AMPLITUDE;
    this._echo.vx = 0;
    this._echo.vy = 0;

    if (this._state === STATE.IDLE) {
      this._checkProximity();
    }
  }

  dismiss() {
    this._state = STATE.DISMISSED;
    this._echo.active = false;
  }

  // ── Private ───────────────────────────────────────────────────────────────────

  _checkProximity() {
    if (!this._mateo || !this._echo.dialogueId) return;
    // Only trigger in the Void (or if explicitly visible in real world)
    if (!this._dimension?.isVoid() && !this._echo._visibleInReal) return;
    if (this._dialogue?.isVisible()) return;

    const dx = this._mateo.centerX() - this._echo.centerX();
    const dy = this._mateo.centerY() - this._echo.centerY();
    if (Math.hypot(dx, dy) < TRIGGER_RANGE) {
      this._state = STATE.TRIGGERED;
      this._dialogue?.start(this._echo.dialogueId, () => {
        this._state      = STATE.DISMISSED;
        this._echo.active = false;
        this._eventBus?.emit('echo:dismissed', { echoId: this._echo.id });
      });
    }
  }
}
