export class CollisionSystem {
  constructor() {
    this.tilemap = null;
  }

  setTilemap(tilemap) {
    this.tilemap = tilemap;
  }

  // Resolve entity movement against solid tiles.
  // entity must expose: x, y, width, height, vx, vy
  // Modifies entity.x, entity.y, entity.vx, entity.vy in place.
  resolve(entity) {
    if (!this.tilemap) return;

    // Apply horizontal movement, then resolve, then vertical.
    // Separating axes prevents corner-sticking.
    entity.x += entity.vx;
    this._resolveAxis(entity, 'x');

    entity.y += entity.vy;
    this._resolveAxis(entity, 'y');
  }

  _resolveAxis(entity, axis) {
    const tm = this.tilemap;
    const { x, y, width, height } = entity;

    const left   = Math.floor(x / tm.tileWidth);
    const right  = Math.floor((x + width  - 1) / tm.tileWidth);
    const top    = Math.floor(y / tm.tileHeight);
    const bottom = Math.floor((y + height - 1) / tm.tileHeight);

    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (!tm.isSolid(col, row)) continue;

        const tileX = col * tm.tileWidth;
        const tileY = row * tm.tileHeight;

        if (axis === 'x') {
          if (entity.vx > 0) {
            entity.x = tileX - width;
          } else if (entity.vx < 0) {
            entity.x = tileX + tm.tileWidth;
          }
          entity.vx = 0;
          return; // one collision per axis per frame is enough
        } else {
          if (entity.vy > 0) {
            entity.y = tileY - height;
          } else if (entity.vy < 0) {
            entity.y = tileY + tm.tileHeight;
          }
          entity.vy = 0;
          return;
        }
      }
    }
  }

  // Returns true if the given world-space rect overlaps any solid tile.
  // Used for queries (trigger detection, rift proximity, etc.).
  rectOverlapsSolid(x, y, w, h) {
    return this.tilemap ? this.tilemap.rectOverlapsSolid(x, y, w, h) : false;
  }

  // Returns true if two entity-like objects overlap (AABB vs AABB).
  static overlaps(a, b) {
    return (
      a.x < b.x + b.width  &&
      a.x + a.width  > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Returns the overlap vector { dx, dy } between two rects (useful for push-out).
  static overlapVector(a, b) {
    const dx = (a.x + a.width  / 2) - (b.x + b.width  / 2);
    const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
    const ox = (a.width  + b.width)  / 2 - Math.abs(dx);
    const oy = (a.height + b.height) / 2 - Math.abs(dy);
    if (ox <= 0 || oy <= 0) return null;
    return {
      dx: ox * Math.sign(dx),
      dy: oy * Math.sign(dy),
    };
  }

  update(_dt) {
    // Collision resolution is driven by individual entity updates.
    // This method exists so CollisionSystem can be registered as a Game update system if needed.
  }

  destroy() {
    this.tilemap = null;
  }
}
