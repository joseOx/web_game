const SAVE_KEY    = 'grietas_save_v1';
const SAVE_VERSION = '1.0';

export class SaveSystem {
  constructor() {
    this._flags     = {};
    this._inventory = new Set();  // Set of item IDs
    this._gameDay   = 1;
    this._timeOfDay = 'day';

    // References injected after construction
    this._sceneManager    = null;
    this._missionManager  = null;
    this._bondSystem      = null;
    this._luna            = null;
    this._mateo           = null;
    this._dimensionManager = null;
  }

  inject({ sceneManager, missionManager, bondSystem, luna, mateo, dimensionManager } = {}) {
    if (sceneManager)     this._sceneManager     = sceneManager;
    if (missionManager)   this._missionManager   = missionManager;
    if (bondSystem)       this._bondSystem        = bondSystem;
    if (luna)             this._luna              = luna;
    if (mateo)            this._mateo             = mateo;
    if (dimensionManager) this._dimensionManager  = dimensionManager;
  }

  // ── Flags ──────────────────────────────────────────────────────────────────

  setFlag(key, value) {
    this._flags[key] = value;
  }

  getFlag(key, defaultVal = false) {
    return this._flags[key] ?? defaultVal;
  }

  hasFlag(key) {
    return key in this._flags;
  }

  // ── Inventory ──────────────────────────────────────────────────────────────

  addItem(itemId) {
    this._inventory.add(itemId);
  }

  removeItem(itemId) {
    this._inventory.delete(itemId);
  }

  hasItem(itemId) {
    return this._inventory.has(itemId);
  }

  getInventory() {
    return [...this._inventory];
  }

  // ── Time ───────────────────────────────────────────────────────────────────

  getGameDay()  { return this._gameDay;  }
  getTimeOfDay(){ return this._timeOfDay; }

  advanceDay() {
    this._gameDay++;
    this.setFlag('game_day', this._gameDay);
  }

  setTimeOfDay(tod) {
    this._timeOfDay = tod;
    this.setFlag('time_of_day', tod);
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  save(slot = 0) {
    const data = {
      version:   SAVE_VERSION,
      timestamp: Date.now(),
      scene:     this._sceneManager?.currentZoneId ?? null,
      position:  this._mateo ? { x: this._mateo.x, y: this._mateo.y } : null,
      dimension: this._dimensionManager?.current ?? 'real',
      missions:  this._missionManager?.serialize() ?? {},
      flags:     { ...this._flags },
      inventory: [...this._inventory],
      bond:      this._bondSystem?.bond ?? 100,
      luna:      { dimension: this._luna?.dimension ?? 'real' },
      gameDay:   this._gameDay,
      timeOfDay: this._timeOfDay,
    };
    try {
      localStorage.setItem(`${SAVE_KEY}_slot${slot}`, JSON.stringify(data));
      return true;
    } catch {
      console.warn('SaveSystem: failed to write to localStorage');
      return false;
    }
  }

  load(slot = 0) {
    try {
      const raw = localStorage.getItem(`${SAVE_KEY}_slot${slot}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      console.warn('SaveSystem: failed to read from localStorage');
      return null;
    }
  }

  // Apply a loaded save data object to the live game state
  applyLoad(data) {
    if (!data) return false;

    this._flags     = { ...(data.flags ?? {}) };
    this._inventory = new Set(data.inventory ?? []);
    this._gameDay   = data.gameDay  ?? 1;
    this._timeOfDay = data.timeOfDay ?? 'day';

    if (this._bondSystem && data.bond != null) {
      this._bondSystem.bond = data.bond;
    }

    if (this._missionManager && data.missions) {
      this._missionManager.deserialize(data.missions);
    }

    return true;
  }

  hasSave(slot = 0) {
    return localStorage.getItem(`${SAVE_KEY}_slot${slot}`) !== null;
  }

  deleteSave(slot = 0) {
    localStorage.removeItem(`${SAVE_KEY}_slot${slot}`);
  }

  destroy() {
    this._flags     = {};
    this._inventory = new Set();
  }

  // ── Chapter 0 persistence ─────────────────────────────────────────────────

  saveChapter0() {
    const data = {
      version:   SAVE_VERSION,
      timestamp: Date.now(),
      flags:     { ...this._flags },
    };
    try {
      localStorage.setItem('grietas_chapter0_v1', JSON.stringify(data));
      return true;
    } catch {
      console.warn('SaveSystem: failed to write chapter0 save');
      return false;
    }
  }

  loadChapter0() {
    try {
      const raw = localStorage.getItem('grietas_chapter0_v1');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      console.warn('SaveSystem: failed to read chapter0 save');
      return null;
    }
  }

  hasChapter0Save() {
    return localStorage.getItem('grietas_chapter0_v1') !== null;
  }

  deleteChapter0Save() {
    localStorage.removeItem('grietas_chapter0_v1');
  }
}
