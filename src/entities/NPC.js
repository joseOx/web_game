import { Entity } from './Entity.js';

const NPC_W = 8;
const NPC_H = 12;

export class NPC extends Entity {
  constructor(id, x, y, { color = '#D4A96A', dialogueId = null, label = '' } = {}) {
    super(id, x, y);
    this.width      = NPC_W;
    this.height     = NPC_H;
    this.color      = color;
    this.dialogueId = dialogueId;
    this.label      = label;
  }

  update(_dt) { /* static — no movement */ }

  render(ctx, alpha) {
    if (!this.active) return;
    const rx = Math.round(this.renderX(alpha));
    const ry = Math.round(this.renderY(alpha));

    ctx.fillStyle = this.color;
    ctx.fillRect(rx, ry, this.width, this.height);

    if (this.label) {
      ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
      ctx.fillStyle  = '#EEE8FF';
      ctx.font       = '8px VT323, monospace';
      ctx.textAlign  = 'center';
      ctx.fillText(this.label, rx + this.width / 2, ry - 3);
      ctx.textAlign  = 'left';
      ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    }
  }
}
