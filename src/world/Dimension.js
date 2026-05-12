export const DIM = { REAL: 'real', VOID: 'void' };

export class DimensionManager {
  constructor() {
    this.current       = DIM.REAL;
    this.transitioning = false;

    // Hooks set by other systems after construction
    this._transitionFX   = null;
    this._lightingSystem = null;
    this._riftSystem     = null;
    this._audioSystem    = null;
    this._eventBus       = null;

    // Listeners registered before EventBus exists
    this._listeners = [];
  }

  // Inject dependencies to avoid circular imports
  inject({ transitionFX, lightingSystem, riftSystem, audioSystem, eventBus } = {}) {
    if (transitionFX)    this._transitionFX   = transitionFX;
    if (lightingSystem)  this._lightingSystem = lightingSystem;
    if (riftSystem)      this._riftSystem     = riftSystem;
    if (audioSystem)     this._audioSystem    = audioSystem;
    if (eventBus)        this._eventBus       = eventBus;
  }

  isVoid()  { return this.current === DIM.VOID; }
  isReal()  { return this.current === DIM.REAL; }

  // Manual listener — used before EventBus is wired
  onChange(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }

  async shiftTo(dim) {
    if (this.transitioning || dim === this.current) return;
    this.transitioning = true;

    if (this._transitionFX) {
      await this._transitionFX.play('dimension_shift');
    }

    const prev     = this.current;
    this.current   = dim;

    this._lightingSystem?.setDimension(dim);
    this._riftSystem?.updateVisibility(dim);

    if (this._audioSystem) {
      const track = dim === DIM.VOID ? 'void_ambient' : 'real_ambient';
      this._audioSystem.crossfadeTo(track);
    }

    this._eventBus?.emit('dimension:changed', { dim, prev });
    for (const fn of this._listeners) fn(dim, prev);

    this.transitioning = false;
  }

  async toggle() {
    await this.shiftTo(this.isVoid() ? DIM.REAL : DIM.VOID);
  }

  // Apply dimension state immediately, without playing a transition.
  // Used by SceneManager when it handles the transition itself (zone + dim switch).
  applyDimension(dim) {
    if (dim === this.current) return;
    const prev   = this.current;
    this.current = dim;
    this._lightingSystem?.setDimension(dim);
    this._riftSystem?.updateVisibility(dim);
    if (this._audioSystem) {
      this._audioSystem.crossfadeTo(dim === DIM.VOID ? 'void_ambient' : 'real_ambient');
    }
    this._eventBus?.emit('dimension:changed', { dim, prev });
    for (const fn of this._listeners) fn(dim, prev);
  }

  destroy() {
    this._listeners = [];
  }
}
