import { TILE_SIZE } from '../core/Game.js';
import { LAYER } from '../world/Tilemap.js';

// Layers rendered before entities (bottom to mid)
const LAYERS_UNDER = [LAYER.BACKGROUND, LAYER.MIDGROUND];
// Layers rendered after entities (foreground elements)
const LAYERS_OVER  = [LAYER.FOREGROUND];

export class TilemapRenderer {
  constructor(camera) {
    this.camera   = camera;
    this.tilemap  = null;
    // Map tileset name → HTMLImageElement
    this._images  = new Map();
  }

  // Load a Tilemap + pre-loaded tileset images { tilesetName: HTMLImageElement }
  load(tilemap, images = {}) {
    this.tilemap = tilemap;
    for (const [name, img] of Object.entries(images)) {
      this._images.set(name, img);
    }
    this.camera.setBounds(tilemap.widthPx, tilemap.heightPx);
  }

  unload() {
    this.tilemap = null;
    this._images.clear();
    this.camera.clearBounds();
  }

  // Renders layers that sit below entities. Called at the start of the render pass.
  renderUnder(ctx) {
    if (!this.tilemap) return;
    this._renderLayers(ctx, LAYERS_UNDER);
  }

  // Renders layers that sit above entities (foreground). Called after entity render.
  renderOver(ctx) {
    if (!this.tilemap) return;
    this._renderLayers(ctx, LAYERS_OVER);
  }

  // render(ctx, alpha) — registered as a render system renders the under layers only.
  // The foreground pass is called explicitly by the scene or world after entity render.
  render(ctx, _alpha) {
    this.renderUnder(ctx);
  }

  _renderLayers(ctx, layerNames) {
    const cam = this.camera;
    const tm  = this.tilemap;

    // Viewport in tile coords with 1-tile margin for culling
    const startCol = Math.max(0,              Math.floor(cam.x / tm.tileWidth)  - 1);
    const startRow = Math.max(0,              Math.floor(cam.y / tm.tileHeight) - 1);
    const endCol   = Math.min(tm.widthTiles,  Math.ceil((cam.x + cam.width)  / tm.tileWidth)  + 1);
    const endRow   = Math.min(tm.heightTiles, Math.ceil((cam.y + cam.height) / tm.tileHeight) + 1);

    for (const name of layerNames) {
      const layer = tm.getLayer(name);
      if (!layer || layer.type === 'objectgroup' || !layer.visible) continue;

      ctx.globalAlpha = layer.opacity;

      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const gid = layer.data[row * layer.width + col];
          if (!gid) continue;   // 0 = empty tile

          const src = tm.srcRect(gid);
          if (!src) continue;

          const img = this._images.get(src.tileset.name);
          if (!img) continue;

          const destX = col * tm.tileWidth  - Math.floor(cam.x);
          const destY = row * tm.tileHeight - Math.floor(cam.y);

          ctx.drawImage(
            img,
            src.sx, src.sy, src.sw, src.sh,
            destX,  destY,  tm.tileWidth, tm.tileHeight,
          );
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  destroy() {
    this.unload();
  }
}
