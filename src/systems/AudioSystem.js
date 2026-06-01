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

  // ── Synthesis ─────────────────────────────────────────────────────────────

  playTone(freq, duration, type = 'sine', gain = 0.08) {
    this._ensureContext();
    if (this._muted) return;
    const osc = this._ctx.createOscillator();
    const g   = this._ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, this._ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this._master);
    osc.start();
    osc.stop(this._ctx.currentTime + duration + 0.05);
  }

  startAmbient(isVoid) {
    this._ensureContext();
    this._stopAmbient();
    const freqs = isVoid ? [55, 82.5, 110] : [110, 165, 220];
    this._ambientNodes = freqs.map((f, i) => {
      const osc = this._ctx.createOscillator();
      const g   = this._ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, this._ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.025 - i * 0.005, this._ctx.currentTime + 2);
      osc.connect(g);
      g.connect(this._master);
      osc.start();
      return { osc, g };
    });
  }

  // ── Zone-based ambient ──────────────────────────────────────────────────────
  // Synthesized ambient profiles keyed by zone category.
  // Each profile defines oscillator params + LFO modulation + noise character.

  startZoneAmbient(zoneId, isVoid) {
    this._ensureContext();
    this._stopAmbient();

    const profile = ZONE_AMBIENT[zoneId] ?? ZONE_AMBIENT._default;
    // Void shifts everything down an octave and adds dissonance
    const octave = isVoid ? 0.5 : 1.0;
    const detuneAmount = isVoid ? 0.8 : 0;

    const nodes = [];
    const baseFreqs = profile.freqs ?? [110, 165, 220];
    const waveform   = profile.wave ?? 'sine';
    const baseVol    = (profile.volume ?? 0.025) * (isVoid ? 0.7 : 1.0);
    const lfoRate    = profile.lfoRate ?? 0;
    const lfoDepth   = profile.lfoDepth ?? 0;
    const noiseVol   = profile.noise ?? 0;

    for (let i = 0; i < baseFreqs.length; i++) {
      const osc = this._ctx.createOscillator();
      const g   = this._ctx.createGain();
      osc.type = waveform;
      osc.frequency.value = baseFreqs[i] * octave;
      if (detuneAmount) osc.detune.value = (i - 1) * detuneAmount * 15;

      // LFO modulation
      if (lfoRate > 0) {
        const lfo = this._ctx.createOscillator();
        const lfoG = this._ctx.createGain();
        lfo.frequency.value = lfoRate;
        lfoG.gain.value = lfoDepth * baseFreqs[i] * 0.3;
        lfo.connect(lfoG);
        lfoG.connect(osc.frequency);
        lfo.start();
        nodes.push({ osc: lfo, g: lfoG, lfo: true });
      }

      const vol = baseVol - i * (baseVol * 0.25);
      const fadeSecs = profile.fadeIn ?? 2;
      g.gain.setValueAtTime(0, this._ctx.currentTime);
      g.gain.linearRampToValueAtTime(vol, this._ctx.currentTime + fadeSecs);
      osc.connect(g);
      g.connect(this._master);
      osc.start();
      nodes.push({ osc, g });
    }

    // Noise layer (for wind/waves/texture)
    if (noiseVol > 0) {
      const bufSize = 2 * this._ctx.sampleRate;
      const noiseBuf = this._ctx.createBuffer(1, bufSize, this._ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noiseSrc = this._ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      noiseSrc.loop = true;
      const noiseFilter = this._ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = isVoid ? 400 : 800;
      const noiseG = this._ctx.createGain();
      const noiseFade = profile.fadeIn ?? 3;
      noiseG.gain.setValueAtTime(0, this._ctx.currentTime);
      noiseG.gain.linearRampToValueAtTime(noiseVol, this._ctx.currentTime + noiseFade);
      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(noiseG);
      noiseG.connect(this._master);
      noiseSrc.start();
      nodes.push({ osc: noiseSrc, g: noiseG, noise: true });
    }

    this._ambientNodes = nodes;
  }

  _stopAmbient() {
    if (!this._ambientNodes) return;
    const now = this._ctx.currentTime;
    for (const { osc, g } of this._ambientNodes) {
      g.gain.linearRampToValueAtTime(0, now + 1.5);
      osc.stop(now + 1.6);
    }
    this._ambientNodes = null;
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

// ── Zone ambient profiles ─────────────────────────────────────────────────────
// Synthesized — no external audio files needed.
// freqs: base chord (Hz), wave: oscillator type, volume: 0–1
// lfoRate: vibrato/tremolo freq, lfoDepth: modulation intensity
// noise: filtered white noise for texture (wind, waves, room tone)
// fadeIn: ramp-up seconds

const ZONE_AMBIENT = {
  // ── Real world ──────────────────────────────────────────────────────────────
  R_HOME:        { freqs: [131, 196, 262], wave: 'triangle', volume: 0.020, noise: 0.008, fadeIn: 2.5, desc: 'Hogar cálido' },
  R_HOME_ATTIC:  { freqs: [98, 147, 196],  wave: 'sine',     volume: 0.015, noise: 0.004, fadeIn: 3,   desc: 'Desván polvoriento' },
  R_HUB:         { freqs: [165, 220, 330], wave: 'triangle', volume: 0.022, noise: 0.012, lfoRate: 0.3, lfoDepth: 0.4, fadeIn: 2, desc: 'Plaza abierta' },
  R_LIGHTHOUSE:  { freqs: [110, 165, 220], wave: 'sine',     volume: 0.018, noise: 0.020, lfoRate: 0.15, lfoDepth: 0.5, fadeIn: 3, desc: 'Faro — viento marino' },
  R_SCHOOL:      { freqs: [196, 247, 330], wave: 'triangle', volume: 0.016, noise: 0.006, fadeIn: 2.5, desc: 'Aula silenciosa' },
  R_BEACH:       { freqs: [131, 196, 262], wave: 'sine',     volume: 0.020, noise: 0.028, lfoRate: 0.12, lfoDepth: 0.6, fadeIn: 3, desc: 'Playa — olas' },
  R_CEMETERY:    { freqs: [87, 110, 131],  wave: 'sine',     volume: 0.014, noise: 0.010, lfoRate: 0.08, lfoDepth: 0.3, fadeIn: 3.5, desc: 'Cementerio — quietud' },
  R_LIBRARY:     { freqs: [165, 220, 262], wave: 'sine',     volume: 0.014, noise: 0.005, fadeIn: 3,   desc: 'Biblioteca — eco suave' },

  // ── Void zones ──────────────────────────────────────────────────────────────
  V_HOME:        { freqs: [65, 82, 110],   wave: 'sine',     volume: 0.016, noise: 0.010, lfoRate: 0.2, lfoDepth: 0.4, fadeIn: 3, desc: 'Jardín marchito' },
  V_HUB:         { freqs: [73, 110, 147],  wave: 'sine',     volume: 0.018, noise: 0.014, lfoRate: 0.25, lfoDepth: 0.5, fadeIn: 2.5, desc: 'Plaza del Vacío' },
  V_LIGHTHOUSE:  { freqs: [55, 73, 98],    wave: 'sawtooth', volume: 0.014, noise: 0.024, lfoRate: 0.1, lfoDepth: 0.6, fadeIn: 3.5, desc: 'Faro hundido' },
  V_SCHOOL:      { freqs: [98, 131, 165],  wave: 'triangle', volume: 0.012, noise: 0.008, lfoRate: 0.18, lfoDepth: 0.3, fadeIn: 3, desc: 'Aula distorsionada' },
  V_BEACH:       { freqs: [65, 98, 131],   wave: 'sawtooth', volume: 0.015, noise: 0.030, lfoRate: 0.08, lfoDepth: 0.7, fadeIn: 3.5, desc: 'Naufragio — tormenta' },
  V_CEMETERY:    { freqs: [44, 55, 65],    wave: 'sine',     volume: 0.012, noise: 0.012, lfoRate: 0.06, lfoDepth: 0.2, fadeIn: 4, desc: 'Cripta — profundo' },
  V_LIBRARY:     { freqs: [82, 110, 131],  wave: 'sine',     volume: 0.012, noise: 0.008, lfoRate: 0.15, lfoDepth: 0.3, fadeIn: 3, desc: 'Archivo borrado' },
  V_UMBRAL:      { freqs: [131, 196, 262], wave: 'sine',     volume: 0.022, noise: 0.018, lfoRate: 0.4, lfoDepth: 0.8, fadeIn: 2, desc: 'Umbral — etéreo' },
  V_HEART:       { freqs: [98, 147, 196],  wave: 'triangle', volume: 0.016, noise: 0.006, lfoRate: 0.5, lfoDepth: 0.2, fadeIn: 3, desc: 'Corazón del Vacío' },
  V_THRONE:      { freqs: [55, 82, 110],   wave: 'sawtooth', volume: 0.020, noise: 0.016, lfoRate: 0.35, lfoDepth: 0.6, fadeIn: 2.5, desc: 'Trono — regio' },

  // ── Chapter 0 ───────────────────────────────────────────────────────────────
  R_CHAPTER0_HOUSE:  { freqs: [110, 165, 220], wave: 'triangle', volume: 0.018, noise: 0.006, fadeIn: 2.5, desc: 'Casa — hace 6 años' },
  R_CHAPTER0_GARDEN: { freqs: [131, 196, 247], wave: 'triangle', volume: 0.020, noise: 0.010, lfoRate: 0.2, lfoDepth: 0.3, fadeIn: 2.5, desc: 'Jardín nocturno' },

  // ── Fallback ────────────────────────────────────────────────────────────────
  _default:      { freqs: [110, 165, 220], wave: 'sine',     volume: 0.020, noise: 0.010, fadeIn: 2, desc: 'Genérico' },
};
