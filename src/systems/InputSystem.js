// D-pad layout in logical 320×180 canvas space
const DPAD_CX = 40, DPAD_CY = 152, DPAD_R = 26;
// Right-side action buttons (vertical column, right edge)
const BTN_E   = { x: 286, y: 120, r: 14 };  // interact
const BTN_Q   = { x: 286, y: 150, r: 11 };  // call luna
const BTN_SHIFT = { x: 263, y: 120, r: 11 }; // feline vision
const BTN_F   = { x: 263, y: 150, r: 11 };  // heart anchor

function _dist2(ax, ay, bx, by) { return (ax-bx)**2 + (ay-by)**2; }

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
  'KeyF':       'heart_anchor',
  'KeyM':       'chapter_menu',
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
  5:  'heart_anchor',
  9:  'pause',
};

const AXIS_THRESHOLD = 0.4;

export class InputSystem {
  constructor() {
    this._keys    = {};
    this._actions = {};
    this._canvas  = null;
    this._touchActive = false;
    this._hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp   = this._onKeyUp.bind(this);

    this._setupListeners();
    this._setupTouch();
  }

  setCanvas(canvas) { this._canvas = canvas; }

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

  // --- Touch (virtual D-pad) ---

  _setupTouch() {
    this._moveTouchId  = null;
    this._btnTouches   = new Map(); // touchId → action
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

  // Convert client coordinates to logical canvas space (320×180)
  _toLogical(clientX, clientY) {
    if (!this._canvas) return { x: clientX, y: clientY };
    const r = this._canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left) / r.width  * 320,
      y: (clientY - r.top)  / r.height * 180,
    };
  }

  _dpadAction(lx, ly) {
    const dx = lx - DPAD_CX, dy = ly - DPAD_CY;
    const DEAD = 6;
    return {
      left:  dx < -DEAD,
      right: dx >  DEAD,
      up:    dy < -DEAD,
      down:  dy >  DEAD,
    };
  }

  _onTouchStart(e) {
    e.preventDefault();
    this._touchActive = true;
    for (const t of e.changedTouches) {
      const { x, y } = this._toLogical(t.clientX, t.clientY);

      // Right-side action buttons (check smaller buttons first)
      if (_dist2(x, y, BTN_SHIFT.x, BTN_SHIFT.y) <= BTN_SHIFT.r ** 2) {
        this._actions['feline_vision'] = 'just_pressed';
        this._btnTouches.set(t.identifier, 'feline_vision');
        continue;
      }
      if (_dist2(x, y, BTN_F.x, BTN_F.y) <= BTN_F.r ** 2) {
        this._actions['heart_anchor'] = 'just_pressed';
        this._btnTouches.set(t.identifier, 'heart_anchor');
        continue;
      }
      if (_dist2(x, y, BTN_E.x, BTN_E.y) <= BTN_E.r ** 2) {
        this._actions['interact'] = 'just_pressed';
        this._btnTouches.set(t.identifier, 'interact');
        continue;
      }
      if (_dist2(x, y, BTN_Q.x, BTN_Q.y) <= BTN_Q.r ** 2) {
        this._actions['call_luna'] = 'just_pressed';
        this._btnTouches.set(t.identifier, 'call_luna');
        continue;
      }

      // D-pad zone (left half broadly, centered on DPAD_CX/CY)
      if (x < 160 && this._moveTouchId == null) {
        this._moveTouchId = t.identifier;
        const dir = this._dpadAction(x, y);
        this._setAxisAction('move_left',  dir.left);
        this._setAxisAction('move_right', dir.right);
        this._setAxisAction('move_up',    dir.up);
        this._setAxisAction('move_down',  dir.down);
      }
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== this._moveTouchId) continue;
      const { x, y } = this._toLogical(t.clientX, t.clientY);
      const dir = this._dpadAction(x, y);
      this._setAxisAction('move_left',  dir.left);
      this._setAxisAction('move_right', dir.right);
      this._setAxisAction('move_up',    dir.up);
      this._setAxisAction('move_down',  dir.down);
    }
  }

  _onTouchEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === this._moveTouchId) {
        this._setAxisAction('move_left',  false);
        this._setAxisAction('move_right', false);
        this._setAxisAction('move_up',    false);
        this._setAxisAction('move_down',  false);
        this._moveTouchId = null;
      }
      const action = this._btnTouches.get(t.identifier);
      if (action) {
        if (this._actions[action] === true || this._actions[action] === 'just_pressed') {
          this._actions[action] = 'just_released';
        }
        this._btnTouches.delete(t.identifier);
      }
    }
  }

  renderTouchControls(ctx) {
    // Auto-show controls on touch devices, hide on desktop until first touch
    if (!this._touchActive && !this._hasTouch) return;

    ctx.save();
    ctx.globalAlpha = 0.45;

    // D-pad — 4 triangle arrows
    const arrowDist = 16, arrowSize = 7;
    const dirs = [
      { dx: -arrowDist, dy: 0, angle: Math.PI },
      { dx:  arrowDist, dy: 0, angle: 0 },
      { dx: 0, dy: -arrowDist, angle: -Math.PI / 2 },
      { dx: 0, dy:  arrowDist, angle:  Math.PI / 2 },
    ];
    for (const { dx, dy, angle } of dirs) {
      const ax = DPAD_CX + dx, ay = DPAD_CY + dy;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(ax + Math.cos(angle) * arrowSize, ay + Math.sin(angle) * arrowSize);
      ctx.lineTo(ax + Math.cos(angle + 2.4) * arrowSize * 0.7, ay + Math.sin(angle + 2.4) * arrowSize * 0.7);
      ctx.lineTo(ax + Math.cos(angle - 2.4) * arrowSize * 0.7, ay + Math.sin(angle - 2.4) * arrowSize * 0.7);
      ctx.closePath();
      ctx.fill();
    }

    // Outer D-pad ring
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(DPAD_CX, DPAD_CY, DPAD_R, 0, Math.PI * 2);
    ctx.stroke();

    // ── Right-side action buttons (2 columns × 2 rows) ──────────────────────

    // Button E (interact) — bottom-right, largest
    ctx.fillStyle = '#C8A9FF';
    ctx.beginPath();
    ctx.arc(BTN_E.x, BTN_E.y, BTN_E.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', BTN_E.x, BTN_E.y + 1);

    // Button Q (call luna)
    ctx.fillStyle = '#7EC8E3';
    ctx.beginPath();
    ctx.arc(BTN_Q.x, BTN_Q.y, BTN_Q.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '8px VT323, monospace';
    ctx.fillText('Q', BTN_Q.x, BTN_Q.y + 1);

    // Button Shift (feline vision) — top-left
    ctx.fillStyle = '#FFD97D';
    ctx.beginPath();
    ctx.arc(BTN_SHIFT.x, BTN_SHIFT.y, BTN_SHIFT.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7EC8E3';
    ctx.font = '8px VT323, monospace';
    ctx.fillText('👁', BTN_SHIFT.x, BTN_SHIFT.y + 1);

    // Button F (heart anchor)
    ctx.fillStyle = '#FF8C8C';
    ctx.beginPath();
    ctx.arc(BTN_F.x, BTN_F.y, BTN_F.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '8px VT323, monospace';
    ctx.fillText('F', BTN_F.x, BTN_F.y + 1);

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }
}
