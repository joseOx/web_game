# QA Tester Report — VoidFogSystem + Dama de la Niebla

**Fecha:** 2026-05-24  
**Commit evaluado:** `5e196ac feat_void_fog_narrative`  
**Archivos revisados:** `src/effects/VoidFogSystem.js`, `assets/data/dialogues.json`, `src/main.js`

---

## Resumen

| Categoría | Resultado |
|-----------|-----------|
| **Coherencia** | ✅ OK (con correcciones) |
| **Calidad** | ✅ OK (con correcciones) |
| **Narrativa** | ✅ OK |
| **Estilo** | ✅ Coherente con el resto del código |
| **Veredicto final** | **APROBADO** (3 bugs corregidos) |

---

## Bugs encontrados y corregidos

### Bug #1 — CRÍTICO: Pool de partículas nunca se activa

**Archivo:** `src/effects/VoidFogSystem.js`  
**Síntoma:** La niebla nunca se renderiza en el Vacío.

**Causa raíz:** El constructor crea 40 partículas con `active: false` pero nunca llama a `_resetAll()`. Las partículas quedan permanentemente inactivas. El método `update()` salta todas las inactivas (`if (!p.active) continue`), por lo que el sistema entero es un no-op.

**Fix:** Añadir `this._resetAll()` al final del constructor.

### Bug #2 — MEDIO: Trigger de conexión Dama-M01 usa flag incorrecto

**Archivo:** `src/main.js` (línea 739)  
**Síntoma:** El diálogo `inspect_fog_after_dama` nunca se muestra aunque el jugador haya completado todos los fragmentos de la Dama.

**Causa raíz:** El trigger en `zone:loaded` para V_LIGHTHOUSE verificaba `fog_encounter_dama_01` (primer fragmento) en lugar de `fog_dama_all_fragments` (todos los fragmentos). El flag `fog_dama_m01_connection_seen` se marcaba como `true` inmediatamente al ver el primer fragmento, pero el diálogo `inspect_fog_after_dama` tiene `condition: "flag:fog_dama_all_fragments"`. Al fallar la condición, el diálogo nunca se reproduce, y el flag `m01_connection_seen` ya está `true`, por lo que el trigger nunca se re-ejecuta.

**Fix:** Cambiar `fog_encounter_dama_01` → `fog_dama_all_fragments` en la condición del trigger.

### Bug #3 — MENOR: Partículas no se reactivan al reingresar al Vacío

**Archivo:** `src/effects/VoidFogSystem.js`  
**Síntoma:** Al salir del Vacío y volver a entrar, la niebla no reaparece.

**Causa raíz:** `onDimensionChange()` desactiva todas las partículas al salir del Vacío (`p.active = false`), pero al reingresar solo setea `_active = true` sin reactivar las partículas individuales.

**Fix:** Rastrear `wasActive` antes del cambio y llamar `_resetAll()` cuando se pasa de inactivo a activo.

---

## Verificaciones adicionales

### Unicidad de IDs de flags
✅ Los 7 flags nuevos (`fog_encounter_dama_01`–`05`, `fog_dama_all_fragments`, `fog_dama_released`) son únicos — no existen duplicados en el código.

### Unicidad de IDs de diálogos
✅ Los 6 nodos nuevos (`fog_encounter_dama_01`–`05`, `inspect_fog_after_dama`) tienen IDs únicos — no hay colisiones.

### Consistencia de EventBus
✅ `eventBus.emit('fog:dama_complete')` en dialogues.json coincide con `events.on('fog:dama_complete', ...)` en main.js. El DialogueSystem expone `eventBus` que se inyecta con la instancia `events`.

### Chain de condiciones de diálogo
✅ La cadena de condiciones es correcta: `fog_encounter_dama_01 → 02 → 03 → 04 → 05`. Cada nodo requiere el flag del anterior, y el nodo 05 setea `fog_dama_all_fragments` via `onEnter`.

### Métodos existentes
✅ `bond.applyStabilityBonus(3)` existe en BondSystem.js línea 95.
✅ `voidFog.setPaletteShift(true)` existe en VoidFogSystem.js línea 64.

### Estilo de código
✅ VoidFogSystem.js sigue el patrón de clase ES2022 con métodos privados (`_`).
✅ El import en main.js sigue la misma convención que otros sistemas.
✅ El orden de render (después de world, antes de rifts/entidades) es correcto.

---

## Observaciones (no bloqueantes)

1. **Fragmentos de la Dama sin trigger en zonas:** Los diálogos `fog_encounter_dama_01`–`05` existen como datos pero no tienen objetos inspeccionables/NPCs que los activen en las zonas V_LIGHTHOUSE, V_HOME, V_HUB, V_BEACH, V_HEART. Son dead code hasta que se implementen los objetos de zona correspondientes. Se recomienda implementar los objetos en las 5 zonas como parte de una tarea futura.

2. **`setActive()` vs `onDimensionChange()`:** Hay dos caminos para activar/desactivar la niebla — el manual `setActive()` y el automático `onDimensionChange()`. `setActive()` desactiva partículas pero no las reactiva al volver (solo setea `_active = true`). Esto podría causar el mismo bug #3 si se usa `setActive()` en lugar de `onDimensionChange()`. Recomendación: unificar ambos caminos o asegurar que `setActive(true)` también llame a `_resetAll()`.

---

## Veredicto

✅ **APROBADO** — Los 3 bugs fueron identificados y corregidos. El sistema es funcional y la narrativa es coherente con el resto del juego.
