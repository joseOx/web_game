# AGENTS.md — Grietas: Entre tú y el otro lado
## Directivas para el agente de desarrollo

---

## Identidad del proyecto

Estás construyendo **Grietas**, un juego 2D web de aventura emocional.
Stack: HTML5 Canvas, JavaScript ES2022+ (módulos nativos), Web Audio API, sin frameworks de juego externos.

Los documentos de referencia están en `/docs/`. Léelos todos antes de escribir cualquier línea de código:

```
/docs/grietas_lore.md          — narrativa, personajes, mundo
/docs/arquitectura_tecnica.md  — sistemas, estructura de archivos, patrones de código
/docs/level_design.md          — zonas, posiciones, grietas, NPCs
/docs/dialogue_trees.md        — todos los diálogos en formato JSON
/docs/game_states.md           — flags, efectos, dependencias entre sistemas
```

**Regla absoluta:** si algo no está en los documentos, pregunta antes de inventarlo. Nunca asumas nombres de flags, IDs de ítems, IDs de Grietas ni posiciones de entidades.

---

## Cómo trabajar

### Antes de escribir código

1. Lee el documento relevante para la tarea.
2. Identifica qué sistemas toca esa tarea (renderer, physics, AI, missions, etc.).
3. Verifica que los nombres de IDs que vas a usar existen en `game_states.md` y `level_design.md`.
4. Si la tarea toca diálogos, verifica los IDs en `dialogue_trees.md`.

### Al escribir código

- Un archivo por clase. Nombres de archivo = nombre de clase. Ejemplo: `Luna.js` contiene `class Luna`.
- Usar ES2022 módulos nativos (`import` / `export`). Sin CommonJS (`require`).
- Sin frameworks externos. Sin npm salvo herramientas de desarrollo (bundler, linter).
- Comentarios solo cuando la lógica no es obvia. No comentar lo que el código ya dice.
- Toda lógica de estado del mundo pasa por `SaveSystem.setFlag()` / `SaveSystem.getFlag()`. Nunca estado local no persistido para cosas que deben sobrevivir entre sesiones.
- Toda comunicación entre sistemas pasa por `EventBus.emit()` / `EventBus.on()`. Los sistemas no se llaman directamente entre sí salvo los definidos en `arquitectura_tecnica.md`.

### Al crear archivos

- Respetar exactamente la estructura de `/src/` definida en `arquitectura_tecnica.md`.
- Assets van en `/assets/` con los subdirectorios definidos.
- Datos de diálogo en `/assets/data/dialogues.json` — no hardcodeados en JS.
- Datos de misiones en `/src/missions/data/` — un archivo por misión.

### Al nombrar cosas

Los siguientes nombres son fijos y no deben cambiarse:

**IDs de Grietas** (de `level_design.md`):
`G_hub_alley`, `G_hub_tree`, `G_home_garden`, `G_lighthouse_lantern`,
`G_school_piano`, `G_beach_submarine`, `G_library_history`,
`G_cemetery_main`, `G_cemetery_chapel`, `G_cemetery_minor_1`, `G_cemetery_minor_2`

**IDs de entidades**:
`mateo`, `luna`, `N_abuela_rosa`, `N_vecina_carmen`, `N_nino_diego`, `N_bibliotecaria`,
`E_antonio_echo`, `E_vera_echo`, `E_brother_echo`, `E_archivist_echo`

**IDs de ítems**:
`I_antonio_letter`, `I_partitura_1`, `I_partitura_2`, `I_partitura_3`, `I_partitura_4`,
`I_partitura_completa`, `I_objeto_diego`, `I_fragmento_doc_1`, `I_fragmento_doc_2`,
`I_fragmento_doc_3`, `I_documentos_reconstruidos`, `I_shipwreck_box`

**IDs de misiones**:
`lighthouse`, `melody`, `garden`, `dogs`, `brothers`, `library`

**Flags de SaveSystem**: usar exactamente los nombres definidos en `game_states.md`.

---

## Orden de desarrollo

Seguir este orden. No saltar fases. Cada fase debe funcionar antes de pasar a la siguiente.

```
FASE 1 — Motor base
  [ ] index.html + canvas setup
  [ ] Game.js — loop con fixed timestep
  [ ] InputSystem.js — teclado básico
  [ ] Camera.js — follow + clamp
  [ ] TilemapRenderer.js — cargar y renderizar JSON de Tiled
  [ ] CollisionSystem.js — AABB básico
  [ ] AssetLoader.js — sprites y audio
  Criterio: Mateo se mueve por un tilemap con colisiones. Cámara lo sigue.

FASE 2 — Personajes
  [ ] Entity.js + sistema de componentes
  [ ] Mateo.js — movimiento, animación básica
  [ ] Luna.js — AI follow básica
  [ ] BondSystem.js — distancia y degradación
  [ ] AnimationSystem.js — estados de animación
  Criterio: Mateo camina, Luna lo sigue, la barra de vínculo baja si se alejan.

FASE 3 — El Vacío
  [ ] Dimension.js — estado REAL / VOID
  [ ] TransitionFX.js — efecto visual de cambio
  [ ] LightingSystem.js — paleta por dimensión
  [ ] RiftSystem.js — spawn y estado de Grietas
  [ ] VisionSystem.js — overlay visión felina
  Criterio: cambio de dimensión funciona con efecto visual. Grietas visibles en Vacío.

FASE 4 — Sistemas de juego
  [ ] DialogueSystem.js + dialogues.json
  [ ] MissionBase.js + MissionManager.js
  [ ] EventBus.js — comunicación entre sistemas
  [ ] SaveSystem.js — guardar y cargar flags
  [ ] AudioSystem.js — música y SFX básicos
  Criterio: un diálogo completo funciona. Una misión se activa, avanza y completa.

FASE 5 — AISystem completo
  [ ] LunaAI.js — FSM completa (FOLLOW, INVESTIGATE, PURR_SEAL, HISS_ECHO, ALERT)
  [ ] EchoMinorAI.js — wander, flee, accumulate
  [ ] EchoBoundAI.js — idle, trigger diálogo
  Criterio: Luna sella microgrietas sola. Ecos menores huyen de Luna.

FASE 6 — Contenido (una zona por iteración)
  [ ] R_HOME — casa de Rosa (zona tutorial)
  [ ] R_HUB — pueblo principal
  [ ] R_LIGHTHOUSE + V_LIGHTHOUSE + M01 completa
  [ ] R_SCHOOL + V_SCHOOL + M02 completa
  [ ] R_LIBRARY + V_LIBRARY + M06 completa
  [ ] R_BEACH_NORTH + M04 completa
  [ ] R_CEMETERY + V_CEMETERY + M05 completa
  [ ] Misión principal — Actos 1 al 5
  Criterio por zona: entidades en posición correcta, diálogos funcionando, misión completa de punta a punta.

FASE 7 — Polish
  [ ] ParticleSystem.js — efectos de sellado, transiciones
  [ ] Audio adaptativo — crossfade entre zonas
  [ ] Mobile/touch support en InputSystem
  [ ] Optimización — culling de tiles, object pooling de Ecos
  [ ] Endings — función determineEnding() y secuencias finales
```

---

## Criterios de calidad por tarea

Antes de considerar una tarea terminada, verificar:

**Para cualquier sistema nuevo:**
- [ ] Se comunica con otros sistemas solo vía `EventBus` (salvo excepciones documentadas)
- [ ] El estado persistente usa `SaveSystem`
- [ ] Tiene un método `destroy()` que limpia listeners y referencias

**Para cualquier zona/nivel:**
- [ ] Todos los IDs de Grietas coinciden con `level_design.md`
- [ ] Todos los NPCs están en las posiciones correctas (en tiles, no en px)
- [ ] Los triggers de misión están configurados
- [ ] La versión Vacío existe si `level_design.md` la define
- [ ] La paleta de color es correcta para la dimensión

**Para cualquier diálogo:**
- [ ] El ID del nodo de inicio coincide con `dialogue_trees.md`
- [ ] Las condiciones usan la sintaxis exacta de `game_states.md` sección 10
- [ ] Los `onExit` llaman a las funciones correctas con los IDs exactos
- [ ] Los retratos existen en el apéndice de `dialogue_trees.md`

**Para cualquier misión:**
- [ ] Los flags que escribe coinciden con los de `game_states.md`
- [ ] Los efectos en el mundo se aplican al completarse
- [ ] La misión tiene los pasos exactos definidos en `grietas_lore.md`

---

## Resolución base y canvas

```javascript
// Siempre usar esta resolución base. No cambiarla.
const BASE_WIDTH  = 320;
const BASE_HEIGHT = 180;
const TILE_SIZE   = 16;

// El canvas se escala por CSS para llenar la pantalla.
// imageSmoothingEnabled = false en todo momento.
// Sin antialiasing.
```

---

## Errores comunes — no hacer esto

```
✗ Hardcodear texto de diálogo en JS — siempre desde dialogues.json
✗ Crear flags con nombres distintos a los de game_states.md
✗ Comunicar sistemas directamente sin EventBus
✗ Usar localStorage directamente — siempre vía SaveSystem
✗ Crear assets con nombres distintos a los del apéndice de dialogue_trees.md (portraits)
✗ Cambiar la resolución base (320×180)
✗ Usar frameworks externos sin consultar primero
✗ Inventar posiciones de entidades — siempre de level_design.md
✗ Mezclar lógica de render con lógica de juego
✗ Estado de misión sin flag correspondiente en SaveSystem
```

---

## Cómo pedir aclaraciones

Si algo no está claro o hay un conflicto entre documentos:
1. Citar el documento y la sección específica donde está la ambigüedad.
2. Proponer la interpretación que parece más coherente con el resto del diseño.
3. Esperar confirmación antes de implementar.

No asumir. No inventar. Preguntar.
