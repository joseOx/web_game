import { TILE_SIZE } from '../core/Game.js';

// Layer names as defined in level_design.md
export const LAYER = {
  BACKGROUND: 'background',
  MIDGROUND:  'midground',
  FOREGROUND: 'foreground',
  COLLISION:  'collision',
  TRIGGERS:   'triggers',
  ENTITIES:   'entities',
};

export class Tilemap {
  constructor(json) {
    this.widthTiles  = json.width;
    this.heightTiles = json.height;
    this.tileWidth   = json.tilewidth  || TILE_SIZE;
    this.tileHeight  = json.tileheight || TILE_SIZE;
    this.widthPx     = this.widthTiles  * this.tileWidth;
    this.heightPx    = this.heightTiles * this.tileHeight;

    // Parse tilesets — support single embedded tileset
    this.tilesets = json.tilesets.map(ts => ({
      firstGid:  ts.firstgid,
      name:      ts.name,
      imagePath: ts.image,       // relative path from Tiled
      imageW:    ts.imagewidth,
      imageH:    ts.imageheight,
      columns:   ts.columns,
      tileCount: ts.tilecount,
    }));

    // Map layer name → layer data
    this.layers = new Map();
    for (const layer of json.layers) {
      if (layer.type === 'tilelayer') {
        this.layers.set(layer.name, {
          name:    layer.name,
          data:    layer.data,     // flat array, row-major, 1-indexed GIDs (0 = empty)
          width:   layer.width,
          height:  layer.height,
          visible: layer.visible !== false,
          opacity: layer.opacity  ?? 1,
        });
      } else if (layer.type === 'objectgroup') {
        this.layers.set(layer.name, {
          name:    layer.name,
          objects: layer.objects ?? [],
          type:    'objectgroup',
        });
      }
    }
  }

  getLayer(name) {
    return this.layers.get(name) ?? null;
  }

  // Returns the GID at tile coords (col, row) on the given layer name.
  // Returns 0 if out of bounds or empty.
  getTile(layerName, col, row) {
    const layer = this.getLayer(layerName);
    if (!layer || layer.type === 'objectgroup') return 0;
    if (col < 0 || row < 0 || col >= layer.width || row >= layer.height) return 0;
    return layer.data[row * layer.width + col];
  }

  // Returns true if the tile at (col, row) on the collision layer is solid (GID > 0).
  isSolid(col, row) {
    return this.getTile(LAYER.COLLISION, col, row) > 0;
  }

  // Returns true if the pixel rect (px, py, pw, ph) overlaps any solid tile.
  rectOverlapsSolid(px, py, pw, ph) {
    const left   = Math.floor(px / this.tileWidth);
    const right  = Math.floor((px + pw - 1) / this.tileWidth);
    const top    = Math.floor(py / this.tileHeight);
    const bottom = Math.floor((py + ph - 1) / this.tileHeight);
    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (this.isSolid(col, row)) return true;
      }
    }
    return false;
  }

  // Returns objects from the 'triggers' layer filtered by a type property.
  getTriggersByType(type) {
    const layer = this.getLayer(LAYER.TRIGGERS);
    if (!layer || layer.type !== 'objectgroup') return [];
    return layer.objects.filter(o => o.type === type || o.properties?.find(p => p.name === 'type' && p.value === type));
  }

  // Returns objects from the 'entities' layer.
  getEntityObjects() {
    const layer = this.getLayer(LAYER.ENTITIES);
    if (!layer || layer.type !== 'objectgroup') return [];
    return layer.objects;
  }

  // Resolve the tileset for a given GID.
  tilesetForGid(gid) {
    for (let i = this.tilesets.length - 1; i >= 0; i--) {
      if (gid >= this.tilesets[i].firstGid) return this.tilesets[i];
    }
    return null;
  }

  // Local tile index within the tileset for the given GID.
  localIndex(gid, tileset) {
    return gid - tileset.firstGid;
  }

  // Source rect {sx, sy, sw, sh} in the tileset image for the given GID.
  srcRect(gid) {
    const ts = this.tilesetForGid(gid);
    if (!ts) return null;
    const local = this.localIndex(gid, ts);
    const col   = local % ts.columns;
    const row   = Math.floor(local / ts.columns);
    return {
      sx: col * this.tileWidth,
      sy: row * this.tileHeight,
      sw: this.tileWidth,
      sh: this.tileHeight,
      tileset: ts,
    };
  }
}
