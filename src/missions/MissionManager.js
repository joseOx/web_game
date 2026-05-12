export class MissionManager {
  constructor() {
    this._missions = new Map();  // id → MissionBase
    this._saveSystem = null;
    this._eventBus   = null;
  }

  inject({ saveSystem, eventBus } = {}) {
    this._saveSystem = saveSystem;
    this._eventBus   = eventBus;
  }

  register(mission) {
    mission.inject({ saveSystem: this._saveSystem, eventBus: this._eventBus });
    this._missions.set(mission.id, mission);
    return this;
  }

  get(id) { return this._missions.get(id) ?? null; }

  // ── Convenience methods called from DialogueSystem actions and game events ──

  activate(id) {
    this._missions.get(id)?.activate();
  }

  complete(id) {
    this._missions.get(id)?.complete();
  }

  isActive(id) {
    return this._missions.get(id)?.isActive() ?? false;
  }

  isDone(id) {
    return this._missions.get(id)?.isCompleted() ?? false;
  }

  getStep(id) {
    return this._missions.get(id)?.getStep() ?? 0;
  }

  // Called by RiftSystem, DialogueSystem, etc. to forward events to all active missions
  checkTrigger(eventName, data) {
    for (const mission of this._missions.values()) {
      if (mission.isActive()) mission.onEvent(eventName, data);
    }
  }

  // Forward a named event to all active missions (alias used by EventBus listeners)
  dispatchEvent(eventName, data) {
    this.checkTrigger(eventName, data);
  }

  update(_dt) {
    // Most mission logic is event-driven. Nothing to tick here for now.
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize() {
    const out = {};
    for (const [id, m] of this._missions) {
      out[id] = m.serialize();
    }
    return out;
  }

  deserialize(data) {
    for (const [id, state] of Object.entries(data ?? {})) {
      this._missions.get(id)?.deserialize(state);
    }
  }

  destroy() {
    this._missions.clear();
  }
}
