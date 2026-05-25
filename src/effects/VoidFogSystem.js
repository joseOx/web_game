/**
 * VoidFogSystem — Niebla ambiental del Vacío
 *
 * Simula nubes de niebla fría que se desplazan lentamente de izquierda a derecha.
 * Solo se activa cuando la dimensión actual es 'void'.
 * Usa un pool de partículas persistentes (no explotan, se reciclan al salir de pantalla).
 *
 * Paleta de colores fríos (violetas, azules grisáceos, lavandas oscuras):
 *   #2A1E3C  — violeta profundo
 *   #3A2850  — violeta medio
 *   #1E2840  — azul violáceo oscuro
 *   #252040  — gris violeta (empareja con paletas ZoneV_*)
 *   #181530  — casi negro violáceo
 */

const FOG_COLORS = [
  '#2A1E3C',
  '#3A2850',
  '#1E2840',
  '#252040',
  '#181530',
];

/** Color cálido que se agrega cuando la Dama de la Niebla completa su ciclo */
const FOG_COLOR_DAMA_WARM = '#6B4C6B';

const POOL_SIZE = 40;

export class VoidFogSystem {
  constructor() {
    this._pool = [];
    this._active = false;
    this._dimension = 'real'; // 'real' | 'void'
    this._paletteShifted = false;

    // Offscreen canvas para el tile de niebla (círculo suave pre-renderizado)
    this._fogTile = null;
    this._initFogTile();

    // Inicializar pool
    for (let i = 0; i < POOL_SIZE; i++) {
      this._pool.push(this._createParticle(i));
    }
  }

  // ── Inyección de dependencias ──────────────────────────────────────────────

  /**
   * @param {Object} deps
   * @param {import('../world/Dimension.js').DimensionManager} [deps.dimension]
   */
  inject({ dimension } = {}) {
    if (dimension) this._dimensionRef = dimension;
  }

  // ── API pública ────────────────────────────────────────────────────────────

  /**
   * Activar el cambio de paleta cuando la Dama de la Niebla completa su ciclo.
   * Al activarse, las partículas pueden adquirir un tono violeta-cálido (#6B4C6B)
   * y la opacidad base sube ligeramente (0.10-0.14 en vez de 0.08-0.12).
   * @param {boolean} active
   */
  setPaletteShift(active) {
    this._paletteShifted = active;
  }

  /** Activar/desactivar manualmente (además del chequeo automático por dimensión) */
  setActive(active) {
    this._active = active;
    if (!active) {
      // Reciclar partículas activas al desactivar
      for (const p of this._pool) {
        p.active = false;
      }
    }
  }

  /** Escuchar cambios de dimensión externamente */
  onDimensionChange(dim) {
    this._dimension = dim;
    this._active = (dim === 'void');
    if (!this._active) {
      for (const p of this._pool) p.active = false;
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(dt) {
    // Auto-detectar dimensión desde referencia inyectada
    if (this._dimensionRef) {
      const dim = this._dimensionRef.current;
      if (dim !== this._dimension) {
        this.onDimensionChange(dim);
      }
    }

    if (!this._active) return;

    const s = dt / 1000; // segundos

    for (const p of this._pool) {
      if (!p.active) continue;

      // Movimiento horizontal lento (izquierda → derecha)
      p.x += p.vx * s;
      // Leve deriva vertical (ondulación)
      p.y += p.vy * s;
      p.phase += s * p.freq;

      // Oscilación vertical sinusoidal para un movimiento más orgánico
      p.y += Math.sin(p.phase) * 0.15;

      // Transparencia pulsante suave
      const pulse = 0.7 + 0.3 * Math.sin(p.phase * 0.5 + p.seed);
      p.currentAlpha = p.baseAlpha * pulse;

      // Reciclar si sale completamente por la derecha
      if (p.x > p.maxX + p.size * 2) {
        this._recycle(p);
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  /**
   * Renderiza la niebla. Llamar después del tilemap pero antes de las entidades.
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../renderer/Camera.js').Camera} camera — para coordenadas de pantalla
   */
  render(ctx, _alpha, camera) {
    if (!this._active) return;

    const camX = Math.floor(camera?.x ?? 0);
    const camY = Math.floor(camera?.y ?? 0);

    ctx.save();

    for (const p of this._pool) {
      if (!p.active) continue;

      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY);

      // Frustum culling básico (no dibujar si está fuera de pantalla con margen)
      if (sx < -p.size * 2 || sx > 320 + p.size * 2 ||
          sy < -p.size * 2 || sy > 180 + p.size * 2) continue;

      ctx.globalAlpha = p.currentAlpha;

      if (this._fogTile) {
        // Escalar el tile según el tamaño de la partícula
        const scale = p.size / 60; // 60 = tamaño base del tile
        ctx.drawImage(
          this._fogTile,
          sx - p.size, sy - p.size,
          p.size * 2, p.size * 2
        );
      } else {
        // Fallback: círculo renderizado
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.size);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  destroy() {
    this._pool.length = 0;
    this._fogTile = null;
  }

  // ── Internas ───────────────────────────────────────────────────────────────

  _initFogTile() {
    // Pre-renderizar un círculo suave en un canvas offscreen
    const SIZE = 120;
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    const cx = c.getContext('2d');

    const grad = cx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
    grad.addColorStop(0,   'rgba(200, 180, 255, 0.25)');
    grad.addColorStop(0.3, 'rgba(180, 160, 240, 0.12)');
    grad.addColorStop(0.6, 'rgba(160, 140, 220, 0.05)');
    grad.addColorStop(1,   'rgba(120, 100, 200, 0)');
    cx.fillStyle = grad;
    cx.fillRect(0, 0, SIZE, SIZE);

    this._fogTile = c;
  }

  _createParticle(index) {
    const p = {
      active: false,
      x: 0, y: 0,
      vx: 0, vy: 0,
      size: 0,
      color: '#fff',
      baseAlpha: 0,
      currentAlpha: 0,
      phase: 0,
      freq: 0,
      seed: 0,
      maxX: 0,
    };
    return p;
  }

  /** Reciclar una partícula: reposicionar al borde izquierdo */
  _recycle(p) {
    // Aparecer en el borde izquierdo con una Y aleatoria
    p.x = -p.size * 2 - Math.random() * 60;
    p.y = Math.random() * 220 - 20; // un poco fuera del área visible arriba/abajo

    // Velocidad horizontal muy lenta (10-30 px/s)
    p.vx = 10 + Math.random() * 20;
    // Leve deriva vertical (subir o bajar lentamente)
    p.vy = (Math.random() - 0.5) * 4;

    p.size = 30 + Math.random() * 50;

    // Si la paleta está desplazada (Dama completada), intercalar tono cálido
    if (this._paletteShifted && Math.random() < 0.35) {
      p.color = FOG_COLOR_DAMA_WARM;
    } else {
      p.color = FOG_COLORS[Math.floor(Math.random() * FOG_COLORS.length)];
    }

    // Si la paleta está desplazada, opacidad ligeramente mayor
    p.baseAlpha = this._paletteShifted
      ? (0.10 + Math.random() * 0.14)
      : (0.08 + Math.random() * 0.12);

    p.currentAlpha = p.baseAlpha;
    p.phase = Math.random() * Math.PI * 2;
    p.freq = 0.2 + Math.random() * 0.3;
    p.seed = Math.random() * 100;
    p.maxX = 320 + p.size * 2 + Math.random() * 100;

    p.active = true;
  }

  /** Inicializar o resetear el pool completo */
  _resetAll() {
    for (const p of this._pool) {
      if (!p.active) {
        this._recycle(p);
      }
    }
  }
}
