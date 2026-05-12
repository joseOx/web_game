# Grietas — Estados del Juego
### game_states.md

---

## Propósito del documento

Este documento es el **contrato de estado** del juego. Define todos los flags, variables y condiciones que el `SaveSystem`, el `MissionManager` y el `DialogueSystem` deben respetar. Cualquier cambio en el mundo que persista entre sesiones debe estar registrado aquí.

**Regla fundamental:** si un comportamiento del juego depende de algo que el jugador hizo antes, ese "algo" es un flag. No hay lógica de estado sin un flag documentado.

---

## 1. Estructura de un flag

```javascript
// Formato interno en SaveSystem
{
  key:          string,    // identificador único snake_case
  type:         'bool' | 'int' | 'string' | 'enum',
  default:      any,       // valor inicial
  description:  string,    // qué representa
  set_by:       string,    // qué sistema lo escribe
  read_by:      string[],  // qué sistemas lo leen
}
```

---

## 2. Flags de progresión principal

Controlan el avance del arco narrativo central.

| Flag | Tipo | Default | Descripción | Set by |
|------|------|---------|-------------|--------|
| `game_started` | bool | false | Primera vez que el juego arranca | Game.init() |
| `luna_missing` | bool | false | Luna desaparece — inicia Acto 2 | Cutscene trigger en faro |
| `void_first_entry` | bool | false | Mateo entra al Vacío por primera vez | DimensionManager |
| `void_mechanics_learned` | bool | false | Tutorial del Vacío completado | TutorialSystem |
| `luna_found_void` | bool | false | Mateo localiza a Luna en el Vacío | Cutscene M. principal |
| `weaver_first_seen` | bool | false | Primera aparición del Tejedor | Cutscene Acto 3 |
| `abuelo_backstory_unlocked` | bool | false | Rosa cuenta la historia del abuelo | rosa_post_m03 |
| `abuelo_connection_unlocked` | bool | false | Documentos revelan conexión del abuelo | archivist_echo_end |
| `critical_rift_known` | bool | false | Mateo sabe de la Grieta crítica bajo el faro | Diálogo Luna (Vacío) |
| `act_1_complete` | bool | false | — | SceneManager |
| `act_2_complete` | bool | false | — | SceneManager |
| `act_3_complete` | bool | false | — | SceneManager |
| `act_4_complete` | bool | false | — | SceneManager |
| `ending_triggered` | bool | false | Secuencia final iniciada | MissionManager |

---

## 3. Flags de misiones secundarias

### M01 — El farero y su faro

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mission_lighthouse_active` | bool | false | M01 activada |
| `mission_lighthouse_done` | bool | false | M01 completada |
| `antonio_talked_rosa` | bool | false | Mateo habló con Rosa sobre el faro |
| `antonio_logbook_read` | bool | false | Mateo leyó el libro de registro |
| `antonio_letter_found` | bool | false | Carta de Antonio recogida del cajón |
| `antonio_letter_read` | bool | false | Mateo leyó la carta antes de entregarla |
| `antonio_letter_delivered` | bool | false | Carta entregada al Eco de Antonio |
| `rift_lighthouse_lantern_sealed` | bool | false | Grieta del faro sellada |
| `antonio_notes_secret_active` | bool | false | Resolución secreta activada (requiere `antonio_letter_read`) |
| `antonio_notes_found_count` | int | 0 | Notas escondidas de Antonio encontradas (0–5) |

**Efectos en el mundo según flags M01:**

```
mission_lighthouse_done = true
  → Faro deja de encenderse solo de noche
  → Zona del faro: luz estática en la linterna (día y noche)
  → Luna: radio de detección de Grietas aumenta en 30px
  → HUB: nuevo ícono de orientación en el mapa

antonio_notes_secret_active = true
  → Aparecen 5 notas coleccionables en el mundo
  → antonio_notes_1 y _2 desbloqueadas en el faro
  → antonio_notes_3 en la escuela, _4 en biblioteca, _5 en cementerio
  → Cada nota añade entrada en el diario de Mateo

antonio_notes_found_count = 5
  → Diario desbloquea sección "Historia de Miraloma"
  → Mapa muestra ubicaciones de Grietas históricas
```

---

### M02 — La melodía incompleta

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mission_melody_active` | bool | false | M02 activada |
| `mission_melody_done` | bool | false | M02 completada |
| `partitura_1_found` | bool | false | Fragmento 1 recogido (pasillo escuela) |
| `partitura_2_found` | bool | false | Fragmento 2 recogido (aula 1) |
| `partitura_3_found` | bool | false | Fragmento 3 recogido (aula 2) |
| `partitura_4_found` | bool | false | Fragmento 4 recogido (biblioteca) |
| `partitura_complete` | bool | false | Los 4 fragmentos combinados en inventario |
| `partitura_delivered_vera` | bool | false | Partitura entregada al Eco de Vera |
| `rift_school_piano_sealed` | bool | false | Grieta del piano sellada |
| `melody_ability_unlocked` | bool | false | Habilidad de silbido desbloqueada |
| `vera_classmate_told` | bool | false | Mateo mostró la partitura al compañero adulto (resolución secreta) |

**Efectos en el mundo según flags M02:**

```
mission_melody_done = true
  → Piano deja de sonar solo
  → Escuela: ventana del salón de actos emite luz cálida
  → Objeto resonante habilitado: objetos cerca de Grietas vibran visualmente

melody_ability_unlocked = true
  → Input: mantener Q activa silbido de Mateo
  → Ecos menores en radio de 150px se ahuyentan durante 8 segundos
  → Cooldown: 30 segundos

vera_classmate_told = true
  → NPC adulto aparece en el HUB (Rodrigo, 40 años)
  → Diálogo adicional sobre la escuela antes de cerrar
  → Entrada de lore en diario
```

---

### M03 — El jardín de los recuerdos

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mission_garden_active` | bool | false | M03 activada |
| `mission_garden_done` | bool | false | M03 completada |
| `garden_rift_found` | bool | false | Mateo localizó G_home_garden con visión felina |
| `m03_message` | enum | null | Qué eligió Mateo decirle a Rosa: `miss` / `okay` / `release` |
| `m03_secret_unlocked` | bool | false | Resolución C elegida (puede irse tranquilo) |
| `garden_flowers_bloomed` | bool | false | Jardín florece tras M03 |
| `garden_signal_flowers` | bool | false | Flores de señal activas (req. `m03_secret_unlocked`) |
| `rosa_full_story_unlocked` | bool | false | Rosa cuenta el backstory completo de Miraloma |

**Efectos en el mundo según flags M03:**

```
mission_garden_done = true
  → Casa: jardín exterior cambia de marchito a florecido
  → Rosa: desbloquea diálogo rosa_post_m03
  → Rosa: diario de Rosa se vuelve interactuable

m03_secret_unlocked = true
  → Flor inusual (azul violeta) aparece en el jardín
  → Flores idénticas aparecen en: playa norte (cerca grieta), cementerio (lápida abuelo), void_hub
  → Cada flor es un objeto interactuable que da pista de ubicación de Luna

rosa_full_story_unlocked = true (req. mission_garden_done)
  → Rosa cuenta historia del abuelo (rosa_backstory_01 al 03)
  → Flag abuelo_backstory_unlocked = true
```

---

### M04 — Perros y sombras

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mission_dogs_active` | bool | false | M04 activada |
| `mission_dogs_done` | bool | false | M04 completada |
| `night_unlocked` | bool | false | Acceso a playa norte de noche |
| `dogs_howling_event` | bool | false | Evento de perros aullando visible en HUB |
| `echo_dog_1_separated` | bool | false | Eco separado del perro 1 |
| `echo_dog_2_separated` | bool | false | Eco separado del perro 2 |
| `echo_dog_3_separated` | bool | false | Eco separado del perro 3 |
| `rift_beach_submarine_sealed` | bool | false | Grieta submarina sellada |
| `luna_whistle_unlocked` | bool | false | Silbido de Luna desbloqueado |
| `shipwreck_box_found` | bool | false | Caja del barco hundido encontrada |
| `shipwreck_box_opened` | bool | false | Caja abierta (req. memory_share_unlocked) |

**Efectos en el mundo según flags M04:**

```
mission_dogs_done = true
  → HUB: perros del pueblo vuelven a comportamiento normal
  → Playa norte: accesible también de día tras la misión
  → Carmen: nuevo diálogo de agradecimiento

luna_whistle_unlocked = true
  → Input: doble tap Q activa silbido de Luna
  → Ecos menores en radio 200px se mueven hacia Luna (distracción)
  → Duración: 5 segundos. Cooldown: 20 segundos.

shipwreck_box_opened = true (req. memory_share_unlocked)
  → Revela documentos firmados por El Tejedor
  → Añade entrada en diario: "El Tejedor — primera evidencia"
  → Grieta crítica del faro aparece marcada en el mapa del diario
```

---

### M05 — Dos hermanos, una promesa

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mission_brothers_active` | bool | false | M05 activada |
| `mission_brothers_done` | bool | false | M05 completada |
| `hermano_echo_met` | bool | false | Mateo habló con el Eco del hermano |
| `objeto_diego_found` | bool | false | Objeto del hermano encontrado en Vacío |
| `diego_resolution` | enum | null | Resolución elegida: `A` / `B` / `C` |
| `diego_unavailable` | bool | false | Diego no disponible (resolución B — necesita tiempo) |
| `diego_ally` | bool | false | Diego es aliado (resolución B o C) |
| `memory_share_unlocked` | bool | false | Habilidad memoria compartida desbloqueada |

**Efectos en el mundo según flags M05:**

```
diego_resolution = 'A'
  → Diego: diálogo genérico de alivio
  → Cementerio: Grieta de la capilla sellada, zona normalizada

diego_resolution = 'B'
  → Diego: no aparece en el mapa por 3 "días" de juego
  → Tras reaparecer, diálogo de agradecimiento más profundo
  → diego_ally = true (con delay)

diego_resolution = 'C'
  → Cementerio: Grieta sellada con efecto visual más elaborado
  → diego_ally = true (inmediato)
  → Diego acompaña a Mateo en 2 zonas específicas (biblioteca y cementerio)

diego_ally = true (cualquier resolución que lo active)
  → Diego como NPC compañero temporal: en zonas con él presente,
    su "dolor resuelto" estabiliza el vínculo Mateo-Luna en +15%
  → Nuevo diálogo de Diego sobre su hermano (lore adicional)

memory_share_unlocked = true
  → Input: mantener E sobre objeto con carga emocional
  → Mateo ve secuencia de 3-5 imágenes del evento vinculado al objeto
  → Objetos que reaccionan: I_family_photo, I_lapida_abuelo,
    I_shipwreck_box, objetos del Tejedor (Acto 4)
```

---

### M06 — La grieta del olvido

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mission_library_active` | bool | false | M06 activada |
| `mission_library_done` | bool | false | M06 completada |
| `books_blank_seen` | bool | false | Mateo vio los libros en blanco |
| `fragmento_doc_1_found` | bool | false | Fragmento 1 de documentos encontrado |
| `fragmento_doc_2_found` | bool | false | Fragmento 2 encontrado |
| `fragmento_doc_3_found` | bool | false | Fragmento 3 encontrado |
| `documentos_reconstructed` | bool | false | Los 3 fragmentos combinados |
| `archivist_confronted` | bool | false | Eco del archivista confrontado con documentos |
| `rift_library_history_sealed` | bool | false | Grieta de la biblioteca sellada |
| `archive_full_unlocked` | bool | false | Acceso al archivo completo de Miraloma |
| `weaver_pattern_revealed` | bool | false | Patrón del Tejedor visible en los documentos |
| `abuelo_connection_unlocked` | bool | false | Conexión del abuelo con el Vacío revelada |

**Efectos en el mundo según flags M06:**

```
mission_library_done = true
  → Biblioteca: libros recuperan su texto
  → Sra. Ponce: diálogo de alivio
  → Mapa del diario: ubicaciones históricas de Grietas desbloqueadas

archive_full_unlocked = true
  → Nueva sección en diario: "Archivo de Miraloma"
  → 8 entradas de lore sobre la historia del pueblo
  → Mapa especial: Grietas documentadas en los últimos 50 años

weaver_pattern_revealed = true
  → Diario: nueva entrada "El Tejedor — expansión deliberada"
  → Las Grietas del mapa muestran fechas de aparición
  → Todas apuntan a un centro: el faro

abuelo_connection_unlocked = true
  → Diario: entrada "El abuelo de Mateo"
  → Rosa puede ser interrogada sobre el abuelo (nuevo diálogo)
  → Objeto I_family_photo responde a memoria_compartida con nueva secuencia
```

---

## 4. Flags de habilidades

| Flag | Tipo | Default | Desbloqueo | Efecto |
|------|------|---------|------------|--------|
| `feline_vision_available` | bool | false | Tutorial inicial (Acto 2) | Activar con Shift — ver Grietas y Ecos |
| `purr_seal_available` | bool | true | Disponible desde inicio | Luna puede sellar microgrietas pasivamente |
| `melody_ability_unlocked` | bool | false | M02 completada | Silbido ahuyenta Ecos menores |
| `luna_whistle_unlocked` | bool | false | M04 completada | Silbido atrae Ecos hacia Luna |
| `memory_share_unlocked` | bool | false | M05 completada | Ver memorias de objetos |
| `resonant_objects_active` | bool | false | M02 completada | Objetos vibran cerca de Grietas |
| `luna_detection_range_bonus` | int | 0 | M01 completada → +30px | Rango de detección de Luna |

---

## 5. Flags de estado del mundo (persistentes)

Cambios visuales permanentes en el mapa.

| Flag | Efecto visual | Set by |
|------|--------------|--------|
| `rift_lighthouse_lantern_sealed` | Linterna del faro: luz estática. Partículas selladas. | M01 complete |
| `rift_school_piano_sealed` | Ventana del salón: luz cálida. Piano mudo. | M02 complete |
| `rift_beach_submarine_sealed` | Playa: agua translúcida. Sin Ecos adheridos. | M04 complete |
| `rift_cemetery_chapel_sealed` | Capilla: puerta abierta. Flores en la entrada. | M05 complete |
| `rift_library_history_sealed` | Biblioteca: libros con texto. Estantería reorganizada. | M06 complete |
| `garden_flowers_bloomed` | Jardín de Rosa: flores y colores vivos. | M03 complete |
| `garden_signal_flowers` | Flores violeta en 3 puntos del mapa. | M03 resolución C |
| `dogs_howling_event` | HUB noche: perros agitados visibles. | Día 3 de juego |
| `night_unlocked` | Playa norte accesible de noche. | M04 activated |
| `faro_night_light_off` | Faro no se enciende solo de noche. | M01 complete |
| `school_piano_silent` | Piano de la escuela no suena. | M02 complete |

---

## 6. Flags de tiempo de juego

El juego no tiene tiempo real pero simula "días" basados en misiones completadas y zonas visitadas. Esto afecta qué eventos están disponibles.

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `game_day` | int | Día actual (empieza en 1, avanza con eventos) |
| `time_of_day` | enum | `day` / `dusk` / `night` |
| `day_advanced_by` | string[] | Lista de eventos que avanzaron el día |

**Reglas de avance de día:**

```
game_day avanza cuando:
  - Se completa una misión secundaria principal (+1)
  - Mateo duerme en casa de la abuela (+1)
  - Se completa una secuencia de historia principal (+1)

time_of_day = 'night' cuando:
  - game_day >= 3 (primera noche automática)
  - O Mateo entra a casa y "duerme" (acción voluntaria)

time_of_day = 'day' cuando:
  - Mateo sale de casa por la mañana (tras dormir)
```

**Eventos vinculados al día:**

| Evento | Condición |
|--------|-----------|
| Perros aúllan | `game_day >= 3` Y `mission_dogs_active = false` |
| Rosa menciona el faro | `game_day = 1` Y `mission_lighthouse_active = false` |
| Diego aparece en HUB | `mission_dogs_done = true` |
| Sra. Ponce menciona libros | `game_day >= 2` |

---

## 7. Flags de inventario

El inventario no es persistente entre dimensiones — los ítems del Vacío no pueden sacarse al mundo real excepto los que el juego marca explícitamente como `transferable: true`.

| ID de ítem | Nombre | Transferable | Misión |
|------------|--------|--------------|--------|
| `I_antonio_letter` | Carta de retiro de Antonio | true | M01 |
| `I_partitura_1` | Fragmento de partitura 1 | true | M02 |
| `I_partitura_2` | Fragmento de partitura 2 | true | M02 |
| `I_partitura_3` | Fragmento de partitura 3 | true | M02 |
| `I_partitura_4` | Fragmento de partitura 4 | true | M02 |
| `I_partitura_completa` | Partitura completa (combinado) | true | M02 |
| `I_objeto_diego` | Objeto del hermano de Diego | true | M05 |
| `I_fragmento_doc_1` | Fragmento de documento | false (Vacío only) | M06 |
| `I_fragmento_doc_2` | Fragmento de documento | false (Vacío only) | M06 |
| `I_fragmento_doc_3` | Fragmento de documento | false (Vacío only) | M06 |
| `I_documentos_reconstruidos` | Documentos completos | true | M06 |
| `I_shipwreck_box` | Caja del barco hundido | true | M04 secreto |

---

## 8. Flags de relaciones con NPCs

Determinan qué diálogos están disponibles y el comportamiento de los NPCs.

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `rosa_trust_level` | int | 0 | 0=normal, 1=confidente, 2=sabe todo |
| `diego_relationship` | enum | `stranger` | `stranger` / `acquaintance` / `ally` / `distant` |
| `diego_unavailable` | bool | false | Diego no disponible temporalmente (res. B) |
| `diego_ally` | bool | false | Diego es aliado activo |
| `carmen_grateful` | bool | false | Carmen agradecida tras M04 |
| `ponce_grateful` | bool | false | Sra. Ponce agradecida tras M06 |

**Efectos de rosa_trust_level:**

```
0 → Rosa da consejos genéricos y preguntas sobre la cena
1 → Rosa comparte memorias del pueblo (req. mission_garden_done)
2 → Rosa revela todo lo que sabe sobre el abuelo (req. abuelo_backstory_unlocked)
```

---

## 9. Flags del sistema de vínculo (Bond)

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `bond_current` | float | 100.0 | Nivel actual del vínculo (0–100) |
| `bond_critical_triggered` | bool | false | Se activó estado crítico al menos una vez |
| `bond_critical_count` | int | 0 | Veces que el vínculo llegó a nivel crítico |
| `bond_stability_bonus` | float | 0.0 | Bonus de estabilidad por aliados (Diego ally = +15%) |

**Consecuencias narrativas:**

```
bond_critical_count >= 3
  → Luna reacciona diferente al reunirse con Mateo (diálogo especial)
  → Entrada en diario: Mateo escribe sobre el miedo a perderla

bond_critical_triggered = true (alguna vez)
  → Sra. Ponce menciona que Mateo parece cansado (diálogo flavor)
  → Rosa pregunta si está bien (diálogo flavor)
```

---

## 10. Sistema de condiciones del DialogueSystem

El `DialogueSystem` evalúa condiciones usando el registro de flags. Sintaxis usada en `dialogue_trees.md`:

```javascript
// ConditionRegistry — funciones evaluables desde JSON
{
  'has_item:ID':           () => Inventory.has(id),
  'flag:NAME':             () => SaveSystem.getFlag(name),
  'NOT:flag:NAME':         () => !SaveSystem.getFlag(name),
  'mission:ID:active':     () => MissionManager.isActive(id),
  'mission:ID:done':       () => MissionManager.isDone(id),
  'mission:ID:step:N':     () => MissionManager.getStep(id) === n,
  'day:gte:N':             () => SaveSystem.getFlag('game_day') >= n,
  'bond:lte:N':            () => BondSystem.bond <= n,
  'resolution:ID:VALUE':   () => SaveSystem.getFlag(`${id}_resolution`) === value,
}

// Ejemplos de uso en nodo de diálogo:
"condition": "flag:mission_lighthouse_done"
"condition": "has_item:antonio_letter"
"condition": "NOT:flag:antonio_letter_read"
"condition": "mission:brothers:done"
"condition": "resolution:brothers:C"
```

---

## 11. Tabla de dependencias entre misiones

Algunas misiones requieren que otras estén activas o completadas.

```
M01 (Lighthouse)  → sin requisitos — disponible desde Acto 1
M02 (Melody)      → sin requisitos — disponible desde Acto 1
M03 (Garden)      → sin requisitos — disponible desde Acto 1
M04 (Dogs)        → requiere: hablar con Carmen (cualquier momento)
M05 (Brothers)    → requiere: mission_dogs_done = true
M06 (Library)     → sin requisitos — pero se enriquece con antonio_notes_secret_active

Habilidades:
  melody_ability   → requiere M02 completa
  luna_whistle     → requiere M04 completa
  memory_share     → requiere M05 completa
  resonant_objects → requiere M02 completa

Lore máximo (todo visible):
  → M01 secreta + M03 resolución C + M05 resolución C + M06 completa
  → + memory_share sobre I_family_photo y I_lapida_abuelo
  → Revela historia completa del abuelo y su vínculo con el Tejedor
```

---

## 12. Estado de fin de juego — condiciones de ending

El ending varía según el estado de los flags al llegar al Acto 5.

| Condición | Ending |
|-----------|--------|
| Todas las misiones secundarias completadas + resoluciones profundas (B/C en M05) | Ending completo — máximo lore, Luna y Mateo sellan juntos con apoyo de aliados |
| Mayoría de misiones completadas, mix de resoluciones | Ending estándar — Luna y Mateo sellan. El pueblo queda estable. |
| Pocas misiones, vínculo frecuentemente crítico | Ending mínimo — Luna sellada pero debilitada. Mateo no entiende del todo lo que pasó. |
| Sin misiones secundarias, vínculo roto una o más veces | Ending difícil — Luna sella sola. Mateo queda fuera. Epílogo melancólico. |

**Flags que determinan el ending:**

```javascript
function determineEnding() {
  const missionsCompleted = [
    'mission_lighthouse_done', 'mission_melody_done',
    'mission_garden_done', 'mission_dogs_done',
    'mission_brothers_done', 'mission_library_done'
  ].filter(f => SaveSystem.getFlag(f)).length;

  const deepResolution = SaveSystem.getFlag('diego_resolution') !== 'A';
  const secretsFound   = SaveSystem.getFlag('abuelo_connection_unlocked');
  const bondHealthy    = BondSystem.bond > 60 && BondSystem.bondCriticalCount < 2;

  if (missionsCompleted === 6 && deepResolution && secretsFound && bondHealthy) {
    return 'ENDING_COMPLETE';
  } else if (missionsCompleted >= 4 && bondHealthy) {
    return 'ENDING_STANDARD';
  } else if (missionsCompleted >= 2) {
    return 'ENDING_MINIMAL';
  } else {
    return 'ENDING_HARD';
  }
}
```

---

## 13. Checklist de implementación para el agente

Para cada flag documentado, el agente debe verificar:

- [ ] Flag declarado en `SaveSystem` con tipo y valor default correcto
- [ ] El sistema que escribe el flag (`set_by`) llama a `SaveSystem.setFlag()` en el momento correcto
- [ ] Los sistemas que leen el flag (`read_by`) usan `SaveSystem.getFlag()` con el nombre exacto
- [ ] Los nombres de flags en `dialogue_trees.md` coinciden exactamente con los definidos aquí
- [ ] Los nombres de flags en `level_design.md` (triggers de zona) coinciden exactamente
- [ ] Los efectos visuales y de gameplay de cada flag están implementados en los sistemas correspondientes
- [ ] El `SaveSystem.save()` serializa todos los flags antes de guardar
- [ ] El `SaveSystem.load()` restaura todos los flags correctamente
- [ ] La función `determineEnding()` lee flags con los nombres exactos de esta tabla

---

*Complementar con: `grietas_lore.md` (narrativa), `arquitectura_tecnica.md` (implementación de SaveSystem), `level_design.md` (triggers en mapa), `dialogue_trees.md` (condiciones de diálogo).*
