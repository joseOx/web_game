# Propuesta de diseño — El Umbral del Espejo (Capítulo 0: El Eco Inicial)

## Escena final extendida + Capítulo de epílogo (New Game Plus narrativo)

---

## 1. Resumen

**Nombre interno:** `umbral_espejo` (flag: `chapter_umbral_unlocked`)

**Tipo:** Secuencia cinemática interactiva + capítulo de epílogo desbloqueable

**Duración:** ~8-10 minutos (escena del espejo) + 20-30 minutos (capítulo post-ending)

**Desbloquea:** "Capítulo 0: El Eco Inicial" — una precuela jugable que cuenta la noche en que Luna encontró a Mateo (evento del lore, sección 8 de `grietas_lore.md`), vista desde la perspectiva de Luna.

**Zona nueva:** `R_UMBRAL` / `V_UMBRAL` — plano abstracto entre dimensiones

**Protagonistas:** Mateo (12 años, jugable en la escena) y Luna (con poderes expandidos)

---

## 2. Justificación narrativa

### 2.1 Conexión con el lore existente

En `docs/grietas_lore.md`, sección 8 ("El origen del vínculo — La noche que lo encontró"), se narra la historia de cómo Luna salvó a Mateo cuando tenía 6 años. Esa noche, Mateo cayó al Vacío a través de un **espejo de mano** en el desván. El espejo se rompió.

En la misión M06 (biblioteca), se establece que el abuelo de Mateo también investigó el Vacío, y que dejó registros que conectan con el espejo como **objeto-ancla dimensional**.

**El gancho narrativo que el juego actual NO cierra:** El espejo del abuelo se rompió, pero su marco de madera — con grabados que el abuelo talló — quedó en el desván. Ese marco contiene un patrón que, al ser tocado por Mateo después de haber sellado las 7 Grietas, abre un **umbral final** hacia el núcleo del Vacío, donde Luna lo espera para una conversación que no pudieron tener en el desenlace original.

### 2.2 Por qué esto NO está en el juego actual

El ending actual (main.js líneas 446-500) es funcional pero **narrativamente abreviado**:
- Mateo entra al desván → descubre algo → se muestra un epílogo según el tipo de ending
- No hay cierre emocional directo con Luna
- No hay resolución del arco del espejo (establecido en el lore sección 8.2)
- El jugador no tiene oportunidad de "despedirse" de Luna

Esta propuesta **añade una escena final canónica** que ocurre **después** del epílogo del ending, y desbloquea contenido nuevo.

---

## 3. Flujo de la escena "El Umbral del Espejo"

### 3.1 Trigger

La escena se activa **después** de que el jugador ha visto el ending (cualquier variante). El trigger es:

```js
// En main.js, evento zone:loaded para R_HOME
if (data.zoneId === 'R_HOME' && 
    save.getFlag('ending_screen_shown') && 
    !save.getFlag('umbral_espejo_visto')) {
  setTimeout(() => dialogue.start('umbral_espejo_trigger_01'), 1500);
}
```

### 3.2 Secuencia paso a paso

#### Fase 1: El llamado (Zona: R_HOME — Desván)

Mateo vuelve a su cuarto después de todo. En su mochila, el marco del espejo roto vibra. Al tocarlo:

```
Nodo: umbral_espejo_trigger_01
Estilo: narrative_float
Texto: "El marco de madera del espejo vibra en tu mochila. No lo habías notado antes. Los grabados del abuelo brillan con una luz violeta tenue."

Nodo: umbral_espejo_02
Speaker: mateo, portrait: mateo_surprised
Texto: "¿Esto... siempre estuvo aquí? Los grabados... son los mismos que vi en los documentos de la biblioteca."
```

- El jugador debe subir al desván (R_HOME_ATTIC) con el marco en el inventario.
- Al llegar al lugar exacto donde Mateo cayó al Vacío la primera vez (ver lore sección 8.2), el marco encaja en el suelo donde el espejo se rompió.

```
Nodo: umbral_espejo_attic_01
Estilo: narrative_float
Texto: "El marco encaja perfectamente en las marcas del suelo. La madera cruje. Una luz blanca comienza a emanar de las grietas del piso."

Nodo: umbral_espejo_attic_02
Speaker: mateo, portrait: mateo_determined
Texto: "Luna... ¿estás ahí? ¿Del otro lado?"
```

#### Fase 2: El umbral luminoso (Transición)

- Una grieta de **luz blanca pura** (no violeta) se abre en el suelo del desván.
- Es diferente a todas las demás Grietas: no es una fisura del Vacío, es un **puente dimensional estable**, creado por el abuelo décadas atrás y activado por las 7 Grietas selladas.
- `TransitionFX.playFull('light_pillar')` — nueva animación de transición (luz blanca envolvente, 2 segundos).
- Mateo cruza.

#### Fase 3: El plano abstracto (Zona nueva: V_UMBRAL)

- No es una zona tileada normal. Es un **espacio vacío con geometría abstracta**: plataformas flotantes de luz, partículas doradas, un cielo estrellado estático.
- No hay Ecos. No hay enemigos. Solo silencio y luz.
- Mateo camina hacia adelante. La cámara se acerca lentamente.
- Al fondo, una silueta familiar: **Luna**, pero en su forma del Vacío (grande, marcas luminosas en el pelaje).

#### Fase 4: El duelo emocional (núcleo de la escena)

La conversación usa el sistema de diálogo existente pero con un **estilo visual especial**:
- `style: "umbral"` (nuevo estilo de renderizado en DialogueSystem)
- Texto centrado, sin caja negra, con letras que aparecen con un brillo
- Sin retratos — solo los nombres de los hablantes flotando
- Música: versión lenta y ambiental del tema principal (nuevo audio `umbral_theme`)

La conversación es un **duelo de frases cortas**. Cada intervención es de 1-3 líneas máximo. El jugador elige cómo responde Mateo, y cada elección cambia el tono del cierre.

```
═╣ UMBRAL — ENCUENTRO CON LUNA ╠═

Nodo: umbral_luna_01
Speaker: Luna (telepática)
Estilo: umbral
Texto: "Mateo."
(Silencio. Luna parpadea lentamente.)

Nodo: umbral_luna_02
Speaker: mateo
Estilo: umbral
Texto: "Luna... ¿esto es real?"
Choices:
  → "¿Estás bien?" (next: umbral_luna_03a)
  → "¿Dónde estamos?" (next: umbral_luna_03b)
  → "Te he estado buscando." (next: umbral_luna_03c)

Nodo: umbral_luna_03a
Speaker: Luna
Estilo: umbral
Texto: "Estoy donde siempre estuve. Entre los dos lados."
Texto: "Pero ahora puedes oírme. Las siete puertas están cerradas."
Texto: "El camino está despejado."
→ next: umbral_luna_04

Nodo: umbral_luna_03b
Speaker: Luna
Estilo: umbral
Texto: "El lugar donde las dimensiones se tocan."
Texto: "Tu abuelo lo llamaba 'la costura del mundo'."
Texto: "Dejó esto para ti."
→ next: umbral_luna_04

Nodo: umbral_luna_03c
Speaker: Luna
Estilo: umbral
Texto: "Lo sé."
(Silencio. Luna da un paso hacia Mateo.)
Texto: "Siempre supe que vendrías."
→ next: umbral_luna_04

--- Punto medio ---

Nodo: umbral_luna_04
Speaker: Luna
Estilo: umbral
Texto: "Las grietas están selladas. El Tejedor se ha retirado."
Texto: "Pero hay algo que necesito decirte. Algo que no te dije antes."
→ next: umbral_luna_05

Nodo: umbral_luna_05
Speaker: Luna
Estilo: umbral
Texto: "La noche que te encontré... no fue casualidad."
Texto: "No buscaba a alguien brillante."
Texto: "Buscaba a alguien que se estaba apagando."
→ next: umbral_luna_06

Nodo: umbral_luna_06
Speaker: mateo
Estilo: umbral
Texto: "...¿Qué?"
Choices:
  → "No entiendo." (next: umbral_luna_07a)
  → "¿Te refieres a cuando mamá se fue?" (next: umbral_luna_07b)
  → "Y sin embargo me salvaste." (next: umbral_luna_07c)

Nodo: umbral_luna_07a
Speaker: Luna
Estilo: umbral
Texto: "Tu dolor creó una abertura. Pequeña. Apenas un susurro."
Texto: "Los Ecos se acercaban. Yo los ahuyentaba."
Texto: "Pero esa noche eran demasiados."
→ next: umbral_luna_08

Nodo: umbral_luna_07b
Speaker: Luna
Estilo: umbral
Texto: "Su partida dejó un vacío dentro de ti."
Texto: "No emocional. Real. Un espacio por donde el Vacío podía filtrarse."
Texto: "Y se filtró."
→ next: umbral_luna_08

Nodo: umbral_luna_07c
Speaker: Luna
Estilo: umbral
Texto: "Tú también me salvaste a mí esa noche."
(Silencio. Luna parpadea.)
Texto: "Si no hubieras salido al jardín, los Ecos me habrían vencido."
→ next: umbral_luna_08

--- Clímax emocional ---

Nodo: umbral_luna_08
Speaker: Luna
Estilo: umbral
Texto: "He estado contigo seis años. Cada noche. Cada sombra."
Texto: "No porque tuviera que hacerlo."
Texto: "Porque quise."
→ next: umbral_luna_09

Nodo: umbral_luna_09
Speaker: mateo
Estilo: umbral
Texto: "¿Te vas a quedar?"
Choices:
  → "Quédate conmigo." (next: umbral_luna_res_A)
  → "Si tienes que irte... entiendo." (next: umbral_luna_res_B)
  → "¿Puedo ir contigo?" (next: umbral_luna_res_C)

Nodo: umbral_luna_res_A — "Quédate" (tono: esperanza)
Speaker: Luna
Estilo: umbral
Texto: "Siempre. No puedo estar en ningún otro lado."
Texto: "Este es mi lugar. Contigo."
→ onExit: "saveSystem.setFlag('umbral_resolution', 'A')"
→ next: umbral_luna_final

Nodo: umbral_luna_res_B — "Entiendo" (tono: melancolía)
Speaker: Luna
Estilo: umbral
Texto: "No puedo irme del todo. El vínculo no se rompe."
Texto: "Pero necesito descansar. Entre las dimensiones."
Texto: "No para siempre. Solo... hasta que me necesites."
→ onExit: "saveSystem.setFlag('umbral_resolution', 'B')"
→ next: umbral_luna_final

Nodo: umbral_luna_res_C — "¿Puedo ir contigo?" (tono: aventura)
Speaker: Luna
Estilo: umbral
Texto: "Todavía no. Tu lugar está aquí. Hay personas que te necesitan."
Texto: "Pero el umbral queda abierto. Para ti. Siempre."
(Silencio. Luna sonríe felinamente.)
Texto: "Y cuando quieras verme... sabes dónde encontrarme."
→ onExit: "saveSystem.setFlag('umbral_resolution', 'C')"
→ next: umbral_luna_final

--- Final ---

Nodo: umbral_luna_final
Speaker: Luna
Estilo: umbral
Texto: "Mateo."
Texto: "Gracias."
(Silencio. Luna se acerca y apoya su cabeza contra el pecho de Mateo.)
Texto: "Ronroneo."
→ next: null
→ onExit: "saveSystem.setFlag('umbral_espejo_visto', true); saveSystem.setFlag('chapter_umbral_unlocked', true)"
```

#### Fase 5: Transición al epílogo visual

Un ronroneo llena la pantalla. La luz blanca se intensifica. La pantalla se funde a blanco.

**Texto flotante (narrative_float):**
> "El marco del espejo ya no vibra. Los grabados del abuelo han desaparecido, como si hubieran cumplido su propósito."
>
> "Luna duerme en tu cama. O lo que queda de ella en este lado."
>
> "Pero el otro lado... ahora sabes que existe. Y que siempre has tenido la llave."

**La escena termina.**
**El juego guarda automáticamente con el flag `chapter_umbral_unlocked = true`.**

---

## 4. Capítulo desbloqueable: "El Eco Inicial" (precuela jugable)

### 4.1 ¿Qué se desbloquea?

Aparece una nueva entrada en el menú de misiones (TitleScreen o un nuevo menú de "Capítulos"): **"Capítulo 0: El Eco Inicial"**.

No es una misión secundaria más. Es un **capítulo independiente jugable** que:

- Se juega desde la perspectiva de **Luna** (la gata), no de Mateo
- Ocurre cronológicamente **antes** de la historia principal (6 años atrás)
- Narra la noche en que Luna encontró a Mateo (el evento del lore sección 8)
- Usa mecánicas únicas: sigilo felino, detección de Ecos, ronroneo protector
- Tiene su propio minijefe: el Eco colectivo que acechaba a Mateo esa noche
- Duración estimada: 20-30 minutos

### 4.2 Mecánica de juego invertida

En el Capítulo 0, el jugador **no controla a Mateo**. Controla a **Luna**:

| Aspecto | Descripción |
|---------|-------------|
| **Movimiento** | Luna se mueve más rápido que Mateo, puede saltar más alto, tiene visión nocturna permanente |
| **Visión** | Luna ve los Ecos sin necesidad de activar nada |
| **Sigilo** | Luna debe evitar ser vista por humanos (Rosa, Mateo durmiendo) y no despertar sospechas |
| **Combate** | Luna puede enfrentar Ecos menores directamente (zarpazos + ronroneo), pero los Ecos grandes requieren evitarse |
| **Objetivo** | Proteger a Mateo sin que él se dé cuenta de que está siendo protegido |
| **Habilidad especial** | "Ronroneo de anclaje" — Luna se enrosca sobre Mateo mientras duerme y emite frecuencias que disuelven Ecos cercanos. Mecánica: mantener la cercanía por X segundos. |

### 4.3 Estructura del Capítulo 0

```
Escena 1 — "El acecho"
  Zona: Alrededores de la casa de Rosa (noche, lluvia)
  Controlas a Luna mientras patrulla el perímetro.
  Objetivo: Ahuyentar 3 Ecos menores que merodean la ventana de Mateo.
  Mecánica: Acechar → bufar → el Eco huye.
  Diálogos: Ninguno (Luna no habla en ese momento). Solo sonidos y música.

Escena 2 — "La acumulación"
  Zona: Jardín trasero
  Los Ecos se reagrupan. Son más. Luna los enfrenta.
  Minijuego de combate felino: 3 oleadas de Ecos menores.
  Luna resulta herida. Retrocede contra el muro.
  → Momento clave del lore: justo antes de que Mateo salga al jardín.

Escena 3 — "La salida"
  Mateo abre la puerta. Luna lo ve.
  Los Ecos huyen porque Luna, protegida por la presencia de Mateo, puede expulsarlos.
  → Jugador: Luna debe llegar hasta Mateo y enroscarse en su pecho.
  → Ronroneo de anclaje. La escena se funde.

Escena 4 — "El juramento silencioso" (epílogo del capítulo)
  Amanece. Mateo duerme con Luna en el pecho.
  Rosa los encuentra. Sonríe. Trae leche tibia.
  Texto flotante:
    "Esa mañana, Luna tomó una decisión."
    "No sabía cuánto duraría. No sabía si podría."
    "Pero mientras él respirara, ella velaría."
    "Y eso fue suficiente."

Recompensa al completar:
  - Desbloqueo cosmético: Luna obtiene una marca luminosa adicional en el Vacío
  - Desbloqueo narrativo: El cuaderno del abuelo gana una entrada final (se lee en la biblioteca)
  - Flag: `chapter_0_completed`
```

### 4.4 Integración en el menú

El capítulo desbloqueado aparece como:

- **Opción nueva en TitleScreen:** "Capítulo 0 — El Eco Inicial" (solo si `chapter_umbral_unlocked` es true)
- **O en el HUD:** Al presionar una tecla (M de "misiones" / "capítulos") se abre un overlay con las misiones existentes + el Capítulo 0 resaltado
- **Independiente del save principal:** El Capítulo 0 tiene su propio slot de guardado separado (`grietas_chapter0_save`), permitiendo al jugador alternar entre la partida principal y la precuela sin conflictos

---

## 5. Sistemas involucrados

### 5.1 Sistema principal: DialogueSystem

La escena del umbral usa el sistema de diálogo existente pero requiere:

| Cambio | Archivo | Descripción |
|--------|---------|-------------|
| Nuevo estilo `'umbral'` | `src/ui/DialogueSystem.js` | Renderizado sin caja negra, texto centrado, brillo dorado, fondo translúcido |
| Nuevo método `renderUmbral(ctx, node)` | `src/ui/DialogueSystem.js` | ~30 líneas adicionales en el método `render()` |

### 5.2 Sistema nuevo: ChapterManager

**Archivo nuevo:** `src/systems/ChapterManager.js`

Clase que maneja:
- Estado del Capítulo 0 (bloqueado, disponible, completado)
- Persistencia separada del save principal
- Carga y descarga de la escena del capítulo
- Gestión del modo "Luna como protagonista" (sprite, controles, habilidades)

### 5.3 Sistemas existentes modificados

| Sistema | Cambio |
|---------|--------|
| **DialogueSystem** | Añadir estilo `'umbral'` para la conversación especial |
| **TransitionFX** | Añadir nueva animación `'light_pillar'` (transición de luz blanca ascendente) |
| **SceneManager** | Registrar zona `V_UMBRAL` (plano abstracto) y `R_CHAPTER0` (precuela) |
| **SaveSystem** | Agregar capacidad de múltiples slots: `chapter0_save` y `chapter0_completed` |
| **TitleScreen** | Añadir opción "Capítulo 0" si `chapter_umbral_unlocked` |
| **main.js** | ~30 eventos nuevos (trigger de umbral, carga de capítulo, lógica de ending extendido) |
| **InputSystem** | Añadir tecla `M` para abrir mapa/capítulos (KeyM → 'chapter_menu') |
| **World** | Poder cargar escenas sin tilemap (modo abstracto para V_UMBRAL) |
| **BondSystem** | En el Capítulo 0, el bond es reemplazado por "energía felina" |

### 5.4 Nuevos tipos de zona

| Zona | Tipo | Descripción |
|------|------|-------------|
| `V_UMBRAL` | Abstracta (sin tilemap) | Plano entre dimensiones — fondo negro con estrellas y plataformas de luz |
| `R_CHAPTER0_HOUSE` | Tileada (noche/lluvia) | Casa de Rosa hace 6 años — paleta más fría, objetos distintos |
| `R_CHAPTER0_GARDEN` | Tileada (noche/lluvia) | Jardín trasero — versión nocturna con Ecos visibles sin Visión felina |

---

## 6. Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `src/systems/ChapterManager.js` | Gestión del capítulo desbloqueable, persistencia separada, modo Luna-protagonista |
| `src/world/zones/ZoneV_UMBRAL.js` | Definición del plano abstracto (plataformas de luz, sin tilemap) |
| `src/world/zones/ZoneR_CHAPTER0_HOUSE.js` | Casa de Rosa versión precuela (noche, 6 años atrás) |
| `src/world/zones/ZoneR_CHAPTER0_GARDEN.js` | Jardín versión precuela (noche, lluvia, Ecos) |
| `assets/sprites/luna_chapter0.png` | Sprite de Luna joven (más pequeña, sin marcas luminosas) |
| `assets/audio/umbral_theme.ogg` | Tema ambiental para la escena del umbral (piano solo, lento) |
| `assets/audio/chapter0_ambient.ogg` | Ambiental de lluvia nocturna para el Capítulo 0 |
| `docs/propuesta_design_umbral_espejo.md` | Este documento |

---

## 7. Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/main.js` | ① Importar `ChapterManager` ② Instanciar e inyectar ③ Agregar trigger del umbral en `zone:loaded` para R_HOME ④ Agregar handler de ending extendido ⑤ Cargar zona V_UMBRAL ⑥ Agregar KeyM binding ⑦ Agregar `chapter_umbral_unlocked` a `_determineEnding()` como bonus |
| `src/ui/DialogueSystem.js` | ① Añadir constante `UMBRAL_COLOR = '#FFE8B0'` ② En `render()`, si `node.style === 'umbral'`, llamar `_renderUmbral()` ③ Implementar `_renderUmbral()`: fondo translúcido dorado, texto centrado, sin caja negra, nombres flotantes, animación de brillo |
| `src/ui/TransitionFX.js` | ① Añadir estado `'light_pillar'`: duración 2000ms, pantalla se llena de blanco desde abajo, partículas doradas |
| `src/world/SceneManager.js` | ① Registrar zonas `V_UMBRAL`, `R_CHAPTER0_HOUSE`, `R_CHAPTER0_GARDEN` ② En `load()`, si la zona no tiene tilemap (abstracta), saltar carga de tiles y dibujar fondo directamente |
| `src/systems/InputSystem.js` | ① Añadir `'KeyM': 'chapter_menu'` a BINDINGS |
| `src/ui/TitleScreen.js` | ① Añadir opción "Capítulo 0 — El Eco Inicial" si `saveSystem.getFlag('chapter_umbral_unlocked')` ② Renderizar texto con color especial (#FFD97D) |
| `src/core/SaveSystem.js` | ① Añadir métodos `saveChapter0()` y `loadChapter0()` con clave separada `grietas_chapter0_v1` ② Añadir flag `chapter_0_completed` |

---

## 8. Flags nuevos (verificados contra game_states.md)

| Flag | Tipo | Default | Descripción | Set by |
|------|------|---------|-------------|--------|
| `umbral_espejo_visto` | bool | false | El jugador ya vio la escena del espejo | `umbral_luna_final` onExit |
| `chapter_umbral_unlocked` | bool | false | Capítulo 0 desbloqueado en el menú | `umbral_luna_final` onExit |
| `umbral_resolution` | enum | null | `'A'` (quédate), `'B'` (entiendo), `'C'` (ir contigo) | Elección del jugador en escena |
| `chapter_0_started` | bool | false | Jugador comenzó el Capítulo 0 | Al seleccionar en menú |
| `chapter_0_completed` | bool | false | Jugador completó el Capítulo 0 | Al finalizar escena 4 |
| `chapter0_echo_defeated` | bool | false | Eco colectivo vencido en la precuela | Combate del Capítulo 0 |

**Verificación:** Ninguno de estos flags existe en `docs/game_states.md` ni en ninguna misión existente. El ID `chapter_umbral_unlocked` es nuevo.

---

## 9. Nodos de diálogo nuevos

Se crean aproximadamente 25 nodos nuevos en `assets/data/dialogues.json`:

| Prefijo | Cantidad | Propósito |
|---------|----------|-----------|
| `umbral_espejo_*` | 4 | Trigger y transición en el desván |
| `umbral_luna_*` | 18 | Conversación en el plano abstracto (con opciones ramificadas) |
| `umbral_capitulo0_*` | 3 | Textos flotantes de introducción al capítulo |

IDs exactos (para evitar colisiones):
```
umbral_espejo_trigger_01, umbral_espejo_02, umbral_espejo_attic_01, umbral_espejo_attic_02
umbral_luna_01, umbral_luna_02, umbral_luna_03a, umbral_luna_03b, umbral_luna_03c
umbral_luna_04, umbral_luna_05, umbral_luna_06
umbral_luna_07a, umbral_luna_07b, umbral_luna_07c
umbral_luna_08, umbral_luna_09
umbral_luna_res_A, umbral_luna_res_B, umbral_luna_res_C
umbral_luna_final
```

---

## 10. Duración estimada de implementación

| Componente | Tiempo estimado |
|------------|-----------------|
| Escena del umbral (diálogos + lógica de trigger) | 3-4 horas |
| Estilo `'umbral'` en DialogueSystem | 1-2 horas |
| Zona V_UMBRAL (plano abstracto) | 2-3 horas |
| TransitionFX `'light_pillar'` | 1 hora |
| ChapterManager system | 4-5 horas |
| Zonas del Capítulo 0 (casa + jardín, noche) | 3-4 horas |
| Mecánica de Luna-protagonista (invertir controles) | 3-4 horas |
| Combate felino (3 oleadas de Ecos) | 2-3 horas |
| Integración en TitleScreen + menú de capítulos | 2 horas |
| Testing y ajustes | 3-4 horas |
| **Total estimado** | **24-32 horas (~4-5 días)** |

---

## 11. Por qué esto aumenta la retención del jugador

### 11.1 Cierre emocional

El juego actual termina con un epílogo funcional pero frío. La escena del espejo da a los jugadores **un cierre emocional con Luna** que es el núcleo de la historia. El duelo de frases cortas con opciones permite que cada jugador **personalice el tono de su despedida**, haciendo que el final se sienta único y propio.

### 11.2 Contenido post-ending (NG+ narrativo)

El Capítulo 0 no es un simple "modo historia" repetido — es **contenido nuevo genuino**: una precuela desde la perspectiva de Luna. Los jugadores que completaron las 7 misiones y vieron el ending tienen **algo más que hacer**: jugar como la gata que los acompañó todo el juego.

### 11.3 Re-jugabilidad

Las 3 resoluciones del umbral (A/B/C) incentivan al jugador a re-jugar la escena para ver los distintos tonos de cierre. Y el Capítulo 0, al ser una mecánica completamente distinta (sigilo felino vs exploración humana), ofrece una experiencia fresca.

### 11.4 Conexión con el lore que cierra círculos

El espejo del abuelo aparece en el lore como un objeto misterioso (sección 8.2). Esta escena le da **resolución a ese hilo narrativo** que quedó abierto. Los jugadores que exploraron la biblioteca (M06) y leyeron los documentos del abuelo tendrán una experiencia de "revelación" al entender que el espejo no era un objeto cualquiera — era un **puente dimensional** que el abuelo preparó décadas antes.

### 11.5 Bajo costo de assets

La escena del umbral usa principalmente el sistema de diálogo existente. No requiere sprites nuevos complejos (solo texto y fondo). El Capítulo 0 puede reutilizar tilesets existentes con paleta nocturna. La mayor inversión es de código, no de arte.

---

## 12. Notas de implementación

### 12.1 El estilo `'umbral'` en DialogueSystem

Para implementar el nuevo estilo de renderizado:

```js
// En DialogueSystem._renderUmbral(ctx, node)
// 1. Fondo translúcido: fillRect con rgba(20, 10, 40, 0.7) en toda la pantalla
// 2. El texto se renderiza centrado, con una animación de "aparición gradual"
// 3. Speaker flota arriba del texto, en color #FFD97D
// 4. Choices se muestran igual que en el estilo normal, pero sobre el fondo oscuro translúcido
// 5. Pequeñas partículas doradas alrededor del texto (opcional, bajo rendimiento)
// 6. Sin typewriter — el texto completo aparece con fade-in (0.5s)
```

### 12.2 El Capítulo 0 es opcional

El Capítulo 0 no interfiere con la partida principal. Se guarda en un slot separado. El jugador puede:
- Completar la historia principal → ver el epílogo → desbloquear el umbral → entrar al Capítulo 0
- O volver a la partida principal después de jugar el Capítulo 0 sin problemas

### 12.3 Reutilización de código existente

- El sistema de combate de `LunaCombatMode` se puede reutilizar para las oleadas de Ecos del Capítulo 0
- La lógica de visión felina (`VisionSystem`) ya existe — para Luna es permanente
- El sistema de diálogo ya soporta opciones condicionales — las resoluciones del umbral usan la misma infraestructura
- La escena del desván (`R_HOME_ATTIC`) ya existe solo hay que añadir el trigger condicional

### 12.4 Compatibilidad con los 4 endings

La escena del umbral se desbloquea **independientemente de qué ending se obtuvo** (COMPLETE, STANDARD, MINIMAL, o HARD). La única condición es haber visto el epílogo (`ending_screen_shown`). Esto asegura que todos los jugadores tengan acceso al cierre emocional, sin importar cuántas misiones secundarias completaron.

---

## 13. Resumen visual de la experiencia

```
[PARTIDA PRINCIPAL]
       │
       ▼
┌─────────────────────┐
│  7 misiones (M01-M07) │
│  + ending           │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Epílogo actual     │  ← Ya implementado
│  (attic_discovery)  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐     ← NUEVO
│  ESCENA DEL UMBRAL  │
│  (diálogo con Luna  │
│   en plano abstracto)│
└────────┬────────────┘
         │
         ├── Resolución A ──┐
         ├── Resolución B ──┤──→ flag: umbral_resolution
         └── Resolución C ──┘
         │
         ▼
┌─────────────────────┐     ← NUEVO
│  CAPÍTULO 0         │
│  "El Eco Inicial"   │
│  (precuela, Luna)   │
└─────────────────────┘
```

---

## 14. Narrativa

### 14.1 Historia del Eco — El eco del abuelo en el marco del espejo

No todos los Ecos hablan. Algunos solo dejan una sensación, como el calor que queda en una taza después de que el café se ha ido. El marco del espejo del desván contiene eso: no la conciencia del abuelo de Mateo, sino la **intención** que puso en cada grabado mientras lo tallaba, noche tras noche, después de volver de su última expedición bajo el faro. Sabía que no regresaría del todo. Sabía que su nieto necesitaría un camino. Y talló ese camino en la madera: símbolos que no son palabras, pero que el Vacío reconoce como coordenadas. El marco es un puente que esperó veinte años a que alguien lo encendiera.

Mateo no ve a su abuelo cuando toca el marco. No oye su voz. Lo que siente es una **memoria sensorial**: el olor a madera recién cortada, el peso de unas manos callosas sosteniendo un cincel, la luz de una vela en un desván idéntico a este pero más viejo. Y una certeza que no viene de las palabras: *esto es para ti. Siempre fue para ti.* El eco del abuelo no necesita explicar quién es ni qué pasó — Mateo lo sabe. Lo supo desde que leyó los documentos en la biblioteca, desde que Rosa habló de aquella desaparición de dos semanas, desde que entendió que el Vacío no era solo de Luna. También era del abuelo. Y el abuelo le dejó la llave.

Cuando el marco encaja en el suelo del desván y la luz blanca comienza a brotar de las grietas, el eco no lo sigue. Su función termina ahí: abrir el camino para que Mateo y Luna se encuentren una última vez. Los grabados se apagan. La madera envejece veinte años en un segundo. Lo que queda es un marco vacío, sin brillo, sin propósito — como un farol después del amanecer. Pero Mateo ya cruzó. Y del otro lado lo espera quien siempre lo esperó.

### 14.2 Nodos de diálogo nuevos (formato JSON)

Los siguientes nodos se ejecutan **entre** la Fase 1 (el llamado) y la Fase 2 (el umbral luminoso), cuando Mateo toca el marco en el desván y el eco del abuelo se manifiesta como memoria sensorial. Usan `style: "narrative_float"` porque no hay un hablante visible — son la voz narrativa del eco.

```json
{
  "id": "umbral_abuelo_eco_01",
  "speaker": "",
  "portrait": null,
  "text": "Al tocar el marco, el frío de la madera se vuelve tibio. No es calor de sol — es calor de manos que sostuvieron esto durante muchas noches.",
  "next": "umbral_abuelo_eco_02",
  "style": "narrative_float",
  "condition": "NOT:flag:abuelo_eco_umbral_activated",
  "onEnter": "saveSystem.setFlag('abuelo_eco_umbral_activated', true)"
},
{
  "id": "umbral_abuelo_eco_02",
  "speaker": "",
  "portrait": null,
  "text": "Por un instante, el desván se duplica: ves el cuarto vacío que conoces y, superpuesto, el mismo desván pero más antiguo. Una vela. Un banco de trabajo. Un hombre inclinado sobre la madera.",
  "next": "umbral_abuelo_eco_03",
  "style": "narrative_float"
},
{
  "id": "umbral_abuelo_eco_03",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Eres tú... Eres el abuelo. Abuela Rosa dijo que desapareciste buscando algo. Pero no desapareciste, ¿verdad? Encontraste lo que buscabas y dejaste esto para mí.",
  "next": "umbral_abuelo_eco_04",
  "style": "umbral"
},
{
  "id": "umbral_abuelo_eco_04",
  "speaker": "",
  "portrait": null,
  "text": "El eco responde sin sonido. Una sensación: manos que sostienen las tuyas. Manos mayores, más grandes, que guían las tuyas sobre la madera. Un recorrido. Un patrón. Un mapa grabado en la madera que tus dedos entienden antes que tus ojos.",
  "next": "umbral_abuelo_eco_05",
  "style": "narrative_float"
},
{
  "id": "umbral_abuelo_eco_05",
  "speaker": "mateo",
  "portrait": "mateo_determined",
  "text": "Los grabados. No son decoración. Son instrucciones. Sabías que yo iba a necesitar esto.",
  "next": null,
  "style": "umbral",
  "onExit": "saveSystem.setFlag('marco_grabados_abuelo_revelados', true); transitionFX.playFull('light_pillar')"
}
```

**Nota:** Estos 5 nodos se insertan en el flujo narrativo justo después de `umbral_espejo_attic_02` (cuando Mateo pregunta "Luna... ¿estás ahí?") y antes de la Fase 2 (el umbral luminoso). La secuencia completa sería: `umbral_espejo_attic_02` → `umbral_abuelo_eco_01` → `umbral_abuelo_eco_02` → `umbral_abuelo_eco_03` → `umbral_abuelo_eco_04` → `umbral_abuelo_eco_05` → `TransitionFX.playFull('light_pillar')` → entrada a V_UMBRAL.

### 14.3 Consecuencia visible al completar la escena

Al completar la escena del umbral (nodo `umbral_luna_final` ejecutado), el mundo cambia de forma permanente:

- **El marco del espejo en el desván:** La madera pierde todo brillo. Los grabados del abuelo, que antes eran visibles como surcos profundos, se vuelven superficiales — como si hubieran cumplido su función y se estuvieran borrando lentamente. Al inspeccionarlo después de la escena, Mateo dice un diálogo nuevo: *"Ya no vibra. Hizo lo que tenía que hacer."*

- **Grabados nuevos en el marco (aparición permanente):** Donde antes solo había patrones abstractos, ahora hay dos figuras talladas que no estaban: un niño acostado y una gata enroscada sobre su pecho. Son las figuras de la primera noche, el momento exacto del origen del vínculo. El abuelo nunca las talló — el marco las **recordó** al cruzar el umbral y las imprimió en la madera como un testimonio. Es un cambio visible que cualquier jugador puede encontrar al volver al desván después de la escena.

- **Inspección del marco post-escena:** Al interactuar con el marco tras el umbral, se activa el nodo:
```json
{
  "id": "inspect_marco_post_umbral",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Las figuras nuevas... es a nosotros. A Luna y a mí. La noche que nos encontramos. El marco lo guardó.",
  "next": null,
  "style": "narrative_float",
  "condition": "flag:umbral_espejo_visto"
}
```

- **Además**, todos los cambios ya listados en la propuesta original (sección 3, Fase 5): el marco deja de vibrar, los grabados del abuelo desaparecen, y Luna (o su reflejo) aparece durmiendo en la cama de Mateo.

### 14.4 Flags necesarios (verificados contra `game_states.md`)

Se añaden 2 flags nuevos a los ya listados en la sección 8:

| Flag | Tipo | Default | Descripción | Set by |
|------|------|---------|-------------|--------|
| `abuelo_eco_umbral_activated` | bool | false | El eco del abuelo se manifestó al tocar el marco | `umbral_abuelo_eco_01` onEnter |
| `marco_grabados_abuelo_revelados` | bool | false | Mateo entendió el patrón de los grabados | `umbral_abuelo_eco_05` onExit |
| `inspect_marco_post_text_seen` | bool | false | Mateo inspeccionó el marco tras la escena | `inspect_marco_post_umbral` onExit |

**Verificación:** Ninguno de estos flags existe en `docs/game_states.md` (secciones 2–8). Los flags `abuelo_backstory_unlocked` y `abuelo_connection_unlocked` ya existen (M03 y M06 respectivamente), pero `abuelo_eco_umbral_activated` es nuevo y distinto — representa el momento específico en que el eco del abuelo se manifiesta en el marco, que solo ocurre si el jugador ha completado el juego y activa la escena del umbral.

### 14.5 Conexión con el lore existente

- **Conexión con la sección 8.2 de `grietas_lore.md` (el espejo del abuelo):** El lore establece que el espejo de mano del abuelo fue el objeto que abrió la primera Grieta cuando Mateo tenía 6 años. Esta propuesta extiende ese hilo: el marco no era solo el soporte del espejo, sino un **objeto-ancla dimensional** que el abuelo preparó. Los grabados que el lore menciona ("grabados que el abuelo talló") son aquí el patrón de coordenadas que activa el puente. La propuesta no contradice el lore — lo completa.

- **Conexión con M06 (La grieta del olvido):** En M06, el jugador descubre que el abuelo investigó el Vacío y que hay registros destruidos de 1974. El eco del abuelo en el marco **confirma** lo que esos registros insinuaban: que el abuelo no solo investigó, sino que **construyó** algo. El marco tallado es la prueba física de que el abuelo entendió el Vacío lo suficiente como para dejar un camino de regreso. Los jugadores que completaron M06 y desbloquearon `abuelo_connection_unlocked` reconocerán los símbolos de los grabados como los mismos que aparecen en los documentos reconstruidos.

- **Conexión con el principio de diseño #3 ("Las decisiones dejan huella visible permanente"):** Los grabados nuevos que aparecen en el marco (niño y gata enroscada) son un cambio visual permanente que no existía antes. Cualquier jugador que vuelva al desván después de la escena encontrará esa imagen tallada en la madera. Es una huella física de un momento emocional — exactamente el tipo de cambio que el principio de diseño exige.

- **Conexión con la función `determineEnding()` (sección 12 de `game_states.md`):** El flag `abuelo_eco_umbral_activated` podría consultarse en una futura expansión del sistema de ending (no en la versión actual, porque la escena del umbral ocurre después del ending). Sin embargo, si se implementa un "verdadero final" que integre los datos del Capítulo 0, este flag indicaría que el jugador experimentó la revelación completa del legado del abuelo.

---

*Documento generado como parte de la sesión de diseño de mecánicas — Sesión: Umbral del Espejo.*
*Versión: 1.1 — añadida sección 14: Narrativa (eco del abuelo, nodos de diálogo, consecuencia visible, flags).*
