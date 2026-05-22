// HeartAnchorSystem — "Corazón Firme"
// Habilidad activa de Mateo que inmoviliza Ecos menores y restaura energía de Visión Felina.
// Se desbloquea al completar 3 misiones secundarias.
// Narrativa: Mateo aprende que su presencia emocional ancla la realidad.
// Tecla: F (KeyF → 'heart_anchor')

import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const COOLDOWN_MS      = 20000;    // 20 segundos entre usos
const ANCHOR_DURATION  = 3000;     // ecos inmovilizados 3 segundos
const VISION_RESTORE   = 20;       // +20 de energía de visión
const BOND_BONUS       = 5;        // +5 de bond si Luna está cerca
const PULSE_RADIUS     = 80;       // radio de efecto en píxeles
const PULSE_VISUAL_MS  = 1500;     // duración del efecto visual

const BOND_CLOSE_DIST  = 100;      // px — distancia para considerar Luna "cerca"
const MIN_MISSIONS     = 3;        // misiones necesarias para desbloquear

const PASSIVE_ACCUMULATE_CHANCE_DECREASE = 0.3; // 30% menos prob de accumulate
const PASSIVE_DETECT_RANGE_DECREASE      = 20;  // 20px menos de detección

export class HeartAnchorSystem {
  constructor() {
    this.unlocked = false;
    this._cooldownTimer = 0;
    this._pulseTimer    = 0;       // > 0 mientras el efecto visual está activo
    this._pulseRing     = 0;       // animación de anillo expansivo

    // Referencias inyectadas
    this._mateo        = null;
    this._visionSystem = null;
    this._echoManager  = null;
    this._luna         = null;
    this._bondSystem   = null;
    this._eventBus     = null;
    this._saveSystem   = null;
    this._input        = null;
    this._missions     = null;

    // Flag de ecos inmovilizados — se comparte con EchoMinorAI
    this._stunnedEchoes = new Set();
  }

  inject({ mateo, visionSystem, echoManager, luna, bondSystem,
           eventBus, saveSystem, input, missionManager } = {}) {
    if (mateo)          this._mateo        = mateo;
    if (visionSystem)   this._visionSystem = visionSystem;
    if (echoManager)    this._echoManager  = echoManager;
    if (luna)           this._luna         = luna;
    if (bondSystem)     this._bondSystem   = bondSystem;
    if (eventBus)       this._eventBus     = eventBus;
    if (saveSystem)     this._saveSystem   = saveSystem;
    if (input)          this._input        = input;
    if (missionManager) this._missions     = missionManager;
  }

  /**
   * Verifica si la habilidad debe estar desbloqueada basado en misiones completadas.
   * Se llama al cargar partida y cada vez que se completa una misión.
   */
  checkUnlock() {
    if (this.unlocked) {
      // Re-emitir evento de tutorial si ya está desbloqueado pero
      // el jugador nunca vio el tutorial (ej: cargó partida antes de verlo).
      if (this._saveSystem && !this._saveSystem.getFlag('heart_anchor_tutorial_seen')) {
        this._eventBus?.emit('heart_anchor:unlocked');
      }
      return true;
    }
    if (!this._saveSystem || !this._missions) return false;

    const done = [
      'lighthouse', 'melody', 'garden', 'dogs', 'brothers', 'library', 'cemetery_child'
    ].filter(id => this._missions.isDone(id)).length;

    if (done >= MIN_MISSIONS) {
      this.unlocked = true;
      this._saveSystem?.setFlag('mateo_heart_anchor_unlocked', true);
      this._eventBus?.emit('heart_anchor:unlocked');
      return true;
    }
    return false;
  }

  /**
   * Restaura el estado desbloqueado desde un save.
   */
  restoreUnlocked(flagValue) {
    this.unlocked = !!flagValue;
  }

  isStunned(echoId) {
    return this._stunnedEchoes.has(echoId);
  }

  /**
   * Aplica la inmovilización a todos los ecos menores en radio.
   */
  _applyStun() {
    if (!this._mateo || !this._echoManager) return;

    const mx = this._mateo.centerX();
    const my = this._mateo.centerY();

    const allEchoes = this._echoManager.getAll();
    for (const echo of allEchoes) {
      if (!echo.active) continue;
      // Solo afecta a EchoMinor (tienen propiedad .fleeing)
      if (echo.fleeing === undefined) continue;

      const dist = Math.hypot(echo.centerX() - mx, echo.centerY() - my);
      if (dist <= PULSE_RADIUS) {
        this._stunnedEchoes.add(echo.id);
        echo._stunned = true;
        echo._stunnedTimer = ANCHOR_DURATION;
        // Frenar de golpe
        echo.vx = 0;
        echo.vy = 0;
      }
    }
  }

  /**
   * Restaura energía de Visión Felina.
   */
  _restoreVision() {
    if (!this._visionSystem) return;
    this._visionSystem.addEnergy(VISION_RESTORE);
  }

  /**
   * Bonus temporal de bond si Luna está cerca.
   */
  _applyBondBonus() {
    if (!this._bondSystem || !this._luna || !this._mateo) return;
    const dist = this._mateo.distTo(this._luna);
    if (dist <= BOND_CLOSE_DIST) {
      this._bondSystem.bond = Math.min(100, this._bondSystem.bond + BOND_BONUS);
    }
  }

  /**
   * Activa el pulso de Corazón Firme.
   */
  activate() {
    if (!this.unlocked) return false;
    if (this._cooldownTimer > 0) return false;
    if (!this._mateo?.active) return false;

    this._cooldownTimer = COOLDOWN_MS;
    this._pulseTimer    = PULSE_VISUAL_MS;
    this._pulseRing     = 0;

    this._applyStun();
    this._restoreVision();
    this._applyBondBonus();

    this._eventBus?.emit('heart_anchor:activated', {
      x: this._mateo.centerX(),
      y: this._mateo.centerY(),
      radius: PULSE_RADIUS,
    });

    return true;
  }

  // ── Pasivo ──────────────────────────────────────────────────────────────────

  /**
   * Probabilidad reducida de que un EchoMinor entre en modo ACCUMULATE
   * cuando el Bond está en HEALTHY.
   */
  get accumulateChanceDebuff() {
    if (!this.unlocked) return 1.0;
    if (!this._bondSystem) return 1.0;
    if (this._bondSystem.currentLevel() !== 'HEALTHY') return 1.0;
    return 1.0 - PASSIVE_ACCUMULATE_CHANCE_DECREASE;
  }

  /**
   * Reduce el rango al que los Ecos detectan a Mateo (usado por EchoMinorAI).
   */
  get detectionRangeDebuff() {
    if (!this.unlocked) return 0;
    if (!this._bondSystem) return 0;
    if (this._bondSystem.currentLevel() !== 'HEALTHY') return 0;
    return PASSIVE_DETECT_RANGE_DECREASE;
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  update(dt) {
    // Cooldown
    if (this._cooldownTimer > 0) {
      this._cooldownTimer = Math.max(0, this._cooldownTimer - dt);
    }

    // Pulse visual timer
    if (this._pulseTimer > 0) {
      this._pulseTimer = Math.max(0, this._pulseTimer - dt);
      this._pulseRing = (this._pulseRing + dt * 0.15) % 360;
    }

    // Limpiar stuns expirados
    if (this._stunnedEchoes.size > 0 && this._echoManager) {
      for (const echoId of this._stunnedEchoes) {
        const echo = this._echoManager.get(echoId);
        if (!echo || !echo.active) {
          this._stunnedEchoes.delete(echoId);
          continue;
        }
        if (echo._stunnedTimer !== undefined) {
          echo._stunnedTimer -= dt;
          if (echo._stunnedTimer <= 0) {
            echo._stunned = false;
            echo._stunnedTimer = 0;
            this._stunnedEchoes.delete(echoId);
          }
        }
      }
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  render(ctx, _alpha) {
    if (!this._mateo) return;

    // Icono de disponibilidad en HUD (cuando está desbloqueado y sin diálogo activo)
    if (this.unlocked) {
      const isReady = this._cooldownTimer <= 0;
      const bx = Math.round(BASE_WIDTH / 2 - 40);
      const by = BASE_HEIGHT - 32;

      // Fondo
      ctx.fillStyle = isReady ? 'rgba(255,217,125,0.15)' : 'rgba(80,80,80,0.25)';
      ctx.fillRect(bx, by, 28, 8);

      // Label
      ctx.fillStyle = isReady ? '#FFD97D' : '#666';
      ctx.font = '7px VT323, monospace';
      ctx.fillText('[F] pulso', bx + 1, by + 7);

      // Cooldown barra
      if (!isReady) {
        const frac = 1 - this._cooldownTimer / COOLDOWN_MS;
        ctx.fillStyle = 'rgba(255,217,125,0.5)';
        ctx.fillRect(bx, by, Math.round(28 * frac), 8);
      }

      // Si el pulso está activo, dibujar anillos expansivos
      if (this._pulseTimer > 0) {
        this._drawPulseEffect(ctx);
      }
    }
  }

  _drawPulseEffect(ctx) {
    const mx = this._mateo.renderX(1);
    const my = this._mateo.renderY(1);
    const centerX = Math.round(mx + this._mateo.width / 2);
    const centerY = Math.round(my + this._mateo.height / 2);

    const progress = 1 - (this._pulseTimer / PULSE_VISUAL_MS); // 0→1
    const alpha = Math.max(0, 1 - progress * 1.2);
    const radius = 10 + progress * PULSE_RADIUS;

    ctx.save();

    // Anillo exterior
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = '#FFD97D';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#FFD97D';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Anillo interior (más definido)
    if (progress < 0.6) {
      const innerAlpha = alpha * 0.7;
      ctx.globalAlpha = innerAlpha;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FFF0B0';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Destello central
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = '#FFD97D';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4 + (1 - progress) * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  destroy() {
    this._stunnedEchoes.clear();
    this._mateo        = null;
    this._visionSystem = null;
    this._echoManager  = null;
    this._luna         = null;
    this._bondSystem   = null;
    this._eventBus     = null;
    this._saveSystem   = null;
    this._input        = null;
    this._missions     = null;
  }
}
