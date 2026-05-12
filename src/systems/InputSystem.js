// Action states: false | 'just_pressed' | true | 'just_released'
const BINDINGS = {
  'ArrowLeft':  'move_left',
  'ArrowRight': 'move_right',
  'ArrowUp':    'move_up',
  'ArrowDown':  'move_down',
  'KeyA':       'move_left',
  'KeyD':       'move_right',
  'KeyW':       'move_up',
  'KeyS':       'move_down',
  'Space':      'interact',
  'KeyE':       'interact',
  'KeyQ':       'call_luna',
  'ShiftLeft':  'feline_vision',
  'Escape':     'pause',
};

const GAMEPAD_BINDINGS = {
  12: 'move_up',
  13: 'move_down',
  14: 'move_left',
  15: 'move_right',
  0:  'interact',
  2:  'call_luna',
  4:  'feline_vision',
  9:  'pause',
};

const AXIS_THRESHOLD = 0.4;

export class InputSystem {
  constructor() {
    this._keys    = {};   // raw keyboard state
    this._actions = {};   // abstract action states

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp   = this._onKeyUp.bind(this);

    this._setupListeners();
    this._setupTouch();
  }

  // --- Public API ---

  isAction(action) {
    const s = this._actions[action];
    return s === 'just_pressed' || s === true;
  }

  wasPressed(action) {
    return this._actions[action] === 'just_pressed';
  }

  wasReleased(action) {
    return this._actions[action] === 'just_released';
  }

  // Called each fixed update step by Game
  update(_dt) {
    // Advance state machine
    for (const action in this._actions) {
      if (this._actions[action] === 'just_pressed') {
        this._actions[action] = true;
      } else if (this._actions[action] === 'just_released') {
        this._actions[action] = false;
      }
    }

    this._pollGamepad();
  }

  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup',   this._boundKeyUp);
    this._removeTouchListeners();
    this._actions = {};
    this._keys    = {};
  }

  // --- Keyboard ---

  _setupListeners() {
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup',   this._boundKeyUp);
  }

  _onKeyDown(e) {
    if (this._keys[e.code]) return; // already held — ignore repeat
    this._keys[e.code] = true;

    const action = BINDINGS[e.code];
    if (action && !this.isAction(action)) {
      this._actions[action] = 'just_pressed';
    }

    // Prevent arrow keys from scrolling the page
    if (e.code.startsWith('Arrow') || e.code === 'Space') {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this._keys[e.code] = false;

    const action = BINDINGS[e.code];
    if (action && this.isAction(action)) {
      this._actions[action] = 'just_released';
    }
  }

  // --- Gamepad ---

  _pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad  = pads[0];
    if (!pad) return;

    for (const [btnIndex, action] of Object.entries(GAMEPAD_BINDINGS)) {
      const btn = pad.buttons[btnIndex];
      if (!btn) continue;

      const pressed = btn.pressed;
      const current = this._actions[action];

      if (pressed && !current) {
        this._actions[action] = 'just_pressed';
      } else if (!pressed && (current === true || current === 'just_pressed')) {
        this._actions[action] = 'just_released';
      }
    }

    // Left stick as movement
    const ax = pad.axes[0];
    const ay = pad.axes[1];
    this._setAxisAction('move_left',  ax < -AXIS_THRESHOLD);
    this._setAxisAction('move_right', ax >  AXIS_THRESHOLD);
    this._setAxisAction('move_up',    ay < -AXIS_THRESHOLD);
    this._setAxisAction('move_down',  ay >  AXIS_THRESHOLD);
  }

  _setAxisAction(action, active) {
    const current = this._actions[action];
    if (active && !current) {
      this._actions[action] = 'just_pressed';
    } else if (!active && (current === true || current === 'just_pressed')) {
      this._actions[action] = 'just_released';
    }
  }

  // --- Touch (virtual D-pad stubs — full implementation in Fase 7) ---

  _setupTouch() {
    this._touchStart = null;
    this._boundTouchStart = this._onTouchStart.bind(this);
    this._boundTouchMove  = this._onTouchMove.bind(this);
    this._boundTouchEnd   = this._onTouchEnd.bind(this);
    window.addEventListener('touchstart', this._boundTouchStart, { passive: false });
    window.addEventListener('touchmove',  this._boundTouchMove,  { passive: false });
    window.addEventListener('touchend',   this._boundTouchEnd,   { passive: false });
  }

  _removeTouchListeners() {
    window.removeEventListener('touchstart', this._boundTouchStart);
    window.removeEventListener('touchmove',  this._boundTouchMove);
    window.removeEventListener('touchend',   this._boundTouchEnd);
  }

  _onTouchStart(e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    this._touchStart = { x: t.clientX, y: t.clientY, id: t.identifier };
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (!this._touchStart) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== this._touchStart.id) continue;
      const dx = t.clientX - this._touchStart.x;
      const dy = t.clientY - this._touchStart.y;
      const DEAD = 20;
      this._setAxisAction('move_left',  dx < -DEAD);
      this._setAxisAction('move_right', dx >  DEAD);
      this._setAxisAction('move_up',    dy < -DEAD);
      this._setAxisAction('move_down',  dy >  DEAD);
    }
  }

  _onTouchEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== this._touchStart?.id) continue;
      this._setAxisAction('move_left',  false);
      this._setAxisAction('move_right', false);
      this._setAxisAction('move_up',    false);
      this._setAxisAction('move_down',  false);
      this._touchStart = null;
    }
  }
}
