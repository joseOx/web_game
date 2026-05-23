# Propuesta de diseño — Reina del Vacío: el dominio y la soberana
## Nivel final en Vacío profundo + Misión secundaria precuela "El Diario del Abuelo"

---

## 1. Resumen

**Nombre interno:** `reina_vacio` (misión secundaria precuela: `mission_grandfather_chronicle`)

**Tipo:** 
- **Misión secundaria (M08):** "El diario del abuelo" — cinemática interactiva con minijuegos de observación en la línea temporal del abuelo, que transcurre en el Vacío de hace 40 años.
- **Nivel de jefa final:** Encuentro con "Reina" en el Vacío profundo (zona `V_THRONE`), accesible tras completar M08 + las 7 misiones existentes.

**Duración:**
- Misión precuela: ~15-20 minutos
- Nivel de Reina: ~10-15 minutos
- **Total: ~25-35 minutos de contenido nuevo**

**Protagonistas:** Mateo (jugable en el nivel de Reina) y el abuelo joven (jugable en la precuela, ~35 años, sprite nuevo reutilizando base de Mateo con paleta distinta).

---

## 2. Justificación narrativa

### 2.1 El vacío en el lore actual

El proyecto tiene un antagonista (El Tejedor) y entidades (Ecos, Atados), pero nunca se responde:

> **¿Quién gobierna el Vacío profundo? ¿Hay una jerarquía? ¿El Tejedor es la única entidad consciente?**

El lore (`docs/grietas_lore.md`, sección 3) dice que el Vacío es un "espejo distorsionado" y los Ecos son "emociones sin resolver". El Tejedor es una "entidad antigua que crea Grietas". Pero no hay un **origen del poder** en el Vacío — ¿quién o qué le dio al Tejedor su capacidad de expandir Grietas?

### 2.2 Lo que esta propuesta revela

**Reina** es la soberana original del Vacío profundo — una entidad consciente, anterior al Tejedor, que dormía en el núcleo de la dimensión. El abuelo de Mateo la encontró durante su exploración de dos semanas bajo el faro (mencionada en `grietas_lore.md` sección 5 — backstory de Rosa). 

El abuelo, al ver su porte majestuoso incluso en su estado durmiente, la llamó **"Reina"** — un nombre que ella, al despertar décadas después, adoptó como propio.

La historia que se revela:
1. **Hace 40 años:** El abuelo de Mateo (joven, ~35 años) explora el Vacío siguiendo las notas de Antonio el farero. Encuentra una cámara oculta en el Vacío profundo donde una entidad duerme: una figura femenina hecha de luz violeta y sombras, con una corona de grietas flotando sobre su cabeza.
2. **El abuelo no la despierta.** Reconoce que no es una amenaza — es un ser neutral, gobernante de un dominio que aún no existe. Escribe en su diario: *"No es el Tejedor. Es otra cosa. Algo que duerme. Algo que espera. La llamo Reina porque incluso dormida, se siente su autoridad. No sé si despertará. No sé si quiero que despierte."*
3. **40 años después:** Reina ha despertado. El Tejedor, que dominaba el Vacío superficial, ha sido desplazado al Vacío medio. Reina gobierna desde el **Trono del Vacío** (zona `V_THRONE`), y sus Ecos leales (los "Cortesanos") patrullan el Vacío profundo.
4. **El enfrentamiento:** Mateo debe llegar al Trono para entender por qué Reina ha despertado ahora, y si representa una amenaza o una aliada potencial contra el Tejedor.

### 2.3 Decisión final del jugador

Al enfrentar a Reina, Mateo tiene **dos caminos**:

- **Camino A (Comprensión):** Mateo le muestra el diario del abuelo. Reina reconoce la caligrafía, recuerda al hombre que la nombró. En lugar de pelear, Reina ofrece una tregua — ella gobernará el Vacío profundo, el Tejedor será contenido en el Vacío medio, y Miraloma quedará protegida. ✨ **Requiere M08 completada.**

- **Camino B (Confrontación):** Sin el diario, Reina no reconoce a Mateo y lo ve como una amenaza. Mateo debe usar todas sus habilidades (Corazón Firme, Ecolectura, Visión Felina, silbido) para sobrevivir hasta que Luna puede llegar y establecer comunicación.

---

## 3. Misión secundaria M08 — "El diario del abuelo" (precuela interactiva)

### 3.1 Resumen funcional

La misión M08 es una **cinemática interactiva con minijuegos de observación**. No es una misión de exploración tradicional — es una **memoria jugable** del abuelo de Mateo.

**Trigger:** Ocurre automáticamente al completar M06 (biblioteca) + M07 (cementerio). Mateo encuentra el **diario original del abuelo** en el desván (`R_HOME_ATTIC`), escondido detrás de una tabla suelta que solo se nota si `abuelo_connection_unlocked` está activo.

Al abrir el diario, el jugador **entra en la memoria del abuelo** — la pantalla se distorsiona y el jugador controla al **abuelo joven** en su expedición al Vacío de hace 40 años.

### 3.2 Flujo paso a paso

```
═══════════════════════════════════════════════════════
M08 — "El diario del abuelo"
═══════════════════════════════════════════════════════

PASO 0: Trigger
  → Condición: mission_library_done && mission_cemetery_done
  → Mateo sube al desván después de completar ambas misiones
  → Nodo: m08_trigger_01 — Mateo nota que una tabla del piso está suelta
  → Nodo: m08_trigger_02 — Al levantarla, encuentra un cuaderno
    de cuero gastado con la inicial "M" grabada (Mateo, como el abuelo)
  → Mateo abre el diario → fade a blanco → TRANSICIÓN

PASO 1: "El explorador" (minijuego de observación #1)
  → El jugador controla al abuelo joven en el Vacío (V_LIGHTHOUSE versión 40 años atrás)
  → El abuelo tiene una linterna de aceite (luz naranja, más tenue que la de Mateo)
  → NO hay Luna — el abuelo exploró solo
  → El jugador DEBE encontrar 3 objetos ocultos en la zona:
    1. Un sello de metal en el suelo (idéntico al que Mateo encuentra en V_HEART)
    2. Una marca tallada en la pared (un ojo con una línea curva — símbolo del Vacío)
    3. Un Eco dormido (una forma azulada que respira lentamente)
  → Cada objeto encontrado activa una anotación del abuelo (texto narrativo flotante)
  → Minijuego: los objetos NO brillan ni tienen indicador — el jugador debe
    mover al abuelo cerca de ellos para que aparezca "presiona E para inspeccionar"
  → Si el jugador se va sin encontrar los 3, puede volver a intentar
  → Al encontrar los 3: transición automática al paso 2

PASO 2: "El pasaje sellado" (minijuego de observación #2)
  → El abuelo encuentra una pared en el Vacío que no debería estar ahí
  → Tiene símbolos grabados (los mismos del marco del espejo)
  → El jugador debe trazar con el mouse/teclado el patrón correcto
    para abrir el pasaje (3 símbolos, el jugador elige el orden)
  → Si falla: el abuelo anota "no es así. Probemos otra combinación"
  → Si acierta: la pared se disuelve → revela el acceso a V_THRONE (40 años atrás)

PASO 3: "La durmiente" (cinemática + diálogo)
  → El abuelo entra a V_THRONE (40 años atrás)
  → La zona es idéntica a la actual pero vacía (sin Cortesanos)
  → En el centro, una figura flota: Reina, dormida
  → Apariencia: silueta humanoide de luz violeta tenue, corona de grietas
    (3 fragmentos de realidad flotando sobre su cabeza en triángulo)
  → El abuelo se acerca lentamente. Diálogo en estilo umbral:
    ──────────────────────────────────────────
    Nodo: abuelo_reina_01
    Estilo: narrative_float
    Texto: "Nunca había visto algo así en el Vacío. No es un Eco. No es un Atado.
    Es... otra cosa. Una presencia. Como si el Vacío mismo hubiera tomado forma."
    ──────────────────────────────────────────
    Nodo: abuelo_reina_02
    Estilo: narrative_float
    Texto: "Se mueve. No está despierta. Sueña. Los fragmentos sobre su cabeza
    giran lentamente, como planetas alrededor de un sol dormido."
    ──────────────────────────────────────────
    Nodo: abuelo_reina_03
    Speaker: abuelo (joven)
    Portrait: abuelo_awed
    Texto: "No sé qué eres. Pero no eres el Tejedor. No eres peligro.
    Eres... hermosa. Como una reina en su trono."
    ──────────────────────────────────────────
    Nodo: abuelo_reina_04
    Estilo: narrative_float
    Texto: "Los fragmentos sobre su cabeza giran más rápido un instante,
    como si hubiera escuchado. Como si la palabra 'reina' le hubiera llegado
    en el sueño."
    ──────────────────────────────────────────
    Nodo: abuelo_reina_05
    Speaker: abuelo (joven)
    Portrait: abuelo_thoughtful
    Texto: "Te llamaré Reina. Porque incluso dormida, se nota.
    Eres la dueña de este lugar. Espero no tener que despertarte nunca."
    ──────────────────────────────────────────

PASO 4: "El legado" (epílogo de la precuela)
  → El abuelo regresa al mundo real
  → Escribe en su diario: "Hoy encontré el corazón del Vacío.
    No el lugar. Su habitante. La llamé Reina. No sé si hice bien."
  → El abuelo sella el diario y lo esconde en el desván
  → Texto flotante: "Sabía que alguien lo encontraría. Sabía que
    quien lo encontrara entendería. Y si ese alguien eras tú, Mateo,
    entonces también sabría qué hacer."
  → Transición de vuelta al presente

PASO 5: Mateo despierta (presente)
  → Mateo está en el desván con el diario en las manos
  → Nodo: m08_present_01 — Mateo cierra el diario
    "Vi todo. Lo que encontró. Lo que nombró. Reina."
  → Nodo: m08_present_02 — Luna ronronea desde la puerta del desván
    "Ella sabe que despertó. Y sabe que tengo que ir."
  → Flag: mission_grandfather_chronicle_done = true
  → Flag: reina_vacio_unlocked = true
  → Se desbloquea la entrada a V_THRONE en el Vacío profundo
```

### 3.3 Mecánica de los minijuegos de observación

#### Minijuego 1: Objetos ocultos (Encuentra 3)

| Objeto | Posición en V_LIGHTHOUSE (40 años atrás) | Pista visual |
|--------|------------------------------------------|--------------|
| Sello de metal | Esquina inferior derecha, entre cajas viejas | Borde circular apenas visible bajo una capa de polvo del Vacío |
| Marca tallada | Pared izquierda, detrás de una tabla caída | Línea curva que no coincide con las grietas naturales |
| Eco dormido | Centro de la sala, camuflado entre sombras | Leve pulso de luz azul cada 3 segundos |

**Feedback visual:**
- Cada objeto encontrado produce una nota del diario (narrative_float, 3 segundos)
- Al encontrar los 3, la linterna del abuelo brilla más (señal de progreso)
- Si el jugador se acerca a un objeto sin verlo, el abuelo dice: "Aquí hay algo..."

#### Minijuego 2: El patrón del pasaje (3 símbolos)

El jugador ve 3 símbolos en la pared (los mismos del marco del espejo). Debe presionarlos **en el orden correcto**. El orden correcto se revela en el diario que el jugador **ya leyó** en la misión M06 (los documentos del abuelo en la biblioteca contienen un dibujo del patrón).

- Si el jugador recuerda el patrón de M06: orden = ojo → línea curva → triángulo
- Si no lo recuerda: puede probar combinaciones (máximo 3 intentos)
- En cada fallo, el abuelo anota: "No. Los símbolos en los documentos decían otro orden..."
- En acierto: la pared se disuelve con un sonido de piedra moliéndose

---

## 4. Nivel de jefa final — Encuentro con Reina

### 4.1 Zona nueva: V_THRONE (El Trono del Vacío)

```
ID: V_THRONE
Tipo: Zona abstracta cerrada (sin tilemap, como V_UMBRAL)
Dimensiones: 40 × 20 tiles (640 × 320 px) — scroll horizontal limitado
Música: "reina_theme" (nueva pieza: cuerdas graves + campanas distorsionadas,
         con un motivo melódico que aparece en la precuela al nombrarla)

Descripción visual:
  - Fondo: negro profundo con vetas violeta que pulsan como venas
  - Suelo: losas de piedra irregulares que flotan sobre un abismo violeta
  - Al fondo: una estructura alta con formas geométricas que recuerdan 
    un trono, hecha de fragmentos de realidad solidificada
  - Partículas: fragmentos de grieta (triángulos violetas) flotan lentamente
  - Iluminación: la única luz viene de Reina misma y de los Cortesanos
```

### 4.2 Los Cortesanos (Ecos de élite)

Antes de llegar a Reina, Mateo debe atravesar una sala con **3 Cortesanos** — Ecos de élite que Reina ha elevado con su poder. No son hostiles por defecto, pero bloquean el paso.

| Cortesano | Apariencia | Mecánica |
|-----------|-----------|----------|
| **El Guardián del Umbral** | Silueta alta con capa de sombras, cabeza de grieta | Bloquea la entrada. No ataca — solo observa. Para pasar, Mateo debe mostrarle el diario del abuelo (si tiene M08 completada) o derrotarlo con 3 pulsos de Corazón Firme seguidos |
| **El Susurrante** | Forma flotante con múltiples brazos de sombra | Si Mateo se acerca, susurra frases del diario del abuelo (si M08 hecha) o frases de miedo (si no). No es dañino — es un "eco de vigilancia" |
| **El Arquitecto** | Silueta que sostiene fragmentos de realidad | Está reconstruyendo una pared. No interactúa. Si Mateo se acerca, deja caer un fragmento que revela una imagen del abuelo joven |

**Nota de diseño:** Los Cortesanos no son enemigos de combate tradicional. Son **obstáculos emocionales**. El jugador no los "mata" — los comprende, los cruza, o los sortea.

### 4.3 Reina — encuentro final

```
═══════════════════════════════════════════════════════
REINA — Encuentro en el Trono
═══════════════════════════════════════════════════════

FASE 1: Reconocimiento
→ Mateo llega al centro del trono
→ Reina está sentada en una estructura de fragmentos flotantes
→ Apariencia: figura humanoide de luz violeta densa,
  con rasgos definidos (rostro, manos, cabello de sombras con destellos).
  Su corona: 3 fragmentos de realidad giran sobre su cabeza.
  Viste un manto de grietas que se abren y cierran lentamente.
→ Al ver a Mateo, inclina la cabeza

Nodo: reina_encounter_01
Estilo: umbral
Speaker: Reina
"Mateo."
(Silencio. La voz de Reina no sale de su boca — vibra en el aire.)

Nodo: reina_encounter_02
Estilo: umbral
Speaker: mateo
"¿Sabes mi nombre?"

Nodo: reina_encounter_03
Estilo: umbral
Speaker: Reina
"Sé muchas cosas. Sé que tu abuelo me llamó Reina.
 Sé que sellaste siete grietas. Sé que Luna te acompaña."
(Silencio. Los fragmentos de su corona giran.)
"Pero no sé por qué has venido."

───[ RAMA A: M08 COMPLETADA (diario del abuelo) ]───

Nodo: reina_encounter_A_01
Estilo: umbral
Speaker: mateo
"Encontré su diario. El de mi abuelo. Leyó sobre ti. Te buscó."
(Mateo muestra el diario.)
"Él no quería despertarte. Pero yo necesito saber:
 ¿qué eres? ¿por qué despertaste ahora?"

Nodo: reina_encounter_A_02
Estilo: umbral
Speaker: Reina
(Los fragmentos de su corona giran más lento.)
"Tu abuelo fue el primero en verme.
 El primero en darme un nombre.
 Nadie había nombrado nada en el Vacío.
 Antes de él, yo era solo... posibilidad."
(Silencio.)

Nodo: reina_encounter_A_03
Estilo: umbral
Speaker: Reina
"Desperté porque él se fue.
 Mientras estuvo en el mundo real, su presencia me mantenía dormida.
 Cuando murió, el eco de su nombre se apagó.
 Y el Vacío me llamó."

Nodo: reina_encounter_A_04
Choice — Decisión del jugador
→ "El Tejedor está expandiendo las Grietas. ¿Tú también?"
  (next: reina_encounter_A_05a)
→ "¿Puedes ayudarnos a sellar el Vacío para siempre?"
  (next: reina_encounter_A_05b)
→ "Luna dice que los guardianes protegen el equilibrio. ¿Eres una guardiana?"
  (next: reina_encounter_A_05c)

Nodo: reina_encounter_A_05a
Estilo: umbral
Speaker: Reina
"El Tejedor y yo somos diferentes.
 Él quiere expandir el Vacío porque no conoce otra cosa.
 Yo quiero que el Vacío tenga un orden.
 Sin Grietas abiertas. Sin Ecos sueltos.
 Un Vacío en paz."
→ next: reina_encounter_A_06

Nodo: reina_encounter_A_05b
Estilo: umbral
Speaker: Reina
"El Vacío no se sella. Es como una habitación.
 Puedes cerrar la puerta, pero la habitación sigue ahí.
 Lo que podemos hacer es mantener la puerta cerrada.
 Yo puedo asegurar que del otro lado, nadie la abra."
→ next: reina_encounter_A_06

Nodo: reina_encounter_A_05c
Estilo: umbral
Speaker: Reina
(Una pausa. Los fragmentos de su corona se detienen.)
"Tu abuelo también preguntó eso.
 Me llamó guardiana y luego se rió de sí mismo.
 Dijo: 'No, tú no eres guardiana. Eres la casa.'
 Y tenía razón. El Vacío es mi cuerpo.
 Las Grietas son mis heridas.
 Y tú, Mateo, eres quien las cura."
→ next: reina_encounter_A_06

Nodo: reina_encounter_A_06
Estilo: umbral
Speaker: Reina
"Has venido con el diario de quien me nombró.
 Eso te da derecho a pedir.
 Pide."
(Silencio.)

Nodo: reina_encounter_A_07
Choice — Resolución final
→ "Protege Miraloma. No dejes que el Vacío lastime a nadie más."
  (next: reina_final_A_pacto)
→ "Ayúdame a detener al Tejedor. Juntos."
  (next: reina_final_A_aliada)
→ "Déjame ir. Yo protegeré el mundo real. Tú protege el Vacío."
  (next: reina_final_A_confianza)

───[ RAMA B: SIN M08 COMPLETADA ]───

Nodo: reina_encounter_B_01
Estilo: umbral
Speaker: Reina
"No traes el diario. No traes el nombre.
 Eres solo un niño que cruzó donde no debía."
(Los fragmentos de su corona giran rápido.)
"El Tejedor ha estado alimentando Grietas durante décadas.
 Y yo he estado despierta todo ese tiempo.
 Mirando. Esperando.
 Y tú llegas sin entender nada."

Nodo: reina_encounter_B_02
Estilo: umbral
Speaker: mateo
"Entonces enséñame. No vine a pelear.
 Vine a entender."

Nodo: reina_encounter_B_03
Estilo: umbral
Speaker: Reina
(Silencio. Los fragmentos se detienen.)
"No puedes entender el Vacío sin haberlo visto nacer.
 Y tú solo ves lo que queda.
 Pero hay algo que sí puedes hacer."
(Los fragmentos giran. Reina se levanta.)
"Demuéstrame que eres digno del nombre que llevas.
 El nombre de tu abuelo."
→ Inicia secuencia de "prueba": Mateo debe sobrevivir 3 oleadas
  de Ecos mientras Luna intenta llegar. Si sobrevive, Reina reconoce
  su valor y pasa al nodo de resolución (reina_final_B_respeto).
  Si cae 3 veces, Reina lo expulsa del Vacío (misión fallada — 
  puede reintentarse).

───[ RESOLUCIONES ]───

reina_final_A_pacto:
  "Que así sea. Miraloma no será tocada por el Vacío mientras yo reine.
   El Tejedor será contenido. Los Ecos no cruzarán.
   Es mi palabra. Y la palabra de una reina no se rompe."
  → Flag: reina_resolution = 'pacto'
  → Reina extiende su mano de luz. Al tocarla, Mateo siente calor.
  → El trono se ilumina. Los Cortesanos se arrodillan.
  → Reina sonríe (apenas visible, pero real).

reina_final_A_aliada:
  "El Tejedor no sabe que existo.
   No sabe que soy anterior a él.
   Eso es una ventaja.
   Ve, Mateo. Yo prepararé el camino.
   Y cuando llegue el momento, el Vacío no lo protegerá."
  → Flag: reina_resolution = 'aliada'
  → Reina entrega un fragmento de su corona (objeto: "Fragmento de Reina")
  → Este fragmento se puede usar en el enfrentamiento final con el Tejedor
    para debilitarlo

reina_final_A_confianza:
  "Confiar en un niño de doce años.
   No es lo que esperaba de mi despertar.
   Pero tu abuelo confió en mí cuando no era nada.
   Es justo que yo confíe en ti ahora."
  → Flag: reina_resolution = 'confianza'
  → Reina no da un objeto, pero el jugador gana "Aliada: Reina"
  → En el enfrentamiento con el Tejedor, Reina aparece como refuerzo
    (escena cinemática: Reina enfrenta al Tejedor mientras Mateo sella)

reina_final_B_respeto:
  "Sobreviviste. No es poca cosa para un niño.
   No tienes el diario de tu abuelo, pero llevas su misma mirada.
   Ve. El Vacío no te hará daño mientras yo reine.
   Pero vuelve cuando tengas algo que mostrarme."
  → Flag: reina_resolution = 'respeto_condicional'
  → La zona V_THRONE queda accesible.
  → Mateo puede volver con el diario después (si completa M08 más tarde)
    para obtener una de las resoluciones A.
```

### 4.4 Recompensas por resolución

| Resolución | Recompensa inmediata | Efecto en el ending |
|-----------|---------------------|---------------------|
| `pacto` | BondSystem +20 permanente | Ending COMPLETE mejorado: Miraloma protegida para siempre |
| `aliada` | Objeto "Fragmento de Reina" (usable contra el Tejedor) | Tejedor más débil en el enfrentamiento final |
| `confianza` | Aliada "Reina" disponible en Acto 5 | Secuencia extendida del ending con Reina ayudando |
| `respeto_condicional` | Acceso libre a V_THRONE | Sin cambio directo en el ending, pero permite completar M08 después |

---

## 5. Personaje: Reina — definición completa

### 5.1 Apariencia visual

```
Reina es una entidad humanoide de aproximadamente 2 metros de altura,
compuesta enteramente de luz violeta densa con núcleo más brillante.

- Silueta: femenina, delgada, con brazos largos que terminan en 
  manos de luz tenue (3 dedos visibles)
- Rostro: rasgos sutiles — ojos brillantes (dos puntos de luz blanca),
  boca no visible, pero la posición de la cabeza sugiere expresiones
- Cabello: sombras que se mueven como cabello bajo el agua, con 
  destellos violetas
- Corona: 3 fragmentos de realidad (triángulos de color violeta intenso)
  flotan en triángulo sobre su cabeza, girando lentamente
- Manto: capa de grietas que se abren y cierran en su superficie,
  como si llevara el Vacío puesto
- Base: sus pies no tocan el suelo — flota a 10 cm sobre la superficie
- Color primario: #8B5CF6 (violeta medio)
- Color secundario: #C4B5FD (violeta claro para brillos)
- Color de ojos: #FFFFFF (blanco puro)
- Color de corona: #7C3AED (violeta intenso)
```

### 5.2 Personalidad

- **Regia pero no arrogante:** Reina habla con la seguridad de quien ha existido por siglos, pero no menosprecia a Mateo
- **Curiosa:** Ha observado el mundo real sin entenderlo completamente. Mateo es su primera interacción consciente con un humano
- **Justa:** No actúa por maldad — actúa por orden. Quiere que el Vacío tenga reglas
- **Vinculada al abuelo:** El nombre que el abuelo le dio es su ancla emocional. Por eso el diario es tan importante
- **Protectora del Vacío:** No del mundo real. Su lealtad es a su dimensión

### 5.3 Voz y diálogo

Reina NO habla con una voz humana. Su "voz" es:
- Texto que aparece sin speaker visible (estilo `umbral` con fuente centelleante)
- El texto "vibra" ligeramente al aparecer (animación CSS de 0.5px de desplazamiento aleatorio)
- Cada línea va acompañada de un tono grave ambiental (implementable con AudioSystem.playNote usando una onda sinusoidal a ~80Hz con ataque suave)
- Cuando está emocionada (encontrar el diario), la vibración del texto se vuelve más intensa

### 5.4 Símbolo de Reina

Su símbolo es un **triángulo con un ojo en el centro** (los 3 fragmentos de la corona + la vigilancia). Este símbolo aparece:
- En la entrada a V_THRONE
- En los Cortesanos (como un sello en sus sombras)
- En el diario del abuelo (él lo dibujó después de verla)

---

## 6. Sistemas involucrados

### 6.1 Sistema nuevo: MinigameObservationSystem

**Archivo nuevo:** `src/ui/MinigameObservationSystem.js`

Clase que maneja la cinemática interactiva de la precuela:

| Método | Propósito |
|--------|-----------|
| `startObservation(zoneId, targets, onComplete)` | Inicia un minijuego de objetos ocultos en una zona |
| `_checkProximity(playerX, playerY)` | Detecta si el jugador está cerca de un objetivo oculto |
| `_renderHint(ctx, target)` | Muestra el indicador "presiona E para inspeccionar" |
| `_checkAllFound()` | Verifica si todos los objetivos fueron encontrados |
| `startPatternPuzzle(symbols, correctOrder, onComplete)` | Inicia el minijuego del patrón de 3 símbolos |

**Estimación:** ~150 líneas de código.

### 6.2 Sistema existente modificado: DialogueSystem

| Cambio | Archivo | Descripción |
|--------|---------|-------------|
| Nuevo estilo `'reina'` | `src/ui/DialogueSystem.js` | Como el estilo `umbral` pero con texto que vibra y color violeta (#8B5CF6) en lugar de dorado |
| Nuevo estilo `'abuelo_memory'` | `src/ui/DialogueSystem.js` | Para las anotaciones del diario: fondo sepia, texto en color marrón (#8B6030), fuente manuscrita simulada (cursiva CSS) |

### 6.3 Sistema existente modificado: TransitionFX

| Cambio | Descripción |
|--------|-------------|
| Nueva animación `'diary_open'` | Transición que simula abrir un libro: la pantalla se pliega desde el centro hacia los bordes, revelando la escena de la memoria. Duración: 1.5s |
| Nueva animación `'diary_close'` | Transición inversa: la pantalla se pliega desde los bordes hacia el centro al salir de la memoria. Duración: 1.5s |

### 6.4 Otras modificaciones

| Sistema | Cambio |
|---------|--------|
| `SceneManager` | Registrar zona `V_THRONE` como zona abstracta (sin tilemap) |
| `ZoneV_HUB.js` | Añadir exit condicional a V_THRONE (visible solo con `reina_vacio_unlocked`) |
| `ZoneV_HOME.js` o `ZoneV_HEART.js` | Posible conexión alternativa a V_THRONE |
| `SaveSystem.js` | Nuevos flags (ver sección 8) |
| `main.js` | ① Importar `MinigameObservationSystem` ② Instanciar e inyectar ③ Registrar trigger de M08 en R_HOME_ATTIC ④ Registrar handler de entrada a V_THRONE ⑤ Lógica de las resoluciones de Reina |
| `BondSystem.js` | Sin cambios directos |
| `MissionManager.js` | Sin cambios — registrar M08 como misión nueva |

---

## 7. Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `src/missions/data/mission_08_grandfather.js` | Misión M08 "El diario del abuelo" (~100 líneas) |
| `src/ui/MinigameObservationSystem.js` | Sistema de minijuegos de observación (~150 líneas) |
| `src/world/zones/ZoneV_THRONE.js` | Zona del Trono del Vacío (~120 líneas con NPCs y objetos) |
| `src/entities/Reina.js` | Entidad Reina (NPC especial, ~80 líneas) |
| `src/entities/Cortesano.js` | Entidad Cortesano (Eco de élite, ~60 líneas) |
| `assets/sprites/abuelo_joven.png` | Sprite del abuelo joven (reutilizar base de Mateo con paleta distinta + ropa de los 80s) |
| `assets/sprites/reina.png` | Sprite de Reina (silueta violeta, animación de flotación y corona girando) |
| `assets/sprites/cortesano.png` | Sprite de Cortesano (sombra con capa y cabeza de grieta) |
| `assets/audio/reina_theme.ogg` | Tema de Reina (cuerdas graves + campanas) |
| `assets/audio/diary_transition.ogg` | SFX de transición de diario (página pasando + fade) |
| `docs/propuesta_design_reina_vacio.md` | Este documento |

---

## 8. Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/main.js` | ① Importar `MinigameObservationSystem`, `Reina`, `Cortesano`, M08 ② Instanciar e inyectar ③ Agregar trigger de M08 en R_HOME_ATTIC ④ Agregar lógica de encuentro con Reina en V_THRONE ⑤ Manejar las 4 resoluciones |
| `src/ui/DialogueSystem.js` | ① Añadir estilo `'reina'` (texto vibrante violeta) ② Añadir estilo `'abuelo_memory'` (fondo sepia, texto marrón) |
| `src/ui/TransitionFX.js` | ① Añadir animación `diary_open` y `diary_close` |
| `src/world/SceneManager.js` | ① Registrar `ZoneV_THRONE` como zona válida |
| `src/world/zones/ZoneV_HUB.js` | ① Añadir exit condicional a V_THRONE con `condition: 'flag:reina_vacio_unlocked'` |
| `src/world/zones/ZoneR_HOME_ATTIC.js` | ① Añadir trigger del diario del abuelo (visible solo con `abuelo_connection_unlocked` y M06+M07 completadas) |
| `src/missions/MissionManager.js` | Registrar M08 en el constructor o en Game.init() |
| `assets/data/dialogues.json` | Añadir ~45 nodos nuevos: `m08_*` (15), `abuelo_reina_*` (5), `reina_encounter_*` (20), `reina_final_*` (5) |
| `docs/game_states.md` | Añadir flags nuevos (ver sección 9) |

---

## 9. Flags nuevos (verificados contra game_states.md existente)

| Flag | Tipo | Default | Descripción | Set by |
|------|------|---------|-------------|--------|
| **M08 — El diario del abuelo** |
| `mission_grandfather_active` | bool | false | M08 activada | Trigger en R_HOME_ATTIC |
| `mission_grandfather_done` | bool | false | M08 completada | Al salir de la memoria |
| `m08_diary_found` | bool | false | Mateo encontró el diario del abuelo | m08_trigger_02 |
| `m08_memory_entered` | bool | false | Mateo entró a la memoria del abuelo | Transición diary_open |
| `m08_objects_found` | int | 0 | Objetos encontrados en minijuego 1 (0–3) | Cada objeto encontrado |
| `m08_pattern_solved` | bool | false | Patrón de símbolos resuelto | Minijuego 2 completado |
| `m08_reina_seen` | bool | false | El abuelo vio a Reina dormida | abuelo_reina_01 |
| `m08_reina_named` | bool | false | El abuelo la llamó Reina | abuelo_reina_05 |
| `m08_memory_exited` | bool | false | Mateo salió de la memoria | Transición diary_close |
| **Reina** |
| `reina_vacio_unlocked` | bool | false | Acceso a V_THRONE desbloqueado | mission_grandfather_done |
| `reina_met` | bool | false | Mateo se encontró con Reina | reina_encounter_01 |
| `reina_resolution` | enum | null | Resolución del encuentro: `pacto` / `aliada` / `confianza` / `respeto_condicional` | Nodo final del encuentro |
| `reina_fragment_item` | bool | false | Mateo tiene el Fragmento de Reina | reina_final_A_aliada |
| `reina_ally` | bool | false | Reina es aliada (resolución confianza) | reina_final_A_confianza |
| `reina_throne_visited` | bool | false | Mateo visitó V_THRONE al menos una vez | zone:loaded V_THRONE |
| **Cortesanos** |
| `cortesano_guardian_passed` | bool | false | Guardián del Umbral superado | Al pasar al trono |
| `cortesano_whisperer_heard` | bool | false | Mateo escuchó al Susurrante | Al acercarse |
| `cortesano_architect_fragment` | bool | false | Mateo vio el fragmento del Arquitecto | Al acercarse |

**Verificación de duplicados:** Ninguno de estos flags existe en `docs/game_states.md` (secciones 2–8). Los flags más cercanos son `abuelo_connection_unlocked` (M06) y `abuelo_backstory_unlocked` (M03), que son requisitos pero no duplicados. Los IDs de diálogo `m08_*`, `abuelo_reina_*`, `reina_encounter_*` y `reina_final_*` no existen en `assets/data/dialogues.json`.

---

## 10. Nodos de diálogo nuevos — resumen

| Prefijo | Cant. | Propósito |
|---------|-------|-----------|
| `m08_*` | 15 | Trigger, transiciones, diálogos de Mateo en el desván, epílogo |
| `abuelo_reina_*` | 5 | La escena del abuelo encontrando a Reina dormida |
| `abuelo_memory_obj_*` | 3 | Anotaciones al encontrar objetos en minijuego 1 |
| `abuelo_memory_puzzle_*` | 4 | Diálogos del abuelo durante el minijuego de patrón |
| `reina_encounter_*` | 20 | Rama A (con diario): 12 nodos. Rama B (sin diario): 8 nodos |
| `reina_final_*` | 5 | Resoluciones (A1, A2, A3, B1, más epílogo genérico) |
| **Total** | **~52 nodos** | |

---

## 11. Conexión con el lore existente

| Elemento del lore | Cómo se conecta |
|-------------------|-----------------|
| `grietas_lore.md` sección 5: "Abuelo desapareció dos semanas bajo el faro, volvió diferente" | M08 **muestra** exactamente qué pasó en esas dos semanas: encontró a Reina |
| `grietas_lore.md` sección 5: "El abuelo nunca habló de lo que encontró" | M08 revela por qué: nombrar a Reina era demasiado grande para compartirlo |
| `grietas_lore.md` sección 8.2: "El espejo del abuelo con grabados" | Los símbolos del espejo son el **patrón** que el abuelo usó para abrir el pasaje a Reina |
| M06 — "abuelo_connection_unlocked" | Es el requisito narrativo: sin entender que el abuelo exploró el Vacío, el jugador no puede encontrar su diario |
| M03 — "abuelo_backstory_unlocked" | Rosa menciona que el abuelo desapareció — esto prepara al jugador para la revelación |
| `umbral_abuelo_eco_*` (escena del umbral) | El eco del abuelo en el marco del espejo ES el mismo abuelo que encontró a Reina. La conexión es directa |
| El Tejedor como antagonista | Reina es una entidad diferente (anterior). El juego ahora tiene **dos** fuerzas en el Vacío, lo que enriquece el conflicto |
| `docs/level_design.md` sección 9: V_LIBRARY | Los documentos reconstruidos de M06 insinúan "algo más" en el Vacío — Reina es ese "algo más" |
| Principio de diseño #3: "Las decisiones dejan huella visible" | Las 4 resoluciones de Reina cambian permanentemente el Vacío: el trono se ilumina (pacto), el fragmento aparece en el inventario (aliada), Reina aparece en el Acto 5 (confianza), o el trono queda accesible pero vacío (respeto) |

---

## 12. Duración estimada de implementación

| Componente | Tiempo estimado |
|------------|-----------------|
| `Mission08Grandfather.js` (lógica de misión) | 1-2 horas |
| `MinigameObservationSystem.js` (sistema nuevo) | 3-4 horas |
| Zona `V_THRONE` (definición + NPCs + objetos) | 2-3 horas |
| `Reina.js` (entidad con diálogos y animación) | 2-3 horas |
| `Cortesano.js` (entidad decorativa/interactiva) | 1-2 horas |
| Diálogos (~52 nodos en dialogues.json) | 3-4 horas |
| Estilos nuevos en DialogueSystem (`'reina'`, `'abuelo_memory'`) | 1-2 horas |
| Transiciones nuevas en TransitionFX (`diary_open/close`) | 1 hora |
| Integración en main.js (triggers, handlers, resoluciones) | 3-4 horas |
| Modificaciones a SceneManager, ZoneV_HUB, ZoneR_HOME_ATTIC | 1-2 horas |
| Sprites y assets visuales (abuelo_joven, reina, cortesano) | 4-6 horas |
| Audio (reina_theme, SFX) | 2-3 horas |
| Testing (M08 completa, encuentro con Reina, 4 resoluciones) | 3-4 horas |
| **Total estimado** | **27-40 horas (~5-7 días)** |

---

## 13. Por qué esto aumenta la retención del jugador

### 13.1 Arco narrativo completo del abuelo

El lore del abuelo es el misterio más grande del juego. Actualmente solo se insinúa (M03: Rosa lo menciona, M06: documentos lo conectan). M08 **cierra ese arco**: el jugador finalmente VE lo que el abuelo hizo y cómo eso afecta el presente.

### 13.2 Un jefa final no-violenta (opcional)

Reina no es un jefe de combate tradicional. Es un **encuentro emocional** con resoluciones basadas en diálogo — esto es consistente con el principio de diseño #5: "La empatía es más útil que el combate". Pero también hay un camino de prueba (Rama B) para jugadores que quieran desafío.

### 13.3 Contenido precuela jugable

El minijuego de observación (controlar al abuelo joven) ofrece una **experiencia de juego diferente**: sin Luna, sin habilidades, solo un hombre con una linterna y un diario. Esto diversifica el gameplay sin requerir mecánicas complejas nuevas.

### 13.4 Re-jugabilidad por las 4 resoluciones

Cada resolución de Reina tiene consecuencias diferentes en el Acto 5 (enfrentamiento con el Tejedor). Esto incentiva al jugador a re-jugar o a explorar caminos alternativos.

### 13.5 Cerrar el círculo con el ending

El ending actual evalúa flags de misiones y resoluciones. Añadir `reina_resolution` como un factor que modifica el enfrentamiento con el Tejedor da **peso real** a las decisiones del jugador en esta secuencia.

---

## 14. Notas de implementación

### 14.1 Reutilización de código existente

- El estilo `'umbral'` en DialogueSystem ya existe — el estilo `'reina'` es una copia con cambio de color (violeta en lugar de dorado) y la animación de vibración
- El sprite del abuelo joven puede ser una **recoloración** del sprite de Mateo con ropa de adulto (pantalón café, camisa clara) — no requiere animación nueva
- La zona abstracta de V_THRONE puede basarse en V_UMBRAL (misma lógica de render sin tilemap)
- El sistema de triggers condicionales en `ZoneV_HUB.js` ya existe para V_HEART — solo hay que copiar el patrón
- `MinigameObservationSystem` puede reutilizar la lógica de `interact` de `InputSystem`

### 14.2 La precuela es un "viaje mental"

La precuela NO carga una zona real del pasado. Es una **secuencia guionizada**:
1. TransitionFX.play('diary_open') → pantalla se pliega
2. Se carga la zona `V_LIGHTHOUSE` pero con una capa de overlay sepia (filtro de color)
3. Los objetos de la zona son los mismos, pero con 3 adicionales (los objetos ocultos)
4. Se activa el MinigameObservationSystem

Esto significa que no hay que crear tilesets nuevos para el pasado — se reutiliza V_LIGHTHOUSE con filtro visual.

### 14.3 Reina no tiene barra de vida

Siguiendo el principio de diseño #5, Reina NO es un enemigo al que se "ataca". Incluso en la Rama B (sin diario), el desafío es de **supervivencia**, no de combate ofensivo. Mateo debe esquivar Ecos que Reina convoca, usando Corazón Firme para inmovilizarlos y el silbido para distraerlos, hasta que Luna llega y Reina detiene la prueba.

### 14.4 Verificación de IDs de diálogo

Los siguientes IDs NO existen en `assets/data/dialogues.json` (verificado con `search_in_files`):
- `m08_*` — todos nuevos ✅
- `abuelo_reina_*` — todos nuevos ✅
- `abuelo_memory_*` — todos nuevos ✅
- `reina_encounter_*` — todos nuevos ✅
- `reina_final_*` — todos nuevos ✅

### 14.5 Dependencias entre misiones actualizadas

```
M01 (Lighthouse)  → sin requisitos
M02 (Melody)      → sin requisitos
M03 (Garden)      → sin requisitos
M04 (Dogs)        → requiere: hablar con Carmen
M05 (Brothers)    → requiere: M04 completada
M06 (Library)     → sin requisitos (se enriquece con M01 secreta)
M07 (Cemetery)    → sin requisitos
M08 (Grandfather) → requiere: M06 completada + M07 completada + abuelo_connection_unlocked
↑ NUEVA

Reina (V_THRONE)  → requiere: M08 completada (reina_vacio_unlocked)
```

---

## 15. Resumen visual del flujo completo

```
[PARTIDA PRINCIPAL]
       │
       ├── M01-M07 (misiones existentes)
       │
       ├── M06 + M07 completadas
       │       │
       │       ▼
       │  ┌──────────────────────┐
       │  │  M08 — El diario     │  ← NUEVO
       │  │  del abuelo          │
       │  │  (precuela jugable)  │
       │  │  - Minijuego obs #1  │
       │  │  - Minijuego patrón  │
       │  │  - Encuentro con     │
       │  │    Reina dormida     │
       │  └──────────┬───────────┘
       │             │
       │             ▼
       │  ┌──────────────────────┐
       │  │  V_THRONE            │  ← NUEVO
       │  │  (El Trono del Vacío)│
       │  │  - Cortesanos        │
       │  │  - Reina despierta   │
       │  │    ┌───────┬───────┐ │
       │  │    │ RAMA A│ RAMA B│ │
       │  │    │diario │sin    │ │
       │  │    │ = paz │diario │ │
       │  │    │       │= prueba│ │
       │  │    └───┬───┴───────┘ │
       │  └────────┼──────────────┘
       │           │
       │     ┌─────┴──────┐
       │     │ 4 resoluciones │
       │     │ (pacto / aliada│
       │     │ confianza /    │
       │     │ respeto_cond.) │
       │     └──────┬─────────┘
       │            │
       ▼            ▼
  [ACTO 5 — ENFRENTAMIENTO CON EL TEJEDOR]
  (modificado según reina_resolution)
```

---

---

## 16. Narrativa

### 16.1 Historia de Reina — la soberana dormida

Antes de que el Tejedor comenzara a tejer Grietas, antes de que Miraloma existiera como pueblo, el Vacío ya tenía una habitante. No era un Eco ni un Atado — era algo distinto, anterior. Una presencia consciente que flotaba en el núcleo de la dimensión, hecha de luz violeta y sombras, con tres fragmentos de realidad girando sobre su cabeza como una corona. No tenía nombre porque nadie la había visto ni nombrado. Durante siglos fue solo eso: una posibilidad durmiente, el Vacío soñándose a sí mismo. Los Ecos pasaban a su lado sin percibirla, como peces que nadan junto a una roca y no saben que la roca respira.

Hace cuarenta años, el abuelo de Mateo — un hombre silencioso de treinta y cinco años que había aprendido a leer las costuras del mundo — la encontró durante las dos semanas que desapareció bajo el faro. No la despertó. Pero al ver su porte incluso en el sueño, con aquellos fragmentos girando lentamente sobre su cabeza, supo que no era un monstruo ni un dios. Era algo que merecía un nombre. La llamó Reina. Y ese nombre, dicho por primera vez en el Vacío, fue como una llave girando en una cerradura que nadie sabía que existía. Los fragmentos de su corona giraron más rápido un instante, como si la palabra hubiera viajado hasta el fondo del sueño y ella, desde el otro lado, hubiera sonreído.

Cuando el abuelo murió, el eco de su nombre se apagó. Reina despertó. Y descubrió que durante su larga siesta, algo había estado ocupando su dimensión: el Tejedor, una entidad que expandía el Vacío sin orden ni conciencia, abriendo Grietas como heridas en un cuerpo ajeno. Reina, al despertar, reclamó lo que siempre fue suyo. Ahora gobierna desde el Trono del Vacío profundo, rodeada de Cortesanos — Ecos que ella misma ha elevado con su poder —, y ve a Mateo como el heredero del único humano que la reconoció. No sabe si es un aliado o una amenaza. Pero recuerda el nombre. Y mientras Mateo lleve ese nombre en el diario de quien se lo dio, hay una posibilidad de que el Vacío no tenga que ser un enemigo.

### 16.2 Nodos de diálogo nuevos (formato JSON exacto del juego)

Los siguientes 5 nodos representan los momentos clave del arco narrativo de Reina: desde el nombramiento en la precuela hasta la resolución del encuentro. Siguen el formato exacto de `docs/dialogue_trees.md`.

#### Nodo 1 — El nombramiento (abuelo_reina_05)
Ocurre en la precuela M08, paso 3. El abuelo joven, frente a Reina dormida, le da un nombre por primera vez. Usa el nuevo estilo `'abuelo_memory'` (fondo sepia, texto marrón, fuente cursiva simulada) que refleja que es una entrada del diario. Requiere que el abuelo haya visto a Reina (flag `m08_reina_seen` activo). Este nodo es el que activa la reacción de Reina en el sueño (los fragmentos giran más rápido).

```json
{
  "id": "abuelo_reina_05",
  "speaker": "",
  "portrait": null,
  "text": "Te llamaré Reina. Porque incluso dormida, se nota. Eres la dueña de este lugar. Espero no tener que despertarte nunca.",
  "next": "abuelo_reina_05b",
  "style": "abuelo_memory",
  "condition": "flag:m08_reina_seen",
  "onEnter": "saveSystem.setFlag('m08_reina_named', true)"
},
{
  "id": "abuelo_reina_05b",
  "speaker": "",
  "portrait": null,
  "text": "Los fragmentos sobre su cabeza giran más rápido un instante, como si hubiera escuchado. Como si la palabra 'reina' le hubiera llegado en el sueño.",
  "next": null,
  "style": "narrative_float"
}
```

#### Nodo 2 — El reconocimiento (reina_encounter_01)
La primera palabra que Reina dirige a Mateo en el presente. Ocurre en el Trono del Vacío, cuando Mateo llega por primera vez. No usa speaker visible — la voz de Reina vibra en el aire, representada con el estilo `'umbral'` (texto centrado, fondo violeta translúcido, partículas). Marca el encuentro como ocurrido para el resto del sistema de flags.

```json
{
  "id": "reina_encounter_01",
  "speaker": "",
  "portrait": null,
  "text": "Mateo.",
  "next": "reina_encounter_02",
  "style": "umbral",
  "onEnter": "saveSystem.setFlag('reina_met', true)"
},
{
  "id": "reina_encounter_02",
  "speaker": "mateo",
  "portrait": "mateo_curious",
  "text": "¿Sabes mi nombre?",
  "next": "reina_encounter_03",
  "style": "umbral"
},
{
  "id": "reina_encounter_03",
  "speaker": "",
  "portrait": null,
  "text": "Sé muchas cosas. Sé que tu abuelo me llamó Reina. Sé que sellaste siete grietas. Sé que Luna te acompaña. Pero no sé por qué has venido.",
  "next": "reina_encounter_A_01",
  "style": "umbral",
  "condition": "flag:m08_reina_named"
}
```

#### Nodo 3 — La revelación del nombre (reina_encounter_A_02)
Solo visible si Mateo completó M08 (trae el diario). Reina revela lo que significó para ella ser nombrada. Este es el momento de mayor conexión emocional entre Mateo y Reina — ella no habla como una soberana, sino como alguien que recibió un regalo sin saber cómo agradecerlo.

```json
{
  "id": "reina_encounter_A_02",
  "speaker": "",
  "portrait": null,
  "text": "Tu abuelo fue el primero en verme. El primero en darme un nombre. Nadie había nombrado nada en el Vacío. Antes de él, yo era solo... posibilidad.",
  "next": "reina_encounter_A_03",
  "style": "umbral",
  "condition": "flag:m08_reina_named"
},
{
  "id": "reina_encounter_A_03",
  "speaker": "",
  "portrait": null,
  "text": "Desperté porque él se fue. Mientras estuvo en el mundo real, su presencia me mantenía dormida. Cuando murió, el eco de su nombre se apagó. Y el Vacío me llamó.",
  "next": "reina_encounter_A_04",
  "style": "umbral"
}
```

#### Nodo 4 — La identidad del Vacío (reina_encounter_A_05c)
El diálogo más profundo de Reina. Revela que el Vacío no es solo su hogar — es su cuerpo. Este nodo solo está disponible si el jugador elige la opción sobre guardianes en el árbol de diálogo (nodo `reina_encounter_A_04`). La línea "Las Grietas son mis heridas" es el núcleo temático del personaje. El uso de `condition` con el flag de resolución previa asegura que no se muestra fuera de contexto.

```json
{
  "id": "reina_encounter_A_05c",
  "speaker": "",
  "portrait": null,
  "text": "Tu abuelo también preguntó eso. Me llamó guardiana y luego se rió de sí mismo. Dijo: 'No, tú no eres guardiana. Eres la casa.' Y tenía razón. El Vacío es mi cuerpo. Las Grietas son mis heridas. Y tú, Mateo, eres quien las cura.",
  "next": "reina_encounter_A_06",
  "style": "umbral",
  "condition": "flag:m08_reina_named"
}
```

#### Nodo 5 — El pacto (reina_final_A_pacto)
La resolución del encuentro si el jugador elige "Protege Miraloma" en el nodo de decisión final (`reina_encounter_A_07`). Reina sella su palabra. El onExit activa el flag de resolución y emite un evento que el sistema de game states puede leer para modificar el Vacío permanentemente.

```json
{
  "id": "reina_final_A_pacto",
  "speaker": "",
  "portrait": null,
  "text": "Que así sea. Miraloma no será tocada por el Vacío mientras yo reine. El Tejedor será contenido. Los Ecos no cruzarán. Es mi palabra. Y la palabra de una reina no se rompe.",
  "next": null,
  "style": "umbral",
  "onExit": "saveSystem.setFlag('reina_resolution', 'pacto'); eventBus.emit('reina:pacto_established')"
}
```

### 16.3 Consecuencia visible al completar la misión

Cuando Mateo completa el encuentro con Reina (cualquier resolución), el mundo cambia de forma permanente. La consecuencia varía según la resolución, pero hay un cambio común y cambios específicos:

**Cambio común (todas las resoluciones):**
- El Trono del Vacío (V_THRONE) se vuelve un lugar seguro. Los Cortesanos ya no bloquean el paso — se apartan al ver a Mateo.
- En el Vacío superficial, los Ecos menores evitan la zona alrededor del faro, como si reconocieran que esa frontera está vigilada.
- Aparece un brillo violeta tenue en el horizonte del Vacío, visible desde cualquier zona: la señal de que Reina está despierta y ha tomado una decisión.
- Al volver al desván (`R_HOME_ATTIC`), el diario del abuelo tiene una entrada nueva que Mateo no había visto: una sola línea, escrita con letra temblorosa, que dice *"Ella recuerda. Todo va a estar bien."*

**Cambios específicos por resolución:**

| Resolución | Cambio visible en el mundo | Efecto en el Vacío |
|-----------|---------------------------|-------------------|
| `pacto` | El Trono se ilumina con luz violeta cálida. Los fragmentos de la corona de Reina emiten partículas doradas. En el desván, el diario del abuelo brilla suavemente al tocarlo. | Zona V_THRONE: fondo cambia de negro a violeta profundo. Los Cortesanos se arrodillan al paso de Mateo. Aparecen flores de luz en las grietas del suelo. |
| `aliada` | Mateo obtiene el Fragmento de Reina (ítem visible en el inventario: un triángulo violeta que pulsa). En el Trono, un fragmento de la corona de Reina ya no está — lo tiene Mateo. | Zona V_THRONE: el trono tiene un espacio vacío donde estaba el fragmento. Los Cortesanos observan a Mateo con curiosidad, no con hostilidad. |
| `confianza` | En el mapa del mundo real, aparece un nuevo ícono: una huella violeta que marca dónde Reina intervendrá en el Acto 5. En el Trono, Reina ya no está sentada — está de pie, mirando hacia la salida del Vacío. | Zona V_THRONE: Reina no está presente cuando Mateo vuelve a visitar la zona (está "preparando el camino" para el Acto 5). Los Cortesanos cuidan el trono vacío. |
| `respeto_condicional` | El Trono permanece en penumbra. No hay cambio visual inmediato, pero la entrada a V_THRONE queda permanentemente accesible en el HUB del Vacío. Si Mateo regresa después con M08 completada, el Trono se ilumina gradualmente mientras Reina lee el diario. | Zona V_THRONE: sin cambios hasta que Mateo traiga el diario. Los Cortesanos siguen bloqueando el paso (el Guardián se aparta solo si ve el diario). |

**Inspección post-misión en el desván:**
Al volver al desván tras el encuentro con Reina (cualquier resolución), el diario del abuelo muestra un diálogo de inspección nuevo:

```json
{
  "id": "inspect_diario_post_reina",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "La última página del diario tiene una línea que no estaba ahí. Dice: 'Ella recuerda. Todo va a estar bien.' La letra es de mi abuelo. Pero esto no lo escribió hace cuarenta años. Lo escribió ahora. Mientras yo estaba en el Vacío.",
  "next": null,
  "style": "narrative_float",
  "condition": "flag:reina_met"
}
```

### 16.4 Flags necesarios (verificados contra game_states.md y dialogue_trees.md)

Los flags listados en la sección 9 de esta propuesta ya han sido verificados. A continuación se añaden **únicamente los flags adicionales** que surgen de esta sección narrativa y que no estaban listados antes:

| Flag | Tipo | Default | Descripción | Set by |
|------|------|---------|-------------|--------|
| `diario_post_reina_entry` | bool | false | Apareció la entrada póstuma del abuelo en el diario | `inspect_diario_post_reina` onEnter |
| `reina_throne_lit` | bool | false | El Trono está iluminado (resolución pacto) | `reina_final_A_pacto` onExit |
| `reina_fragment_given` | bool | false | El Fragmento de Reina fue entregado a Mateo | `reina_final_A_aliada` onExit |
| `reina_throne_empty` | bool | false | Reina no está en el Trono (resolución confianza) | `reina_final_A_confianza` onExit |

**Verificación de duplicados:** Todos estos flags son nuevos. No existen en `docs/game_states.md` (secciones 2–9), ni en ningún archivo de misión existente (`src/missions/data/*.js`). Los IDs de diálogo `inspect_diario_post_reina` no existen en `docs/dialogue_trees.md`.

### 16.5 Notas de coherencia con el lore existente

Durante la verificación narrativa se identificaron los siguientes puntos de atención:

1. **Edad de Mateo:** El lore canónico (`docs/grietas_lore.md`, sección 5) establece la edad de Mateo en **9 años**. La propuesta de diseño hermana `docs/propuesta_design_umbral_espejo.md` menciona "Mateo (12 años)" en su sección 1. Se recomienda unificar a **9 años** — la edad del lore original — o actualizar `grietas_lore.md` si se decidió cambiar la edad.

2. **M07 no documentada en game_states.md:** La misión M07 (`mission_07_cemetery_child.js`) existe como archivo funcional y es usada como requisito de M08 en esta propuesta. Sin embargo, sus flags (`m07_resolution`, `rift_G_cemetery_child_sealed`, etc.) **no están documentados en `docs/game_states.md`**. Se recomienda añadirlos para mantener la integridad del contrato de estado.

3. **Estilo `'abuelo_memory'` y `'reina'` nuevos:** El DialogueSystem actual soporta `'umbral'`, `'narrative_float'` y el estilo por defecto (caja negra). Esta propuesta requiere dos estilos adicionales: `'abuelo_memory'` (fondo sepia, texto marrón, fuente cursiva) y `'reina'` (texto violeta vibrante, variante del estilo `'umbral'` existente). Ambos deben implementarse en `src/ui/DialogueSystem.js` antes de que los nodos de diálogo puedan renderizarse correctamente.

4. **Conexión con el Capítulo 0 (umbral_espejo):** El eco del abuelo en el marco del espejo (escena del umbral) y el abuelo joven en la precuela M08 son la misma persona en distintos puntos de su vida. El flag `abuelo_connection_unlocked` (M06) y `abuelo_backstory_unlocked` (M03) son requisitos compartidos entre ambas narrativas. No hay contradicción, pero se recomienda que el diálogo en M08 reconozca el marco del espejo si el jugador ya completó la escena del umbral (flag `umbral_espejo_visto`).

---

*Documento generado como parte de la sesión de diseño de mecánicas — Sesión: Reina del Vacío.*
*Versión: 1.1 — añadida sección 16: Narrativa (historia de Reina, 5 nodos de diálogo en formato JSON, consecuencias visibles, flags adicionales, notas de coherencia).*
