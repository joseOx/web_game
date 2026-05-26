import { Entity } from './Entity.js';
import { AnimationComponent } from '../systems/AnimationSystem.js';

// Reina — La soberana del Vacío profundo
// Entidad consciente anterior al Tejedor, bautizada por el abuelo de Mateo.
// Apariencia: silueta humanoide de luz violeta con corona de 3 fragmentos flotantes.
// Sin barra de vida — el encuentro es narrativo, no de combate.
//
// Estados:
//   idle       → flotación suave (quieta observando)
//   speak      → ligero destello al hablar
//   awake      → despierta, corona girando activamente
//   warm       → tono más cálido (después de pacto/resolución positiva)
//   fade       → desapareciendo

// Frame real: 230×184 px → ratio 5:4
// DRAW_H × 1.25 = DRAW_W (sin distorsión)
const DRAW_H = 40;
const DRAW_W = 50;    // Math.round(230/184 * 40)
const W = 32;         // hitbox centrado bajo el sprite
const H = 32;

const PLACEHOLDER_STATES = {
  idle: {
    frames: [
      { sx: 0, sy: 0, sw: W, sh: H },
      { sx: 0, sy: 0, sw: W, sh: H },
    ],
    frameDuration: 800,
    loop: true,
  },
  speak: {
    frames: [
      { sx: 0, sy: 0, sw: W, sh: H },
      { sx: 0, sy: 0, sw: W, sh: H },
    ],
    frameDuration: 400,
    loop: true,
  },
};

export class Reina extends Entity {
  constructor(x, y) {
    super('reina', x, y);
    this.width  = W;
    this.height = H;

    this.dialogueId = 'reina_encounter_01';
    this.label      = 'Reina';
    this._fragmentRotation = 0; // animación de corona

    this.addComponent('animation', new AnimationComponent(PLACEHOLDER_STATES, 'idle'));
  }

  setSprite(img, { drawH = DRAW_H } = {}) {
    const COLS = 5, ROWS = 2;
    // Math.floor evita que sw/sh sean decimales y sangren al frame vecino
    const fw = Math.floor(img.naturalWidth  / COLS);
    const fh = Math.floor(img.naturalHeight / ROWS);
    // Preserve frame aspect ratio
    const drawW = Math.round(fw / fh * drawH);
    const f = (col, row) => ({ sx: col * fw, sy: row * fh, sw: fw, sh: fh });

    const row0 = [f(0,0), f(1,0), f(2,0), f(3,0), f(4,0)];
    const row1 = [f(0,1), f(1,1), f(2,1), f(3,1), f(4,1)];

    const states = {
      idle:  { spritesheet: img, frames: row0, frameDuration: 160, loop: true },
      speak: { spritesheet: img, frames: row1, frameDuration: 110, loop: true },
      warm:  { spritesheet: img, frames: row0.slice(0, 3), frameDuration: 200, loop: true },
    };

    const existing = this.getComponent('animation');
    if (existing) {
      existing.states = states;
      existing.setState('idle');
    } else {
      this.addComponent('animation', new AnimationComponent(states, 'idle'));
    }

    this._drawW = drawW;
    this._drawH = drawH;
  }

  update(dt) {
    if (!this.active) return;
    this.prevX = this.x;
    this.prevY = this.y;

    // Flotación suave
    this.y += Math.sin(Date.now() / 1800) * 0.08;

    // Rotación de fragmentos de la corona (efecto visual)
    this._fragmentRotation += dt * 0.0008;

    this.getComponent('animation')?.update(dt);
  }

  setEmotionalState(state) {
    const anim = this.getComponent('animation');
    if (!anim) return;
    switch (state) {
      case 'warm':
      case 'peaceful':
        anim.setState('warm');
        break;
      case 'speaking':
        anim.setState('speak');
        break;
      default:
        anim.setState('idle');
    }
  }

  render(ctx, alpha) {
    if (!this.active) return;

    const rx    = this.renderX(alpha);
    const ry    = this.renderY(alpha);
    const frame = this.getComponent('animation')?.currentFrame();

    ctx.save();

    // Brillo ambiental violeta
    ctx.shadowColor = '#8B5CF6';
    ctx.shadowBlur  = 12;

    if (frame?.spritesheet) {
      const dx = rx + (this.width  - this._drawW) / 2;
      const dy = ry + this.height  - this._drawH;
ctx.drawImage(frame.spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
        Math.round(dx), Math.round(dy), this._drawW, this._drawH);
    } else {
      // Placeholder: silueta violeta con corona de triángulos
      const cx = rx + this.width / 2;
      const cy = ry + this.height / 2;

      // Cuerpo
      ctx.fillStyle = '#8B5CF6';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cabeza
      ctx.fillStyle = '#C4B5FD';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Ojos
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(cx - 2, cy - 7, 1.2, 0, Math.PI * 2);
      ctx.arc(cx + 2, cy - 7, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Corona: 3 fragmentos triangulares girando
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#7C3AED';
      for (let i = 0; i < 3; i++) {
        const angle = this._fragmentRotation + (i * Math.PI * 2 / 3);
        const fx = cx + Math.cos(angle) * 8;
        const fy = (cy - 12) + Math.sin(angle) * 4;
        ctx.beginPath();
        ctx.moveTo(fx, fy - 3);
        ctx.lineTo(fx - 2.5, fy + 2);
        ctx.lineTo(fx + 2.5, fy + 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();

    // Label
    if (this.label) {
      ctx.shadowColor = 'rgba(0,0,0,1)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle  = '#EEE8FF';
      ctx.font       = '8px VT323, monospace';
      ctx.textAlign  = 'center';
      ctx.fillText(this.label, rx + this.width / 2, ry - 4);
      ctx.textAlign  = 'left';
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }
}
