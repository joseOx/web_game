import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

const BOX_H      = 68;
const BOX_Y      = BASE_HEIGHT - BOX_H - 2;
const PAD        = 4;
const PORTRAIT_S = 22;
const TEXT_X     = PAD + PORTRAIT_S + 4;
const TEXT_W     = BASE_WIDTH - TEXT_X - PAD;
const TYPEWRITER_SPEED = 28; // chars per second

export class DialogueSystem {
  constructor() {
    this._nodes    = {};      // loaded from dialogues.json
    this._current  = null;
    this.visible   = false;

    // Typewriter state
    this._fullText   = '';
    this._shownChars = 0;
    this._textDone   = false;
    this._elapsed    = 0;

    this._narrativeFloatTimer = 0;

    // Choice selection
    this._selectedChoice = 0;
    this._choices        = [];

    // Portraits: map portrait-id → HTMLImageElement
    this._portraits = new Map();

    // Injected singletons
    this._input          = null;
    this._saveSystem     = null;
    this._missionManager = null;
    this._riftSystem     = null;
    this._audioSystem    = null;
    this._visionSystem   = null;
    this._inventory      = null;   // saveSystem doubles as inventory
    this._eventBus       = null;

    this._onEnd = null;  // callback when dialogue ends
  }

  inject({ input, saveSystem, missionManager, riftSystem, audioSystem, visionSystem, eventBus } = {}) {
    if (input)          this._input          = input;
    if (saveSystem)     this._saveSystem     = saveSystem;
    if (missionManager) this._missionManager = missionManager;
    if (riftSystem)     this._riftSystem     = riftSystem;
    if (audioSystem)    this._audioSystem    = audioSystem;
    if (visionSystem)   this._visionSystem   = visionSystem;
    if (eventBus)       this._eventBus       = eventBus;
  }

  loadDialogues(json) {
    this._nodes = json;
  }

  loadPortrait(id, img) {
    this._portraits.set(id, img);
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  start(nodeId, onEnd = null) {
    const node = this._nodes[nodeId];
    if (!node) { console.warn(`DialogueSystem: unknown node "${nodeId}"`); return; }
    this._onEnd = onEnd;
    this._showNode(node);
  }

  isVisible() { return this.visible; }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(dt) {
    if (!this.visible || !this._current) return;

    // Typewriter
    if (!this._textDone) {
      this._elapsed += dt;
      const target = Math.floor(this._elapsed / 1000 * TYPEWRITER_SPEED);
      this._shownChars = Math.min(target, this._fullText.length);
      if (this._shownChars >= this._fullText.length) this._textDone = true;
    }

    // Input handling
    if (!this._input) return;

    // Choice navigation
    if (this._choices.length > 0 && this._textDone) {
      if (this._input.wasPressed('move_up')) {
        this._selectedChoice = Math.max(0, this._selectedChoice - 1);
      }
      if (this._input.wasPressed('move_down')) {
        this._selectedChoice = Math.min(this._choices.length - 1, this._selectedChoice + 1);
      }
      if (this._input.wasPressed('interact')) {
        this._selectChoice(this._selectedChoice);
      }
      return;
    }

    // narrative_float auto-advances 2.5 s after text finishes (no button required)
    if (this._current?.style === 'narrative_float' && this._textDone) {
      this._narrativeFloatTimer += dt;
      if (this._narrativeFloatTimer >= 2500) {
        this._narrativeFloatTimer = 0;
        this._advance();
        return;
      }
    }

    // Advance (skip typewriter or go to next node)
    if (this._input.wasPressed('interact')) {
      if (!this._textDone) {
        this._shownChars = this._fullText.length;
        this._textDone   = true;
      } else {
        this._advance();
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  render(ctx) {
    if (!this.visible || !this._current) return;

    const node = this._current;

    // Narrative float style — small floating text, no box
    if (node.style === 'narrative_float') {
      this._renderNarrativeFloat(ctx, node);
      return;
    }

    // Umbral style — abstract plane, centered text with glow, no box
    if (node.style === 'umbral') {
      this._renderUmbral(ctx, node);
      return;
    }

    this._renderBox(ctx, node);
  }

  _renderBox(ctx, node) {
    // Dynamic height: expand box when many choices would overflow fixed BOX_H.
    // With BOX_H=68 and choices starting at offset 38, 4 choices need 38+4×12=86px.
    const choiceH  = this._choices.length > 0 ? 38 + this._choices.length * 12 + 6 : 0;
    const boxH     = Math.max(BOX_H, choiceH);
    const boxY     = BASE_HEIGHT - boxH - 2;

    // Box background
    ctx.fillStyle   = 'rgba(10, 8, 18, 0.92)';
    ctx.strokeStyle = '#3B2D6E';
    ctx.lineWidth   = 1;
    ctx.fillRect(PAD, boxY, BASE_WIDTH - PAD * 2, boxH);
    ctx.strokeRect(PAD + 0.5, boxY + 0.5, BASE_WIDTH - PAD * 2 - 1, boxH - 1);

    // Portrait
    const portrait = node.portrait ? this._portraits.get(node.portrait) : null;
    if (portrait) {
      ctx.drawImage(portrait, PAD + 1, boxY + 3, PORTRAIT_S, PORTRAIT_S);
    } else if (node.portrait) {
      ctx.fillStyle = '#2A2240';
      ctx.fillRect(PAD + 1, boxY + 3, PORTRAIT_S, PORTRAIT_S);
    }

    this._setShadow(ctx);

    // Speaker name
    if (node.speaker) {
      ctx.fillStyle = '#9B7FE8';
      ctx.font      = '10px VT323, monospace';
      ctx.fillText(node.speaker.toUpperCase(), TEXT_X, boxY + 13);
    }

    // Dialogue text (typewriter)
    const shown = this._fullText.slice(0, this._shownChars);
    ctx.fillStyle = '#EEE8FF';
    ctx.font      = '10px VT323, monospace';
    this._drawWrappedText(ctx, shown, TEXT_X, boxY + 24, TEXT_W, 11);

    // Choices
    if (this._choices.length > 0 && this._textDone) {
      const startY = boxY + 38;
      this._choices.forEach((c, i) => {
        const y = startY + i * 12;
        ctx.fillStyle = i === this._selectedChoice ? '#9B7FE8' : '#7A6AA0';
        ctx.font      = '10px VT323, monospace';
        ctx.fillText((i === this._selectedChoice ? '▶ ' : '  ') + c.label, TEXT_X, y);
      });
    } else if (this._textDone && !this._current.choices) {
      // Advance hint
      ctx.fillStyle = 'rgba(155,127,232,0.6)';
      ctx.font      = '10px VT323, monospace';
      ctx.fillText('▶', BASE_WIDTH - PAD * 2 - 4, boxY + boxH - 5);
    }

    this._clearShadow(ctx);
  }

  _renderNarrativeFloat(ctx, node) {
    const shown = this._fullText.slice(0, this._shownChars);
    this._setShadow(ctx);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle   = '#C8A9FF';
    ctx.font        = '10px VT323, monospace';
    const floatX   = PAD + 2;
    const floatMaxW = BASE_WIDTH - floatX - PAD;
    this._drawWrappedText(ctx, shown, floatX, BASE_HEIGHT / 2 - 20, floatMaxW, 11, BASE_HEIGHT - PAD);
    ctx.globalAlpha = 1;
    this._clearShadow(ctx);
  }

  _renderUmbral(ctx, node) {
    // Fondo translúcido violeta oscuro en toda la pantalla
    ctx.fillStyle = 'rgba(20, 10, 40, 0.7)';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Partículas doradas sutiles (opcional, sin bucle)
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 8; i++) {
      const px = (Math.sin(Date.now() / 2000 + i * 1.3) * 0.5 + 0.5) * BASE_WIDTH;
      const py = (Math.cos(Date.now() / 2500 + i * 1.7) * 0.5 + 0.5) * BASE_HEIGHT;
      ctx.fillStyle = '#FFD97D';
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Speaker flotando arriba
    if (node.speaker) {
      ctx.fillStyle = '#FFD97D';
      ctx.font      = '12px VT323, monospace';
      ctx.textAlign = 'center';
      const speakerName = node.speaker.toUpperCase();
      ctx.fillText(speakerName, BASE_WIDTH / 2, BASE_HEIGHT / 2 - 36);
      ctx.textAlign = 'left';
    }

    // Texto centrado con brillo dorado
    const shown = this._fullText.slice(0, this._shownChars);
    ctx.save();
    ctx.shadowColor   = 'rgba(255, 217, 125, 0.6)';
    ctx.shadowBlur    = 6;
    ctx.fillStyle     = '#FFE8B0';
    ctx.font          = '10px VT323, monospace';
    ctx.textAlign     = 'center';
    const lineH = 12;
    const words = shown.split(' ');
    let line = '';
    let curY  = BASE_HEIGHT / 2 - 14;
    const maxW = BASE_WIDTH - 40;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, BASE_WIDTH / 2, curY);
        line = word;
        curY += lineH;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, BASE_WIDTH / 2, curY);
    ctx.restore();
    ctx.textAlign = 'left';

    // Choices (mismo estilo que el normal pero sobre fondo oscuro)
    if (this._choices.length > 0 && this._textDone) {
      const startY = Math.min(curY + 18, BASE_HEIGHT - 40);
      this._choices.forEach((c, i) => {
        const y = startY + i * 12;
        ctx.fillStyle = i === this._selectedChoice ? '#FFD97D' : '#A080A0';
        ctx.font      = '10px VT323, monospace';
        ctx.fillText((i === this._selectedChoice ? '▶ ' : '  ') + c.label, BASE_WIDTH / 2 - 40, y);
      });
    } else if (this._textDone && !this._current.choices) {
      // Avance (auto o manual)
      if (this._current.next) {
        ctx.fillStyle = 'rgba(255, 217, 125, 0.5)';
        ctx.font      = '10px VT323, monospace';
        ctx.fillText('▶', BASE_WIDTH - 16, BASE_HEIGHT - 10);
      }
    }
  }

  _setShadow(ctx) {
    ctx.shadowColor   = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  }

  _clearShadow(ctx) {
    ctx.shadowColor   = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  _drawWrappedText(ctx, text, x, y, maxW, lineH, maxY = BOX_Y + BOX_H - 4) {
    const words = text.split(' ');
    let line = '';
    let curY  = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, curY);
        line = word;
        curY += lineH;
        if (curY > maxY) break;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, curY);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _showNode(node) {
    // Evaluate node-level condition
    if (node.condition && !this._evalCondition(node.condition)) {
      // Skip: use nextElse if defined, otherwise fall through to next
      const skip = node.nextElse ?? node.next;
      if (skip) this._showNode(this._nodes[skip]);
      else this._end();
      return;
    }

    if (node.onEnter) this._evalAction(node.onEnter);

    this._current    = node;
    this.visible     = true;
    this._fullText   = node.text ?? '';
    this._shownChars = 0;
    this._textDone   = this._fullText.length === 0;
    this._elapsed    = 0;
    this._narrativeFloatTimer = 0;

    // Build available choices (filter by condition)
    this._choices        = [];
    this._selectedChoice = 0;
    if (node.choices) {
      for (const c of node.choices) {
        if (!c.condition || this._evalCondition(c.condition)) {
          this._choices.push(c);
        }
      }
    }
  }

  _advance() {
    const node = this._current;
    if (node.onExit) this._evalAction(node.onExit);
    this._eventBus?.emit('dialogue:node_exit', { nodeId: node.id });
    if (node.next) {
      this._showNode(this._nodes[node.next]);
    } else {
      this._end();
    }
  }

  _selectChoice(idx) {
    const choice = this._choices[idx];
    if (!choice) return;
    if (choice.onExit) this._evalAction(choice.onExit);
    if (this._current.onExit) this._evalAction(this._current.onExit);
    this._eventBus?.emit('dialogue:node_exit', { nodeId: this._current.id });
    if (choice.next) {
      this._showNode(this._nodes[choice.next]);
    } else {
      this._end();
    }
  }

  _end() {
    this.visible  = false;
    this._current = null;
    this._onEnd?.();
    this._eventBus?.emit('dialogue:ended');
  }

  // ── Condition evaluator ────────────────────────────────────────────────────

  _evalCondition(expr) {
    if (!expr) return true;
    try {
      if (expr.startsWith('NOT:')) return !this._evalCondition(expr.slice(4));
      if (expr.startsWith('has_item:'))          return this._saveSystem?.hasItem(expr.slice(9)) ?? false;
      if (expr.startsWith('flag:'))              return !!this._saveSystem?.getFlag(expr.slice(5));
      if (expr.startsWith('mission:')) {
        const parts = expr.split(':');  // mission:id:done | mission:id:active | mission:id:step:N
        const id    = parts[1];
        const check = parts[2];
        if (check === 'done')   return this._missionManager?.isDone(id)   ?? false;
        if (check === 'active') return this._missionManager?.isActive(id) ?? false;
        if (check === 'step')   return (this._missionManager?.getStep(id) ?? 0) === parseInt(parts[3]);
      }
      if (expr.startsWith('resolution:')) {
        const [, id, val] = expr.split(':');
        return this._saveSystem?.getFlag(`${id}_resolution`) === val;
      }
      if (expr.startsWith('day:gte:')) {
        return (this._saveSystem?.getFlag('game_day', 1) ?? 1) >= parseInt(expr.slice(8));
      }
    } catch { /* ignore parse errors */ }
    console.warn(`DialogueSystem: unrecognized condition "${expr}"`);
    return false;
  }

  // ── Action evaluator ───────────────────────────────────────────────────────

  _evalAction(expr) {
    if (!expr) return;
    // Support chained actions separated by '; '
    for (const part of expr.split(';')) {
      this._evalSingleAction(part.trim());
    }
  }

  _evalSingleAction(expr) {
    const argMatch = expr.match(/^(\w+)\.(\w+)\(([^)]*)\)$/);
    if (!argMatch) { console.warn(`DialogueSystem: unrecognized action "${expr}"`); return; }

    const [, obj, method, rawArgs] = argMatch;
    const args = rawArgs.split(',').map(a => {
      const s = a.trim().replace(/^['"]|['"]$/g, '');
      if (s === 'true')  return true;
      if (s === 'false') return false;
      const n = Number(s);
      return isNaN(n) ? s : n;
    });

    switch (obj) {
      case 'missionManager': this._missionManager?.[method]?.(...args); break;
      case 'saveSystem':     this._saveSystem?.[method]?.(...args);     break;
      case 'riftSystem':     this._riftSystem?.[method]?.(...args);     break;
      case 'audioSystem':    this._audioSystem?.[method]?.(...args);    break;
      case 'visionSystem':   this._visionSystem?.[method]?.(...args);   break;
      case 'eventBus':
        if (method === 'emit' && args.length >= 1) {
          // emit('event') or emit('event', 'key', value) → { key: value }
          const payload = args.length === 3 ? { [args[1]]: args[2] } : undefined;
          this._eventBus?.emit(args[0], payload);
        }
        break;
      case 'inventory':
        if (method === 'addItem')    this._saveSystem?.addItem(...args);
        if (method === 'removeItem') this._saveSystem?.removeItem(...args);
        break;
      default:
        console.warn(`DialogueSystem: unknown action object "${obj}"`);
    }
  }

  destroy() {
    this.visible  = false;
    this._current = null;
    this._nodes   = {};
  }
}
