# Propuesta de diseño — M07: "La tumba vacía"

## 1. Resumen

**Nombre:** La tumba vacía  
**Zona:** Cementerio de Miraloma (R_CEMETERY / V_CEMETERY)  
**Tipo:** Emocional profunda / puzzle de objetos resonantes / consecuencias duales  
**Duración estimada:** 25–35 minutos de juego  
**Desbloquea:** Habilidad "Eco-localización" para Luna (nueva mecánica de rastreo)  
**NPC nuevo:** Sra. Emilia (anciana del pueblo, aparece en R_HUB y R_CEMETERY)  
**Eco nuevo:** Eco de un niño llamado **Tomás** (Atado, en V_CEMETERY)

---

## 2. Trigger y activación

### Condiciones de activación
- M05 (Dos hermanos, una promesa) debe estar **completada** (flag: `mission_brothers_done`)
- El jugador debe haber entrado al cementerio al menos una vez después de completar M05
- Aparece un nuevo NPC en R_HUB: **Sra. Emilia**, una mujer mayor que busca a su hijo

### Diálogo de trigger (nuevos nodos en dialogues.json)

```
"emilia_m07_trigger": {
  "id": "emilia_m07_trigger", "speaker": "Sra. Emilia", "portrait": "emilia_worried",
  "text": "Disculpa, muchacho... ¿has visto a un niño por aquí? Se llama Tomás. Tiene tu edad.",
  "condition": "flag:mission_brothers_done",
  "next": "emilia_m07_02"
},
"emilia_m07_02": {
  "id": "emilia_m07_02", "speaker": "mateo", "portrait": "mateo_curious",
  "text": "¿Tomás? No... no lo conozco. ¿Es nuevo en el pueblo?",
  "next": "emilia_m07_03"
},
"emilia_m07_03": {
  "id": "emilia_m07_03", "speaker": "Sra. Emilia", "portrait": "emilia_sad",
  "text": "No, no es nuevo. Es mi hijo. Desapareció hace treinta años en el cementerio. La policía dijo que se perdió, que se cayó al acantilado... pero yo nunca encontré su cuerpo.",
  "next": "emilia_m07_04"
},
"emilia_m07_04": {
  "id": "emilia_m07_04", "speaker": "Sra. Emilia", "portrait": "emilia_hopeful",
  "text": "Anoche soñé con él. Me dijo que estaba en un lugar frío, esperando a que alguien lo encontrara. Y esta mañana... esta mañana encontré esto en mi bolsillo.",
  "next": "emilia_m07_show_item"
},
"emilia_m07_show_item": {
  "id": "emilia_m07_show_item", "speaker": "mateo", "portrait": "mateo_thoughtful",
  "text": "Una piedra. Tiene algo escrito... 'T + E = siempre'.",
  "next": "emilia_m07_choice"
},
"emilia_m07_choice": {
  "id": "emilia_m07_choice", "speaker": "Sra. Emilia", "portrait": "emilia_pleading",
  "text": "Sé que suena a locura de vieja. Pero tú tienes fama de encontrar cosas que otros no ven. ¿Puedes ir al cementerio y buscar?",
  "choices": [
    { "label": "Voy a buscar a Tomás.", "next": "emilia_m07_accept", "onExit": "missionManager.activate('cemetery_child'); inventory.addItem('I_piedra_emilia')" },
    { "label": "Quizás solo fue un sueño.", "next": "emilia_m07_dismiss" }
  ]
},
"emilia_m07_accept": {
  "id": "emilia_m07_accept", "speaker": "Sra. Emilia", "portrait": "emilia_grateful",
  "text": "Gracias, muchacho. Tomás siempre fue curioso. Si está en algún lado, seguro que encontraste la manera de llegar.",
  "next": null
},
"emilia_m07_dismiss": {
  "id": "emilia_m07_dismiss", "speaker": "Sra. Emilia", "portrait": "emilia_sad",
  "text": "Puede ser. Pero una madre sabe cuando su hijo la está llamando.",
  "next": null
}
```

---

## 3. Flujo de la misión

### Paso 0 — Trigger (completado arriba)
El jugador habla con Emilia en R_HUB. Ella entrega la **piedra grabada** (item `I_piedra_emilia`). La misión se activa.

### Paso 1 — Investigar el cementerio real (R_CEMETERY)
- Al entrar a R_CEMETERY con la misión activa, Luna se sienta frente a una lápida específica en la **esquina noreste** (tile 16, 3).
- La lápida no tiene nombre. Solo una fecha: "1987 – 1995".
- Si el jugador usa **Visión felina** sobre la lápida, ve un rastro tenue que lleva hacia el muro norte.
- Al inspeccionar el muro norte con Visión felina activa, Mateo descubre una **grieta oculta** (nueva: `G_cemetery_child`), visible solo con visión felina en el mundo real.

**Evento:** `rift:discovered` → avanza a paso 2.

### Paso 2 — Entrar al Vacío del cementerio (V_CEMETERY)
- La grieta `G_cemetery_child` lleva al V_CEMETERY, pero a una **subzona nueva**: una sección del cementerio en el Vacío que antes estaba bloqueada por una barrera de Ecos de **culpa** (emotion: `guilt`).
- La barrera se disipa automáticamente cuando el jugador tiene el item `I_piedra_emilia` en el inventario (la piedra actúa como "pase emocional").
- Al fondo de esta sección, el jugador encuentra al **Eco de Tomás** (EchoBound, id: `echo_tomas`).

### Paso 3 — Encontrar al Eco de Tomás
- Tomás es un niño de 8 años (apariencia fantasmagórica, ropa de los 90s). No sabe que está muerto.
- Cree que "solo se perdió en el cementerio" y que su mamá va a venir a buscarlo.
- Está sentado junto a un **árbol seco** que en el Vacío tiene un columpio.

**Diálogo clave:**

```
"tomas_echo_encounter": {
  "id": "tomas_echo_encounter", "speaker": "Tomás", "portrait": "tomas_curious",
  "text": "¿Eres el que iba a venir? Mi mamá dijo que alguien vendría.",
  "next": "tomas_echo_02"
},
"tomas_echo_02": {
  "id": "tomas_echo_02", "speaker": "mateo", "portrait": "mateo_gentle",
  "text": "Tu mamá me pidió que te buscara. ¿Cuánto tiempo llevas aquí?",
  "next": "tomas_echo_03"
},
"tomas_echo_03": {
  "id": "tomas_echo_03", "speaker": "Tomás", "portrait": "tomas_confused",
  "text": "No sé. Mucho. Perdí la cuenta. Al principio venía gente a buscarme pero dejaron de venir. Ahora solo vienen las sombras.",
  "next": "tomas_echo_04"
},
"tomas_echo_04": {
  "id": "tomas_echo_04", "speaker": "mateo", "portrait": "mateo_soft",
  "text": "Tomás... ¿quieres volver a casa?",
  "next": "tomas_echo_choice"
},
"tomas_echo_choice": {
  "id": "tomas_echo_choice", "speaker": "Tomás", "portrait": "tomas_hopeful",
  "text": "¿Puedo? Mi mamá me va a retar por llegar tarde.",
  "choices": [
    { "label": "Tu mamá te está esperando. Vamos.", "next": "tomas_echo_follow_A" },
    { "label": "Necesito encontrar algo tuyo primero. ¿Recuerdas lo que traías?", "next": "tomas_echo_follow_B" }
  ]
}
```

### Paso 4 — El objeto-ancla: el collar de Tomás
- Tomás recuerda que traía un **collar con una concha marina** que Emilia le regaló.
- Lo perdió "cuando las sombras lo atraparon".
- El collar está en el Vacío, cerca de la entrada original de la grieta (en la sección bloqueada antes por la barrera de culpa).
- El jugador debe recogerlo (item `I_collar_tomas`).

**Evento:** `item:picked` con `I_collar_tomas` → avanza a paso 4 (si ya se eligió la opción A) o permite la opción B.

### Paso 5 — La resolución (2 caminos)

#### Resolución A — "Volver a casa" (protectora)
Mateo le dice a Tomás que lo va a llevar con su mamá. Toma el collar y vuelve al mundo real.
- En R_CEMETERY, Mateo entierra el collar bajo el árbol seco (el mismo del Vacío, pero en el mundo real es un árbol vivo).
- **Consecuencia visible:** El árbol florece instantáneamente con flores blancas. Aparece una placa nueva en la base: "Tomás — 1987–1995 — Siempre en el corazón de Miraloma".
- Emilia encuentra la placa al día siguiente (diálogo de cierre).
- **Efecto en el mundo:** El cementerio se vuelve un lugar más cálido. Los Ecos menores de culpa en V_CEMETERY desaparecen permanentemente.
- **Habilidad desbloqueada:** Luna aprende **Eco-localización** — al activarla (tecla Q + Shift), Luna emite un maullido grave que revela la posición de todos los Ecos y objetos resonantes en la pantalla actual, incluso sin Visión felina activa. Dura 3 segundos, recarga 15 segundos.

#### Resolución B — "La verdad" (honesta)
Mateo le dice a Tomás que no puede volver, porque ya no está vivo. Le muestra el collar y le explica que su mamá lo ha estado esperando 30 años.
- Tomás llora, pero entiende. Pide que le devuelvan el collar a su mamá.
- Mateo vuelve al mundo real y le entrega el collar a Emilia personalmente.
- **Consecuencia visible:** Emilia llora pero sonríe. Al día siguiente, Emilia aparece en R_CEMETERY sentada junto al árbol, con el collar en las manos. Habla con Mateo y le agradece. El árbol no florece, pero Emilia deja de estar triste.
- **Efecto en el mundo:** Emilia se convierte en **NPC recurrente** que da pistas sobre otras Grietas ocultas. Además, el Eco de Tomás se disuelve en paz, lo que **reduce permanentemente la densidad de Ecos en todo V_CEMETERY** (menos encuentros de combate).
- **Habilidad desbloqueada:** Mateo desbloquea **Memoria Compartida Mejorada** — al tocar cualquier objeto resonante, puede ver no solo el evento que lo cargó, sino también **el contexto emocional completo** (3 segundos extra de visión, colores más vívidos). Esto revela secretos adicionales en otras zonas.

---

## 4. Sistemas involucrados

| Sistema | Qué hace |
|---------|----------|
| **MissionManager** | Registra y controla el flujo de pasos de `cemetery_child` |
| **DialogueSystem** | 15+ nodos nuevos para Emilia, Tomás, y resolución |
| **SaveSystem** | Flags: `mission_cemetery_child_done`, `m07_resolution`, `m07_tree_flowered`, `emilia_ally`, `echo_location_unlocked`, `memory_share_upgraded` |
| **RiftSystem** | Nueva grieta `G_cemetery_child` (major, emotion: `guilt`) |
| **EchoManager** | Nuevo EchoBound `echo_tomas` + 4 EchoMinor de culpa como guardianes |
| **BondSystem** | La resolución B otorga +10 de bond permanente (por la honestidad emocional) |
| **VisionSystem** | La habilidad Eco-localización se integra como un overlay temporal |
| **World (zonas)** | Modificaciones a R_CEMETERY y V_CEMETERY (árbol, placa, barrera) |
| **EventBus** | Eventos: `m07:tree_flowered`, `m07:emilia_comforted` |

---

## 5. Archivos a crear

| Archivo | Contenido |
|---------|-----------|
| `src/missions/data/mission_07_cemetery_child.js` | Clase `Mission07CemeteryChild` extendiendo `MissionBase` |
| `assets/sprites/emilia.png` | Sprite de Sra. Emilia (placeholder: usar `_makePortrait`) |
| `assets/sprites/tomas.png` | Sprite de Tomás (placeholder: usar sprite de Mateo con tinte) |

## 6. Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/main.js` | Importar y registrar `Mission07CemeteryChild` (línea 39, línea 123) |
| `src/main.js` | Agregar `'cemetery_child'` al array de misiones activas en HUD (línea 892) |
| `src/main.js` | Agregar `'mission_cemetery_child_done'` al conteo de ending (línea 567) |
| `src/main.js` | Agregar sprite loading para `emilia` y `tomas` (línea 598) |
| `src/main.js` | Agregar portraít mapping para Emilia y Tomás (sección de portraíts) |
| `src/main.js` | Agregar evento `zone:loaded` para spawn condicional de Emilia en R_HUB |
| `src/main.js` | Agregar evento `zone:loaded` para el árbol florecido en R_CEMETERY |
| `src/main.js` | Agregar lógica de `zone:loaded` para la barrera de culpa en V_CEMETERY |
| `src/main.js` | Agregar handler para la habilidad Eco-localización en el update loop |
| `src/world/zones/ZoneR_CEMETERY.js` | Agregar NPC `emilia` (post-resolución), objeto `arbol_seco` interactivo, grieta `G_cemetery_child` |
| `src/world/zones/ZoneV_CEMETERY.js` | Agregar EchoBound `echo_tomas`, 4 EchoMinor guardianes de culpa, objeto `I_collar_tomas` |
| `assets/data/dialogues.json` | Agregar ~20 nodos de diálogo nuevos (prefijo `emilia_m07_*` y `tomas_echo_*`) |

---

## 7. Flags nuevos (verificar que no existan)

```
mission_cemetery_child_active
mission_cemetery_child_done
m07_resolution              → 'A' | 'B'
m07_tree_flowered
m07_emilia_comforted
emilia_ally
echo_location_unlocked
memory_share_upgraded
rift_G_cemetery_child_sealed
piedra_emilia_found
collar_tomas_found
tomas_echo_met
```

---

## 8. Por qué esta misión aumenta la retención

1. **Conexión emocional con M05:** Ambas misiones ocurren en el cementerio y tratan sobre pérdidas familiares. Completar M05 hace que el jugador esté emocionalmente preparado para M07, y M07 profundiza el tema del duelo desde el lado de **la madre que espera**, no del hermano que se fue.

2. **Habilidad nueva con impacto en gameplay:** La Eco-localización de Luna cambia cómo el jugador explora zonas ya visitadas. Invita a re-explorar el mapa completo para encontrar secretos que antes eran invisibles.

3. **Dos resoluciones con consecuencias visibles y distintas:**
   - **Resolución A** (protectora): Cambio visual inmediato y hermoso (el árbol florece). Recompensa emocional instantánea.
   - **Resolución B** (honesta): Recompensa a largo plazo (Emilia como aliada + habilidad mejorada). Premia al jugador que busca profundidad narrativa.

4. **El árbol florecido es permanente y visible desde lejos:** Cualquier jugador que entre al cementerio después de la misión verá el cambio. Esto refuerza el principio de diseño #3: "Las decisiones dejan huella visible permanente".

5. **No requiere assets nuevos complejos:** Usa sprites existentes (Mateo con tinte para Tomás, placeholder para Emilia). La implementación es 100% código y datos.

---

## 9. Notas de implementación

- La barrera de culpa en V_CEMETERY se implementa como 4 EchoMinor con `emotion: 'guilt'` y `guard: true`, igual que los guardianes de M05 pero con condición de spawn basada en `has_item:I_piedra_emilia` en lugar de `mission_brothers_active`.
- El árbol florecido se implementa como un tilemap overlay: al cargar R_CEMETERY, si `m07_tree_flowered` es true, se pinta un tile especial en la posición del árbol.
- La habilidad Eco-localización se implementa como un método nuevo en `VisionSystem`: `pulseEchoLocation()` que itera sobre todos los Ecos registrados en `EchoManager` y dibuja un pulso circular durante 3 segundos.
- La placa de Tomás es un objeto interactivo con diálogo de inspección que cambia según la resolución.

---

## 10. Narrativa

### 10.1 Historia del Eco — Tomás

Tomás tenía ocho años cuando desapareció en el cementerio de Miraloma. Era un niño que hablaba solo, no porque no tuviera amigos, sino porque el mundo le parecía más real cuando lo describía en voz alta. Su madre, Emilia, le había regalado un collar con una concha marina la semana antes — "para que el mar nunca se olvide de ti", le dijo. Tomás lo llevaba puesto siempre, incluso para trepar árboles, incluso para meterse entre las lápidas viejas donde le gustaba jugar a "explorador".

Lo que nadie supo es que Tomás sí encontró algo, aquella tarde. No un tesoro ni una cueva secreta. Encontró una grieta. Pequeña, violeta, palpitante como un ojo entre las piedras del muro norte. Los niños ven lo que los adultos han aprendido a ignorar, y Tomás vio aquella luz y metió la mano. El Vacío no lo mató — el Vacío lo atrapó. Lo envolvió tan despacio que Tomás ni siquiera supo que había cruzado. Creyó que se había perdido en el cementerio, que si esperaba sentado junto al árbol seco, su mamá vendría a buscarlo. Treinta años después, sigue esperando.

En el Vacío, Tomás no envejeció. Sigue siendo un niño de ocho años con la ropa de los noventa, sentado bajo un árbol que en esta dimensión tiene un columpio oxidado. No sabe que está muerto. Cree que "las sombras" que a veces lo rodean son animales del cementerio. Cuando ve a Mateo, no se sorprende — su mamá le dijo que alguien vendría. Y si alguien viene, piensa Tomás, es porque puede llevarlo a casa. Lo único que le queda es la certeza de que su mamá lo está esperando. Esa certeza es lo que lo ha mantenido entero treinta años en un lugar donde el tiempo no existe.

### 10.2 Nodos de diálogo nuevos (formato JSON)

Los siguientes nodos complementan los ya definidos en la sección 2 y 3. Se agregan con los prefijos `emilia_m07_*` (diálogos de cierre) y `tomas_echo_*` (encuentro en el Vacío y resolución).

```json
{
  "id": "tomas_echo_follow_A",
  "speaker": "Tomás",
  "portrait": "tomas_hopeful",
  "text": "¿En serio? ¿Ahora? Le prometí a mi mamá que no me alejaría mucho...",
  "next": "tomas_echo_A_02"
},
{
  "id": "tomas_echo_A_02",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "Ahora. Pero necesito algo tuyo para que el camino funcione. ¿Recuerdas lo que traías cuando llegaste aquí?",
  "next": "tomas_echo_A_collar"
},
{
  "id": "tomas_echo_A_collar",
  "speaker": "Tomás",
  "portrait": "tomas_sad",
  "text": "Mi collar. El de la concha. Mi mamá me lo dio. Lo perdí cuando las sombras me atraparon la primera vez.",
  "next": "tomas_echo_A_collar_02"
},
{
  "id": "tomas_echo_A_collar_02",
  "speaker": "mateo",
  "portrait": "mateo_determined",
  "text": "Voy a buscarlo. Espérame aquí.",
  "next": null,
  "onExit": "missionManager.setStep('cemetery_child', 4)"
},
{
  "id": "tomas_echo_follow_B",
  "speaker": "Tomás",
  "portrait": "tomas_confused",
  "text": "¿Algo mío? Traía mi collar. El de la concha. Mi mamá dice que las conchas guardan el sonido del mar.",
  "next": "tomas_echo_B_02"
},
{
  "id": "tomas_echo_B_02",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "¿Dónde lo perdiste?",
  "next": "tomas_echo_B_03"
},
{
  "id": "tomas_echo_B_03",
  "speaker": "Tomás",
  "portrait": "tomas_scared",
  "text": "Cerca de la entrada. Cuando las sombras me rodearon. Sentí frío y cuando desperté ya no lo tenía.",
  "next": "tomas_echo_B_04"
},
{
  "id": "tomas_echo_B_04",
  "speaker": "mateo",
  "portrait": "mateo_determined",
  "text": "Voy a encontrarlo. Tú quédate aquí, ¿sí? No te muevas.",
  "next": null,
  "onExit": "missionManager.setStep('cemetery_child', 4)"
},
{
  "id": "tomas_echo_resolution_A",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "Tomás. Encontré tu collar. Y encontré el camino de vuelta. Tu mamá te está esperando.",
  "next": "tomas_echo_res_A_02",
  "condition": "has_item:I_collar_tomas"
},
{
  "id": "tomas_echo_res_A_02",
  "speaker": "Tomás",
  "portrait": "tomas_hopeful",
  "text": "¿De verdad? ¿Voy a ver a mi mamá?",
  "next": "tomas_echo_res_A_03"
},
{
  "id": "tomas_echo_res_A_03",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Vas a verla. Pero primero tengo que enterrar esto donde empezó todo. Para que el camino se abra.",
  "next": "tomas_echo_res_A_04"
},
{
  "id": "tomas_echo_res_A_04",
  "speaker": "Tomás",
  "portrait": "tomas_peaceful",
  "text": "Está bien. Yo espero. Siempre espero.",
  "next": null,
  "onExit": "saveSystem.setFlag('m07_resolution', 'A'); missionManager.setStep('cemetery_child', 5)"
},
{
  "id": "tomas_echo_resolution_B",
  "speaker": "mateo",
  "portrait": "mateo_serious",
  "text": "Tomás... tengo tu collar. Pero no puedo llevarte a casa.",
  "next": "tomas_echo_res_B_02",
  "condition": "has_item:I_collar_tomas"
},
{
  "id": "tomas_echo_res_B_02",
  "speaker": "Tomás",
  "portrait": "tomas_confused",
  "text": "¿Por qué? ¿Está roto el camino?",
  "next": "tomas_echo_res_B_03"
},
{
  "id": "tomas_echo_res_B_03",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "No. El camino está bien. Pero tú... Tomás, pasó mucho tiempo. Treinta años. Tu mamá te ha estado esperando todo este tiempo.",
  "next": "tomas_echo_res_B_04"
},
{
  "id": "tomas_echo_res_B_04",
  "speaker": "Tomás",
  "portrait": "tomas_realizing",
  "text": "...¿Treinta años? Pero yo solo... solo estaba esperando.",
  "next": "tomas_echo_res_B_05"
},
{
  "id": "tomas_echo_res_B_05",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Lo sé. Y ella también te esperó. Todos los días. Pero tú no puedes volver, Tomás. No como antes.",
  "next": "tomas_echo_res_B_06"
},
{
  "id": "tomas_echo_res_B_06",
  "speaker": "Tomás",
  "portrait": "tomas_crying",
  "text": "¿Entonces no voy a verla nunca más?",
  "next": "tomas_echo_res_B_07"
},
{
  "id": "tomas_echo_res_B_07",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Ella te va a ver a ti. En el collar. En el árbol donde esperabas. En cada concha que el mar traiga a la orilla. Y yo le voy a contar que estás bien. Que ya no hace frío.",
  "next": "tomas_echo_res_B_08"
},
{
  "id": "tomas_echo_res_B_08",
  "speaker": "Tomás",
  "portrait": "tomas_crying_soft",
  "text": "...¿Se lo vas a decir? ¿Que esperé?",
  "next": "tomas_echo_res_B_09"
},
{
  "id": "tomas_echo_res_B_09",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "Se lo voy a decir. Y ella va a saber que no dejaste de esperarla ni un segundo.",
  "next": "tomas_echo_res_B_10"
},
{
  "id": "tomas_echo_res_B_10",
  "speaker": "Tomás",
  "portrait": "tomas_peaceful",
  "text": "Está bien. Entonces... llévale el collar. Dile que lo usé todo el tiempo. Hasta que las sombras me lo quitaron.",
  "next": "tomas_echo_res_B_end"
},
{
  "id": "tomas_echo_res_B_end",
  "speaker": "Tomás",
  "portrait": "tomas_fading",
  "text": "Y dile que el mar sí se acordó de mí.",
  "next": null,
  "onExit": "saveSystem.setFlag('m07_resolution', 'B'); missionManager.setStep('cemetery_child', 5); inventory.addItem('I_collar_tomas')"
},
{
  "id": "emilia_m07_closure_A",
  "speaker": "Sra. Emilia",
  "portrait": "emilia_at_tree",
  "text": "Encontré la placa esta mañana. Debajo del árbol. 'Siempre en el corazón de Miraloma'.",
  "next": "emilia_m07_closure_A_02",
  "condition": "flag:m07_tree_flowered"
},
{
  "id": "emilia_m07_closure_A_02",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "Él está bien. Ya no está perdido.",
  "next": "emilia_m07_closure_A_03"
},
{
  "id": "emilia_m07_closure_A_03",
  "speaker": "Sra. Emilia",
  "portrait": "emilia_crying_warm",
  "text": "Lo sé. El árbol floreció anoche. No florecía desde que él desapareció. Gracias, Mateo.",
  "next": null,
  "onExit": "missionManager.complete('cemetery_child'); saveSystem.setFlag('mission_cemetery_child_done', true)"
},
{
  "id": "emilia_m07_closure_B",
  "speaker": "Sra. Emilia",
  "portrait": "emilia_at_tree",
  "text": "Esto es suyo. Es su collar. Lo reconocería en cualquier lado.",
  "next": "emilia_m07_closure_B_02",
  "condition": "flag:m07_emilia_comforted"
},
{
  "id": "emilia_m07_closure_B_02",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Me pidió que se lo diera. Dijo que el mar sí se acordó de usted.",
  "next": "emilia_m07_closure_B_03"
},
{
  "id": "emilia_m07_closure_B_03",
  "speaker": "Sra. Emilia",
  "portrait": "emilia_crying_warm",
  "text": "Siempre supe que no estaba muerto. No como los demás dicen. Estaba esperando. Mi niño estaba esperando.",
  "next": "emilia_m07_closure_B_04"
},
{
  "id": "emilia_m07_closure_B_04",
  "speaker": "Sra. Emilia",
  "portrait": "emilia_resolved",
  "text": "Ahora puedo descansar. Los dos podemos.",
  "next": null,
  "onExit": "missionManager.complete('cemetery_child'); saveSystem.setFlag('mission_cemetery_child_done', true); saveSystem.setFlag('emilia_ally', true)"
}
```

### 10.3 Consecuencia visible al completar la misión

**Resolución A (protectora):** El árbol seco en la esquina noreste de R_CEMETERY florece con flores blancas instantáneamente. Aparece una placa de madera en su base con el texto: "Tomás — 1987–1995 — Siempre en el corazón de Miraloma". La placa es un objeto interactivo permanente que, al inspeccionarlo, muestra un diálogo de Mateo que varía según el momento del día. El cementerio entero cambia de paleta: la luz se vuelve ligeramente más cálida, los tonos grises se suavizan. Los Ecos menores de emoción `guilt` en V_CEMETERY desaparecen permanentemente. Cualquier jugador que entre al cementerio después de la misión verá el árbol florecido desde la entrada.

**Resolución B (honesta):** El árbol no florece. En su lugar, Emilia aparece en R_CEMETERY sentada en una banca junto al árbol, con el collar de Tomás en las manos. Es un NPC permanente con diálogos que evolucionan: al principio solo agradece, luego empieza a dar pistas sobre otras Grietas ocultas en el pueblo ("Hay un lugar en la escuela donde los niños lloraban en silencio", "El faro guarda más secretos de los que Antonio se llevó"). La densidad de Ecos en V_CEMETERY se reduce en un 40% (menos encuentros de combate). Emilia se convierte en un recurso narrativo recurrente que recompensa al jugador que eligió la honestidad emocional.

### 10.4 Flags necesarios (verificados contra `game_states.md`)

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mission_cemetery_child_active` | bool | false | M07 activada |
| `mission_cemetery_child_done` | bool | false | M07 completada |
| `m07_resolution` | enum | null | `'A'` (protectora) o `'B'` (honesta) |
| `m07_tree_flowered` | bool | false | Árbol floreció (resolución A) |
| `m07_emilia_comforted` | bool | false | Emilia recibió el collar (resolución B) |
| `emilia_ally` | bool | false | Emilia es NPC aliada que da pistas |
| `echo_location_unlocked` | bool | false | Habilidad Eco-localización de Luna desbloqueada |
| `memory_share_upgraded` | bool | false | Memoria Compartida mejorada desbloqueada |
| `rift_G_cemetery_child_sealed` | bool | false | Grieta del cementerio sellada |
| `piedra_emilia_found` | bool | false | Piedra grabada recogida |
| `collar_tomas_found` | bool | false | Collar de Tomás encontrado en el Vacío |
| `tomas_echo_met` | bool | false | Mateo habló con el Eco de Tomás |

**Nota de verificación:** Ninguno de estos flags existe en `game_states.md` (secciones 2–8). Todos son nuevos. El flag `memory_share_unlocked` (M05) ya existe — el nuevo `memory_share_upgraded` es distinto y representa una mejora sobre la habilidad base.

### 10.5 Conexión con el lore existente

- **Conexión con M05 (Dos hermanos):** Ambas misiones ocurren en el cementerio y tratan el duelo desde ángulos complementarios. M05 aborda la pérdida desde la perspectiva del hermano que queda; M07 aborda la pérdida desde la perspectiva de la madre que espera. Juntas forman un díptico sobre el duelo familiar. La condición de activación (`mission_brothers_done`) asegura que el jugador haya procesado emocionalmente el cementerio antes de enfrentar la historia de Tomás.

- **Conexión con el lore del Vacío (sección 3 de `grietas_lore.md`):** Tomás es un Atado clásico — murió con una deuda emocional pendiente (la promesa de volver a casa). Su permanencia de 30 años en el Vacío es consistente con la regla de que "los Ecos no pueden salir al mundo real completamente, solo proyectar influencia a través de Grietas". La piedra de Emilia funciona como objeto-ancla porque contiene su amor incondicional, que es la emoción opuesta a la culpa que mantiene la Grieta abierta.

- **Conexión con el principio de diseño #3:** Ambas resoluciones dejan huella visible permanente. El árbol florecido (A) es un cambio visual dramático y hermoso. Emilia como NPC aliada (B) es un cambio en el elenco de personajes del mundo. Ninguna resolución es "mejor" que la otra — ofrecen recompensas distintas para estilos de juego distintos.

- **Conexión con el sistema de ending (sección 12 de `game_states.md`):** La función `determineEnding()` deberá actualizarse para incluir `mission_cemetery_child_done` en el conteo de misiones completadas (pasaría de 6 a 7). La resolución B (`m07_resolution = 'B'`) podría contar como "resolución profunda" adicional, similar a `diego_resolution !== 'A'`.
