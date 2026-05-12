# Grietas — Árboles de Diálogo
### dialogue_trees.md

---

## Convenciones

```
Estructura de un nodo de diálogo:
{
  "id":        string   — identificador único global
  "speaker":   string   — nombre mostrado en la caja de diálogo
  "portrait":  string   — ID del sprite de retrato (assets/ui/portraits/)
  "text":      string   — texto mostrado al jugador
  "next":      string   — ID del siguiente nodo (null = fin de diálogo)
  "choices":   array    — opciones de respuesta (reemplaza a "next")
  "condition": string   — flag que debe ser true para mostrar este nodo
  "onEnter":   string   — acción ejecutada al entrar al nodo
  "onExit":    string   — acción ejecutada al salir del nodo
}

Prefijos de speaker:
  mateo_        → Mateo (jugador)
  rosa_         → Abuela Rosa
  antonio_      → Eco de Antonio
  vera_         → Eco de Vera
  diego_        → Diego
  hermano_      → Eco del hermano de Diego
  archivist_    → Eco del archivista
  carmen_       → vecina Carmen
  ponce_        → Sra. Ponce (bibliotecaria)
  luna_         → Luna (rarísimo — solo bufidos/ronroneos descritos)

Prefijos de condición (flags — ver game_states.md):
  has_item:ID           → Mateo tiene el ítem en inventario
  flag:NOMBRE           → flag booleano activo
  mission:ID:step:N     → misión ID está en paso N
  NOT:condición         → negación
```

---

## 1. Abuela Rosa

### rosa_default
Diálogo genérico de Rosa cuando no hay misión activa.

```json
{
  "id": "rosa_default",
  "speaker": "Rosa",
  "portrait": "rosa_neutral",
  "text": "¿Ya desayunaste, Mateo? No salgas sin comer.",
  "next": "rosa_default_02"
},
{
  "id": "rosa_default_02",
  "speaker": "Rosa",
  "portrait": "rosa_warm",
  "text": "Luna anduvo rara anoche. Se quedó en la ventana hasta las tres de la mañana mirando el faro.",
  "next": null
}
```

---

### rosa_lighthouse_hint
Trigger: Mateo habla con Rosa antes de iniciar M01 formalmente.

```json
{
  "id": "rosa_lighthouse_hint",
  "speaker": "Rosa",
  "portrait": "rosa_thoughtful",
  "text": "¿Ves ese faro? Lleva veinte años clausurado desde que murió el viejo Antonio.",
  "next": "rosa_lighthouse_hint_02"
},
{
  "id": "rosa_lighthouse_hint_02",
  "speaker": "Rosa",
  "portrait": "rosa_thoughtful",
  "text": "Dicen que todavía se enciende solo algunas noches. Yo creo que Antonio nunca se fue del todo.",
  "next": "rosa_lighthouse_hint_03"
},
{
  "id": "rosa_lighthouse_hint_03",
  "speaker": "mateo",
  "portrait": "mateo_curious",
  "text": "",
  "choices": [
    {
      "label": "¿Cómo murió Antonio?",
      "next": "rosa_antonio_death"
    },
    {
      "label": "¿Crees en esas cosas, abuela?",
      "next": "rosa_believes"
    },
    {
      "label": "Voy a investigar el faro.",
      "next": "rosa_lighthouse_warning",
      "onExit": "missionManager.activate('lighthouse')"
    }
  ]
},
{
  "id": "rosa_antonio_death",
  "speaker": "Rosa",
  "portrait": "rosa_sad",
  "text": "Solo. En la sala de la linterna. Dicen que estaba esperando a alguien que nunca llegó.",
  "next": "rosa_antonio_death_02"
},
{
  "id": "rosa_antonio_death_02",
  "speaker": "Rosa",
  "portrait": "rosa_sad",
  "text": "Tenía una carta escrita. Nunca la entregó. Se la encontraron en un cajón.",
  "next": "rosa_lighthouse_hint_03"
},
{
  "id": "rosa_believes",
  "speaker": "Rosa",
  "portrait": "rosa_warm",
  "text": "De joven veía cosas que los demás no veían. Sombras con forma. Nunca supe qué eran.",
  "next": "rosa_believes_02"
},
{
  "id": "rosa_believes_02",
  "speaker": "Rosa",
  "portrait": "rosa_warm",
  "text": "Con los años la vista se cansa. Pero el instinto no. Y mi instinto dice que ese faro guarda algo.",
  "next": "rosa_lighthouse_hint_03"
},
{
  "id": "rosa_lighthouse_warning",
  "speaker": "Rosa",
  "portrait": "rosa_worried",
  "text": "Mateo... ese lugar está clausurado. No me gusta que vayas solo.",
  "next": "rosa_lighthouse_warning_02"
},
{
  "id": "rosa_lighthouse_warning_02",
  "speaker": "Rosa",
  "portrait": "rosa_resigned",
  "text": "Al menos lleva a Luna. Donde va esa gata, el mal no entra.",
  "next": null
}
```

---

### rosa_m03_trigger
Trigger: Rosa le pide a Mateo que riegue el jardín (inicio M03).

```json
{
  "id": "rosa_m03_trigger",
  "speaker": "Rosa",
  "portrait": "rosa_worried",
  "text": "Mateo, ¿puedes regar el jardín? Las plantas están marchitas y no entiendo por qué. Les pongo agua todos los días.",
  "next": "rosa_m03_trigger_02",
  "onExit": "missionManager.activate('garden')"
},
{
  "id": "rosa_m03_trigger_02",
  "speaker": "mateo",
  "portrait": "mateo_neutral",
  "text": "Claro, abuela.",
  "next": null
}
```

---

### rosa_m03_intermediary
Diálogo de intermediación — Mateo transmite mensaje del Eco (M03).
El jugador elige qué decirle a Rosa de parte del Eco.

```json
{
  "id": "rosa_m03_intermediary",
  "speaker": "mateo",
  "portrait": "mateo_serious",
  "text": "Abuela... hay alguien en el jardín que quiere decirte algo. Yo puedo escucharlo. ¿Qué quieres que le diga?",
  "next": "rosa_m03_intermediary_react"
},
{
  "id": "rosa_m03_intermediary_react",
  "speaker": "Rosa",
  "portrait": "rosa_shocked",
  "text": "¿Qué...? Mateo, ¿de qué estás hablando?",
  "next": "rosa_m03_choice"
},
{
  "id": "rosa_m03_choice",
  "speaker": "mateo",
  "portrait": "mateo_determined",
  "text": "Confía en mí. ¿Qué quieres decirle a alguien que no pudiste despedir?",
  "choices": [
    {
      "label": "\"Que lo extrañas.\"",
      "next": "rosa_m03_A",
      "onExit": "saveSystem.setFlag('m03_message', 'miss')"
    },
    {
      "label": "\"Que estás bien.\"",
      "next": "rosa_m03_B",
      "onExit": "saveSystem.setFlag('m03_message', 'okay')"
    },
    {
      "label": "\"Que puede irse tranquilo.\"",
      "next": "rosa_m03_C",
      "onExit": "saveSystem.setFlag('m03_message', 'release')"
    }
  ]
},
{
  "id": "rosa_m03_A",
  "speaker": "Rosa",
  "portrait": "rosa_crying",
  "text": "Que lo extraño. Cada día. Que el jardín que plantamos juntos todavía florece aunque yo ya no sé cuidarlo sola.",
  "next": "rosa_m03_echo_response"
},
{
  "id": "rosa_m03_B",
  "speaker": "Rosa",
  "portrait": "rosa_crying",
  "text": "Que estoy bien. Que Mateo me cuida. Que no se preocupe por mí.",
  "next": "rosa_m03_echo_response"
},
{
  "id": "rosa_m03_C",
  "speaker": "Rosa",
  "portrait": "rosa_crying",
  "text": "Que puede irse. Que yo lo suelto. Que fue suficiente lo que tuvimos.",
  "next": "rosa_m03_echo_response",
  "onExit": "saveSystem.setFlag('m03_secret_unlocked', true)"
},
{
  "id": "rosa_m03_echo_response",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Dice... que el jardín siempre supo de quién era. Y que gracias.",
  "next": "rosa_m03_end"
},
{
  "id": "rosa_m03_end",
  "speaker": "Rosa",
  "portrait": "rosa_peaceful",
  "text": "...",
  "next": "rosa_m03_end_02"
},
{
  "id": "rosa_m03_end_02",
  "speaker": "Rosa",
  "portrait": "rosa_peaceful",
  "text": "Riega bien las raíces, Mateo. Que beban despacio.",
  "next": null,
  "onExit": "missionManager.complete('garden')"
}
```

---

### rosa_post_m03
Diálogo de Rosa después de completar M03. Desbloquea el backstory de Miraloma.

```json
{
  "id": "rosa_post_m03",
  "speaker": "Rosa",
  "portrait": "rosa_warm",
  "text": "Siéntate, Mateo. Hay cosas de este pueblo que deberías saber.",
  "next": "rosa_backstory_01",
  "condition": "flag:mission_garden_done"
},
{
  "id": "rosa_backstory_01",
  "speaker": "Rosa",
  "portrait": "rosa_thoughtful",
  "text": "Miraloma siempre fue distinto. De niña, los mayores decían que el suelo aquí era más delgado. Que si ponías el oído en la tierra podías escuchar el otro lado.",
  "next": "rosa_backstory_02"
},
{
  "id": "rosa_backstory_02",
  "speaker": "Rosa",
  "portrait": "rosa_thoughtful",
  "text": "Tu abuelo lo sabía. Era el que mejor entendía estas cosas. Nunca me explicó cómo.",
  "next": "rosa_backstory_03"
},
{
  "id": "rosa_backstory_03",
  "speaker": "Rosa",
  "portrait": "rosa_sad",
  "text": "Desapareció dos semanas buscando algo bajo el faro. Volvió distinto. Callado. Nunca habló de lo que encontró.",
  "next": null,
  "onExit": "saveSystem.setFlag('abuelo_backstory_unlocked', true)"
}
```

---

## 2. Antonio — Eco del farero (M01)

### antonio_echo_first_encounter

```json
{
  "id": "antonio_echo_first_encounter",
  "speaker": "Antonio",
  "portrait": "antonio_confused",
  "text": "...¿Quién anda ahí? ¿El faro sigue encendido?",
  "next": "antonio_echo_01"
},
{
  "id": "antonio_echo_01",
  "speaker": "mateo",
  "portrait": "mateo_scared_soft",
  "text": "Señor... ¿sabe dónde está?",
  "next": "antonio_echo_02"
},
{
  "id": "antonio_echo_02",
  "speaker": "Antonio",
  "portrait": "antonio_confused",
  "text": "¿Dónde estoy? En mi faro. Llevo cuarenta años aquí. El faro no puede quedarse sin luz.",
  "next": "antonio_echo_choice_01"
},
{
  "id": "antonio_echo_choice_01",
  "speaker": "mateo",
  "portrait": "mateo_thinking",
  "text": "",
  "choices": [
    {
      "label": "Tengo algo para usted.",
      "condition": "has_item:antonio_letter",
      "next": "antonio_echo_letter"
    },
    {
      "label": "¿A quién esperaba?",
      "next": "antonio_echo_waiting"
    },
    {
      "label": "¿No sabe que... ya pasó mucho tiempo?",
      "next": "antonio_echo_time"
    }
  ]
},
{
  "id": "antonio_echo_waiting",
  "speaker": "Antonio",
  "portrait": "antonio_sad",
  "text": "A nadie. O a alguien. Escribí una carta. Nunca llegué a entregarla.",
  "next": "antonio_echo_waiting_02"
},
{
  "id": "antonio_echo_waiting_02",
  "speaker": "Antonio",
  "portrait": "antonio_sad",
  "text": "Si me voy sin entregarla... ¿quién encenderá el faro?",
  "next": "antonio_echo_choice_01"
},
{
  "id": "antonio_echo_time",
  "speaker": "Antonio",
  "portrait": "antonio_confused",
  "text": "¿Mucho tiempo? El tiempo aquí no corre igual, muchacho.",
  "next": "antonio_echo_time_02"
},
{
  "id": "antonio_echo_time_02",
  "speaker": "Antonio",
  "portrait": "antonio_confused",
  "text": "Aunque... hay noches que siento que el faro ya no necesita que yo lo encienda. Como si el mundo hubiera seguido sin mí.",
  "next": "antonio_echo_choice_01"
},
{
  "id": "antonio_echo_letter",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "Encontré su carta. La que dejó en el cajón de la oficina.",
  "next": "antonio_echo_letter_02"
},
{
  "id": "antonio_echo_letter_02",
  "speaker": "Antonio",
  "portrait": "antonio_shocked",
  "text": "¿Mi carta...?",
  "next": "antonio_echo_letter_03"
},
{
  "id": "antonio_echo_letter_03",
  "speaker": "Antonio",
  "portrait": "antonio_reading",
  "text": "\"Al pueblo de Miraloma: después de cuarenta años, el faro queda en manos de quienes vengan después. Yo hice mi parte.\"",
  "next": "antonio_echo_letter_04",
  "condition": "flag:antonio_letter_read",
  "onEnter": "audioSystem.playSFX('paper_rustle')"
},
{
  "id": "antonio_echo_letter_04",
  "speaker": "Antonio",
  "portrait": "antonio_peaceful",
  "text": "La escribí el día que me jubilé. Nunca llegué a entregarla porque me daba miedo que el faro se apagara para siempre.",
  "next": "antonio_echo_release"
},
{
  "id": "antonio_echo_release",
  "speaker": "Antonio",
  "portrait": "antonio_peaceful",
  "text": "Pero el faro siguió encendido, ¿verdad? Solo. Sin mí.",
  "next": "antonio_echo_release_02"
},
{
  "id": "antonio_echo_release_02",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Sigue encendido.",
  "next": "antonio_echo_release_03"
},
{
  "id": "antonio_echo_release_03",
  "speaker": "Antonio",
  "portrait": "antonio_peaceful",
  "text": "Entonces ya puedo irme.",
  "next": "antonio_echo_end",
  "onExit": "missionManager.complete('lighthouse')"
},
{
  "id": "antonio_echo_end",
  "speaker": "Antonio",
  "portrait": "antonio_fading",
  "text": "Cuida el pueblo, muchacho. Y a la gata. Las gatas saben cosas.",
  "next": null,
  "onExit": "riftSystem.completeSealing('G_lighthouse_lantern')"
}
```

---

## 3. Vera — Eco de la niña del piano (M02)

### vera_echo_loop
Vera no habla directamente al principio — solo toca. El jugador la observa.

```json
{
  "id": "vera_echo_loop",
  "speaker": "Vera",
  "portrait": "vera_absorbed",
  "text": "...(toca las mismas cuatro notas, se detiene, las repite)",
  "next": "vera_echo_loop_02"
},
{
  "id": "vera_echo_loop_02",
  "speaker": "mateo",
  "portrait": "mateo_curious",
  "text": "¿Por qué paras ahí?",
  "next": "vera_echo_react"
},
{
  "id": "vera_echo_react",
  "speaker": "Vera",
  "portrait": "vera_startled",
  "text": "¡No toques el piano! Es mío. Estoy practicando.",
  "next": "vera_echo_choice_01"
},
{
  "id": "vera_echo_choice_01",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "",
  "choices": [
    {
      "label": "¿Por qué siempre paras en la misma parte?",
      "next": "vera_echo_stop"
    },
    {
      "label": "Tengo el resto de la partitura.",
      "condition": "has_item:I_partitura_completa",
      "next": "vera_echo_sheet"
    },
    {
      "label": "¿Cuándo es la actuación?",
      "next": "vera_echo_show"
    }
  ]
},
{
  "id": "vera_echo_stop",
  "speaker": "Vera",
  "portrait": "vera_frustrated",
  "text": "Porque no sé lo que viene después. Se me olvidó. En el escenario, delante de todos, se me olvidó.",
  "next": "vera_echo_stop_02"
},
{
  "id": "vera_echo_stop_02",
  "speaker": "Vera",
  "portrait": "vera_sad",
  "text": "Todos me miraban. Nadie dijo nada. Y yo no podía moverme.",
  "next": "vera_echo_choice_01"
},
{
  "id": "vera_echo_show",
  "speaker": "Vera",
  "portrait": "vera_confused",
  "text": "La actuación es... es hoy. O mañana. Ya va a ser.",
  "next": "vera_echo_show_02"
},
{
  "id": "vera_echo_show_02",
  "speaker": "Vera",
  "portrait": "vera_sad",
  "text": "Siempre va a ser. Y yo siempre me voy a olvidar.",
  "next": "vera_echo_choice_01"
},
{
  "id": "vera_echo_sheet",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "La encontré repartida por la escuela. Estaba buscándola.",
  "next": "vera_echo_sheet_02"
},
{
  "id": "vera_echo_sheet_02",
  "speaker": "Vera",
  "portrait": "vera_disbelief",
  "text": "¿La partitura completa...?",
  "next": "vera_echo_sheet_03"
},
{
  "id": "vera_echo_sheet_03",
  "speaker": "Vera",
  "portrait": "vera_hopeful",
  "text": "¿Puedo...? ¿Me la das?",
  "next": "vera_echo_play",
  "onExit": "inventory.removeItem('I_partitura_completa')"
},
{
  "id": "vera_echo_play",
  "speaker": "Vera",
  "portrait": "vera_focused",
  "text": "...(silencio)",
  "next": "vera_echo_play_02",
  "onEnter": "audioSystem.playMusic('vera_piano_buildup')"
},
{
  "id": "vera_echo_play_02",
  "speaker": "Vera",
  "portrait": "vera_playing",
  "text": "...(empieza desde el principio, llega a la parte donde siempre paraba... y continúa)",
  "next": "vera_echo_end"
},
{
  "id": "vera_echo_end",
  "speaker": "Vera",
  "portrait": "vera_peaceful",
  "text": "Ah.",
  "next": "vera_echo_end_02"
},
{
  "id": "vera_echo_end_02",
  "speaker": "Vera",
  "portrait": "vera_fading",
  "text": "Era así de simple.",
  "next": null,
  "onExit": "missionManager.complete('melody')"
}
```

---

## 4. Diego — NPC secundario (M05)

### diego_intro

```json
{
  "id": "diego_intro",
  "speaker": "Diego",
  "portrait": "diego_awkward",
  "text": "Oye. Tú eres el chico de la gata rara, ¿verdad?",
  "next": "diego_intro_02"
},
{
  "id": "diego_intro_02",
  "speaker": "mateo",
  "portrait": "mateo_curious",
  "text": "¿Rara?",
  "next": "diego_intro_03"
},
{
  "id": "diego_intro_03",
  "speaker": "Diego",
  "portrait": "diego_awkward",
  "text": "Se sienta en lugares raros. Como si estuviera vigilando algo.",
  "next": null
}
```

---

### diego_m05_trigger
Solo aparece cuando M04 está completada.

```json
{
  "id": "diego_m05_trigger",
  "speaker": "Diego",
  "portrait": "diego_nervous",
  "text": "Oye... ¿puedo pedirte algo raro?",
  "condition": "flag:mission_dogs_done",
  "next": "diego_m05_02"
},
{
  "id": "diego_m05_02",
  "speaker": "Diego",
  "portrait": "diego_nervous",
  "text": "Sé que suena estúpido pero... siento que algo me sigue. No sé si es mi cabeza.",
  "next": "diego_m05_03"
},
{
  "id": "diego_m05_03",
  "speaker": "Diego",
  "portrait": "diego_sad",
  "text": "Mi hermano murió hace dos años. Y a veces juro que escucho su voz.",
  "next": "diego_m05_choice"
},
{
  "id": "diego_m05_choice",
  "speaker": "mateo",
  "portrait": "mateo_thinking",
  "text": "",
  "choices": [
    {
      "label": "Puedo investigar.",
      "next": "diego_m05_accept",
      "onExit": "missionManager.activate('brothers')"
    },
    {
      "label": "¿Cómo era tu hermano?",
      "next": "diego_brother_memory"
    }
  ]
},
{
  "id": "diego_brother_memory",
  "speaker": "Diego",
  "portrait": "diego_sad",
  "text": "Era tranquilo. Guardaba cosas. Tenía una caja de madera con objetos que le importaban. La perdimos cuando limpiamos su cuarto.",
  "next": "diego_m05_choice"
},
{
  "id": "diego_m05_accept",
  "speaker": "Diego",
  "portrait": "diego_relieved",
  "text": "Gracias. No sé qué esperas encontrar pero... gracias.",
  "next": null
}
```

---

### diego_m05_resolution_A — Resolución protectora

```json
{
  "id": "diego_m05_resolution_A",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "Encontré algo de tu hermano. Creo que quería que lo tuvieras.",
  "next": "diego_res_A_02"
},
{
  "id": "diego_res_A_02",
  "speaker": "Diego",
  "portrait": "diego_surprised",
  "text": "¿Cómo lo encontraste?",
  "next": "diego_res_A_03"
},
{
  "id": "diego_res_A_03",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Buscando. Estaba en un lugar donde las cosas olvidadas van a parar.",
  "next": "diego_res_A_04"
},
{
  "id": "diego_res_A_04",
  "speaker": "Diego",
  "portrait": "diego_emotional",
  "text": "...",
  "next": "diego_res_A_end"
},
{
  "id": "diego_res_A_end",
  "speaker": "Diego",
  "portrait": "diego_peaceful",
  "text": "Gracias, Mateo.",
  "next": null,
  "onExit": "missionManager.complete('brothers'); saveSystem.setFlag('diego_resolution', 'A')"
}
```

---

### diego_m05_resolution_B — Resolución verdad

```json
{
  "id": "diego_m05_resolution_B",
  "speaker": "mateo",
  "portrait": "mateo_serious",
  "text": "Diego... hablé con tu hermano.",
  "next": "diego_res_B_02"
},
{
  "id": "diego_res_B_02",
  "speaker": "Diego",
  "portrait": "diego_shocked",
  "text": "¿Qué?",
  "next": "diego_res_B_03"
},
{
  "id": "diego_res_B_03",
  "speaker": "mateo",
  "portrait": "mateo_serious",
  "text": "Hay un lugar al que van las personas que no pudieron terminar algo. Él estaba ahí. Me pidió que te diera esto.",
  "next": "diego_res_B_04"
},
{
  "id": "diego_res_B_04",
  "speaker": "Diego",
  "portrait": "diego_overwhelmed",
  "text": "No... no puedo... necesito...",
  "next": "diego_res_B_05"
},
{
  "id": "diego_res_B_05",
  "speaker": "Diego",
  "portrait": "diego_walking_away",
  "text": "Dame tiempo.",
  "next": null,
  "onExit": "missionManager.complete('brothers'); saveSystem.setFlag('diego_resolution', 'B'); saveSystem.setFlag('diego_unavailable', true)"
}
```

---

### diego_m05_resolution_C — Resolución colaborativa

```json
{
  "id": "diego_m05_resolution_C",
  "speaker": "mateo",
  "portrait": "mateo_determined",
  "text": "Diego, ven conmigo. Quiero mostrarte algo.",
  "next": "diego_res_C_02"
},
{
  "id": "diego_res_C_02",
  "speaker": "Diego",
  "portrait": "diego_nervous",
  "text": "¿Adónde?",
  "next": "diego_res_C_03"
},
{
  "id": "diego_res_C_03",
  "speaker": "mateo",
  "portrait": "mateo_determined",
  "text": "Al cementerio. Y necesito que hables. Solo habla. Yo escucharé por ti.",
  "next": "diego_res_C_cemetery"
},
{
  "id": "diego_res_C_cemetery",
  "speaker": "Diego",
  "portrait": "diego_at_rift",
  "text": "...¿Aquí? Mateo, aquí no hay nada.",
  "next": "diego_res_C_speak"
},
{
  "id": "diego_res_C_speak",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "Habla como si estuviera. Yo te digo lo que responde.",
  "next": "diego_res_C_talk"
},
{
  "id": "diego_res_C_talk",
  "speaker": "Diego",
  "portrait": "diego_crying",
  "text": "...¿Estás ahí? Soy yo. Sé que debí haberte dicho más veces que te quería. Soy un idiota.",
  "next": "diego_res_C_echo_response"
},
{
  "id": "diego_res_C_echo_response",
  "speaker": "mateo",
  "portrait": "mateo_translating",
  "text": "Dice que lo sabía. Que siempre lo supo. Y que tú también eras su persona favorita aunque nunca te lo dijera.",
  "next": "diego_res_C_end"
},
{
  "id": "diego_res_C_end",
  "speaker": "Diego",
  "portrait": "diego_peaceful",
  "text": "...(silencio largo)",
  "next": "diego_res_C_end_02"
},
{
  "id": "diego_res_C_end_02",
  "speaker": "Diego",
  "portrait": "diego_resolved",
  "text": "Okay. Okay.",
  "next": null,
  "onExit": "missionManager.complete('brothers'); saveSystem.setFlag('diego_resolution', 'C'); saveSystem.setFlag('diego_ally', true)"
}
```

---

## 5. Eco del hermano de Diego (Vacío — M05)

### hermano_echo_encounter

```json
{
  "id": "hermano_echo_encounter",
  "speaker": "???",
  "portrait": "hermano_dim",
  "text": "No eres Diego.",
  "next": "hermano_echo_02"
},
{
  "id": "hermano_echo_02",
  "speaker": "mateo",
  "portrait": "mateo_calm",
  "text": "No. Soy su amigo. Él no sabe que estoy aquí.",
  "next": "hermano_echo_03"
},
{
  "id": "hermano_echo_03",
  "speaker": "Hermano",
  "portrait": "hermano_sad",
  "text": "¿Está bien?",
  "next": "hermano_echo_choice"
},
{
  "id": "hermano_echo_choice",
  "speaker": "mateo",
  "portrait": "mateo_thinking",
  "text": "",
  "choices": [
    {
      "label": "Está bien. Te extraña.",
      "next": "hermano_echo_truth_A"
    },
    {
      "label": "No sé si está bien. Pero está buscando algo tuyo.",
      "next": "hermano_echo_truth_B"
    }
  ]
},
{
  "id": "hermano_echo_truth_A",
  "speaker": "Hermano",
  "portrait": "hermano_relieved",
  "text": "Bien. Eso es lo único que necesitaba saber.",
  "next": "hermano_echo_object"
},
{
  "id": "hermano_echo_truth_B",
  "speaker": "Hermano",
  "portrait": "hermano_sad",
  "text": "La caja. Tenía cosas que eran suyas también, aunque él nunca lo supo. Fotos que tomé de los dos. Una carta que nunca le mandé.",
  "next": "hermano_echo_object"
},
{
  "id": "hermano_echo_object",
  "speaker": "Hermano",
  "portrait": "hermano_determined",
  "text": "Está aquí. En algún lugar de este lado. Las cosas que importaban siempre llegan aquí antes que nosotros.",
  "next": "hermano_echo_ask"
},
{
  "id": "hermano_echo_ask",
  "speaker": "Hermano",
  "portrait": "hermano_hopeful",
  "text": "¿Puedes llevársela?",
  "next": "hermano_echo_ask_02"
},
{
  "id": "hermano_echo_ask_02",
  "speaker": "mateo",
  "portrait": "mateo_nod",
  "text": "Sí.",
  "next": "hermano_echo_end"
},
{
  "id": "hermano_echo_end",
  "speaker": "Hermano",
  "portrait": "hermano_fading",
  "text": "Dile que yo sí le enseñé a silbar. Que no se le olvide.",
  "next": null,
  "onEnter": "inventory.addItem('I_objeto_diego')"
}
```

---

## 6. Eco del archivista (Vacío — M06)

### archivist_echo_encounter

```json
{
  "id": "archivist_echo_encounter",
  "speaker": "Archivista",
  "portrait": "archivist_defensive",
  "text": "No hay nada aquí que sea de tu incumbencia.",
  "next": "archivist_echo_02"
},
{
  "id": "archivist_echo_02",
  "speaker": "mateo",
  "portrait": "mateo_curious",
  "text": "Los libros de la biblioteca están en blanco. Usted sabe por qué.",
  "next": "archivist_echo_03"
},
{
  "id": "archivist_echo_03",
  "speaker": "Archivista",
  "portrait": "archivist_defensive",
  "text": "Los libros se deterioran. Es natural.",
  "next": "archivist_echo_choice_01"
},
{
  "id": "archivist_echo_choice_01",
  "speaker": "mateo",
  "portrait": "mateo_thinking",
  "text": "",
  "choices": [
    {
      "label": "Encontré los documentos que destruyó.",
      "condition": "has_item:I_documentos_reconstruidos",
      "next": "archivist_echo_confronted"
    },
    {
      "label": "¿Qué borraba de esos registros?",
      "next": "archivist_echo_deflect"
    },
    {
      "label": "¿Por qué todavía está aquí?",
      "next": "archivist_echo_why"
    }
  ]
},
{
  "id": "archivist_echo_deflect",
  "speaker": "Archivista",
  "portrait": "archivist_nervous",
  "text": "No borraba nada. Solo... organizaba. Hay información que no le hace bien a nadie.",
  "next": "archivist_echo_choice_01"
},
{
  "id": "archivist_echo_why",
  "speaker": "Archivista",
  "portrait": "archivist_lost",
  "text": "Porque me fui sin terminar. Destruí algo que no me pertenecía y no puedo deshacerlo.",
  "next": "archivist_echo_choice_01"
},
{
  "id": "archivist_echo_confronted",
  "speaker": "mateo",
  "portrait": "mateo_serious",
  "text": "Los fragmentos estaban aquí. Los reconstruí.",
  "next": "archivist_echo_confronted_02"
},
{
  "id": "archivist_echo_confronted_02",
  "speaker": "Archivista",
  "portrait": "archivist_broken",
  "text": "...",
  "next": "archivist_echo_confession"
},
{
  "id": "archivist_echo_confession",
  "speaker": "Archivista",
  "portrait": "archivist_broken",
  "text": "Eran los registros de 1974. Lo que pasó bajo el faro ese año. Gente importante del pueblo me pagó para borrarlos.",
  "next": "archivist_echo_confession_02"
},
{
  "id": "archivist_echo_confession_02",
  "speaker": "Archivista",
  "portrait": "archivist_broken",
  "text": "Lo hice. Y luego no pude vivir con ello. Y ahora no puedo morirme con ello tampoco.",
  "next": "archivist_echo_release"
},
{
  "id": "archivist_echo_release",
  "speaker": "mateo",
  "portrait": "mateo_gentle",
  "text": "Los documentos existen. Ya no puede borrarse lo que pasó.",
  "next": "archivist_echo_release_02"
},
{
  "id": "archivist_echo_release_02",
  "speaker": "Archivista",
  "portrait": "archivist_relieved",
  "text": "Sí.",
  "next": "archivist_echo_end"
},
{
  "id": "archivist_echo_end",
  "speaker": "Archivista",
  "portrait": "archivist_fading",
  "text": "Devuelve esos documentos al pueblo. Que los lean.",
  "next": null,
  "onExit": "missionManager.complete('library'); saveSystem.setFlag('abuelo_connection_unlocked', true)"
}
```

---

## 7. Vecina Carmen (M04 trigger)

### carmen_dogs_hint

```json
{
  "id": "carmen_dogs_hint",
  "speaker": "Carmen",
  "portrait": "carmen_worried",
  "text": "¿Has oído los perros de noche? Llevan tres días aullando hacia la playa norte.",
  "next": "carmen_dogs_02"
},
{
  "id": "carmen_dogs_02",
  "speaker": "Carmen",
  "portrait": "carmen_worried",
  "text": "Mi Canela no duerme. Se rasca la piel. El veterinario dice que está bien pero yo sé que no.",
  "next": "carmen_dogs_choice"
},
{
  "id": "carmen_dogs_choice",
  "speaker": "mateo",
  "portrait": "mateo_thinking",
  "text": "",
  "choices": [
    {
      "label": "Voy a ver qué pasa en la playa.",
      "next": "carmen_dogs_accept",
      "onExit": "missionManager.activate('dogs'); saveSystem.setFlag('night_unlocked', true)"
    },
    {
      "label": "Seguro que es algo normal.",
      "next": "carmen_dogs_dismiss"
    }
  ]
},
{
  "id": "carmen_dogs_accept",
  "speaker": "Carmen",
  "portrait": "carmen_relieved",
  "text": "Gracias, Mateo. Pero ve de día, ¿eh? De noche esa playa da mala espina.",
  "next": null
},
{
  "id": "carmen_dogs_dismiss",
  "speaker": "Carmen",
  "portrait": "carmen_unconvinced",
  "text": "Puede ser... pero llevan tres días. Tres días exactos.",
  "next": null
}
```

---

## 8. Sra. Ponce — bibliotecaria (M06 trigger)

### ponce_books_blank

```json
{
  "id": "ponce_books_blank",
  "speaker": "Sra. Ponce",
  "portrait": "ponce_distressed",
  "text": "¡Mira esto! ¡Los libros amanecen en blanco! Llevo tres días reportándolo y nadie me cree.",
  "next": "ponce_books_02"
},
{
  "id": "ponce_books_02",
  "speaker": "Sra. Ponce",
  "portrait": "ponce_distressed",
  "text": "Los de historia son los peores. Los registros del pueblo desaparecen primero. ¿Quién haría algo así?",
  "next": "ponce_m06_trigger"
},
{
  "id": "ponce_m06_trigger",
  "speaker": "mateo",
  "portrait": "mateo_curious",
  "text": "¿Desde cuándo empezó?",
  "next": "ponce_m06_02"
},
{
  "id": "ponce_m06_02",
  "speaker": "Sra. Ponce",
  "portrait": "ponce_thinking",
  "text": "Desde la semana pasada. Empezó en la sección de historia, en el fondo. Hay una fisura rara en la pared de ese rincón.",
  "next": "ponce_m06_03"
},
{
  "id": "ponce_m06_03",
  "speaker": "mateo",
  "portrait": "mateo_determined",
  "text": "Voy a revisar ese rincón.",
  "next": null,
  "onExit": "missionManager.activate('library')"
}
```

---

## 9. Diálogos de inspección — objetos del mundo

Estos diálogos se activan cuando Mateo inspecciona objetos sin necesidad de NPC.

```json
{
  "id": "inspect_luna_bowl",
  "speaker": "mateo",
  "portrait": "mateo_sad",
  "text": "El plato de Luna. Todavía tiene comida.",
  "next": null
},
{
  "id": "inspect_family_photo",
  "speaker": "mateo",
  "portrait": "mateo_thoughtful",
  "text": "El abuelo. Abuela Rosa dice que desapareció buscando algo. Pero nunca me dice qué.",
  "next": null
},
{
  "id": "inspect_antonio_photo",
  "speaker": "mateo",
  "portrait": "mateo_curious",
  "text": "Un hombre frente al faro. Parece orgulloso.",
  "next": null
},
{
  "id": "inspect_logbook",
  "speaker": "mateo",
  "portrait": "mateo_reading",
  "text": "El último registro es de hace veinte años. La letra del farero. \"Carta entregada.\" Pero eso no es verdad.",
  "next": null,
  "onExit": "saveSystem.setFlag('logbook_read', true)"
},
{
  "id": "inspect_shipwreck_box",
  "speaker": "mateo",
  "portrait": "mateo_curious",
  "text": "Está sellada. Hay algo grabado: una fecha y unas iniciales. No puedo abrirla todavía.",
  "next": null
}
```

---

## 10. Diálogos de Luna

Luna no habla con palabras. Sus "diálogos" son descripciones de comportamiento que el sistema muestra como texto narrativo en pantalla (sin caja de diálogo, texto flotante pequeño).

```json
{
  "id": "luna_sits_rift",
  "speaker": "",
  "portrait": null,
  "text": "Luna se sienta y clava los ojos en un punto del aire. Sus orejas giran levemente.",
  "next": null,
  "style": "narrative_float"
},
{
  "id": "luna_hisses",
  "speaker": "",
  "portrait": null,
  "text": "Luna bufa. Su pelaje se eriza. Entre sus marcas aparece un destello.",
  "next": null,
  "style": "narrative_float"
},
{
  "id": "luna_purrs_seal",
  "speaker": "",
  "portrait": null,
  "text": "Luna ronronea. El sonido parece demasiado profundo para una gata.",
  "next": null,
  "style": "narrative_float"
},
{
  "id": "luna_head_touch",
  "speaker": "",
  "portrait": null,
  "text": "Luna apoya su frente en la mano de Mateo. Por un momento, Mateo ve lo que ella ve.",
  "next": null,
  "style": "narrative_float",
  "onExit": "visionSystem.activate()"
},
{
  "id": "luna_found_void",
  "speaker": "",
  "portrait": null,
  "text": "En el Vacío, Luna es más grande. Sus marcas brillan sin esfuerzo. Como si aquí fuera más ella misma.",
  "next": null,
  "style": "narrative_float"
}
```

---

## Apéndice — IDs de retratos (portraits)

```
mateo_neutral        mateo_curious        mateo_scared_soft
mateo_determined     mateo_gentle         mateo_soft
mateo_serious        mateo_thinking       mateo_calm
mateo_sad            mateo_reading        mateo_translating
mateo_nod

rosa_neutral         rosa_warm            rosa_worried
rosa_thoughtful      rosa_sad             rosa_shocked
rosa_crying          rosa_peaceful        rosa_resigned

antonio_confused     antonio_sad          antonio_shocked
antonio_reading      antonio_peaceful     antonio_fading

vera_absorbed        vera_startled        vera_frustrated
vera_sad             vera_confused        vera_hopeful
vera_focused         vera_playing         vera_peaceful
vera_fading

diego_awkward        diego_nervous        diego_sad
diego_surprised      diego_shocked        diego_emotional
diego_overwhelmed    diego_crying         diego_peaceful
diego_resolved       diego_relieved       diego_at_rift
diego_walking_away

hermano_dim          hermano_sad          hermano_relieved
hermano_determined   hermano_hopeful      hermano_fading

archivist_defensive  archivist_nervous    archivist_lost
archivist_broken     archivist_relieved   archivist_fading

carmen_worried       carmen_relieved      carmen_unconvinced
ponce_distressed     ponce_thinking
```

---

*Complementar con: `game_states.md` (flags y condiciones), `level_design.md` (posición de triggers), `arquitectura_tecnica.md` (implementación de DialogueSystem).*
