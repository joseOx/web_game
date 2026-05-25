# Propuesta de implementación: VoidFogSystem — Niebla ambiental del Vacío

**Fecha:** 2025-07-17  
**Autor:** Game Designer Senior  
**Archivo creado:** `src/effects/VoidFogSystem.js`  
**Archivos modificados:** `src/main.js` (5 puntos de integración)

---

## 1. Problema detectado

El Vacío se siente visualmente plano. Aunque `LightingSystem` aplica un tinte violeta oscuro (`rgba(26, 20, 40, 0.45)`) y las zonas tienen paletas frías (`#1A1828`, `#2A2838`, `#252040`), **no hay movimiento ambiental**. comparado con el mundo real, el Vacío carece de un elemento visual que transmita su naturaleza de "dimensión suspendida, melancólica y en movimiento perpetuo".

El `ParticleSystem` existente es genérico (explosiones de corta duración con gravedad). No sirve para atmósfera persistente.

---

## 2. Solución: VoidFogSystem

### 2.1 Descripción funcional

Sistema independiente que genera y renderiza **40 partículas de niebla persistentes** que:
- **Solo se activan en la dimensión Vacío** (auto-detectado vía `DimensionManager.current`)
- Se **desplazan horizontalmente de izquierda a derecha** a velocidad muy lenta (10-30 px/s)
- Tienen **tamaño grande** (30-80 px de radio) — ocupan porciones significativas de la pantalla
- **Transparencia variable pulsante** (alpha base 0.08-0.12 con oscilación sinusoidal 0.7-1.0x)
- **Colores fríos** de la paleta del Vacío: `#2A1E3C`, `#3A2850`, `#1E2840`, `#252040`, `#181530`
- **Ondulación vertical sinusoidal** para movimiento orgánico no lineal
- Usan un **tile pre-renderizado** (círculo suave radial gradient en canvas offscreen) para evitar degradado por frame
- **Frustum culling** para no dibujar partículas fuera de pantalla
- Se **reciclan automáticamente** al salir por el borde derecho, reapareciendo por la izquierda

### 2.2 Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Violeta profundo | `#2A1E3C` | Niebla densa de fondo |
| Violeta medio | `#3A2850` | Niebla de capa media |
| Azul violáceo oscuro | `#1E2840` | Niebla fría |
| Gris violeta | `#252040` | Empareja con paletas ZoneV_* existentes |
| Casi negro violáceo | `#181530` | Niebla de sombra |

### 2.3 Capa de renderizado

La niebla se renderiza **entre el tilemap y las entidades** (`rifts`, `particles`, `echoes`, personajes):

```
Orden de render (worldRender):
  1. world.render()          ← tiles + NPCs
  2. voidFog.render()        ← NIEBLA (nuevo)
  3. rifts.render()
  4. particles.render()
  5. echoes.render()
  6. luna.render()
  7. mateo.render()
  ...
```

Esto asegura que la niebla tape ligeramente el suelo del Vacío pero los personajes, grietas y ecos estén **por encima**, dando profundidad.

---

## 3. Sistemas involucrados

| Sistema | Relación |
|---------|----------|
| `DimensionManager` | Inyectado vía `.inject({ dimension })`. `voidFog` lee `dimension.current` cada frame para auto-activarse. |
| `EventBus` | Escucha `dimension:changed` para sincronizarse manualmente también (redundancia segura). |
| `ParticleSystem` | No modificado. `VoidFogSystem` es complementario: uno para explosiones, otro para atmósfera. |
| `Camera` | Pasado como tercer argumento al render para coordenadas de pantalla. |

---

## 4. Archivos creados/modificados

### Creado: `src/effects/VoidFogSystem.js`
- 237 líneas, 6.6 KB
- Exporta clase `VoidFogSystem`
- Métodos: `inject()`, `setActive()`, `onDimensionChange()`, `update(dt)`, `render(ctx, alpha, camera)`, `destroy()`
- Pool de 40 partículas persistentes con reciclado automático

### Modificado: `src/main.js`
5 puntos de integración:

1. **Línea 75** — Import: `import { VoidFogSystem } from './effects/VoidFogSystem.js';`
2. **Línea 109** — Instancia: `export const voidFog = new VoidFogSystem();`
3. **Línea 164** — Inyección: `voidFog.inject({ dimension });`
4. **Línea 212** — Evento dimensión: `voidFog.onDimensionChange(dim);` dentro del handler `dimension:changed`
5. **Línea 1162** — Update loop: `voidFog.update(dt);` en `worldUpdate`
6. **Línea 1328** — Render loop: `voidFog.render(ctx, alpha, camera);` en `worldRender` (entre world y rifts)

---

## 5. Duración estimada de implementación

| Paso | Tiempo |
|------|--------|
| Análisis de código existente | 15 min |
| Escritura de VoidFogSystem.js | 25 min |
| Integración en main.js (5 puntos) | 10 min |
| Pruebas de concepto | — (sin ejecutar) |
| **Total** | **~50 min** |

---

## 6. Notas de diseño adicionales

### 6.1 Por qué no extender ParticleSystem
El `ParticleSystem` existente usa partículas de corta duración (0.4-0.8s) con gravedad (`vy += 60 * s`). Está diseñado para **explosiones visuales** al sellar grietas (`particles.emit(data.x, data.y, color, 30)`). Extenderlo habría requerido cambiar su comportamiento fundamental (desactivar gravedad, aumentar vida, cambiar dirección, etc.) y afectaría su uso actual. Un sistema separado es más limpio y no rompe nada existente.

### 6.2 Futuras expansiones posibles
- **Bandas de niebla por zona**: Cada zona V_* podría definir su densidad/tono de niebla (ej: V_CEMETERY más denso, V_BEACH más azulado)
- **Reacción al vínculo**: La velocidad/opacidad de la niebla podría aumentar cuando el bond está en DANGER/CRITICAL
- **Interacción con Luna**: Luna podría "disipar" niebla al pasar cerca (visibilidad temporal)
- **Niebla de dos capas**: Una capa trasera (detrás de todo) y una frontal (delante de personajes pero detrás del HUD)

### 6.3 Performance
40 partículas con pre-renderizado de tile en canvas offscreen + frustum culling = impacto mínimo. El gradiente radial se calcula una sola vez en `_initFogTile()`. Por frame solo se hace un `drawImage` escalado por partícula activa.

---

## 7. Resumen

Se creó `src/effects/VoidFogSystem.js` que genera niebla ambiental persistente para la dimensión Vacío, con partículas grandes de movimiento horizontal lento, colores fríos y transparencia pulsante. Se integró en `src/main.js` en 5 puntos: import, instancia, inyección de dependencias, evento de cambio de dimensión, update loop y render loop (entre tilemap y entidades).

---

## 8. Narrativa

### 8.1 Historia de la Dama de la Niebla — el Eco que se olvidó a sí mismo

La niebla del Vacío no es un fenómeno natural. Es lo que queda de los Ecos que se disolvieron completamente: memorias que perdieron su forma, su nombre y su voz, reducidas a partículas que vagan sin destino. Cada mota de niebla fue alguna vez un sentimiento — una despedida que nunca se dijo, una carta que nunca se escribió, un abrazo que llegó tarde. El Vacío no destruye a los Ecos; los desgasta, como el agua desgasta una piedra, hasta que solo queda su textura. La niebla es ese sedimento emocional: cientos de historias que ya no pueden contarse a sí mismas, flotando juntas sin saberse.

Entre todas esas partículas hay una que retuvo un fragmento de conciencia. No porque fuera más fuerte, sino porque fue la primera en disolverse. Una mujer que entró al Vacío hace cuarenta años, siguiendo un recuerdo de su hija que se le escapaba incluso en el mundo real. Cargaba una carta que nunca llegó a entregar — una carta de disculpas hacia alguien que ya no estaba. Al cruzar al Vacío, el peso de su propio arrepentimiento fue tan denso que la dimensión la reconoció como propia antes de que pudiera volver. Su cuerpo regresó al mundo real. Su memoria se quedó. Desde entonces flota como niebla, y las partículas que Mateo ve moverse lentamente son los fragmentos de su historia dispersándose. Ella ya no recuerda su nombre, pero sabe que está esperando algo.

Mateo puede encontrarla en cinco momentos del Vacío, cuando la niebla se condensa lo suficiente como para que los fragmentos de su memoria se vuelvan audibles. No son conversaciones — son ecos de lo que fue. Un susurro sobre una carta mojada por la lluvia. El peso de una mano que ya no está. El olor del pan en una cocina que ya no existe. Al percibir los cinco fragmentos, la niebla cambia: adquiere un tono dorado tenue, como si la Dama hubiera recordado algo importante. En el Vacío, cerca del faro, aparece una silueta de luz que no interactúa — la Dama, ahora en paz, observa desde lejos antes de disolverse para siempre. Ya no es niebla. Ya es solo un recuerdo completo.

### 8.2 Nodos de diálogo nuevos (formato JSON exacto del juego)

Los siguientes 5 nodos representan los fragmentos de memoria de la Dama de la Niebla. Aparecen como texto narrativo ambiental (estilo `narrative_float`) cuando Mateo está cerca de zonas donde la niebla se condensa en el Vacío. Cada nodo incluye una condición para que solo se active si el fragmento anterior fue encontrado, creando una secuencia lineal de descubrimiento. No tienen opciones de respuesta ni consecuencias inmediatas — son momentos de contemplación.

#### Nodo 1 — La carta bajo la lluvia (zona V_LIGHTHOUSE)
Aparece cuando Mateo está en la zona del faro en el Vacío y se acerca a la ventana de la sala de la linterna. La niebla se arremolina contra el vidrio. No requiere ningún flag previo — es el primer encuentro posible.

```json
{
  "id": "fog_encounter_dama_01",
  "speaker": "",
  "portrait": null,
  "text": "Entre la niebla, una voz que no es una voz: 'La carta se mojó. No llegué a entregarla. La lluvia entraba por la ventana y yo pensé — si se borra la tinta, se borra la culpa. Pero la culpa no se borra. Solo se dispersa. Como yo.'",
  "next": null,
  "style": "narrative_float",
  "onExit": "saveSystem.setFlag('fog_encounter_dama_01', true)"
}
```

#### Nodo 2 — La mano que ya no está (zona V_HOME)
Aparece en la versión Vacío de la casa de la abuela Rosa (V_HOME), cerca de la ventana del cuarto de Mateo. La niebla se condensa en forma de brazo que se deshace antes de tocar el vidrio. Requiere que Mateo haya encontrado el primer fragmento.

```json
{
  "id": "fog_encounter_dama_02",
  "speaker": "",
  "portrait": null,
  "text": "La niebla se estira hacia la ventana como una mano que quiere tocar el vidrio. No llega. 'Su mano era pequeña. Cabía entera en la mía. Ya no recuerdo su color de ojos. Recuerdo el peso. Una mano pequeña confiada en la mía. Eso es lo único que no se ha ido.'",
  "next": null,
  "style": "narrative_float",
  "condition": "flag:fog_encounter_dama_01",
  "onExit": "saveSystem.setFlag('fog_encounter_dama_02', true)"
}
```

#### Nodo 3 — El olor del pan (zona V_HUB)
En el HUB del Vacío, cerca de la zona que corresponde a la plaza central. Una partícula de niebla más densa flota a la altura del rostro de Mateo y se disipa al acercarse. Requiere los dos fragmentos anteriores.

```json
{
  "id": "fog_encounter_dama_03",
  "speaker": "",
  "portrait": null,
  "text": "Un olor a pan recién horneado atraviesa la niebla. No debería haber olores en el Vacío. 'Ella tenía cuatro años. Se sentaba en la puerta de la cocina mientras yo amasaba. Cantaba canciones que inventaba. El pan siempre se quema un poco cuando ella canta. Eso decía. Eso decía siempre.'",
  "next": null,
  "style": "narrative_float",
  "condition": "flag:fog_encounter_dama_02",
  "onExit": "saveSystem.setFlag('fog_encounter_dama_03', true)"
}
```

#### Nodo 4 — El nombre olvidado (zona V_BEACH)
En la versión Vacío de la playa norte, cerca del agua que fluye hacia arriba. La niebla se arremolina formando remolinos lentos. Un fragmento más largo. Requiere los tres fragmentos anteriores.

```json
{
  "id": "fog_encounter_dama_04",
  "speaker": "",
  "portrait": null,
  "text": "La niebla forma remolinos sobre el agua invertida. 'Me llamo... no. Ya no. Empezaba con una letra que hacía un sonido suave, como el viento. Mi hija la decía corriendo desde la puerta. Esa palabra. Esa palabra era mi nombre. Ya no la recuerdo entera. Pero recuerdo cómo sonaba cuando ella la decía.'",
  "next": null,
  "style": "narrative_float",
  "condition": "flag:fog_encounter_dama_03",
  "onExit": "saveSystem.setFlag('fog_encounter_dama_04', true)"
}
```

#### Nodo 5 — La despedida (zona V_HEART)
En el corazón del Vacío (V_HEART), donde la niebla es más densa. Este nodo solo se activa cuando los cuatro fragmentos anteriores han sido encontrados. Al ocurrir, la niebla cambia permanentemente de tono (ver sección 8.3). La Dama no habla de pérdida — habla de gratitud.

```json
{
  "id": "fog_encounter_dama_05",
  "speaker": "",
  "portrait": null,
  "text": "La niebla se ilumina desde dentro. Una luz dorada tenue. 'Gracias. No sé quién eres. No sé si eres real o eres otro fragmento de mi memoria que inventa consuelo. Pero gracias. Por quedarte. Por escuchar. Ya puedo irme. Ya recuerdo lo que vine a buscar: no era a ella. Era el permiso para recordarla sin dolor. Y lo encontré. En tus ojos. En los de él. En los míos.'",
  "next": null,
  "style": "narrative_float",
  "condition": "flag:fog_encounter_dama_04",
  "onEnter": "saveSystem.setFlag('fog_dama_all_fragments', true); eventBus.emit('fog:dama_complete')",
  "onExit": "saveSystem.setFlag('fog_encounter_dama_05', true)"
}
```

### 8.3 Consecuencia visible al completar los encuentros

Cuando Mateo ha percibido los cinco fragmentos de la Dama de la Niebla, el Vacío cambia de forma permanente. La consecuencia busca honrar el principio de diseño #3: "las decisiones dejan huella visible".

**Cambio común (inmediato al completar los 5 encuentros):**

- La niebla del Vacío cambia de paleta: las partículas adquieren un **tono dorado tenue** superpuesto sobre su color original. El violeta profundo (`#2A1E3C`) se vuelve violeta cálido (`#3A2850` con matiz `#8B7355`), y el casi negro violáceo (`#181530`) se aclara mínimamente. El cambio es sutil — el jugador no lo nota de golpe, pero percibe que el Vacío "se siente distinto".
- En el sistema `VoidFogSystem`, esto se traduce en: cuando el flag `fog_dama_all_fragments` es true, el array de colores `_fogColors` se rota para incluir un sexto color de mezcla (`#6B4C6B` — violeta con matiz tierra), y la opacidad base sube de 0.08-0.12 a 0.10-0.14 (más presencia, menos disolución).
- El diálogo de inspección de Mateo en el Vacío (trigger genérico al estar quieto 3 segundos en cualquier zona V_*) se actualiza:

```json
{
  "id": "inspect_fog_after_dama",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "La niebla ya no se siente fría. Sigue moviéndose igual, pero el color es distinto. Como si alguien hubiera recordado algo bonito y el recuerdo se hubiera quedado flotando.",
  "next": null,
  "style": "narrative_float",
  "condition": "flag:fog_dama_all_fragments"
}
```

**Cambio específico — aparición del Eco en V_HEART:**

Al completar los cinco encuentros, en la zona `V_HEART` (o en el punto central del Vacío más cercano al faro), aparece una nueva entidad visual: la **silueta de la Dama**. No es un NPC interactuable — es un Eco visual permanente que:
- Tiene forma humanoide femenina, hecha de luz dorada tenue, sentada sobre una roca del Vacío.
- No se mueve ni reacciona a la presencia de Mateo.
- Si Mateo se acerca demasiado (≤30px), la silueta se deshace en partículas que suben hacia arriba y se re-forman 5 segundos después en el mismo lugar.
- Si Mateo usa Visión Felina mientras la silueta está presente, el texto narrativo dice: *"Ya no hay dolor en ella. Solo el recuerdo de haber querido."*

**Cambio en el vínculo Luna-Mateo:**

El sistema `BondSystem` registra el momento: cuando `fog_dama_all_fragments` se activa, el vínculo recibe un **+3 permanente** (no acumulable). Es pequeño, pero es la señal del juego de que la empatía de Mateo — quedarse a escuchar a alguien que ya no existe — fortalece su conexión con Luna incluso sin que ella esté presente.

### 8.4 Flags necesarios (verificados contra game_states.md y código existente)

Los siguientes flags **no existen** en `docs/game_states.md` (secciones 2–9.5), ni en ningún archivo de misión en `src/missions/data/`, ni en las búsquedas de `setFlag` en `src/`. Son completamente nuevos.

| Flag | Tipo | Default | Descripción | Set by |
|------|------|---------|-------------|--------|
| `fog_encounter_dama_01` | bool | false | Primer fragmento de la Dama percibido (V_LIGHTHOUSE) | `fog_encounter_dama_01` onExit |
| `fog_encounter_dama_02` | bool | false | Segundo fragmento percibido (V_HOME) | `fog_encounter_dama_02` onExit |
| `fog_encounter_dama_03` | bool | false | Tercer fragmento percibido (V_HUB) | `fog_encounter_dama_03` onExit |
| `fog_encounter_dama_04` | bool | false | Cuarto fragmento percibido (V_BEACH) | `fog_encounter_dama_04` onExit |
| `fog_encounter_dama_05` | bool | false | Quinto fragmento percibido (V_HEART) | `fog_encounter_dama_05` onExit |
| `fog_dama_all_fragments` | bool | false | Los 5 fragmentos han sido percibidos | `fog_encounter_dama_05` onEnter |
| `fog_dama_released` | bool | false | La Dama completó su despedida (efecto visual activo) | Se activa junto con `fog_dama_all_fragments` mediante evento `fog:dama_complete` |

**Verificación de duplicados:**
- `fog_*` — no existe ningún flag con este prefijo en `game_states.md` ✅
- `dama_*` — no existe ningún flag con este prefijo en `game_states.md` ✅
- IDs de diálogo `fog_encounter_dama_*` — no existen en `docs/dialogue_trees.md` ✅
- ID de diálogo `inspect_fog_after_dama` — no existe en `docs/dialogue_trees.md` ✅

**Nota sobre el evento `fog:dama_complete`:** Este evento es escuchado por el sistema `VoidFogSystem` para activar el cambio de paleta (colores con matiz dorado). No requiere modificar el archivo `VoidFogSystem.js` existente — solo añadir un listener opcional en `src/main.js` junto a los otros puntos de integración del sistema:

```javascript
// En main.js, dentro del bloque de eventos:
eventBus.on('fog:dama_complete', () => {
  voidFog.setPaletteShift(true); // Activa la paleta cálida
  saveSystem.setFlag('fog_dama_released', true);
});
```

### 8.5 Notas de coherencia con el lore existente

1. **Principio de diseño #1 — "Cada Grieta es una historia humana":** La Dama de la Niebla no es una Grieta, pero sigue el mismo principio. No es un efecto especial vacío — es la historia de una mujer que se disolvió en el Vacío por amor a su hija. El jugador no "sella" nada; **percibe**, y esa percepción cambia el mundo.

2. **Principio de diseño #3 — "Las decisiones dejan huella visible":** La decisión aquí no es activa (elegir una opción en un diálogo), sino de atención. El jugador decide quedarse quieto en cinco zonas del Vacío y escuchar. El cambio de paleta de la niebla y la aparición de la silueta en V_HEART son la recompensa visible por esa atención.

3. **Conexión con M01 (faro):** La carta mojada que menciona la Dama en el primer fragmento conecta temáticamente con la carta de Antonio el farero. Ambos cargaron una carta que nunca entregaron. Donde Antonio encontró liberación, la Dama encontró disolución. Si Mateo completó M01, al percibir el primer fragmento de la Dama, el juego puede mostrar un texto flotante opcional: *"Otra carta. Otra historia que no llegó."* para jugadores atentos.

4. **Conexión con Luna:** Aunque Luna no aparece en estos encuentros, la recompensa de +3 al BondSystem es consistente con la mecánica establecida: la empatía de Mateo fortalece su vínculo con ella incluso cuando están separados.

5. **Ausencia de conflicto con Reina o el Tejedor:** La Dama es anterior a ambos. Su historia es personal, no política. No sabe de Reina ni del Tejedor. Su presencia en el Vacío es un recordatorio de que antes de los grandes conflictos, hay pérdidas pequeñas que también merecen ser recordadas.

---

*Sección narrativa añadida por el Escritor Narrativo — Sesión: implementación de VoidFogSystem.*
*Fecha: 2025-07-17*
*Historia: la Dama de la Niebla — cinco fragmentos, una despedida.*
