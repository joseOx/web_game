// ChapterManager — Gestión de capítulos desbloqueables y modo Luna-protagonista
// Persistencia separada del save principal (slot `grietas_chapter0_v1`)

export class ChapterManager {
  constructor() {
    this._unlocked = false;
    this._started  = false;
    this._completed = false;

    // Saved separately from main game
    this._chapter0Flags = {};

    // Injected singletons
    this._saveSystem   = null;
    this._eventBus     = null;
    this._sceneManager = null;
    this._dialogue     = null;
    this._transition   = null;
  }

  inject({ saveSystem, eventBus, sceneManager, dialogue, transition } = {}) {
    if (saveSystem)    this._saveSystem    = saveSystem;
    if (eventBus)      this._eventBus      = eventBus;
    if (sceneManager)  this._sceneManager  = sceneManager;
    if (dialogue)      this._dialogue      = dialogue;
    if (transition)    this._transition    = transition;
  }

  // ── Unlock state (derived from main save) ─────────────────────────────────

  isUnlocked() {
    return this._saveSystem?.getFlag('chapter_umbral_unlocked', false) ?? false;
  }

  isStarted()   { return this._started; }
  isCompleted() { return this._completed; }

  // ── Persistence (separate slot) ───────────────────────────────────────────

  saveChapter0() {
    const data = {
      version: '1.0',
      timestamp: Date.now(),
      flags: { ...this._chapter0Flags },
      started: this._started,
      completed: this._completed,
    };
    try {
      localStorage.setItem('grietas_chapter0_v1', JSON.stringify(data));
      return true;
    } catch {
      console.warn('ChapterManager: failed to write chapter0 save');
      return false;
    }
  }

  loadChapter0() {
    try {
      const raw = localStorage.getItem('grietas_chapter0_v1');
      if (!raw) return false;
      const data = JSON.parse(raw);
      this._chapter0Flags = data.flags ?? {};
      this._started   = data.started ?? false;
      this._completed = data.completed ?? false;
      return true;
    } catch {
      console.warn('ChapterManager: failed to read chapter0 save');
      return false;
    }
  }

  hasChapter0Save() {
    return localStorage.getItem('grietas_chapter0_v1') !== null;
  }

  deleteChapter0Save() {
    localStorage.removeItem('grietas_chapter0_v1');
  }

  getChapter0Flag(key, defaultVal = false) {
    return this._chapter0Flags[key] ?? defaultVal;
  }

  setChapter0Flag(key, value) {
    this._chapter0Flags[key] = value;
    this.saveChapter0();
  }

  // ── Chapter 0 lifecycle ───────────────────────────────────────────────────

  startChapter0() {
    if (!this.isUnlocked()) return;
    this._started  = true;
    this._completed = false;
    this._chapter0Flags = {};
    this.setChapter0Flag('chapter_0_started', true);
    this._eventBus?.emit('chapter0:started');
    // Cargar la primera zona del capítulo
    this._sceneManager?.load('R_CHAPTER0_HOUSE');
  }

  completeChapter0() {
    this._completed = true;
    this.setChapter0Flag('chapter_0_completed', true);
    this._eventBus?.emit('chapter0:completed');
    // Desbloquear cosmético/narrativo
    this._saveSystem?.setFlag('chapter_0_completed', true);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  destroy() {
    this._chapter0Flags = {};
    this._unlocked = false;
    this._started  = false;
    this._completed = false;
  }
}
