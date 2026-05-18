// Piano mini-game for M02: player plays the correct 6-note melody to seal the rift.
// Uses raw keydown (not InputSystem) to avoid WASD conflicts while active.

const KEYS = [
  { key: 'a', note: 'Do',  freq: 261.63 },
  { key: 's', note: 'Re',  freq: 293.66 },
  { key: 'd', note: 'Mi',  freq: 329.63 },
  { key: 'f', note: 'Fa',  freq: 349.23 },
  { key: 'g', note: 'Sol', freq: 392.00 },
  { key: 'h', note: 'La',  freq: 440.00 },
  { key: 'j', note: 'Si',  freq: 493.88 },
  { key: 'k', note: "Do'", freq: 523.25 },
];

const MELODY         = ['a', 's', 'd', 'g', 'd', 'a']; // Do-Re-Mi-Sol-Mi-Do
const KEY_W          = 39;
const KEY_H          = 28;
const KEY_LEFT       = 4;
const PANEL_Y        = 128;
const PANEL_H        = 52;
const INTRO_DURATION = 2100;
const ERROR_DURATION = 600;
const WIN_DURATION   = 1500;
const FLASH_DURATION = 250;

const ST_IDLE  = 'IDLE';
const ST_INTRO = 'INTRO';
const ST_PLAY  = 'PLAY';
const ST_ERROR = 'ERROR';
const ST_WIN   = 'WIN';

export class PianoMiniGame {
  constructor() {
    this._audio      = null;
    this._eventBus   = null;

    this._state      = ST_IDLE;
    this._progress   = 0;
    this._timer      = 0;
    this._flashTimer = 0;
    this._pressedKey = null;
    this._isError    = false;

    this._keyHandler  = null;
    this._introTimers = [];
    this.active       = false;
  }

  inject({ audio, eventBus } = {}) {
    if (audio)    this._audio    = audio;
    if (eventBus) this._eventBus = eventBus;
  }

  start() {
    this._clearIntroTimers();
    this._state      = ST_INTRO;
    this._progress   = 0;
    this._timer      = INTRO_DURATION;
    this._flashTimer = 0;
    this._pressedKey = null;
    this._isError    = false;
    this.active      = true;
    this._registerKeyListener();

    // Play the melody as audio preview so the player hears what to reproduce
    const preview = [0, 1, 2, 4, 2, 0].map((ki, i) => ({ ki, t: i * 350 }));
    for (const { ki, t } of preview) {
      const kd = KEYS[ki];
      const id = setTimeout(() => {
        if (!this.active || this._state !== ST_INTRO) return;
        this._audio?.playTone(kd.freq, 0.32, 'sine', 0.13);
        this._pressedKey = kd.key;
        this._flashTimer = 280;
      }, t);
      this._introTimers.push(id);
    }
  }

  stop() {
    this._clearIntroTimers();
    this._removeKeyListener();
    this._state  = ST_IDLE;
    this.active  = false;
  }

  update(dt) {
    if (!this.active) return;

    if (this._flashTimer > 0) {
      this._flashTimer -= dt;
      if (this._flashTimer <= 0 && this._state === ST_PLAY) {
        this._pressedKey = null;
      }
    }

    switch (this._state) {
      case ST_INTRO:
        this._timer -= dt;
        if (this._timer <= 0) {
          this._state      = ST_PLAY;
          this._pressedKey = null;
        }
        break;

      case ST_ERROR:
        this._timer -= dt;
        if (this._timer <= 0) {
          this._progress   = 0;
          this._isError    = false;
          this._pressedKey = null;
          this._state      = ST_PLAY;
        }
        break;

      case ST_WIN:
        this._timer -= dt;
        if (this._timer <= 0) {
          this.stop();
          this._eventBus?.emit('piano:melody_complete');
        }
        break;
    }
  }

  render(ctx) {
    if (!this.active) return;

    // Panel background
    ctx.fillStyle = 'rgba(8, 6, 18, 0.90)';
    ctx.fillRect(0, PANEL_Y, 320, PANEL_H);

    ctx.shadowColor    = 'transparent';
    ctx.shadowOffsetX  = 0;
    ctx.shadowOffsetY  = 0;
    ctx.textAlign      = 'center';

    // Title
    if (this._state === ST_WIN) {
      ctx.fillStyle = '#7FD47F';
      ctx.font = '10px VT323, monospace';
      ctx.fillText('¡Melodía completada!', 160, PANEL_Y + 9);
    } else if (this._state === ST_INTRO) {
      ctx.fillStyle = '#FFD97D';
      ctx.font = '8px VT323, monospace';
      ctx.fillText('Do – Re – Mi – Sol – Mi – Do', 160, PANEL_Y + 9);
    } else {
      ctx.fillStyle = '#C8A9FF';
      ctx.font = '8px VT323, monospace';
      ctx.fillText('♪ Toca la melodía ♪', 160, PANEL_Y + 9);
    }

    // Progress dots
    const DOT_R  = 3;
    const DOT_Y  = PANEL_Y + 18;
    const totalW = MELODY.length * (DOT_R * 2 + 4) - 4;
    let dotX     = 160 - totalW / 2 + DOT_R;

    for (let i = 0; i < MELODY.length; i++) {
      let color;
      if (this._state === ST_WIN) {
        color = '#7FD47F';
      } else if (i < this._progress) {
        color = '#FFD97D';
      } else if (i === this._progress && this._isError) {
        color = '#FF6B6B';
      } else {
        color = 'rgba(255,255,255,0.22)';
      }
      ctx.beginPath();
      ctx.arc(dotX, DOT_Y, DOT_R, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      dotX += DOT_R * 2 + 4;
    }

    // Piano keys
    const KEY_Y = PANEL_Y + 24;

    for (let i = 0; i < KEYS.length; i++) {
      const kd      = KEYS[i];
      const kx      = KEY_LEFT + i * KEY_W;
      const isNext  = this._state === ST_PLAY && MELODY[this._progress] === kd.key;
      const isFlash = this._pressedKey === kd.key && this._flashTimer > 0;

      let fillColor;
      if (this._state === ST_WIN) {
        fillColor = '#3A7A3A';
      } else if (this._state === ST_ERROR && this._pressedKey === kd.key) {
        fillColor = '#7A2020';
      } else if (isFlash) {
        fillColor = '#6A5A10';
      } else if (isNext) {
        fillColor = '#2A2240';  // subtle hint for expected key
      } else {
        fillColor = '#16122A';
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(kx, KEY_Y, KEY_W - 1, KEY_H);

      ctx.strokeStyle = this._state === ST_WIN ? '#7FD47F'
        : (this._state === ST_ERROR && this._pressedKey === kd.key) ? '#FF6B6B'
        : isNext ? '#7060C0'
        : 'rgba(180,150,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(kx + 0.5, KEY_Y + 0.5, KEY_W - 2, KEY_H - 1);

      // Note label (top)
      ctx.fillStyle = this._state === ST_WIN ? '#9FE49F'
        : (this._state === ST_ERROR && this._pressedKey === kd.key) ? '#FF9999'
        : isFlash ? '#FFD97D'
        : isNext ? '#A090E8'
        : 'rgba(200,170,255,0.6)';
      ctx.font = '7px VT323, monospace';
      ctx.fillText(kd.note, kx + (KEY_W - 1) / 2, KEY_Y + 10);

      // Key letter (bottom)
      ctx.fillStyle = this._state === ST_WIN ? '#9FE49F'
        : (this._state === ST_ERROR && this._pressedKey === kd.key) ? '#FF9999'
        : isFlash ? '#FFD97D'
        : 'rgba(255,255,255,0.35)';
      ctx.font = '8px VT323, monospace';
      ctx.fillText(kd.key.toUpperCase(), kx + (KEY_W - 1) / 2, KEY_Y + 21);
    }

    ctx.textAlign = 'left';
  }

  // ── Private ───────────────────────────────────────────────────────────────────

  _onKeyDown(e) {
    if (!this.active || this._state === ST_INTRO || this._state === ST_WIN) return;
    const k  = e.key.toLowerCase();
    const kd = KEYS.find(x => x.key === k);
    if (!kd) return;
    e.preventDefault();

    this._audio?.playTone(kd.freq, 0.38, 'sine', 0.14);
    this._pressedKey = k;
    this._flashTimer = FLASH_DURATION;

    if (this._state === ST_ERROR) return;

    if (MELODY[this._progress] === k) {
      this._progress++;
      if (this._progress >= MELODY.length) {
        this._state = ST_WIN;
        this._timer = WIN_DURATION;
        setTimeout(() => this._audio?.playTone(523.25, 0.8, 'sine', 0.10), 0);
      }
    } else {
      this._isError = true;
      this._state   = ST_ERROR;
      this._timer   = ERROR_DURATION;
      this._audio?.playTone(100, 0.25, 'sawtooth', 0.07);
    }
  }

  _registerKeyListener() {
    this._keyHandler = (e) => this._onKeyDown(e);
    window.addEventListener('keydown', this._keyHandler);
  }

  _removeKeyListener() {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  }

  _clearIntroTimers() {
    for (const id of this._introTimers) clearTimeout(id);
    this._introTimers = [];
  }
}
