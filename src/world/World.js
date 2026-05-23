import { ProceduralTilemap } from './ProceduralTilemap.js';
import { NPC } from '../entities/NPC.js';
import { CollisionSystem } from './CollisionSystem.js';

const INTERACT_RANGE = 20;
const EXIT_INDICATOR_COLOR = 'rgba(255, 255, 180, 0.25)';

export class World {
  constructor() {
    this.loaded   = false;
    this.tilemap  = null;
    this._camera  = null;
    this._palette = {};
    this._npcs    = [];
    this._objects      = [];
    this._exits        = [];
    this._itemTriggers = [];
    this._zoneDef      = null;
  }

  setCamera(camera) { this._camera = camera; }

  // Called by SceneManager when loading a new zone
  load(zoneDef, save = null) {
    this._zoneDef = zoneDef;
    this._palette = zoneDef.palette ?? {};

    this.tilemap = new ProceduralTilemap(zoneDef.grid, {
      tileSize:   zoneDef.tileSize ?? 16,
      solidChars: zoneDef.solidChars ?? '#f',
    });

    // Build NPC list — skip NPCs whose spawnFlag is unset or doneFlag is set
    this._npcs = (zoneDef.npcs ?? []).flatMap(def => {
      if (def.spawnFlag && !save?.getFlag(def.spawnFlag)) return [];
      if (def.doneFlag  &&  save?.getFlag(def.doneFlag))  return [];
      const npc = new NPC(def.id, def.x, def.y, {
        color:      def.color,
        dialogueId: def.dialogueId,
        label:      def.label ?? '',
      });
      return [npc];
    });

    this._objects      = (zoneDef.objects ?? []).map(o => ({ ...o }));
    // Filter exits by condition — similar to NPC spawnFlag logic
    this._exits = (zoneDef.exits ?? []).filter(e => {
      if (!e.condition) return true;
      if (e.condition.startsWith('flag:')) return !!save?.getFlag(e.condition.slice(5));
      return true;
    }).map(e => ({ ...e, id: e.id }));
    this._itemTriggers = (zoneDef.items ?? []).map(i => ({ ...i }));

    this.loaded = true;
  }

  unload() {
    this.loaded        = false;
    this.tilemap       = null;
    this._npcs         = [];
    this._objects      = [];
    this._exits        = [];
    this._itemTriggers = [];
    this._zoneDef      = null;
  }

  // Returns the nearest NPC within range, or null
  nearestNPC(wx, wy, range) {
    let nearest  = null;
    let nearestD = Infinity;
    for (const npc of this._npcs) {
      if (!npc.active || !npc.dialogueId) continue;
      const dx = npc.centerX() - wx;
      const dy = npc.centerY() - wy;
      const d  = Math.hypot(dx, dy);
      if (d <= range && d < nearestD) { nearest = npc; nearestD = d; }
    }
    return nearest;
  }

  // Returns the nearest inspectable object within range, or null
  nearestObject(wx, wy, range) {
    let nearest  = null;
    let nearestD = Infinity;
    for (const obj of this._objects) {
      const cx = obj.x + (obj.width  ?? 16) / 2;
      const cy = obj.y + (obj.height ?? 16) / 2;
      const d  = Math.hypot(cx - wx, cy - wy);
      if (d <= range && d < nearestD) { nearest = obj; nearestD = d; }
    }
    return nearest;
  }

  // Returns exit rect that overlaps the given entity, or null
  overlappingExit(entity) {
    for (const exit of this._exits) {
      if (CollisionSystem.overlaps(entity, exit)) return exit;
    }
    return null;
  }

  get exits()       { return this._exits; }
  get voidZoneId()  { return this._zoneDef?.voidZoneId ?? null; }
  get realZoneId()  { return this._zoneDef?.realZoneId ?? null; }

  // Fire item:picked for any item trigger Mateo walks over (idempotent via save flag)
  // echoManager is optional — when provided, items with guardedByEcho:true are blocked
  // while an active EchoMinor (has .fleeing property) is within 30px of the item centre.
  checkItemTriggers(entity, save, eventBus, echoManager = null) {
    for (let i = this._itemTriggers.length - 1; i >= 0; i--) {
      const trigger = this._itemTriggers[i];
      if (save.getFlag(trigger.pickFlag)) {
        this._itemTriggers.splice(i, 1);
        continue;
      }

      // Guard check — nearby EchoMinor blocks pickup
      if (trigger.guardedByEcho && echoManager) {
        const cx = trigger.x + (trigger.width  ?? 16) / 2;
        const cy = trigger.y + (trigger.height ?? 16) / 2;
        const blocked = echoManager.getAll().some(e =>
          e.active && e.fleeing !== undefined &&
          Math.hypot(e.centerX() - cx, e.centerY() - cy) < 30
        );
        if (blocked) continue;
      }

      if (CollisionSystem.overlaps(entity, trigger)) {
        save.setFlag(trigger.pickFlag, true);
        save.addItem(trigger.id);
        this._itemTriggers.splice(i, 1);
        eventBus.emit('item:picked', { itemId: trigger.id });
      }
    }
  }

  // Render a small glow for uncollected item triggers
  _renderItems(ctx) {
    for (const trigger of this._itemTriggers) {
      ctx.fillStyle = 'rgba(255, 230, 100, 0.6)';
      ctx.fillRect(trigger.x, trigger.y, trigger.width, trigger.height);
    }
  }

  // Returns NPC by id, or null
  getNPC(id) {
    return this._npcs.find(n => n.id === id) ?? null;
  }

  // Adds an externally-created NPC to the current scene
  addNPC(npc) {
    this._npcs.push(npc);
  }

  // ── Update / Render ───────────────────────────────────────────────────────────

  update(dt) {
    for (const npc of this._npcs) npc.update(dt);
  }

  setDimension(_dim) { /* reserved for future void world variant */ }

  render(ctx, alpha) {
    if (!this.loaded || !this.tilemap) return;

    const { tileWidth: tw, tileHeight: th } = this.tilemap;

    // Draw tiles (with camera culling)
    const cam = this._camera;
    const startCol = cam ? Math.max(0,                  Math.floor(cam.x / tw) - 1) : 0;
    const endCol   = cam ? Math.min(this.tilemap.cols,  Math.ceil((cam.x + cam.width)  / tw) + 1) : this.tilemap.cols;
    const startRow = cam ? Math.max(0,                  Math.floor(cam.y / th) - 1) : 0;
    const endRow   = cam ? Math.min(this.tilemap.rows,  Math.ceil((cam.y + cam.height) / th) + 1) : this.tilemap.rows;

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const ch    = this.tilemap.charAt(col, row);
        const color = this._palette[ch];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(col * tw, row * th, tw, th);
      }
    }

    // Draw exit indicators (subtle highlight)
    ctx.fillStyle = EXIT_INDICATOR_COLOR;
    for (const exit of this._exits) {
      ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
    }

    // Draw inspectable objects
    for (const obj of this._objects) {
      ctx.fillStyle = obj.color ?? '#7BAFD4';
      ctx.fillRect(obj.x, obj.y, obj.width ?? 16, obj.height ?? 16);
      if (obj.label) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '8px VT323, monospace';
        ctx.fillText(obj.label, obj.x, obj.y - 2);
      }
    }

    // Draw items
    this._renderItems(ctx);

    // Draw NPCs
    for (const npc of this._npcs) {
      npc.render(ctx, alpha);
    }
  }
}
