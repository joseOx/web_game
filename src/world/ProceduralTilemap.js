// Tilemap-compatible wrapper around a string-grid zone definition.
// Implements the interface expected by CollisionSystem: tileWidth, tileHeight,
// isSolid(col, row), rectOverlapsSolid(x, y, w, h).

export class ProceduralTilemap {
  constructor(grid, { tileSize = 16, solidChars = '#f' } = {}) {
    this.tileWidth  = tileSize;
    this.tileHeight = tileSize;
    this._grid      = grid;
    this._solid     = new Set(solidChars);

    this.cols     = grid[0]?.length ?? 0;
    this.rows     = grid.length;
    this.widthPx  = this.cols * tileSize;
    this.heightPx = this.rows * tileSize;
  }

  charAt(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return '#';
    return this._grid[row]?.[col] ?? '#';
  }

  isSolid(col, row) {
    return this._solid.has(this.charAt(col, row));
  }

  rectOverlapsSolid(x, y, w, h) {
    const left   = Math.floor(x / this.tileWidth);
    const right  = Math.floor((x + w - 1) / this.tileWidth);
    const top    = Math.floor(y / this.tileHeight);
    const bottom = Math.floor((y + h - 1) / this.tileHeight);
    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        if (this.isSolid(c, r)) return true;
      }
    }
    return false;
  }
}
