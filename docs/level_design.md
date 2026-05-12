# Grietas — Diseño de Niveles
### level_design.md

---

## Convenciones del documento

```
Unidades:    tiles (1 tile = 16px en resolución base 320×180)
Coordenadas: (col, fila) desde esquina superior izquierda del mapa
Capas Tiled: background | midground | foreground | collision | triggers | entities
Prefijos ID: 
  R_ = zona mundo Real
  V_ = zona Vacío (mirror de zona real)
  E_ = entidad
  T_ = trigger
  G_ = Grieta (Rift)
  I_ = ítem / objeto
  N_ = NPC
```

---

## 1. Mapa general de Miraloma

```
                    [MAR / ACANTILADO NORTE]
                           |
              [PLAYA NORTE]  ←→  [FARO]
                    |                |
    [CEMENTERIO] ←→ [PUEBLO HUB] ←→ [ZONA ESCUELA]
                    |
              [BIBLIOTECA]
                    |
            [CASA ABUELA ROSA]
                    |
              [PLAYA SUR / salida bloqueada]
```

Cada zona tiene su espejo en el Vacío. La transición ocurre en puntos específicos (Grietas activas o portales marcados).

### Zonas jugables

| ID | Nombre | Mapa real | Mapa Vacío | Estado inicial |
|----|--------|-----------|------------|----------------|
| `hub` | Pueblo de Miraloma | `miraloma_hub.json` | `void_hub.json` | Desbloqueado |
| `home` | Casa Abuela Rosa | `home.json` | — | Desbloqueado |
| `lighthouse` | Faro | `lighthouse.json` | `void_lighthouse.json` | Desbloqueado |
| `school` | Escuela abandonada | `school.json` | `void_school.json` | Desbloqueado |
| `beach_north` | Playa norte | `beach_north.json` | — | Bloqueado (noche) |
| `library` | Biblioteca | `library.json` | `void_library.json` | Desbloqueado |
| `cemetery` | Cementerio | `cemetery.json` | `void_cemetery.json` | Desbloqueado |

---

## 2. R_HUB — Pueblo de Miraloma

### Dimensiones
- **Mapa:** 80 × 20 tiles (1280 × 320 px)
- **Scroll:** horizontal con scroll vertical limitado (2 niveles de altura)

### Descripción visual
Calle principal del pueblo. Adoquines de piedra gris, casas de madera con tejados de teja naranja, farolas bajas. Árboles de pino en los bordes. Al fondo se ve el acantilado. Luz cálida de tarde.

### Capas Tiled

| Capa | Contenido |
|------|-----------|
| `background` | Cielo, acantilado lejano, montañas |
| `midground` | Suelo, fachadas de casas, árboles |
| `foreground` | Elementos delante del jugador (ramas bajas, farolas) |
| `collision` | Tiles sólidos (paredes, suelo) |
| `triggers` | Zonas de entrada a otras escenas, misiones |
| `entities` | Posición inicial de NPCs y objetos |

### Puntos de entrada / salida

| ID | Posición (tile) | Destino | Condición |
|----|-----------------|---------|-----------|
| `exit_lighthouse` | (78, 10) | `lighthouse` | Siempre |
| `exit_school` | (60, 8) | `school` | Siempre |
| `exit_library` | (30, 15) | `library` | Siempre |
| `exit_home` | (10, 15) | `home` | Siempre |
| `exit_cemetery` | (2, 10) | `cemetery` | Siempre |
| `exit_beach_north` | (40, 2) | `beach_north` | Flag: `night_unlocked` |

### NPCs en hub

| ID | Posición | Nombre | Diálogos | Misión vinculada |
|----|----------|--------|----------|-----------------|
| `N_vecina_carmen` | (20, 14) | Carmen | `carmen_generic`, `carmen_dogs_hint` | M04 (trigger) |
| `N_nino_diego` | (45, 14) | Diego | `diego_intro`, `diego_m05_trigger` | M05 |
| `N_bibliotecaria` | (32, 14) | Sra. Ponce | `ponce_generic`, `ponce_library_hint` | M06 (trigger) |

### Grietas en hub

| ID | Posición | Tamaño | Emoción | Estado inicial | Visible sin visión |
|----|----------|--------|---------|----------------|--------------------|
| `G_hub_alley` | (50, 13) | micro | `longing` | Activa | No |
| `G_hub_tree` | (15, 12) | micro | `grief` | Activa | No |

### Objetos / ítems

| ID | Posición | Descripción | Interacción |
|----|----------|-------------|-------------|
| `I_newspaper` | (25, 14) | Periódico viejo en banco | Leer → lore flavor |
| `I_lost_cat_poster` | (40, 13) | Cartel de gato perdido | Leer → hint M04 |

### Notas de diseño
- Zona de tutorial implícito. El jugador aprende a moverse y a hablar con NPCs aquí.
- Luna sigue a Mateo. Si Mateo se para cerca de `G_hub_alley`, Luna se sienta y mira el punto durante 3 segundos (señal visual de Grieta sin explicación).
- De noche (tras desbloquear `night_unlocked`), la paleta cambia, las farolas se encienden y aparece 1 Eco menor adicional cerca del callejón.

---

## 3. R_HOME — Casa de la Abuela Rosa

### Dimensiones
- **Mapa:** 30 × 15 tiles (480 × 240 px)
- **Scroll:** ninguno (pantalla completa fija)

### Descripción visual
Interior acogedor. Paredes de madera, alfombra vieja, fotos en la pared, cocina pequeña. Ventana grande con vista al jardín trasero. Exterior del jardín accesible.

### Sub-zonas

```
[EXTERIOR: JARDÍN]
      ↕ puerta trasera
[INTERIOR: SALA / COCINA]
      ↕ puerta principal → HUB
```

### Puntos de entrada / salida

| ID | Posición | Destino | Condición |
|----|----------|---------|-----------|
| `exit_to_hub` | (1, 10) | `hub` | Siempre |
| `door_garden` | (15, 8) | Sub-zona jardín | Siempre |

### NPCs

| ID | Posición | Nombre | Diálogos | Misión vinculada |
|----|----------|--------|----------|-----------------|
| `N_abuela_rosa` | (12, 11) | Abuela Rosa | `rosa_default`, `rosa_m03_trigger`, `rosa_lighthouse_hint` | M01 (hint), M03 |

### Grietas

| ID | Posición | Tamaño | Emoción | Estado inicial | Zona |
|----|----------|--------|---------|----------------|------|
| `G_home_garden` | (15, 4) jardín | minor | `grief` | Activa | Jardín (exterior) |

### Objetos

| ID | Posición | Descripción | Interacción |
|----|----------|-------------|-------------|
| `I_luna_bowl` | (20, 12) | Plato de comida de Luna | Inspeccionar → diálogo de Mateo (tristeza) |
| `I_family_photo` | (8, 9) | Foto familiar en la pared | Memoria compartida (si desbloqueada) → secuencia del abuelo |
| `I_rosa_journal` | (10, 11) en mesa | Diario de Rosa (cerrado) | Bloqueado hasta M03 completada |

### Notas de diseño
- Es el único lugar donde Mateo puede descansar voluntariamente (mecánica: sentarse en el sofá recupera energía del vínculo).
- El jardín está marchito visualmente hasta que M03 se completa. Después florece con una flor de color inusual (señal hacia Luna si M03 resolución secreta activada).
- Rosa está siempre aquí excepto durante la secuencia nocturna de M04.

---

## 4. R_LIGHTHOUSE — Faro de Miraloma

### Dimensiones
- **Exterior:** 25 × 20 tiles (400 × 320 px) — scroll vertical
- **Interior:** 15 × 40 tiles (240 × 640 px) — scroll vertical ascendente

### Descripción visual
Exterior: base de piedra gris, puerta metálica oxidada, acantilado al fondo. Interior: escalera de caracol, paredes húmedas, cajas viejas, una oficina en el nivel 2, sala de la linterna arriba del todo.

### Sub-zonas

```
[SALA DE LA LINTERNA] ← Grieta principal
        ↕ escalera
[NIVEL 2: OFICINA DE ANTONIO]
        ↕ escalera
[NIVEL 1: ENTRADA / ALMACÉN]
        ↕ puerta principal
[EXTERIOR DEL FARO] → HUB
```

### Puntos de entrada / salida

| ID | Posición | Destino | Condición |
|----|----------|---------|-----------|
| `exit_to_hub` | (12, 19) exterior | `hub` | Siempre |
| `door_interior` | (12, 16) exterior | Interior nivel 1 | Siempre (puerta forzada por Mateo) |
| `stair_up_1` | (7, 35) nivel 1 | Nivel 2 oficina | Siempre |
| `stair_up_2` | (7, 18) nivel 2 | Sala linterna | Siempre |
| `void_portal` | (7, 2) linterna | `void_lighthouse` | Flag: `feline_vision_active` o dimensión Vacío |

### Grietas

| ID | Posición | Tamaño | Emoción | Estado inicial | Req. sellado |
|----|----------|--------|---------|----------------|--------------|
| `G_lighthouse_lantern` | (7, 3) linterna | major | `longing` | Activa | `I_antonio_letter` |

### Objetos

| ID | Posición | Descripción | Interacción |
|----|----------|-------------|-------------|
| `I_antonio_photo` | (7, 22) nivel 1 | Foto de Antonio en la pared | Inspeccionar → lore |
| `I_antonio_notes_1` | (10, 20) nivel 1 | Primera nota escondida de Antonio | Coleccionable lore (requiere M01 resolución secreta) |
| `I_logbook` | (5, 18) nivel 2 | Libro de registro del faro | Leer → hint de la carta |
| `I_antonio_letter` | (8, 16) nivel 2 cajón | Carta de retiro de Antonio | Ítem misión M01 — recoger |
| `I_antonio_notes_2` | (7, 16) nivel 2 | Segunda nota escondida | Coleccionable (req. M01 secreta) |

### NPCs en Vacío (ver V_LIGHTHOUSE)

### Notas de diseño
- La puerta del faro está clausurada pero Mateo la fuerza (animación única). Esto indica que el faro fue clausurado recientemente.
- En el exterior, de noche, la linterna del faro se enciende sola (efecto visual). Esto es el trigger visual de M01.
- El interior tiene oscuridad parcial — la linterna de Mateo ilumina un radio pequeño. El Vacío dentro del faro es más luminoso que el exterior (paradoja visual intencionada).

---

## 5. V_LIGHTHOUSE — Faro (Vacío)

### Dimensiones
- Mismo layout que R_LIGHTHOUSE pero con paleta invertida
- **Diferencias visuales:** paredes translúcidas, escalera flota levemente, agua sube por las paredes

### Entidades únicas del Vacío

| ID | Posición | Tipo | Descripción |
|----|----------|------|-------------|
| `E_antonio_echo` | (7, 4) linterna | EchoBound | Eco de Antonio — punto de diálogo M01 |
| `E_echo_minor_1` | (7, 25) nivel 1 | EchoMinor | Deambula, huye de Luna |
| `E_echo_minor_2` | (5, 20) nivel 2 | EchoMinor | Se acumula cerca de G_lighthouse_lantern |

### Puntos de entrada / salida

| ID | Posición | Destino |
|----|----------|---------|
| `void_exit` | (7, 2) linterna | `void_hub` |
| `real_portal` | (7, 2) linterna | `lighthouse` (mundo real) |

### Notas de diseño
- Antonio solo es visible en el Vacío. En el mundo real, solo se ven efectos (linterna encendida sola, sonidos).
- Al sellar `G_lighthouse_lantern` desde el Vacío con `I_antonio_letter`, la sala de la linterna emite luz blanca brillante. Antonio sube flotando y desaparece. Efecto sonoro: música box que se completa.

---

## 6. R_SCHOOL — Escuela abandonada

### Dimensiones
- **Exterior:** 30 × 15 tiles (480 × 240 px)
- **Interior:** 50 × 18 tiles (800 × 288 px) — scroll horizontal

### Descripción visual
Exterior: edificio de dos pisos con ventanas rotas, jardín descuidado, letrero caído. Interior: pasillos con azulejos rotos, aulas vacías con pupitres volcados, salón de actos al fondo con un piano de cola.

### Sub-zonas

```
[EXTERIOR] → HUB
     ↕ puerta principal (forzar)
[PASILLO PRINCIPAL]
     ├── [AULA 1] — fragmento partitura 2
     ├── [AULA 2] — fragmento partitura 3
     └── [SALÓN DE ACTOS] — piano / Grieta
```

### Grietas

| ID | Posición | Tamaño | Emoción | Estado inicial | Req. sellado |
|----|----------|--------|---------|----------------|--------------|
| `G_school_piano` | (45, 12) salón | major | `fear` | Activa | `I_partitura_completa` |

### Objetos

| ID | Posición | Sub-zona | Descripción |
|----|----------|----------|-------------|
| `I_partitura_1` | (15, 10) | Pasillo | Fragmento 1 de la partitura (en el suelo) |
| `I_partitura_2` | (25, 8) | Aula 1 | Fragmento 2 (en un pupitre) |
| `I_partitura_3` | (35, 9) | Aula 2 | Fragmento 3 (pegado en la pared) |
| `I_partitura_4` | (10, 6) | Biblioteca pueblo | Fragmento 4 — fuera de la escuela |
| `I_partitura_completa` | — | — | Se forma al recoger los 4 fragmentos |
| `I_vera_photo` | (45, 10) | Salón | Foto de Vera en el escenario |

### NPCs en Vacío

| ID | Posición | Tipo | Descripción |
|----|----------|------|-------------|
| `E_vera_echo` | (45, 13) salón | EchoBound | Eco de Vera — toca el fragmento, loop infinito |

### Notas de diseño
- Luna se sienta en el exterior y no se mueve. Esta es la señal de trigger para M02 sin texto explicativo.
- El piano suena solo (fragmento en loop de 4 notas) audible desde el exterior.
- Al colocar la partitura completa sobre el piano, se activa un minijuego rítmico simple (4 notas, el jugador las repite). Si lo completa, la melodía se reproduce entera y la Grieta se sella.
- La melodía completa queda guardada como habilidad de Mateo (silbido ahuyenta Ecos menores).

---

## 7. R_BEACH_NORTH — Playa norte

### Dimensiones
- **Mapa:** 60 × 15 tiles (960 × 240 px) — solo accesible de noche
- **Scroll:** horizontal

### Descripción visual
Arena oscura bajo luna llena. Olas con espuma luminosa. Rocas en la orilla. Un embarcadero viejo a la derecha. Lejos, se ve el casco de un barco hundido bajo el agua (silueta visible).

### Condición de acceso
Solo accesible tras activar `night_unlocked` (trigger: los perros aúllan — evento automático en día 3 de juego o al hablar con Carmen en hub).

### Grietas

| ID | Posición | Tamaño | Emoción | Estado inicial | Req. sellado |
|----|----------|--------|---------|----------------|--------------|
| `G_beach_submarine` | (45, 14) bajo el agua | major | `longing` | Activa | Ronroneo de Luna desde orilla |

### Entidades

| ID | Posición | Tipo | Descripción |
|----|----------|------|-------------|
| `E_dog_1` | (10, 13) | NPC animado | Perro agitado, movimiento errático |
| `E_dog_2` | (25, 13) | NPC animado | Perro agitado |
| `E_dog_3` | (40, 13) | NPC animado | Perro agitado cerca de la grieta |
| `E_echo_adhered_1` | (10, 13) | EchoMinor (adherido) | Pegado al perro 1 — visible con visión felina |
| `E_echo_adhered_2` | (25, 13) | EchoMinor (adherido) | Pegado al perro 2 |
| `E_echo_adhered_3` | (40, 13) | EchoMinor (adherido) | Pegado al perro 3 |

### Objetos

| ID | Posición | Descripción | Condición |
|----|----------|-------------|-----------|
| `I_shipwreck_box` | (50, 14) bajo agua | Caja metálica del barco | Accesible tras sellar G_beach_submarine |

### Mecánica de la misión (M04)
1. Mateo llega a la playa con Luna.
2. Los perros con Ecos adheridos siguen a Mateo si se acerca.
3. El jugador debe usar el silbido de Luna para atraer Ecos y alejarlos de los perros, uno por uno.
4. Con los 3 Ecos alejados, Luna puede posicionarse en la orilla y sellar la Grieta submarina.
5. Los perros se calman instantáneamente.

### Notas de diseño
- La playa no tiene versión en el Vacío — la Grieta está en el agua, no en tierra.
- La `I_shipwreck_box` contiene documentos que conectan con El Tejedor (historia principal). No se puede abrir en esta misión — requiere habilidad de memoria compartida (desbloqueada en M05).
- Si Mateo se acerca demasiado a los perros sin separar los Ecos primero, los perros lo rodean y el vínculo baja aceleradamente.

---

## 8. R_LIBRARY — Biblioteca pública

### Dimensiones
- **Mapa:** 40 × 16 tiles (640 × 256 px)
- **Scroll:** horizontal

### Descripción visual
Biblioteca municipal pequeña. Estanterías altas de madera oscura, mesas largas, luz de mediodía por ventanas altas. Sección de historia al fondo con archivadores y mapas enmarcados. Mostrador de entrada cerca de la puerta.

### Sub-zonas

```
[ENTRADA / MOSTRADOR] → HUB
[SALA PRINCIPAL] — estanterías generales
[SALA DE HISTORIA] — archivadores / Grieta
```

### Grietas

| ID | Posición | Tamaño | Emoción | Estado inicial | Req. sellado |
|----|----------|--------|---------|----------------|--------------|
| `G_library_history` | (35, 8) sala historia | major | `guilt` | Activa | `I_documentos_reconstruidos` |

### Objetos

| ID | Posición | Descripción | Condición |
|----|----------|-------------|-----------|
| `I_partitura_4` | (20, 10) sala principal | Fragmento 4 partitura (M02) | Visible siempre |
| `I_libro_blanco_1` | (15, 9) | Libro con páginas en blanco | Inspeccionar → trigger M06 |
| `I_mapa_miraloma` | (38, 7) sala historia | Mapa antiguo del pueblo | Interactuar → muestra ubicaciones históricas |
| `I_fragmento_doc_1` | — | Fragmento de documento — en Vacío | Recoger en V_LIBRARY |
| `I_fragmento_doc_2` | — | Fragmento de documento — en Vacío | Recoger en V_LIBRARY |
| `I_fragmento_doc_3` | — | Fragmento de documento — en Vacío | Recoger en V_LIBRARY |
| `I_documentos_reconstruidos` | — | Se forma al reunir los 3 fragmentos en el Vacío | Objeto misión M06 |

### NPCs

| ID | Posición | Nombre | Diálogos |
|----|----------|--------|----------|
| `N_bibliotecaria` | (5, 12) mostrador | Sra. Ponce | `ponce_books_blank`, `ponce_m06_trigger`, `ponce_thanks` |

### Notas de diseño
- Los libros en blanco son visibles sin visión felina — es la anomalía que inicia M06.
- En el Vacío (`V_LIBRARY`), la sala de historia tiene los fragmentos de documentos flotando como papeles dispersos. Recogerlos es el puzzle principal de M06.
- El `I_mapa_miraloma` muestra ubicaciones que se actualizan a lo largo del juego (marcas de Grietas selladas).

---

## 9. V_LIBRARY — Biblioteca (Vacío)

### Diferencias visuales respecto a R_LIBRARY
- Estanterías más altas, distorsionadas, libros flotando.
- El texto de los libros está visible pero en idiomas que cambian solos.
- La sala de historia está sumergida en una neblina verde-grisácea (color de `guilt`).

### Entidades

| ID | Posición | Tipo | Descripción |
|----|----------|------|-------------|
| `E_archivist_echo` | (35, 9) sala historia | EchoBound | Eco del archivista — niega todo hasta confrontarlo con documentos |
| `E_echo_minor_lib` | (20, 10) | EchoMinor | Patrulla sala principal |

### Objetos (solo en Vacío)

| ID | Posición | Descripción |
|----|----------|-------------|
| `I_fragmento_doc_1` | (30, 7) | Fragmento flotando cerca de la Grieta |
| `I_fragmento_doc_2` | (37, 12) | Fragmento detrás de una estantería caída |
| `I_fragmento_doc_3` | (25, 4) | Fragmento en el techo (requiere plataforma o cajón apilado) |

---

## 10. R_CEMETERY — Cementerio

### Dimensiones
- **Mapa:** 45 × 18 tiles (720 × 288 px)
- **Scroll:** horizontal con zonas elevadas

### Descripción visual
Cementerio antiguo con lápidas de piedra irregulares, cipreses altos, caminos de gravilla. Una capilla pequeña al fondo. Muro de piedra perimetral. Luz tenue incluso de día — los árboles bloquean el sol.

### Sub-zonas

```
[ENTRADA] → HUB
[ZONA CENTRAL] — lápidas generales, Ecos menores
[ZONA ANTIGUA] — lápidas más viejas, Grietas menores
[CAPILLA] — Grieta de M05
```

### Grietas

| ID | Posición | Tamaño | Emoción | Estado inicial | Req. sellado |
|----|----------|--------|---------|----------------|--------------|
| `G_cemetery_main` | (35, 10) zona antigua | minor | `grief` | Activa | Ronroneo (pasivo si Luna está cerca) |
| `G_cemetery_chapel` | (42, 8) capilla | major | `longing` | Activa | `I_objeto_diego` + diálogo M05 |
| `G_cemetery_minor_1` | (15, 12) | micro | `grief` | Activa | Ronroneo pasivo |
| `G_cemetery_minor_2` | (28, 9) | micro | `fear` | Activa | Ronroneo pasivo |

### Entidades

| ID | Posición | Tipo | Descripción |
|----|----------|------|-------------|
| `E_brother_echo` | (42, 9) capilla | EchoBound | Eco del hermano de Diego — solo visible en Vacío |
| `E_echo_minor_cem_1` | (15, 13) | EchoMinor | Deambula zona central |
| `E_echo_minor_cem_2` | (30, 11) | EchoMinor | Cerca de G_cemetery_main |

### Objetos

| ID | Posición | Descripción | Condición |
|----|----------|-------------|-----------|
| `I_lapida_abuelo` | (20, 11) | Lápida del abuelo de Mateo | Memoria compartida → visión del abuelo (requiere habilidad) |
| `I_objeto_diego` | cuarto hermano (hub) | Objeto personal del hermano | Ítem M05 — Mateo lo recoge del cuarto en hub |

### Notas de diseño
- El cementerio tiene el mayor número de Ecos menores del juego. Luna está constantemente activa (marcas brillantes).
- La `I_lapida_abuelo` conecta la historia familiar de Mateo con los documentos de la biblioteca — es el nexo entre M05 y M06 si el jugador completó ambas.
- La resolución de M05 (A, B o C) determina qué pasa en la capilla y cómo cambia visualmente esa zona después.

---

## 11. V_HUB — Pueblo de Miraloma (Vacío)

### Dimensiones
- Igual que R_HUB (80 × 20 tiles)

### Diferencias visuales
- Adoquines con grietas luminosas violeta.
- Las casas son translúcidas — se ve el interior (vacío, sin muebles).
- El cielo es negro con pulsos de luz azul.
- No hay NPCs humanos. Solo Ecos.

### Entidades únicas del Vacío

| ID | Posición | Tipo | Descripción |
|----|----------|------|-------------|
| `E_echo_watcher` | (40, 10) | EchoMinor | Eco fijo que "mira" hacia donde está Luna |
| `E_echo_wanderer_1` | (20, 13) | EchoMinor | Deambula la calle principal |
| `E_echo_wanderer_2` | (60, 12) | EchoMinor | Deambula zona faro |
| `E_tejedor_shadow` | (40, 2) | Especial | Silueta del Tejedor visible a lo lejos — no interactuable hasta Acto 4 |

### Grietas en hub Vacío

| ID | Posición | Nota |
|----|----------|------|
| `G_hub_alley` | (50, 13) | Misma que en mundo real — visible sin visión felina |
| `G_hub_tree` | (15, 12) | Misma que en mundo real — visible sin visión felina |

---

## 12. Reglas globales de nivel

### Transición real ↔ Vacío

Los portales de transición dimensional se activan únicamente en posiciones donde existe una Grieta activa o un portal marcado en el tilemap (capa `triggers`, tipo `dimension_portal`).

```
Trigger de transición:
  - Mateo toca el borde de una Grieta mayor o crítica: transición involuntaria
  - Acción 'interact' sobre portal marcado: transición voluntaria
  - Luna puede cruzar libremente (no requiere trigger)
```

### Escalado de dificultad por zona

| Zona | Ecos menores | Ecos Atados | Grietas activas | Dificultad |
|------|-------------|-------------|-----------------|------------|
| Hub | 0-2 | 0 | 2 micro | Tutorial |
| Home | 0 | 0 | 1 minor | Tutorial |
| Lighthouse | 2 | 1 | 1 major | Fácil |
| School | 1 | 1 | 1 major | Fácil |
| Library | 1 | 1 | 1 major | Media |
| Beach north | 3 (adheridos) | 0 | 1 major | Media |
| Cemetery | 3-4 | 1 | 2 micro + 1 major | Media-Alta |

### Paleta de colores por dimensión

```
Mundo real:
  Suelo:   #C8A97E  (arena/adoquín cálido)
  Paredes: #8B6F5E  (madera envejecida)
  Cielo:   #87CEEB  (azul cielo tarde)
  Luna:    #FFF3B0  (amarillo suave)

Vacío:
  Suelo:   #2A2240  (violeta oscuro)
  Paredes: #1A1428  (casi negro con tono morado)
  Cielo:   #0A0812  (negro con pulsos)
  Acentos: #9B7FE8  (violeta brillante — Grietas y marcas de Luna)
  Ecos:    color según emoción (ver emotion_colors en arquitectura_tecnica.md)
```

### Sistema de iluminación

```
Mundo real de día:   Sin sistema especial. Luz ambiental uniforme.
Mundo real de noche: Oscuridad parcial. Radio de luz de Mateo = 80px.
                     Farolas emiten luz estática de radio 60px.
Vacío:               Oscuridad base con acentos violeta.
                     Luna emite luz de radio 120px en forma verdadera.
                     Grietas emiten luz pulsante de su color emocional.
Visión felina:       Overlay semitransparente violeta sobre todo.
                     Grietas brillan intensamente (radio 40px extra).
                     Huellas de Luna en el suelo (trail de 8 huellas).
```

---

## 13. Checklist de nivel para el agente

Para cada zona, el agente debe generar o verificar:

- [ ] Archivo JSON de Tiled con todas las capas definidas
- [ ] Dimensiones correctas (tiles × 16 = px)
- [ ] Puntos de entrada/salida con IDs coincidentes entre zonas conectadas
- [ ] Todas las Grietas del nivel instanciadas con `RiftSystem.register()`
- [ ] Todos los NPCs instanciados con sus diálogos vinculados
- [ ] Todos los ítems/objetos con sus interacciones
- [ ] Colisiones configuradas (capa `collision` en Tiled)
- [ ] Triggers de misión configurados (capa `triggers`)
- [ ] Paleta correcta según dimensión
- [ ] Sistema de iluminación configurado según zona y hora
- [ ] Versión Vacío creada si la zona la tiene
- [ ] Flags de estado del mundo que afectan esta zona documentados

---

*Complementar con: `grietas_lore.md` (narrativa), `arquitectura_tecnica.md` (sistemas), `dialogue_trees.md` (diálogos completos), `game_states.md` (flags y estado del mundo).*
