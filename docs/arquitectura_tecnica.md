# Grietas — Arquitectura Técnica
### Juego 2D Web — HTML5 / JavaScript / Canvas

---

## 1. Visión general del stack

```
┌─────────────────────────────────────────────────────┐
│                    NAVEGADOR WEB                    │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   Renderer  │  │  Game Logic  │  │    UI /   │  │
│  │  (Canvas2D) │  │  (JS puro)   │  │   HUD     │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │              Asset Manager                  │    │
│  │   (sprites, audio, tilemaps, JSON data)     │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────────┐   ┌───────────────────────────┐   │
│  │  Input Sys.  │   │   Save System (LocalSt.)  │   │
│  └──────────────┘   └───────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Sin frameworks de juego pesados.** El juego se construye sobre:
- **HTML5 Canvas API** como renderer principal
- **JavaScript ES2022+** (módulos nativos, clases, async/await)
- **Web Audio API** para sonido posicional y música
- **LocalStorage / IndexedDB** para guardado
- **Tiled Map Editor** + JSON para diseño de niveles

Sin dependencias de motor externo (no Phaser, no Unity WebGL). Esto mantiene el bundle pequeño, el control total y la portabilidad máxima.

---

## 2. Estructura de archivos

```
grietas/
├── index.html                  # Entry point
├── style.css                   # Estilos del shell (menú, HUD overlay)
│
├── src/
│   ├── main.js                 # Bootstrap — inicializa el juego
│   │
│   ├── core/
│   │   ├── Game.js             # Loop principal, estado global
│   │   ├── SceneManager.js     # Gestión de escenas/niveles
│   │   ├── EventBus.js         # Sistema de eventos desacoplado
│   │   ├── AssetLoader.js      # Carga de sprites, audio, JSON
│   │   └── SaveSystem.js       # Guardar y cargar partida
│   │
│   ├── renderer/
│   │   ├── Renderer.js         # Wrapper de Canvas2D
│   │   ├── Camera.js           # Cámara con follow y límites
│   │   ├── TilemapRenderer.js  # Renderiza mapas de Tiled
│   │   ├── SpriteRenderer.js   # Sprites y animaciones
│   │   └── LightingSystem.js   # Sombras y luz (Vacío vs mundo real)
│   │
│   ├── world/
│   │   ├── World.js            # Contenedor del nivel activo
│   │   ├── Tilemap.js          # Parser de mapas JSON (Tiled)
│   │   ├── Dimension.js        # Estado: REAL | VOID
│   │   ├── RiftSystem.js       # Grietas: spawn, estado, sellado
│   │   └── CollisionSystem.js  # Detección de colisiones AABB
│   │
│   ├── entities/
│   │   ├── Entity.js           # Clase base (id, transform, active)
│   │   ├── Mateo.js            # Protagonista jugable
│   │   ├── Luna.js             # Compañera IA
│   │   ├── Echo.js             # Ecos (base)
│   │   ├── EchoMinor.js        # Eco menor (sin memoria)
│   │   ├── EchoBound.js        # Atado (con memoria y diálogo)
│   │   ├── NPC.js              # Personajes del mundo real
│   │   └── Rift.js             # Entidad Grieta
│   │
│   ├── systems/
│   │   ├── InputSystem.js      # Teclado, gamepad, touch
│   │   ├── PhysicsSystem.js    # Gravedad, velocidad, colisión
│   │   ├── AnimationSystem.js  # Máquina de estados de animación
│   │   ├── AISystem.js         # Comportamiento de Luna y Ecos
│   │   ├── BondSystem.js       # El vínculo Mateo-Luna
│   │   ├── VisionSystem.js     # Visión felina (activar/desactivar)
│   │   └── AudioSystem.js      # Web Audio API, música adaptativa
│   │
│   ├── ui/
│   │   ├── HUD.js              # Barra de vínculo, indicadores
│   │   ├── DialogueSystem.js   # Diálogos, árboles de decisión
│   │   ├── Journal.js          # Diario / misiones del jugador
│   │   ├── PauseMenu.js        # Menú de pausa
│   │   └── TransitionFX.js     # Fundidos, efecto de dimensión
│   │
│   ├── missions/
│   │   ├── MissionManager.js   # Registra y actualiza misiones
│   │   ├── MissionBase.js      # Clase base de misión
│   │   └── data/
│   │       ├── mission_01_lighthouse.js
│   │       ├── mission_02_melody.js
│   │       ├── mission_03_garden.js
│   │       ├── mission_04_dogs.js
│   │       ├── mission_05_brothers.js
│   │       └── mission_06_library.js
│   │
│   └── data/
│       ├── dialogues.json      # Todos los árboles de diálogo
│       ├── entities.json       # Stats y config de entidades
│       └── world_flags.json    # Flags de estado del mundo
│
├── assets/
│   ├── sprites/
│   │   ├── mateo/              # Spritesheet Mateo (idle, walk, run, fear)
│   │   ├── luna/               # Spritesheet Luna (real + void forms)
│   │   ├── echoes/             # Sprites de Ecos por tipo
│   │   ├── rifts/              # Animación de Grietas por tamaño
│   │   ├── npcs/               # Personajes secundarios
│   │   └── ui/                 # Iconos HUD, botones, fondos de diálogo
│   │
│   ├── tilemaps/
│   │   ├── miraloma_hub.json   # Mapa central del pueblo
│   │   ├── lighthouse.json
│   │   ├── school.json
│   │   ├── beach_north.json
│   │   ├── library.json
│   │   ├── cemetery.json
│   │   ├── void_hub.json       # Versión Vacío del pueblo
│   │   └── tilesets/           # PNGs de tiles
│   │
│   └── audio/
│       ├── music/              # Tracks por zona y dimensión
│       ├── sfx/                # Efectos de sonido
│       └── ambient/            # Ambiente por zona
│
└── tools/
    └── level_editor_notes.md   # Notas para Tiled Map Editor
```

---

## 3. Game Loop

El loop principal sigue el patrón **fixed timestep + variable render**. Esto garantiza física determinista independientemente del framerate del dispositivo.

```javascript
// core/Game.js
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lastTime = 0;
    this.accumulator = 0;
    this.FIXED_STEP = 1000 / 60; // 60 Hz físicos
  }

  start() {
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(timestamp) {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulator += delta;

    // Física a paso fijo
    while (this.accumulator >= this.FIXED_STEP) {
      this.update(this.FIXED_STEP);
      this.accumulator -= this.FIXED_STEP;
    }

    // Render lo más frecuente posible
    const alpha = this.accumulator / this.FIXED_STEP; // interpolación
    this.render(alpha);

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    InputSystem.update();
    PhysicsSystem.update(dt);
    AISystem.update(dt);
    BondSystem.update(dt);
    MissionManager.update(dt);
    VisionSystem.update(dt);
  }

  render(alpha) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    TilemapRenderer.render(this.ctx);
    EntityRenderer.render(this.ctx, alpha);
    LightingSystem.render(this.ctx);
    HUD.render(this.ctx);
  }
}
```

---

## 4. Sistema de escenas

Cada zona del juego (mundo real y Vacío de cada zona) es una **Scene**. El `SceneManager` maneja transiciones con fundido y preserva el estado entre escenas.

```javascript
// Escenas disponibles
const SCENES = {
  MAIN_MENU:        'MainMenuScene',
  MIRALOMA_HUB:     'MiralomaHubScene',      // pueblo central
  LIGHTHOUSE_REAL:  'LighthouseRealScene',
  LIGHTHOUSE_VOID:  'LighthouseVoidScene',
  SCHOOL_REAL:      'SchoolRealScene',
  SCHOOL_VOID:      'SchoolVoidScene',
  BEACH_NORTH:      'BeachNorthScene',
  LIBRARY_REAL:     'LibraryRealScene',
  LIBRARY_VOID:     'LibraryVoidScene',
  CEMETERY:         'CemeteryScene',
  // ... etc
};

// Transición entre dimensiones dentro de la misma zona
SceneManager.transition(SCENES.LIGHTHOUSE_VOID, {
  effect: 'dimension_shift',  // efecto visual especial
  duration: 800,
  preservePosition: true      // Mateo aparece en la misma coordenada
});
```

### Estructura de una Scene

```javascript
class LighthouseRealScene extends Scene {
  preload()  { /* carga assets específicos */ }
  create()   { /* instancia entidades, configura mapa */ }
  update(dt) { /* lógica de escena */ }
  render(ctx){ /* render adicional de escena */ }
  destroy()  { /* limpieza */ }
}
```

---

## 5. Sistema de entidades

Patrón **Entity + Components** ligero (no ECS completo). Las entidades son clases que contienen componentes opcionales.

```javascript
// entities/Entity.js — clase base
class Entity {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.active = true;
    this.components = new Map();
  }

  addComponent(name, component) { this.components.set(name, component); return this; }
  getComponent(name) { return this.components.get(name); }
  update(dt) { this.components.forEach(c => c.update?.(dt)); }
}

// Ejemplo: instanciar a Mateo
const mateo = new Mateo('mateo', 200, 300)
  .addComponent('physics',   new PhysicsComponent({ mass: 1, gravity: 0.5 }))
  .addComponent('animation', new AnimationComponent(mateoSpritesheets))
  .addComponent('vision',    new VisionComponent())
  .addComponent('input',     new PlayerInputComponent());
```

### Entidades principales y sus componentes

| Entidad | Componentes clave |
|---------|-------------------|
| `Mateo` | Physics, Animation, Input, Vision, Memory |
| `Luna` | Physics, Animation, AI (follow), Purr, Bond |
| `EchoMinor` | Physics, Animation, AI (wander/flee), EmotionColor |
| `EchoBound` | Physics, Animation, AI (idle), Dialogue, Memory |
| `Rift` | Static, Animation, RiftState, SealProgress |
| `NPC` | Static, Animation, Dialogue, MissionTrigger |

---

## 6. Sistema de dimensiones

El cambio entre mundo real y Vacío es el núcleo visual y mecánico del juego. Se gestiona desde `Dimension.js`.

```javascript
// world/Dimension.js
const DIMENSION = { REAL: 'real', VOID: 'void' };

class DimensionManager {
  constructor() {
    this.current = DIMENSION.REAL;
    this.transitioning = false;
  }

  async shiftTo(dim) {
    if (this.transitioning) return;
    this.transitioning = true;

    await TransitionFX.play('dimension_shift'); // efecto visual
    this.current = dim;
    AudioSystem.crossfadeTo(dim === DIMENSION.VOID ? 'void_ambient' : 'real_ambient');
    LightingSystem.setDimensionPalette(dim);
    RiftSystem.updateVisibility(dim);

    this.transitioning = false;
    EventBus.emit('dimension:changed', dim);
  }

  isVoid() { return this.current === DIMENSION.VOID; }
}
```

### Diferencias por dimensión

| Aspecto | Mundo real | Vacío |
|---------|-----------|-------|
| Paleta | Cálida, colores normales | Desaturada, destellos violeta |
| Gravedad | 1.0 (normal) | 0.8 (más flotante) |
| Grietas visibles | Solo con Visión felina | Siempre visibles |
| Ecos visibles | Solo con Visión felina | Siempre visibles |
| Luna | Forma pequeña | Forma verdadera (más grande) |
| Audio | Música del pueblo | Música ambiental del Vacío |
| Objetos | Normales | Brillan con color emocional |

---

## 7. Sistema de Grietas

```javascript
// world/RiftSystem.js
class RiftSystem {
  constructor() {
    this.rifts = new Map(); // id → Rift
  }

  register(rift) {
    this.rifts.set(rift.id, rift);
  }

  // Progreso de sellado
  advanceSeal(riftId, amount) {
    const rift = this.rifts.get(riftId);
    if (!rift || rift.sealed) return;

    rift.sealProgress += amount;
    EventBus.emit('rift:seal_progress', { riftId, progress: rift.sealProgress });

    if (rift.sealProgress >= 100) {
      this.completeSealing(rift);
    }
  }

  completeSealing(rift) {
    rift.sealed = true;
    rift.active = false;
    AudioSystem.playSFX('rift_seal');
    ParticleSystem.burst(rift.x, rift.y, 'seal_complete');
    EventBus.emit('rift:sealed', { riftId: rift.id });
    MissionManager.checkTrigger('rift_sealed', rift.id);
    SaveSystem.setFlag(`rift_${rift.id}_sealed`, true);
  }
}

// Estado de una Grieta
class Rift extends Entity {
  constructor(config) {
    super(config.id, config.x, config.y);
    this.size     = config.size;       // 'micro' | 'minor' | 'major' | 'critical'
    this.emotion  = config.emotion;    // 'grief' | 'guilt' | 'fear' | 'anger' | 'longing'
    this.anchorId = config.anchorId;   // id del objeto-ancla necesario (null si no aplica)
    this.sealed   = false;
    this.sealProgress = 0;
    this.pulseColor   = EMOTION_COLORS[config.emotion];
  }
}
```

### Mapa de colores emocionales (Visión felina)

```javascript
const EMOTION_COLORS = {
  grief:   '#3B5EA6',  // azul profundo
  guilt:   '#4A7C59',  // verde grisáceo
  fear:    '#D4B483',  // amarillo pálido
  anger:   '#9E3A3A',  // rojo apagado
  longing: '#7B5EA7',  // violeta
};
```

---

## 8. Sistema de IA

### Luna — compañera IA

Luna tiene una máquina de estados finita (FSM) con los siguientes estados:

```
FOLLOW → INVESTIGATE → PURR_SEAL → HISS_ECHO → EXPLORE → ALERT
```

```javascript
// systems/AISystem.js — FSM de Luna
class LunaAI {
  constructor(luna, mateo) {
    this.luna  = luna;
    this.mateo = mateo;
    this.state = 'FOLLOW';
  }

  update(dt) {
    switch (this.state) {
      case 'FOLLOW':
        this.followMateo();
        if (this.nearRift())   this.setState('INVESTIGATE');
        if (this.nearEcho())   this.setState('HISS_ECHO');
        break;

      case 'INVESTIGATE':
        this.moveToRift();
        if (this.riftIsMinor() && !this.echoNearby()) this.setState('PURR_SEAL');
        if (this.echoNearby()) this.setState('HISS_ECHO');
        break;

      case 'PURR_SEAL':
        this.purrSeal();
        if (this.riftSealed())  this.setState('FOLLOW');
        if (this.echoNearby())  this.setState('HISS_ECHO');
        break;

      case 'HISS_ECHO':
        this.hissAtNearestEcho();
        if (!this.echoNearby()) this.setState('FOLLOW');
        break;

      case 'ALERT':
        // Luna detecta peligro mayor: se coloca entre Mateo y la amenaza
        this.protectMateo();
        break;
    }
  }
}
```

### Ecos — comportamiento

```javascript
// EchoMinor: deambula, huye de Luna, se atrae a Grietas
// EchoBound: quieto, espera interacción, activa diálogo al aproximarse
class EchoMinorAI {
  update(dt) {
    if (this.lunaVisible()) {
      this.fleeFrom(this.luna);
    } else if (this.nearRift()) {
      this.moveToRift();      // se acumula en Grietas
    } else {
      this.wander();          // movimiento errático aleatorio
    }
  }
}
```

---

## 9. Sistema de vínculo (Bond System)

```javascript
// systems/BondSystem.js
class BondSystem {
  constructor(mateo, luna) {
    this.mateo    = mateo;
    this.luna     = luna;
    this.bond     = 100;      // 0-100
    this.MAX_DIST = 400;      // px antes de degradación
  }

  update(dt) {
    const dist = distance(this.mateo, this.luna);

    if (dist > this.MAX_DIST) {
      const decay = ((dist - this.MAX_DIST) / 100) * (dt / 1000);
      this.bond = Math.max(0, this.bond - decay);
    } else {
      // Se recupera lentamente cuando están cerca
      this.bond = Math.min(100, this.bond + 5 * (dt / 1000));
    }

    this.applyBondEffects();
  }

  applyBondEffects() {
    if (this.bond > 70) {
      // Normal — sin efectos negativos
    } else if (this.bond > 40) {
      // Nivel 1: overlays visuales del Vacío sobre mundo real
      VisionSystem.setVoidOverlayIntensity((70 - this.bond) / 30);
    } else if (this.bond > 15) {
      // Nivel 2: Ecos menores notan a Mateo
      EchoSystem.setMateoVisible(true);
    } else {
      // Nivel 3 crítico: Vacío afecta físicamente a Mateo
      this.mateo.applyVoidDamage(0.1);
      AudioSystem.playSFX('bond_critical_loop');
    }
  }
}
```

---

## 10. Sistema de misiones

```javascript
// missions/MissionBase.js
class MissionBase {
  constructor(config) {
    this.id          = config.id;
    this.title       = config.title;
    this.status      = 'LOCKED';     // LOCKED | ACTIVE | COMPLETED | FAILED
    this.steps       = config.steps; // array de pasos con condiciones
    this.currentStep = 0;
  }

  // Cada misión define sus triggers
  onEvent(eventName, data) {}

  advanceStep() {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.complete();
    }
    EventBus.emit('mission:step', { id: this.id, step: this.currentStep });
  }

  complete() {
    this.status = 'COMPLETED';
    this.onComplete();
    SaveSystem.setFlag(`mission_${this.id}_done`, true);
    EventBus.emit('mission:completed', this.id);
  }
}

// Ejemplo: Misión 1
class Mission01Lighthouse extends MissionBase {
  constructor() {
    super({
      id: 'lighthouse',
      title: 'El farero y su faro',
      steps: [
        { description: 'Hablar con la abuela Rosa sobre el faro' },
        { description: 'Investigar el faro' },
        { description: 'Encontrar la carta de retiro de Antonio' },
        { description: 'Llevar la carta al Eco de Antonio en el Vacío' },
      ]
    });
  }

  onEvent(eventName, data) {
    if (eventName === 'dialogue:completed' && data.npcId === 'abuela_rosa'
        && data.topic === 'lighthouse') {
      if (this.currentStep === 0) this.advanceStep();
    }
    if (eventName === 'item:picked' && data.itemId === 'antonio_letter') {
      if (this.currentStep === 2) this.advanceStep();
    }
    if (eventName === 'rift:sealed' && data.riftId === 'lighthouse_lantern') {
      if (this.currentStep === 3) this.advanceStep();
    }
  }
}
```

---

## 11. Sistema de diálogos

Los árboles de diálogo se definen en JSON y el `DialogueSystem` los ejecuta.

```json
// assets/data/dialogues.json (fragmento)
{
  "antonio_echo_greeting": {
    "speaker": "Antonio",
    "text": "...¿Quién anda ahí? ¿El faro sigue encendido?",
    "portrait": "antonio_echo",
    "next": "antonio_echo_01"
  },
  "antonio_echo_01": {
    "speaker": "Mateo",
    "text": "Señor... ¿sabe dónde está?",
    "choices": [
      {
        "label": "Tengo algo para usted.",
        "condition": "hasItem('antonio_letter')",
        "next": "antonio_echo_letter"
      },
      {
        "label": "¿Cuánto tiempo lleva aquí?",
        "next": "antonio_echo_time"
      }
    ]
  },
  "antonio_echo_letter": {
    "speaker": "Antonio",
    "text": "Mi carta... La escribí el día que me fui. Nunca llegué a entregarla.",
    "next": "antonio_echo_release",
    "onComplete": "missionManager.trigger('lighthouse', 'letter_delivered')"
  }
}
```

```javascript
// ui/DialogueSystem.js
class DialogueSystem {
  start(dialogueId) {
    this.current = dialogues[dialogueId];
    this.visible = true;
    this.render();
  }

  advance(choiceIndex = null) {
    const node = this.current;
    let nextId;

    if (node.choices && choiceIndex !== null) {
      const choice = node.choices[choiceIndex];
      // Evaluar condición si existe
      if (choice.condition && !this.evalCondition(choice.condition)) return;
      nextId = choice.next;
    } else {
      nextId = node.next;
    }

    if (node.onComplete) this.evalAction(node.onComplete);
    if (!nextId) { this.end(); return; }
    this.current = dialogues[nextId];
    this.render();
  }

  evalCondition(expr) {
    // Evaluador seguro: solo permite funciones registradas
    return ConditionRegistry.eval(expr);
  }
}
```

---

## 12. Renderer y cámara

```javascript
// renderer/Camera.js
class Camera {
  constructor(canvas) {
    this.x = 0;
    this.y = 0;
    this.width  = canvas.width;
    this.height = canvas.height;
    this.target = null;
    this.lerp   = 0.08;   // suavidad del seguimiento
    this.bounds = null;   // límites del mapa
  }

  follow(entity) { this.target = entity; }

  update() {
    if (!this.target) return;
    // Centro suavizado sobre el target
    const targetX = this.target.x - this.width  / 2;
    const targetY = this.target.y - this.height / 2;
    this.x += (targetX - this.x) * this.lerp;
    this.y += (targetY - this.y) * this.lerp;
    // Clamp a los límites del mapa
    if (this.bounds) {
      this.x = Math.max(0, Math.min(this.x, this.bounds.width  - this.width));
      this.y = Math.max(0, Math.min(this.y, this.bounds.height - this.height));
    }
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(-Math.floor(this.x), -Math.floor(this.y));
  }

  restore(ctx) { ctx.restore(); }
}
```

### Capas de renderizado (orden)

```
1. Fondo / cielo (parallax opcional)
2. Tilemap — capa background (suelos, paredes traseras)
3. Tilemap — capa midground (paredes, detalles)
4. Ecos y Grietas (debajo de entidades principales)
5. Entidades (NPCs, objetos, Luna)
6. Mateo (siempre visible sobre el resto)
7. Tilemap — capa foreground (elementos en primer plano)
8. Sistema de iluminación / Visión felina overlay
9. Partículas y efectos
10. HUD (fuera de la transformación de cámara)
11. Diálogos (UI — fuera de cámara)
12. Efectos de transición (fundidos, dimension_shift)
```

---

## 13. Sistema de audio

```javascript
// systems/AudioSystem.js
class AudioSystem {
  constructor() {
    this.ctx     = new AudioContext();
    this.tracks  = new Map();
    this.sfx     = new Map();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
  }

  async loadMusic(id, url) {
    const buffer = await this.fetchBuffer(url);
    this.tracks.set(id, buffer);
  }

  playMusic(id, { loop = true, volume = 0.6, fadeIn = 1000 } = {}) {
    const source = this.ctx.createBufferSource();
    source.buffer = this.tracks.get(id);
    source.loop   = loop;
    const gain    = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + fadeIn / 1000);
    source.connect(gain).connect(this.masterGain);
    source.start();
    return { source, gain };
  }

  crossfadeTo(newTrackId, duration = 2000) {
    // Fade out actual, fade in nuevo simultáneamente
    if (this.currentTrack) {
      this.fadeOut(this.currentTrack.gain, duration);
    }
    this.currentTrack = this.playMusic(newTrackId, { fadeIn: duration });
  }

  // Audio posicional para efectos (Grietas suenan más fuerte al acercarse)
  playSFXPositional(id, sourceX, sourceY, listenerX, listenerY) {
    const dist   = distance({ x: sourceX, y: sourceY }, { x: listenerX, y: listenerY });
    const volume = Math.max(0, 1 - dist / 600);
    this.playSFX(id, { volume });
  }
}
```

### Tracks de audio por zona

| ID | Zona | Dimensión |
|----|------|-----------|
| `miraloma_day` | Pueblo | Real |
| `miraloma_night` | Pueblo noche | Real |
| `void_ambient` | Genérico | Vacío |
| `void_lighthouse` | Faro | Vacío |
| `void_school` | Escuela | Vacío |
| `bond_critical_loop` | Global | Ambas |
| `feline_vision_hum` | Global | Ambas |

---

## 14. Sistema de guardado

```javascript
// core/SaveSystem.js
class SaveSystem {
  constructor() {
    this.KEY = 'grietas_save_v1';
  }

  save(slot = 0) {
    const data = {
      version:    '1.0',
      timestamp:  Date.now(),
      scene:      SceneManager.current,
      position:   { x: mateo.x, y: mateo.y },
      dimension:  DimensionManager.current,
      missions:   MissionManager.serialize(),
      flags:      this.flags,
      inventory:  Inventory.serialize(),
      bond:       BondSystem.bond,
      luna:       { abilities: Luna.unlockedAbilities },
    };
    localStorage.setItem(`${this.KEY}_slot${slot}`, JSON.stringify(data));
  }

  load(slot = 0) {
    const raw = localStorage.getItem(`${this.KEY}_slot${slot}`);
    if (!raw) return null;
    return JSON.parse(raw);
  }

  setFlag(key, value) {
    this.flags[key] = value;
  }

  getFlag(key, defaultVal = false) {
    return this.flags[key] ?? defaultVal;
  }
}
```

### Flags de estado del mundo

Los flags son la forma en que el mundo recuerda las decisiones del jugador:

```javascript
// Ejemplos de flags que cambian el mundo
'rift_lighthouse_sealed'       // true/false
'mission_lighthouse_done'      // true/false
'antonio_letter_read'          // Mateo leyó la carta antes de entregarla
'antonio_notes_found_count'    // 0-5 (notas escondidas por el pueblo)
'diego_resolution'             // 'A' | 'B' | 'C'
'abuela_full_story_unlocked'   // true/false
```

---

## 15. Input system

```javascript
// systems/InputSystem.js
class InputSystem {
  constructor() {
    this.keys    = {};
    this.actions = {};
    // Mapa de teclas → acciones abstractas
    this.bindings = {
      'ArrowLeft':  'move_left',
      'ArrowRight': 'move_right',
      'ArrowUp':    'move_up',
      'ArrowDown':  'move_down',
      'KeyA':       'move_left',
      'KeyD':       'move_right',
      'KeyW':       'move_up',
      'KeyS':       'move_down',
      'Space':      'interact',
      'KeyE':       'interact',
      'KeyQ':       'call_luna',
      'ShiftLeft':  'feline_vision',
      'Escape':     'pause',
    };
    this.setupListeners();
    this.setupGamepad();
    this.setupTouch();     // para móvil
  }

  isAction(action) { return !!this.actions[action]; }
  wasPressed(action) { return this.actions[action] === 'just_pressed'; }
}
```

---

## 16. Consideraciones de rendimiento

| Problema | Solución |
|----------|---------|
| Tilemap grande con muchos tiles | Renderizar solo tiles en el viewport + 1 tile de margen (culling) |
| Muchos Ecos en escena | Object pooling — reusar instancias inactivas |
| Canvas scaling en pantallas 4K | Renderizar a resolución base (320×180) y escalar con `imageSmoothingEnabled: false` |
| GC pressure por objetos temporales | Pre-alojar vectores y rects; no crear objetos en el loop |
| Carga inicial lenta | Asset loading por escena — cargar solo lo necesario para la escena activa |

### Resolución base recomendada

```javascript
const BASE_WIDTH  = 320;
const BASE_HEIGHT = 180;
// Canvas interno a esa resolución, escalado por CSS a pantalla completa
// Mantiene el estilo pixel art y evita aliasing
```

---

## 17. Herramientas de desarrollo recomendadas

| Herramienta | Uso | Link |
|-------------|-----|------|
| **Tiled Map Editor** | Diseño de niveles y tilemaps | mapeditor.org |
| **Aseprite** | Sprites y animaciones pixel art | aseprite.org |
| **Audacity** | Edición de audio SFX | audacityteam.org |
| **LMMS / BeepBox** | Música chiptune/ambiental | lmms.io / beepbox.co |
| **VS Code** | Editor de código | code.visualstudio.com |
| **Vite** | Dev server + bundler (opcional) | vitejs.dev |
| **Chrome DevTools** | Profiling del canvas | — |

---

## 18. Orden de desarrollo recomendado

```
Fase 1 — Motor base
  ├── Game loop + Canvas setup
  ├── Input system
  ├── Camera + Tilemap renderer
  └── Colisiones básicas

Fase 2 — Personajes
  ├── Mateo (movimiento, animaciones)
  ├── Luna (follow AI básica)
  └── Bond system (distancia)

Fase 3 — El Vacío
  ├── Dimension manager
  ├── Transición visual (paleta + efectos)
  └── Rift system (spawn, sellar)

Fase 4 — Sistemas de juego
  ├── Dialogue system + JSON de diálogos
  ├── Mission manager
  ├── Vision felina overlay
  └── Audio system + tracks

Fase 5 — Contenido
  ├── Misiones secundarias (una por una)
  ├── NPCs y diálogos
  └── Zonas del mapa

Fase 6 — Polish
  ├── Efectos de partículas
  ├── Música adaptativa
  ├── Save system completo
  └── Mobile / touch support
```

---

*Documento de arquitectura técnica — Grietas, juego 2D web.*
*Complementar con: `grietas_lore.md` (trasfondo narrativo) y `level_design.md` (diseño de niveles).*
