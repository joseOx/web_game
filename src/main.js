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

// Missions
import { Mission01Lighthouse } from './missions/data/mission_01_lighthouse.js';
import { Mission02Melody }     from './missions/data/mission_02_melody.js';
import { Mission03Garden }     from './missions/data/mission_03_garden.js';
import { Mission04Dogs }       from './missions/data/mission_04_dogs.js';
import { Mission05Brothers }   from './missions/data/mission_05_brothers.js';
import { Mission06Library }    from './missions/data/mission_06_library.js';

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
export const world     = new World();
export const scenes    = new SceneManager();
export const game      = new Game(canvas);

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

dimension.inject({ transitionFX: transition, lightingSystem: lighting, riftSystem: rifts, audioSystem: audio, eventBus: events });
rifts.inject({ saveSystem: save, missionManager: missions, audioSystem: audio, eventBus: events });
vision.inject({ input, riftSystem: rifts, eventBus: events, luna });
dialogue.inject({ input, saveSystem: save, missionManager: missions, riftSystem: rifts, audioSystem: audio, visionSystem: vision, eventBus: events });

hints.inject({ rifts, dimension, vision, dialogue, mateo });
piano.inject({ audio, eventBus: events });
prologue.inject({ input });
titleScreen.inject({ input, hasSave: save.hasSave() });

scenes.inject({
  world, mateo, luna, echoes, rifts, camera, collision,
  dimension, lighting, audio, dialogue, transition, save, eventBus: events,
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

// ── EventBus wiring ───────────────────────────────────────────────────────────
events.on('dimension:changed', ({ dim }) => {
  luna.setDimension(dim);
  echoes.setDimension(dim);
  world.setDimension(dim);
  lighting.setTimeOfDay(dim === 'void' ? 'night' : 'day');
  audio.startAmbient(dim === 'void');
  audio.playTone(dim === 'void' ? 220 : 330, 1.2, 'sawtooth', 0.06);
});

const EMOTION_COLORS = { grief:'#7EC8E3', guilt:'#B8E07A', fear:'#C8A9FF', anger:'#FF8C8C', longing:'#FFD97D' };
events.on('rift:sealed', data => {
  missions.dispatchEvent('rift:sealed', data);
  if (data.x != null) particles.emit(data.x, data.y, EMOTION_COLORS[data.emotion] ?? '#fff', 30);
  audio.playTone(440, 0.6, 'sine', 0.12);
  if (data.riftId === 'G_lighthouse_lantern') {
    setTimeout(() => dialogue.start('lighthouse_sealed_hint'), 800);
  }
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
        emAI.inject({ echo: em, luna, mateo, riftSystem: rifts, dimensionManager: dimension });
        emAI.setGuard();
        em.setAI(emAI);
        echoes.register(em);
      }
      setTimeout(() => dialogue.start('beach_phase2_01'), 600);
    }
  }
});
events.on('item:picked',       data => { missions.dispatchEvent('item:picked', data);   audio.playTone(660, 0.2, 'triangle', 0.10); });
events.on('item:combined',     data => { missions.dispatchEvent('item:combined', data); audio.playTone(880, 0.4, 'sine',     0.15); });
events.on('piano:melody_complete', () => { rifts.completeSealing('G_school_piano'); });
events.on('zone:loaded', data => {
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

  // Aplicar sprite de Diego en R_HUB
  if (data.zoneId === 'R_HUB') {
    const diegoSprite = assets.getImage('diego');
    if (diegoSprite) {
      world.getNPC('diego')?.setMateoSprite(diegoSprite, { drawW: 28, drawH: 28 });
    }
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
      emAI.inject({ echo: em, luna, mateo, riftSystem: rifts, dimensionManager: dimension });
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

  // M01 — Pista de guardianes del farol (solo cuando la misión está activa)
  if (data.zoneId === 'V_LIGHTHOUSE' &&
      missions.isActive('lighthouse') &&
      !save.getFlag('mission_lighthouse_done') &&
      !save.getFlag('lighthouse_guard_hint_shown')) {
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

// ── Ending determination ──────────────────────────────────────────────────────
function _determineEnding() {
  const missions_done = [
    'mission_lighthouse_done', 'mission_melody_done', 'mission_garden_done',
    'mission_dogs_done', 'mission_brothers_done', 'mission_library_done',
  ].filter(f => save.getFlag(f)).length;

  const deepResolution = save.getFlag('diego_resolution') !== 'A' &&
                         save.getFlag('diego_resolution') !== null;
  const secretsFound   = save.getFlag('abuelo_connection_unlocked');
  const bondHealthy    = bond.normalized() > 0.6 && bond.bondCriticalCount < 2;

  if (missions_done === 6 && deepResolution && secretsFound && bondHealthy) {
    return 'ENDING_COMPLETE';
  } else if (missions_done >= 4 && bondHealthy) {
    return 'ENDING_STANDARD';
  } else if (missions_done >= 2) {
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

  const rosaImg     = assets.getImage('rosa_sprite')    ?? _makePortrait('#C49060', 'R');
  const antonioImg  = assets.getImage('antonio_sprite') ?? _makePortrait('#708090', 'A');

  for (const id of ['rosa_neutral','rosa_warm','rosa_thoughtful','rosa_sad','rosa_worried',
                    'rosa_peaceful','rosa_resigned','rosa_serious','rosa_shocked','rosa_crying']) {
    dialogue.loadPortrait(id, rosaImg);
  }
  for (const id of ['antonio_confused','antonio_sad','antonio_shocked',
                    'antonio_reading','antonio_peaceful','antonio_fading']) {
    dialogue.loadPortrait(id, antonioImg);
  }
  for (const id of ['mateo_worried','mateo_relieved','mateo_curious','mateo_neutral',
                    'mateo_serious','mateo_calm','mateo_gentle','mateo_focused',
                    'mateo_reading','mateo_sad','mateo_scared_soft','mateo_soft',
                    'mateo_surprised','mateo_thinking','mateo_thoughtful',
                    'mateo_translating','mateo_uncertain']) {
    dialogue.loadPortrait(id, mateoImg);
  }

  const npcPortraits = {
    vera:      _makePortrait('#7BAFD4', 'V'),
    diego:     _makePortrait('#9B7FE8', 'D'),
    hermano:   _makePortrait('#8B6FD4', 'H'),
    carmen:    _makePortrait('#E8A87C', 'C'),
    ponce:     _makePortrait('#7EC8A0', 'P'),
    archivist: _makePortrait('#C8A9FF', 'A'),
    weaver:    _makePortrait('#2A1A4E', 'T'),
    abuelo:    _makePortrait('#8B6030', 'G'),
  };
  const npcPortraitMap = {
    vera:      ['vera_confused','vera_sad','vera_hopeful','vera_excited','vera_peaceful'],
    diego:     ['diego_neutral','diego_sad','diego_defensive','diego_grieving',
                'diego_struggling','diego_resolved','diego_grateful','diego_hopeful'],
    hermano:   ['hermano_confused','hermano_sad','hermano_peaceful','hermano_fading'],
    carmen:    ['carmen_neutral','carmen_grateful','carmen_worried','carmen_sad'],
    ponce:     ['ponce_neutral','ponce_worried','ponce_curious','ponce_shocked','ponce_grateful'],
    archivist: ['archivist_hostile','archivist_defensive','archivist_confused',
                'archivist_breaking','archivist_fading'],
    weaver:    ['weaver_shadow','weaver_curious','weaver_enigmatic'],
    abuelo:    ['abuelo_confused','abuelo_sad','abuelo_hopeful','abuelo_fading'],
  };
  for (const [key, ids] of Object.entries(npcPortraitMap)) {
    for (const id of ids) dialogue.loadPortrait(id, npcPortraits[key]);
  }
  const newGame = await titleScreen.start();
  if (!newGame && save.hasSave()) {
    const data = save.load();
    save.applyLoad(data);
  } else {
    save.deleteSave();
  }
  await prologue.start();
  save.setFlag('game_started', true);
  await scenes.load('R_HOME');
}

init().catch(console.error);

// ── Update system ─────────────────────────────────────────────────────────────
const worldUpdate = {
  update(dt) {
    const dialogueOpen = dialogue.isVisible();

    // Luna visible en el mundo real solo cuando no está desaparecida,
    // o cuando estamos en el Vacío (allí es donde está atrapada)
    luna.visible = !save.getFlag('luna_missing') || dimension.isVoid();

    if (!dialogueOpen) {
      if (piano.active) {
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
    particles.update(dt);
    vision.update(dt);
    transition.update(dt);
    dialogue.update(dt);
    missions.update(dt);
    hints.update(dt);
    piano.update(dt);


    if (!dialogueOpen) {
      // Call Luna (Q key)
      if (input.wasPressed('call_luna')) events.emit('luna:called');

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

        // Ending trigger — all 6 missions done
        if (!save.getFlag('ending_triggered') &&
            save.getFlag('mission_lighthouse_done') &&
            save.getFlag('mission_melody_done') &&
            save.getFlag('mission_garden_done') &&
            save.getFlag('mission_dogs_done') &&
            save.getFlag('mission_brothers_done') &&
            save.getFlag('mission_library_done')) {
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
        if (input.wasPressed('interact') && !dimension.transitioning && !piano.active) {
          const nearRift = rifts.nearestUnsealedInRange(
            mateo.centerX(), mateo.centerY(), 48);

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
              if (obj) {
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
    camera.apply(ctx);
    world.render(ctx, alpha);       // tiles + NPCs
    rifts.render(ctx, alpha);
    particles.render(ctx);
    echoes.render(ctx, alpha);
    luna.render(ctx, alpha);
    mateo.render(ctx, alpha);
    camera.restore(ctx);

    lighting.renderDarkness(ctx);
    vision.render(ctx, alpha);
    transition.render(ctx, alpha);

    dialogue.render(ctx);
    hints.render(ctx);
    _renderHUD(ctx);
    piano.render(ctx);
    input.renderTouchControls(ctx);
  },
};

function _renderHUD(ctx) {
  // Bond bar
  const BW = 60, BH = 5, BX = BASE_WIDTH - BW - 6, BY = 12;
  const COLORS = { HEALTHY: '#5DBB63', WARNING: '#E8B94F', DANGER: '#D4703A', CRITICAL: '#9E3A3A' };
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(BX - 1, BY - 1, BW + 2, BH + 2);
  ctx.fillStyle = COLORS[bond.currentLevel()];
  ctx.fillRect(BX, BY, Math.round(bond.normalized() * BW), BH);
  ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;

  ctx.fillStyle = '#fff'; ctx.font = '8px VT323, monospace';
  ctx.fillText('vínculo', BX, BY - 2);

  // Dimension + zone
  ctx.fillStyle = dimension.isVoid() ? '#9B7FE8' : '#87CEEB';
  ctx.font = '10px VT323, monospace';
  ctx.fillText(dimension.isVoid() ? 'VACÍO' : 'REAL', 6, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '8px VT323, monospace';
  ctx.fillText(scenes.currentZoneId ?? '…', 6, 24);

  // Active mission
  const active = ['lighthouse','melody','garden','dogs','brothers','library']
    .find(id => missions.isActive(id));
  if (active) {
    ctx.fillStyle = 'rgba(155,127,232,0.8)'; ctx.font = '8px VT323, monospace';
    ctx.fillText(`▶ ${missions.get(active)?.title ?? active}`, 6, 34);
  }

  // Luna AI state
  ctx.fillStyle = 'rgba(155,127,232,0.5)'; ctx.font = '8px VT323, monospace';
  ctx.fillText(`Luna: ${lunaAI.state}`, 6, BASE_HEIGHT - 12);

  // Controls hint
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '8px VT323, monospace';
  ctx.fillText('[E] interactuar   [Q] llamar Luna   [Shift] visión felina', 6, BASE_HEIGHT - 4);

  ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}

// ── Register in Game ──────────────────────────────────────────────────────────
game.registerUpdateSystem(titleScreen); // first: title screen before everything
game.registerUpdateSystem(prologue);   // second: prologue cards
game.registerUpdateSystem(camera);
game.registerUpdateSystem(worldUpdate);
game.registerUpdateSystem(input);
game.registerRenderSystem(worldRender);
game.registerRenderSystem(prologue);    // draws on top while active
game.registerRenderSystem(titleScreen); // last: title screen on top of everything

game.start();
