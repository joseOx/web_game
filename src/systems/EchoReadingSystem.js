// EchoReadingSystem — "Ecolectura"
// Habilidad pasiva permanente de Mateo que revela el color emocional de Ecos y Grietas.
// Se desbloquea al completar la secuencia "El Corazón del Vacío".
// Efecto visual: halos de color alrededor de Ecos y objetos cerca de Grietas.
// Efecto UI: texto descriptivo de emoción al acercarse a Ecos y Grietas.
// Efecto narrativo: líneas adicionales de diálogo de Mateo en encuentros con Ecos.
//
// Dependencias: SaveSystem (flags), BondSystem (normalized), VisionSystem (active), EventBus

import { BASE_WIDTH } from '../core/Game.js';

// Colores de emociones (mismos que Rift.EMOTION_COLORS pero ampliados para Ecolectura)
const EMOTION_COLORS = {
  sadness:   '#4A6FA5',   // Azul profundo
  fear:      '#F5E356',   // Amarillo pálido
  anger:     '#B84A4A',   // Rojo apagado
  guilt:     '#7A9B6B',   // Verde grisáceo
  longing:   '#FFD97D',   // Dorado cálido
  peace:     '#C8A9FF',   // Violeta claro
  grief:     '#4A6FA5',   // Mismo que sadness
};

const INTENSITY_LABELS = {
  deep:     'profund',
  latent:   'latente',
  fading:   'desvaneciéndose',
  fresh:    'recién sentido',
};

const UI_DISTANCE      = 100;  // px — distancia para mostrar texto de emoción
const OBJECT_RIFT_DIST = 60;   // px — distancia entre objeto y Grieta para mostrar halo
const HALO_RADIUS_OFF  = 4;    // px extra sobre el radio del Echo
const HALO_LINE_WIDTH  = 1.5;  // px
const PULSE_SPEED      = 0.002; // rad/ms — velocidad del pulso del halo

export class EchoReadingSystem {
  constructor() {
    this._unlocked = false;

    // Referencias inyectadas
    this._saveSystem   = null;
    this._bondSystem   = null;
    this._visionSystem = null;
    this._eventBus     = null;
    this._echoManager  = null;
    this._riftSystem   = null;

    // Tiempo interno para pulso de halos
    this._pulseTime = Math.random() * Math.PI * 2;

    // Último texto de UI mostrado (para no repetir renders)
    this._lastUIEmotion = null;
    this._lastUIDistance = Infinity;
  }

  inject({ saveSystem, bondSystem, visionSystem, eventBus, echoManager, riftSystem } = {}) {
    if (saveSystem)   this._saveSystem   = saveSystem;
    if (bondSystem)   this._bondSystem   = bondSystem;
    if (visionSystem) this._visionSystem = visionSystem;
    if (eventBus)     this._eventBus     = eventBus;
    if (echoManager)  this._echoManager  = echoManager;
    if (riftSystem)   this._riftSystem   = riftSystem;
  }

  /**
   * Verifica si la habilidad está desbloqueada (según flag).
   * Se llama al cargar partida.
   */
  checkUnlock() {
    if (this._saveSystem?.getFlag('mateo_echo_reading_unlocked')) {
      this._unlocked = true;
      return true;
    }
    this._unlocked = false;
    return false;
  }

  /**
   * Restaura el estado desde un save.
   */
  restoreUnlocked(flagValue) {
    this._unlocked = !!flagValue;
  }

  get unlocked() {
    return this._unlocked;
  }

  /**
   * Retorna el color hex para una emoción dada.
   */
  getColorForEmotion(emotion) {
    return EMOTION_COLORS[emotion] ?? '#888888';
  }

  /**
   * Retorna la etiqueta de intensidad legible.
   */
  _getIntensityLabel(echo) {
    // Heurística simple basada en la distancia al origen o si está huyendo
    if (echo.fleeing !== undefined && echo.fleeing) return 'latente';
    if (echo._stunned) return 'fading';
    return 'profund';
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  update(dt) {
    if (!this._unlocked) return;
    this._pulseTime += PULSE_SPEED * dt;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  render(ctx, alpha, camera) {
    if (!this._unlocked) return;

    const bondNormalized = this._bondSystem?.normalized() ?? 1;
    const visionActive   = this._visionSystem?.active ?? false;

    // Si el bond está crítico, los halos se atenúan mucho
    const attenuation = bondNormalized < 0.3 ? bondNormalized * 2 : 1;

    // ── Halos en Ecos ─────────────────────────────────────────────────────
    if (this._echoManager) {
      const allEchoes = this._echoManager.getAll();
      for (const echo of allEchoes) {
        if (!echo.active) continue;
        const emotion = echo.emotion;
        if (!emotion) continue;

        const color = this.getColorForEmotion(emotion);
        const baseAlpha = visionActive ? 0.55 : 0.25;
        const adjustedAlpha = baseAlpha * attenuation;

        const ex = echo.renderX(alpha) - (camera?.x ?? 0);
        const ey = echo.renderY(alpha) - (camera?.y ?? 0);
        const cx = ex + echo.width / 2;
        const cy = ey + echo.height / 2;
        const radius = Math.max(echo.width, echo.height) / 2 + HALO_RADIUS_OFF;
        const pulse = 0.95 + 0.05 * Math.sin(this._pulseTime);

        ctx.save();
        ctx.globalAlpha = adjustedAlpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = HALO_LINE_WIDTH;
        ctx.shadowColor = color;
        ctx.shadowBlur = visionActive ? 8 : 3;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ── Halos en objetos cerca de Grietas ──────────────────────────────────
    if (this._riftSystem) {
      const rifts = this._riftSystem.getAll();
      for (const rift of rifts) {
        if (!rift.active || rift.sealed || !rift.emotion) continue;

        const color = this.getColorForEmotion(rift.emotion);
        const baseAlpha = visionActive ? 0.35 : 0.15;
        const adjustedAlpha = baseAlpha * attenuation;

        // Buscar objetos cercanos a esta Grieta
        // (se pasa por parámetro o se obtiene del world — simplificado)
        const world = this._worldRef; // Si se inyecta
        if (!world) continue;

        for (const obj of world._objects ?? []) {
          const ox = obj.x ?? 0;
          const oy = obj.y ?? 0;
          const dist = Math.hypot(
            (ox + (obj.width ?? 16) / 2) - rift.x,
            (oy + (obj.height ?? 16) / 2) - rift.y
          );
          if (dist > OBJECT_RIFT_DIST) continue;

          const rx = ox - (camera?.x ?? 0);
          const ry = oy - (camera?.y ?? 0);

          ctx.save();
          ctx.globalAlpha = adjustedAlpha;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowColor = color;
          ctx.shadowBlur = 4;
          ctx.strokeRect(rx, ry, obj.width ?? 16, obj.height ?? 16);
          ctx.restore();
        }
      }
    }

    // ── Texto de emoción en UI ────────────────────────────────────────────
    this._renderUIEmotion(ctx, alpha);
  }

  /**
   * Inyecta referencia al World para acceder a los objetos.
   */
  setWorld(world) {
    this._worldRef = world;
  }

  _renderUIEmotion(ctx, alpha) {
    // Busca el Eco o Grieta más cercano a Mateo y muestra la emoción
    let nearest = null;
    let nearestD = Infinity;
    let nearestType = null;

    if (this._echoManager) {
      for (const echo of this._echoManager.getAll()) {
        if (!echo.active || !echo.emotion) continue;
        const d = Math.hypot(
          echo.centerX() - this._mateoRef?.centerX() ?? 0,
          echo.centerY() - this._mateoRef?.centerY() ?? 0
        );
        if (d < UI_DISTANCE && d < nearestD) {
          nearest = echo;
          nearestD = d;
          nearestType = 'echo';
        }
      }
    }

    if (this._riftSystem && !nearest) {
      for (const rift of this._riftSystem.getAll()) {
        if (!rift.active || rift.sealed || !rift.emotion) continue;
        const d = Math.hypot(
          rift.x - this._mateoRef?.centerX() ?? 0,
          rift.y - this._mateoRef?.centerY() ?? 0
        );
        if (d < UI_DISTANCE && d < nearestD) {
          nearest = rift;
          nearestD = d;
          nearestType = 'rift';
        }
      }
    }

    if (nearest && nearestD < UI_DISTANCE) {
      const emotion = nearest.emotion;
      const color = this.getColorForEmotion(emotion);
      const intensity = this._getIntensityLabel(nearest);

      // Emoción en español
      const emotionNames = {
        sadness: 'Tristeza',
        fear:    'Miedo',
        anger:   'Rabia',
        guilt:   'Culpa',
        longing: 'Anhelo',
        peace:   'Paz',
        grief:   'Pesar',
      };
      const label = `${emotionNames[emotion] ?? emotion} — ${intensity}`;

      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - (nearestD / UI_DISTANCE) * 0.5);
      ctx.fillStyle = color;
      ctx.font = '8px VT323, monospace';
      ctx.textAlign = 'right';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(label, BASE_WIDTH - 8, 24);
      ctx.restore();
    }
  }

  /**
   * Inyecta referencia a Mateo para calcular distancias.
   */
  setMateo(mateo) {
    this._mateoRef = mateo;
  }

  destroy() {
    this._unlocked    = false;
    this._saveSystem  = null;
    this._bondSystem  = null;
    this._visionSystem = null;
    this._eventBus    = null;
    this._echoManager = null;
    this._riftSystem  = null;
    this._worldRef    = null;
    this._mateoRef    = null;
  }
}
