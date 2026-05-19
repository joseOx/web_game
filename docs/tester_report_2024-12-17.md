# Reporte de QA — M07 "La tumba vacía"
**Fecha:** 2024-12-17  
**Tester:** QA Tester Senior  
**Veredicto:** APROBADO CON CORRECCIONES

---

## Resumen

Se revisó la implementación completa de la misión M07 "La tumba vacía" (6 archivos: 2 creados, 4 modificados). Se encontraron y corrigieron **6 bugs**, de los cuales **2 eran críticos** (impedían que los diálogos de cierre se mostraran).

---

## Archivos revisados

| Archivo | Estado |
|---------|--------|
| `src/missions/data/mission_07_cemetery_child.js` | ✅ Creado, corregido |
| `docs/propuesta_design_m07_cementerio.md` | ✅ Creado (documento de diseño) |
| `assets/data/dialogues.json` | ✅ Modificado, corregido |
| `src/main.js` | ✅ Modificado, corregido |
| `src/world/zones/ZoneR_CEMETERY.js` | ✅ Modificado, sin errores |
| `src/world/zones/ZoneV_CEMETERY.js` | ✅ Modificado, sin errores |

---

## Verificaciones

### COHERENCIA

| Verificación | Resultado |
|-------------|-----------|
| IDs de flags únicos (12 flags) | ✅ Sin colisiones |
| IDs de diálogos únicos (30+ nodos) | ✅ Sin duplicados (corregido) |
| `Mission07CemeteryChild` extiende `MissionBase` | ✅ Correcto |
| EventBus emisor/receptor | ✅ `item:picked`, `zone:loaded`, `rift:sealed`, `dialogue:node_exit` correctamente conectados |
| Formato de diálogos | ✅ Sigue el formato del DialogueSystem |

### CALIDAD

| Verificación | Resultado |
|-------------|-----------|
| Estilo consistente con otras misiones | ✅ Sigue el patrón de M01-M06 |
| Edge cases cubiertos | ✅ Ver abajo |
| Diálogos con formato correcto | ✅ `id`, `speaker`, `portrait`, `text`, `next`/`choices` presentes |

### NARRATIVA

| Verificación | Resultado |
|-------------|-----------|
| Historia emocionalmente coherente | ✅ La historia de Tomás y Emilia es poderosa y consistente con el tono del juego |
| Conexión con M05 | ✅ Ambas misiones forman un díptico sobre el duelo familiar |
| Consecuencias visibles | ✅ Resolución A: árbol florece + placa. Resolución B: Emilia como NPC aliada |
| Habilidades nuevas | ✅ Eco-localización (Luna) y Memoria Compartida Mejorada (Mateo) |

---

## Bugs encontrados y corregidos

### CRÍTICO 1: `emilia_m07_closure_A` nunca se mostraba
- **Síntoma:** El diálogo de cierre para resolución A tenía `condition: "flag:m07_tree_flowered"`, pero ese flag se seteaba en `onComplete()` de la misión, que se ejecuta DESPUÉS de que el diálogo se evalúa.
- **Solución:** Mover `saveSystem.setFlag('m07_tree_flowered', true)` al `onExit` de `tomas_echo_res_A_04`.

### CRÍTICO 2: `emilia_m07_closure_B` nunca se mostraba
- **Síntoma:** Mismo problema que el anterior con `m07_emilia_comforted`.
- **Solución:** Mover `saveSystem.setFlag('m07_emilia_comforted', true)` al `onExit` de `tomas_echo_res_B_end`.

### MEDIO 3: Doble camino de completación por `rift:sealed`
- **Síntoma:** El handler de `rift:sealed` completaba la misión sin verificar que la resolución ya fue elegida, potencialmente saltándose los diálogos de cierre.
- **Solución:** Añadir `this._saveSystem?.getFlag('m07_resolution')` como condición adicional.

### MEDIO 4: Emilia desaparecía de R_HUB al activar la misión
- **Síntoma:** La condición de spawn de Emilia en R_HUB incluía `!save.getFlag('mission_cemetery_child_active')`, lo que hacía que Emilia desapareciera cuando el jugador aceptaba la misión, imposibilitando el diálogo de cierre.
- **Solución:** Eliminar esa condición. Emilia permanece en R_HUB hasta que la misión se completa.

### MEDIO 5: Sin ruta de diálogo para cierre con Emilia
- **Síntoma:** No existía un diálogo que Emilia mostrara cuando la misión está activa y el jugador ha elegido una resolución.
- **Solución:** Crear `emilia_m07_route_hub` como nodo de ruta que redirige a `emilia_m07_route_active` (si la misión está activa) o a `emilia_m07_route` (si no). Crear `emilia_m07_route_active_check` y `emilia_m07_route_active_check_B` para detectar qué resolución se eligió.

### BAJO 6: Nodos de diálogo duplicados
- **Síntoma:** Los nodos `emilia_m07_route_active`, `emilia_m07_route_active_check` y `emilia_m07_route_active_check_B` aparecían dos veces en dialogues.json.
- **Solución:** Eliminar el bloque duplicado.

---

## Flujo corregido — Resolución A

1. `tomas_echo_res_A_04` → setea `m07_resolution='A'`, `m07_tree_flowered=true`
2. Jugador habla con Emilia en R_HUB → `emilia_m07_route_hub` → `emilia_m07_route_active` → `emilia_m07_route_active_check` → (condición `m07_tree_flowered` true) → opción "El árbol floreció"
3. `emilia_m07_closure_A` → ... → `emilia_m07_closure_A_03` → completa misión

## Flujo corregido — Resolución B

1. `tomas_echo_res_B_end` → setea `m07_resolution='B'`, `m07_emilia_comforted=true`, añade collar al inventario
2. Jugador habla con Emilia en R_HUB → `emilia_m07_route_hub` → `emilia_m07_route_active` → `emilia_m07_route_active_check` → (condición `m07_tree_flowered` false) → `emilia_m07_route_active_check_B` → (condición `m07_emilia_comforted` true) → opción "Tengo su collar"
3. `emilia_m07_closure_B` → ... → `emilia_m07_closure_B_04` → completa misión, setea `emilia_ally=true`

---

## Notas adicionales

- El flag `collar_tomas_found` se setea tanto en `item:picked` como en el handler de `dialogue:node_exit` para resolución B. Es redundante pero no dañino.
- El flag `rift_G_cemetery_child_discovered` se usa correctamente para evitar que el diálogo de descubrimiento se repita.
- Los guardianes de culpa en V_CEMETERY se desactivan si el jugador tiene `I_piedra_emilia`, implementado correctamente en `main.js`.
- El árbol `arbol_tomas` en R_CEMETERY usa `unlockFlag: 'm07_tree_flowered'` para cambiar su diálogo de inspección según la resolución.
