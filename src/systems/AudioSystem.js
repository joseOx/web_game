export class AudioSystem {
  constructor() {
    this._ctx        = null;   // AudioContext — created on first user gesture
    this._master     = null;
    this._tracks     = new Map();   // id → AudioBuffer
    this._sfx        = new Map();   // id → AudioBuffer
    this._current    = null;        // { source, gain, id }
    this._sfxVolume  = 0.7;
    this._musicVolume = 0.6;
    this._muted      = false;
    this._warnedMissing = new Set();
  }

  // AudioContext must be created after a user gesture (browser policy)
  _ensureContext() {
    if (this._ctx) return;
    this._ctx    = new AudioContext();
    this._master = this._ctx.createGain();
    this._master.connect(this._ctx.destination);
  }

  // Resume context if suspended (needed after page visibility change)
  resume() {
    this._ctx?.resume();
  }

  // Called by AssetLoader to register pre-decoded buffers
  registerMusic(id, buffer) {
    this._tracks.set(id, buffer);
  }

  registerSFX(id, buffer) {
    this._sfx.set(id, buffer);
  }

  // ── Music ──────────────────────────────────────────────────────────────────

  playMusic(id, { loop = true, volume = null, fadeIn = 1000 } = {}) {
    this._ensureContext();
    const buffer = this._tracks.get(id);
    if (!buffer) {
      if (!this._warnedMissing.has(id)) { console.warn(`AudioSystem: music "${id}" not loaded`); this._warnedMissing.add(id); }
      return null;
    }

    const source = this._ctx.createBufferSource();
    const gain   = this._ctx.createGain();
    source.buffer = buffer;
    source.loop   = loop;

    const vol = volume ?? this._musicVolume;
    gain.gain.setValueAtTime(0, this._ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this._ctx.currentTime + fadeIn / 1000);

    source.connect(gain);
    gain.connect(this._master);
    source.start();

    return { source, gain, id };
  }

  stopMusic(track, fadeOut = 800) {
    if (!track || !track.gain || !this._ctx) return;
    const now = this._ctx.currentTime;
    track.gain.gain.linearRampToValueAtTime(0, now + fadeOut / 1000);
    track.source.stop(now + fadeOut / 1000 + 0.05);
  }

  crossfadeTo(newId, duration = 2000) {
    if (!newId) return;
    if (this._current?.id === newId) return;

    this._ensureContext();
    if (this._current) this.stopMusic(this._current, duration);
    this._current = this.playMusic(newId, { fadeIn: duration });
    if (!this._current) this._current = { id: newId, source: null, gain: null };
    else this._current.id = newId;
  }

  // ── SFX ───────────────────────────────────────────────────────────────────

  playSFX(id, { volume = null, pan = 0 } = {}) {
    this._ensureContext();
    const buffer = this._sfx.get(id);
    if (!buffer) {
      if (!this._warnedMissing.has(id)) { console.warn(`AudioSystem: SFX "${id}" not loaded`); this._warnedMissing.add(id); }
      return;
    }

    const source = this._ctx.createBufferSource();
    const gain   = this._ctx.createGain();
    gain.gain.value = volume ?? this._sfxVolume;

    source.buffer = buffer;
    source.connect(gain);

    if (pan !== 0) {
      const panner = this._ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      gain.connect(panner);
      panner.connect(this._master);
    } else {
      gain.connect(this._master);
    }

    source.start();
  }

  // Distance-based SFX volume
  playSFXPositional(id, sourceX, sourceY, listenerX, listenerY, maxDist = 600) {
    const dx   = sourceX - listenerX;
    const dy   = sourceY - listenerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const vol  = Math.max(0, 1 - dist / maxDist) * this._sfxVolume;
    if (vol > 0.01) this.playSFX(id, { volume: vol });
  }

  // ── Volume ────────────────────────────────────────────────────────────────

  setMasterVolume(v) {
    if (this._master) this._master.gain.value = Math.max(0, Math.min(1, v));
  }

  setMusicVolume(v) {
    this._musicVolume = Math.max(0, Math.min(1, v));
    if (this._current) this._current.gain.gain.value = this._musicVolume;
  }

  setSFXVolume(v) { this._sfxVolume = Math.max(0, Math.min(1, v)); }

  mute()   { this._muted = true;  this.setMasterVolume(0); }
  unmute() { this._muted = false; this.setMasterVolume(1); }

  destroy() {
    this._current = null;
    this._ctx?.close();
    this._ctx = null;
  }
}
