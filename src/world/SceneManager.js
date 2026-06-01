import { Rift } from '../entities/Rift.js';
import { EchoMinor } from '../entities/EchoMinor.js';
import { EchoBound } from '../entities/EchoBound.js';
import { EchoMinorAI } from '../systems/EchoMinorAI.js';
import { EchoBoundAI } from '../systems/EchoBoundAI.js';

export class SceneManager {
  constructor() {
    this._zones     = new Map();   // id → zone definition object
    this._currentId = null;
    this._loading   = false;

    // Injected references
    this._world      = null;
    this._mateo      = null;
    this._luna       = null;
    this._echoes     = null;
    this._rifts      = null;
    this._camera     = null;
    this._collision  = null;
    this._dimension  = null;
    this._lighting   = null;
    this._audio      = null;
    this._dialogue   = null;
    this._transition = null;
    this._save       = null;
    this._eventBus   = null;
    this._heartAnchor = null;
  }

  inject({ world, mateo, luna, echoes, rifts, camera, collision, dimension,
           lighting, audio, dialogue, transition, save, eventBus, heartAnchorSystem } = {}) {
    if (world)      this._world      = world;
    if (mateo)      this._mateo      = mateo;
    if (luna)       this._luna       = luna;
    if (echoes)     this._echoes     = echoes;
    if (rifts)      this._rifts      = rifts;
    if (camera)     this._camera     = camera;
    if (collision)  this._collision  = collision;
    if (dimension)  this._dimension  = dimension;
    if (lighting)   this._lighting   = lighting;
    if (audio)      this._audio      = audio;
    if (dialogue)   this._dialogue   = dialogue;
    if (transition) this._transition = transition;
    if (save)       this._save       = save;
    if (eventBus)   this._eventBus   = eventBus;
    if (heartAnchorSystem) this._heartAnchor = heartAnchorSystem;
  }

  register(zoneDef) {
    this._zones.set(zoneDef.id, zoneDef);
    return this;
  }

  get currentZoneId() { return this._currentId; }

  // Called every frame from main update loop
  checkExits(mateo) {
    if (this._loading || !this._world.loaded) return;
    const exit = this._world.overlappingExit(mateo);
    if (!exit) return;
    if (exit.switchDim) {
      this.switchDimension(exit.targetZone, exit.switchDim, exit.targetSpawn ?? 'default');
    } else {
      this.load(exit.targetZone, exit.targetSpawn);
    }
  }

  // Switch dimension AND load the counterpart zone in one combined transition.
  async switchDimension(targetZoneId, newDim, spawnName = 'default') {
    if (this._loading) return;
    if (!this._zones.has(targetZoneId)) {
      console.warn(`SceneManager: zone "${targetZoneId}" not registered`);
      return;
    }
    this._loading = true;
    const zoneDef = this._zones.get(targetZoneId);

    await this._transition.playFull('dimension_shift');

    this._rifts.clear();
    this._echoes.clear();
    this._world.unload();

    this._world.load(zoneDef, this._save);
    const tm = this._world.tilemap;
    this._collision.setTilemap(tm);
    this._camera.setBounds(tm.widthPx, tm.heightPx);

    // Keep Mateo's approximate position (dimension switch = same location)
    this._mateo.vx = this._mateo.vy = 0;
    this._luna.vx  = this._luna.vy  = 0;
    this._camera.snapToTarget?.();

    for (const riftDef of zoneDef.rifts ?? []) {
      const rift = new Rift(riftDef);
      if (this._save?.getFlag(`rift_${rift.id}_sealed`)) {
        rift.sealed = true; rift.active = false; rift.sealProgress = 100;
      }
      this._rifts.register(rift);
    }

    for (const def of zoneDef.echoes ?? []) {
      this._spawnEcho(def);
    }

    // Apply dimension state without a separate transition
    this._dimension?.applyDimension(newDim);
    this._echoes.setDimension(newDim);

    if (zoneDef.music) this._audio?.crossfadeTo(zoneDef.music);

    this._currentId = targetZoneId;
    this._loading   = false;
    this._eventBus?.emit('zone:loaded', { zoneId: targetZoneId });
  }

  async load(zoneId, spawnName = 'default') {
    if (this._loading) return;
    if (!this._zones.has(zoneId)) {
      console.warn(`SceneManager: zone "${zoneId}" not registered`);
      return;
    }

    this._loading = true;
    const zoneDef = this._zones.get(zoneId);

    // ── Fade out ──────────────────────────────────────────────────────────────
    await this._transition.playFull('dimension_shift');

    // ── Clear previous zone ───────────────────────────────────────────────────
    this._rifts.clear();
    this._echoes.clear();
    this._world.unload();

    // ── Load new zone ─────────────────────────────────────────────────────────
    this._world.load(zoneDef, this._save);

    const tm = this._world.tilemap;
    if (tm) {
      this._collision.setTilemap(tm);
      this._camera.setBounds(tm.widthPx, tm.heightPx);
    } else {
      // Zona abstracta (sin tilemap) — usar dimensiones por defecto
      this._collision.setTilemap(null);
      this._camera.setBounds(BASE_WIDTH, BASE_HEIGHT);
    }

    // ── Spawn entities ────────────────────────────────────────────────────────
    const spawn = zoneDef.spawns?.[spawnName] ?? zoneDef.spawns?.default ?? { x: 80, y: 80 };

    this._mateo.x = this._mateo.prevX = spawn.x;
    this._mateo.y = this._mateo.prevY = spawn.y;
    this._mateo.vx = this._mateo.vy = 0;

    this._luna.x = this._luna.prevX = spawn.x + 20;
    this._luna.y = this._luna.prevY = spawn.y;
    this._luna.vx = this._luna.vy = 0;

    this._camera.snapToTarget?.();

    // ── Create zone rifts ─────────────────────────────────────────────────────
    for (const riftDef of zoneDef.rifts ?? []) {
      const rift = new Rift(riftDef);
      if (this._save?.getFlag(`rift_${rift.id}_sealed`)) {
        rift.sealed = true;
        rift.active = false;
        rift.sealProgress = 100;
      }
      this._rifts.register(rift);
    }

    // ── Create zone echoes ────────────────────────────────────────────────────
    for (const def of zoneDef.echoes ?? []) {
      this._spawnEcho(def);
    }

    // ── Sync dimension state ──────────────────────────────────────────────────
    const currentDim = this._dimension?.current ?? 'real';
    this._rifts.updateVisibility(currentDim);
    this._echoes.setDimension(currentDim);

    // ── Audio ─────────────────────────────────────────────────────────────────
    if (zoneDef.music) this._audio?.crossfadeTo(zoneDef.music);

    // ── Done ──────────────────────────────────────────────────────────────────
    this._currentId = zoneId;
    this._loading   = false;
    this._eventBus?.emit('zone:loaded', { zoneId });
  }

  // ── Shared helpers ────────────────────────────────────────────────────────────

  _spawnEcho(def) {
    if (def.spawnFlag && !this._save?.getFlag(def.spawnFlag)) return;
    if (def.doneFlag  &&  this._save?.getFlag(def.doneFlag))  return;

    if (def.type === 'minor') {
      const em   = this._echoes.acquireMinor(def.id, def.x, def.y, { emotion: def.emotion });
      const emAI = new EchoMinorAI();
      emAI.inject({ echo: em, luna: this._luna, mateo: this._mateo,
        riftSystem: this._rifts, dimensionManager: this._dimension,
        heartAnchorSystem: this._heartAnchor });
      if (def.guard) emAI.setGuard();
      em.setAI(emAI);
      this._echoes.register(em);

    } else if (def.type === 'bound') {
      const eb   = new EchoBound(def.id, def.x, def.y,
        { emotion: def.emotion, dialogueId: def.dialogueId, visibleInReal: def.visibleInReal });
      const ebAI = new EchoBoundAI();
      ebAI.inject({ echo: eb, mateo: this._mateo, luna: this._luna,
        dialogueSystem: this._dialogue, dimensionManager: this._dimension,
        eventBus: this._eventBus });
      ebAI.configure({ separateByLuna: !!def.separateByLuna, evadeOnApproach: !!def.evadeOnApproach });
      eb.setAI(ebAI);
      this._echoes.register(eb);
    }
  }
}
