import { Entity } from './Entity.js';

// Cortesano — Eco de élite al servicio de Reina
// No son hostiles por defecto. Bloquean el paso hasta que Mateo demuestra
// que merece llegar al Trono (mostrando el diario o demostrando valentía).
//
// Tipos:
//   'guardian'   → Bloquea la entrada. No ataca — observa. Se aparta con el diario.
//   'whisperer'  → Flota y susurra. Dice frases del diario o de miedo según contexto.
//   'architect'  → Reconstruye una pared. No interactúa directamente.
//
// Apariencia: silueta de sombra con capa, cabeza de grieta (triángulo violeta).

const W = 14;
const H = 24;

const TIPO_CONFIG = {
  guardian:  { color: '#4A2D6E', label: 'Guardián del Umbral', drawW: 22, drawH: 32 },
  whisperer: { color: '#6B4A9E', label: 'El Susurrante',       drawW: 20, drawH: 28 },
  architect: { color: '#3A1F5E', label: 'El Arquitecto',       drawW: 24, drawH: 30 },
};

export class Cortesano extends Entity {
  constructor(id, x, y, tipo = 'guardian') {
    super(id, x, y);
    const cfg = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.guardian;

    this.width      = W;
    this.height     = H;
    this.color      = cfg.color;
    this.label      = cfg.label;
    this.tipo       = tipo;
    this._drawW     = cfg.drawW;
    this._drawH     = cfg.drawH;

    // Los Cortesanos tienen diálogo condicional
    this.dialogueId = this._getDialogueId();

    // Estado de bloqueo
    this.blocking   = true;   // bloquea el paso hasta que se resuelva
    this.passed     = false;  // true si Mateo ya lo superó

    // Animación interna de flotación
    this._floatOffset = Math.random() * Math.PI * 2;
  }

  _getDialogueId() {
    switch (this.tipo) {
      case 'guardian':  return 'cortesano_guardian_01';
      case 'whisperer': return 'cortesano_whisperer_01';
      case 'architect': return 'cortesano_architect_01';
      default:          return null;
    }
  }

  // Intenta pasar al Cortesano. Retorna true si permite el paso.
  tryPass(hasDiary) {
    if (this.passed) return true;

    if (this.tipo === 'guardian') {
      if (hasDiary) {
        // El Guardián reconoce el diario del abuelo
        this.blocking = false;
        this.passed   = true;
        return true;
      }
      // Sin diario: requiere 3 pulsos de Corazón Firme (se maneja desde Game)
      return false;
    }

    if (this.tipo === 'whisperer' || this.tipo === 'architect') {
      // Estos no bloquean realmente — solo son decorativos/interactivos
      this.blocking = false;
      this.passed   = true;
      return true;
    }

    return false;
  }

  // Forzar paso (después de prueba de Corazón Firme)
  forcePass() {
    this.blocking = false;
    this.passed   = true;
  }

  update(dt) {
    if (!this.active) return;
    this.prevX = this.x;
    this.prevY = this.y;

    // Flotación suave
    this._floatOffset += dt * 0.001;
    this.y += Math.sin(this._floatOffset) * 0.05;
  }

  render(ctx, alpha) {
    if (!this.active) return;

    const rx = this.renderX(alpha);
    const ry = this.renderY(alpha);

    ctx.save();
    ctx.globalAlpha = 0.8;

    // Sombra base
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = this.color;

    const cx = rx + this.width / 2;
    const cy = ry + this.height / 2;

    if (this.tipo === 'guardian') {
      // Silueta alta con capa
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 8);
      ctx.lineTo(cx - 3, cy - 10);
      ctx.lineTo(cx + 3, cy - 10);
      ctx.lineTo(cx + 6, cy + 8);
      ctx.closePath();
      ctx.fill();

      // Cabeza de grieta (triángulo)
      ctx.fillStyle = '#7C3AED';
      ctx.shadowColor = '#7C3AED';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx - 5, cy - 6);
      ctx.lineTo(cx + 5, cy - 6);
      ctx.closePath();
      ctx.fill();

    } else if (this.tipo === 'whisperer') {
      // Forma flotante con brazos
      ctx.beginPath();
      ctx.ellipse(cx, cy, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Brazos
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 2);
      ctx.lineTo(cx - 10, cy - 6);
      ctx.lineTo(cx - 10, cy - 4);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 5, cy - 2);
      ctx.lineTo(cx + 10, cy - 6);
      ctx.lineTo(cx + 10, cy - 4);
      ctx.fill();

    } else if (this.tipo === 'architect') {
      // Silueta que sostiene fragmentos
      ctx.beginPath();
      ctx.rect(cx - 4, cy - 8, 8, 16);
      ctx.fill();
      // Fragmento en la mano
      ctx.fillStyle = '#8B5CF6';
      ctx.shadowColor = '#8B5CF6';
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - 4);
      ctx.lineTo(cx + 10, cy - 8);
      ctx.lineTo(cx + 12, cy - 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Label
    if (this.label) {
      ctx.shadowColor = 'rgba(0,0,0,1)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle  = '#C4B5FD';
      ctx.font       = '7px VT323, monospace';
      ctx.textAlign  = 'center';
      ctx.fillText(this.label, rx + this.width / 2, ry - 3);
      ctx.textAlign  = 'left';
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }
}
