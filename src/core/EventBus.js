export class EventBus {
  constructor() {
    this._listeners = new Map(); // event → Set<{ fn, once }>
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add({ fn, once: false });
    return () => this.off(event, fn);
  }

  once(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add({ fn, once: true });
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const set = this._listeners.get(event);
    if (!set) return;
    for (const entry of set) {
      if (entry.fn === fn) { set.delete(entry); break; }
    }
  }

  emit(event, data) {
    const set = this._listeners.get(event);
    if (!set) return;
    for (const entry of [...set]) {   // snapshot — safe against mutation during emit
      entry.fn(data);
      if (entry.once) set.delete(entry);
    }
  }

  // Remove all listeners for an event (or all events if none specified)
  clear(event) {
    if (event) this._listeners.delete(event);
    else this._listeners.clear();
  }

  destroy() {
    this.clear();
  }
}
