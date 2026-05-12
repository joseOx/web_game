// Bond levels (bond value → 0–100)
export const BOND_LEVEL = {
  HEALTHY:  { min: 70, max: 100 },
  WARNING:  { min: 40, max: 70  },  // void overlays on real world
  DANGER:   { min: 15, max: 40  },  // Ecos notice Mateo
  CRITICAL: { min: 0,  max: 15  },  // void affects Mateo physically
};

const MAX_DIST       = 400;   // px — degradation starts beyond this
const DECAY_RATE     = 5;     // bond points lost per second per 100px over MAX_DIST
const RECOVER_RATE   = 5;     // bond points recovered per second when close
const CRITICAL_THRESHOLD = 15;

export class BondSystem {
  constructor() {
    this.mateo = null;
    this.luna  = null;

    this.bond             = 100.0;
    this.bondCriticalCount = 0;
    this._criticalActive  = false;

    // External system hooks — set by their respective systems when available
    this.onLevelChange = null;   // fn(newLevel, oldLevel)
    this._lastLevel    = 'HEALTHY';
  }

  setEntities(mateo, luna) {
    this.mateo = mateo;
    this.luna  = luna;
  }

  // Called from SaveSystem.load()
  restore(savedBond) {
    this.bond = savedBond ?? 100;
  }

  update(dt) {
    if (!this.mateo || !this.luna) return;

    const dist = this.mateo.distTo(this.luna);

    if (dist > MAX_DIST) {
      const excess = dist - MAX_DIST;
      const decay  = (excess / 100) * DECAY_RATE * (dt / 1000);
      this.bond = Math.max(0, this.bond - decay);
    } else {
      this.bond = Math.min(100, this.bond + RECOVER_RATE * (dt / 1000));
    }

    this._updateCriticalState();
    this._detectLevelChange();
  }

  _updateCriticalState() {
    if (this.bond <= CRITICAL_THRESHOLD) {
      if (!this._criticalActive) {
        this._criticalActive = true;
        this.bondCriticalCount++;
        // AudioSystem.playSFX('bond_critical_loop') — hooked when AudioSystem is ready
      }
    } else {
      this._criticalActive = false;
    }
  }

  _detectLevelChange() {
    const newLevel = this.currentLevel();
    if (newLevel !== this._lastLevel) {
      this.onLevelChange?.(newLevel, this._lastLevel);
      this._lastLevel = newLevel;
    }
  }

  currentLevel() {
    if (this.bond > BOND_LEVEL.HEALTHY.min)  return 'HEALTHY';
    if (this.bond > BOND_LEVEL.WARNING.min)  return 'WARNING';
    if (this.bond > BOND_LEVEL.DANGER.min)   return 'DANGER';
    return 'CRITICAL';
  }

  // Normalized value 0.0–1.0 (full bond = 1.0)
  normalized() {
    return this.bond / 100;
  }

  // Returns void overlay intensity 0.0–1.0 for VisionSystem (used at WARNING level)
  voidOverlayIntensity() {
    if (this.bond >= BOND_LEVEL.HEALTHY.min) return 0;
    if (this.bond <= BOND_LEVEL.WARNING.min) return 1;
    return (BOND_LEVEL.HEALTHY.min - this.bond) / (BOND_LEVEL.HEALTHY.min - BOND_LEVEL.WARNING.min);
  }

  // Apply stability bonus from Diego ally (+15 pp max)
  applyStabilityBonus(bonusPct) {
    this.bond = Math.min(100, this.bond + bonusPct);
  }

  destroy() {
    this.mateo = null;
    this.luna  = null;
  }
}
