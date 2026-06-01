/**
 * VoidFogSystem — Niebla volumétrica del Vacío
 *
 * Partículas estratificadas en 3 capas de profundidad (lejos/medio/cerca).
 * Cada blob es elíptico con rotación lenta y movimiento de doble frecuencia
 * para simular turbulencia. Blend mode 'screen' sobre fondo oscuro da efecto
 * etéreo sin perder los detalles del mundo.
 */

const FOG_COLORS = [
  '#2A1E3C', '#3A2850', '#1E2840', '#252040', '#181530', '#2E2048',
];
const FOG_COLOR_DAMA_WARM = '#6B4C6B';

const POOL_SIZE    = 65;
const TILE_VARIANTS = 5;

// Por capa: [far, mid, near]
const LAYER_VX_BASE  = [5,  12, 22];
const LAYER_VX_RAND  = [7,  12, 18];
const LAYER_VY_RAND  = [2,   4,  7];
const LAYER_SIZE_BASE= [22, 42, 68];
const LAYER_SIZE_RAND= [18, 28, 38];
const LAYER_ALPHA_BASE = [0.055, 0.095, 0.155];
const LAYER_ALPHA_RAND = [0.040, 0.060, 0.075];

export class VoidFogSystem {
  constructor() {
    this._pool           = [];
    this._active         = false;
    this._dimension      = 'real';
    this._paletteShifted = false;
    this._dimensionRef   = null;
    this._fogTiles       = [];

    this._initFogTiles();
    for (let i = 0; i < POOL_SIZE; i++) this._pool.push(this._createParticle());
    this._resetAll();
  }

  // ── Inyección ──────────────────────────────────────────────────────────────

  inject({ dimension } = {}) {
    if (dimension) this._dimensionRef = dimension;
  }

  // ── API pública ────────────────────────────────────────────────────────────

  setPaletteShift(active) {
    this._paletteShifted = active;
  }

  setActive(active) {
    this._active = active;
    if (!active) for (const p of this._pool) p.active = false;
  }

  onDimensionChange(dim) {
    this._dimension = dim;
    const wasActive = this._active;
    this._active = (dim === 'void');
    if (!this._active) {
      for (const p of this._pool) p.active = false;
    } else if (!wasActive) {
      this._resetAll();
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(dt) {
    if (this._dimensionRef) {
      const dim = this._dimensionRef.current;
      if (dim !== this._dimension) this.onDimensionChange(dim);
    }
    if (!this._active) return;

    const s = dt / 1000;

    for (const p of this._pool) {
      if (!p.active) continue;

      p.x += p.vx * s;

      // Deriva vertical con doble frecuencia — simula turbulencia
      p.ph1 += s * p.fr1;
      p.ph2 += s * p.fr2;
      p.y   += p.vy * s
             + Math.sin(p.ph1) * 0.28
             + Math.sin(p.ph2 * 1.63) * 0.11;

      // Rotación lenta del blob
      p.rot += p.rotSpeed * s;

      // Alpha pulsante con dos armónicos para variación orgánica
      const pulse = 0.60 + 0.25 * Math.sin(p.ph1 * 0.45 + p.seed)
                         + 0.15 * Math.sin(p.ph2 * 0.80 + p.seed * 0.7);
      p.currentAlpha = p.baseAlpha * Math.max(0, pulse);

      if (p.x > p.maxX) this._recycle(p);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  render(ctx, _alpha, camera) {
    if (!this._active) return;

    const camX = Math.floor(camera?.x ?? 0);
    const camY = Math.floor(camera?.y ?? 0);

    ctx.save();
    // 'screen' sobre fondo oscuro: la niebla añade luminosidad etérea sin tapar detalles
    ctx.globalCompositeOperation = 'screen';

    // Ordenar capas: far primero, near último (painters algorithm)
    const sorted = this._pool.filter(p => p.active).sort((a, b) => a.layer - b.layer);

    for (const p of sorted) {
      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY);

      const margin = p.size * 2.2;
      if (sx < -margin || sx > 320 + margin ||
          sy < -margin || sy > 180 + margin) continue;

      ctx.globalAlpha = p.currentAlpha;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(p.rot);
      // Escala asimétrica: la niebla se extiende más en horizontal
      ctx.scale(p.scaleX, p.scaleY);
      ctx.drawImage(this._fogTiles[p.tileIdx], -p.size, -p.size, p.size * 2, p.size * 2);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  destroy() {
    this._pool.length = 0;
    this._fogTiles.length = 0;
  }

  // ── Privados ───────────────────────────────────────────────────────────────

  _initFogTiles() {
    // Cada variante tiene un perfil de gradiente ligeramente distinto
    const cores = [
      'rgba(210, 195, 255, 0.32)',
      'rgba(185, 170, 248, 0.28)',
      'rgba(200, 182, 252, 0.26)',
      'rgba(172, 155, 238, 0.34)',
      'rgba(225, 210, 255, 0.24)',
    ];
    const mids = [
      'rgba(168, 148, 222, 0.14)',
      'rgba(152, 135, 212, 0.12)',
      'rgba(178, 158, 228, 0.10)',
      'rgba(145, 128, 205, 0.16)',
      'rgba(185, 168, 235, 0.08)',
    ];
    const midStops = [0.30, 0.36, 0.28, 0.40, 0.33];

    for (let v = 0; v < TILE_VARIANTS; v++) {
      const SIZE = 128;
      const c    = document.createElement('canvas');
      c.width    = c.height = SIZE;
      const cx   = c.getContext('2d');

      const grad = cx.createRadialGradient(
        SIZE / 2, SIZE / 2, 0,
        SIZE / 2, SIZE / 2, SIZE / 2
      );
      grad.addColorStop(0,            cores[v]);
      grad.addColorStop(midStops[v],  mids[v]);
      grad.addColorStop(0.68, 'rgba(130, 112, 198, 0.04)');
      grad.addColorStop(1,    'rgba(100,  80, 175, 0.00)');

      cx.fillStyle = grad;
      cx.fillRect(0, 0, SIZE, SIZE);
      this._fogTiles.push(c);
    }
  }

  _createParticle() {
    return {
      active: false,
      x: 0, y: 0, vx: 0, vy: 0,
      size: 0, layer: 0,
      scaleX: 1, scaleY: 1,
      rot: 0, rotSpeed: 0,
      tileIdx: 0,
      color: '#fff',
      baseAlpha: 0, currentAlpha: 0,
      ph1: 0, ph2: 0, fr1: 0, fr2: 0,
      seed: 0, maxX: 0,
    };
  }

  _recycle(p) {
    const layer   = Math.floor(Math.random() * 3);
    p.layer       = layer;
    p.x           = -(LAYER_SIZE_BASE[layer] + LAYER_SIZE_RAND[layer]) * 2 - Math.random() * 80;
    p.y           = Math.random() * 210 - 15;

    p.vx          = LAYER_VX_BASE[layer] + Math.random() * LAYER_VX_RAND[layer];
    p.vy          = (Math.random() - 0.5) * LAYER_VY_RAND[layer];
    p.size        = LAYER_SIZE_BASE[layer] + Math.random() * LAYER_SIZE_RAND[layer];

    // Blobs horizontalmente más anchos que altos, variedad aleatoria
    p.scaleX      = 0.90 + Math.random() * 0.90;   // 0.90 – 1.80
    p.scaleY      = 0.45 + Math.random() * 0.55;   // 0.45 – 1.00

    p.rot         = Math.random() * Math.PI * 2;
    p.rotSpeed    = (Math.random() - 0.5) * 0.18;  // ±0.09 rad/s

    p.tileIdx     = Math.floor(Math.random() * TILE_VARIANTS);

    p.baseAlpha   = (this._paletteShifted
      ? LAYER_ALPHA_BASE[layer] * 1.35
      : LAYER_ALPHA_BASE[layer])
      + Math.random() * LAYER_ALPHA_RAND[layer];

    // Paleta desplazada (Dama completada): 35% de partículas con tono cálido
    p.color = (this._paletteShifted && Math.random() < 0.35)
      ? FOG_COLOR_DAMA_WARM
      : FOG_COLORS[Math.floor(Math.random() * FOG_COLORS.length)];

    p.currentAlpha = p.baseAlpha;
    p.ph1          = Math.random() * Math.PI * 2;
    p.ph2          = Math.random() * Math.PI * 2;
    // Capas más lejanas oscilan más despacio
    p.fr1          = (0.12 + Math.random() * 0.22) * (1 + layer * 0.15);
    p.fr2          = (0.06 + Math.random() * 0.12) * (1 + layer * 0.10);
    p.seed         = Math.random() * 100;
    p.maxX         = 320 + p.size * 2 + Math.random() * 120;
    p.active       = true;
  }

  _resetAll() {
    for (const p of this._pool) {
      if (!p.active) {
        this._recycle(p);
        // Repartir posiciones iniciales por toda la pantalla
        p.x = Math.random() * (320 + p.size * 2) - p.size;
      }
    }
  }
}
