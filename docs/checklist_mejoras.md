# Checklist de mejoras — Grietas
## Generado por debate de 6 agentes — 2026-05-18

---

## ✅ CORREGIDO EN ESTA SESIÓN

### Bug #1 — Emoción 'shame' no definida en EMOTION_COLORS
**Archivo:** `src/world/zones/ZoneV_LIBRARY.js`
**Problema:** La grieta `G_library_history`, el echo archivista y los guards usaban `emotion: 'shame'`,
que no existe en el mapa `EMOTION_COLORS` de `main.js`. Los ecos se renderizaban en blanco (#fff fallback).
**Fix:** Cambiado `shame` → `guilt` en todos los elementos de ZoneV_LIBRARY. Guardado el renombre
de los guards: `guard_shame_1/2` → `guard_guilt_1/2`.

### Bug #2 — echo_archivista sin spawnFlag
**Archivo:** `src/world/zones/ZoneV_LIBRARY.js`
**Problema:** El eco atado del archivista aparecía en V_LIBRARY siempre, incluso cuando la misión
`library` no estaba activa. Mismo patrón que el bug del hermano de Diego (corregido en sesión anterior).
**Fix:** Añadido `spawnFlag: 'mission_library_active'` al echo `echo_archivista`.

### Bug #3 — Mission 06 rift:sealed sin step gate
**Archivo:** `src/missions/data/mission_06_library.js`
**Problema:** Si la grieta `G_library_history` se sellaba antes de que el jugador confrontara al
archivista (paso 2), la misión se completaba prematuramente sin el diálogo de resolución.
**Fix:** Añadido `&& this.currentStep >= 2` al handler de `rift:sealed`.

---

## ✅ CORREGIDO EN ESTA SESIÓN (continuación)

### Bug #4 — M04: G_beach_submarine nunca se sellaba
**Archivo:** `assets/data/dialogues.json`
**Problema:** `beach_combat_win_01` no tenía `onExit`. La grieta major del naufragio nunca se sellaba
visualmente y M04 nunca podía completarse (su handler `rift:sealed` gateado en step 2 nunca recibía el evento).
Como M04 es necesaria para el ending completo, era un bloqueo de juego.
**Fix:** Añadido `"onExit": "riftSystem.completeSealing('G_beach_submarine')"` a `beach_combat_win_01`.

### Bug #5 — M05: G_cemetery_chapel no se sellaba via RiftSystem
**Archivo:** `assets/data/dialogues.json`
**Problema:** Los tres nodos de resolución de Diego (`diego_res_A_end`, `diego_res_B_05`, `diego_res_C_end_02`)
llamaban `saveSystem.setFlag('rift_G_cemetery_chapel_sealed',true)` en lugar de `riftSystem.completeSealing()`.
La grieta quedaba activa visualmente en la sesión actual aunque el flag se guardara.
**Fix:** Reemplazado `saveSystem.setFlag(...)` por `riftSystem.completeSealing('G_cemetery_chapel')` en los tres nodos.

### Bug #6 — M06: G_library_history no se sellaba via RiftSystem
**Archivo:** `assets/data/dialogues.json` + `src/missions/data/mission_06_library.js`
**Problema:** `archivist_echo_end.onExit` no llamaba `riftSystem.completeSealing()`, dejando la grieta visible.
Además `mission_06_library.js` guardaba flag con nombre incorrecto (`rift_library_history_sealed` sin 'G_').
**Fix:** Añadido `riftSystem.completeSealing('G_library_history')` al `onExit` del archivista.
Corregido nombre del flag en `onComplete()`: `rift_G_library_history_sealed`.

### Bug #7 — echo_abuelo sin spawnFlag (softlock M03)
**Archivo:** `src/world/zones/ZoneV_HOME.js`
**Problema:** `echo_abuelo` podía interactuarse antes de que M03 se activara. Al consumir el eco prematuramente,
el paso 1 de M03 ("hablar con el espíritu") nunca podía completarse — softlock.
**Fix:** Añadido `spawnFlag: 'mission_garden_active'` al echo.

### Bug #8 — V_HUB sin salidas (trampa de jugador)
**Archivo:** `src/world/zones/ZoneV_HUB.js` + `src/world/zones/ZoneR_HUB.js`
**Problema:** `exits: []` en V_HUB. Si Luna sellaba G_hub_alley (grieta minor → auto-sellable),
el jugador quedaba atrapado sin salida.
**Fix:** Añadidos dos exits laterales hacia R_HUB con `switchDim: 'real'` y `targetSpawn: 'from_v_hub'`.
Añadido spawn `from_v_hub` en ZoneR_HUB.

---

## 🔴 PENDIENTE — BUGS ACTIVOS

### Bug #9 — Save system no restaura la escena al continuar
**Archivo:** `src/main.js` línea ~115
**Problema:** `save.inject({ missionManager, bondSystem, mateo, luna, dimensionManager })` no pasa
`sceneManager: scenes`. El método `save.save()` almacena `scene: null`. Al seleccionar "Continuar",
el juego siempre arranca en `R_HOME` independientemente de dónde estaba el jugador.
**Fix requerido:** Pasar `sceneManager: scenes` en `save.inject()`, y en `SaveSystem.save()` guardar
`scene: sceneManager.currentZoneId`. En `SaveSystem.applyLoad()` llamar a `sceneManager.load(data.scene)`
tras restaurar flags. Requiere verificar que el prologue no se re-dispare al cargar mid-game.

---

---

## 🟡 PENDIENTE — CONTENIDO FALTANTE

### Gap #1 — Nodos de diálogo de endings no verificados
**Archivo:** `assets/data/dialogues.json`
**Problema:** `_determineEnding()` en main.js genera uno de 4 tipos (`ENDING_COMPLETE`,
`ENDING_STANDARD`, `ENDING_MINIMAL`, `ENDING_HARD`) y el handler `ending:show_screen` busca
los nodos `ending_complete_01`, `ending_standard_01`, `ending_minimal_01`, `ending_hard_01`,
`ending_epilogue`. No se ha verificado que estos nodos existan en dialogues.json con contenido
narrativo real.
**Fix requerido:** Verificar existencia y contenido de los 5 nodos de ending. Implementar si faltan.

### Gap #2 — Activación de misiones no verificada para M01, M03, M04, M06
**Problema:** Solo `melody` tiene activación explícita en main.js (auto-trigger al entrar a R_SCHOOL).
Las demás misiones (lighthouse, garden, dogs, library) aparentemente se activan a través de nodos
de diálogo en dialogues.json con acciones `onExit`. No se ha verificado que todos los triggers
de activación estén correctamente cableados.
**Fix requerido:** Auditar dialogues.json para confirmar que cada misión tiene un nodo de activación
o añadir triggers explícitos en el segundo `zone:loaded` handler de main.js.

### Gap #3 — Misión de jardín (M03): V_HOME no tiene eco bound
**Archivo:** `src/world/zones/ZoneV_HOME.js` (pendiente de lectura)
**Problema:** Según `grietas_lore.md`, M03 involucra una grieta `G_home_garden` en el jardín.
No se ha verificado que ZoneV_HOME tenga el eco correspondiente ni la grieta correctamente configurada.
**Fix requerido:** Leer ZoneV_HOME.js y verificar contra level_design.md.

---

## ✅ MEJORAS DE EXPERIENCIA — SESIÓN 3 (6-agentes)

### Mejora #1 — Eliminado debug `Luna: STATE` del HUD
**Archivo:** `src/main.js`
**Cambio:** Eliminadas las dos líneas que mostraban el estado interno del FSM de LunaAI al jugador.

### Mejora #2 — Nombres de zona amigables en el HUD
**Archivo:** `src/main.js`
**Cambio:** Añadido mapa `ZONE_NAMES` con 15 nombres narrativos (ej. `R_LIBRARY` → `'Biblioteca'`, `V_BEACH` → `'El Naufragio'`). El HUD usa el nombre amigable con fallback al ID técnico.

### Mejora #3 — Progreso de misión en HUD (Paso X/Y)
**Archivo:** `src/main.js`
**Cambio:** La línea de misión activa ahora muestra `▶ Título  2/3` usando `m.getStep()+1` y `m.steps.length`.

### Mejora #4 — HintSystem reconoce NPCs y objetos
**Archivos:** `src/ui/HintSystem.js`, `src/main.js`
**Cambio:** `HintSystem` inyecta `world`. Cuando no hay grieta visible, detecta NPCs a 32px (`[E]  hablar`) u objetos a 32px (`[E]  examinar`). Prioridad: rift > NPC > objeto.

### Mejora #5 — Vignette roja pulsante en bond DANGER/CRITICAL
**Archivo:** `src/main.js`
**Cambio:** En DANGER: overlay naranja-rojo sutil (13% opacity, ciclo 560ms). En CRITICAL: overlay rojo intenso (28% opacity, ciclo 280ms). Añadidas variables de módulo `_hudElapsed` / `_controlsAlpha`.

### Mejora #6 — Controles HUD se desvanecen a los 8 segundos
**Archivo:** `src/main.js`
**Cambio:** `_controlsAlpha` parte en 1.0 y se desvanece entre 8s y 11s. Despeja la pantalla sin eliminar el onboarding para jugadores nuevos.

### Mejora #7 — Etiqueta "visión felina" en barra de energía
**Archivo:** `src/systems/VisionSystem.js`
**Cambio:** Texto `'visión felina'` centrado sobre la barra de energía cuando está activa. Barra subida a `BASE_HEIGHT - 12` para dar espacio.

### Mejora #8 — Card de presentación de Mateo en el prólogo
**Archivo:** `src/ui/PrologueScreen.js`
**Cambio:** Insertada card `'Eres Mateo.'` (1800ms) entre '3 de la mañana.' y 'Tu gata lleva seis años contigo.' Flujo: lugar → hora → persona → relación → crisis.

### Bug #9 (encontrado durante audit) — Retrato archivist_relieved faltante
**Archivo:** `src/main.js`
**Cambio:** Añadido `'archivist_relieved'` al array del npcPortraitMap del archivista. Era usado en `archivist_echo_release_02` pero no estaba registrado.

---

## 🟢 PENDIENTE — MEJORAS DE POLISH (FASE 7)

### Polish #1 — ParticleSystem efectos de sellado
**Problema:** `ParticleSystem` existe y `particles.emit()` se llama al sellar grietas, pero los efectos
de sellado son básicos (burst de puntos). Falta: estela de partículas en sellado, transición visual
de entrada al Vacío.

### Polish #2 — Audio adaptativo por zona
**Problema:** `audio.startAmbient()` solo distingue void vs real. No hay crossfade entre zonas
(música diferente en faro vs cementerio, etc.).

### Polish #3 — Mobile/touch support
**Problema:** `InputSystem.setupTouch()` existe como método pero su implementación no ha sido
verificada. Los controles táctiles en `input.renderTouchControls(ctx)` se renderizan pero la
interacción puede estar incompleta.

### Polish #4 — Optimización
- Culling de tiles: solo renderizar tiles dentro del viewport (+1 margen)
- Object pooling de EchoMinor: evitar crear/destruir instancias en cada zona

### Polish #5 — Diego acompañante (resolución C)
**Problema:** `game_states.md` define que con `diego_resolution = 'C'`, Diego acompaña a Mateo
en biblioteca y cementerio. No se ha implementado la lógica de NPC-acompañante temporal.

---

## ℹ️ NOTAS DE ARQUITECTURA (no son bugs, son limitaciones conocidas)

- **Luna desaparece en mundo real** mientras `luna_missing = true`. Es correcto — es el Acto 2.
  Luna se vuelve visible de nuevo en el Vacío (`dimension.isVoid()`).
- **Rift major ≠ auto-sellable por Luna**. Luna en estado PURR_SEAL solo sella rifts menores.
  Las grietas mayores se sellan por diálogo/mecánica de misión.
- **`emotion: 'longing'` en guards del hub** (echo_minor_1/2/3 en ZoneR_HUB). Estos aparecen
  en el mundo real porque no tienen `spawnFlag`. Esto es intencional — son ecos ambientales,
  no atados a ninguna misión.
