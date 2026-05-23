# Reporte QA — "El Corazón del Vacío" + EchoReadingSystem
**Fecha:** 2026-05-23
**Tester:** QA Senior

## Veredicto: APROBADO CON CORRECCIONES

---

## Resumen

Se revisaron **6 archivos** (2 nuevos + 4 modificados) del commit `6a145d8`.
Se encontraron **2 bugs** (1 crítico, 1 medio), ambos corregidos.

---

## Bugs encontrados y corregidos

### BUG 1 — CRÍTICO: Condición de diálogo con flag incorrecto

**Archivo:** `assets/data/dialogues.json` — línea 2313
**Problema:** El diálogo `corazon_vacio_post_antonio_echo` tiene `condition: "flag:rift_lighthouse_lantern_sealed"` pero el flag real (definido en `mission_01_lighthouse.js`, línea 18) es `rift_G_lighthouse_lantern_sealed` (con prefijo `G_`).
**Consecuencia:** El diálogo NUNCA se dispararía.
**Corrección:** Cambiado a `flag:rift_G_lighthouse_lantern_sealed`.

### BUG 2 — MEDIO: Precedencia de operadores en EchoReadingSystem._renderUIEmotion

**Archivo:** `src/systems/EchoReadingSystem.js` — líneas 215-217 y 231-233
**Problema:** La expresión `echo.centerX() - this._mateoRef?.centerX() ?? 0` tiene mala precedencia. `echo.centerX() - undefined` produce `NaN`, y `NaN ?? 0` sigue siendo `NaN`.
**Consecuencia:** Si `_mateoRef` no está inyectado, el render del texto de UI produce `NaN` para distancias, potencialmente rompiendo la visualización.
**Corrección:** Se agregó early return `if (!this._mateoRef) return;` y se simplificaron las expresiones a `echo.centerX() - this._mateoRef.centerX()`.

---

## Issues menores (no corregidos, documentados)

### ISSUE 3 — Código muerto: `_lastUIEmotion` y `_lastUIDistance`

**Archivo:** `src/systems/EchoReadingSystem.js` — líneas 52-53
**Detalle:** Se inicializan `_lastUIEmotion` y `_lastUIDistance` en el constructor pero nunca se usan en la lógica del render. Parecen ser optimizaciones planeadas pero no implementadas. Sin impacto funcional.

### ISSUE 4 — Evento huérfano: `corazon_vacio:rosa_understands`

**Archivo:** `assets/data/dialogues.json` — línea 2294
**Detalle:** Se emite `eventBus.emit('corazon_vacio:rosa_understands')` pero ningún listener lo captura en el código actual. Sin impacto funcional.

### ISSUE 5 — Flag `corazon_vacio_tutorial_seen` sin verificación

**Archivo:** `assets/data/dialogues.json` — línea 2270
**Detalle:** El flag se setea en `corazon_vacio_luna_end.onExit` pero nunca se verifica en JS. El tutorial siempre se muestra después de la secuencia central. Sin impacto funcional.

---

## Verificaciones de coherencia

| Ítem | Estado |
|------|--------|
| IDs de flags únicos | ✅ Verificado (ningún duplicado) |
| IDs de diálogos únicos | ✅ Verificado (ningún duplicado) |
| Clase extiende MissionBase | ✅ N/A (no es una misión, es zona + sistema) |
| EventBus emisor/receptor | ⚠️ Un evento huérfano (ver Issue 4) |
| Formato de diálogos | ✅ Correcto (sigue patrón existente) |

## Verificaciones de calidad

| Ítem | Estado |
|------|--------|
| Mismo estilo que otras zonas/sistemas | ✅ Consistente |
| Edge cases cubiertos | ✅ Re-entry a V_HEART, fragmentos incompletos, flags idempotentes |
| Formato DialogueSystem | ✅ Correcto (narrative_float, umbral, choices) |

## Verificaciones narrativas

| Ítem | Estado |
|------|--------|
| Coherencia emocional con el juego | ✅ Excelente — conecta el lore del abuelo, la plaga histórica, y el Vacío |
| Consecuencias visibles en el mundo | ✅ Ecolectura cambia el render de todos los Ecos y Grietas |
| Luna no es solo mecánica | ✅ Su diálogo explica el origen de las Grietas desde su perspectiva milenaria |
| Empatía como herramienta | ✅ La revelación muestra que las Grietas son síntoma de dolor humano, no entes malignos |

---

## Notas adicionales

- **Diseño de zona V_HEART:** Las coordenadas del exit `to_heart` (x:0, y:0, w:8, h:8) son extremadamente pequeñas en píxeles. Los demás exits miden 16×48 o 16×32. Si es intencional (pasaje secreto estrecho), está bien, pero si se busca que sea un pasaje visible, considerar aumentar a al menos 16×16.
- **Objetos sin doneFlag:** Los objetos de V_HEART no tienen verificación de `doneFlag` en el handler de interacción de main.js (líneas 1037-1043), a diferencia de los NPCs. Esto permite re-inspeccionar fragmentos. Como los diálogos son narrativos y el flag es idempotente, no hay daño, pero es una inconsistencia contra el patrón de NPCs.
- **Comportamiento de LunaAI mejorado:** Se detectaron cambios preexistentes en `LunaAI.js` que mejoran la detección de ecos cerca de grietas mayores — esto complementa bien la Ecolectura.
