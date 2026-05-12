// AnimationComponent — attached to entities via addComponent('animation', ...)
// AnimationSystem     — global system that advances all registered components each frame

export class AnimationComponent {
  // states: { stateName: AnimationState }
  // AnimationState: { frames: [{sx,sy,sw,sh}], frameDuration (ms), loop, spritesheet }
  constructor(states, initialState) {
    this.entity      = null;  // set by Entity.addComponent
    this.states      = states;
    this.currentState = initialState ?? Object.keys(states)[0];
    this._frame      = 0;
    this._elapsed    = 0;
    this._done       = false; // true after a non-looping animation finishes
  }

  setState(name) {
    if (name === this.currentState) return;
    if (!this.states[name]) {
      console.warn(`AnimationComponent: unknown state "${name}"`);
      return;
    }
    this.currentState = name;
    this._frame   = 0;
    this._elapsed = 0;
    this._done    = false;
  }

  getState() { return this.currentState; }

  isDone() { return this._done; }

  // Returns { spritesheet, sx, sy, sw, sh } for the current frame, or null if no sprite.
  currentFrame() {
    const state = this.states[this.currentState];
    if (!state) return null;
    const frame = state.frames[this._frame];
    return frame ? { spritesheet: state.spritesheet ?? null, ...frame } : null;
  }

  update(dt) {
    const state = this.states[this.currentState];
    if (!state || state.frames.length === 0) return;
    if (this._done) return;

    this._elapsed += dt;
    const duration = state.frameDuration ?? 100;

    while (this._elapsed >= duration) {
      this._elapsed -= duration;
      this._frame++;
      if (this._frame >= state.frames.length) {
        if (state.loop !== false) {
          this._frame = 0;
        } else {
          this._frame = state.frames.length - 1;
          this._done  = true;
          break;
        }
      }
    }
  }

  destroy() {}
}

// ------------------------------------------------------------------
// AnimationSystem — global updater (optional; components self-update
// via entity.update → component.update, but this can batch them).
// ------------------------------------------------------------------
export class AnimationSystem {
  constructor() {
    this._components = new Set();
  }

  register(component) {
    this._components.add(component);
  }

  unregister(component) {
    this._components.delete(component);
  }

  update(dt) {
    for (const c of this._components) {
      c.update(dt);
    }
  }

  destroy() {
    this._components.clear();
  }
}

// ------------------------------------------------------------------
// Helper — build a spritesheet animation state from a grid layout.
// tileW/tileH: size of each frame in the spritesheet.
// row: which row in the sheet (0-indexed).
// count: number of frames.
// ------------------------------------------------------------------
export function buildAnimState({ spritesheet = null, tileW, tileH, row, count, frameDuration = 100, loop = true } = {}) {
  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push({ sx: i * tileW, sy: row * tileH, sw: tileW, sh: tileH });
  }
  return { spritesheet, frames, frameDuration, loop };
}
