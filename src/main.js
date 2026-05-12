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
import { MissionManager } from './missions/MissionManager.js';
import { World } from './world/World.js';
import { SceneManager } from './world/SceneManager.js';
import { Mateo } from './entities/Mateo.js';
import { Luna } from './entities/Luna.js';

// Missions
import { Mission01Lighthouse } from './missions/data/mission_01_lighthouse.js';
import { Mission02Melody }     from './missions/data/mission_02_melody.js';
import { Mission03Garden }     from './missions/data/mission_03_garden.js';
import { Mission04Dogs }       from './missions/data/mission_04_dogs.js';
import { Mission05Brothers }   from './missions/data/mission_05_brothers.js';
import { Mission06Library }    from './missions/data/mission_06_library.js';

// Zone definitions
import { ZoneR_HOME }        from './world/zones/ZoneR_HOME.js';
import { ZoneR_HUB }         from './world/zones/ZoneR_HUB.js';
import { ZoneR_LIGHTHOUSE }  from './world/zones/ZoneR_LIGHTHOUSE.js';
import { ZoneV_LIGHTHOUSE }  from './world/zones/ZoneV_LIGHTHOUSE.js';
import { ZoneR_SCHOOL }      from './world/zones/ZoneR_SCHOOL.js';
import { ZoneV_SCHOOL }      from './world/zones/ZoneV_SCHOOL.js';

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
export const world     = new World();
export const scenes    = new SceneManager();
export const game      = new Game(canvas);

// ── Entities ─────────────────────────────────────────────────────────────────
const mateo = new Mateo(BASE_WIDTH / 2, BASE_HEIGHT / 2 + 20);
const luna  = new Luna(BASE_WIDTH / 2 + 22, BASE_HEIGHT / 2 + 20);

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

scenes.inject({
  world, mateo, luna, echoes, rifts, camera, collision,
  dimension, lighting, audio, dialogue, transition, save, eventBus: events,
});
scenes.register(ZoneR_HOME);
scenes.register(ZoneR_HUB);
scenes.register(ZoneR_LIGHTHOUSE);
scenes.register(ZoneV_LIGHTHOUSE);
scenes.register(ZoneR_SCHOOL);
scenes.register(ZoneV_SCHOOL);

// ── EventBus wiring ───────────────────────────────────────────────────────────
events.on('dimension:changed', ({ dim }) => {
  luna.setDimension(dim);
  echoes.setDimension(dim);
  world.setDimension(dim);
  lighting.setTimeOfDay(dim === 'void' ? 'night' : 'day');
});

events.on('rift:sealed',       data => missions.dispatchEvent('rift:sealed',       data));
events.on('dialogue:node_exit',data => missions.dispatchEvent('dialogue:node_exit', data));
events.on('item:picked',       data => missions.dispatchEvent('item:picked',        data));
events.on('item:combined',     data => missions.dispatchEvent('item:combined',      data));
events.on('zone:loaded', data => {
  // Auto-activate missions that start on first zone entry
  if ((data.zoneId === 'R_SCHOOL' || data.zoneId === 'V_SCHOOL') &&
      !missions.isActive('melody') && !missions.isDone('melody')) {
    missions.activate('melody');
  }
  missions.dispatchEvent('zone:loaded', data);
});

bond.onLevelChange = (level) => {
  vision.setVoidOverlayIntensity(
    level === 'HEALTHY' ? 0 : bond.voidOverlayIntensity()
  );
};

// ── Async init ────────────────────────────────────────────────────────────────
async function init() {
  await document.fonts.load('10px VT323');
  const json = await assets.loadJSON('dialogues', 'assets/data/dialogues.json');
  dialogue.loadDialogues(json);
  save.setFlag('game_started', true);
  await scenes.load('R_HOME');
}

init().catch(console.error);

// ── Update system ─────────────────────────────────────────────────────────────
const worldUpdate = {
  update(dt) {
    const dialogueOpen = dialogue.isVisible();

    if (!dialogueOpen) {
      mateo.update(dt);
      luna.update(dt);
      echoes.update(dt);
    }

    bond.update(dt);
    rifts.update(dt);
    vision.update(dt);
    transition.update(dt);
    dialogue.update(dt);
    missions.update(dt);

    if (!dialogueOpen) {
      // Call Luna (Q key)
      if (input.wasPressed('call_luna')) events.emit('luna:called');

      if (world.loaded) {
        // Zone exit triggers
        scenes.checkExits(mateo);

        // Item pick-up triggers
        world.checkItemTriggers(mateo, save, events);

        // Auto-combine partitura pieces once all 4 are found
        if (!save.hasItem('I_partitura_completa') &&
            save.getFlag('partitura_1_found') && save.getFlag('partitura_2_found') &&
            save.getFlag('partitura_3_found') && save.getFlag('partitura_4_found')) {
          save.addItem('I_partitura_completa');
          events.emit('item:combined', { resultId: 'I_partitura_completa' });
        }

        // Interact (E key)
        if (input.wasPressed('interact') && !dimension.transitioning) {
          const nearRift = rifts.nearestUnsealedInRange(
            mateo.centerX(), mateo.centerY(), 48);

          if (nearRift) {
            // If zone has a linked dimension counterpart, do a zone+dim switch
            const linkedVoid = world.voidZoneId;
            const linkedReal = world.realZoneId;
            if (!dimension.isVoid() && linkedVoid) {
              scenes.switchDimension(linkedVoid, 'void', 'from_real');
            } else if (dimension.isVoid() && linkedReal) {
              scenes.switchDimension(linkedReal, 'real', 'from_void');
            } else {
              dimension.toggle();
            }
          } else if (!dialogue.isVisible()) {
            const npc = world.nearestNPC(mateo.centerX(), mateo.centerY(), 32);
            if (npc) dialogue.start(npc.dialogueId);
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
    echoes.render(ctx, alpha);
    luna.render(ctx, alpha);
    mateo.render(ctx, alpha);
    camera.restore(ctx);

    lighting.renderDarkness(ctx);
    vision.render(ctx, alpha);
    transition.render(ctx, alpha);

    dialogue.render(ctx);
    _renderHUD(ctx);
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
game.registerUpdateSystem(camera);
game.registerUpdateSystem(worldUpdate);
game.registerUpdateSystem(input);
game.registerRenderSystem(worldRender);

game.start();
