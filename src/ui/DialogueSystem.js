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

    // Scene images: full-size illustrations for special dialogue styles
    this._sceneImages = new Map();

    // Injected singletons
    this._input          = null;
    this._saveSystem     = null;
    this._missionManager = null;
    this._riftSystem     = null;
    this._audioSystem    = null;
    this._visionSystem       = null;
    this._dimensionManager   = null;
    this._inventory          = null;   // saveSystem doubles as inventory
    this._eventBus           = null;

    this._onEnd = null;  // callback when dialogue ends
  }

  inject({ input, saveSystem, missionManager, riftSystem, audioSystem, visionSystem, dimensionManager, eventBus } = {}) {
    if (input)            this._input            = input;
    if (saveSystem)       this._saveSystem       = saveSystem;
    if (missionManager)   this._missionManager   = missionManager;
    if (riftSystem)       this._riftSystem       = riftSystem;
    if (audioSystem)      this._audioSystem      = audioSystem;
    if (visionSystem)     this._visionSystem     = visionSystem;
    if (dimensionManager) this._dimensionManager = dimensionManager;
    if (eventBus)         this._eventBus         = eventBus;
  }

  loadDialogues(json) {
    this._nodes = json;
  }

  loadPortrait(id, img) {
    this._portraits.set(id, img);
  }

  setSceneImage(id, img) {
    if (img) this._sceneImages.set(id, img);
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

    // narrative_float / abuelo_memory / abuelo_reina_scene auto-advance 2.5 s after text finishes
    if ((this._current?.style === 'narrative_float' || this._current?.style === 'abuelo_memory' ||
         this._current?.style === 'abuelo_reina_scene') && this._textDone) {
      this._narrativeFloatTimer += dt;
      if (this._narrativeFloatTimer >= 2500) {
        this._narrativeFloatTimer = 0;
        this._advance();
        return;
      }
    }

    // reina style auto-advances 4 s after text finishes (slower, more dramatic)
    if (this._current?.style === 'reina' && this._textDone) {
      this._narrativeFloatTimer += dt;
      if (this._narrativeFloatTimer >= 4000) {
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

    // Reina style — like umbral but violet vibrant text with shake
    if (node.style === 'reina') {
      this._renderReina(ctx, node);
      return;
    }

    // Abuelo memory style — sepia background, brown text, cursive-like
    if (node.style === 'abuelo_memory') {
      this._renderAbueloMemory(ctx, node);
      return;
    }

    // Abuelo finds Reina scene — void backdrop + grandfather block + large Reina image
    if (node.style === 'abuelo_reina_scene') {
      this._renderAbueloReinaScene(ctx, node);
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

    // Box background — more transparent in the void so characters show through
    const bgAlpha   = this._dimensionManager?.isVoid() ? 0.52 : 0.92;
    ctx.fillStyle   = `rgba(10, 8, 18, ${bgAlpha})`;
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

  _renderReina(ctx, node) {
    // Fondo translúcido violeta más oscuro
    ctx.fillStyle = 'rgba(15, 5, 35, 0.85)';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Partículas violetas flotantes
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 10; i++) {
      const px = (Math.sin(Date.now() / 1800 + i * 1.1) * 0.5 + 0.5) * BASE_WIDTH;
      const py = (Math.cos(Date.now() / 2200 + i * 1.5) * 0.5 + 0.5) * BASE_HEIGHT;
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Speaker flotando arriba
    if (node.speaker) {
      ctx.fillStyle = '#8B5CF6';
      ctx.font      = '12px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.speaker.toUpperCase(), BASE_WIDTH / 2, BASE_HEIGHT / 2 - 36);
      ctx.textAlign = 'left';
    }

    // Texto centrado con brillo violeta y vibración sutil
    const shown = this._fullText.slice(0, this._shownChars);
    ctx.save();
    // Vibración: desplazamiento aleatorio de 0.5px
    const shakeX = (Math.random() - 0.5) * 0.5;
    const shakeY = (Math.random() - 0.5) * 0.5;
    ctx.shadowColor   = 'rgba(139, 92, 246, 0.7)';
    ctx.shadowBlur    = 8;
    ctx.fillStyle     = '#C4B5FD';
    ctx.font          = '10px VT323, monospace';
    ctx.textAlign     = 'center';
    const lineH = 12;
    const words = shown.split(' ');
    let line = '';
    let curY  = BASE_HEIGHT / 2 - 14 + shakeY;
    const maxW = BASE_WIDTH - 40;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, BASE_WIDTH / 2 + shakeX, curY);
        line = word;
        curY += lineH;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, BASE_WIDTH / 2 + shakeX, curY);
    ctx.restore();
    ctx.textAlign = 'left';

    // Choices
    if (this._choices.length > 0 && this._textDone) {
      const startY = Math.min(curY + 18, BASE_HEIGHT - 40);
      this._choices.forEach((c, i) => {
        const y = startY + i * 12;
        ctx.fillStyle = i === this._selectedChoice ? '#C4B5FD' : '#7A5FCC';
        ctx.font      = '10px VT323, monospace';
        ctx.fillText((i === this._selectedChoice ? '▶ ' : '  ') + c.label, BASE_WIDTH / 2 - 40, y);
      });
    } else if (this._textDone && !this._current.choices) {
      if (this._current.next) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.font      = '10px VT323, monospace';
        ctx.fillText('▶', BASE_WIDTH - 16, BASE_HEIGHT - 10);
      }
    }
  }

  _renderAbueloMemory(ctx, node) {
    // Fondo sepia translúcido
    ctx.fillStyle = 'rgba(44, 30, 16, 0.85)';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Borde decorativo de diario
    ctx.strokeStyle = '#8B6030';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, 8, BASE_WIDTH - 16, BASE_HEIGHT - 16);

    // Esquinas del diario
    ctx.fillStyle = '#6B4520';
    ctx.fillRect(8, 8, 12, 12);
    ctx.fillRect(BASE_WIDTH - 20, 8, 12, 12);
    ctx.fillRect(8, BASE_HEIGHT - 20, 12, 12);
    ctx.fillRect(BASE_WIDTH - 20, BASE_HEIGHT - 20, 12, 12);

    // Speaker (estilo anotación manuscrita)
    if (node.speaker) {
      ctx.fillStyle = '#A07840';
      ctx.font      = 'italic 10px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.speaker.toUpperCase(), BASE_WIDTH / 2, 28);
      ctx.textAlign = 'left';
    }

    // Texto en marrón (estilo tinta desgastada)
    const shown = this._fullText.slice(0, this._shownChars);
    ctx.save();
    ctx.shadowColor   = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur    = 1;
    ctx.shadowOffsetX = 0.5;
    ctx.shadowOffsetY = 0.5;
    ctx.fillStyle     = '#8B6030';
    ctx.font          = 'italic 10px VT323, monospace';
    const floatX   = PAD + 6;
    const floatMaxW = BASE_WIDTH - floatX - PAD - 6;
    this._drawWrappedText(ctx, shown, floatX, BASE_HEIGHT / 2 - 20, floatMaxW, 12, BASE_HEIGHT - 16);
    ctx.restore();

    // Decoración: línea de separación (como si fuera una entrada de diario)
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#8B6030';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(BASE_WIDTH / 2 - 40, BASE_HEIGHT / 2 - 38);
    ctx.lineTo(BASE_WIDTH / 2 + 40, BASE_HEIGHT / 2 - 38);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Choices
    if (this._choices.length > 0 && this._textDone) {
      const startY = BASE_HEIGHT - 50;
      this._choices.forEach((c, i) => {
        const y = startY + i * 12;
        ctx.fillStyle = i === this._selectedChoice ? '#A07840' : '#7A5F3A';
        ctx.font      = '10px VT323, monospace';
        ctx.fillText((i === this._selectedChoice ? '▶ ' : '  ') + c.label, PAD + 10, y);
      });
    } else if (this._textDone && !this._current.choices) {
      if (this._current.next) {
        ctx.fillStyle = 'rgba(139, 96, 48, 0.5)';
        ctx.font      = '10px VT323, monospace';
        ctx.fillText('▶', BASE_WIDTH - 20, BASE_HEIGHT - 14);
      }
    }
  }

  _renderAbueloReinaScene(ctx, node) {
    // Fondo void oscuro
    ctx.fillStyle = 'rgba(8, 4, 22, 0.95)';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Partículas violetas sutiles (Reina dormida irradia energía)
    ctx.globalAlpha = 0.10;
    for (let i = 0; i < 8; i++) {
      const px = (Math.sin(Date.now() / 2400 + i * 1.4) * 0.5 + 0.5) * BASE_WIDTH;
      const py = (Math.cos(Date.now() / 2900 + i * 1.8) * 0.5 + 0.5) * (BASE_HEIGHT - 64);
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── Reina (lado derecho, grande) ────────────────────────────────────────
    const rX = 192, rY = 10, rW = 62, rH = 96;
    const reinaImg = this._sceneImages.get('reina_sprite');
    if (reinaImg) {
      // Spritesheet 5×2: row 0 = idle (5 frames)
      const COLS = 5;
      const fW   = Math.floor(reinaImg.naturalWidth  / COLS);
      const fH   = Math.floor(reinaImg.naturalHeight / 2);
      const frame = Math.floor(Date.now() / 160) % COLS;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(reinaImg, frame * fW, 0, fW, fH, rX, rY, rW, rH);
    } else {
      // Fallback: silueta violeta con corona
      ctx.fillStyle = 'rgba(75, 35, 120, 0.85)';
      ctx.fillRect(rX + 10, rY + 28, rW - 20, rH - 28);  // cuerpo
      ctx.fillRect(rX + 15, rY + 6,  rW - 30, 24);        // cabeza
      ctx.fillStyle = '#C4B5FD';
      ctx.fillRect(rX + 13, rY - 2, 5, 12);               // corona izq
      ctx.fillRect(rX + 25, rY - 8, 5, 18);               // corona centro
      ctx.fillRect(rX + 37, rY - 2, 5, 12);               // corona der
      // Fragmentos orbitando
      const t = Date.now() / 1800;
      ctx.fillStyle = 'rgba(196, 181, 253, 0.6)';
      for (let f = 0; f < 3; f++) {
        const fx = rX + rW / 2 + Math.cos(t + f * 2.1) * 18;
        const fy = rY + 18     + Math.sin(t + f * 2.1) * 10;
        ctx.fillRect(fx - 2, fy - 2, 5, 5);
      }
    }

    // ── Abuelo placeholder (lado izquierdo, pequeño) ────────────────────────
    const abX = 52, abY = 58;
    // Cuerpo
    ctx.fillStyle = '#7A5028';
    ctx.fillRect(abX, abY + 11, 16, 22);
    // Cabeza
    ctx.fillStyle = '#9A7048';
    ctx.fillRect(abX + 3, abY, 10, 11);
    // Linterna (detalle cálido)
    ctx.fillStyle = '#FFD97D';
    ctx.fillRect(abX + 15, abY + 13, 4, 5);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#FFD97D';
    ctx.beginPath();
    ctx.arc(abX + 17, abY + 16, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Etiqueta
    ctx.fillStyle = '#9A7048';
    ctx.font = '7px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Abuelo', abX + 8, abY + 38);
    ctx.textAlign = 'left';

    // ── Caja de texto inferior (sepia) ──────────────────────────────────────
    const boxY = BASE_HEIGHT - 64;
    ctx.fillStyle = 'rgba(34, 20, 8, 0.90)';
    ctx.fillRect(4, boxY, BASE_WIDTH - 8, 60);
    ctx.strokeStyle = '#6B4423';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, boxY, BASE_WIDTH - 8, 60);

    // Texto del diálogo
    const shown = this._fullText.slice(0, this._shownChars);
    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur    = 1;
    ctx.fillStyle     = '#C8A070';
    ctx.font          = 'italic 10px VT323, monospace';
    this._drawWrappedText(ctx, shown, 10, boxY + 14, BASE_WIDTH - 20, 12, boxY + 58);
    ctx.restore();

    // Indicador de avance
    if (this._textDone && this._current?.next) {
      ctx.fillStyle = 'rgba(139, 96, 48, 0.5)';
      ctx.font = '10px VT323, monospace';
      ctx.fillText('▶', BASE_WIDTH - 16, BASE_HEIGHT - 6);
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
