import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const MAX_W  = 64;
const MAX_H  = 50;
const PAD_R  = 6;
const PAD_B  = 14;  // above controls hint

export class Minimap {
  constructor() {
    this._world = null;
  }

  inject({ world }) {
    this._world = world;
  }

  render(ctx, mateo, luna) {
    const world = this._world;
    if (!world?.loaded) return;
    const tm = world.tilemap;
    if (!tm || tm.cols === 0 || tm.rows === 0) return;

    const COLS = tm.cols;
    const ROWS = tm.rows;
    const TW   = tm.tileWidth;
    const TH   = tm.tileHeight;

    // Scale: fit entire map within MAX_W × MAX_H, max 3px per tile
    const scale = Math.min(3, Math.floor(MAX_W / COLS), Math.floor(MAX_H / ROWS));
    if (scale < 1) return;

    const mw = COLS * scale;
    const mh = ROWS * scale;
    const ox = BASE_WIDTH  - mw - PAD_R;
    const oy = BASE_HEIGHT - mh - PAD_B;

    // Background
    ctx.fillStyle = 'rgba(6, 4, 16, 0.78)';
    ctx.fillRect(ox - 1, oy - 1, mw + 2, mh + 2);

    // Tile layer — solid vs passable
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = tm.isSolid(c, r) ? '#3A2E50' : '#18142A';
        ctx.fillRect(ox + c * scale, oy + r * scale, scale, scale);
      }
    }

    // Exit markers (amber)
    for (const exit of world.exits) {
      const ex = Math.round(ox + (exit.x / TW)      * scale);
      const ey = Math.round(oy + (exit.y / TH)      * scale);
      const ew = Math.max(2, Math.round((exit.width  / TW) * scale));
      const eh = Math.max(2, Math.round((exit.height / TH) * scale));
      ctx.fillStyle = '#C8A030';
      ctx.fillRect(ex, ey, ew, eh);
    }

    // Luna dot (cyan)
    if (luna) {
      const lx = Math.round(ox + (luna.centerX() / TW) * scale);
      const ly = Math.round(oy + (luna.centerY() / TH) * scale);
      ctx.fillStyle = '#50F0FF';
      ctx.fillRect(lx - 1, ly - 1, 3, 3);
    }

    // Mateo dot (white)
    const px = Math.round(ox + (mateo.centerX() / TW) * scale);
    const py = Math.round(oy + (mateo.centerY() / TH) * scale);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px - 1, py - 1, 3, 3);

    // Border
    ctx.strokeStyle = 'rgba(130, 100, 190, 0.45)';
    ctx.lineWidth   = 0.5;
    ctx.strokeRect(ox - 0.5, oy - 0.5, mw + 1, mh + 1);
  }
}
