import { Game, BASE_WIDTH, BASE_HEIGHT } from './core/Game.js';
import { AssetLoader } from './core/AssetLoader.js';
import { EventBus } from './core/EventBus.js';
import { SaveSystem } from './core/SaveSystem.js';
import { InputSystem } from './systems/InputSystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { Camera } from './renderer/Camera.js';
import { CollisionSystem } from './world/CollisionSystem.js';
import { DimensionManager } from './world/Dimension.js';
import { RiftSystem } from './world/RiftSystem.js';
import { BondSystem } from './systems/BondSystem.js';
import { VisionSystem } from './systems/VisionSystem.js';
import { LunaAI } from './systems/LunaAI.js';
import { HeartAnchorSystem } from './systems/HeartAnchorSystem.js';
import { EchoReadingSystem } from './systems/EchoReadingSystem.js';
import { EchoManager } from './systems/EchoManager.js';
import { TransitionFX } from './ui/TransitionFX.js';
import { LightingSystem } from './renderer/LightingSystem.js';
import { DialogueSystem } from './ui/DialogueSystem.js';
import { HintSystem } from './ui/HintSystem.js';
import { PianoMiniGame } from './ui/PianoMiniGame.js';
import { PrologueScreen } from './ui/PrologueScreen.js';
import { TitleScreen } from './ui/TitleScreen.js';
import { MissionManager } from './missions/MissionManager.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { World } from './world/World.js';
import { SceneManager } from './world/SceneManager.js';
import { Mateo } from './entities/Mateo.js';
import { Luna } from './entities/Luna.js';
import { NPC } from './entities/NPC.js';
import { EchoMinor } from './entities/EchoMinor.js';
import { EchoMinorAI } from './systems/EchoMinorAI.js';
import { LunaCombatMode } from './modes/LunaCombatMode.js';
import { ChapterManager } from './systems/ChapterManager.js';

// Missions
import { Mission01Lighthouse } from './missions/data/mission_01_lighthouse.js';
import { Mission02Melody }     from './missions/data/mission_02_melody.js';
import { Mission03Garden }     from './missions/data/mission_03_garden.js';
import { Mission04Dogs }       from './missions/data/mission_04_dogs.js';
import { Mission05Brothers }   from './missions/data/mission_05_brothers.js';
import { Mission06Library }    from './missions/data/mission_06_library.js';
import { Mission07CemeteryChild } from './missions/data/mission_07_cemetery_child.js';
import { MissionUmbralEspejo } from './missions/data/mission_umbral_espejo.js';
import { Mission08Grandfather } from './missions/data/mission_08_grandfather.js';

// Zone definitions
import { ZoneR_HOME }        from './world/zones/ZoneR_HOME.js';
import { ZoneR_HOME_ATTIC }  from './world/zones/ZoneR_HOME_ATTIC.js';
import { ZoneR_HUB }         from './world/zones/ZoneR_HUB.js';
import { ZoneR_LIGHTHOUSE }  from './world/zones/ZoneR_LIGHTHOUSE.js';
import { ZoneV_LIGHTHOUSE }  from './world/zones/ZoneV_LIGHTHOUSE.js';
import { ZoneR_SCHOOL }      from './world/zones/ZoneR_SCHOOL.js';
import { ZoneV_SCHOOL }      from './world/zones/ZoneV_SCHOOL.js';
import { ZoneR_BEACH }       from './world/zones/ZoneR_BEACH.js';
import { ZoneV_BEACH }       from './world/zones/ZoneV_BEACH.js';
import { ZoneR_CEMETERY }    from './world/zones/ZoneR_CEMETERY.js';
import { ZoneV_CEMETERY }    from './world/zones/ZoneV_CEMETERY.js';
import { ZoneR_LIBRARY }     from './world/zones/ZoneR_LIBRARY.js';
import { ZoneV_LIBRARY }     from './world/zones/ZoneV_LIBRARY.js';
import { ZoneV_HUB }         from './world/zones/ZoneV_HUB.js';
import { ZoneV_HOME }        from './world/zones/ZoneV_HOME.js';
import { ZoneV_HEART }       from './world/zones/ZoneV_HEART.js';

// Umbral + Chapter 0 zones
import { ZoneV_UMBRAL }        from './world/zones/ZoneV_UMBRAL.js';
import { ZoneR_CHAPTER0_HOUSE } from './world/zones/ZoneR_CHAPTER0_HOUSE.js';
import { ZoneR_CHAPTER0_GARDEN } from './world/zones/ZoneR_CHAPTER0_GARDEN.js';

// Reina del Vacío
import { ZoneV_THRONE } from './world/zones/ZoneV_THRONE.js';
import { Reina } from './entities/Reina.js';
import { Cortesano } from './entities/Cortesano.js';
import { MinigameObservationSystem } from './ui/MinigameObservationSystem.js';
import { VoidFogSystem } from './effects/VoidFogSystem.js';
import { ZoneParticles } from './effects/ZoneParticles.js';
import { Minimap } from './ui/Minimap.js';

const canvas = document.getElementById('game-canvas');

// ── Singletons ───────────────────────────────────────────────────────────────
export const events    = new EventBus();
export const assets    = new AssetLoader();
export const save      = new SaveSystem();
export const input     = new InputSystem();
export const audio     = new AudioSystem();
export const camera    = new Camera();
export const collision = new CollisionSystem();
export const dimension = new DimensionManager();
export const rifts     = new RiftSystem();
export const bond      = new BondSystem();
export const vision    = new VisionSystem(camera);
export const echoes    = new EchoManager();
export const transition= new TransitionFX();
export const lighting  = new LightingSystem(camera);
export const dialogue  = new DialogueSystem();
export const missions  = new MissionManager();
export const hints     = new HintSystem();
export const piano     = new PianoMiniGame();
export const particles = new ParticleSystem();
export const prologue  = new PrologueScreen();
export const titleScreen = new TitleScreen();
export const lunaMode   = new LunaCombatMode();
export const heartAnchor   = new HeartAnchorSystem();
export const echoReading   = new EchoReadingSystem();
export const chapterMgr  = new ChapterManager();
export const minigameObs = new MinigameObservationSystem();
export const world     = new World();
export const scenes    = new SceneManager();
export const game      = new Game(canvas);
export const voidFog        = new VoidFogSystem();
export const zoneParticles  = new ZoneParticles();
export const minimap        = new Minimap();

// ── Entities ─────────────────────────────────────────────────────────────────
const mateo = new Mateo(BASE_WIDTH / 2, BASE_HEIGHT / 2 + 20);
const luna  = new Luna(BASE_WIDTH / 2 + 22, BASE_HEIGHT / 2 + 20);

input.setCanvas(canvas);
world.setCamera(camera);
mateo.setInput(input);
mateo.setCollision(collision);
luna.setTarget(mateo);
luna.setCollision(collision);
bond.setEntities(mateo, luna);
camera.follow(mateo);

// ── LunaAI ───────────────────────────────────────────────────────────────────
const lunaAI = new LunaAI();
lunaAI.inject({
  luna, mateo,
  riftSystem:       rifts,
  echoManager:      echoes,
  visionSystem:     vision,
  dimensionManager: dimension,
  bondSystem:       bond,
  audioSystem:      audio,
  eventBus:         events,
});
luna.setAI(lunaAI);

// ── Dependency injection ──────────────────────────────────────────────────────
save.inject({ missionManager: missions, bondSystem: bond, mateo, luna, dimensionManager: dimension });

missions.inject({ saveSystem: save, eventBus: events });
missions.register(new Mission01Lighthouse());
missions.register(new Mission02Melody());
missions.register(new Mission03Garden());
missions.register(new Mission04Dogs());
missions.register(new Mission05Brothers());
missions.register(new Mission06Library());
missions.register(new Mission07CemeteryChild());
missions.register(new MissionUmbralEspejo());
missions.register(new Mission08Grandfather());

dimension.inject({ transitionFX: transition, lightingSystem: lighting, riftSystem: rifts, audioSystem: audio, eventBus: events });
rifts.inject({ saveSystem: save, missionManager: missions, audioSystem: audio, eventBus: events });
vision.inject({ input, riftSystem: rifts, eventBus: events, luna });
dialogue.inject({ input, saveSystem: save, missionManager: missions, riftSystem: rifts, audioSystem: audio, visionSystem: vision, eventBus: events });
minigameObs.inject({ input, eventBus: events, dialogue });

hints.inject({ rifts, dimension, vision, dialogue, mateo, world });
piano.inject({ audio, eventBus: events });
prologue.inject({ input });
titleScreen.inject({ input, hasSave: save.hasSave(), saveSystem: save });
chapterMgr.inject({ saveSystem: save, eventBus: events, sceneManager: scenes, dialogue, transition });
lunaMode.inject({ input, particles, audio });
voidFog.inject({ dimension });
minimap.inject({ world });
heartAnchor.inject({
  mateo, visionSystem: vision, echoManager: echoes, luna,
  bondSystem: bond, eventBus: events, saveSystem: save,
  input, missionManager: missions,
});

echoReading.inject({
  saveSystem: save, bondSystem: bond, visionSystem: vision,
  eventBus: events, echoManager: echoes, riftSystem: rifts,
});
echoReading.setMateo(mateo);
echoReading.setWorld(world);

scenes.inject({
  world, mateo, luna, echoes, rifts, camera, collision,
  dimension, lighting, audio, dialogue, transition, save, eventBus: events,
  heartAnchorSystem: heartAnchor,
});
scenes.register(ZoneR_HOME);
scenes.register(ZoneR_HOME_ATTIC);
scenes.register(ZoneR_HUB);
scenes.register(ZoneR_LIGHTHOUSE);
scenes.register(ZoneV_LIGHTHOUSE);
scenes.register(ZoneR_SCHOOL);
scenes.register(ZoneV_SCHOOL);
scenes.register(ZoneR_BEACH);
scenes.register(ZoneV_BEACH);
scenes.register(ZoneR_CEMETERY);
scenes.register(ZoneV_CEMETERY);
scenes.register(ZoneR_LIBRARY);
scenes.register(ZoneV_LIBRARY);
scenes.register(ZoneV_HUB);
scenes.register(ZoneV_HOME);
scenes.register(ZoneV_UMBRAL);
scenes.register(ZoneV_HEART);
scenes.register(ZoneR_CHAPTER0_HOUSE);
scenes.register(ZoneR_CHAPTER0_GARDEN);
scenes.register(ZoneV_THRONE);

// ── EventBus wiring ───────────────────────────────────────────────────────────
events.on('dimension:changed', ({ dim }) => {
  luna.setDimension(dim);
  echoes.setDimension(dim);
  world.setDimension(dim);
  lighting.setTimeOfDay(dim === 'void' ? 'night' : 'day');
  audio.startAmbient(dim === 'void');
  audio.playTone(dim === 'void' ? 220 : 330, 1.2, 'sawtooth', 0.06);
  voidFog.onDimensionChange(dim);
});

const EMOTION_COLORS = { grief:'#7EC8E3', guilt:'#B8E07A', fear:'#C8A9FF', anger:'#FF8C8C', longing:'#FFD97D' };
events.on('rift:sealed', data => {
  missions.dispatchEvent('rift:sealed', data);
  if (data.x != null) particles.emit(data.x, data.y, EMOTION_COLORS[data.emotion] ?? '#fff', 30);
  audio.playTone(440, 0.6, 'sine', 0.12);
  if (data.riftId === 'G_lighthouse_lantern') {
    setTimeout(() => dialogue.start('lighthouse_sealed_hint'), 800);
  }
  _sealNotifColor = EMOTION_COLORS[data.emotion] ?? '#C8A9FF';
  _sealNotifTimer = 0;
});
events.on('dialogue:node_exit', data => {
  missions.dispatchEvent('dialogue:node_exit', data);
  // Tejedor desaparece al terminar el primer encuentro
  if (data.nodeId === 'weaver_first_seen_05') {
    const npc = world.getNPC('el_tejedor');
    if (npc) npc.active = false;
  }
  // Tejedor desaparece al terminar el segundo encuentro
  if (data.nodeId === 'weaver_second_end') {
    const npc = world.getNPC('el_tejedor_hub');
    if (npc) npc.active = false;
  }
  // M02 — Piano mini-game después de entregar la partitura a Vera
  if (data.nodeId === 'vera_echo_end_02' && !save.getFlag('mission_melody_done')) {
    setTimeout(() => piano.start(), 800);
  }

  // M08 — Al encontrar el diario, activar la misión y entrar a la memoria
  if (data.nodeId === 'm08_trigger_02' && !save.getFlag('mission_grandfather_active')) {
    save.setFlag('m08_diary_found', true);
    missions.activate('grandfather');
    (async () => {
      await transition.playFull('diary_open');
      events.emit('memory:entered', { memoryId: 'grandfather' });
      // Iniciar minijuego de observación
      save.setFlag('m08_memory_entered', true);
      // La escena de memoria se maneja desde el flujo de diálogo
      dialogue.start('m08_memory_start');
    })();
  }

  // M08 — Al terminar los diálogos de memoria, iniciar minijuego de observación
  if (data.nodeId === 'm08_memory_04' &&
      missions.isActive('grandfather') &&
      !save.getFlag('m08_objects_found')) {
    // Iniciar minijuego de objetos ocultos
    const targets = [
      { id: 'seal', x: 180, y: 140, dialogueId: 'abuelo_memory_obj_01', desc: 'Sello de metal' },
      { id: 'mark', x: 50,  y: 80,  dialogueId: 'abuelo_memory_obj_02', desc: 'Marca tallada' },
      { id: 'echo', x: 120, y: 110, dialogueId: 'abuelo_memory_obj_03', desc: 'Eco dormido' },
    ];
    minigameObs.startObservation('V_LIGHTHOUSE', targets, () => {
      dialogue.start('m08_memory_objects_complete');
    });
  }

  // M08 — Al terminar el diálogo de objetos completos, iniciar minijuego de patrón
  if (data.nodeId === 'm08_memory_objects_complete' &&
      missions.isActive('grandfather')) {
    const symbols = [
      { id: 'eye',     label: '👁' },
      { id: 'curve',   label: '◠' },
      { id: 'triangle',label: '△' },
    ];
    minigameObs.startPatternPuzzle(symbols, ['eye', 'curve', 'triangle'], () => {
      dialogue.start('m08_pattern_solved');
    });
  }

  // M08 — Al completar la memoria, volver al presente
  if (data.nodeId === 'm08_memory_end') {
    (async () => {
      await transition.playFull('diary_close');
      events.emit('memory:exited', { memoryId: 'grandfather' });
      save.setFlag('m08_memory_exited', true);
      dialogue.start('m08_present_01');
    })();
  }

  // Corazón del Vacío — al inspeccionar cada fragmento, verificar si ya están todos
  if (data.nodeId === 'corazon_vacio_fragment_01' ||
      data.nodeId === 'corazon_vacio_fragment_02' ||
      data.nodeId === 'corazon_vacio_fragment_03') {
    if (save.getFlag('corazon_vacio_frag_01_done') &&
        save.getFlag('corazon_vacio_frag_02_done') &&
        save.getFlag('corazon_vacio_frag_03_done') &&
        !save.getFlag('corazon_vacio_fragments_done')) {
      save.setFlag('corazon_vacio_fragments_done', true);
      // Iniciar diálogo de Luna después de un breve silencio
      setTimeout(() => dialogue.start('corazon_vacio_luna_01'), 1500);
    }
  }

  // Umbral — activar misión al ver el primer diálogo
  if (data.nodeId === 'umbral_espejo_02') {
    save.setFlag('umbral_espejo_trigger_01_seen', true);
    missions.activate('umbral_espejo');
  }

  // Umbral — al terminar el eco del abuelo, abrir el umbral luminoso y cargar V_UMBRAL
  if (data.nodeId === 'umbral_abuelo_eco_05') {
    (async () => {
      await transition.playFull('light_pillar');
      await scenes.load('V_UMBRAL');
      // La escena con Luna se inicia desde la misión al detectar zone:loaded
    })();
  }

  // Umbral — al despedirse de Luna, volver a R_HOME
  if (data.nodeId === 'umbral_luna_final') {
    (async () => {
      await transition.playFull('fade_white');
      await scenes.load('R_HOME');
      await transition.playFull('fade_black');
      dialogue.start('umbral_epilogue_narrativa');
    })();
  }

  // Reina — resoluciones del encuentro
  if (data.nodeId === 'reina_final_A_pacto') {
    save.setFlag('reina_resolution', 'pacto');
    save.setFlag('reina_throne_lit', true);
    events.emit('reina:pacto_established');
    // Cortesanos se arrodillan
  }
  if (data.nodeId === 'reina_final_A_aliada') {
    save.setFlag('reina_resolution', 'aliada');
    save.setFlag('reina_fragment_item', true);
    save.addItem('I_fragmento_reina');
    events.emit('reina:aliada');
  }
  if (data.nodeId === 'reina_final_A_confianza') {
    save.setFlag('reina_resolution', 'confianza');
    save.setFlag('reina_ally', true);
    save.setFlag('reina_throne_empty', true);
    events.emit('reina:confianza');
  }
  if (data.nodeId === 'reina_final_B_respeto') {
    save.setFlag('reina_resolution', 'respeto_condicional');
    events.emit('reina:respeto');
  }
});
events.on('echo:separated', data => {
  missions.dispatchEvent('echo:separated', data);
  // M04 Fase 2 — cuando los 3 ecos de perros están separados, spawnear guardianes submarinos
  if (scenes.currentZoneId === 'V_BEACH' && !save.getFlag('beach_guards_spawned')) {
    const allGone = ['echo_dog_1', 'echo_dog_2', 'echo_dog_3']
      .every(id => { const e = echoes.get(id); return !e || !e.active; });
    if (allGone) {
      save.setFlag('beach_guards_spawned', true);
      const guardDefs = [
        { id: 'guard_sub_1', x: 10 * 16, y: 4 * 16 },
        { id: 'guard_sub_2', x: 12 * 16, y: 5 * 16 },
        { id: 'guard_sub_3', x: 14 * 16, y: 4 * 16 },
        { id: 'guard_sub_4', x: 12 * 16, y: 6 * 16 },
      ];
      for (const gd of guardDefs) {
        const em   = new EchoMinor(gd.id, gd.x, gd.y, { emotion: 'fear' });
        const emAI = new EchoMinorAI();
        emAI.inject({ echo: em, luna, mateo, riftSystem: rifts, dimensionManager: dimension, heartAnchorSystem: heartAnchor });
        emAI.setGuard();
        em.setAI(emAI);
        echoes.register(em);
      }
      setTimeout(() => dialogue.start('beach_phase2_01'), 600);
    }
  }
});
events.on('item:picked', data => {
  missions.dispatchEvent('item:picked', data);
  audio.playTone(660, 0.2, 'triangle', 0.10);
  // M07 — Al recoger el collar, reactivar el eco de Tomás para la resolución
  if (data?.itemId === 'I_collar_tomas') {
    echoes.get('echo_tomas')?.revive('tomas_echo_return');
  }
});
events.on('item:combined',     data => { missions.dispatchEvent('item:combined', data); audio.playTone(880, 0.4, 'sine',     0.15); });
events.on('piano:melody_complete', () => { rifts.completeSealing('G_school_piano'); });
events.on('mission:completed', () => {
  heartAnchor.checkUnlock();
});
events.on('heart_anchor:unlocked', () => {
  if (!save.getFlag('heart_anchor_tutorial_seen')) {
    setTimeout(() => dialogue.start('heart_anchor_tutorial_01'), 600);
  }
});

// Forward memory events to missions (M08 los necesita)
events.on('memory:entered', data => {
  missions.dispatchEvent('memory:entered', data);
});
events.on('memory:exited', data => {
  missions.dispatchEvent('memory:exited', data);
});

// Forward minigame events to missions (M08 los necesita)
events.on('minigame:observation_complete', data => {
  missions.dispatchEvent('minigame:observation_complete', data);
});
events.on('minigame:pattern_solved', data => {
  missions.dispatchEvent('minigame:pattern_solved', data);
});

// ── Tile textures ─────────────────────────────────────────────────────────────
function _applyZoneTextures(zoneId) {
  const tx = k => assets.getImage(k);
  const wall  = tx('tx_wall');
  const wood  = tx('tx_floor_wood');
  const stone = tx('tx_floor_stone');
  const sand  = tx('tx_floor_sand');
  const bldg  = tx('tx_building');
  const shelf = tx('tx_shelf');
  const furn  = tx('tx_furniture');

  world.setTileTexture('#', wall);

  if (zoneId === 'R_HOME' || zoneId === 'R_CHAPTER0_HOUSE') {
    world.setTileTexture('.', wood);
    world.setTileTexture('f', furn);
  } else if (zoneId === 'R_HOME_ATTIC') {
    world.setTileTexture('.', wood);
  } else if (zoneId === 'R_HUB' || zoneId === 'V_HUB') {
    world.setTileTexture('b', bldg);
    world.setTileTexture('f', bldg);
    if (zoneId === 'V_HUB') world.setTileTexture('.', stone);
  } else if (zoneId === 'R_LIBRARY' || zoneId === 'V_LIBRARY') {
    world.setTileTexture('.', wood);
    world.setTileTexture('b', shelf);
    world.setTileTexture('t', furn);
  } else if (zoneId === 'R_SCHOOL' || zoneId === 'V_SCHOOL') {
    world.setTileTexture('b', bldg);
  } else if (zoneId === 'R_BEACH' || zoneId === 'V_BEACH') {
    world.setTileTexture('.', sand);
  } else if (zoneId === 'R_CEMETERY' || zoneId === 'V_CEMETERY') {
    world.setTileTexture('.', stone);
    world.setTileTexture('g', stone);
    world.setTileTexture('p', stone);
  } else if (zoneId === 'V_HOME') {
    world.setTileTexture('.', wood);
  } else if (zoneId === 'R_CHAPTER0_GARDEN') {
    world.setTileTexture('.', stone);
  } else if (zoneId === 'V_HEART' || zoneId === 'V_THRONE') {
    world.setTileTexture('.', stone);
  }
}

// Verificar desbloqueo de Ecolectura cuando se carga una zona
events.on('zone:loaded', () => {
  echoReading.checkUnlock();
});
events.on('zone:loaded', data => {
  _applyZoneTextures(data.zoneId);
  zoneParticles.setZone(data.zoneId);
  // Zone name announcement
  _zoneNameText  = ZONE_NAMES[data.zoneId] ?? data.zoneId ?? '';
  _zoneNameSub   = data.zoneId?.startsWith('V_') ? 'El Vacío' : 'Mundo Real';
  _zoneNameTimer = 0;

  // Auto-activate missions that start on first zone entry
  if ((data.zoneId === 'R_SCHOOL' || data.zoneId === 'V_SCHOOL') &&
      !missions.isActive('melody') && !missions.isDone('melody')) {
    missions.activate('melody');
  }
  missions.dispatchEvent('zone:loaded', data);

  // Aplicar sprite del Tejedor en V_HUB (primer encuentro)
  if (data.zoneId === 'V_HUB') {
    const tejedorSprite = assets.getImage('tejedor');
    if (tejedorSprite) {
      world.getNPC('el_tejedor')?.setSprite(tejedorSprite, {
        idleCols: 3, walkCols: 6, drawW: 36, drawH: 54,
      });
    }
  }

  // Aplicar sprite de Rosa en R_HOME
  if (data.zoneId === 'R_HOME') {
    const rosaSprite = assets.getImage('rosa_sprite');
    if (rosaSprite) {
      world.getNPC('rosa')?.setMateoSprite(rosaSprite, { drawW: 28, drawH: 28 });
    }
  }

  // Imagen de piso para R_LIGHTHOUSE y V_LIGHTHOUSE (tiled 5×4)
  if (data.zoneId === 'R_LIGHTHOUSE' || data.zoneId === 'V_LIGHTHOUSE') {
    const pisoFaro = assets.getImage('piso_faro');
    if (pisoFaro) world.setBgImage(pisoFaro, { tile: { cols: 6, rows: 6 } });
  }

  // Imagen de piso para R_HUB
  if (data.zoneId === 'R_HUB') {
    const pisoImg = assets.getImage('r_hub_piso');
    if (pisoImg) world.setBgImage(pisoImg, { tile: { cols: 6, rows: 7 } });
  }

  // Imagen de piso para R_SCHOOL y V_SCHOOL (7 filas × 6 columnas)
  if (data.zoneId === 'R_SCHOOL' || data.zoneId === 'V_SCHOOL') {
    const musicaPiso = assets.getImage('musica_piso');
    if (musicaPiso) world.setBgImage(musicaPiso, { tile: { cols: 6, rows: 7 } });
  }

  // Aplicar sprite de Diego en R_HUB
  if (data.zoneId === 'R_HUB') {
    const diegoSprite = assets.getImage('diego');
    if (diegoSprite) {
      world.getNPC('diego')?.setMateoSprite(diegoSprite, { drawW: 28, drawH: 28 });
    }
    const antonioSprite = assets.getImage('antonio_sprite');
    if (antonioSprite) {
      const _aFW = antonioSprite.naturalWidth / 4, _aFH = antonioSprite.naturalHeight / 4;
      const _aDH = 24, _aDW = Math.round(_aFW / _aFH * _aDH);
      echoes.get('echo_antonio_hub')?.setMateoSprite(antonioSprite, { drawW: _aDW, drawH: _aDH });
    }
  }

  // Aplicar sprite de Antonio en V_LIGHTHOUSE
  if (data.zoneId === 'V_LIGHTHOUSE') {
    const antonioSprite = assets.getImage('antonio_sprite');
    if (antonioSprite) {
      const _aFW = antonioSprite.naturalWidth / 4, _aFH = antonioSprite.naturalHeight / 4;
      const _aDH = 24, _aDW = Math.round(_aFW / _aFH * _aDH);
      echoes.get('echo_antonio_lighthouse')?.setMateoSprite(antonioSprite, { drawW: _aDW, drawH: _aDH });
    }
  }

  // M07 — Emilia aparece en R_HUB si M05 está completada y M07 no está hecha
  if (data.zoneId === 'R_HUB' &&
      save.getFlag('mission_brothers_done') &&
      !save.getFlag('mission_cemetery_child_done') &&
      !world.getNPC('emilia')) {
    const emiliaNPC = new NPC('emilia', 4 * 16, 10 * 16, {
      color:      '#A08060',
      label:      'Sra. Emilia',
      dialogueId: 'emilia_m07_route_hub',
    });
    const emiliaSprite = assets.getImage('emilia_sprite');
    if (emiliaSprite) emiliaNPC.setMateoSprite(emiliaSprite, { drawW: 28, drawH: 28 });
    world.addNPC(emiliaNPC);
  }

  // M07 — Si el jugador tiene la piedra de Emilia, los guardianes de culpa se desactivan
  if (data.zoneId === 'V_CEMETERY' && save.hasItem('I_piedra_emilia')) {
    for (const id of ['guard_guilt_1', 'guard_guilt_2', 'guard_guilt_3', 'guard_guilt_4']) {
      const echo = echoes.get(id);
      if (echo) echo.active = false;
    }
  }

  // M07 — Grieta de Tomás solo visible en el vacío cuando la misión está activa
  if (data.zoneId === 'V_CEMETERY' && !save.getFlag('mission_cemetery_child_active')) {
    const childRift = rifts.get('G_cemetery_child');
    if (childRift) { childRift.active = false; childRift._currentlyVisible = false; }
  }

  // M07 — Desbloquear visibilidad de la grieta oculta cuando la misión está activa
  // forceHiddenInReal=true bloquea la grieta incondicionalmente; lo bajamos aquí
  // para que la visión felina pueda revelarla (paso 1 de la misión)
  if (data.zoneId === 'R_CEMETERY' && save.getFlag('mission_cemetery_child_active')
      && !save.getFlag('mission_cemetery_child_done')) {
    const childRift = rifts.get('G_cemetery_child');
    if (childRift) childRift._forceHiddenInReal = false;
  }

  // M07 — Emilia como aliada en R_CEMETERY (resolución B)
  if (data.zoneId === 'R_CEMETERY' && save.getFlag('emilia_ally') && !world.getNPC('emilia_cemetery')) {
    const emiliaCem = new NPC('emilia_cemetery', 16 * 16, 3 * 16, {
      color:      '#A08060',
      label:      'Sra. Emilia',
      dialogueId: 'cemetery_child_emilia_at_tree',
    });
    const emiliaSpriteCem = assets.getImage('emilia_sprite');
    if (emiliaSpriteCem) emiliaCem.setMateoSprite(emiliaSpriteCem, { drawW: 28, drawH: 28 });
    world.addNPC(emiliaCem);
  }

  // Tabla del abuelo — imagen sobre el objeto diary_abuelo
  if (data.zoneId === 'R_HOME_ATTIC') {
    const tablaImg = assets.getImage('tabla_abuelo');
    if (tablaImg) world.setObjectImage('diary_abuelo', tablaImg, { drawW: 28, drawH: 22 });
  }

  // M08 — Trigger del diario del abuelo en R_HOME_ATTIC
  // Solo visible si M06 y M07 completadas + abuelo_connection_unlocked
  if (data.zoneId === 'R_HOME_ATTIC' &&
      save.getFlag('mission_library_done') &&
      save.getFlag('mission_cemetery_child_done') &&
      save.getFlag('abuelo_connection_unlocked') &&
      !save.getFlag('mission_grandfather_done') &&
      !save.getFlag('m08_diary_found')) {
    save.setFlag('m08_diary_ready', true);
  }

  // Diego acompañante en R_LIBRARY — solo con resolución C (diego_resolution = 'C')
  if (data.zoneId === 'R_LIBRARY' && save.getFlag('diego_resolution') === 'C') {
    const diegoDialogue = save.getFlag('mission_library_done')
      ? 'diego_library_done'
      : 'diego_library_visit';
    const diegoLib = new NPC('diego_library', 12 * 16, 10 * 16, {
      color:      '#9B7FE8',
      label:      'Diego',
      dialogueId: diegoDialogue,
    });
    const diegoSprite = assets.getImage('diego');
    if (diegoSprite) {
      diegoLib.setMateoSprite(diegoSprite, { drawW: 28, drawH: 28 });
    }
    world.addNPC(diegoLib);
  }

  // Aplicar sprite del hermano de Diego en V_CEMETERY
  if (data.zoneId === 'V_CEMETERY') {
    const hermanoSprite = assets.getImage('hermano_diego');
    if (hermanoSprite) {
      echoes.get('echo_hermano')?.setMateoSprite(hermanoSprite, { drawW: 28, drawH: 28 });
    }
    // Narrativa de barrera — avisa al jugador que hay algo bloqueando al hermano
    if (missions.isActive('brothers') && !save.getFlag('mission_brothers_done')) {
      setTimeout(() => dialogue.start('brothers_barrier_01'), 1000);
    }
    // M07 — Si el collar ya fue recuperado, el eco de Tomás espera con la resolución
    if (save.getFlag('collar_tomas_found') && !save.getFlag('m07_resolution')) {
      echoes.get('echo_tomas')?.revive('tomas_echo_return');
    }
  }

  // Aplicar sprite de Vera en V_SCHOOL
  if (data.zoneId === 'V_SCHOOL') {
    const veraSprite = assets.getImage('vera');
    if (veraSprite) {
      echoes.get('echo_vera')?.setMateoSprite(veraSprite, { drawW: 28, drawH: 28 });
    }
    // M02 — Si el jugador re-entra con la partitura entregada y la grieta sin sellar
    if (save.getFlag('partitura_delivered_vera') && !save.getFlag('mission_melody_done')) {
      setTimeout(() => piano.start(), 1200);
    }
  }

  // Aplicar sprite del archivista en V_LIBRARY
  if (data.zoneId === 'V_LIBRARY') {
    const archivistaSprite = assets.getImage('archivista_sprite');
    if (archivistaSprite) {
      echoes.get('echo_archivista')?.setMateoSprite(archivistaSprite, { drawW: 28, drawH: 28 });
    }
  }

  // Aplicar sprite de Ponce en R_LIBRARY
  if (data.zoneId === 'R_LIBRARY') {
    const ponceSprite = assets.getImage('ponce_sprite');
    if (ponceSprite) {
      world.getNPC('ponce')?.setMateoSprite(ponceSprite, { drawW: 28, drawH: 28 });
    }
  }

  // Aplicar sprite del abuelo en V_HOME
  if (data.zoneId === 'V_HOME') {
    const abueloSprite = assets.getImage('abuelo_sprite');
    if (abueloSprite) {
      echoes.get('echo_abuelo')?.setMateoSprite(abueloSprite, { drawW: 28, drawH: 28 });
    }
  }

  // Aplicar sprite de Carmen en R_BEACH
  if (data.zoneId === 'R_BEACH') {
    const carmenSprite = assets.getImage('carmen_sprite');
    if (carmenSprite) {
      world.getNPC('carmen')?.setMateoSprite(carmenSprite, { drawW: 28, drawH: 28 });
    }
  }

  // M04 Fase 2 — Si el jugador re-entra a V_BEACH con los perros ya separados y la grieta aún abierta
  if (data.zoneId === 'V_BEACH' &&
      save.getFlag('beach_guards_spawned') &&
      !save.getFlag('rift_G_beach_submarine_sealed')) {
    const beachGuardDefs = [
      { id: 'guard_sub_1', x: 10 * 16, y: 4 * 16 },
      { id: 'guard_sub_2', x: 12 * 16, y: 5 * 16 },
      { id: 'guard_sub_3', x: 14 * 16, y: 4 * 16 },
      { id: 'guard_sub_4', x: 12 * 16, y: 6 * 16 },
    ];
    for (const gd of beachGuardDefs) {
      const em   = new EchoMinor(gd.id, gd.x, gd.y, { emotion: 'fear' });
      const emAI = new EchoMinorAI();
      emAI.inject({ echo: em, luna, mateo, riftSystem: rifts, dimensionManager: dimension, heartAnchorSystem: heartAnchor });
      emAI.setGuard();
      em.setAI(emAI);
      echoes.register(em);
    }
  }

  // ── Main story triggers ────────────────────────────────────────────────────

  // Acto 2 — Luna desaparece la primera vez que Mateo entra al faro.
  // El flag se setea inmediatamente para evitar que la cutscene se repita.
  if (data.zoneId === 'R_LIGHTHOUSE' &&
      save.getFlag('game_started') &&
      !save.getFlag('luna_missing') &&
      !save.getFlag('luna_found_void')) {
    save.setFlag('luna_missing', true);
    setTimeout(() => dialogue.start('luna_missing_cutscene_01'), 800);
  }

  // Acto 2 — Tutorial del Vacío en la primera entrada
  if (data.zoneId === 'V_LIGHTHOUSE' && !save.getFlag('void_first_entry')) {
    setTimeout(() => dialogue.start('void_first_entry_01'), 400);
  }

  // M01 — Pista de guardianes del farol (solo después de que Luna fue encontrada y el tutorial completó,
  // para no interrumpir void_first_entry ni luna_lighthouse_reunion)
  if (data.zoneId === 'V_LIGHTHOUSE' &&
      missions.isActive('lighthouse') &&
      !save.getFlag('mission_lighthouse_done') &&
      !save.getFlag('lighthouse_guard_hint_shown') &&
      save.getFlag('void_first_entry') &&
      save.getFlag('luna_found_void')) {
    save.setFlag('lighthouse_guard_hint_shown', true);
    setTimeout(() => dialogue.start('lighthouse_guard_hint'), 1200);
  }

  // Acto 2→3 — Luna encontrada en V_HUB
  if (data.zoneId === 'V_HUB' &&
      save.getFlag('luna_missing') &&
      !save.getFlag('luna_found_void')) {
    setTimeout(() => dialogue.start('luna_found_void'), 600);
  }

  // Prólogo — primera vez que Mateo llega a casa de Rosa
  if (data.zoneId === 'R_HOME' &&
      save.getFlag('game_started') &&
      !save.getFlag('prologue_narration_done')) {
    setTimeout(() => dialogue.start('prologue_narration_01'), 1200);
  }

  // El Tejedor — segundo encuentro tras sellar 3+ grietas
  if (data.zoneId === 'R_HUB' &&
      save.getFlag('weaver_first_seen') &&
      !save.getFlag('weaver_second_seen')) {
    const riftsSealed = [
      'rift_G_lighthouse_lantern_sealed', 'rift_G_school_piano_sealed',
      'rift_G_beach_submarine_sealed',    'rift_G_cemetery_chapel_sealed',
      'rift_G_library_history_sealed',    'rift_G_home_garden_sealed',
    ].filter(f => save.getFlag(f)).length;
    if (riftsSealed >= 3) {
      // Spawn del NPC visual justo cuando se activa el encuentro
      const tejNPC = new NPC('el_tejedor_hub', 12 * 16, 5 * 16, {
        color: '#4A2D6E', label: 'El Tejedor',
      });
      const tejedorSprite = assets.getImage('tejedor');
      if (tejedorSprite) {
        tejNPC.setSprite(tejedorSprite, { idleCols: 3, walkCols: 6, drawW: 36, drawH: 54 });
      }
      world.addNPC(tejNPC);
      setTimeout(() => dialogue.start('weaver_second_01'), 1000);
    }
  }

  // Acto 5 — Mateo sube al desván cuando Rosa lo invitó → descubrimiento + ending
  if (data.zoneId === 'R_HOME_ATTIC' &&
      save.getFlag('rosa_ending_invite_active') &&
      !save.getFlag('ending_seen')) {
    save.setFlag('ending_seen', true);
    if (!save.getFlag('attic_discovery_done')) {
      setTimeout(() => dialogue.start('attic_discovery_01'), 800);
    }
  }

  // M07 — Detectar grieta oculta en R_CEMETERY con visión felina activa
  if (data.zoneId === 'R_CEMETERY' &&
      missions.isActive('cemetery_child') &&
      vision.active &&
      !save.getFlag('rift_G_cemetery_child_discovered')) {
    // La grieta está en el rincón noreste (tile 18, 2 = 288, 32)
    const gx = 18 * 16, gy = 2 * 16;
    if (Math.hypot(mateo.centerX() - gx, mateo.centerY() - gy) < 60) {
      setTimeout(() => dialogue.start('cemetery_child_rift_discovered'), 400);
    }
  }

  // M05 epílogo A — Diego habla con Mateo en R_HUB después de completar la misión
  // (Diego está en R_HUB, no en R_CEMETERY; el diálogo suena raro en el cementerio)
  if (data.zoneId === 'R_HUB' &&
      save.getFlag('diego_resolution') === 'A' &&
      save.getFlag('hermano_echo_met') &&
      save.getFlag('mission_brothers_done') &&
      !save.getFlag('diego_a_epilogue_seen')) {
    setTimeout(() => dialogue.start('diego_res_A_later'), 1200);
  }

  // Auto-save on every zone transition
  save.save();

  // Umbral del Espejo — trigger post-ending en R_HOME
  if (data.zoneId === 'R_HOME' &&
      save.getFlag('ending_screen_shown') &&
      !save.getFlag('umbral_espejo_visto')) {
    setTimeout(() => dialogue.start('umbral_espejo_trigger_01'), 1500);
  }

  // Dama de la Niebla — texto de conexión con M01 si el faro fue completado y todos los fragmentos recogidos
  if (data.zoneId === 'V_LIGHTHOUSE' &&
      save.getFlag('fog_dama_all_fragments') &&
      save.getFlag('mission_lighthouse_done') &&
      !save.getFlag('fog_dama_m01_connection_seen')) {
    save.setFlag('fog_dama_m01_connection_seen', true);
    setTimeout(() => dialogue.start('inspect_fog_after_dama'), 2000);
  }

  // Umbral del Espejo — activación al subir al desván con el marco activo
  if (data.zoneId === 'R_HOME_ATTIC' &&
      save.getFlag('ending_screen_shown') &&
      !save.getFlag('umbral_espejo_visto') &&
      save.getFlag('umbral_espejo_trigger_01_seen') &&
      !save.getFlag('umbral_espejo_attic_triggered')) {
    save.setFlag('umbral_espejo_attic_triggered', true);
    setTimeout(() => dialogue.start('umbral_espejo_attic_01'), 800);
  }

  // Umbral — al entrar al plano abstracto, iniciar conversación con Luna
  if (data.zoneId === 'V_UMBRAL') {
    setTimeout(() => dialogue.start('umbral_luna_01'), 1500);
  }

  // Corazón Firme — monólogo de introspección al entrar a R_HOME después del desbloqueo
  if (data.zoneId === 'R_HOME' &&
      heartAnchor.unlocked &&
      !save.getFlag('heart_anchor_introspection_seen') &&
      save.getFlag('heart_anchor_tutorial_seen')) {
    setTimeout(() => dialogue.start('heart_anchor_introspection_01'), 1500);
  }

  // V_HEART — entrada al Corazón del Vacío con narración
  if (data.zoneId === 'V_HEART' && !save.getFlag('corazon_vacio_entrance_seen')) {
    setTimeout(() => dialogue.start('corazon_vacio_entrance_01'), 800);
  }

  // V_HEART — si el jugador vuelve con fragmentos pendientes, sigue explorando
  if (data.zoneId === 'V_HEART' &&
      save.getFlag('corazon_vacio_fragments_done') &&
      !save.getFlag('corazon_vacio_completed')) {
    setTimeout(() => dialogue.start('corazon_vacio_luna_01'), 1200);
  }

  // V_THRONE — Reina encuentro al entrar por primera vez
  if (data.zoneId === 'V_THRONE' && !save.getFlag('reina_met') && save.getFlag('reina_vacio_unlocked')) {
    save.setFlag('reina_throne_visited', true);
    // Spawnear Reina como NPC en el trono
    const reinaEntity = new Reina(170, 90);
    const reinaSprite = assets.getImage('reina_sprite');
    if (reinaSprite) {
      reinaEntity.setSprite(reinaSprite);
    }
    world.addCustomEntity(reinaEntity);
    // Spawnear Cortesanos
    const guardian = new Cortesano('cortesano_guardian', 120, 130, 'guardian');
    const whisperer = new Cortesano('cortesano_whisperer', 90, 110, 'whisperer');
    const architect = new Cortesano('cortesano_architect', 190, 115, 'architect');
    world.addCustomEntity(guardian);
    world.addCustomEntity(whisperer);
    world.addCustomEntity(architect);
    // Iniciar diálogo de encuentro
    setTimeout(() => dialogue.start('reina_encounter_01'), 1200);
  }

  // V_THRONE — Reina ya conocida, mostrar estado según resolución
  if (data.zoneId === 'V_THRONE' && save.getFlag('reina_met')) {
    const resolution = save.getFlag('reina_resolution');
    if (resolution === 'pacto') {
      // Trono iluminado
      save.setFlag('reina_throne_lit', true);
    } else if (resolution === 'confianza') {
      // Trono vacío — Reina prepara el camino
      save.setFlag('reina_throne_empty', true);
    }
  }
});

events.on('ending:show_screen', () => {
  const type = save.getFlag('ending_type') ?? 'ENDING_MINIMAL';
  const nodeMap = {
    ENDING_COMPLETE:  'ending_complete_01',
    ENDING_STANDARD:  'ending_standard_01',
    ENDING_MINIMAL:   'ending_minimal_01',
    ENDING_HARD:      'ending_hard_01',
  };
  transition.play('fade_black').then(() => {
    dialogue.start(nodeMap[type] ?? 'ending_epilogue');
  });
});

bond.onLevelChange = (level) => {
  vision.setVoidOverlayIntensity(
    level === 'HEALTHY' ? 0 : bond.voidOverlayIntensity()
  );
};

// ── Dama de la Niebla — completitud ──────────────────────────────────────────
events.on('fog:dama_complete', () => {
  voidFog.setPaletteShift(true);
  save.setFlag('fog_dama_released', true);
  // +3 permanente al vínculo (no acumulable)
  bond.applyStabilityBonus(3);
});

// ── Narrative combat encounters ───────────────────────────────────────────────
// Wave definitions per location — emotion-themed, difficulty scales with story progression

const ENCOUNTER_WAVES = {
  lighthouse: [
    [
      { emotion: 'longing', hp: 1, spd: 0.50, r: 5 },
      { emotion: 'longing', hp: 1, spd: 0.55, r: 5 },
      { emotion: 'longing', hp: 1, spd: 0.60, r: 4 },
    ],
    [
      { emotion: 'longing', hp: 2, spd: 0.45, r: 9 },
      { emotion: 'grief',   hp: 1, spd: 0.65, r: 5 },
      { emotion: 'grief',   hp: 1, spd: 0.70, r: 4 },
    ],
  ],
  beach: [
    [
      { emotion: 'fear', hp: 1, spd: 0.70, r: 5 },
      { emotion: 'fear', hp: 1, spd: 0.75, r: 5 },
      { emotion: 'fear', hp: 1, spd: 0.80, r: 4 },
      { emotion: 'fear', hp: 1, spd: 0.65, r: 5 },
    ],
    [
      { emotion: 'fear',  hp: 2, spd: 0.85, r: 6 },
      { emotion: 'fear',  hp: 2, spd: 0.90, r: 5 },
      { emotion: 'grief', hp: 1, spd: 0.80, r: 4 },
    ],
    [
      { emotion: 'fear', hp: 4, spd: 0.50, r: 13, boss: true },
    ],
  ],
  cemetery: [
    [
      { emotion: 'grief', hp: 1, spd: 0.55, r: 5 },
      { emotion: 'grief', hp: 1, spd: 0.60, r: 5 },
      { emotion: 'grief', hp: 1, spd: 0.65, r: 4 },
      { emotion: 'guilt', hp: 1, spd: 0.50, r: 5 },
    ],
    [
      { emotion: 'grief', hp: 4, spd: 0.40, r: 14, boss: true },
    ],
  ],
};

// Trigger combat intro dialogue on zone entry (flag-gated, once per encounter)
events.on('zone:loaded', ({ zoneId }) => {
  // void_first_entry check prevents collision with the tutorial on first V_LIGHTHOUSE entry
  if (zoneId === 'V_LIGHTHOUSE'
      && save.getFlag('void_first_entry')
      && !save.getFlag('lighthouse_combat_done')) {
    setTimeout(() => dialogue.start('lighthouse_guardians_01'), 900);
  }

  if (zoneId === 'V_BEACH'
      && !save.getFlag('beach_combat_done')) {
    setTimeout(() => dialogue.start('beach_combat_intro_01'), 900);
  }

  // Not while brothers mission is active — that context has its own barrier/echo flow
  if (zoneId === 'V_CEMETERY'
      && !missions.isActive('brothers')
      && !save.getFlag('cemetery_combat_done')) {
    setTimeout(() => dialogue.start('cemetery_combat_intro_01'), 900);
  }
});

// When the intro dialogue closes, start the encounter; handle win/lose
events.on('dialogue:node_exit', ({ nodeId }) => {
  if (nodeId === 'lighthouse_guardians_01') {
    (async () => {
      const result = await lunaMode.startEncounter({
        title:    'Guardianes del Faro',
        subtitle: 'Los ecos de Añoranza protegen la linterna',
        wavesDef: ENCOUNTER_WAVES.lighthouse,
      });
      if (result === 'win') {
        save.setFlag('lighthouse_combat_done', true);
        dialogue.start('lighthouse_combat_win_01');
      } else {
        dialogue.start('lighthouse_combat_lose_01');
        // No flag set — player can retry by re-entering V_LIGHTHOUSE
      }
    })();
  }

  if (nodeId === 'beach_combat_intro_01') {
    (async () => {
      const result = await lunaMode.startEncounter({
        title:    'El Miedo en las Aguas',
        subtitle: 'Los ecos de Miedo acechan a Mateo',
        wavesDef: ENCOUNTER_WAVES.beach,
      });
      if (result === 'win') {
        save.setFlag('beach_combat_done', true);
        dialogue.start('beach_combat_win_01');
      } else {
        dialogue.start('beach_combat_lose_01');
      }
    })();
  }

  if (nodeId === 'cemetery_combat_intro_01') {
    (async () => {
      const result = await lunaMode.startEncounter({
        title:    'Guardianes del Dolor',
        subtitle: 'El Pesar bloquea el acceso a la cripta',
        wavesDef: ENCOUNTER_WAVES.cemetery,
      });
      if (result === 'win') {
        save.setFlag('cemetery_combat_done', true);
        dialogue.start('cemetery_combat_win_01');
      } else {
        dialogue.start('cemetery_combat_lose_01');
      }
    })();
  }
});

// ── Zone display names ────────────────────────────────────────────────────────
const ZONE_NAMES = {
  R_HOME:        'Casa de Rosa',
  R_HOME_ATTIC:  'Desván',
  R_HUB:         'Plaza Central',
  R_LIGHTHOUSE:  'Faro de Miraloma',
  R_SCHOOL:      'Escuela de Música',
  R_BEACH:       'Playa Norte',
  R_CEMETERY:    'Cementerio',
  R_LIBRARY:     'Biblioteca',
  V_HOME:        'Jardín Marchito',
  V_HUB:         'Plaza del Vacío',
  V_LIGHTHOUSE:  'El Faro Hundido',
  V_SCHOOL:      'Aula Silenciosa',
  V_BEACH:       'El Naufragio',
  V_CEMETERY:    'La Cripta',
  V_LIBRARY:     'Archivo Borrado',
  V_UMBRAL:      'El Umbral',
  V_HEART:       'Corazón del Vacío',
  V_THRONE:      'El Trono del Vacío',
  R_CHAPTER0_HOUSE: 'Casa de Rosa (hace 6 años)',
  R_CHAPTER0_GARDEN: 'Jardín Nocturno',
};

// ── HUD state ─────────────────────────────────────────────────────────────────
let _hudElapsed      = 0;
let _controlsAlpha   = 1.0;
// Zone name announcement (D1)
let _zoneNameTimer = -1;
let _zoneNameAlpha = 0;
let _zoneNameText  = '';
let _zoneNameSub   = '';
// Seal notification (D2)
let _sealNotifTimer = -1;
let _sealNotifAlpha = 0;
let _sealNotifColor = '#C8A9FF';

// ── Ending determination ──────────────────────────────────────────────────────
function _determineEnding() {
  const missions_done = [
    'mission_lighthouse_done', 'mission_melody_done', 'mission_garden_done',
    'mission_dogs_done', 'mission_brothers_done', 'mission_library_done',
    'mission_cemetery_child_done',
  ].filter(f => save.getFlag(f)).length;

  const deepResolution = (save.getFlag('diego_resolution') !== 'A' &&
                          save.getFlag('diego_resolution') !== null) ||
                         save.getFlag('m07_resolution') === 'B';
  const secretsFound   = save.getFlag('abuelo_connection_unlocked') || save.getFlag('corazon_vacio_completed');
  const bondHealthy    = bond.normalized() > 0.6 && bond.bondCriticalCount < 2;
  const reinaResolved  = save.getFlag('reina_resolution') !== null &&
                         save.getFlag('reina_resolution') !== false;

  if ((missions_done === 7 || (missions_done >= 6 && reinaResolved)) &&
      deepResolution && secretsFound && bondHealthy) {
    return 'ENDING_COMPLETE';
  } else if (missions_done >= 5 && bondHealthy) {
    return 'ENDING_STANDARD';
  } else if (missions_done >= 3) {
    return 'ENDING_MINIMAL';
  }
  return 'ENDING_HARD';
}

// ── Async init ────────────────────────────────────────────────────────────────
async function init() {
  await document.fonts.load('10px VT323');
  const [json, lunaImg, lunaVoidImg, mateoImg] = await Promise.all([
    assets.loadJSON('dialogues', 'assets/data/dialogues.json'),
    assets.loadImage('luna_real',      'assets/sprites/luna_cat.png'),
    assets.loadImage('luna_void',      'assets/sprites/luna_noc.png'),
    assets.loadImage('mateo',          'assets/sprites/mateo.png'),
    assets.loadImage('tejedor',        'tejedor.png').catch(() => null),
    assets.loadImage('diego',          'diego.png').catch(() => null),
    assets.loadImage('hermano_diego',  'hermano_diego.png').catch(() => null),
    assets.loadImage('vera',           'vera.png').catch(() => null),
    assets.loadImage('rosa_sprite',    'rosa_sprite.png').catch(() => null),
    assets.loadImage('antonio_sprite', 'antonio_sprite.png').catch(() => null),
    assets.loadImage('reina_scene_img', 'reina.png').catch(() => null),
    assets.loadImage('reina_sprite',    'reina_v.png').catch(() => null),
    assets.loadImage('camila_sprite',    'camila.png').catch(() => null),
    assets.loadImage('ponce_sprite',     'ponce.png').catch(() => null),
    assets.loadImage('archivista_sprite','archivista.png').catch(() => null),
    assets.loadImage('abuelo_sprite',    'abuelo.png').catch(() => null),
    assets.loadImage('carmen_sprite',    'carmen.png').catch(() => null),
    assets.loadImage('emilia_sprite',    'emilia.png').catch(() => null),
    assets.loadImage('r_hub_piso',       'r_hub_piso.png').catch(() => null),
    assets.loadImage('piso_faro',        'piso_faro.png').catch(() => null),
    assets.loadImage('tabla_abuelo',     'tabla.png').catch(() => null),
    assets.loadImage('musica_piso',      'musica_piso.png').catch(() => null),
    assets.loadImage('tx_wall',          'assets/tiles/tx_wall.png').catch(() => null),
    assets.loadImage('tx_floor_wood',    'assets/tiles/tx_floor_wood.png').catch(() => null),
    assets.loadImage('tx_floor_stone',   'assets/tiles/tx_floor_stone.png').catch(() => null),
    assets.loadImage('tx_floor_sand',    'assets/tiles/tx_floor_sand.png').catch(() => null),
    assets.loadImage('tx_building',      'assets/tiles/tx_building.png').catch(() => null),
    assets.loadImage('tx_shelf',         'assets/tiles/tx_shelf.png').catch(() => null),
    assets.loadImage('tx_furniture',     'assets/tiles/tx_furniture.png').catch(() => null),
  ]);
  dialogue.loadDialogues(json);
  luna.setRealSprite(lunaImg);
  luna.setVoidSprite(lunaVoidImg);
  mateo.setSprite(mateoImg);

  // ── Portraits ────────────────────────────────────────────────────────────────
  function _makePortrait(color, initial) {
    const c = document.createElement('canvas');
    c.width = c.height = 22;
    const cx = c.getContext('2d');
    cx.fillStyle = color;
    cx.fillRect(0, 0, 22, 22);
    cx.fillStyle = '#fff';
    cx.font = 'bold 13px monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText(initial, 11, 12);
    return c;
  }

  function _cropFrame0(img) {
    if (!(img instanceof HTMLImageElement)) return img;
    const fw = Math.floor(img.naturalWidth  / 4);
    const fh = Math.floor(img.naturalHeight / 4);
    const pc = document.createElement('canvas');
    pc.width = fw; pc.height = fh;
    pc.getContext('2d').drawImage(img, 0, 0, fw, fh, 0, 0, fw, fh);
    return pc;
  }

  function _ghostify(canvas) {
    const gctx = canvas.getContext('2d');
    gctx.globalCompositeOperation = 'screen';
    gctx.fillStyle = 'rgba(100, 200, 255, 0.38)';
    gctx.fillRect(0, 0, canvas.width, canvas.height);
    gctx.globalCompositeOperation = 'source-over';
    return canvas;
  }

  const rosaImg     = assets.getImage('rosa_sprite')    ?? _makePortrait('#C49060', 'R');
  const antonioImg  = assets.getImage('antonio_sprite');
  const antonioPortrait = _ghostify(antonioImg ? _cropFrame0(antonioImg) : _makePortrait('#708090', 'A'));

  const camilaPortrait    = assets.getImage('camila_sprite')     ? _cropFrame0(assets.getImage('camila_sprite'))     : null;
  const poncePortrait     = assets.getImage('ponce_sprite')      ? _cropFrame0(assets.getImage('ponce_sprite'))      : null;
  const archivistaPortrait= assets.getImage('archivista_sprite') ? _cropFrame0(assets.getImage('archivista_sprite')) : null;
  const abueloPortrait    = assets.getImage('abuelo_sprite')     ? _cropFrame0(assets.getImage('abuelo_sprite'))     : null;
  const carmenPortrait    = assets.getImage('carmen_sprite')     ? _cropFrame0(assets.getImage('carmen_sprite'))     : null;
  const emiliaPortrait    = assets.getImage('emilia_sprite')     ? _cropFrame0(assets.getImage('emilia_sprite'))     : null;

  for (const id of ['rosa_neutral','rosa_warm','rosa_thoughtful','rosa_sad','rosa_worried',
                    'rosa_peaceful','rosa_resigned','rosa_serious','rosa_shocked','rosa_crying']) {
    dialogue.loadPortrait(id, rosaImg);
  }
  for (const id of ['antonio_confused','antonio_sad','antonio_shocked',
                    'antonio_reading','antonio_peaceful','antonio_fading']) {
    dialogue.loadPortrait(id, antonioPortrait);
  }
  for (const id of ['mateo_worried','mateo_relieved','mateo_curious','mateo_neutral',
                    'mateo_serious','mateo_calm','mateo_gentle','mateo_focused',
                    'mateo_reading','mateo_sad','mateo_scared_soft','mateo_soft',
                    'mateo_surprised','mateo_thinking','mateo_thoughtful',
                    'mateo_translating','mateo_uncertain','mateo_nod']) {
    dialogue.loadPortrait(id, mateoImg);
  }

  const npcPortraits = {
    vera:      _makePortrait('#7BAFD4', 'V'),
    diego:     _makePortrait('#9B7FE8', 'D'),
    hermano:   _ghostify(_makePortrait('#8B6FD4', 'H')),
    carmen:    carmenPortrait     ?? _makePortrait('#E8A87C', 'C'),
    ponce:     poncePortrait      ?? _makePortrait('#7EC8A0', 'P'),
    archivist: _ghostify(archivistaPortrait ?? _makePortrait('#C8A9FF', 'A')),
    weaver:    _ghostify(_makePortrait('#2A1A4E', 'T')),
    abuelo:    _ghostify(abueloPortrait     ?? _makePortrait('#8B6030', 'G')),
    emilia:    emiliaPortrait ?? _makePortrait('#A08060', 'E'),
    tomas:     _ghostify(_makePortrait('#7FB8D0', 'T')),
  };
  const npcPortraitMap = {
    vera:      ['vera_confused','vera_sad','vera_hopeful','vera_excited','vera_peaceful'],
    diego:     ['diego_neutral','diego_sad','diego_defensive','diego_grieving',
                'diego_struggling','diego_resolved','diego_grateful','diego_hopeful',
                'diego_awkward','diego_nervous','diego_relieved','diego_surprised',
                'diego_emotional','diego_peaceful','diego_shocked','diego_overwhelmed',
                'diego_walking_away','diego_determined','diego_at_rift','diego_crying',
                'diego_calm','diego_distant'],
    hermano:   ['hermano_confused','hermano_sad','hermano_peaceful','hermano_fading',
                'hermano_dim','hermano_relieved','hermano_determined','hermano_hopeful'],
    carmen:    ['carmen_neutral','carmen_grateful','carmen_worried','carmen_sad'],
    ponce:     ['ponce_neutral','ponce_worried','ponce_curious','ponce_shocked','ponce_grateful'],
    archivist: ['archivist_hostile','archivist_defensive','archivist_confused',
                'archivist_breaking','archivist_fading','archivist_relieved'],
    weaver:    ['weaver_shadow','weaver_curious','weaver_enigmatic'],
    abuelo:    ['abuelo_confused','abuelo_sad','abuelo_hopeful','abuelo_fading'],
    emilia:    ['emilia_worried','emilia_sad','emilia_hopeful','emilia_pleading',
                'emilia_grateful','emilia_at_tree','emilia_crying_warm','emilia_resolved',
                'emilia_warm','emilia_thoughtful'],
    tomas:     ['tomas_curious','tomas_confused','tomas_hopeful','tomas_sad',
                'tomas_scared','tomas_peaceful','tomas_realizing','tomas_crying',
                'tomas_crying_soft','tomas_fading'],
  };
  for (const [key, ids] of Object.entries(npcPortraitMap)) {
    for (const id of ids) dialogue.loadPortrait(id, npcPortraits[key]);
  }
  dialogue.setSceneImage('reina_scene_img', assets.getImage('reina_scene_img'));
  dialogue.setSceneImage('reina_sprite',    assets.getImage('reina_sprite'));
  const mode = await titleScreen.start();

  if (mode === 'luna_mode') {
    await lunaMode.start();
    location.reload();
    return;
  }

  if (mode === 'chapter0') {
    await chapterMgr.startChapter0();
    return;
  }

  if (mode === 'continue' && save.hasSave()) {
    const data = save.load();
    save.applyLoad(data);
    // Restaurar estado de Corazón Firme desde el save
    heartAnchor.restoreUnlocked(save.getFlag('mateo_heart_anchor_unlocked', false));
    echoReading.restoreUnlocked(save.getFlag('mateo_echo_reading_unlocked', false));
  } else {
    save.deleteSave();
  }
  await prologue.start();
  save.setFlag('game_started', true);
  // Verificar desbloqueo de Corazón Firme al inicio
  heartAnchor.checkUnlock();
  await scenes.load('R_HOME');
}

init().catch(console.error);

// ── Update system ─────────────────────────────────────────────────────────────
const worldUpdate = {
  update(dt) {
    particles.update(dt);           // always run — also needed by lunaMode
    voidFog.update(dt);
    zoneParticles.update(dt);
    _hudElapsed += dt;
    if (_controlsAlpha > 0 && _hudElapsed > 8000) {
      _controlsAlpha = Math.max(0, 1 - (_hudElapsed - 8000) / 3000);
    }
    if (_zoneNameTimer >= 0) {
      _zoneNameTimer += dt;
      if      (_zoneNameTimer < 300)  _zoneNameAlpha = _zoneNameTimer / 300;
      else if (_zoneNameTimer < 1500) _zoneNameAlpha = 1;
      else if (_zoneNameTimer < 2000) _zoneNameAlpha = (2000 - _zoneNameTimer) / 500;
      else { _zoneNameAlpha = 0; _zoneNameTimer = -1; }
    }
    if (_sealNotifTimer >= 0) {
      _sealNotifTimer += dt;
      if      (_sealNotifTimer < 400)  _sealNotifAlpha = _sealNotifTimer / 400;
      else if (_sealNotifTimer < 1600) _sealNotifAlpha = 1;
      else if (_sealNotifTimer < 2200) _sealNotifAlpha = (2200 - _sealNotifTimer) / 600;
      else { _sealNotifAlpha = 0; _sealNotifTimer = -1; }
    }
    if (lunaMode.active) return;    // lunaMode owns the loop while active

    const dialogueOpen = dialogue.isVisible();

    // Luna visible en el mundo real solo cuando no está desaparecida,
    // o cuando estamos en el Vacío (allí es donde está atrapada)
    luna.visible = !save.getFlag('luna_missing') || dimension.isVoid();

    if (!dialogueOpen) {
      if (piano.active || minigameObs.isPatternActive()) {
        mateo.vx = 0; mateo.vy = 0;
      } else {
        mateo.update(dt);
      }
      luna.update(dt);
      echoes.update(dt);
    }

    world.update(dt);
    bond.update(dt);
    rifts.update(dt);
    vision.update(dt);
    transition.update(dt);
    dialogue.update(dt);
    missions.update(dt);
    heartAnchor.update(dt);
    echoReading.update(dt);
    hints.update(dt);
    piano.update(dt);
    minigameObs.update(dt);
    // Alimentar posición del jugador al minigame de observación si está activo
    if (minigameObs.isObservationActive()) {
      minigameObs.updateObservation(mateo.centerX(), mateo.centerY());
    }
    if (minigameObs.isPatternActive()) {
      minigameObs.updatePattern();
    }


    if (!dialogueOpen) {
      // Call Luna (Q key)
      if (input.wasPressed('call_luna')) events.emit('luna:called');
      // Corazón Firme (F key)
      if (input.wasPressed('heart_anchor')) {
        if (!dialogueOpen) heartAnchor.activate();
      }

      // Capítulo 0 / menú de capítulos (M key)
      if (input.wasPressed('chapter_menu')) {
        if (save.getFlag('chapter_umbral_unlocked')) {
          dialogue.start('capitulo0_intro_01');
        }
      }

      if (world.loaded) {
        // Reencuentro con Luna — por proximidad, solo después de que el tutorial de Vacío completó
        if (scenes.currentZoneId === 'V_LIGHTHOUSE' &&
            save.getFlag('luna_missing') &&
            !save.getFlag('luna_found_void') &&
            save.getFlag('void_first_entry') &&
            Math.hypot(luna.centerX() - mateo.centerX(), luna.centerY() - mateo.centerY()) < 45) {
          save.setFlag('luna_found_void', true);
          dialogue.start('luna_lighthouse_reunion_01');
        }

        // Zone exit triggers
        scenes.checkExits(mateo);

        // Item pick-up triggers
        world.checkItemTriggers(mateo, save, events, echoes);

        // Auto-combine partitura pieces once all 4 are found
        if (!save.hasItem('I_partitura_completa') &&
            save.getFlag('partitura_1_found') && save.getFlag('partitura_2_found') &&
            save.getFlag('partitura_3_found') && save.getFlag('partitura_4_found')) {
          save.addItem('I_partitura_completa');
          events.emit('item:combined', { resultId: 'I_partitura_completa' });
        }

        // Auto-combine document fragments once all 3 are found
        if (!save.hasItem('I_documentos_reconstruidos') &&
            save.getFlag('fragmento_doc_1_found') &&
            save.getFlag('fragmento_doc_2_found') &&
            save.getFlag('fragmento_doc_3_found')) {
          save.addItem('I_documentos_reconstruidos');
          events.emit('item:combined', { resultId: 'I_documentos_reconstruidos' });
        }

        // Ending trigger — all 7 (or 8 with M08) missions done
        if (!save.getFlag('ending_triggered') &&
            save.getFlag('mission_lighthouse_done') &&
            save.getFlag('mission_melody_done') &&
            save.getFlag('mission_garden_done') &&
            save.getFlag('mission_dogs_done') &&
            save.getFlag('mission_brothers_done') &&
            save.getFlag('mission_library_done') &&
            save.getFlag('mission_cemetery_child_done')) {
          save.setFlag('ending_triggered', true);
          save.setFlag('ending_type', _determineEnding());
          save.setFlag('rosa_ending_invite_active', true);
          events.emit('ending:triggered');
        }

        // Ending seen — fade to end screen
        if (save.getFlag('ending_seen') && !save.getFlag('ending_screen_shown')) {
          save.setFlag('ending_screen_shown', true);
          events.emit('ending:show_screen');
        }

        // Interact (E key)
        if (input.wasPressed('interact') && !dimension.transitioning && !piano.active && !minigameObs.isObservationActive() && !minigameObs.isPatternActive()) {
          const nearRift = rifts.nearestUnsealedInRange(
            mateo.centerX(), mateo.centerY(), 24);

          if (nearRift) {
            // If zone has a linked dimension counterpart, do a zone+dim switch
            const linkedVoid = world.voidZoneId;
            const linkedReal = world.realZoneId;
            if (!dimension.isVoid() && linkedVoid) {
              // Block void entry until Luna disappears at the lighthouse (Acto 2)
              if (!save.getFlag('luna_missing') && !save.getFlag('luna_found_void')) {
                dialogue.start('void_locked');
              } else {
                scenes.switchDimension(linkedVoid, 'void', 'from_real');
              }
            } else if (dimension.isVoid() && linkedReal) {
              scenes.switchDimension(linkedReal, 'real', 'from_void');
            }
            // No fallback toggle — zones without a linked counterpart aren't enterable
          } else if (!dialogue.isVisible()) {
            const npc = world.nearestNPC(mateo.centerX(), mateo.centerY(), 32);
            if (npc) {
              dialogue.start(npc.dialogueId);
            } else {
              const obj = world.nearestObject(mateo.centerX(), mateo.centerY(), 32);
              if (obj && !(obj.doneFlag && save.getFlag(obj.doneFlag))) {
                const nodeId = (obj.unlockFlag && save.getFlag(obj.unlockFlag))
                  ? (obj.dialogueIdUnlocked ?? obj.dialogueId)
                  : obj.dialogueId;
                dialogue.start(nodeId);
              }
            }
          }
        }
      }

      // Per-frame lights
      lighting.addLight(mateo.centerX(), mateo.centerY(), 80);
      if (dimension.isVoid()) {
        lighting.addLight(luna.centerX(), luna.centerY(), 120, '#C8A9FF', 1.0);
      }
    }
  },
};

// ── Render system ─────────────────────────────────────────────────────────────
const worldRender = {
  render(ctx, alpha) {
    if (lunaMode.active) return;   // lunaMode renders its own scene
    camera.apply(ctx);
    world.render(ctx, alpha);       // tiles + NPCs
    _renderExitHints(ctx);
    voidFog.render(ctx, alpha, camera);
    rifts.render(ctx, alpha);
    particles.render(ctx);
    echoes.render(ctx, alpha);
    luna.render(ctx, alpha);
    mateo.render(ctx, alpha);
    camera.restore(ctx);

    zoneParticles.render(ctx);
    lighting.renderDarkness(ctx);
    vision.render(ctx, alpha);
    heartAnchor.render(ctx, alpha);
    echoReading.render(ctx, alpha, camera);
    transition.render(ctx, alpha);

    dialogue.render(ctx);
    hints.render(ctx);
    _renderHUD(ctx);
    minimap.render(ctx, mateo, luna);
    piano.render(ctx);
    minigameObs.render(ctx, alpha);
    input.renderTouchControls(ctx);
  },
};

// A2 — Exit arrows drawn in world-space (called inside camera.apply)
function _renderExitHints(ctx) {
  if (!world.loaded) return;
  const mx    = mateo.centerX();
  const my    = mateo.centerY();
  const col   = dimension.isVoid() ? '#9B7FE8' : '#FFD97D';
  const pulse = 0.6 + 0.4 * Math.sin(_hudElapsed / 380);
  for (const exit of world.exits) {
    const cx = exit.x + (exit.width  ?? 16) / 2;
    const cy = exit.y + (exit.height ?? 16) / 2;
    const d  = Math.hypot(cx - mx, cy - my);
    if (d > 72) continue;
    const fa    = pulse * Math.max(0.25, 1 - d / 72);
    const angle = Math.atan2(cy - my, cx - mx);
    ctx.save();
    ctx.globalAlpha = fa;
    ctx.fillStyle   = col;
    ctx.shadowColor = col;
    ctx.shadowBlur  = 6;
    ctx.translate(Math.round(cx), Math.round(cy));
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-5, -4);
    ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();
    if (d < 56) {
      ctx.rotate(-angle);
      ctx.shadowBlur = 2;
      ctx.font = '8px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ZONE_NAMES[exit.targetZone] ?? '', 0, -11);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }
}

function _renderHUD(ctx) {
  // C3 — Rift emotion ambient tint (very subtle)
  const unsealedRifts = rifts.getAll().filter(r => !r.sealed && r.active);
  if (unsealedRifts.length > 0) {
    const riftPulse = 0.5 + 0.5 * Math.sin(_hudElapsed / 2000);
    ctx.globalAlpha = 0.05 * riftPulse;
    ctx.fillStyle   = EMOTION_COLORS[unsealedRifts[0].emotion] ?? '#9B7FE8';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    ctx.globalAlpha = 1;
  }

  // Bond danger vignette
  const bondLevel = bond.currentLevel();
  if (bondLevel === 'CRITICAL' || bondLevel === 'DANGER') {
    const pulse     = 0.5 + 0.5 * Math.sin(_hudElapsed / (bondLevel === 'CRITICAL' ? 280 : 560));
    const intensity = bondLevel === 'CRITICAL' ? 0.28 : 0.13;
    ctx.globalAlpha = intensity * pulse;
    ctx.fillStyle   = bondLevel === 'CRITICAL' ? '#FF1010' : '#FF5010';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    ctx.globalAlpha = 1;
  }

  // Bond bar
  const BW = 60, BH = 5, BX = BASE_WIDTH - BW - 6, BY = 12;
  const COLORS = { HEALTHY: '#5DBB63', WARNING: '#E8B94F', DANGER: '#D4703A', CRITICAL: '#9E3A3A' };
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(BX - 1, BY - 1, BW + 2, BH + 2);
  ctx.fillStyle = COLORS[bondLevel];
  ctx.fillRect(BX, BY, Math.round(bond.normalized() * BW), BH);
  ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;

  ctx.fillStyle = '#fff'; ctx.font = '8px VT323, monospace';
  ctx.fillText('vínculo', BX, BY - 2);

  // Dimension + zone name
  ctx.fillStyle = dimension.isVoid() ? '#9B7FE8' : '#87CEEB';
  ctx.font = '10px VT323, monospace';
  ctx.fillText(dimension.isVoid() ? 'VACÍO' : 'REAL', 6, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '8px VT323, monospace';
  const zoneId = scenes.currentZoneId;
  ctx.fillText(ZONE_NAMES[zoneId] ?? zoneId ?? '…', 6, 24);

  // Active mission + step
  const active = ['lighthouse','melody','garden','dogs','brothers','library','cemetery_child','umbral_espejo','grandfather']
    .find(id => missions.isActive(id));
  if (active) {
    const m    = missions.get(active);
    const step = m ? Math.min(m.getStep() + 1, m.steps.length) : 1;
    const tot  = m?.steps.length ?? 1;
    ctx.fillStyle = 'rgba(155,127,232,0.8)'; ctx.font = '8px VT323, monospace';
    ctx.fillText(`▶ ${m?.title ?? active}  ${step}/${tot}`, 6, 34);
  }

  // Controls hint (fades after 8s)
  if (_controlsAlpha > 0) {
    ctx.globalAlpha = _controlsAlpha * 0.45;
    ctx.fillStyle = '#ffffff'; ctx.font = '8px VT323, monospace';
    const fText = heartAnchor.unlocked ? '   [F] pulso' : '';
    ctx.fillText('[E] interactuar   [Q] llamar Luna   [Shift] visión felina' + fText, 6, BASE_HEIGHT - 4);
    ctx.globalAlpha = 1;
  }

  // D1 — Zone name announcement
  if (_zoneNameAlpha > 0) {
    ctx.globalAlpha = _zoneNameAlpha;
    ctx.fillStyle   = 'rgba(0,0,0,0.40)';
    ctx.fillRect(0, BASE_HEIGHT / 2 - 22, BASE_WIDTH, 30);
    ctx.shadowColor   = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur    = 4;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle   = '#FFFFFF';
    ctx.font        = '14px VT323, monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(_zoneNameText, BASE_WIDTH / 2, BASE_HEIGHT / 2 - 4);
    ctx.fillStyle   = 'rgba(255,255,255,0.50)';
    ctx.font        = '8px VT323, monospace';
    ctx.fillText(_zoneNameSub, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 6);
    ctx.textAlign   = 'left';
    ctx.globalAlpha = 1;
  }

  // D2 — Rift sealed notification
  if (_sealNotifAlpha > 0) {
    ctx.globalAlpha = _sealNotifAlpha;
    ctx.shadowColor = _sealNotifColor;
    ctx.shadowBlur  = 6;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle   = _sealNotifColor;
    ctx.font        = '10px VT323, monospace';
    ctx.textAlign   = 'center';
    ctx.fillText('✦ Grieta sellada', BASE_WIDTH / 2, 18);
    ctx.textAlign   = 'left';
    ctx.globalAlpha = 1;
  }

  ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}

// ── Register in Game ──────────────────────────────────────────────────────────
game.registerUpdateSystem(titleScreen); // first: title screen before everything
game.registerUpdateSystem(prologue);   // second: prologue cards
game.registerUpdateSystem(lunaMode);   // combat mode (inactive unless triggered)
game.registerUpdateSystem(camera);
game.registerUpdateSystem(worldUpdate);
game.registerUpdateSystem(input);
game.registerRenderSystem(worldRender);
game.registerRenderSystem(lunaMode);    // draws when active
game.registerRenderSystem(prologue);    // draws on top while active
game.registerRenderSystem(titleScreen); // last: title screen on top of everything

game.start();
