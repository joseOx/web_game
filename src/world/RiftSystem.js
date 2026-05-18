import { DIM } from './Dimension.js';

export class RiftSystem {
  constructor() {
    this._rifts     = new Map();   // id → Rift
    this._dimension = DIM.REAL;
    this._felineVisionActive = false;

    // Hooks set by external systems
    this._saveSystem     = null;
    this._missionManager = null;
    this._audioSystem    = null;
    this._eventBus       = null;
  }

  inject({ saveSystem, missionManager, audioSystem, eventBus } = {}) {
    if (saveSystem)     this._saveSystem     = saveSystem;
    if (missionManager) this._missionManager = missionManager;
    if (audioSystem)    this._audioSystem    = audioSystem;
    if (eventBus)       this._eventBus       = eventBus;
  }

  register(rift) {
    this._rifts.set(rift.id, rift);
    this._applyVisibility(rift);
    return this;
  }

  unregister(riftId) {
    this._rifts.delete(riftId);
  }

  get(riftId) {
    return this._rifts.get(riftId) ?? null;
  }

  getAll() {
    return [...this._rifts.values()];
  }

  // Called by DimensionManager when dimension changes
  updateVisibility(dim) {
    this._dimension = dim;
    for (const rift of this._rifts.values()) {
      this._applyVisibility(rift);
    }
  }

  setFelineVision(active) {
    this._felineVisionActive = active;
    for (const rift of this._rifts.values()) {
      this._applyVisibility(rift);
    }
  }

  _applyVisibility(rift) {
    if (rift.sealed) {
      rift._currentlyVisible = false;
      return;
    }
    if (this._dimension === DIM.VOID) {
      rift._currentlyVisible = rift.visibleInVoid;
    } else {
      rift._currentlyVisible = !rift._forceHiddenInReal &&
        (rift.visibleInReal || this._felineVisionActive);
    }
  }

  // Advance seal progress on a rift (called by LunaAI PURR_SEAL state)
  advanceSeal(riftId, amount) {
    const rift = this._rifts.get(riftId);
    if (!rift || rift.sealed) return;

    rift.sealProgress = Math.min(100, rift.sealProgress + amount);
    this._eventBus?.emit('rift:seal_progress', { riftId, progress: rift.sealProgress });

    if (rift.sealProgress >= 100) {
      this._completeSealing(rift);
    }
  }

  // Called directly from dialogue onExit for anchor-based sealing
  completeSealing(riftId) {
    const rift = this._rifts.get(riftId);
    if (!rift || rift.sealed) return;
    rift.sealProgress = 100;
    this._completeSealing(rift);
  }

  _completeSealing(rift) {
    rift.sealed   = true;
    rift.active   = false;
    rift._currentlyVisible = false;
    rift.sealProgress = 100;

    this._audioSystem?.playSFX('rift_seal');
    this._saveSystem?.setFlag(`rift_${rift.id}_sealed`, true);
    this._missionManager?.checkTrigger('rift_sealed', rift.id);
    this._eventBus?.emit('rift:sealed', {
      riftId:  rift.id,
      x:       rift.x + (rift.width  ?? 16) / 2,
      y:       rift.y + (rift.height ?? 16) / 2,
      emotion: rift.emotion,
    });
  }

  // Returns the nearest unsealed rift within range of (x, y), or null
  nearestUnsealedInRange(x, y, range) {
    let nearest  = null;
    let nearestD = Infinity;
    for (const rift of this._rifts.values()) {
      if (rift.sealed || !rift.active) continue;
      const dx = (rift.x + rift.width  / 2) - x;
      const dy = (rift.y + rift.height / 2) - y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d <= range && d < nearestD) {
        nearest  = rift;
        nearestD = d;
      }
    }
    return nearest;
  }

  update(dt) {
    for (const rift of this._rifts.values()) {
      rift.update(dt);
    }
  }

  render(ctx, alpha) {
    for (const rift of this._rifts.values()) {
      rift.render(ctx, alpha);
    }
  }

  clear() {
    this._rifts.clear();
  }

  destroy() {
    this.clear();
  }
}
