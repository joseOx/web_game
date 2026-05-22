# Propuesta de diseño — Corazón Firme (Steadfast Heart)
## Habilidad nueva para Mateo

---

## 1. Resumen

**Nombre:** Corazón Firme (flag: `mateo_heart_anchor_unlocked`)

**Tipo:** Habilidad activa (tecla F) + efecto pasivo de aura

**Desbloqueo:** Al completar **3 misiones secundarias** (cualquier combinación de M01–M06)

**Duración estimada de implementación:** 2–3 horas (sistema nuevo + integración + testing)

---

## 2. Justificación narrativa

En el lore del juego (`docs/grietas_lore.md`, sección 8 — "La noche que lo encontró") se establece una regla fundamental:

> *"El Vacío no puede atravesar un corazón que todavía late con fuerza, por más triste que esté."*

Mateo no tiene poderes innatos. Su fortaleza es **su presencia emocional**. Cuando Luna lo encontró, no era su "brillo" lo que lo salvó — era que su corazón seguía latiendo a pesar del dolor.

Al completar misiones secundarias — resolver las emociones de otros, ayudar a Antonio, Vera, el jardín de Rosa, los perros, Diego, el archivista — Mateo **fortalece su propia presencia emocional**. Cada Grieta sellada no solo sana el Vacío: también fortalece el ancla de Mateo en la realidad.

La habilidad "Corazón Firme" representa ese crecimiento. Después de ayudar a suficientes personas, Mateo aprende que su simple presencia **estabiliza el entorno**. No necesita Luna para esto. Es suyo.

---

## 3. Mecánica funcional

### 3.1 Efecto activo (tecla F)

| Aspecto | Valor |
|---------|-------|
| Tecla | `F` (actualmente libre en InputSystem) |
| Cooldown | 20 segundos |
| Duración del pulso | 1.5 segundos (visual) |
| Efecto en Ecos menores | Inmovilizados (vx=vy=0) en radio 80px durante 3s |
| Efecto en Visión Felina | Restaura +20 de energía inmediatamente |
| Efecto en el vínculo | Bonus temporal de +5 bond si está cerca de Luna |
| Efecto visual | Onda expansiva cálida (color #FFD97D → #FFF0B0) |

### 3.2 Efecto pasivo

Cuando el Bond está en nivel **HEALTHY** (≥70), Mateo emite un aura pasiva muy sutil:

- Los Ecos menores en su vecindad tienen un 30% menos de probabilidad de transiticionar a ACCUMULATE (acumularse en grietas cercanas a él)
- Los Ecos menores detectan a Mateo a 20px menos de distancia (se vuelven ligeramente menos agresivos)
- No reemplaza el efecto de Luna — solo complementa

### 3.3 Restricciones

- No funciona si Mateo está dentro de una conversación de diálogo
- No funciona mientras el piano mini-game está activo
- El efecto de inmovilización sobre Ecos menores **no** afecta a Ecos atados (EchoBound) ni a bosses

---

## 4. Sistemas involucrados

### 4.1 Sistema nuevo: `HeartAnchorSystem`

Archivo: `src/systems/HeartAnchorSystem.js`

Clase que maneja:
- Estado de la habilidad (disponible, en cooldown, activa)
- Detección de pulsación de tecla F
- Aplicación de efectos sobre Ecos menores (inmovilización)
- Restauración de energía de Visión Felina
- Efecto visual de pulso
- Cooldown management

### 4.2 Sistemas existentes modificados

| Sistema | Cambio |
|---------|--------|
| `InputSystem.js` | **Sin cambios** — la tecla `F` ya está libre, se chequea con `input.wasPressed('heart_anchor')` agregando un nuevo binding |
| `main.js` | Instanciar `HeartAnchorSystem`, inyectar dependencias, registrar en update y render |
| `EchoMinorAI.js` | Leer flag de inmovilización global (`_heartStunned`) para que los ecos no se muevan mientras están aturdidos |
| `VisionSystem.js` | Añadir método público `addEnergy(amount)` para que HeartAnchorSystem pueda restaurar energía |
| `SaveSystem.js` | **Sin cambios** — el flag `mateo_heart_anchor_unlocked` se persiste automáticamente |

---

## 5. Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `src/systems/HeartAnchorSystem.js` | Sistema principal de la habilidad (~120 líneas) |
| `docs/propuesta_design_corazon_firme.md` | Este documento |

---

## 6. Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/main.js` | ① Importar HeartAnchorSystem ② Instanciar e inyectar ③ Registrar en update/render ④ Añadir trigger de desbloqueo (3 misiones) ⑤ Binding de tecla F |
| `src/systems/InputSystem.js` | Añadir `'KeyF': 'heart_anchor'` a BINDINGS |
| `src/systems/EchoMinorAI.js` | Añadir check de `this._echo._stunned` en métodos de movimiento |
| `src/systems/VisionSystem.js` | Añadir método `addEnergy(amount)` |
| `src/entities/EchoMinor.js` | Añadir propiedad `this._stunned = false` y setter `stun(ms)` |

---

## 7. Flujo de desbloqueo

```
[1] Jugador completa 3ª misión secundaria cualquiera
    → EventBus emite 'mission:completed'
    → HeartAnchorSystem verifica: count >= 3 Y flag no seteado
    → SaveSystem.setFlag('mateo_heart_anchor_unlocked', true)
    → DialogueSystem.start('heart_anchor_tutorial_01')  // diálogo de tutorial

[2] Tutorial (diálogo interno de Mateo):
    "Algo cambió. Siento que mi presencia... pesa. Como si el aire a mi alrededor
     estuviera más quieto."
    → Se muestra hint: "[F] Corazón Firme — inmoviliza Ecos y restaura visión"

[3] A partir de entonces, la habilidad está disponible permanentemente.
```

---

## 8. Integración con habilidades existentes

| Habilidad | Dueño | Sinergia con Corazón Firme |
|-----------|-------|---------------------------|
| Visión Felina | Luna/Mateo (Shift) | Corazón Firme restaura energía de visión → más uso continuado |
| Ronroneo sellador | Luna (automático) | Inmovilizar ecos permite a Luna sellar sin interrupciones |
| Silbido ahuyente | Mateo (Q hold) | Comparten tecla Q → no hay conflicto (Q = llamar/silbido, F = pulso) |
| Memoria Compartida | Mateo (E hold) | Sinergia narrativa: entender el pasado fortalece el presente |
| Silbido de Luna | Luna (doble Q) | Sinergia táctica: Luna atrae ecos, Mateo los inmoviliza |

---

## 9. Efecto visual del pulso

El pulso de Corazón Firme se renderiza como:

1. **Onda expansiva:** 3 anillos concéntricos que crecen desde Mateo en 400ms
2. **Color:** `#FFD97D` (amarillo cálido de "longing" — el color del deseo de conectar)
3. **Partículas:** 8 partículas doradas que se elevan desde Mateo
4. **Duración total:** ~700ms de efecto visual, luego 1.5s de aura residual tenue

En Ecos menores impactados:
- Cambian de color a un tono más cálido durante 3s
- Se quedan quietos (vx = vy = 0)
- Pequeño brillo dorado en su base

---

## 10. Testing plan

1. **Desbloqueo:** Completar 3 misiones → ¿aparece el diálogo de tutorial?
2. **Activo:** Presionar F → ¿se ve el pulso? ¿los ecos se inmovilizan?
3. **Cooldown:** ¿la barra de cooldown se muestra y respeta los 20s?
4. **Restauración de visión:** ¿la barra de energía de visión felina sube +20?
5. **Sin desbloqueo:** Con menos de 3 misiones → ¿la tecla F no hace nada?
6. **Pasivo:** Con bond HEALTHY → ¿los ecos se acumulan menos cerca de Mateo?
7. **Diálogo abierto:** Con diálogo visible → ¿F no activa la habilidad?
8. **Guardado:** Al cargar partida → ¿el flag persiste y la habilidad sigue disponible?

---

---

## 11. Narrativa — El despertar del ancla

### Historia de Mateo (3 párrafos)

Mateo no lo nota al principio. Las misiones que completa — la carta de Antonio, la partitura de Vera, el jardín de Rosa, los perros de la playa, la promesa de Diego, los documentos del archivista — no son solo tareas. Cada vez que ayuda a alguien a resolver lo que dejó pendiente, algo en él se asienta. Como si su propio corazón, que siempre latió con miedo a perder, empezara a latir con una frecuencia más firme. Luna lo nota antes que él: la gata deja de girar la cabeza hacia cada crujido cuando Mateo está cerca. El Vacío, a su alrededor, se vuelve más silencioso.

La tercera Grieta sellada es el punto de inflexión. Mateo siente un cambio físico: el aire a su alrededor parece más denso, como si su presencia ocupara más espacio del que su cuerpo debería ocupar. Los Ecos, que antes se acercaban con curiosidad o hambre, ahora dudan antes de aproximarse. Es la primera vez que Mateo comprende que su abuelo tenía razón en sus cuadernos — "El Vacío no puede atravesar un corazón que todavía late con fuerza" — y que esa fuerza no es innata: se construye. Cada persona ayudada añade una capa al ancla que lo mantiene firme.

El nombre "Corazón Firme" no es algo que Mateo elija. Es lo que Luna le transmite cuando apoya la cabeza contra su pecho después del desbloqueo. No con palabras — los gatos no necesitan palabras. Pero Mateo siente el eco del concepto: un pulso cálido que emana de él y que, por un instante, detiene el mundo. Aprende a convocarlo solo. No es magia. Es presencia. Es estar tan anclado a lo que importa que el Vacío no puede moverlo.

### Nodos de diálogo nuevos (formato JSON exacto)

5 nodos que forman el tutorial de desbloqueo + monólogo interno posterior:

```json
{
  "id": "heart_anchor_tutorial_01",
  "speaker": "",
  "portrait": null,
  "style": "narrative_float",
  "text": "Algo cambió. El aire alrededor de Mateo se espesó. Luna levanta la cabeza y lo mira — no con sorpresa, sino con reconocimiento.",
  "next": "heart_anchor_tutorial_02",
  "condition": "NOT:flag:heart_anchor_tutorial_seen"
},
{
  "id": "heart_anchor_tutorial_02",
  "speaker": "mateo",
  "portrait": "mateo_thoughtful",
  "text": "Siento algo en el pecho. Como si hubiera un latido extra. O uno más profundo que los demás.",
  "next": "heart_anchor_tutorial_03"
},
{
  "id": "heart_anchor_tutorial_03",
  "speaker": "",
  "portrait": null,
  "style": "narrative_float",
  "text": "Luna ronronea contra tu pierna. No es un ronroneo de consuelo — es de confirmación. Esto es tuyo. Siempre lo fue.",
  "next": "heart_anchor_tutorial_04"
},
{
  "id": "heart_anchor_tutorial_04",
  "speaker": "",
  "portrait": null,
  "style": "narrative_float",
  "text": "[F] Corazón Firme — emite un pulso de presencia que inmoviliza Ecos y restaura tu Visión Felina.",
  "next": null,
  "onExit": "saveSystem.setFlag('heart_anchor_tutorial_seen', true)"
},
{
  "id": "heart_anchor_introspection_01",
  "speaker": "mateo",
  "portrait": "mateo_calm",
  "text": "Cada persona que ayudé sumó. No lo sabía en el momento. Pero ahora lo siento.",
  "next": "heart_anchor_introspection_02",
  "condition": "flag:mateo_heart_anchor_unlocked"
},
{
  "id": "heart_anchor_introspection_02",
  "speaker": "mateo",
  "portrait": "mateo_soft",
  "text": "El abuelo escribió que el corazón late con fuerza cuando sabe a quién sostiene. Creo que empiezo a entenderlo.",
  "next": null
}
```

### Consecuencia visible en el mundo al completar el desbloqueo

| Efecto | Tipo | Descripción |
|--------|------|-------------|
| HUD: icono [F] aparece | UI permanente | Una barra delgada en la parte inferior central muestra "[F] pulso" con color #FFD97D cuando está disponible, gris cuando en cooldown |
| Ecos reaccionan al paso de Mateo | Visual/mecánico | Cuando Mateo tiene Bond HEALTHY y la habilidad desbloqueada, los Ecos menores se alejan ligeramente de su trayectoria (efecto pasivo visible: retroceso sutil de 10–15px al pasar cerca) |
| Partículas sutiles alrededor de Mateo | Visual | Un halo casi imperceptible de partículas doradas (#FFD97D con alpha 0.08) rodea a Mateo cuando está en el Vacío, visible solo en fondos oscuros |
| Diálogo de Rosa activable | Diálogo condicional | Si el jugador habla con Rosa después del desbloqueo, ella tiene un nuevo diálogo donde comenta que Mateo "parece más firme al caminar" |

### Flags necesarios

| Flag | Tipo | Default | Descripción | Set by |
|------|------|---------|-------------|--------|
| `heart_anchor_tutorial_seen` | bool | false | Tutorial de Corazón Firme ya mostrado | `heart_anchor_tutorial_04` onExit |
| `heart_anchor_introspection_seen` | bool | false | Mateo ya tuvo el monólogo interno de reflexión | `heart_anchor_introspection_02` onExit |

**Verificación de duplicados:** Ninguno de los IDs de diálogo (`heart_anchor_tutorial_01` al `heart_anchor_tutorial_04`, `heart_anchor_introspection_01`, `heart_anchor_introspection_02`) existen en `assets/data/dialogues.json`. Los flags `heart_anchor_tutorial_seen` y `heart_anchor_introspection_seen` no existen en `docs/game_states.md`.

### Conexión con el lore

La habilidad se apoya directamente en la regla establecida en `grietas_lore.md` sección 8:
> *"El Vacío no puede atravesar un corazón que todavía late con fuerza, por más triste que esté."*

Y en la línea del cuaderno del abuelo (sección 10, attic_discovery_06):
> *"El Vacío no es el otro lado. Es la misma cara."*

Mateo no adquiere un poder externo. Descubre que su presencia — construida a través de la empatía y las acciones concretas — tiene peso en ambas dimensiones.

---

*Documento generado como parte de la sesión de diseño de mecánicas.*
*Versión: 1.1 — añadida sección narrativa completa: historia, diálogos, consecuencias, flags y verificación de lore.*
