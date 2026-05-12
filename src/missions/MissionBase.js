export const MISSION_STATUS = {
  LOCKED:    'LOCKED',
  ACTIVE:    'ACTIVE',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
};

export class MissionBase {
  // config: { id, title, steps: [{ description }] }
  constructor(config) {
    this.id          = config.id;
    this.title       = config.title;
    this.steps       = config.steps ?? [];
    this.status      = MISSION_STATUS.LOCKED;
    this.currentStep = 0;

    // Injected by MissionManager
    this._saveSystem  = null;
    this._eventBus    = null;
  }

  inject({ saveSystem, eventBus } = {}) {
    this._saveSystem = saveSystem;
    this._eventBus   = eventBus;
  }

  isLocked()     { return this.status === MISSION_STATUS.LOCKED;    }
  isActive()     { return this.status === MISSION_STATUS.ACTIVE;    }
  isCompleted()  { return this.status === MISSION_STATUS.COMPLETED; }
  isFailed()     { return this.status === MISSION_STATUS.FAILED;    }
  getStep()      { return this.currentStep; }

  activate() {
    if (!this.isLocked()) return;
    this.status = MISSION_STATUS.ACTIVE;
    this._saveSystem?.setFlag(`mission_${this.id}_active`, true);
    this._eventBus?.emit('mission:activated', { id: this.id });
    this.onActivate();
  }

  advanceStep() {
    if (!this.isActive()) return;
    this.currentStep++;
    this._eventBus?.emit('mission:step', { id: this.id, step: this.currentStep });
    if (this.currentStep >= this.steps.length) {
      this.complete();
    }
  }

  complete() {
    if (this.isCompleted()) return;
    this.status = MISSION_STATUS.COMPLETED;
    this._saveSystem?.setFlag(`mission_${this.id}_done`, true);
    this._saveSystem?.setFlag(`mission_${this.id}_active`, false);
    this._eventBus?.emit('mission:completed', { id: this.id });
    this.onComplete();
  }

  fail() {
    this.status = MISSION_STATUS.FAILED;
    this._eventBus?.emit('mission:failed', { id: this.id });
    this.onFail();
  }

  // Override in subclasses
  onActivate() {}
  onComplete()  {}
  onFail()      {}

  // Called by MissionManager with game events (dialogue completed, item picked, rift sealed…)
  onEvent(_eventName, _data) {}

  // Serialization for SaveSystem
  serialize() {
    return { status: this.status, currentStep: this.currentStep };
  }

  deserialize(data) {
    if (!data) return;
    this.status      = data.status      ?? MISSION_STATUS.LOCKED;
    this.currentStep = data.currentStep ?? 0;
  }
}
