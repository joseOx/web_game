# QA Report — Corazón Firme (Steadfast Heart)

**Fecha:** 2025-01-09
**QA Tester:** Senior
**Veredicto:** APROBADO con correcciones

---

## Cambios revisados

### Archivos del Programador (commit `corazon_firme`)

| Archivo | Cambio |
|---------|--------|
| `src/systems/HeartAnchorSystem.js` | Sistema nuevo: pulso activo + pasivo + cooldown + render |
| `src/systems/InputSystem.js` | Binding `KeyF` → `heart_anchor` |
| `src/entities/EchoMinor.js` | Propiedades `_stunned`, `_stunnedTimer` |
| `src/systems/EchoMinorAI.js` | Check `_stunned` al inicio de `update()` |
| `src/systems/VisionSystem.js` | Método `addEnergy(amount)` |
| `assets/data/dialogues.json` | +7 nodos: tutorial, introspección, comentario Rosa |
| `docs/game_states.md` | Sección 10.5: flags heart_anchor |
| `docs/propuesta_design_corazon_firme.md` | Documento de diseño |
| `src/main.js` | Event listener + introspección + controls hint |

---

## Coherencia

### IDs de flags — Únicos ✅
- `mateo_heart_anchor_unlocked`: 12 referencias (SaveSystem, dialogues, game_states, main, HeartAnchorSystem)
- `heart_anchor_tutorial_seen`: 10 referencias (dialogues, game_states, main, HeartAnchorSystem)
- `heart_anchor_introspection_seen`: 5 referencias (dialogues, game_states, main)

### IDs de diálogos — Únicos ✅
- `heart_anchor_tutorial_01` → `_04`: solo en dialogues.json
- `heart_anchor_introspection_01` → `_02`: solo en dialogues.json
- `rosa_heart_anchor_comment`: solo en dialogues.json
- Ninguno duplica IDs existentes.

### Clase de misión — N/A (no es una misión, es un sistema)
- `HeartAnchorSystem` no extiende `MissionBase` — correcto, no debería.

### EventBus — Coherente ✅
- `events.emit('heart_anchor:unlocked')` en `HeartAnchorSystem.checkUnlock()`
- `events.on('heart_anchor:unlocked', ...)` en `main.js` línea 240
- `events.emit('heart_anchor:activated', {...})` en `HeartAnchorSystem.activate()`
- **No hay listener para `heart_anchor:activated`** — esto es intencional (el efecto visual lo maneja el propio sistema en render). El evento queda para futuras integraciones de audio/partículas.

---

## Calidad

### Edge cases cubiertos
| Caso | Estado |
|------|--------|
| Diálogo activo → F no activa | ✅ Check `dialogueOpen` en main.js línea 827 |
| Piano activo → F no activa | ✅ El check de `dialogueOpen` cubre también piano |
| Cooldown activo → F no hace nada | ✅ `activate()` retorna false |
| Menos de 3 misiones → no desbloquea | ✅ `done >= MIN_MISSIONS` |
| Cargar partida con flag pero sin tutorial visto | ✅ **Corregido por QA** — ver Bug 1 |
| Bond no HEALTHY → pasivo no aplica | ✅ `currentLevel() !== 'HEALTHY'` |
| F durante diálogo cubierto por check adicional | ✅ Doble check `!dialogueOpen` |

### Estilo de código
- Sigue el mismo patrón que otros sistemas (constructor → inject → update → render → destroy)
- Usa constantes con nombre, getters para valores computados
- Nomenclatura consistente: `_propiedadPrivada`, métodos camelCase

---

## Bugs encontrados y corregidos por QA

### Bug 1 (CRÍTICO) — Tutorial perdido al cargar partida

**Problema:** Si el jugador completa la 3ª misión, se guarda automáticamente (auto-save en `zone:loaded`) con el flag `mateo_heart_anchor_unlocked = true`, pero el tutorial `heart_anchor_tutorial_01` se dispara via `heart_anchor:unlocked` solo una vez. Si el jugador carga la partida antes de ver el tutorial, `checkUnlock()` retornaba temprano por `this.unlocked = true` y NUNCA re-emitía el evento.

**Solución:** En `HeartAnchorSystem.checkUnlock()`, agregué un re-emit condicional cuando `this.unlocked === true` pero `heart_anchor_tutorial_seen === false`.

**Archivo:** `src/systems/HeartAnchorSystem.js` líneas 62-69

### Bug 2 (MEDIO) — Diálogo de Rosa huérfano

**Problema:** El nodo `rosa_heart_anchor_comment` existía en dialogues.json pero ningún nodo lo referenciaba como `next` o choice. Rosa nunca decía esa línea.

**Solución:** Modifiqué `rosa_root_d` para que tenga `condition: flag:mateo_heart_anchor_unlocked`, con `next: rosa_heart_anchor_comment` y `nextElse: rosa_root_e`. El comentario ahora fluye hacia `rosa_root_e`.

**Archivo:** `assets/data/dialogues.json`

### Bug 3 (MEDIO) — Pasivos no cableados

**Problema:** Los getters `accumulateChanceDebuff` y `detectionRangeDebuff` de HeartAnchorSystem nunca eran leídos por EchoMinorAI, por lo que el efecto pasivo no existía en la práctica.

**Solución:** 
1. Añadí propiedad `_heartAnchor` a EchoMinorAI e inyecté `heartAnchorSystem` en todas las instancias (3 en main.js + 1 en SceneManager)
2. Modifiqué `_updateWander` para usar `accumulateChance` factor en la transición a ACCUMULATE
3. Modifiqué `_updateGuard` para usar `detectionRangeDebuff` y detener ecos antes

**Archivos:** `src/systems/EchoMinorAI.js`, `src/main.js`, `src/world/SceneManager.js`

---

## Narrativa

- ✅ La justificación ("cada persona ayudada fortalece la presencia de Mateo") es coherente con el lore
- ✅ El tutorial (tutorial_01→_04) es emocional y muestra a Luna reconociendo el cambio
- ✅ La introspección al entrar a R_HOME conecta con el abuelo y su cuaderno
- ✅ Rosa comenta el cambio en Mateo — consecuencia visible en el mundo
- ✅ La habilidad complementa a Luna (restaura visión, no la reemplaza)

---

## Resumen final

**APROBADO** — 3 bugs encontrados y corregidos:
1. Tutorial perdido en carga de partida (CRÍTICO)
2. Diálogo de Rosa huérfano (MEDIO)
3. Pasivos no cableados (MEDIO)

El sistema es sólido, está bien integrado y la narrativa es coherente con el tono del juego.
