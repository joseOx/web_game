# Propuesta de diseño — El Corazón del Vacío
## Secuencia lateral de exploración + origen de las Grietas + habilidad pasiva

---

## 1. Resumen

**Nombre:** El Corazón del Vacío (flag: `corazon_vacio_completed`)

**Tipo:** Secuencia lateral de exploración en el Vacío (zona V_HEART) con diálogo en profundidad y desbloqueo de habilidad pasiva "Ecolectura".

**Desbloqueo:** Después de completar **M06 (biblioteca)** y que el flag `abuelo_connection_unlocked` esté activo. Una nueva entrada se abre en el Vacío del Hub (ZoneV_HUB), visible solo con Visión Felina.

**Duración estimada de implementación:** 4–5 horas (zona nueva + sistema pasivo + diálogos + testing)

**Duración de juego para el usuario:** ~15–20 minutos de exploración y diálogo

---

## 2. Justificación narrativa

### El problema que resuelve

Actualmente el juego explica *cómo* funcionan las Grietas (se crean por emociones intensas no procesadas) y *quién* las explota (el Tejedor), pero nunca se responde la pregunta fundamental:

> **¿Por qué existe el Vacío? ¿De dónde vienen las Grietas originalmente?**

El lore (`docs/grietas_lore.md`, sección 4) dice que las Grietas aparecen "donde la emoción humana fue muy intensa y no fue procesada", pero no explica el origen del Vacío como dimensión. También se establece que el abuelo de Mateo pasó dos semanas "bajo el faro" buscando algo, y que encontró "algo que proteger".

### Lo que esta secuencia revela

Luna, a través de un diálogo profundo en el estilo `umbral` (que ya existe y funciona), le explica a Mateo el verdadero origen:

1. **El Vacío no es una dimensión paralela natural** — es el residuo de un evento ancestral. Hace siglos, una comunidad entera de Miraloma fue arrasada por una plaga/desastre. El dolor colectivo fue tan inmenso que "rompió" el tejido de la realidad local, creando el Vacío como una "cicatriz dimensional".

2. **Las Grietas son fisuras en esa cicatriz** — cada vez que alguien siente una emoción muy intensa y no la procesa, la cicatriz se reabre ligeramente. El Tejedor no las crea: las encuentra y las amplía.

3. **Luna no es la única guardiana** — hay otros animales en el mundo que protegen lugares donde el Vacío es delgado. Luna eligió Miraloma porque detectó la cicatriz ancestral más grande que había visto.

4. **El abuelo de Mateo descubrió esto** — sus notas en el desván (attic_discovery_06: "El Vacío no es el otro lado. Es la misma cara.") eran su intento de documentar que el Vacío no es un lugar externo, sino una herida en la misma realidad.

### Impacto emocional

Esta secuencia le da al jugador una respuesta que el juego hasta ahora solo insinuaba. No es un requisito para completar el juego, pero transforma la comprensión del mundo. El jugador que la completa ve el Vacío de otra manera: no como un lugar al que se cruza, sino como una herida que se sana.

---

## 2.5 Narrativa

### 2.5.1 Historia del Eco colectivo — La aldea que ya no existe

No hay un solo Eco en el Corazón del Vacío. Lo que habita este lugar es más antiguo y más difuso: el **residuo emocional de una aldea entera** que desapareció siglos antes de que Miraloma existiera como pueblo.

Era una comunidad de pescadores y labriegos que vivía en el valle donde hoy está Miraloma. Tenían una plaza, una capilla de madera, casas con tejados de paja. Los mayores contaban historias junto al fuego y los niños jugaban en el mismo suelo que Mateo pisa ahora. No hay registros de ellos en ningún archivo — ni en la biblioteca, ni en los documentos de 1974 que el archivista destruyó. Su memoria solo sobrevive en el Vacío, porque el Vacío *es* su memoria.

Cuando la plaga llegó — no una enfermedad del cuerpo, sino un colapso colectivo: cosechas que se pudrían, animales que huían, niños que dejaban de reír — el dolor fue tan denso que la realidad no pudo contenerlo. No hubo un solo momento de ruptura. Fue un desgarro lento, de meses, mientras la aldea se vaciaba de vida y se llenaba de silencio. El Vacío no se abrió como una herida de cuchillo: se formó como un moretón que nunca sanó, que fue creciendo hasta convertirse en otra dimensión.

Los 3 fragmentos que Mateo inspecciona en V_HEART no son objetos simbólicos: son los únicos vestigios físicos que quedan de esa aldea. La piedra con vetas brillantes era parte del hogar central donde se reunían. Las cenizas frías son lo único que el viento del Vacío no ha dispersado. El primer sello de metal fue puesto por alguien que vino después — quizás el abuelo de Mateo, quizás otro guardián anterior — para contener la herida y evitar que siguiera abriéndose. Cuando Luna dice "el Corazón del Vacío", no habla de un lugar: habla de lo que ese lugar contiene. El dolor de una aldea entera, contenido, esperando ser reconocido para poder empezar a cerrarse.

### 2.5.2 Nuevos nodos de diálogo (post-secuencia)

Estos 5 nodos se activan **después** de completar la secuencia, cuando el jugador regresa al mundo real con Ecolectura desbloqueada. Muestran cómo la nueva percepción de Mateo transforma sus interacciones cotidianas.

```json

  "corazon_vacio_post_rosa": {
    "id": "corazon_vacio_post_rosa",
    "speaker": "Rosa",
    "portrait": "rosa_thoughtful",
    "text": "Has vuelto distinto, Mateo. No sé si son los años o la luz, pero tus ojos miran más hondo que antes.",
    "next": "corazon_vacio_post_rosa_02",
    "condition": "flag:corazon_vacio_completed"
  },
  "corazon_vacio_post_rosa_02": {
    "id": "corazon_vacio_post_rosa_02",
    "speaker": "mateo",
    "portrait": "mateo_thoughtful",
    "text": "Abuela... ¿tú también ves colores en las personas? A veces como si tuvieran una luz alrededor.",
    "next": "corazon_vacio_post_rosa_03"
  },
  "corazon_vacio_post_rosa_03": {
    "id": "corazon_vacio_post_rosa_03",
    "speaker": "Rosa",
    "portrait": "rosa_warm",
    "text": "No, hijo. Pero conocí a alguien que sí. Tu abuelo decía lo mismo. \"Las personas son como ventanas, Rosa. Algunas dejan pasar el color.\"",
    "next": null,
    "onExit": "saveSystem.setFlag('rosa_trust_level', 2); eventBus.emit('corazon_vacio:rosa_understands')"
  },

  "corazon_vacio_post_diego": {
    "id": "corazon_vacio_post_diego",
    "speaker": "Diego",
    "portrait": "diego_awkward",
    "text": "Oye. Me está pasando algo raro. Desde que hablamos... siento que ves cosas en mí que ni yo mismo veo.",
    "next": "corazon_vacio_post_diego_02",
    "condition": "flag:diego_ally",
    "onEnter": "audioSystem.playSFX('diego_approach')"
  },
  "corazon_vacio_post_diego_02": {
    "id": "corazon_vacio_post_diego_02",
    "speaker": "mateo",
    "portrait": "mateo_gentle",
    "text": "Solo veo lo que todos tenemos. Algunos lo esconden mejor que otros.",
    "next": null
  },

  "corazon_vacio_post_antonio_echo": {
    "id": "corazon_vacio_post_antonio_echo",
    "speaker": "mateo",
    "portrait": "mateo_soft",
    "text": "Antonio ya no está triste. Su color cambió. Ahora es violeta... como cuando alguien encuentra paz.",
    "next": null,
    "condition": "flag:rift_lighthouse_lantern_sealed",
    "style": "narrative_float"
  },

  "corazon_vacio_post_alma_mundo": {
    "id": "corazon_vacio_post_alma_mundo",
    "speaker": "",
    "portrait": null,
    "style": "narrative_float",
    "text": "Por primera vez, el mundo no es solo un lugar. Es un mapa de emociones. Cada persona que pasa deja un rastro de color. Y Mateo empieza a entender que las Grietas no son monstruos. Son raíces.",
    "next": null,
    "condition": "flag:corazon_vacio_completed"
  },

  "corazon_vacio_post_luna_mirada": {
    "id": "corazon_vacio_post_luna_mirada",
    "speaker": "",
    "portrait": null,
    "style": "narrative_float",
    "text": "Luna te mira desde el borde de la luz. Ya no es la misma gata que encontraste en el jardín aquella noche. O tal vez siempre fue así y tú apenas estás aprendiendo a verla.",
    "next": null,
    "condition": "flag:corazon_vacio_completed"
  }
```

### 2.5.3 Consecuencia narrativa visible en el mundo

| Consecuencia | Tipo | Detalle |
|---|---|---|
| **Rosa nota el cambio** | Diálogo permanente | Al hablar con Rosa después de la secuencia, ella comenta que Mateo "mira más hondo". Si el jugador ha completado M03 y M06, Rosa alcanza el nivel máximo de confianza (`rosa_trust_level = 2`) y revela que el abuelo también veía colores. |
| **Líneas adicionales de Mateo** | Diálogo condicional | En encuentros con Ecos ya completados (Antonio, Vera, el hermano de Diego), Mateo tiene una línea que comenta la emoción que percibe con Ecolectura. No altera la misión — es un eco narrativo que recontextualiza el pasado. |
| **Diego nota la percepción de Mateo** | Diálogo condicional | Si `diego_ally = true`, al hablar con Diego después de la secuencia, él comenta que Mateo "ve cosas" en él. Esto refuerza el vínculo entre ambos y añade profundidad a un aliado existente. |
| **Mateo puede ver el color del Vacío** | Percepción permanente | Al regresar al Vacío después de la secuencia, el fondo de la zona V_HUB y las zonas V_* tienen un tinte adicional muy sutil (overlay de 5% de opacidad) del color emocional predominante de cada zona. Solo visible con Ecolectura desbloqueada. |

### 2.5.4 Verificación de flags (coherencia con `docs/game_states.md`)

No existe `src/data/world_flags.json`. Los flags se definen en `docs/game_states.md`. Los flags propuestos para esta secuencia son:

| Flag | Tipo | Default | Descripción | ¿Existe en game_states.md? |
|---|---|---|---|---|
| `corazon_vacio_completed` | bool | false | Secuencia completa | NO — nuevo flag ✅ |
| `mateo_echo_reading_unlocked` | bool | false | Habilidad pasiva desbloqueada | NO — nuevo flag ✅ |
| `corazon_vacio_fragments_done` | bool | false | 3 fragmentos inspeccionados | NO — nuevo flag ✅ |
| `corazon_vacio_tutorial_seen` | bool | false | Tutorial de Ecolectura ya mostrado | NO — nuevo flag ✅ |
| `corazon_vacio_entrance_seen` | bool | false | Pasaje en V_HUB visto por el jugador | NO — nuevo flag ✅ |
| `corazon_vacio_frag_01_done` | bool | false | Fragmento 1 (piedra) inspeccionado | NO — nuevo flag ✅ |
| `corazon_vacio_frag_02_done` | bool | false | Fragmento 2 (cenizas) inspeccionado | NO — nuevo flag ✅ |
| `corazon_vacio_frag_03_done` | bool | false | Fragmento 3 (sello) inspeccionado | NO — nuevo flag ✅ |

**Ninguno de estos flags existe en `docs/game_states.md` ni en ningún archivo del código fuente.** Todos son nuevos.

**Nota de coherencia con el lore existente:**
- La línea de Rosa "tu abuelo decía que las personas son como ventanas" conecta directamente con `grietas_lore.md` sección 11 (abuelo_backstory_unlocked) y con `attic_discovery_06`: "El Vacío no es el otro lado. Es la misma cara." El abuelo no solo encontró el Corazón — también desarrolló una forma primitiva de Ecolectura, sin la ayuda de Luna. Mateo está siguiendo sus pasos.
- La línea de Diego (`corazon_vacio_post_diego`) solo se activa si `diego_ally = true`, lo que requiere la resolución colaborativa (C) de M05 — manteniendo la coherencia: las decisiones del jugador importan.
- El nodo `corazon_vacio_post_antonio_echo` requiere `rift_lighthouse_lantern_sealed = true` (M01 completada), asegurando que solo se muestre si el jugador ya conoce a Antonio y lo ayudó a descansar.

---

## 3. Mecánica funcional

### 3.1 Habilidad pasiva desbloqueada: Ecolectura

| Aspecto | Valor |
|---------|-------|
| Nombre técnico | `mateo_echo_reading_unlocked` |
| Tipo | Pasiva permanente (no requiere tecla) |
| Desbloqueo | Al completar la secuencia "Corazón del Vacío" |
| Efecto principal | Los Ecos menores y Atados muestran un **halo de color** alrededor de su silueta que indica su emoción dominante (visible incluso sin Visión Felina, pero más intenso con ella) |
| Efecto secundario | Los objetos interactivos cerca de Grietas emiten un pulso de color muy sutil (3px de ancho, alpha 0.15) que coincide con la emoción de la Grieta |
| Efecto en UI | Cuando Mateo está cerca de un Eco o Grieta, aparece un texto tenue en la parte superior: "[emoción] — [intensidad]" ej: "Tristeza — profunda" o "Culpa — latente" |
| Efecto en diálogos | Si el jugador ya completó "Corazón del Vacío", ciertos nodos de diálogo tienen líneas adicionales de Mateo donde comenta qué emoción siente del Eco antes de hablar |

### 3.2 Colores de emociones (usar los mismos del lore)

| Emoción | Color hex | Nombre visual |
|---------|-----------|---------------|
| Tristeza | `#4A6FA5` | Azul profundo |
| Miedo | `#F5E356` | Amarillo pálido |
| Rabia | `#B84A4A` | Rojo apagado |
| Culpa | `#7A9B6B` | Verde grisáceo |
| Amor/Anhelo | `#FFD97D` | Dorado cálido |
| Paz/Resolución | `#C8A9FF` | Violeta claro |

### 3.3 Restricciones

- Ecolectura **no** revela nada que no esté ya en el lore — solo lo hace visible al jugador de forma inmediata
- No funciona si el Eco o Grieta está fuera del campo de visión de la cámara (misma lógica de culling que el render)
- Los colores se atenúan si Mateo está en nivel DANGER o CRITICAL del BondSystem (el vínculo debilitado nubla su percepción)
- No reemplaza la Visión Felina — la complementa. Con Visión Felina activa, los halos son más brillantes y aparece texto adicional

---

## 4. Flujo de la secuencia

### Paso 0: Trigger (automático, al cargar ZoneV_HUB con M06 completada)

```
[Jugador está en el Hub del Vacío (ZoneV_HUB)]
→ Se ha completado M06 (biblioteca)
→ flag 'abuelo_connection_unlocked' = true
→ Aparece un nuevo pasaje en el fondo del Hub del Vacío
  (una abertura que antes era pared, ahora emite un brillo violeta tenue)
→ Al acercarse, un diálogo 'narrative_float' se activa:
  "Algo cambió en esta pared desde la última vez. Luna se sienta frente a ella y no se mueve."
→ Jugador puede interactuar para entrar a la nueva zona V_HEART
```

### Paso 1: Exploración de V_HEART (zona abstracta)

V_HEART es una zona pequeña (~10 pantallas de ancho, 3 de alto), sin tilemap tradicional — usa el estilo abstracto de ZoneV_UMBRAL como base.

**Descripción visual:**
- Fondo negro con partículas violetas tenues
- Paredes que parecen "respirar" (pulso de luz rítmico)
- En el centro, una formación circular de piedras/luz que emite un resplandor más intenso
- No hay Ecos enemigos — solo 3 Ecos menores "testigos" (no hostiles, están en pose de observación)

**Exploración:**
1. Mateo camina hacia adelante. Luna lo sigue, pero camina más lento, mirando a los lados.
2. Al llegar al círculo central, aparece un diálogo automático.
3. Hay **3 objetos resonantes** alrededor del círculo que Mateo puede inspeccionar — cada uno contiene un fragmento de la historia del origen.

### Paso 2: Los 3 fragmentos (objetos inspeccionables)

```
Objeto 1 — "Raíz de piedra" (piedra con vetas brillantes):
  "Esta piedra estaba aquí antes que el pueblo, dice Luna. Antes que las casas.
   Antes que el dolor. El Vacío no siempre existió."

Objeto 2 — "Cenizas frías" (montículo de ceniza que no se esparce):
  "Luna frota su cabeza contra tu mano. Te muestra una imagen:
   una aldea entera, casas de madera, gente reunida en la plaza.
   Luego humo. Luego silencio."

Objeto 3 — "El primer sello" (aro de metal incrustado en el suelo):
  "Alguien estuvo aquí antes que tú. Las marcas en el metal coinciden con
   los grabados del espejo del abuelo. Él también encontró este lugar."
```

Cada objeto dispara un diálogo en estilo `narrative_float` con una duración de ~5 segundos, seguido de un silencio donde Luna ronronea.

### Paso 3: Diálogo central con Luna (estilo umbral)

Al inspeccionar los 3 objetos, Luna se sienta en el centro del círculo y **habla**. Usando el estilo `umbral` (fondo translúcido violeta oscuro, texto centrado con brillo dorado).

Esta es la secuencia de diálogo principal:

```json
{
  "id": "corazon_vacio_luna_01",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "¿Sabes por qué hay tantas grietas aquí? No es casualidad. No es el Tejedor. Es el lugar.",
  "next": "corazon_vacio_luna_02",
  "condition": "flag:corazon_vacio_fragments_done"
},
{
  "id": "corazon_vacio_luna_02",
  "speaker": "mateo",
  "portrait": "mateo_thoughtful",
  "text": "¿Qué quieres decir?",
  "next": null,
  "style": "umbral",
  "choices": [
    { "label": "¿El lugar dónde?", "next": "corazon_vacio_luna_03a" },
    { "label": "¿El Tejedor no crea las grietas?", "next": "corazon_vacio_luna_03b" },
    { "label": "¿Esto tiene que ver con el abuelo?", "next": "corazon_vacio_luna_03c" }
  ]
},
{
  "id": "corazon_vacio_luna_03a",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Aquí. Miraloma. El suelo sobre el que caminas. Hace mucho tiempo — antes de que existiera el nombre del pueblo — esto era una sola herida.",
  "next": "corazon_vacio_luna_04"
},
{
  "id": "corazon_vacio_luna_03b",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "El Tejedor no crea las grietas. Las encuentra. Como un jardinero que riega maleza. Pero la semilla ya estaba aquí, en la tierra.",
  "next": "corazon_vacio_luna_04"
},
{
  "id": "corazon_vacio_luna_03c",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Tu abuelo estuvo aquí. No lo encontró por casualidad. Buscaba el origen. Y lo encontró — el Corazón del Vacío, justo donde estás parado.",
  "next": "corazon_vacio_luna_04"
},
{
  "id": "corazon_vacio_luna_04",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Hace siglos, una plaga arrasó este valle. No una enfermedad. Algo peor: un dolor que no encontró salida. La gente perdió todo. Casas. Familias. Esperanza. Y ese dolor fue tan inmenso, tan denso, que rompió el mundo.",
  "next": "corazon_vacio_luna_05"
},
{
  "id": "corazon_vacio_luna_05",
  "speaker": "mateo",
  "portrait": "mateo_serious",
  "text": "¿Rompió el mundo?",
  "next": null,
  "style": "umbral",
  "choices": [
    { "label": "¿Por eso existe el Vacío?", "next": "corazon_vacio_luna_06a" },
    { "label": "¿Esa rotura sigue aquí?", "next": "corazon_vacio_luna_06b" },
    { "label": "¿El abuelo supo todo esto?", "next": "corazon_vacio_luna_06c" }
  ]
},
{
  "id": "corazon_vacio_luna_06a",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "El Vacío es la cicatriz de esa rotura. No es otro mundo. Es lo que quedó cuando el dolor fue tanto que la realidad no pudo sostener su propia forma.",
  "next": "corazon_vacio_luna_07"
},
{
  "id": "corazon_vacio_luna_06b",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Las cicatrices no desaparecen. Se vuelven parte de ti. Miraloma creció sobre esa herida. Y cada vez que alguien siente algo tan intenso que no puede procesarlo, la herida se reabre un poco.",
  "next": "corazon_vacio_luna_07"
},
{
  "id": "corazon_vacio_luna_06c",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Tu abuelo lo descubrió solo, sin ayuda de nadie. Pasó semanas buscando, preguntando, midiendo. Hasta que llegó aquí. Al Corazón. Y entendió lo que había que hacer.",
  "next": "corazon_vacio_luna_07"
},
{
  "id": "corazon_vacio_luna_07",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Las grietas no son el problema, Mateo. Son el síntoma. El Vacío es la herida. Cada vez que ayudas a alguien a resolver su dolor, la herida se cierra un poco más.",
  "next": "corazon_vacio_luna_08"
},
{
  "id": "corazon_vacio_luna_08",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "¿Y el Tejedor?",
  "next": null,
  "style": "umbral",
  "choices": [
    { "label": "¿Él quiere mantener la herida abierta?", "next": "corazon_vacio_luna_09a" },
    { "label": "¿Por qué alguien haría eso?", "next": "corazon_vacio_luna_09b" }
  ]
},
{
  "id": "corazon_vacio_luna_09a",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "El Tejedor nació de la herida. Es su primer habitante. No quiere destruir el mundo real — quiere expandir el Vacío porque es su hogar. No lo hace por maldad. Lo hace porque no conoce otra cosa.",
  "next": "corazon_vacio_luna_10"
},
{
  "id": "corazon_vacio_luna_09b",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Hay quienes crecen en la oscuridad y aprenden a amarla. El Tejedor es el Vacío hecho voluntad. No sabe lo que es cerrar. Solo sabe abrir.",
  "next": "corazon_vacio_luna_10"
},
{
  "id": "corazon_vacio_luna_10",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Ahora tú también lo sabes. El Corazón te ha mostrado lo que vio tu abuelo. Y lo que yo veo desde que llegué aquí.",
  "next": "corazon_vacio_luna_11"
},
{
  "id": "corazon_vacio_luna_11",
  "speaker": "Luna",
  "portrait": null,
  "style": "umbral",
  "text": "Cada grieta que sellaste, cada persona que ayudaste a descansar... eso es cerrar la herida. No con poder. Con presencia.",
  "next": "corazon_vacio_luna_12"
},
{
  "id": "corazon_vacio_luna_12",
  "speaker": "",
  "portrait": null,
  "style": "narrative_float",
  "text": "Luna apoya su frente contra la tuya. Por un instante, ves lo que ella ve: el mundo real, pero con capas. Debajo de cada persona, una sombra de color. Debajo de cada Grieta, una raíz que llega hasta este lugar. Y debajo de todo, un latido. El Corazón del Vacío.",
  "next": "corazon_vacio_luna_end"
},
{
  "id": "corazon_vacio_luna_end",
  "speaker": "",
  "portrait": null,
  "style": "narrative_float",
  "text": "Al abrir los ojos, algo cambió. Ahora puedes ver el color de lo que sienten. No con palabras — con presencia.",
  "next": null,
  "onExit": "saveSystem.setFlag('corazon_vacio_completed', true); saveSystem.setFlag('mateo_echo_reading_unlocked', true); saveSystem.setFlag('corazon_vacio_tutorial_seen', true)"
}
```

### Paso 4: Desbloqueo y tutorial de Ecolectura

Al salir del diálogo, aparece un breve tutorial:

```
[narrative_float]
  "Ecolectura desbloqueada — ahora puedes percibir la emoción de los Ecos y las Grietas
   a simple vista. El color te dice lo que sienten antes de que hablen.
   [Se ve un halo de color alrededor de los Ecos y objetos cercanos a Grietas]"
```

A partir de aquí, el sistema `EchoReadingSystem` se activa permanentemente.

---

## 5. Sistemas involucrados

### 5.1 Sistema nuevo: `EchoReadingSystem`

Archivo: `src/systems/EchoReadingSystem.js`

Clase que maneja:
- Estado de la habilidad (bloqueada/desbloqueada, leído del flag `mateo_echo_reading_unlocked`)
- Asignación de color a cada Echo según su emoción (leída de `echo.emotion` o `rift.emotion`)
- Render de halos de color alrededor de Ecos y objetos cercanos a Grietas
- Render del texto de emoción en UI cuando Mateo está cerca de un Eco/Grieta
- Integración con BondSystem: los halos se atenúan si el vínculo está bajo

### 5.2 Zona nueva: ZoneV_HEART

Archivo: `src/world/zones/ZoneV_HEART.js`

Zona abstracta pequeña sin tilemap (como V_UMBRAL), con:
- Fondo oscuro con partículas
- Un círculo central (el "Corazón")
- 3 objetos inspeccionables (los fragmentos)
- Sin Ecos hostiles
- Una salida de regreso al Hub del Vacío

### 5.3 Sistemas existentes modificados

| Sistema | Cambio |
|---------|--------|
| `main.js` | ① Instanciar `EchoReadingSystem` ② Inyectar dependencias ③ Registrar en update y render ④ Registrar check de desbloqueo (M06 completada + abuelo_connection_unlocked) |
| `SceneManager.js` | Registrar la nueva zona V_HEART como zona válida. Posiblemente añadir spawn condicional para el pasaje en V_HUB |
| `ZoneV_HUB.js` | Añadir un nuevo exit condicional (visible solo con `flag:abuelo_connection_unlocked`) que lleve a V_HEART |
| `EchoMinor.js` / `EchoBound.js` | Añadir propiedad `emotion` si no existe, para que EchoReadingSystem pueda leerla |
| `Rift.js` | Añadir propiedad `emotion` a las Grietas (opcional, para compatibilidad) |
| `BondSystem.js` | **Sin cambios** — EchoReadingSystem lee `bondSystem.normalized()` para atenuar halos |
| `SaveSystem.js` | **Sin cambios** — los flags se persisten automáticamente |

---

## 6. Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `src/systems/EchoReadingSystem.js` | Sistema principal de la habilidad pasiva (~150 líneas) |
| `src/world/zones/ZoneV_HEART.js` | Definición de la nueva zona del Corazón del Vacío (~50 líneas) |
| `assets/data/dialogues_corazon_vacio.json` | Nodos de diálogo de la secuencia (~80 líneas, referenciados para añadir a dialogues.json) |
| `docs/propuesta_design_corazon_vacio.md` | Este documento |

---

## 7. Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/main.js` | ① Importar EchoReadingSystem ② Instanciar e inyectar en update/render ③ Añadir trigger de desbloqueo condicional ④ Registrar ZoneV_HEART en SceneManager |
| `src/world/zones/ZoneV_HUB.js` | Añadir exit condicional `{ targetZone: 'V_HEART', x, y, condition: 'abuelo_connection_unlocked' }` |
| `assets/data/dialogues.json` | Añadir los ~18 nodos de diálogo de la secuencia (IDs: `corazon_vacio_*`) |

---

## 8. Integración con habilidades existentes

| Habilidad | Dueño | Sinergia con Ecolectura |
|-----------|-------|------------------------|
| Visión Felina | Luna/Mateo (Shift) | Con visión activa, los halos de emoción son más brillantes y aparece texto detallado |
| Corazón Firme | Mateo (F) | No hay sinergia directa, pero ambas son pasivas/activas complementarias |
| Memoria Compartida | Mateo (E hold) | Ecolectura revela qué objetos tienen carga emocional, facilitando la decisión de usar Memoria Compartida |
| Ronroneo sellador | Luna | Ecolectura muestra qué emoción tiene la Grieta antes de sellarla, información útil para el contexto narrativo |

---

## 9. Efecto visual de Ecolectura

### Halos en Ecos
- Anillo tenue alrededor de cada Echo (radio: +4px sobre el sprite del Echo)
- Color según emoción (ver tabla en 3.2)
- Alpha: 0.25 sin Visión Felina, 0.55 con Visión Felina
- El halo pulsa suavemente (escala 0.95→1.05 en 2 segundos, loop)

### Halos en objetos cerca de Grietas
- Línea fina (2px) en el borde del objeto
- Mismo color que la emoción de la Grieta más cercana
- Alpha: 0.15 sin Visión Felina, 0.35 con Visión Felina
- Solo visible si el objeto está a menos de 60px de una Grieta activa

### Texto de emoción en UI
- Aparece cuando Mateo está a menos de 100px de un Eco o Grieta
- Texto pequeño (8px) en la esquina superior derecha
- Formato: `"Tristeza — profunda"` (emoción en español, seguida de intensidad)
- Color: el mismo del halo
- Se desvanece si Mateo se aleja (>120px)

---

## 10. Consecuencias visibles en el mundo

| Efecto | Tipo | Descripción |
|--------|------|-------------|
| Pasaje nuevo en V_HUB | Mapa | Una abertura brillante aparece en el fondo del Hub del Vacío, visible con Visión Felina |
| Halos emocionales alrededor de Ecos | Visual permanente | Todos los Ecos en el juego muestran su emoción como halo de color (cambio global) |
| Texto de emoción en UI al acercarse | UI permanente | Aparece un texto descriptivo de la emoción al acercarse a Ecos y Grietas |
| Diálogo de Rosa activable | Diálogo condicional | Si el jugador habla con Rosa después de completar la secuencia, ella nota que Mateo "mira las cosas de otra manera" |
| Diálogo de Mateo adicional en encuentros con Ecos | Diálogo | En ciertos nodos de diálogo con Ecos (Antonio, Vera, Tomás, etc.), Mateo tiene una línea adicional donde comenta la emoción que percibe |

---

## 11. Flags necesarios

| Flag | Tipo | Default | Descripción | Set by |
|------|------|---------|-------------|--------|
| `corazon_vacio_completed` | bool | false | Secuencia completa | `corazon_vacio_luna_end` onExit |
| `mateo_echo_reading_unlocked` | bool | false | Habilidad pasiva desbloqueada | `corazon_vacio_luna_end` onExit |
| `corazon_vacio_fragments_done` | bool | false | Los 3 fragmentos de la zona V_HEART han sido inspeccionados | Cada objeto en V_HEART al ser inspeccionado |
| `corazon_vacio_tutorial_seen` | bool | false | Tutorial de Ecolectura ya mostrado | `corazon_vacio_luna_end` onExit |
| `corazon_vacio_entrance_seen` | bool | false | El pasaje en V_HUB fue visto por el jugador | Al cargar V_HUB con la entrada visible |

**Verificación de duplicados:** Los IDs de diálogo (`corazon_vacio_luna_01` a `corazon_vacio_luna_end`) y los flags listados arriba no existen en `assets/data/dialogues.json`. Se verificó con `search_in_files`.

---

## 12. Conexión con el lore existente

| Elemento del lore | Cómo se conecta |
|-------------------|-----------------|
| `grietas_lore.md` sección 3: "El Vacío es una dimensión especular distorsionada" | La secuencia explica *por qué* es especular: porque es el reflejo de una herida |
| `grietas_lore.md` sección 4: "Las Grietas aparecen donde la emoción humana fue muy intensa" | La secuencia revela que esa regla no es abstracta: la cicatriz ancestral es la razón |
| Documentos de 1974 (M06) y el abuelo | El abuelo encontró el Corazón del Vacío y documentó su ubicación en el espejo |
| `attic_discovery_06`: "El Vacío no es el otro lado. Es la misma cara." | La secuencia es la confirmación narrativa de esta línea: el Vacío es la misma realidad, herida |
| El Tejedor (`weaver_first_seen_03`: "El niño que entra. Interesante. Yo también entré así, hace mucho.") | La secuencia sugiere que el Tejedor también fue humano, atrapado en el Vacío ancestral |
| `umbral_luna_07b`: "Su partida dejó un vacío dentro de ti. Real. Un espacio por donde el Vacío podía filtrarse." | La secuencia explica que esto pasa a escala macro: Miraloma tiene una herida colectiva igual |

---

## 13. Testing plan

1. **Trigger:** Completar M06 → ir a V_HUB → ¿aparece el nuevo pasaje?
2. **Entrada:** Sin M06 completada → ¿el pasaje NO aparece?
3. **Exploración:** ¿La zona V_HEART se carga correctamente? ¿Se ven los 3 objetos?
4. **Fragmentos:** ¿Al inspeccionar cada objeto se dispara el diálogo correcto?
5. **Diálogo central:** ¿Después de los 3 fragmentos, Luna habla? ¿Todas las ramas de diálogo funcionan?
6. **Desbloqueo:** ¿El flag `mateo_echo_reading_unlocked` se setea al final?
7. **Halos:** ¿Los Ecos muestran halos de color? ¿Coinciden con su emoción?
8. **Atenuación:** ¿Los halos se atenúan cuando el bond está bajo?
9. **UI de emoción:** ¿Aparece el texto de emoción al acercarse a Ecos/Grietas? ¿Desaparece al alejarse?
10. **Diálogos adicionales:** ¿Mateo tiene líneas extra en encuentros con Ecos después del desbloqueo?
11. **Guardado:** Al cargar partida, ¿los flags persisten? ¿Ecolectura sigue funcionando?
12. **Sin desbloqueo:** Sin completar la secuencia, ¿los halos NO aparecen?

---

## 14. Nodos de diálogo completos para dialogues.json

Añadir al final de `assets/data/dialogues.json` (antes de la llave de cierre `}`):

```json

  "corazon_vacio_fragment_01": {
    "id": "corazon_vacio_fragment_01", "speaker": "", "portrait": null,
    "style": "narrative_float",
    "text": "Esta piedra estaba aquí antes que el pueblo. Antes que las casas. Antes que el dolor. El Vacío no siempre existió.",
    "next": null,
    "onExit": "saveSystem.setFlag('corazon_vacio_frag_01_done', true); eventBus.emit('corazon_vacio:fragment_picked', 'id', '01')"
  },
  "corazon_vacio_fragment_02": {
    "id": "corazon_vacio_fragment_02", "speaker": "", "portrait": null,
    "style": "narrative_float",
    "text": "Luna frota su cabeza contra tu mano. Te muestra una imagen: una aldea entera, casas de madera, gente reunida en la plaza. Luego humo. Luego silencio.",
    "next": null,
    "onExit": "saveSystem.setFlag('corazon_vacio_frag_02_done', true); eventBus.emit('corazon_vacio:fragment_picked', 'id', '02')"
  },
  "corazon_vacio_fragment_03": {
    "id": "corazon_vacio_fragment_03", "speaker": "", "portrait": null,
    "style": "narrative_float",
    "text": "Alguien estuvo aquí antes que tú. Las marcas en el metal coinciden con los grabados del espejo del abuelo. Él también encontró este lugar.",
    "next": null,
    "onExit": "saveSystem.setFlag('corazon_vacio_frag_03_done', true); eventBus.emit('corazon_vacio:fragment_picked', 'id', '03')"
  },

  "corazon_vacio_luna_01": {
    "id": "corazon_vacio_luna_01", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "¿Sabes por qué hay tantas grietas aquí? No es casualidad. No es el Tejedor. Es el lugar.",
    "next": "corazon_vacio_luna_02",
    "condition": "flag:corazon_vacio_fragments_done"
  },
  "corazon_vacio_luna_02": {
    "id": "corazon_vacio_luna_02", "speaker": "mateo", "portrait": "mateo_thoughtful",
    "text": "¿Qué quieres decir?",
    "style": "umbral",
    "choices": [
      { "label": "¿El lugar dónde?", "next": "corazon_vacio_luna_03a" },
      { "label": "¿El Tejedor no crea las grietas?", "next": "corazon_vacio_luna_03b" },
      { "label": "¿Esto tiene que ver con el abuelo?", "next": "corazon_vacio_luna_03c" }
    ]
  },
  "corazon_vacio_luna_03a": {
    "id": "corazon_vacio_luna_03a", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Aquí. Miraloma. El suelo sobre el que caminas. Hace mucho tiempo — antes de que existiera el nombre del pueblo — esto era una sola herida.",
    "next": "corazon_vacio_luna_04"
  },
  "corazon_vacio_luna_03b": {
    "id": "corazon_vacio_luna_03b", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "El Tejedor no crea las grietas. Las encuentra. Como un jardinero que riega maleza. Pero la semilla ya estaba aquí, en la tierra.",
    "next": "corazon_vacio_luna_04"
  },
  "corazon_vacio_luna_03c": {
    "id": "corazon_vacio_luna_03c", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Tu abuelo estuvo aquí. No lo encontró por casualidad. Buscaba el origen. Y lo encontró — el Corazón del Vacío, justo donde estás parado.",
    "next": "corazon_vacio_luna_04"
  },
  "corazon_vacio_luna_04": {
    "id": "corazon_vacio_luna_04", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Hace siglos, una plaga arrasó este valle. No una enfermedad. Algo peor: un dolor que no encontró salida. La gente perdió todo. Casas. Familias. Esperanza. Y ese dolor fue tan inmenso, tan denso, que rompió el mundo.",
    "next": "corazon_vacio_luna_05"
  },
  "corazon_vacio_luna_05": {
    "id": "corazon_vacio_luna_05", "speaker": "mateo", "portrait": "mateo_serious",
    "text": "¿Rompió el mundo?",
    "style": "umbral",
    "choices": [
      { "label": "¿Por eso existe el Vacío?", "next": "corazon_vacio_luna_06a" },
      { "label": "¿Esa rotura sigue aquí?", "next": "corazon_vacio_luna_06b" },
      { "label": "¿El abuelo supo todo esto?", "next": "corazon_vacio_luna_06c" }
    ]
  },
  "corazon_vacio_luna_06a": {
    "id": "corazon_vacio_luna_06a", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "El Vacío es la cicatriz de esa rotura. No es otro mundo. Es lo que quedó cuando el dolor fue tanto que la realidad no pudo sostener su propia forma.",
    "next": "corazon_vacio_luna_07"
  },
  "corazon_vacio_luna_06b": {
    "id": "corazon_vacio_luna_06b", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Las cicatrices no desaparecen. Se vuelven parte de ti. Miraloma creció sobre esa herida. Y cada vez que alguien siente algo tan intenso que no puede procesarlo, la herida se reabre un poco.",
    "next": "corazon_vacio_luna_07"
  },
  "corazon_vacio_luna_06c": {
    "id": "corazon_vacio_luna_06c", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Tu abuelo lo descubrió solo, sin ayuda de nadie. Pasó semanas buscando, preguntando, midiendo. Hasta que llegó aquí. Al Corazón. Y entendió lo que había que hacer.",
    "next": "corazon_vacio_luna_07"
  },
  "corazon_vacio_luna_07": {
    "id": "corazon_vacio_luna_07", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Las grietas no son el problema, Mateo. Son el síntoma. El Vacío es la herida. Cada vez que ayudas a alguien a resolver su dolor, la herida se cierra un poco más.",
    "next": "corazon_vacio_luna_08"
  },
  "corazon_vacio_luna_08": {
    "id": "corazon_vacio_luna_08", "speaker": "mateo", "portrait": "mateo_soft",
    "text": "¿Y el Tejedor?",
    "style": "umbral",
    "choices": [
      { "label": "¿Él quiere mantener la herida abierta?", "next": "corazon_vacio_luna_09a" },
      { "label": "¿Por qué alguien haría eso?", "next": "corazon_vacio_luna_09b" }
    ]
  },
  "corazon_vacio_luna_09a": {
    "id": "corazon_vacio_luna_09a", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "El Tejedor nació de la herida. Es su primer habitante. No quiere destruir el mundo real — quiere expandir el Vacío porque es su hogar. No lo hace por maldad. Lo hace porque no conoce otra cosa.",
    "next": "corazon_vacio_luna_10"
  },
  "corazon_vacio_luna_09b": {
    "id": "corazon_vacio_luna_09b", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Hay quienes crecen en la oscuridad y aprenden a amarla. El Tejedor es el Vacío hecho voluntad. No sabe lo que es cerrar. Solo sabe abrir.",
    "next": "corazon_vacio_luna_10"
  },
  "corazon_vacio_luna_10": {
    "id": "corazon_vacio_luna_10", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Ahora tú también lo sabes. El Corazón te ha mostrado lo que vio tu abuelo. Y lo que yo veo desde que llegué aquí.",
    "next": "corazon_vacio_luna_11"
  },
  "corazon_vacio_luna_11": {
    "id": "corazon_vacio_luna_11", "speaker": "Luna", "portrait": null,
    "style": "umbral",
    "text": "Cada grieta que sellaste, cada persona que ayudaste a descansar... eso es cerrar la herida. No con poder. Con presencia.",
    "next": "corazon_vacio_luna_12"
  },
  "corazon_vacio_luna_12": {
    "id": "corazon_vacio_luna_12", "speaker": "", "portrait": null,
    "style": "narrative_float",
    "text": "Luna apoya su frente contra la tuya. Por un instante, ves lo que ella ve: el mundo real, pero con capas. Debajo de cada persona, una sombra de color. Debajo de cada Grieta, una raíz que llega hasta este lugar. Y debajo de todo, un latido. El Corazón del Vacío.",
    "next": "corazon_vacio_luna_end"
  },
  "corazon_vacio_luna_end": {
    "id": "corazon_vacio_luna_end", "speaker": "", "portrait": null,
    "style": "narrative_float",
    "text": "Al abrir los ojos, algo cambió. Ahora puedes ver el color de lo que sienten. No con palabras — con presencia.",
    "next": null,
    "onExit": "saveSystem.setFlag('corazon_vacio_completed', true); saveSystem.setFlag('mateo_echo_reading_unlocked', true); saveSystem.setFlag('corazon_vacio_tutorial_seen', true)"
  }
```

---

## 15. Definición de la nueva zona V_HEART

```javascript
// src/world/zones/ZoneV_HEART.js
export const ZONE_V_HEART = {
  id: 'V_HEART',
  name: 'Corazón del Vacío',
  tileSize: 16,
  grid: [], // sin tilemap — zona abstracta
  palette: {},
  music: 'void_heart_ambient',
  spawns: {
    default: { x: 60, y: 80 },
  },
  exits: [
    { x: 56, y: 72, width: 8, height: 16, targetZone: 'V_HUB', targetSpawn: 'heart_return' },
  ],
  objects: [
    {
      id: 'corazon_piedra',
      x: 120, y: 76, width: 12, height: 12,
      color: '#4A6FA5',
      label: 'Raíz de piedra',
      dialogueId: 'corazon_vacio_fragment_01',
      spawnFlag: 'abuelo_connection_unlocked',
      doneFlag: 'corazon_vacio_frag_01_done',
    },
    {
      id: 'corazon_cenizas',
      x: 140, y: 80, width: 10, height: 8,
      color: '#7A9B6B',
      label: 'Cenizas frías',
      dialogueId: 'corazon_vacio_fragment_02',
      spawnFlag: 'abuelo_connection_unlocked',
      doneFlag: 'corazon_vacio_frag_02_done',
    },
    {
      id: 'corazon_sello',
      x: 100, y: 84, width: 14, height: 6,
      color: '#B84A4A',
      label: 'El primer sello',
      dialogueId: 'corazon_vacio_fragment_03',
      spawnFlag: 'abuelo_connection_unlocked',
      doneFlag: 'corazon_vacio_frag_03_done',
    },
  ],
  // Sin Ecos, sin Rifts — es un lugar de paz
  echoes: [],
  rifts: [],
};
```

---

## 16. Pseudocódigo de EchoReadingSystem

```javascript
// src/systems/EchoReadingSystem.js (esquema conceptual)
export class EchoReadingSystem {
  constructor() {
    this._unlocked = false;
    this._saveSystem = null;
    this._bondSystem = null;
    this._visionSystem = null;
    this._eventBus = null;
    // Mapa emoción → color
    this._emotionColors = {
      sadness:   '#4A6FA5',
      fear:      '#F5E356',
      anger:     '#B84A4A',
      guilt:     '#7A9B6B',
      longing:   '#FFD97D',
      peace:     '#C8A9FF',
    };
  }

  inject({ saveSystem, bondSystem, visionSystem, eventBus }) { /* ... */ }

  // Llamado desde main.js cuando se carga un save o se setea el flag
  checkUnlock() {
    if (this._saveSystem?.getFlag('mateo_echo_reading_unlocked')) {
      this._unlocked = true;
    }
  }

  // Renderiza halos alrededor de Ecos y objetos
  render(ctx, echoes, rifts, objects, camera) {
    if (!this._unlocked) return;

    const bondNormalized = this._bondSystem?.normalized() ?? 1;
    const visionActive   = this._visionSystem?.active ?? false;

    // Ecos
    for (const echo of echoes.getAll()) {
      if (!echo.active || !echo.emotion) continue;
      const color = this._emotionColors[echo.emotion] || '#888888';
      const alpha = visionActive ? 0.55 : 0.25;
      const adjustedAlpha = alpha * bondNormalized;

      ctx.globalAlpha = adjustedAlpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(echo.centerX() - camera.x, echo.centerY() - camera.y,
              (echo.width / 2) + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Objetos cerca de Grietas
    for (const rift of rifts.getAll()) {
      if (!rift.active || rift.sealed || !rift.emotion) continue;
      for (const obj of objects) {
        const dist = Math.hypot(obj.x - rift.x, obj.y - rift.y);
        if (dist > 60) continue;

        const color = this._emotionColors[rift.emotion] || '#888888';
        ctx.globalAlpha = visionActive ? 0.35 : 0.15;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x - camera.x, obj.y - camera.y,
                       obj.width ?? 16, obj.height ?? 16);
        ctx.globalAlpha = 1;
      }
    }
  }
}
```

---

## 17. Resumen de implementación

### Orden recomendado de implementación

1. Crear `EchoReadingSystem.js` (sistema pasivo)
2. Modificar `main.js` para integrarlo
3. Crear `ZoneV_HEART.js` (zona)
4. Modificar `ZoneV_HUB.js` (añadir exit condicional)
5. Añadir nodos de diálogo a `dialogues.json`
6. Modificar `SceneManager.js` (registrar zona)
7. Añadir lógica de detección de fragmentos completados en `ZoneV_HEART.js`
8. Testing

### Dependencias entre archivos

```
main.js
  ├── import EchoReadingSystem from './systems/EchoReadingSystem.js'
  ├── import { ZONE_V_HEART } from './world/zones/ZoneV_HEART.js'
  └── sceneManager.register(ZONE_V_HEART)

ZoneV_HUB.js
  └── añade exit { targetZone: 'V_HEART', condition: 'abuelo_connection_unlocked' }

dialogues.json
  └── añade 25 nodos nuevos (IDs corazon_vacio_*)

EchoReadingSystem.js
  └── depende de: SaveSystem (flags), BondSystem (normalized), VisionSystem (active)
```

---

*Documento generado como parte de la sesión de diseño de mecánicas.*
*Versión: 1.1 — Añadida sección 2.5 Narrativa: historia del Eco colectivo, 5 nodos post-secuencia, consecuencias narrativas y verificación de flags con el lore existente.*
