import { ProceduralTilemap } from './ProceduralTilemap.js';
import { NPC } from '../entities/NPC.js';
import { CollisionSystem } from './CollisionSystem.js';

const INTERACT_RANGE = 20;
const EXIT_INDICATOR_COLOR = 'rgba(255, 255, 180, 0.25)';

export class World {
  constructor() {
    this.loaded   = false;
    this.tilemap  = null;  // ProceduralTilemap — exposed for SceneManager to set on CollisionSystem
    this._palette = {};
    this._npcs    = [];
    this._objects      = [];
    this._exits        = [];
    this._itemTriggers = [];
    this._zoneDef      = null;
  }

  // Called by SceneManager when loading a new zone
  load(zoneDef) {
    this._zoneDef = zoneDef;
    this._palette = zoneDef.palette ?? {};

    this.tilemap = new ProceduralTilemap(zoneDef.grid, {
      tileSize:   zoneDef.tileSize ?? 16,
      solidChars: zoneDef.solidChars ?? '#f',
    });

    // Build NPC list
    this._npcs = (zoneDef.npcs ?? []).map(def => {
      const npc = new NPC(def.id, def.x, def.y, {
        color:      def.color,
        dialogueId: def.dialogueId,
        label:      def.label ?? '',
      });
      return npc;
    });

    this._objects      = (zoneDef.objects ?? []).map(o => ({ ...o }));
    this._exits        = (zoneDef.exits ?? []).map(e => ({ ...e }));
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
  checkItemTriggers(entity, save, eventBus) {
    for (let i = this._itemTriggers.length - 1; i >= 0; i--) {
      const trigger = this._itemTriggers[i];
      if (save.getFlag(trigger.pickFlag)) {
        this._itemTriggers.splice(i, 1);
        continue;
      }
      console.log(`[item] mateo(${Math.round(entity.x)},${Math.round(entity.y)}) item(${trigger.x},${trigger.y},${trigger.width}x${trigger.height}) overlap=${CollisionSystem.overlaps(entity, trigger)}`);
      if (CollisionSystem.overlaps(entity, trigger)) {
        save.setFlag(trigger.pickFlag, true);
        save.addItem(trigger.id);
        this._itemTriggers.splice(i, 1);
        eventBus.emit('item:picked', { itemId: trigger.id });
        console.log(`[item] recogido: ${trigger.id}`);
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

  // ── Update / Render ───────────────────────────────────────────────────────────

  update(_dt) { /* static world — NPCs don't update here */ }

  setDimension(_dim) { /* reserved for future void world variant */ }

  render(ctx, alpha) {
    if (!this.loaded || !this.tilemap) return;

    const { tileWidth: tw, tileHeight: th } = this.tilemap;

    // Draw tiles
    for (let row = 0; row < this.tilemap.rows; row++) {
      for (let col = 0; col < this.tilemap.cols; col++) {
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
