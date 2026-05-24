import { BASE_WIDTH, BASE_HEIGHT } from '../core/Game.js';

// MinigameObservationSystem
// Maneja los minijuegos de observación para la misión M08 "El diario del abuelo".
//
// Minijuego 1: Objetos ocultos — el jugador controla al abuelo joven
//   en V_LIGHTHOUSE (versión 40 años atrás) y debe encontrar 3 objetos.
//
// Minijuego 2: Patrón de símbolos — el jugador debe presionar 3 símbolos
//   en el orden correcto para abrir el pasaje a Reina.
//
// Estados: 'idle' | 'observation' | 'pattern' | 'complete'

const HINT_DIST = 28;     // px — distancia para mostrar "presiona E"
const INTERACT_KEY = 'interact';

export class MinigameObservationSystem {
  constructor() {
    this.active      = false;
    this._state      = 'idle';

    // Minijuego 1: objetos ocultos
    this._zoneId     = null;
    this._targets    = [];     // { id, x, y, found, dialogueId, desc }
    this._foundCount = 0;
    this._onComplete = null;

    // Minijuego 2: patrón de símbolos
    this._symbols    = [];     // { id, label, order }
    this._correctOrder = [];
    this._playerInput  = [];
    this._maxAttempts  = 3;
    this._attempts     = 0;

    // Input reference
    this._input      = null;
    this._eventBus   = null;
    this._dialogue   = null;

    // Proximidad
    this._playerX    = 0;
    this._playerY    = 0;
    this._nearTarget = null;   // target id al que el jugador está cerca

    // Temporizadores
    this._hintTimer  = 0;
    this._hintCooldown = 3000;

    // Estado de render
    this._symbolRects = [];    // posiciones de los símbolos en pantalla
    this._cursorIdx   = 0;     // símbolo enfocado en el puzzle de patrón
  }

  inject({ input, eventBus, dialogue } = {}) {
    if (input)    this._input    = input;
    if (eventBus) this._eventBus = eventBus;
    if (dialogue) this._dialogue = dialogue;
  }

  // ── Minijuego 1: Objetos ocultos ─────────────────────────────────────────

  // zoneId: nombre de la zona (para logging)
  // targets: [{ id, x, y, dialogueId, desc }]
  // onComplete: callback cuando los 3 objetos son encontrados
  startObservation(zoneId, targets, onComplete) {
    this.active      = true;
    this._state      = 'observation';
    this._zoneId     = zoneId;
    this._targets    = targets.map(t => ({ ...t, found: false }));
    this._foundCount = 0;
    this._onComplete = onComplete;
    this._nearTarget = null;

    this._eventBus?.emit('minigame:started', { minigameId: 'm08_hidden_objects' });
  }

  // Llamado desde el update loop con la posición actual del jugador
  updateObservation(playerX, playerY) {
    if (this._state !== 'observation') return;
    this._playerX = playerX;
    this._playerY = playerY;

    // Buscar targets no encontrados cerca
    let nearest = null;
    let nearestDist = HINT_DIST;

    for (const t of this._targets) {
      if (t.found) continue;
      const dx = playerX - t.x;
      const dy = playerY - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = t;
      }
    }

    this._nearTarget = nearest;

    // Interacción
    if (nearest && this._input?.wasPressed(INTERACT_KEY)) {
      this._inspectTarget(nearest);
    }

    // Hint si el jugador está cerca de algo sin mirarlo
    if (nearest && nearestDist < 18 && !this._nearTarget?.found) {
      this._hintTimer += 16; // ~1 frame a 60fps
      if (this._hintTimer > this._hintCooldown) {
        this._hintTimer = 0;
        this._showHint(nearest);
      }
    } else {
      this._hintTimer = 0;
    }
  }

  _inspectTarget(target) {
    target.found = true;
    this._foundCount++;

    // Emitir evento de objeto encontrado
    this._eventBus?.emit('minigame:target_found', {
      minigameId: 'm08_hidden_objects',
      targetId:   target.id,
      count:      this._foundCount,
      total:      this._targets.length,
    });

    // Mostrar diálogo/anotación del abuelo
    if (target.dialogueId && this._dialogue) {
      this._dialogue.start(target.dialogueId);
    }

    // Verificar si todos fueron encontrados
    if (this._foundCount >= this._targets.length) {
      this._completeObservation();
    }
  }

  _showHint(target) {
    // El abuelo dice "Aquí hay algo..." cuando está cerca sin verlo
    this._eventBus?.emit('minigame:hint', {
      minigameId: 'm08_hidden_objects',
      targetId:   target.id,
      message:    'Aquí hay algo...',
    });
  }

  _completeObservation() {
    this._state = 'idle';
    this._eventBus?.emit('minigame:observation_complete', {
      minigameId: 'm08_hidden_objects',
    });
    if (this._onComplete) this._onComplete();
  }

  // ── Minijuego 2: Patrón de símbolos ──────────────────────────────────────

  // symbols: [{ id, label }] — 3 símbolos
  // correctOrder: [id1, id2, id3] — orden correcto
  // onComplete: callback cuando el patrón se resuelve
  startPatternPuzzle(symbols, correctOrder, onComplete) {
    this.active      = true;
    this._state      = 'pattern';
    this._symbols    = symbols.map(s => ({ ...s, selected: false }));
    this._correctOrder = correctOrder;
    this._playerInput  = [];
    this._attempts     = 0;
    this._maxAttempts  = 3;
    this._onComplete   = onComplete;
    this._cursorIdx    = 0;

    // Posiciones en pantalla de los símbolos
    this._symbolRects = this._computeSymbolPositions(symbols.length);

    this._eventBus?.emit('minigame:started', { minigameId: 'm08_pattern' });
  }

  _computeSymbolPositions(count) {
    const positions = [];
    const totalW = count * 40;
    const startX = (BASE_WIDTH - totalW) / 2 + 20;
    const y = BASE_HEIGHT / 2 + 30;
    for (let i = 0; i < count; i++) {
      positions.push({ x: startX + i * 40 - 20, y, w: 32, h: 32 });
    }
    return positions;
  }

  updatePattern() {
    if (this._state !== 'pattern') return;
    if (!this._input) return;

    // Mover cursor entre símbolos no seleccionados
    if (this._input.wasPressed('move_left') || this._input.wasPressed('move_right')) {
      const dir = this._input.wasPressed('move_left') ? -1 : 1;
      let next = (this._cursorIdx + dir + this._symbols.length) % this._symbols.length;
      let safety = 0;
      while (this._symbols[next].selected && safety < this._symbols.length) {
        next = (next + dir + this._symbols.length) % this._symbols.length;
        safety++;
      }
      if (!this._symbols[next].selected) this._cursorIdx = next;
    }

    // Si el cursor apunta a un símbolo ya seleccionado, moverlo al primero libre
    if (this._symbols[this._cursorIdx]?.selected) {
      const firstFree = this._symbols.findIndex(s => !s.selected);
      if (firstFree >= 0) this._cursorIdx = firstFree;
    }

    // Seleccionar el símbolo en el cursor con E
    if (this._input.wasPressed(INTERACT_KEY)) {
      const sym = this._symbols[this._cursorIdx];
      if (sym && !sym.selected) this._selectSymbol(sym);
    }
  }

  _selectSymbol(symbol) {
    symbol.selected = true;
    this._playerInput.push(symbol.id);

    // Verificar si el orden es correcto hasta ahora
    const idx = this._playerInput.length - 1;
    if (this._playerInput[idx] !== this._correctOrder[idx]) {
      // Falló — reiniciar
      this._attempts++;
      this._playerInput.forEach(s => {
        const sym = this._symbols.find(sym => sym.id === s);
        if (sym) sym.selected = false;
      });
      this._playerInput = [];

      this._eventBus?.emit('minigame:pattern_fail', {
        minigameId: 'm08_pattern',
        attemptsLeft: this._maxAttempts - this._attempts,
      });

      // Diálogo de fallo
      if (this._attempts >= this._maxAttempts) {
        // Máximo de intentos alcanzado pero no se bloquea — puede reintentar
        this._attempts = 0;
      }
      return;
    }

    // Acierto parcial
    if (this._playerInput.length === this._correctOrder.length) {
      // Patrón completado
      this._completePattern();
    }
  }

  _completePattern() {
    this._state = 'idle';
    this._eventBus?.emit('minigame:pattern_solved', {
      minigameId: 'm08_pattern',
    });
    if (this._onComplete) this._onComplete();
  }

  // ── Update general ──────────────────────────────────────────────────────

  update(dt) {
    if (!this.active) return;
    // update es llamado externamente con la posición del jugador
    // desde el Game loop
  }

  // ── Render ──────────────────────────────────────────────────────────────

  render(ctx, _alpha) {
    if (!this.active) return;

    if (this._state === 'observation') {
      this._renderObservation(ctx);
    } else if (this._state === 'pattern') {
      this._renderPattern(ctx);
    }
  }

  _renderObservation(ctx) {
    // Indicador cerca de objeto oculto
    if (this._nearTarget && !this._nearTarget.found) {
      const dx = this._nearTarget.x - this._playerX;
      const dy = this._nearTarget.y - this._playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < HINT_DIST) {
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 400);
        ctx.fillStyle = '#FFD97D';
        ctx.font = '8px VT323, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[E] inspeccionar', this._nearTarget.x, this._nearTarget.y - 12);
        ctx.restore();
      }
    }

    // Contador de objetos encontrados
    ctx.save();
    ctx.fillStyle = '#C8A9FF';
    ctx.font = '10px VT323, monospace';
    ctx.fillText(`Objetos: ${this._foundCount}/${this._targets.length}`, 6, BASE_HEIGHT - 20);
    ctx.restore();
  }

  _renderPattern(ctx) {
    // Overlay
    ctx.fillStyle = 'rgba(10, 8, 18, 0.6)';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    ctx.save();
    ctx.textAlign = 'center';

    // Título
    ctx.fillStyle = '#C4B5FD';
    ctx.font = '11px VT323, monospace';
    ctx.fillText('— Patrón del Pasaje —', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 30);

    // Símbolos
    for (let i = 0; i < this._symbols.length; i++) {
      const sym = this._symbols[i];
      const rect = this._symbolRects[i];
      const isCursor = (i === this._cursorIdx && !sym.selected);

      ctx.strokeStyle = sym.selected ? '#8B5CF6' : (isCursor ? '#FFD97D' : '#4A2D6E');
      ctx.fillStyle   = sym.selected ? 'rgba(139, 92, 246, 0.3)' : (isCursor ? 'rgba(255, 217, 125, 0.15)' : 'rgba(30, 20, 50, 0.5)');
      ctx.lineWidth = isCursor ? 2 : 1.5;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

      ctx.fillStyle = sym.selected ? '#C4B5FD' : (isCursor ? '#FFD97D' : '#7A6AA0');
      ctx.font = '10px VT323, monospace';
      ctx.fillText(sym.label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 4);
    }

    // Input actual
    ctx.fillStyle = '#7A6AA0';
    ctx.font = '9px VT323, monospace';
    const inputStr = this._playerInput.length > 0
      ? `Orden: ${this._playerInput.map(id => this._symbols.find(s => s.id === id)?.label ?? '?').join(' → ')}`
      : 'Elige el orden de los símbolos';
    ctx.fillText(inputStr, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 55);

    // Intentos restantes
    ctx.fillStyle = '#5A4A7A';
    ctx.font = '8px VT323, monospace';
    ctx.fillText(`Intentos: ${this._attempts + 1}/${this._maxAttempts}`, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 70);

    // Hint de controles
    ctx.fillStyle = '#3A2A5A';
    ctx.fillText('← → mover   E seleccionar', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 82);

    ctx.restore();
    ctx.textAlign = 'left';
  }

  isObservationActive() { return this._state === 'observation'; }
  isPatternActive()     { return this._state === 'pattern'; }
  isIdle()             { return this._state === 'idle'; }

  // Detener cualquier minijuego activo
  stop() {
    this.active = false;
    this._state = 'idle';
    this._targets = [];
    this._symbols = [];
    this._playerInput = [];
  }

  destroy() {
    this.stop();
    this._input    = null;
    this._eventBus = null;
    this._dialogue = null;
  }
}
